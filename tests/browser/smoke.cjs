// Browser-Test: startet einen kleinen Webserver, öffnet das Spiel in
// Tablet- und Handygröße (Querformat) sowie im Hochformat und spielt die
// wichtigsten Funktionen per Touch durch. Screenshots landen im Ordner aus
// SCREENSHOT_DIR (Standard: test-output/).
//
// Aufruf: node tests/browser/smoke.cjs

const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');

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
function check(condition, message) {
  if (condition) {
    console.log(`  ✔ ${message}`);
  } else {
    failures++;
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
const beltOuts = (page, x, y) => game(page, ([bx, by]) => window.__game.state.belts[`${bx},${by}`]?.outs ?? null, [x, y]);
const mode = (page) => game(page, () => window.__game.ui.mode);

async function waitForGame(page) {
  await page.waitForFunction(() => window.__game && window.__game.camera.viewWidth > 0);
  await sleep(150);
}

async function runDevice(browser, baseUrl, device, expectedVersion) {
  console.log(`\n${device.name} (${device.viewport.width}×${device.viewport.height})`);
  const context = await browser.newContext({
    viewport: device.viewport,
    deviceScaleFactor: device.deviceScaleFactor,
    hasTouch: true,
    isMobile: true,
  });
  const page = await context.newPage();
  const cdp = await context.newCDPSession(page);
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  const shot = (name) => page.screenshot({ path: path.join(OUT, `${device.name}-${name}.png`) });

  await page.goto(baseUrl);
  await waitForGame(page);

  // ---------- Start ----------
  check((await page.textContent('#hud-version')) === `v${expectedVersion}`, `Versionsnummer v${expectedVersion} sichtbar`);
  check(!(await page.isVisible('#rotate-overlay')), 'Kein Dreh-Hinweis im Querformat');
  const types = await game(page, () => window.__game.state.buildings.map((b) => b.type).sort());
  check(JSON.stringify(types) === '["holzfaeller","steinbruch"]', 'Start: Holzfällerlager und Steinbruch, kein Laden-Gebäude');
  check(await page.isVisible('#btn-shop'), 'Knopf „Laden“ sichtbar');
  check(await page.isVisible('#btn-build'), 'Knopf „Bauen“ sichtbar');

  const plot = await game(page, () => {
    const { state, TILE } = window.__game;
    const p = state.plot;
    return { x: p.x * TILE, y: p.y * TILE, w: p.width * TILE, h: p.height * TILE, px: p.x, py: p.y };
  });
  const tl = await worldPos(page, plot.x, plot.y);
  const br = await worldPos(page, plot.x + plot.w, plot.y + plot.h);
  const canvasBox = await page.locator('#game').boundingBox();
  check(
    tl.x >= canvasBox.x - 1 && tl.y >= canvasBox.y - 1 && br.x <= canvasBox.x + canvasBox.width + 1 && br.y <= canvasBox.y + canvasBox.height + 1,
    'Ganzes Grundstück beim Start sichtbar',
  );
  await shot('1-start');

  // ---------- Gebäude antippen, drehen ----------
  await tapTile(page, 10, 6);
  check((await page.textContent('#info-title')) === 'Holzfällerlager', 'Antippen zeigt Infofenster „Holzfällerlager“');
  check((await page.locator('#info-actions button').count()) === 3, 'Infofenster hat Verschieben, Drehen, Abreißen');
  await page.locator('#info-actions button', { hasText: 'Drehen' }).tap();
  await sleep(80);
  check((await game(page, () => window.__game.state.buildings[0].rot)) === 1, 'Drehen dreht das Gebäude');
  await shot('2-info');
  await page.tap('#info-close');
  check(!(await page.isVisible('#info-panel')), 'Schließen-Knopf schließt Infofenster');

  // ---------- Laden ----------
  await page.tap('#btn-shop');
  await sleep(80);
  const shopText = await page.textContent('#modal-content');
  check(shopText.includes('Dein Laden') && shopText.includes('Inventar'), 'Laden-Fenster zeigt Laden und Inventar');
  await shot('3-laden');
  await page.tap('#modal-close');
  check(!(await page.isVisible('#modal')), 'Laden-Fenster schließt');

  // ---------- Bauen: Sägewerk ----------
  await page.tap('#btn-build');
  await sleep(80);
  check(await page.isVisible('#build-bar'), 'Bauleiste öffnet sich');
  check(!(await page.isVisible('#bottom-bar')), 'Grundleiste ist währenddessen ausgeblendet');
  await shot('4-bauleiste');
  await page.tap('.build-item[data-tool="saegewerk"]');
  await sleep(80);
  check((await mode(page)) === 'place', 'Sägewerk wählen startet die Vorschau');
  check(await game(page, () => window.__game.ui.ghost?.valid === true), 'Vorschau steht auf freier Fläche (grün)');
  // Vorschau mit dem Finger nach rechts unten an eine bekannte Stelle schieben
  const ghost = await game(page, () => ({ ...window.__game.ui.ghost }));
  await touchDragTiles(page, cdp, [
    [ghost.x, ghost.y],
    [20, 12],
  ]);
  const moved = await game(page, () => ({ ...window.__game.ui.ghost }));
  check(moved.x === 20 && moved.y === 12, `Vorschau lässt sich verschieben (jetzt ${moved.x},${moved.y})`);
  await page.tap('#tool-rotate');
  check((await game(page, () => window.__game.ui.ghost.rot)) === 1, 'Vorschau lässt sich drehen');
  await page.tap('#tool-rotate');
  await page.tap('#tool-rotate');
  await page.tap('#tool-rotate');
  await shot('5-vorschau');
  await page.tap('#tool-confirm');
  await sleep(80);
  const saw = await game(page, () => window.__game.state.buildings.find((b) => b.type === 'saegewerk'));
  check(saw && saw.x === 20 && saw.y === 12, 'Sägewerk wurde gebaut');
  check((await mode(page)) === 'menu', 'Nach dem Bauen ist die Bauleiste wieder offen');

  // ---------- Förderbänder ----------
  await page.tap('.build-item[data-tool="belt"]');
  await sleep(80);
  check((await mode(page)) === 'belt', 'Förderband-Modus aktiv');
  await touchDragTiles(page, cdp, [
    [13, 6],
    [21, 6],
  ]);
  const line = [];
  for (let x = 13; x <= 21; x++) line.push(JSON.stringify(await beltOuts(page, x, 6)));
  check(line.every((o) => o === '["E"]'), 'Gerade Strecke nach rechts gelegt');

  await touchDragTiles(page, cdp, [
    [15, 6],
    [15, 9],
  ]);
  check(JSON.stringify(await beltOuts(page, 15, 6)) === '["E","S"]', 'Von einem Band aus ziehen teilt es auf');

  await touchDragTiles(page, cdp, [
    [18, 9],
    [18, 6],
  ]);
  check(JSON.stringify(await beltOuts(page, 18, 8)) === '["N"]', 'Zulauf von unten liegt');
  check(JSON.stringify(await beltOuts(page, 18, 6)) === '["E"]', 'Auf ein Band ziehen führt zusammen (Band bleibt gleich)');

  // Strecke in das Sägewerk (Eingang links bei 19,12)
  await touchDragTiles(page, cdp, [
    [15, 9],
    [15, 12],
    [21, 12],
  ]);
  check(JSON.stringify(await beltOuts(page, 19, 12)) === '["E"]', 'Strecke endet am Eingang des Sägewerks');
  check((await beltOuts(page, 20, 12)) === null, 'Kein Band im Sägewerk');

  await tapTile(page, 21, 6);
  check(JSON.stringify(await beltOuts(page, 21, 6)) === '["S"]', 'Antippen dreht ein Band');
  await shot('6-foerderbaender');

  // ---------- Abreißen ----------
  await page.tap('#tool-confirm'); // Fertig → Bauleiste
  await page.tap('.build-item[data-tool="erase"]');
  await sleep(80);
  check((await mode(page)) === 'erase', 'Abreiß-Modus aktiv');
  await touchDragTiles(page, cdp, [
    [20, 6],
    [21, 6],
  ]);
  check((await beltOuts(page, 20, 6)) === null && (await beltOuts(page, 21, 6)) === null, 'Wischen entfernt Bänder');
  await page.tap('#tool-confirm');
  await page.tap('#build-close');
  await sleep(80);
  check((await mode(page)) === 'normal' && (await page.isVisible('#bottom-bar')), 'Bauleiste schließt, Grundleiste wieder da');

  // ---------- Band antippen ----------
  await tapTile(page, 13, 6);
  check((await page.textContent('#info-title')) === 'Förderband', 'Antippen eines Bandes zeigt Infofenster');
  await tapTile(page, 16, 13);
  check(!(await page.isVisible('#info-panel')), 'Antippen freier Fläche schließt Infofenster');

  // ---------- Gesperrte Fläche ----------
  await tapTile(page, plot.px - 1, plot.py + 4);
  check((await page.textContent('#info-title')) === 'Gesperrte Fläche', 'Gesperrte Fläche zeigt Hinweis');
  await page.tap('#info-close');

  // ---------- Zoomen & Verschieben ----------
  const cx = canvasBox.x + canvasBox.width / 2;
  const cy = canvasBox.y + canvasBox.height / 2;
  const zoomBefore = await game(page, () => window.__game.camera.zoom);
  await cdp.send('Input.dispatchTouchEvent', {
    type: 'touchStart',
    touchPoints: [
      { x: cx - 40, y: cy, id: 1 },
      { x: cx + 40, y: cy, id: 2 },
    ],
  });
  for (let s = 1; s <= 8; s++) {
    await cdp.send('Input.dispatchTouchEvent', {
      type: 'touchMove',
      touchPoints: [
        { x: cx - 40 - s * 10, y: cy, id: 1 },
        { x: cx + 40 + s * 10, y: cy, id: 2 },
      ],
    });
  }
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await sleep(80);
  const zoomAfter = await game(page, () => window.__game.camera.zoom);
  check(zoomAfter > zoomBefore * 1.3, `Zwei-Finger-Zoom vergrößert (${zoomBefore.toFixed(2)} → ${zoomAfter.toFixed(2)})`);

  const camBefore = await game(page, () => window.__game.camera.x);
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: cx, y: cy, id: 3 }] });
  for (let s = 1; s <= 8; s++) {
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: cx - s * 15, y: cy, id: 3 }] });
  }
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await sleep(80);
  check((await game(page, () => window.__game.camera.x)) > camBefore, 'Ein-Finger-Ziehen verschiebt die Karte');
  const beltCountBefore = await game(page, () => Object.keys(window.__game.state.belts).length);
  await page.mouse.move(cx, cy);
  await page.mouse.wheel(0, 300);
  await sleep(80);
  check((await game(page, () => window.__game.camera.zoom)) < zoomAfter, 'Mausrad zoomt heraus');

  // ---------- Speichern & Laden ----------
  await game(page, () => window.__game.saveNow());
  await page.reload();
  await waitForGame(page);
  const after = await game(page, () => ({
    buildings: window.__game.state.buildings.length,
    belts: Object.keys(window.__game.state.belts).length,
    rot: window.__game.state.buildings.find((b) => b.type === 'holzfaeller').rot,
  }));
  check(after.buildings === 3 && after.belts === beltCountBefore && after.rot === 1, 'Nach dem Neuladen ist alles noch da');
  check((await page.textContent('#toast')).includes('Spielstand geladen'), 'Meldung „Spielstand geladen“');

  // ---------- Gebäude abreißen ----------
  await tapTile(page, 10, 12);
  await page.locator('#info-actions button', { hasText: 'Abreißen' }).tap();
  await sleep(80);
  check(await page.isVisible('#dialog'), 'Abreißen fragt nach');
  await shot('7-abreissen-frage');
  await page.tap('#dialog-ok');
  await sleep(80);
  check(!(await game(page, () => window.__game.state.buildings.some((b) => b.type === 'steinbruch'))), 'Steinbruch abgerissen');

  // ---------- Neues Spiel ----------
  await page.tap('#btn-menu');
  await page.tap('#menu-new-game');
  await sleep(80);
  check(await page.isVisible('#dialog'), '„Neues Spiel“ fragt nach');
  await Promise.all([page.waitForNavigation(), page.tap('#dialog-ok')]);
  await waitForGame(page);
  const fresh = await game(page, () => ({
    buildings: window.__game.state.buildings.length,
    belts: Object.keys(window.__game.state.belts).length,
  }));
  check(fresh.buildings === 2 && fresh.belts === 0, 'Neues Spiel startet frisch');

  check(errors.length === 0, `Keine Fehler in der Konsole${errors.length ? ': ' + errors.join(' | ') : ''}`);
  await context.close();
}

