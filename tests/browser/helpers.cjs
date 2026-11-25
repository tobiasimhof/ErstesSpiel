// Browser-Test: gemeinsame Hilfen für den 2D- und den 3D-Teil – kleiner
// Webserver, Geräte (Tablet und Handy im Querformat), Prüfen und Zählen der
// Fehler, Felder antippen und wischen, Infofenster auslesen.

const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..', '..');
const OUT = path.resolve(process.env.SCREENSHOT_DIR || path.join(ROOT, 'test-output'));

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webmanifest': 'application/manifest+json',
  '.json': 'application/json',
};

function startServer() {
  const server = http.createServer((req, res) => {
    const urlPath = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    let file = path.join(ROOT, urlPath);
    if (!file.startsWith(ROOT)) {
      res.writeHead(403).end();
      return;
    }
    if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
    fs.readFile(file, (err, data) => {
      if (err) {
        res.writeHead(404).end('not found');
        return;
      }
      res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream' });
      res.end(data);
    });
  });
  return new Promise((resolve) => server.listen(0, '127.0.0.1', () => resolve(server)));
}

const DEVICES = [
  { name: 'tablet-quer', viewport: { width: 1280, height: 800 }, deviceScaleFactor: 2 },
  { name: 'handy-quer', viewport: { width: 844, height: 390 }, deviceScaleFactor: 3 },
];

let failures = 0;
const failed = [];
let currentDevice = '';
// Name des Geräts für die Liste der fehlgeschlagenen Prüfungen
function setDevice(name) {
  currentDevice = name;
}
// Ergebnis am Ende: Zahl und Liste der fehlgeschlagenen Prüfungen
function summary() {
  return { failures, failed };
}
function check(condition, message) {
  if (condition) {
    console.log(`  ✔ ${message}`);
  } else {
    failures++;
    failed.push(`${currentDevice}: ${message}`);
    console.log(`  ✘ ${message}`);
  }
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Bildschirmposition (Seite) der Mitte eines Feldes am Boden (seit v0.54.0
// nur noch in 3D)
async function tilePos(page, tx, ty) {
  return page.evaluate(([x, y]) => window.__game.view3d.tile(x, y), [tx, ty]);
}

// v0.54.0: Liegen die Felder frei im Bild – nicht unter der Leiste oben, der
// Bauleiste, dem Infofenster oder außerhalb? (In 2D passte das Grundstück
// immer ganz ins Bild; in 3D zeigt die Kamera oft nur einen Ausschnitt.)
async function tilesFree(page, tiles) {
  return page.evaluate((list) => {
    const canvas = document.getElementById('game');
    return list.every(([x, y]) => {
      const p = window.__game.view3d.tile(x, y);
      return Number.isFinite(p.x) && Number.isFinite(p.y) && document.elementFromPoint(p.x, p.y) === canvas;
    });
  }, tiles);
}

// v0.54.0: Holt Felder in die Mitte des Bilds (Rechteck um sie herum, mit
// Platz für die Bauleiste unten und das Infofenster rechts).
async function showTiles(page, tiles, margin = 3) {
  await page.evaluate(
    ([list, m]) => {
      const xs = list.map((t) => t[0]);
      const ys = list.map((t) => t[1]);
      const x0 = Math.min(...xs) - m;
      const y0 = Math.min(...ys) - m;
      const rect = { x: x0, y: y0, width: Math.max(...xs) + 1 + m - x0, height: Math.max(...ys) + 1 + m - y0 };
      const bars = [...document.querySelectorAll('#bottom-bar, #build-bar, #tool-bar')]
        .filter((n) => n.offsetParent)
        .map((n) => n.getBoundingClientRect().top);
      const padBottom = bars.length ? Math.max(0, innerHeight - Math.min(...bars)) : 80;
      window.__game.camera.fitRect(rect, { padding: 48, padBottom });
    },
    [tiles, margin],
  );
  await sleep(60);
}

// Holt ein Feld ins Bild, falls es verdeckt oder draußen ist
async function centerOn(page, tx, ty, margin = 3) {
  await showTiles(page, [[tx, ty]], margin);
}

async function tapTile(page, tx, ty) {
  if (!(await tilesFree(page, [[tx, ty]]))) await centerOn(page, tx, ty);
  const p = await tilePos(page, tx, ty);
  await page.touchscreen.tap(p.x, p.y);
  await sleep(80);
}

// Echte Touch-Ereignisse über die Chrome-Schnittstelle: ein Finger zieht
// über die angegebenen Felder.
async function touchDragTiles(page, cdp, tiles) {
  if (!(await tilesFree(page, tiles))) await showTiles(page, tiles, 1);
  const points = [];
  for (const [x, y] of tiles) points.push(await tilePos(page, x, y));
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ ...points[0], id: 7 }] });
  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1];
    const b = points[i];
    for (let s = 1; s <= 6; s++) {
      const t = s / 6;
      await cdp.send('Input.dispatchTouchEvent', {
        type: 'touchMove',
        touchPoints: [{ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t, id: 7 }],
      });
    }
  }
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await sleep(80);
}

