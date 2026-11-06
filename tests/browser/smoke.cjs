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
  check(JSON.stringify(types) === '["holzfaeller","steinbruch","versandportal"]', 'Start: Holzfällerlager, Steinbruch und Versandportal');
  check((await page.textContent('#hud-gold')) === '0', 'Start ohne Gold');
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
  check(await page.locator('#info-actions button', { hasText: 'Holzstamm kaufen' }).isDisabled(), 'Ohne Gold lässt sich kein Holzstamm kaufen');
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
  check(after.buildings === 4 && after.belts === beltCountBefore && after.rot === 1, 'Nach dem Neuladen ist alles noch da');
  check((await page.textContent('#toast')).includes('Spielstand geladen'), 'Meldung „Spielstand geladen“');

  // ---------- Gebäude abreißen ----------
  await tapTile(page, 10, 12);
  await page.locator('#info-actions button', { hasText: 'Abreißen' }).tap();
  await sleep(80);
  check(await page.isVisible('#dialog'), 'Abreißen fragt nach');
  check((await page.textContent('#dialog-text')).includes('nichts gekostet'), 'Startgebäude: keine Baukosten zurück (Hinweis)');
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
  check(fresh.buildings === 3 && fresh.belts === 0, 'Neues Spiel startet frisch');

  // ---------- Einstieg ohne Gold ----------
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
  const counter = await game(page, () => window.__game.state.counters[0]);
  check(counter.type === 'holzblock' && counter.count === 20, `Theke 1 mit 20 Holzblöcken bestückt (${JSON.stringify(counter)})`);
  await shot('9-theken');
  await game(page, () => window.__game.simulate(90));
  await sleep(500);
  const sold = await game(page, () => ({ gold: window.__game.state.gold, sales: window.__game.state.market.sales.length }));
  check(sold.gold > 0 && sold.sales > 0, `Kunden kaufen und zahlen (${sold.gold} Gold, ${sold.sales} Verkäufe)`);
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

  // ---------- Händler ----------
  // Für den Rest des Tests genau die nötigen Waren und Gold geben (das
  // Testpaket mehrfach würde das Laden-Lager füllen).
  await page.tap('#modal-close');
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
  check(bought.ore === 1 && bought.gold === goldBeforeBuy - 2200, `Händler: Eisenerz für 2.200 Gold gekauft (${goldBeforeBuy} → ${bought.gold})`);
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
  check((await game(page, () => window.__game.state.storage.eisenerz ?? 0)) === 0, 'Gekauftes Eisenerz eingelegt');
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
