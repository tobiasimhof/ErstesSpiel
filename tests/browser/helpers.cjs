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

// Bildschirmposition (Seite) der Mitte eines Feldes
async function tilePos(page, tx, ty) {
  return page.evaluate(
    ([x, y]) => {
      const { camera, TILE } = window.__game;
      const rect = document.getElementById('game').getBoundingClientRect();
      return {
        x: rect.left + ((x + 0.5) * TILE - camera.x) * camera.zoom,
        y: rect.top + ((y + 0.5) * TILE - camera.y) * camera.zoom,
      };
    },
    [tx, ty],
  );
}

async function worldPos(page, wx, wy) {
  return page.evaluate(
    ([x, y]) => {
      const { camera } = window.__game;
      const rect = document.getElementById('game').getBoundingClientRect();
      return { x: rect.left + (x - camera.x) * camera.zoom, y: rect.top + (y - camera.y) * camera.zoom };
    },
    [wx, wy],
  );
}

async function tapTile(page, tx, ty) {
  const p = await tilePos(page, tx, ty);
  await page.touchscreen.tap(p.x, p.y);
  await sleep(80);
}

// Echte Touch-Ereignisse über die Chrome-Schnittstelle: ein Finger zieht
// über die angegebenen Felder.
async function touchDragTiles(page, cdp, tiles) {
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

async function waitForGame(page) {
  await page.waitForFunction(() => window.__game && window.__game.camera.viewWidth > 0);
  await sleep(150);
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
  worldPos,
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
  setDevice,
  summary,
};