const game = (page, fn, arg) => page.evaluate(fn, arg);

// v0.18.0: Gebäude in der Bauleiste antippen – steht es in einem anderen
// Reiter, wird zuerst dieser Reiter geöffnet.
async function tapBuild(page, tool) {
  const item = page.locator(`.build-item[data-tool="${tool}"]`);
  if (!(await item.isVisible())) {
    const tab = await item.getAttribute('data-tab');
    if (tab) {
      await page.tap(`.build-tab[data-tab="${tab}"]`);
      await sleep(60);
    }
  }
  await item.tap();
}
// v0.19.0: Infofenster mit Warenbildern – Knöpfe über ihren Schlüssel, Text
// aus Statuszeile (unter dem Namen), Inhalt und Textzeilen zusammen.
const infoButton = (page, key) => page.locator(`#info-panel button[data-key="${key}"]`);
const recipeOption = (page, recipe) => page.locator(`#info-body .recipe-option[data-recipe="${recipe}"]`);
async function infoText(page) {
  const parts = await Promise.all(['#info-meta', '#info-body', '#info-status'].map((sel) => page.textContent(sel)));
  return parts.join(' | ');
}
// Was der grüne Kasten zeigt: Zutaten mit hat / braucht und das Ergebnis
const infoCard = (page) =>
  page.evaluate(() => {
    const card = document.querySelector('#info-body .info-card');
    if (!card) return null;
    return {
      caption: card.querySelector('.info-cap')?.textContent,
      inputs: [...card.querySelectorAll('.flow-item')].map((n) => `${n.dataset.item} ${n.querySelector('.flow-count').textContent}`),
      outputs: [...card.querySelectorAll('.flow-out')].map((n) => `${n.dataset.item} ${n.textContent}`),
      sub: card.querySelector('.info-sub')?.textContent ?? '',
      lack: [...card.querySelectorAll('.flow-item.lack')].map((n) => n.dataset.item),
    };
  });
// v0.20.0: Fächer des Lagerhauses und Kasten des Versandportals
const storeSlots = (page) =>
  page.evaluate(() => ({
    total: document.querySelector('#info-body .cap-count')?.textContent ?? '',
    slots: [...document.querySelectorAll('#info-body .store-slot')].map((n) =>
      n.classList.contains('empty') ? 'frei' : `${n.dataset.item} ${n.querySelector('.slot-count').textContent}${n.querySelector('.fill-bar.full') ? ' voll' : ''}`,
    ),
    sub: document.querySelector('#info-body .info-sub')?.textContent ?? '',
  }));
const shipCard = (page) =>
  page.evaluate(() => ({
    caption: document.querySelector('#info-body .info-card .info-cap')?.textContent ?? '',
    recent: [...document.querySelectorAll('#info-body .ship-flow .flow-item')].map((n) => n.dataset.item),
    store: document.querySelector('#info-body .ship-store .slot-count')?.textContent ?? '',
    bad: Boolean(document.querySelector('#info-body .ship-store .fill-bar.bad')),
    sub: document.querySelector('#info-body .info-sub:not(.warn)')?.textContent ?? '',
    warn: [...document.querySelectorAll('#info-body .info-sub.warn')].filter((n) => !n.hidden).map((n) => n.textContent).join(),
  }));
