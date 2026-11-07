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
const failed = [];
let currentDevice = '';
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
const beltOuts = (page, x, y) => game(page, ([bx, by]) => window.__game.state.belts[`${bx},${by}`]?.outs ?? null, [x, y]);
const mode = (page) => game(page, () => window.__game.ui.mode);

async function waitForGame(page) {
  await page.waitForFunction(() => window.__game && window.__game.camera.viewWidth > 0);
  await sleep(150);
}

async function runDevice(browser, baseUrl, device, expectedVersion) {
  console.log(`\n${device.name} (${device.viewport.width}×${device.viewport.height})`);
  currentDevice = device.name;
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
  check(!(await page.isVisible('#boot-error')), 'Keine Meldung „Spiel konnte nicht starten“');
  const versioned = await page.evaluate(() =>
    performance
      .getEntriesByType('resource')
      .filter((e) => e.name.includes('/src/') && e.name.endsWith('.js') === false && e.name.includes('.js'))
      .every((e) => e.name.includes(`?v=${window.__game.VERSION}`)),
  );
  const unversioned = await page.evaluate(() =>
    performance
      .getEntriesByType('resource')
      .map((e) => e.name)
      .filter((n) => n.includes('/src/') && /\.js$/.test(n)),
  );
  check(versioned && unversioned.length === 0, `Alle Programmdateien werden mit Versionsnummer geladen${unversioned.length ? ': ohne ' + unversioned.join(', ') : ''}`);
  const types = await game(page, () => window.__game.state.buildings.map((b) => b.type).sort());
  check(JSON.stringify(types) === '["holzfaeller","versandportal"]', 'Start nur mit Holz: Holzfällerlager und Versandportal');
  check((await page.textContent('#btn-level')).includes('Laden-Level 1'), 'Oben steht „Laden-Level 1“');
  check(!(await page.isVisible('#hud-level-ready')), 'Noch kein Aufstieg möglich (kein ⬆)');
  check((await page.textContent('#hud-gold')) === '500', 'Start mit 500 Gold Startkapital');
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
  const actionTexts = await page.locator('#info-actions button').allTextContents();
  check(
    ['Holzstamm einlegen', 'Verschieben', 'Drehen', 'Abreißen'].every((t) => actionTexts.some((a) => a.includes(t))),
    'Infofenster hat Einlegen, Verschieben, Drehen, Abreißen',
  );
  check((await page.textContent('#info-status')).includes('Holzstämme im Laden-Lager: 1'), 'Infofenster zeigt Vorrat im Laden-Lager');
  check(await page.locator('#info-actions button', { hasText: 'Holzstamm kaufen' }).isDisabled(), 'Mit 500 Gold reicht es noch nicht für einen Holzstamm (550)');
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
  check(shopText.includes('Dein Laden') && shopText.includes('Holzstamm') && shopText.includes('Holzblock'), 'Laden-Fenster zeigt Laden-Lager mit Startvorrat');
  check((await page.locator('#modal-content .tab').count()) === 3, 'Laden-Fenster hat drei Reiter');
  await shot('3-laden');
  await page.tap('#modal-content .tab[data-tab="haendler"]');
  await sleep(80);
  const rockRow = page.locator('#modal-content .trade-row', { hasText: 'Felsbrocken' });
  check((await rockRow.textContent()).includes('ab Level 2') && (await rockRow.locator('button').isDisabled()), 'Händler: Felsbrocken gesperrt bis Level 2');
  await shot('3-haendler-gesperrt');
  await page.tap('#modal-close');
  check(!(await page.isVisible('#modal')), 'Laden-Fenster schließt');

  // ---------- Testpaket ----------
  // Ohne Waren lässt sich nichts bauen. Das Testpaket gibt es nur im Testmodus.
  check(!(await page.isVisible('#menu-test-pack')), 'Testpaket ist ohne Testmodus versteckt');
  await page.tap('#btn-menu');
  await page.tap('#menu-test-mode');
  await page.tap('#btn-menu');
  check(await page.isVisible('#menu-test-pack'), 'Testpaket im Testmodus sichtbar');
  await page.tap('#menu-test-pack');
  await sleep(80);
  const pack = await game(page, () => ({ gold: window.__game.state.gold, blocks: window.__game.state.storage.holzblock }));
  check(pack.gold >= 1000 && pack.blocks >= 70, `Testpaket gibt Gold und Waren (${pack.gold} Gold, ${pack.blocks} Holzblöcke)`);
  await page.tap('#btn-menu');
  await page.tap('#menu-test-mode');
  check(!(await page.isVisible('#hud-speed')), 'Testmodus wieder aus');

  // ---------- Bauen: Sägewerk ----------
  await page.tap('#btn-build');
  await sleep(80);
  check(await page.isVisible('#build-bar'), 'Bauleiste öffnet sich');
  check(!(await page.isVisible('#bottom-bar')), 'Grundleiste ist währenddessen ausgeblendet');

  // v0.10.2: Die Warenbilder der Baukosten sind gezeichnet – auch nachdem der
  // Browser sie weggeworfen hat (Tobias: nach dem Minimieren nur noch Zahlen).
  const costIcons = () =>
    page.evaluate(() => {
      const icons = [...document.querySelectorAll('#build-items .cost-part canvas.item-icon')];
      const painted = icons.filter((c) => {
        const data = c.getContext('2d').getImageData(0, 0, c.width, c.height).data;
        for (let i = 3; i < data.length; i += 4) if (data[i] > 0) return true;
        return false;
      });
      return { total: icons.length, painted: painted.length };
    });
  const wipeIcons = () =>
    page.evaluate(() => {
      for (const c of document.querySelectorAll('canvas.item-icon')) c.width = c.width; // leert die Zeichnung
    });
  let icons = await costIcons();
  check(icons.total >= 8 && icons.painted === icons.total, `Bauleiste zeigt die Warenbilder der Baukosten (${icons.painted}/${icons.total})`);
  await wipeIcons();
  check((await costIcons()).painted === 0, 'Warenbilder absichtlich gelöscht (wie beim Minimieren)');
  await page.tap('#build-close');
  await sleep(80);
  await page.tap('#btn-build');
  await sleep(80);
  icons = await costIcons();
  check(icons.painted === icons.total, `Bauleiste neu geöffnet: Warenbilder wieder da (${icons.painted}/${icons.total})`);
  await wipeIcons();
  await page.evaluate(() => document.dispatchEvent(new Event('visibilitychange')));
  icons = await costIcons();
  check(icons.painted === icons.total, `Zurück ins Spiel: Warenbilder wieder da (${icons.painted}/${icons.total})`);
  const barOrder = await page.locator('#build-items .build-item').evaluateAll((items) => items.map((b) => b.dataset.tool));
  check(
    JSON.stringify(barOrder.slice(0, 7)) === '["holzfaeller","saegewerk","lagerhaus","versandportal","belt","area","erase"]',
    `Bauleiste: erst Holz-Gebäude und Werkzeuge, dann gesperrte (${barOrder.join(', ')})`,
  );
  const quarryItem = page.locator('.build-item[data-tool="steinbruch"]');
  check(
    (await quarryItem.evaluate((b) => b.classList.contains('locked'))) && (await quarryItem.textContent()).includes('Level 2'),
    'Steinbruch in der Bauleiste gesperrt (🔒 Level 2)',
  );
  await shot('4-bauleiste');
  await quarryItem.tap();
  await sleep(80);
  check((await mode(page)) === 'menu' && (await page.textContent('#toast')).includes('ab Level 2'), 'Gesperrtes Gebäude antippen sagt, ab welchem Level');
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
  const blocksAfterSaw = await game(page, () => window.__game.state.storage.holzblock);
  check(blocksAfterSaw === pack.blocks - 40, `Sägewerk kostet 40 Holzblöcke (${pack.blocks} → ${blocksAfterSaw})`);
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
  check((await game(page, () => window.__game.state.storage.holzblock)) === blocksAfterSaw - 9, '9 Felder Förderband kosten 9 Holzblöcke');

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

  // ---------- Fläche kaufen ----------
  // Karte etwas nach unten schieben, damit auch die Ecke über dem Grundstück zu sehen ist
  await game(page, () => {
    window.__game.camera.y -= 2 * window.__game.TILE;
  });
  await tapTile(page, plot.px - 1, plot.py - 1);
  check((await page.textContent('#info-title')) === 'Gesperrte Fläche', 'Ecke der gesperrten Fläche zeigt Hinweis');
  await tapTile(page, plot.px - 1, plot.py + 4);
  check((await page.textContent('#info-title')) === 'Fläche kaufen', 'Gesperrte Fläche links antippen bietet Fläche an');
  check((await page.textContent('#info-meta')).includes('4 Spalten links · 56 Felder'), 'Angebot: 4 Spalten links, 56 Felder (schon auf Level 1)');
  check((await page.textContent('#info-text')).includes('noch 2×'), 'Infofenster: an dieser Seite noch 2 Käufe');
  const landButton = page.locator('#info-actions button', { hasText: 'Kaufen' });
  check((await landButton.textContent()).includes('500'), 'Streifen kostet 500 Gold');
  await shot('6b-flaeche-angebot');
  const goldBeforeLand = await game(page, () => window.__game.state.gold);
  await landButton.tap();
  await sleep(120);
  const land = await game(page, () => ({ plot: { ...window.__game.state.plot }, gold: window.__game.state.gold }));
  check(land.plot.x === plot.px - 4 && land.plot.width === 26 && land.gold === goldBeforeLand - 500, `Fläche gekauft (Grundstück ${land.plot.width} × ${land.plot.height}, Gold ${goldBeforeLand} → ${land.gold})`);
  check(!(await page.isVisible('#info-panel')), 'Nach dem Kauf schließt das Fenster');
  await shot('6c-flaeche-gekauft');

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
    plotWidth: window.__game.state.plot.width,
  }));
  check(after.buildings === 3 && after.belts === beltCountBefore && after.rot === 1 && after.plotWidth === 26, 'Nach dem Neuladen ist alles noch da (auch die gekaufte Fläche)');
  check((await page.textContent('#toast')).includes('Spielstand geladen'), 'Meldung „Spielstand geladen“');

  // ---------- Gebäude abreißen ----------
  await tapTile(page, 14, 9);
  await page.locator('#info-actions button', { hasText: 'Abreißen' }).tap();
  await sleep(80);
  check(await page.isVisible('#dialog'), 'Abreißen fragt nach');
  check((await page.textContent('#dialog-text')).includes('nichts gekostet'), 'Startgebäude: keine Baukosten zurück (Hinweis)');
  await shot('7-abreissen-frage');
  await page.tap('#dialog-ok');
  await sleep(80);
  check(!(await game(page, () => window.__game.state.buildings.some((b) => b.type === 'versandportal'))), 'Versandportal abgerissen');

  // ---------- Bereich markieren, verschieben, drehen, abreißen (v0.11.0) ----------
  // Sägewerk (20,12) mit seiner Zuleitung (15,11)–(19,12) als Gruppe umsetzen
  const area = () =>
    game(page, () => {
      const a = window.__game.ui.area;
      const g = a?.ghost;
      return a
        ? {
            buildings: a.sel.buildings.length,
            belts: a.sel.belts.length,
            ghost: g ? { x: g.x, y: g.y, turns: g.turns, valid: g.plan?.valid, w: g.plan?.width, h: g.plan?.height } : null,
          }
        : null;
    });
  const sawNow = () => game(page, () => ({ ...window.__game.state.buildings.find((b) => b.type === 'saegewerk') }));
  const beltTotal = () => game(page, () => Object.keys(window.__game.state.belts).length);
  const sawBefore = await sawNow();
  const beltsBefore = await beltTotal();
  await page.tap('#btn-build');
  await sleep(80);
  await page.tap('.build-item[data-tool="area"]');
  await sleep(80);
  check((await mode(page)) === 'area', 'Werkzeug „Verschieben“: Bereich markieren');
  check(await page.locator('#tool-area-move').isDisabled(), 'Verschieben erst, wenn etwas markiert ist');
  await touchDragTiles(page, cdp, [
    [15, 11],
    [21, 13],
  ]);
  let marked = await area();
  check(marked.buildings === 1 && marked.belts === 6, `Rechteck ziehen markiert Sägewerk und Zuleitung (${marked.buildings} Gebäude, ${marked.belts} Bänder)`);
  check((await page.textContent('#tool-text')).includes('1 Gebäude und 6 Bänder'), 'Unten steht, was markiert ist');
  await shot('18-bereich-markiert');
  await page.tap('#tool-area-move');
  await sleep(80);
  marked = await area();
  check((await mode(page)) === 'areaMove' && marked.ghost.valid && marked.ghost.w === 7 && marked.ghost.h === 3, 'Verschieben: Vorschau 7 × 3 an der alten Stelle');
  await page.keyboard.press('r');
  await sleep(60);
  marked = await area();
  check(marked.ghost.turns === 1 && marked.ghost.w === 3 && marked.ghost.h === 7, 'Taste R dreht die ganze Gruppe (jetzt 3 × 7)');
  await touchDragTiles(page, cdp, [
    [marked.ghost.x + 1, marked.ghost.y + 3],
    [24, 14],
  ]);
  marked = await area();
  check(marked.ghost.x === 23 && marked.ghost.y === 11 && marked.ghost.valid, `Gruppe mit dem Finger verschoben (${marked.ghost.x},${marked.ghost.y}, grün)`);
  await shot('19-bereich-verschieben');
  await page.tap('#tool-confirm');
  await sleep(80);
  const sawMoved = await sawNow();
  check(
    sawMoved.x === 23 && sawMoved.y === 16 && sawMoved.rot === (sawBefore.rot + 1) % 4 && sawMoved.id === sawBefore.id,
    `Sägewerk gedreht und umgesetzt (${sawBefore.x},${sawBefore.y} → ${sawMoved.x},${sawMoved.y})`,
  );
  check((await beltTotal()) === beltsBefore, 'Alle Bänder sind mitgekommen');
  check(
    (await game(page, () => window.__game.state.belts['24,15']?.outs.join(''))) === 'S',
    'Zuleitung zeigt nach dem Drehen nach unten in den Eingang des Sägewerks',
  );
  check((await mode(page)) === 'area' && (await area()).buildings === 1, 'Danach bleibt die Gruppe markiert');
  // Bereich abreißen
  const blocksBeforeErase = await game(page, () => window.__game.state.storage.holzblock ?? 0);
  await page.tap('#tool-area-erase');
  await sleep(80);
  check(
    (await page.isVisible('#dialog')) && (await page.textContent('#dialog-text')).includes('1 Gebäude und 6 Bänder'),
    'Bereich abreißen fragt nach',
  );
  await page.tap('#dialog-ok');
  await sleep(80);
  const blocksAfterErase = await game(page, () => window.__game.state.storage.holzblock ?? 0);
  check(
    !(await game(page, () => window.__game.state.buildings.some((b) => b.type === 'saegewerk'))) && (await beltTotal()) === beltsBefore - 6,
    'Bereich abgerissen: Sägewerk und 6 Bänder weg',
  );
  check(blocksAfterErase - blocksBeforeErase >= 46, `Baukosten zurück ins Laden-Lager (+${blocksAfterErase - blocksBeforeErase} Holzblöcke)`);
  check(await page.locator('#tool-area-move').isDisabled(), 'Danach ist nichts mehr markiert');
  await page.tap('#tool-confirm');
  await page.tap('#build-close');
  await sleep(80);
  // Taste R dreht auch ein ausgewähltes Gebäude
  const rotBefore = await game(page, () => window.__game.state.buildings.find((b) => b.type === 'holzfaeller').rot);
  await tapTile(page, 10, 6);
  await page.keyboard.press('R');
  await sleep(60);
  const rotAfter = await game(page, () => window.__game.state.buildings.find((b) => b.type === 'holzfaeller').rot);
  check(rotAfter === (rotBefore + 1) % 4, `Taste R dreht das ausgewählte Gebäude (${rotBefore} → ${rotAfter})`);
  await page.tap('#info-close');

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

  // ---------- Einstieg mit Startkapital ----------
  await page.tap('#btn-build');
  await sleep(80);
  check(
    await page.locator('.build-item[data-tool="saegewerk"]').evaluate((b) => b.classList.contains('short')),
    'Sägewerk ausgegraut (zu wenig Holzblöcke)',
  );
  await page.tap('.build-item[data-tool="saegewerk"]');
  await sleep(80);
  check((await mode(page)) === 'menu' && (await page.textContent('#toast')).includes('fehlen'), 'Sägewerk antippen sagt, was fehlt');
  await shot('8-bauleiste-kosten');
  // Holzfäller (10,6) gibt rechts bei (12,6) aus → (13,6) → hinunter bis (13,9) → Versandportal (14,9)
  await page.tap('.build-item[data-tool="belt"]');
  await touchDragTiles(page, cdp, [
    [12, 6],
    [13, 6],
    [13, 9],
    [14, 9],
  ]);
  await page.tap('#tool-confirm');
  await page.tap('#build-close');
  await sleep(80);
  check(JSON.stringify(await beltOuts(page, 13, 9)) === '["E"]', 'Band führt ins Start-Versandportal');
  check((await game(page, () => window.__game.state.storage.holzblock)) === 15, '5 Felder Band kosten 5 der 20 Start-Holzblöcke');

  await tapTile(page, 10, 6);
  await page.locator('#info-actions button', { hasText: 'Holzstamm einlegen' }).tap();
  await sleep(80);
  const afterLoad = await game(page, () => ({
    logs: window.__game.state.storage.holzstamm ?? 0,
    loaded: window.__game.state.buildings.find((b) => b.type === 'holzfaeller').prod.loaded,
  }));
  check(afterLoad.loaded && afterLoad.logs === 0, 'Gratis-Holzstamm eingelegt');
  check(
    await page.locator('#info-actions button', { hasText: 'wird verarbeitet' }).isDisabled(),
    'Zweiter Holzstamm lässt sich nicht einlegen',
  );
  await page.tap('#info-close');

  await game(page, () => window.__game.simulate(14));
  await sleep(120);
  const onBelt = await game(page, () => Object.values(window.__game.state.belts).filter((b) => b.item).length);
  check(onBelt >= 1, `Waren laufen über das Band (${onBelt} unterwegs)`);
  await shot('8-produktion');

  await game(page, () => window.__game.simulate(90));
  const blocks = await game(page, () => window.__game.state.storage.holzblock ?? 0);
  check(blocks >= 30, `Holzblöcke kommen im Laden-Lager an (${blocks})`);

  // ---------- Theken & Kunden ----------
  await page.tap('#btn-shop');
  await sleep(80);
  await page.tap('#modal-content .tab[data-tab="theken"]');
  await sleep(80);
  check((await page.textContent('#modal-content')).includes('Theke 1'), 'Reiter „Theken“ zeigt die Theken');
  await page.locator('#modal-content button', { hasText: 'Ware wählen' }).first().tap();
  await sleep(80);
  await page.locator('#modal-content .pick-row', { hasText: 'Holzblock' }).tap();
  await sleep(80);
  // v0.10.0: Danach wählt man die Menge (vorgeschlagen: so viele wie passen)
  check((await page.textContent('#modal-content .amount-number')) === '20', 'Mengenwahl schlägt 20 vor (Theke voll)');
  await page.locator('#modal-content .amount-stepper button', { hasText: '−5' }).tap();
  await page.locator('#modal-content .amount-stepper button', { hasText: '−5' }).tap();
  await page.locator('#modal-content .amount-stepper button', { hasText: '−1' }).tap();
  await page.locator('#modal-content .amount-stepper button', { hasText: '−1' }).tap();
  check((await page.textContent('#modal-content .amount-number')) === '8', 'Menge auf 8 gestellt');
  await shot('9a-menge');
  const blocksBefore = await game(page, () => window.__game.state.storage.holzblock ?? 0);
  // Kunden kaufen in Echtzeit weiter: Was sie seitdem von der Theke gekauft
  // haben, zählt mit (sonst schwankt die Prüfung, wenn genau jetzt jemand kauft).
  const saleIdBefore = await game(page, () => window.__game.state.market.nextSaleId);
  await page.locator('#modal-content button', { hasText: 'Auf die Theke' }).tap();
  await sleep(80);
  const counter8 = await game(
    page,
    (since) => {
      const s = window.__game.state;
      const sold = s.market.sales.filter((sale) => sale.id >= since).reduce((n, sale) => n + (sale.items.holzblock ?? 0), 0);
      return { ...s.counters[0], sold, store: s.storage.holzblock ?? 0 };
    },
    saleIdBefore,
  );
  check(
    counter8.type === 'holzblock' && counter8.count + counter8.sold === 8 && counter8.store >= blocksBefore - 8,
    `Theke 1 mit genau 8 Holzblöcken bestückt (${JSON.stringify(counter8)})`,
  );
  // Über „Menge“ lässt sich die Anzahl später ändern
  await page.locator('#modal-content .counter-buttons button', { hasText: 'Menge' }).first().tap();
  await sleep(80);
  const counterNow = await game(page, () => window.__game.state.counters[0].count);
  check((await page.textContent('#modal-content .amount-number')) === String(counterNow), `Menge öffnet mit der aktuellen Anzahl (${counterNow})`);
  await page.locator('#modal-content .amount-stepper button', { hasText: 'Alle' }).tap();
  await page.locator('#modal-content button', { hasText: 'Auf die Theke' }).tap();
  await sleep(80);
  const counter = await game(page, () => window.__game.state.counters[0]);
  check(counter.type === 'holzblock' && counter.count === 20, `„Alle“ füllt Theke 1 auf 20 Holzblöcke (${JSON.stringify(counter)})`);
  await shot('9-theken');
  await game(page, () => window.__game.simulate(90));
  await sleep(500);
  const sold = await game(page, () => ({ gold: window.__game.state.gold, sales: window.__game.state.market.sales.length }));
  check(sold.gold > 500 && sold.sales > 0, `Kunden kaufen und zahlen (${sold.gold} Gold, ${sold.sales} Verkäufe)`);
  // Kunden kaufen live weiter; die Leiste zieht spätestens nach 0,4 s nach.
  const hudSynced = await page
    .waitForFunction(() => document.getElementById('hud-gold').textContent === new Intl.NumberFormat('de-DE').format(window.__game.state.gold), null, { timeout: 3000 })
    .then(() => true, () => false);
  check(hudSynced, 'Gold oben aktualisiert sich');
  check((await page.textContent('#modal-content')).includes('kaufte'), 'Letzte Verkäufe werden angezeigt');
  await page.locator('#modal-content .counter-buttons button', { hasText: 'Auffüllen' }).first().tap();
  await sleep(80);
  check((await game(page, () => window.__game.state.counters[0].count)) === 20, 'Auffüllen füllt die Theke wieder auf 20');
  await shot('10-verkauf');

  await page.tap('#modal-close');

  // ---------- Laden-Level ----------
  // Das Zählen hergestellter Waren prüfen die automatischen Tests; hier wird
  // das Ziel direkt gesetzt und der Aufstieg per Touch durchgespielt.
  await game(page, () => Object.assign(window.__game.state.produced, { holzplatte: 1, holzstab: 1 }));
  const readyShown = await page
    .waitForFunction(() => !document.getElementById('hud-level-ready').hidden, null, { timeout: 3000 })
    .then(() => true, () => false);
  check(readyShown, 'Ziel erreicht: oben erscheint ⬆');
  await shot('10b-level-bereit');
  await page.tap('#btn-level');
  await sleep(120);
  const levelText = await page.textContent('#modal-content');
  check(levelText.includes('Laden-Level 1') && levelText.includes('Nächstes Ziel: Level 2 · Stein'), 'Level-Fenster zeigt Level 1 und das nächste Ziel');
  check((await page.locator('#modal-content .goal-row.done').count()) === 2, 'Beide Ziele abgehakt');
  await shot('10c-level-fenster');
  await page.locator('#modal-content button', { hasText: 'Aufsteigen auf Level 2' }).tap();
  await sleep(150);
  const lvl2 = await game(page, () => ({ level: window.__game.state.shopLevel, rocks: window.__game.state.storage.felsbrocken ?? 0 }));
  check(lvl2.level === 2 && lvl2.rocks === 1, `Aufgestiegen auf Level 2, Gratis-Felsbrocken im Lager (${JSON.stringify(lvl2)})`);
  check((await page.textContent('#modal-content')).includes('Level 2 erreicht'), 'Level-Fenster gratuliert');
  check((await page.textContent('#hud-level')) === '2', 'Oben steht Level 2');
  const upButton3 = page.locator('#modal-content button', { hasText: 'Aufsteigen auf Level 3' });
  check(await upButton3.isDisabled(), 'Level 3 noch gesperrt (Ziel nicht erreicht)');
  await shot('10d-level-2');
  await game(page, () => Object.assign(window.__game.state.produced, { steinplatte: 1, steinzahnrad: 1 }));
  const enabled3 = await page
    .waitForFunction(() => [...document.querySelectorAll('#modal-content button')].some((b) => b.textContent.includes('Level 3') && !b.disabled), null, { timeout: 3000 })
    .then(() => true, () => false);
  check(enabled3, 'Level-Fenster aktualisiert sich: Aufstieg auf Level 3 möglich');
  await upButton3.tap();
  await sleep(150);
  const lvl3 = await game(page, () => ({ level: window.__game.state.shopLevel, ore: window.__game.state.storage.eisenerz ?? 0 }));
  check(lvl3.level === 3 && lvl3.ore === 1, `Aufgestiegen auf Level 3, Gratis-Eisenerz im Lager (${JSON.stringify(lvl3)})`);
  check((await page.textContent('#modal-content')).includes('Nächstes Ziel: Level 4 · Zimmerei'), 'Nach Level 3 kommt Level 4 (Zimmerei)');
  const next4 = await page.textContent('#modal-content');
  check(
    next4.includes('Theke 3') && next4.includes('mittlere Theken (25 Plätze)') && next4.includes('Laden-Lager 1.000 Plätze'),
    'Level 4 kündigt dritte Theke, mittlere Theken und 1.000 Lagerplätze an',
  );
  await shot('10e-level-3');
  await page.tap('#modal-close');

  // ---------- Händler ----------
  // Für den Rest des Tests genau die nötigen Waren und Gold geben (das
  // Testpaket mehrfach würde das Laden-Lager füllen).
  await game(page, () => {
    const s = window.__game.state.storage;
    window.__game.state.gold += 3000;
    s.holzblock = (s.holzblock ?? 0) + 45;
    s.holzplatte = (s.holzplatte ?? 0) + 10;
    s.steinplatte = (s.steinplatte ?? 0) + 30;
    s.eisenbarren = (s.eisenbarren ?? 0) + 30;
  });
  await page.tap('#btn-shop');
  await sleep(80);
  await page.tap('#modal-content .tab[data-tab="haendler"]');
  await sleep(80);
  const goldBeforeBuy = await game(page, () => window.__game.state.gold);
  await page.locator('#modal-content .trade-row', { hasText: 'Eisenerz' }).locator('button').tap();
  await sleep(80);
  const bought = await game(page, () => ({ gold: window.__game.state.gold, ore: window.__game.state.storage.eisenerz ?? 0 }));
  // Kunden kaufen währenddessen weiter (Holzblöcke à 3 Gold) – das Gold darf
  // deshalb etwas über „vorher − 2.200“ liegen.
  const paid = goldBeforeBuy - bought.gold;
  check(bought.ore === 2 && paid <= 2200 && paid > 2200 - 60, `Händler: Eisenerz für 2.200 Gold gekauft (${goldBeforeBuy} → ${bought.gold}, jetzt ${bought.ore} Eisenerz)`);
  await shot('11-haendler');
  await page.tap('#modal-close');

  // Sägewerk zum Umstellen des Rezepts
  await page.tap('#btn-build');
  await page.tap('.build-item[data-tool="saegewerk"]');
  await sleep(80);
  const sawGhost = await game(page, () => ({ ...window.__game.ui.ghost }));
  await touchDragTiles(page, cdp, [
    [sawGhost.x, sawGhost.y],
    [14, 10],
  ]);
  await page.tap('#tool-confirm');
  await page.tap('#build-close');
  await sleep(80);
  const placed = await game(page, () => window.__game.state.buildings.map((b) => `${b.type}@${b.x},${b.y}`).sort());
  check(placed.includes('saegewerk@14,10'), `Sägewerk gebaut (${placed.join(' ')})`);

  await tapTile(page, 14, 10);
  check((await page.textContent('#info-title')) === 'Sägewerk', 'Sägewerk antippen zeigt Infofenster');
  await page.locator('#info-actions button', { hasText: 'Stäbe' }).tap();
  await sleep(450);
  check((await game(page, () => window.__game.state.buildings.find((b) => b.type === 'saegewerk').prod.recipe)) === 'holzstab', 'Rezept auf Stäbe umgestellt');
  check(
    await page.locator('#info-actions button', { hasText: 'Stäbe' }).evaluate((b) => b.classList.contains('primary')),
    'Gewähltes Rezept ist hervorgehoben',
  );
  await shot('12-saegewerk');
  await page.tap('#info-close');

  // ---------- Eisen-Kette ----------
  // Schmelzhütte (18,9)-(19,10) gibt rechts bei (20,9) aus → Band bis (21,9) → Schmiede (22,9)-(23,10)
  async function buildAt(type, x, y) {
    await page.tap(`.build-item[data-tool="${type}"]`);
    await sleep(80);
    const g = await game(page, () => ({ ...window.__game.ui.ghost }));
    await touchDragTiles(page, cdp, [
      [g.x, g.y],
      [x, y],
    ]);
    await page.tap('#tool-confirm');
    await sleep(80);
  }
  await page.tap('#btn-build');
  await buildAt('schmelzhuette', 18, 9);
  await buildAt('schmiede', 22, 9);
  await page.tap('.build-item[data-tool="belt"]');
  await touchDragTiles(page, cdp, [
    [20, 9],
    [21, 9],
  ]);
  await page.tap('#tool-confirm');
  await page.tap('#build-close');
  await sleep(80);
  const iron = await game(page, () => window.__game.state.buildings.map((b) => `${b.type}@${b.x},${b.y}`));
  check(iron.includes('schmelzhuette@18,9') && iron.includes('schmiede@22,9'), `Schmelzhütte und Schmiede gebaut (${iron.join(' ')})`);
  await tapTile(page, 18, 9);
  check((await page.textContent('#info-title')) === 'Schmelzhütte', 'Schmelzhütte antippen zeigt Infofenster');
  await page.locator('#info-actions button', { hasText: 'Eisenerz einlegen' }).tap();
  await sleep(80);
  check((await game(page, () => window.__game.state.storage.eisenerz ?? 0)) === 1, 'Eisenerz eingelegt (eins bleibt im Lager)');
  await page.tap('#info-close');
  await game(page, () => window.__game.simulate(40));
  const smithy = await game(page, () => {
    const b = window.__game.state.buildings.find((x) => x.type === 'schmiede');
    return { stock: b.prod.stock.eisenbarren ?? 0, busy: b.prod.busy, out: b.prod.out };
  });
  check(smithy.stock > 0 || smithy.busy || smithy.out, `Eisenbarren kommen in der Schmiede an (${JSON.stringify(smithy)})`);
  await tapTile(page, 22, 9);
  check((await page.textContent('#info-title')) === 'Schmiede', 'Schmiede antippen zeigt Infofenster');
  await page.locator('#info-actions button', { hasText: 'Stangen' }).tap();
  await sleep(450);
  check((await game(page, () => window.__game.state.buildings.find((b) => b.type === 'schmiede').prod.recipe)) === 'eisenstange', 'Schmiede auf Stangen umgestellt');
  check((await page.textContent('#info-status')).includes('5 Eisenbarren → 1 Eisenstange'), 'Rezept zeigt 5 Barren → 1 Eisenstange');
  await shot('13-eisen');
  await page.tap('#info-close');

  // ---------- Level 4: Zimmerei mit zwei Eingängen (v0.10.0) ----------
  await game(page, () => Object.assign(window.__game.state.produced, { minieisenplatte: 1, eisenstange: 1 }));
  await page.tap('#btn-level');
  await sleep(120);
  await page.locator('#modal-content button', { hasText: 'Aufsteigen auf Level 4' }).tap();
  await sleep(150);
  const lvl4 = await game(page, () => ({ level: window.__game.state.shopLevel, counters: window.__game.state.counters.length }));
  check(lvl4.level === 4 && lvl4.counters === 3, `Level 4: dritte Verkaufstheke (${JSON.stringify(lvl4)})`);
  await page.tap('#modal-close');
  await game(page, () => {
    const s = window.__game.state.storage;
    s.holzplatte = (s.holzplatte ?? 0) + 20;
    s.eisenstange = (s.eisenstange ?? 0) + 10;
  });
  await page.tap('#btn-build');
  check(
    !(await page.locator('.build-item[data-tool="zimmerei"]').evaluate((b) => b.classList.contains('locked'))),
    'Zimmerei in der Bauleiste freigeschaltet',
  );
  check(
    await page.locator('.build-item[data-tool="feinschmiede"]').evaluate((b) => b.classList.contains('locked')),
    'Feinschmiede noch gesperrt (Level 5)',
  );
  await buildAt('zimmerei', 26, 13);
  await page.tap('#build-close');
  await sleep(80);
  const zim = await game(page, () => window.__game.state.buildings.find((b) => b.type === 'zimmerei'));
  check(Boolean(zim) && zim.x === 26 && zim.y === 13, `Zimmerei gebaut (${zim ? `${zim.x},${zim.y}` : 'fehlt'})`);
  // Holzstäbe liegen schon drin, Zahnräder fehlen → kleines Bild an der Maschine
  await game(page, () => {
    window.__game.state.buildings.find((b) => b.type === 'zimmerei').prod.stock = { holzstab: 10, steinzahnrad: 2 };
  });
  await tapTile(page, 26, 13);
  check((await page.textContent('#info-title')) === 'Zimmerei', 'Zimmerei antippen zeigt Infofenster');
  const zimButtons = await page.locator('#info-actions button').allTextContents();
  check(
    ['Handkurbeln', 'Schalter', 'Verst. Platten'].every((t) => zimButtons.some((b) => b.includes(t))),
    `Drei Einstellungen (${zimButtons.slice(0, 3).join(', ')})`,
  );
  const zimStatus = await page.textContent('#info-status');
  check(
    zimStatus.includes('10 Holzstäbe + 5 Stein-Zahnräder → 1 Handkurbel') && zimStatus.includes('Stein-Zahnrad: 2 / 5 – fehlt noch 3'),
    'Infofenster zeigt Rezept und welche Zutat wie viel fehlt',
  );
  check(zimStatus.includes('Wartet auf Stein-Zahnrad (2 / 5)'), 'Status nennt die fehlende Zutat');
  check(
    zimStatus.includes('Andere Einstellungen') && zimStatus.includes('Schalter: 10 Stein-Zahnräder + 5 Holzstäbe'),
    'Infofenster zeigt die Rezepte der anderen Einstellungen',
  );
  check(!(await page.locator('#info-actions button', { hasText: 'Reste' }).isVisible()), 'Ohne Reste kein Knopf „Reste ins Laden-Lager“');
  await shot('14-zimmerei');
  // v0.10.1: Umstellen lässt die Teile in der Maschine (vorher: ins Laden-Lager)
  const sticksBefore = await game(page, () => window.__game.state.storage.holzstab ?? 0);
  await page.locator('#info-actions button', { hasText: 'Verst. Platten' }).tap();
  await sleep(450);
  const zimStock = () =>
    game(page, () => {
      const b = window.__game.state.buildings.find((x) => x.type === 'zimmerei');
      return { recipe: b.prod.recipe, stock: b.prod.stock, sticks: window.__game.state.storage.holzstab ?? 0 };
    });
  const switched = await zimStock();
  check(
    switched.recipe === 'verstaerkteholzplatte' && switched.stock.holzstab === 10 && switched.stock.steinzahnrad === 2 && switched.sticks === sticksBefore,
    `Umstellen: die Teile bleiben in der Maschine (${JSON.stringify(switched)})`,
  );
  check(
    (await page.textContent('#info-status')).includes('Liegt noch in der Maschine: 10 Holzstäbe + 2 Stein-Zahnräder'),
    'Infofenster zeigt, was noch in der Maschine liegt',
  );
  await shot('14b-zimmerei-umgestellt');
  await page.locator('#info-actions button', { hasText: 'Handkurbeln' }).tap();
  await sleep(450);
  const back = await zimStock();
  check(back.recipe === 'handkurbel' && back.stock.holzstab === 10, `Zurückgestellt: die Holzstäbe sind noch da (${JSON.stringify(back)})`);
  await page.locator('#info-actions button', { hasText: 'Verst. Platten' }).tap();
  await sleep(450);
  await page.locator('#info-actions button', { hasText: 'Reste ins Laden-Lager' }).tap();
  await sleep(150);
  const cleared = await zimStock();
  check(
    cleared.sticks === sticksBefore + 10 && !cleared.stock.holzstab,
    `Knopf „Reste ins Laden-Lager“ legt die Teile ins Laden-Lager (${JSON.stringify(cleared)})`,
  );
  await page.tap('#info-close');

  // ---------- Level 5 und 6: je eine Theke mehr, 5 Theken auf Level 6 ----------
  await game(page, () => Object.assign(window.__game.state.produced, { handkurbel: 1, schalter: 1, scharnier: 1, eisenfeder: 1 }));
  await page.tap('#btn-level');
  await sleep(120);
  await page.locator('#modal-content button', { hasText: 'Aufsteigen auf Level 5' }).tap();
  await sleep(150);
  await page.locator('#modal-content button', { hasText: 'Aufsteigen auf Level 6' }).tap();
  await sleep(150);
  const lvl6 = await game(page, () => ({ level: window.__game.state.shopLevel, counters: window.__game.state.counters.length }));
  check(lvl6.level === 6 && lvl6.counters === 5, `Level 6 mit 5 Verkaufstheken (${JSON.stringify(lvl6)})`);
  check((await page.textContent('#modal-content')).includes('höchste Level'), 'Level 6 ist vorerst das höchste');
  await shot('15-level-6');
  await page.tap('#modal-close');
  await page.tap('#btn-shop');
  await sleep(80);
  await page.tap('#modal-content .tab[data-tab="theken"]');
  await sleep(80);
  const heads = await page.locator('#modal-content .counter-head').allTextContents();
  check(
    heads.length === 5 && heads.every((h) => h.includes('30 Plätze')),
    `Fünf große Theken mit je 30 Plätzen (${heads.join(' | ')})`,
  );
  check((await page.textContent('#modal-content .modal-meta')).includes('/ 1.000'), 'Laden-Lager fasst 1.000 Waren');
  await shot('16-fuenf-theken');
  await page.tap('#modal-close');
  // v0.10.2: Jeder Streifen kostet 500 Gold, jede Seite geht 2×
  const plotNow = await game(page, () => ({ ...window.__game.state.plot }));
  await tapTile(page, plotNow.x + plotNow.width, plotNow.y + 3);
  check((await page.textContent('#info-title')) === 'Fläche kaufen', 'Fläche rechts antippen bietet Fläche an');
  check(
    (await page.textContent('#info-meta')).includes(`4 Spalten rechts · ${4 * plotNow.height} Felder`),
    `Angebot: 4 Spalten (${await page.textContent('#info-meta')})`,
  );
  await shot('16b-flaeche-level6');
  // 1.000 Gold dazu, damit die beiden Käufe den weiteren Ablauf nicht arm machen
  const goldRight = await game(page, () => (window.__game.state.gold += 1000));
  await page.locator('#info-actions button', { hasText: 'Kaufen · 500' }).tap();
  await sleep(120);
  // Karte so schieben, dass der nächste Streifen rechts zu sehen ist (danach zurück)
  const camLand = await game(page, () => ({ x: window.__game.camera.x, y: window.__game.camera.y }));
  await game(page, (tx) => {
    const { camera, TILE } = window.__game;
    camera.x = (tx + 0.5) * TILE - camera.viewWidth / camera.zoom / 2;
  }, plotNow.x + plotNow.width + 4);
  await tapTile(page, plotNow.x + plotNow.width + 4, plotNow.y + 3);
  check((await page.textContent('#info-text')).includes('letzte Kauf'), `Zweiter Streifen rechts ist der letzte an dieser Seite (Gold ${goldRight})`);
  await page.locator('#info-actions button', { hasText: 'Kaufen · 500' }).tap();
  await sleep(120);
  const right = await game(page, () => ({
    plot: { ...window.__game.state.plot },
    world: { ...window.__game.state.world },
    gold: window.__game.state.gold,
  }));
  check(
    right.plot.x + right.plot.width === right.world.x + right.world.width && right.plot.width === plotNow.width + 8,
    `Rechts 2× gekauft: Grundstück reicht bis an den Rand der Welt (${right.plot.width} × ${right.plot.height})`,
  );
  // Kunden können währenddessen kaufen, deshalb höchstens etwas mehr Gold
  check(right.gold <= goldRight - 1000 + 200 && right.gold >= goldRight - 1000, `Beide Streifen kosten je 500 Gold (${goldRight} → ${right.gold})`);
  await shot('16c-flaeche-rechts-fertig');
  await game(page, (c) => Object.assign(window.__game.camera, c), camLand);
  await tapTile(page, 3, 3); // Auswahl aufheben (gesperrte Fläche, kein Angebot)
  await page.tap('#info-close').catch(() => {});
  await shot('17-fabrik');

  await page.tap('#btn-menu');
  await page.tap('#menu-test-mode');
  await sleep(80);
  check(await page.isVisible('#hud-speed'), 'Testmodus zeigt ⏩ ×10');
  const tBefore = await game(page, () => window.__game.state.buildings.find((b) => b.type === 'holzfaeller').prod.remaining);
  // Bei ×10 entstehen in 3 s etwa 6–7 Holzblöcke, bei normaler Zeit unter 1.
  await sleep(3000);
  const tAfter = await game(page, () => window.__game.state.buildings.find((b) => b.type === 'holzfaeller').prod.remaining);
  check(tBefore - tAfter >= 3, `Im Testmodus läuft die Zeit schneller (${tBefore - tAfter} Blöcke in 3 s)`);
  await page.tap('#btn-menu');
  await page.tap('#menu-test-mode');
  check(!(await page.isVisible('#hud-speed')), 'Testmodus nach dem Zeittest aus');

  // Holzstamm direkt im Infofenster kaufen
  await tapTile(page, 10, 6);
  const goldBeforeLog = await game(page, () => window.__game.state.gold);
  await page.locator('#info-actions button', { hasText: 'Holzstamm kaufen' }).tap();
  await sleep(80);
  const logBought = await game(page, () => ({ gold: window.__game.state.gold, logs: window.__game.state.storage.holzstamm ?? 0 }));
  check(logBought.logs === 1 && logBought.gold <= goldBeforeLog - 550 + 200, `Holzstamm im Infofenster gekauft (${goldBeforeLog} → ${logBought.gold})`);
  await page.tap('#info-close');

  // Die Fabrik läuft beim Neuladen weiter; beim Verlassen wird der neueste Stand
  // gespeichert. Deshalb: nichts darf verloren gehen (eher kommt etwas dazu).
  const snapshot = () =>
    game(page, () => ({
      logs: window.__game.state.storage.holzstamm ?? 0,
      blocks: window.__game.state.storage.holzblock ?? 0,
    }));
  const beforeReload = await snapshot();
  await page.reload();
  await waitForGame(page);
  const afterReload = await snapshot();
  check(
    afterReload.logs === beforeReload.logs && afterReload.blocks >= beforeReload.blocks,
    `Laden-Lager bleibt nach dem Neuladen erhalten (Holzstämme ${beforeReload.logs} → ${afterReload.logs}, Holzblöcke ${beforeReload.blocks} → ${afterReload.blocks})`,
  );

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

  console.log(failures === 0 ? '\nAlle Browser-Prüfungen bestanden.' : `\n${failures} Prüfung(en) fehlgeschlagen:\n  - ${failed.join('\n  - ')}`);
  console.log(`Screenshots: ${OUT}`);
  process.exit(failures === 0 ? 0 : 1);
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