async function runPortrait(browser, baseUrl) {
  console.log('\nhandy-hoch (390×844)');
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 3,
    hasTouch: true,
    isMobile: true,
  });
  const page = await context.newPage();
  await page.goto(baseUrl);
  await page.waitForFunction(() => window.__game);
  check(await page.isVisible('#rotate-overlay'), 'Hochformat zeigt „Bitte drehen“');
  await page.screenshot({ path: path.join(OUT, 'handy-hoch.png') });
  await context.close();
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const versionSource = fs.readFileSync(path.join(ROOT, 'src', 'version.js'), 'utf8');
  const expectedVersion = versionSource.match(/VERSION = '([^']+)'/)[1];

  const server = await startServer();
  const baseUrl = `http://127.0.0.1:${server.address().port}/`;
  const browser = await chromium.launch();
  try {
    for (const device of DEVICES) await runDevice(browser, baseUrl, device, expectedVersion);
    await runPortrait(browser, baseUrl);
  } finally {
    await browser.close();
    server.close();
  }

  console.log(failures === 0 ? '\nAlle Browser-Prüfungen bestanden.' : `\n${failures} Prüfung(en) fehlgeschlagen.`);
  console.log(`Screenshots: ${OUT}`);
  process.exit(failures === 0 ? 0 : 1);
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