// Kein Knopf schneidet seinen Text ab, und nichts ragt aus dem Infofenster
// oder aus dem grünen Kasten (z. B. ein langer Warenname)
const infoFits = (page) =>
  page.evaluate(() => {
    const panel = document.getElementById('info-panel').getBoundingClientRect();
    const card = document.querySelector('#info-body .info-card')?.getBoundingClientRect();
    const bad = [...document.querySelectorAll('#info-panel button')]
      .filter((b) => !b.hidden && b.offsetParent && b.scrollWidth > b.clientWidth + 1)
      .map((b) => b.textContent || b.title);
    for (const node of document.querySelectorAll('#info-panel *')) {
      if (!node.offsetParent && node.tagName !== 'CANVAS') continue;
      const r = node.getBoundingClientRect();
      if (r.width === 0) continue;
      const inCard = card && node.closest('.info-card');
      const right = inCard ? card.right : panel.right;
      const left = inCard ? card.left : panel.left;
      const name = (node.textContent?.trim() || node.className).slice(0, 40);
      if (r.right > right + 0.5 || r.left < left - 0.5) bad.push(name);
      // Text, der über seinen eigenen Rahmen hinausläuft, zählt nicht zur Breite
      else if (node.tagName !== 'CANVAS' && node.clientWidth > 0 && node.scrollWidth > node.clientWidth + 1) bad.push(`abgeschnitten: ${name}`);
    }
    return bad;
  });
const beltOuts = (page, x, y) => game(page, ([bx, by]) => window.__game.state.belts[`${bx},${by}`]?.outs ?? null, [x, y]);
const mode = (page) => game(page, () => window.__game.ui.mode);

// v0.51.0: Schriftrolle lesen (wartet, bis sie aufgerollt ist), mit „✓ Gelesen“
// schließen und ihren Text zurückgeben. Kommt danach noch ein Brief, bleibt sie offen.
async function readLetter(page) {
  await page.waitForFunction(() => document.getElementById('letter')?.classList.contains('open'), null, { timeout: 5000 });
  await sleep(600); // aufrollen
  const n = await page.evaluate(() => document.getElementById('letter').dataset.n);
  const text = await page.textContent('#letter');
  await page.tap('#letter-ok');
  await page.waitForFunction(
    (before) => {
      const letter = document.getElementById('letter');
      return letter.hidden || (letter.dataset.n !== before && letter.classList.contains('open'));
    },
    n,
    { timeout: 5000 },
  );
  return text;
}

// v0.52.0: Hildes Einführung (neues Spiel) gleich beenden – Begrüßungsbrief
// „▶ Los geht’s“, dann „Beenden“ und die Rückfrage bestätigen. Ohne
// Einführung passiert nichts.
async function skipTutorial(page) {
  if (!(await game(page, () => window.__game.tutorial()))) return;
  if ((await game(page, () => window.__game.tutorial().step)) === 0) await readLetter(page);
  await page.waitForSelector('#hilde:not([hidden])', { timeout: 5000 });
  await page.tap('#hilde-end');
  await page.waitForSelector('#dialog:not([hidden])', { timeout: 5000 });
  await page.tap('#dialog-ok');
  await page.waitForFunction(() => window.__game.tutorial() === null, null, { timeout: 5000 });
  await sleep(100);
}

// v0.50.0: Wartet, bis das Spiel läuft und der Ladebildschirm weg ist. Fragt
// er nach dem Namen (erster Start, neues Spiel), trägt es name ein.
// v0.52.0: Beginnt Hildes Einführung (neues Spiel), wird sie beendet – außer
// mit tutorial: 'keep'.
async function waitForGame(page, { timeout = 30000, name = 'Tester', tutorial = 'end' } = {}) {
  await page.waitForFunction(() => window.__game && window.__game.camera.viewWidth > 0, null, { timeout });
  await page.waitForFunction(() => document.getElementById('loading').hidden || !document.getElementById('loading-name').hidden, null, { timeout });
  if (await page.isVisible('#loading-name')) {
    await page.fill('#name-input', name);
    await page.tap('#name-ok');
  }
  await page.waitForFunction(() => document.getElementById('loading').hidden, null, { timeout });
  await sleep(150);
  if (tutorial === 'end') await skipTutorial(page);
}

module.exports = {
  fs,
  path,
  ROOT,
  OUT,
  startServer,
  DEVICES,
  check,
  sleep,
  tilePos,
  tilesFree,
  showTiles,
  centerOn,
  tapTile,
  touchDragTiles,
  game,
  tapBuild,
  infoButton,
  recipeOption,
  infoText,
  infoCard,
  storeSlots,
  shipCard,
  infoFits,
  beltOuts,
  mode,
  waitForGame,
  skipTutorial,
  readLetter,
  setDevice,
  summary,
};
