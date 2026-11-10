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
  const actionKeys = await page.locator('#info-panel button[data-key]').evaluateAll((list) => list.map((b) => b.dataset.key));
  check(
    ['refill', 'load:holzstamm', 'buy:holzstamm', 'move', 'rotate', 'remove'].every((k) => actionKeys.includes(k)),
    `Infofenster hat Auffüllen, Einlegen, Kaufen, Verschieben, Drehen, Abreißen (${actionKeys.join(', ')})`,
  );
  check(
    (await page.locator('#info-tools button').allTextContents()).join(',') === '↔ Verschieben,↻ Drehen,🗑 Abreißen',
    'v0.19.0: Verschieben, Drehen, Abreißen klein in einer Zeile unten',
  );
  check((await page.textContent('#info-meta')).includes('Leer – Rohstoff nachlegen'), 'Status steht unter dem Namen');
  const startCard = await infoCard(page);
  check(
    startCard?.caption === 'Stellt her' && startCard.inputs.join() === 'holzstamm 1' && startCard.outputs.join().startsWith('holzblock 200 Holzblöcke'),
    `Grüner Kasten: 1 Holzstamm → 200 Holzblöcke (${JSON.stringify(startCard)})`,
  );
  const startText = await infoText(page);
  check(startText.includes('Im Laden-Lager: 1 Holzstamm'), 'Infofenster zeigt Vorrat im Laden-Lager');
  check(startText.includes('Vorrat 0 / 3'), 'Infofenster zeigt den Vorrat im Gebäude (0 / 3)');
  check(
    (await page.locator('#info-body .source-slots .item-icon.empty').count()) === 3,
    'Vorrat als 3 Bilder, alle blass (leer)',
  );
  check(!(await page.isVisible('#info-text')) && (await page.textContent('#info-hint')).includes('orangen Pfeil'), 'Kurzer Tipp ganz unten statt langer Beschreibung');
  const startFit = await infoFits(page);
  check(startFit.length === 0, `Alle Knöpfe passen ins Infofenster (${startFit.join(' | ')})`);
  check(
    (await page.locator('#info-actions button', { hasText: 'Auffüllen' }).textContent()) === '⏫ Auffüllen: 1 Holzstamm',
    'Auffüllen nimmt den Holzstamm aus dem Laden-Lager (Gold reicht nicht für mehr)',
  );
  check(await infoButton(page, 'buy:holzstamm').isDisabled(), 'Mit 500 Gold reicht es noch nicht für einen Holzstamm (550)');
  await page.locator('#info-tools button', { hasText: 'Drehen' }).tap();
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
      const icons = [...document.querySelectorAll('#build-bar .cost-part canvas.item-icon')];
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
  const quarryItem = page.locator('.build-item[data-tool="steinbruch"]');
  check(
    (await quarryItem.evaluate((b) => b.classList.contains('locked'))) && (await quarryItem.textContent()).includes('Level 2'),
    'Steinbruch in der Bauleiste gesperrt (🔒 Level 2)',
  );
  await shot('4-bauleiste');

  // ---------- v0.18.0: Reiter, Werkzeuge immer sichtbar, Platz unter der Karte ----------
  const shownTools = () =>
    page.evaluate(() => [...document.querySelectorAll('#build-bar .build-item')].filter((b) => b.offsetParent !== null).map((b) => b.dataset.tool));
  const tabActive = (tab) => page.locator(`.build-tab[data-tab="${tab}"]`).evaluate((b) => b.classList.contains('active'));
  const tabNames = await page.locator('.build-tab').allTextContents();
  check(
    tabNames.length === 4 && ['Holz', 'Stein', 'Eisen', 'Erde'].every((n, i) => tabNames[i].includes(n)),
    `Bauleiste hat die Reiter Holz, Stein, Eisen, Kräuter (${tabNames.join(', ')})`,
  );
  check(await tabActive('holz'), 'Reiter „Holz“ ist zu Beginn offen');
  let shown = await shownTools();
  check(
    shown.join(',') === 'belt,lagerhaus,versandportal,area,erase,holzfaeller,saegewerk,zimmerei',
    `Links immer Förderband, Lagerhaus, Portal, Verschieben, Abreißen; rechts die Holz-Gebäude (${shown.join(', ')})`,
  );
  check(
    (await page.locator('.build-tab[data-tab="stein"]').evaluate((b) => b.classList.contains('locked'))) &&
      !(await page.locator('.build-tab[data-tab="holz"]').evaluate((b) => b.classList.contains('locked'))),
    'Reiter „Stein“ trägt auf Level 1 ein Schloss, „Holz“ nicht',
  );
  await page.tap('.build-tab[data-tab="eisen"]');
  await sleep(80);
  shown = await shownTools();
  check(
    shown.join(',') === 'belt,lagerhaus,versandportal,area,erase,schmelzhuette,schmiede,feinschmiede,schlosserei',
    `Reiter „Eisen“: Schmelzhütte, Schmiede, Feinschmiede, Schlosserei – die Werkzeuge bleiben (${shown.join(', ')})`,
  );
  const fits = await page.evaluate(() =>
    [...document.querySelectorAll('#build-bar button')]
      .filter((b) => b.offsetParent !== null)
      .filter((b) => {
        const r = b.getBoundingClientRect();
        return r.left < 0 || r.right > window.innerWidth + 0.5 || b.scrollWidth > b.clientWidth + 1;
      })
      .map((b) => b.dataset.tool ?? b.dataset.tab ?? b.id),
  );
  check(fits.length === 0, `Alle Knöpfe und Reiter passen auf den Bildschirm, kein Name ragt heraus${fits.length ? ': ' + fits.join(', ') : ''}`);
  const itemsScroll = await page.evaluate(() => {
    const el = document.getElementById('build-items');
    return el.scrollWidth - el.clientWidth;
  });
  check(itemsScroll <= 1, `Die 4 Eisen-Gebäude passen nebeneinander (Überstand ${itemsScroll} px)`);
  await shot('4b-reiter-eisen');
  await page.tap('#build-close');
  await sleep(80);
  await page.tap('#btn-build');
  await sleep(80);
  check(await tabActive('eisen'), 'Bauleiste merkt sich den zuletzt geöffneten Reiter');
  check(
    await page.evaluate(() => getComputedStyle(document.getElementById('hint')).opacity === '0'),
    'Hinweis „Ziehen: verschieben …“ liegt nicht über der Bauleiste',
  );
  // Ganz nach unten schieben: Der untere Rand der Welt liegt über Leiste und Reitern.
  const savedCam = await game(page, () => ({ ...window.__game.camera }));
  const stageBox = await page.locator('#game').boundingBox();
  for (let i = 0; i < 8; i++) {
    const x = stageBox.x + stageBox.width / 2;
    const y0 = stageBox.y + stageBox.height * 0.5;
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y: y0, id: 3 }] });
    for (let st = 1; st <= 6; st++) {
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x, y: y0 - st * 20, id: 3 }] });
    }
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  }
  await sleep(80);
  const edge = await page.evaluate(() => {
    const { state, camera, TILE } = window.__game;
    const cv = document.getElementById('game').getBoundingClientRect();
    return {
      worldBottom: cv.top + ((state.world.y + state.world.height) * TILE - camera.y) * camera.zoom,
      tabsTop: document.getElementById('build-tabs').getBoundingClientRect().top,
    };
  });
  check(
    edge.worldBottom <= edge.tabsTop && edge.worldBottom >= edge.tabsTop - 20,
    `Ganz nach unten geschoben: Die unterste Reihe liegt über der Bauleiste samt Reitern (Rand ${Math.round(edge.worldBottom)}, Reiter ${Math.round(edge.tabsTop)})`,
  );
  await shot('4c-ganz-unten');
  await game(page, (cam) => {
    Object.assign(window.__game.camera, { x: cam.x, y: cam.y, zoom: cam.zoom });
    window.__game.simulate(0);
  }, savedCam);

  await tapBuild(page, 'steinbruch');
  await sleep(80);
  check((await mode(page)) === 'menu' && (await page.textContent('#toast')).includes('ab Level 2'), 'Gesperrtes Gebäude antippen sagt, ab welchem Level');
  const toastAbove = await page.evaluate(
    () => document.getElementById('toast').getBoundingClientRect().bottom <= document.getElementById('build-tabs').getBoundingClientRect().top,
  );
  check(toastAbove, 'Die Meldung erscheint über der Bauleiste samt Reitern (nicht darauf)');
  await tapBuild(page, 'saegewerk');
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
  await page.locator('#info-tools button', { hasText: 'Abreißen' }).tap();
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
  await tapBuild(page, 'saegewerk');
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
  await infoButton(page, 'load:holzstamm').tap();
  await sleep(80);
  const afterLoad = await game(page, () => ({
    logs: window.__game.state.storage.holzstamm ?? 0,
    loaded: window.__game.state.buildings.find((b) => b.type === 'holzfaeller').prod.loaded,
  }));
  check(afterLoad.loaded && afterLoad.logs === 0, 'Gratis-Holzstamm eingelegt');
  await sleep(450);
  check((await infoText(page)).includes('Vorrat 1 / 3'), 'Vorrat 1 / 3');
  check(
    (await page.locator('#info-body .source-slots .item-icon:not(.empty)').count()) === 1 &&
      (await page.locator('#info-body .source-slots .item-icon.empty').count()) === 2,
    'Vorrat als Bilder: 1 voll, 2 blass',
  );
  check((await infoCard(page))?.caption === 'Stellt gerade her', 'Läuft: „Stellt gerade her“');
  check(
    await infoButton(page, 'load:holzstamm').isDisabled(),
    'Ohne Holzstamm im Laden-Lager lässt sich keiner mehr einlegen',
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
  // Auch hier: Was ein Kunde genau jetzt kauft, zählt mit.
  const saleIdAll = await game(page, () => window.__game.state.market.nextSaleId);
  await page.locator('#modal-content button', { hasText: 'Auf die Theke' }).tap();
  await sleep(80);
  const counter = await game(
    page,
    (since) => {
      const s = window.__game.state;
      const sold = s.market.sales.filter((sale) => sale.id >= since).reduce((n, sale) => n + (sale.items.holzblock ?? 0), 0);
      return { ...s.counters[0], sold };
    },
    saleIdAll,
  );
  check(counter.type === 'holzblock' && counter.count + counter.sold === 20, `„Alle“ füllt Theke 1 auf 20 Holzblöcke (${JSON.stringify(counter)})`);
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

  // ---------- Laden-Level und Aufträge (v0.13.0) ----------
  // Aufträge der Bewohner per Touch abgeben (Waren aus dem Laden-Lager), dann
  // mit Erfahrung und Gold aufsteigen. Weitere Level: Erfahrung direkt setzen.
  const quest1 = await game(page, () => window.__game.currentQuest());
  check(quest1.from === 'Zimmermann Jakob' && quest1.items.holzplatte === 5, `Erster Auftrag: Jakob will 5 Holzplatten (${JSON.stringify(quest1.items)})`);
  check(await page.isVisible('#btn-level .hud-xp'), 'Erfahrungsleiste oben im Knopf „Laden-Level“');
  await game(page, () => {
    const s = window.__game.state.storage;
    s.holzplatte = (s.holzplatte ?? 0) + 15;
    s.holzstab = (s.holzstab ?? 0) + 30;
  });
  const questShown = await page
    .waitForFunction(() => !document.getElementById('hud-quest-ready').hidden, null, { timeout: 3000 })
    .then(() => true, () => false);
  check(questShown, 'Auftrag lässt sich abgeben: oben erscheint ❗');
  await page.tap('#btn-level');
  await sleep(150);
  const levelText = await page.textContent('#modal-content');
  check(
    levelText.includes('Laden-Level 1 · Die ersten Hütten') && levelText.includes('Zimmermann Jakob') && levelText.includes('Auftrag 1 von 3'),
    'Level-Fenster zeigt Bauabschnitt und den ersten Auftrag',
  );
  check(
    levelText.includes('Erfahrung für Level 2') && levelText.includes('0 / 81') && levelText.includes('Belohnung: +9 Erfahrung · +90'),
    'Erfahrungsleiste 0 / 81 und Belohnung',
  );
  check((await page.locator('#modal-content .goal-row.done').count()) === 1, 'Ware liegt im Laden-Lager (abgehakt)');
  check(
    await page.locator('#modal-content button.quest-skip', { hasText: '🧪 Test: Auftrag erledigen' }).isVisible(),
    'Test-Knopf „Auftrag erledigen“ ist zu sehen (v0.15.0, ohne Testmodus)',
  );
  check(await page.locator('#modal-content button', { hasText: 'Aufsteigen auf Level 2' }).isDisabled(), 'Aufsteigen noch gesperrt (zu wenig Erfahrung)');
  await shot('10b-auftrag');
  const before1 = await game(page, () => ({ plates: window.__game.state.storage.holzplatte, gold: window.__game.state.gold }));
  await page.locator('#modal-content button', { hasText: 'Abgeben' }).tap();
  await sleep(200);
  const after1 = await game(page, () => ({ plates: window.__game.state.storage.holzplatte, gold: window.__game.state.gold, quest: window.__game.state.quest }));
  check(
    after1.plates === before1.plates - 5 && after1.gold >= before1.gold + 90 && after1.quest.index === 1 && after1.quest.xp === 9,
    `Abgeben: 5 Holzplatten weg, +90 Gold, +9 Erfahrung (${JSON.stringify(after1)})`,
  );
  const text2 = await page.textContent('#modal-content');
  check(text2.includes('Auftrag erledigt') && text2.includes('Auftrag 2 von 3') && text2.includes('9 / 81'), 'Nächster Auftrag rückt nach, Leiste wächst');
  await page.locator('#modal-content button', { hasText: 'Abgeben' }).tap();
  await sleep(200);
  await page.locator('#modal-content button', { hasText: 'Abgeben' }).tap();
  await sleep(450);
  const done1 = await page.textContent('#modal-content');
  check(done1.includes('Alle Aufträge dieses Bauabschnitts sind erledigt') && done1.includes('81 / 81'), 'Alle drei Aufträge erledigt, Erfahrung voll');
  check(done1.includes('du kannst aufsteigen'), 'Genug Erfahrung und Gold');
  await shot('10c-level-bereit');
  const goldBeforeUp = await game(page, () => window.__game.state.gold);
  await page.locator('#modal-content button', { hasText: 'Aufsteigen auf Level 2 · 100' }).tap();
  await sleep(150);
  const lvl2 = await game(page, () => ({ level: window.__game.state.shopLevel, rocks: window.__game.state.storage.felsbrocken ?? 0, gold: window.__game.state.gold }));
  check(lvl2.level === 2 && lvl2.rocks === 1, `Aufgestiegen auf Level 2, Gratis-Felsbrocken im Lager (${JSON.stringify(lvl2)})`);
  check(lvl2.gold >= goldBeforeUp - 100 && lvl2.gold <= goldBeforeUp - 100 + 200, `Der Aufstieg kostet 100 Gold (${goldBeforeUp} → ${lvl2.gold})`);
  const text3 = await page.textContent('#modal-content');
  check(text3.includes('Level 2 erreicht') && text3.includes('Wege und Brunnen') && text3.includes('Steinmetzin Berta'), 'Level-Fenster gratuliert, Aufträge von Level 2');
  check((await page.textContent('#hud-level')) === '2', 'Oben steht Level 2');
  await shot('10d-level-2');
  const upButton3 = page.locator('#modal-content button', { hasText: 'Aufsteigen auf Level 3' });
  check(await upButton3.isDisabled(), 'Level 3 noch gesperrt (zu wenig Erfahrung)');
  await game(page, () => (window.__game.state.quest.xp = window.__game.xpNeeded()));
  const enabled3 = await page
    .waitForFunction(() => [...document.querySelectorAll('#modal-content button')].some((b) => b.textContent.includes('Level 3') && !b.disabled), null, { timeout: 3000 })
    .then(() => true, () => false);
  check(enabled3, 'Level-Fenster aktualisiert sich: Aufstieg auf Level 3 möglich');
  await upButton3.tap();
  await sleep(150);
  const lvl3 = await game(page, () => ({ level: window.__game.state.shopLevel, ore: window.__game.state.storage.eisenerz ?? 0 }));
  check(lvl3.level === 3 && lvl3.ore === 1, `Aufgestiegen auf Level 3, Gratis-Eisenerz im Lager (${JSON.stringify(lvl3)})`);
  const next4 = await page.textContent('#modal-content');
  check(next4.includes('Nächstes Level: Level 4 · Die Mühle am Fluss'), 'Nach Level 3 kommt Level 4 (Die Mühle am Fluss)');
  check(
    next4.includes('Theke 3') && next4.includes('mittlere Theken (25 Plätze)') && next4.includes('Laden-Lager 1.000 Plätze'),
    'Level 4 kündigt dritte Theke, mittlere Theken und 1.000 Lagerplätze an',
  );
  await shot('10e-level-3');
  await page.tap('#modal-content .tab[data-tab="town"]');
  await sleep(120);
  const town = await page.textContent('#modal-content');
  check(
    town.includes('✅ Level 2 · Wege und Brunnen') && town.includes('▶ Level 3 · Die Dorfschmiede') && town.includes('🔒 Level 6 · Das Stadttor'),
    'Reiter „Ort & Level“ zeigt die Bauabschnitte des Ortes',
  );
  await shot('10f-ort');
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
  await tapBuild(page, 'saegewerk');
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
  const sawCard = await infoCard(page);
  check(
    sawCard?.inputs.join() === 'holzblock 0 / 5' && sawCard.outputs.join() === 'holzplatte Holzplatte' && sawCard.lack.join() === 'holzblock',
    `Grüner Kasten: 0 / 5 Holzblöcke (rot) → Holzplatte (${JSON.stringify(sawCard)})`,
  );
  check((await recipeOption(page, 'holzstab').getAttribute('aria-label')) === 'Umstellen auf Holzstab: 5 Holzblöcke', 'Umstellen auf: Holzstab aus 5 Holzblöcken');
  await recipeOption(page, 'holzstab').tap();
  await sleep(450);
  check((await game(page, () => window.__game.state.buildings.find((b) => b.type === 'saegewerk').prod.recipe)) === 'holzstab', 'Rezept auf Stäbe umgestellt');
  check(
    (await infoCard(page))?.outputs.join() === 'holzstab Holzstab' &&
      (await recipeOption(page, 'holzplatte').count()) === 1 &&
      (await recipeOption(page, 'holzstab').count()) === 0,
    'Gewähltes Rezept steht oben im grünen Kasten, das andere darunter zum Umstellen',
  );
  await shot('12-saegewerk');
  await page.tap('#info-close');

  // ---------- Eisen-Kette ----------
  // Schmelzhütte (18,9)-(19,10) gibt rechts bei (20,9) aus → Band bis (21,9) → Schmiede (22,9)-(23,10)
  async function buildAt(type, x, y) {
    await tapBuild(page, type);
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
  await infoButton(page, 'load:eisenerz').tap();
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
  await recipeOption(page, 'eisenstange').tap();
  await sleep(450);
  check((await game(page, () => window.__game.state.buildings.find((b) => b.type === 'schmiede').prod.recipe)) === 'eisenstange', 'Schmiede auf Stangen umgestellt');
  const smithCard = await infoCard(page);
  check(
    /^eisenbarren \d+ \/ 5/.test(smithCard?.inputs.join() ?? '') && smithCard.outputs.join() === 'eisenstange Eisenstange',
    `Grüner Kasten: Eisenbarren (… / 5) → Eisenstange (${JSON.stringify(smithCard)})`,
  );
  await shot('13-eisen');
  await page.tap('#info-close');

  // ---------- Level 4: Zimmerei mit zwei Eingängen (v0.10.0) ----------
  await game(page, () => (window.__game.state.quest.xp = window.__game.xpNeeded()));
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
  const zimCard = await infoCard(page);
  check(
    zimCard?.caption === 'Stellt gerade her' &&
      zimCard.inputs.join() === 'holzstab 10 / 10 ✓,steinzahnrad 2 / 5' &&
      zimCard.outputs.join() === 'zahnradwelle Zahnradwelle' &&
      zimCard.lack.join() === 'steinzahnrad' &&
      zimCard.sub.includes('Fehlt noch: 3 Stein-Zahnräder') &&
      zimCard.sub.includes('20 s je Stück') &&
      zimCard.sub.includes('Wert 324'),
    `Grüner Kasten: 10/10 Holzstäbe + 2/5 Stein-Zahnräder (rot) → Zahnradwelle, fehlt noch 3 (${JSON.stringify(zimCard)})`,
  );
  check((await page.textContent('#info-meta')).includes('Wartet auf Stein-Zahnrad (2 / 5)'), 'Status unter dem Namen nennt die fehlende Zutat');
  const zimOptions = await page.locator('#info-body .recipe-option').evaluateAll((list) => list.map((b) => b.getAttribute('aria-label')));
  check(
    zimOptions.join(' | ') ===
      'Umstellen auf Räderwerk: 10 Stein-Zahnräder + 5 Holzstäbe | Umstellen auf Verstärkte Holzplatte: 10 Holzplatten + 5 Eisenstangen',
    `Umstellen auf: die beiden anderen Rezepte (${zimOptions.join(' | ')})`,
  );
  check(
    (await recipeOption(page, 'raederwerk').textContent()).includes('324 🪙'),
    'Jedes andere Rezept zeigt seinen Wert',
  );
  const zimFit = await infoFits(page);
  check(zimFit.length === 0, `Alle Knöpfe passen ins Infofenster (${zimFit.join(' | ')})`);
  check(!(await page.locator('#info-actions button', { hasText: 'Reste' }).isVisible()), 'Ohne Reste kein Knopf „Reste ins Laden-Lager“');
  await shot('14-zimmerei');
  // v0.10.1: Umstellen lässt die Teile in der Maschine (vorher: ins Laden-Lager)
  const sticksBefore = await game(page, () => window.__game.state.storage.holzstab ?? 0);
  await recipeOption(page, 'verstaerkteholzplatte').tap();
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
    (await infoText(page)).includes('Liegt noch in der Maschine: 10 Holzstäbe + 2 Stein-Zahnräder'),
    'Infofenster zeigt, was noch in der Maschine liegt',
  );
  await shot('14b-zimmerei-umgestellt');
  await recipeOption(page, 'zahnradwelle').tap();
  await sleep(450);
  const back = await zimStock();
  check(back.recipe === 'zahnradwelle' && back.stock.holzstab === 10, `Zurückgestellt: die Holzstäbe sind noch da (${JSON.stringify(back)})`);
  await recipeOption(page, 'verstaerkteholzplatte').tap();
  await sleep(450);
  await page.locator('#info-actions button', { hasText: 'Reste ins Laden-Lager' }).tap();
  await sleep(150);
  const cleared = await zimStock();
  check(
    cleared.sticks === sticksBefore + 10 && !cleared.stock.holzstab,
    `Knopf „Reste ins Laden-Lager“ legt die Teile ins Laden-Lager (${JSON.stringify(cleared)})`,
  );
  await page.tap('#info-close');

  // ---------- Bänder leeren (v0.12.0) ----------
  // Zuleitung (23,13)–(25,13) in den oberen Eingang der Zimmerei (26,13), darauf
  // Holzblöcke – die braucht die Zimmerei nicht, der Eingang staut sich.
  await page.tap('#btn-build');
  await page.tap('.build-item[data-tool="belt"]');
  await touchDragTiles(page, cdp, [
    [23, 13],
    [26, 13],
  ]);
  await page.tap('#tool-confirm');
  await page.tap('#build-close');
  await sleep(80);
  const feedLine = ['23,13', '24,13', '25,13'];
  check(
    (await game(page, (keys) => keys.map((k) => window.__game.state.belts[k]?.outs.join('') ?? '-').join(' '), feedLine)) === 'E E E',
    'Zuleitung zur Zimmerei gelegt',
  );
  const jamFeed = () =>
    game(page, (keys) => {
      for (const k of keys) window.__game.state.belts[k].item = { type: 'holzblock', progress: 1, from: 'W' };
    }, feedLine);
  await jamFeed();
  await tapTile(page, 24, 13);
  check((await page.textContent('#info-title')) === 'Förderband', 'Band antippen zeigt Infofenster');
  check(
    (await page.textContent('#info-status')).includes('Auf der ganzen Strecke (3 Bänder): 3 Holzblöcke'),
    `Infofenster nennt, was auf der ganzen Strecke liegt (${await page.textContent('#info-status')})`,
  );
  await shot('14c-strecke');
  // Der Holzfäller schickt währenddessen weiter Holzblöcke ins Laden-Lager –
  // deshalb „mindestens“ (und höchstens ein paar mehr).
  const blocksBeforeLine = await game(page, () => window.__game.state.storage.holzblock ?? 0);
  const blocksAbout = (n, want) => n >= blocksBeforeLine + want && n <= blocksBeforeLine + want + 3;
  await page.locator('#info-actions button', { hasText: 'Strecke leeren' }).tap();
  await sleep(450);
  const lineCleared = await game(page, (keys) => ({
    onBelts: keys.filter((k) => window.__game.state.belts[k].item).length,
    blocks: window.__game.state.storage.holzblock ?? 0,
  }), feedLine);
  check(
    lineCleared.onBelts === 0 && blocksAbout(lineCleared.blocks, 3),
    `„Strecke leeren“: 3 Holzblöcke im Laden-Lager, Bänder bleiben (${JSON.stringify(lineCleared)})`,
  );
  check(
    await page.locator('#info-actions button', { hasText: 'Strecke leeren' }).isDisabled(),
    'Leere Strecke: Knopf gesperrt',
  );
  await page.tap('#info-close');
  await jamFeed();
  await tapTile(page, 26, 13);
  check(
    (await page.textContent('#info-meta')).includes('Eingang blockiert: Holzblock wird hier nicht gebraucht'),
    'Zimmerei zeigt den Stau',
  );
  const feedButton = page.locator('#info-actions button', { hasText: 'Zulauf leeren' });
  check(await feedButton.isVisible(), 'Knopf „Zulauf leeren“ bei rotem Licht');
  await shot('14d-zulauf');
  await feedButton.tap();
  await sleep(450);
  const feedCleared = await game(page, (keys) => ({
    onBelts: keys.filter((k) => window.__game.state.belts[k].item).length,
    blocks: window.__game.state.storage.holzblock ?? 0,
  }), feedLine);
  check(
    feedCleared.onBelts === 0 && blocksAbout(feedCleared.blocks, 6),
    `„Zulauf leeren“ bringt die Holzblöcke ins Laden-Lager (${JSON.stringify(feedCleared)})`,
  );
  check(!(await feedButton.isVisible()), 'Ohne Stau kein Knopf „Zulauf leeren“');
  await page.tap('#info-close');

  // ---------- Lagerhaus: befüllen, ausräumen (v0.12.0; ohne Nachschub seit v0.14.0) ----------
  // Lagerhaus (10,14)-(11,14) gibt unten rechts aus → Band (11,15),(11,16)…(14,16)
  // → Versandportal (15,16). Was hineinkommt, läuft zurück ins Laden-Lager.
  await game(page, () => {
    const s = window.__game.state.storage;
    s.holzplatte = 40 + 8; // 8 kostet das Lagerhaus
    s.holzblock = (s.holzblock ?? 0) + 20;
    s.eisenbarren = 120;
  });
  await page.tap('#btn-build');
  await buildAt('versandportal', 15, 16);
  await buildAt('lagerhaus', 10, 14);
  await page.tap('.build-item[data-tool="belt"]');
  await touchDragTiles(page, cdp, [
    [11, 15],
    [11, 16],
    [15, 16],
  ]);
  await page.tap('#tool-confirm');
  await page.tap('#build-close');
  await sleep(80);
  const storeLine = await game(page, () => {
    const st = window.__game.state;
    return {
      built: st.buildings.filter((b) => (b.type === 'lagerhaus' && b.x === 10 && b.y === 14) || (b.type === 'versandportal' && b.x === 15 && b.y === 16)).length,
      belts: ['11,15', '11,16', '12,16', '13,16', '14,16'].map((k) => st.belts[k]?.outs.join('') ?? '-').join(' '),
      free: 1000 - Object.values(st.storage).reduce((a, b) => a + b, 0),
    };
  });
  check(storeLine.built === 2 && storeLine.belts === 'S E E E E', `Lagerhaus mit Band zum Versandportal gebaut (${JSON.stringify(storeLine)})`);
  await tapTile(page, 10, 14);
  check((await page.textContent('#info-title')) === 'Lagerhaus', 'Lagerhaus antippen zeigt Infofenster');
  const storeButtons = await page.locator('#info-actions button').allTextContents();
  check(
    ['Befüllen', 'Ausräumen'].every((t) => storeButtons.some((b) => b.includes(t))) && !storeButtons.some((b) => b.includes('Nachschub')),
    `Knöpfe Befüllen und Ausräumen, kein Nachschub (${storeButtons.join(', ')})`,
  );
  check(await page.locator('#info-actions button', { hasText: 'Ausräumen' }).isDisabled(), 'Leeres Lagerhaus: Ausräumen gesperrt');
  // Befüllen: Ware wählen, Menge einstellen
  await page.locator('#info-actions button', { hasText: 'Befüllen' }).tap();
  await sleep(120);
  check((await page.textContent('#modal-content h2')) === '📥 Lagerhaus befüllen', 'Fenster „Lagerhaus befüllen“');
  check(
    !(await page.textContent('#modal-content')).includes('Holzstamm'),
    'Rohstoffe stehen nicht zur Wahl',
  );
  await shot('14e-befuellen-ware');
  await page.locator('#modal-content .pick-row', { hasText: 'Eisenbarren' }).tap();
  await sleep(120);
  check((await page.textContent('#modal-content h3')) === 'Wie viele Eisenbarren ins Lagerhaus?', 'Mengenwahl fürs Lagerhaus');
  check((await page.textContent('#modal-content .amount-number')) === '120', 'Vorgeschlagen: alle 120 Eisenbarren');
  await page.locator('#modal-content button', { hasText: '−5' }).tap();
  await sleep(60);
  check((await page.textContent('#modal-content .amount-number')) === '115', '−5 → 115');
  await page.locator('#modal-content button', { hasText: 'Alle (120)' }).tap();
  await sleep(60);
  await shot('14f-befuellen-menge');
  await page.locator('#modal-content button', { hasText: 'Ins Lagerhaus' }).tap();
  await sleep(450);
  const ironCount = () =>
    game(page, () => {
      const st = window.__game.state;
      const store = st.buildings.find((b) => b.type === 'lagerhaus' && b.x === 10);
      const inStore = store.prod.slots.reduce((a, s) => a + (s.type === 'eisenbarren' ? s.count : 0), 0);
      // Nur die Bänder dieser Strecke – die Eisen-Linie von vorhin läuft noch
      const line = ['11,15', '11,16', '12,16', '13,16', '14,16'];
      const onBelts = line.filter((k) => st.belts[k]?.item?.type === 'eisenbarren').length;
      return { inStore, onBelts, inShop: st.storage.eisenbarren ?? 0 };
    });
  const filled = await ironCount();
  check(
    filled.inStore >= 100 && filled.inStore + filled.onBelts + filled.inShop === 120,
    `120 Eisenbarren im Lagerhaus, sie laufen aufs Band (${JSON.stringify(filled)})`,
  );
  check(!(await page.isVisible('#modal')), 'Fenster schließt sich nach dem Befüllen');
  // v0.20.0: die Fächer als Bilder mit Menge und Füllbalken, der Reihe nach
  const slots14 = await storeSlots(page);
  check(
    slots14.slots[0]?.startsWith('eisenbarren ') && slots14.slots.length === 3 && /^\d+ \/ 150$/.test(slots14.total),
    `Infofenster zeigt die 3 Fächer mit Bild und Menge (${JSON.stringify(slots14)})`,
  );
  check((await infoFits(page)).length === 0, `Lagerhaus: nichts ragt aus dem Fenster (${(await infoFits(page)).join(', ')})`);
  await shot('14g-lagerhaus-befuellt');
  await game(page, () => window.__game.simulate(90));
  const shipped = await ironCount();
  check(shipped.inShop === 120 && shipped.inStore === 0, `Über Band und Versandportal zurück im Laden-Lager (${JSON.stringify(shipped)})`);
  // v0.20.0: Versandportal – was zuletzt ankam, wie voll das Laden-Lager ist
  await tapTile(page, 15, 16);
  check((await page.textContent('#info-title')) === 'Versandportal', 'Versandportal antippen zeigt Infofenster');
  await sleep(450);
  const portal14 = await shipCard(page);
  const storeUse = await game(page, () => {
    const st = window.__game.state;
    return `${Object.values(st.storage).reduce((a, b) => a + b, 0)} / ${window.__game.storageCapacity()}`;
  });
  check(
    portal14.caption === 'Schickt ins Laden-Lager' && portal14.recent.join() === 'eisenbarren' && portal14.sub === 'Zuletzt: Eisenbarren · bisher 120 Waren' && !portal14.bad && portal14.warn === '',
    `Versandportal: Eisenbarren → Laden-Lager, bisher 120 Waren (${JSON.stringify(portal14)})`,
  );
  // Die Fabrik läuft weiter – die Zahl darf sich in der Zwischenzeit um ein paar Waren ändern
  const [shownUse, shownCap] = portal14.store.replace(/\./g, '').split(' / ').map(Number);
  const [realUse, realCap] = storeUse.split(' / ').map(Number);
  check(shownCap === realCap && Math.abs(shownUse - realUse) <= 10, `Versandportal zeigt das Laden-Lager (${portal14.store}, im Spiel ${storeUse})`);
  check((await infoFits(page)).length === 0, `Versandportal: nichts ragt aus dem Fenster (${(await infoFits(page)).join(', ')})`);
  await shot('14h-versandportal');
  // Laden-Lager voll: roter Balken, das Portal nimmt nichts an
  const filler = await game(page, () => {
    const st = window.__game.state;
    const free = window.__game.storageCapacity() - Object.values(st.storage).reduce((a, b) => a + b, 0);
    st.storage.steinblock = (st.storage.steinblock ?? 0) + free;
    return free;
  });
  await sleep(450);
  const portalFull = await shipCard(page);
  check(
    portalFull.bad && portalFull.warn.includes('Erst verkaufen oder verbauen') && (await page.textContent('#info-meta')).includes('Laden-Lager voll'),
    `Laden-Lager voll: roter Balken und Hinweis (${JSON.stringify(portalFull)})`,
  );
  await shot('14i-versandportal-voll');
  await game(page, (n) => (window.__game.state.storage.steinblock -= n), filler);
  await tapTile(page, 10, 14);
  check((await page.textContent('#info-title')) === 'Lagerhaus', 'Zurück zum Lagerhaus');
  // v0.14.0: Leer bleibt leer – das Lagerhaus holt nichts von selbst aus dem Laden-Lager
  const plates = () =>
    game(page, () => {
      const st = window.__game.state;
      const store = st.buildings.find((b) => b.type === 'lagerhaus' && b.x === 10);
      return {
        inStore: store.prod.slots.reduce((a, s) => a + (s.type === 'holzplatte' ? s.count : 0), 0),
        onBelts: Object.values(st.belts).filter((b) => b.item?.type === 'holzplatte').length,
        inShop: st.storage.holzplatte ?? 0,
      };
    });
  await game(page, () => window.__game.simulate(30));
  const stillEmpty = await plates();
  check(stillEmpty.inStore === 0 && stillEmpty.inShop === 40, `Leeres Lagerhaus bleibt leer, die Holzplatten bleiben im Laden-Lager (${JSON.stringify(stillEmpty)})`);
  await sleep(450);
  check((await page.textContent('#info-meta')).includes('Leer.'), 'Infofenster: Lagerhaus leer');
  const emptySlots = await storeSlots(page);
  check(
    emptySlots.slots.join() === 'frei,frei,frei' && emptySlots.total === '0 / 150' && emptySlots.sub.includes('Leer'),
    `Leeres Lagerhaus: drei freie Fächer, 0 / 150 (${JSON.stringify(emptySlots)})`,
  );
  // Gemischt (wie bei Tobias: Zahnräder und Stäbe): je Fach eine Ware, ein volles Fach orange.
  // Fach 1 geht zuerst hinaus – das volle Fach steht deshalb an zweiter Stelle.
  const mixBefore = await game(page, () => {
    const st = window.__game.state;
    st.buildings.find((b) => b.type === 'lagerhaus' && b.x === 10).prod.slots = [
      { type: 'holzstab', count: 42 },
      { type: 'steinzahnrad', count: 50 },
    ];
    return { steinzahnrad: st.storage.steinzahnrad ?? 0, holzstab: st.storage.holzstab ?? 0 };
  });
  await sleep(450); // das Infofenster aktualisiert sich in festen Abständen
  const mixed = await storeSlots(page);
  check(
    /^holzstab \d+ \/ 50$/.test(mixed.slots[0]) && mixed.slots[1] === 'steinzahnrad 50 / 50 voll' && mixed.slots[2] === 'frei',
    `Gemischtes Lagerhaus: Holzstäbe, Stein-Zahnräder (voll), ein Fach frei (${JSON.stringify(mixed)})`,
  );
  await shot('14j-lagerhaus-gemischt');
  // Ausräumen: alles zurück ins Laden-Lager (die gemischten Waren von eben wieder weg)
  await game(page, (before) => {
    const st = window.__game.state;
    st.buildings.find((b) => b.type === 'lagerhaus' && b.x === 10).prod.slots = [{ type: 'holzplatte', count: 7 }];
    st.storage.holzplatte = 33;
    Object.assign(st.storage, before);
    for (const b of Object.values(st.belts)) if (['holzplatte', 'steinzahnrad', 'holzstab'].includes(b.item?.type)) b.item = null;
  }, mixBefore);
  await sleep(450);
  await page.locator('#info-actions button', { hasText: 'Ausräumen' }).tap();
  await sleep(450);
  const emptied = await plates();
  check(emptied.inStore === 0 && emptied.inShop + emptied.onBelts === 40, `„Ausräumen“ legt alles ins Laden-Lager (${JSON.stringify(emptied)})`);
  await page.tap('#info-close');

  // ---------- Level 5 und 6: je eine Theke mehr, 5 Theken auf Level 6 ----------
  const levelUpWithXp = async (level) => {
    await game(page, () => {
      window.__game.state.quest.xp = window.__game.xpNeeded();
      window.__game.state.gold += 3000;
    });
    await sleep(450);
    await page.locator('#modal-content button', { hasText: `Aufsteigen auf Level ${level}` }).tap();
    await sleep(150);
  };
  await page.tap('#btn-level');
  await sleep(120);
  await levelUpWithXp(5);
  await levelUpWithXp(6);
  const lvl6 = await game(page, () => ({ level: window.__game.state.shopLevel, counters: window.__game.state.counters.length }));
  check(lvl6.level === 6 && lvl6.counters === 5, `Level 6 mit 5 Verkaufstheken (${JSON.stringify(lvl6)})`);
  const lvl6Text = await page.textContent('#modal-content');
  check(
    lvl6Text.includes('Torwächter Ulrich') && lvl6Text.includes('Gewichtsteine') && lvl6Text.includes('Nächstes Level: Level 7 · Die Heilstube'),
    'Level 6: Aufträge fürs Stadttor, danach kommt Level 7 „Die Heilstube“',
  );
  await shot('15-level-6');
  // v0.15.0: Test-Knopf – Erfahrung ohne Waren und ohne Gold
  const before6 = await game(page, () => {
    const st = window.__game.state;
    return { gold: st.gold, sale: st.market.sales[0]?.id ?? 0, storage: { ...st.storage }, quest: { ...st.quest } };
  });
  await page.locator('#modal-content button', { hasText: '🧪 Test: Auftrag erledigen' }).tap();
  await sleep(200);
  const after6 = await game(page, (since) => {
    const st = window.__game.state;
    const sold = st.market.sales.filter((x) => x.id > since).reduce((sum, x) => sum + x.gold, 0);
    return { gold: st.gold, sold, storage: { ...st.storage }, quest: { ...st.quest } };
  }, before6.sale);
  check(
    after6.quest.index === before6.quest.index + 1 && after6.quest.xp === before6.quest.xp + 259,
    `Test-Knopf: Auftrag 1 als erledigt gewertet, +259 Erfahrung (${JSON.stringify(after6.quest)})`,
  );
  check(after6.gold === before6.gold + after6.sold, `Test-Knopf gibt kein Gold (${before6.gold} → ${after6.gold}, Kunden ${after6.sold})`);
  check((after6.storage.gewichtstein ?? 0) === (before6.storage.gewichtstein ?? 0), 'Test-Knopf nimmt keine Waren');
  const skipText = await page.textContent('#modal-content');
  check(skipText.includes('Auftrag als erledigt gewertet (Test)') && skipText.includes('Auftrag 2 von 4'), 'Bestätigung und nächster Auftrag');
  await shot('15b-test-knopf');
  for (let i = 0; i < 3; i++) {
    await page.locator('#modal-content button', { hasText: '🧪 Test: Auftrag erledigen' }).tap();
    await sleep(200);
  }
  const allSkipped = await page.textContent('#modal-content');
  check(
    allSkipped.includes('Alle Aufträge dieses Bauabschnitts sind erledigt') && allSkipped.includes('1.841 / 1.841'),
    'Alle 4 Aufträge vom Stadttor per Test-Knopf erledigt, Erfahrung voll',
  );
  check((await page.locator('#modal-content button.quest-skip').count()) === 0, 'Ohne Auftrag kein Test-Knopf mehr');
  // v0.16.0: Aufsteigen auf Level 7 „Die Heilstube“ (3.000 Gold; das Gold
  // kommt hier dazu, damit der weitere Ablauf gleich bleibt)
  check(
    allSkipped.includes('Beet') && allSkipped.includes('Erntebank') && allSkipped.includes('Webstube') &&
      allSkipped.includes('Leinsamen beim Händler') && !allSkipped.includes('Flachspflanze beim Händler'),
    'Level 7 kündigt Beet, Erntebank, Webstube und Leinsamen beim Händler an',
  );
  await game(page, () => (window.__game.state.gold += 3000));
  await sleep(450);
  await page.locator('#modal-content button', { hasText: 'Aufsteigen auf Level 7 · 3.000' }).tap();
  await sleep(150);
  const lvl7 = await game(page, () => ({
    level: window.__game.state.shopLevel,
    seeds: window.__game.state.storage.leinsamen ?? 0,
    counters: window.__game.state.counters.length,
  }));
  check(lvl7.level === 7 && lvl7.seeds === 1 && lvl7.counters === 5, `Level 7: 1 Leinsamen gratis, Laden bleibt bei 5 Theken (${JSON.stringify(lvl7)})`);
  const lvl7Text = await page.textContent('#modal-content');
  check(
    lvl7Text.includes('Level 7 erreicht') && lvl7Text.includes('Die Heilstube') && lvl7Text.includes('Heilerin Agnes') && lvl7Text.includes('5 Verbände'),
    'Level-Fenster: Heilerin Agnes möchte 5 Verbände',
  );
  check(lvl7Text.includes('0 / 850'), 'Erfahrung für Level 8: 0 / 850');
  await shot('15c-level-7');
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

  // ---------- Level 7: Beet, Flachsbreche, Webstube (v0.16.0) ----------
  // Auf der neu gekauften Fläche rechts: säen, reif werden lassen, ernten
  // (zwei Schritte), Pflanze in die Flachsbreche einlegen.
  const bx = plotNow.x + plotNow.width + 1;
  const by = plotNow.y + 1;
  await game(page, ([x, y]) => {
    const { camera, TILE } = window.__game;
    camera.x = (x + 0.5) * TILE - camera.viewWidth / camera.zoom / 2;
    camera.y = (y + 0.5) * TILE - camera.viewHeight / camera.zoom / 2;
  }, [bx + 3, by + 2]);
  await game(page, () => {
    const s = window.__game.state.storage;
    s.holzplatte = (s.holzplatte ?? 0) + 20;
    s.steinplatte = (s.steinplatte ?? 0) + 10;
    s.zahnradwelle = (s.zahnradwelle ?? 0) + 2;
    s.holzstab = (s.holzstab ?? 0) + 20;
    s.raederwerk = (s.raederwerk ?? 0) + 2;
  });
  await page.tap('#btn-build');
  check(
    !(await page.locator('.build-item[data-tool="beet"]').evaluate((b) => b.classList.contains('locked'))),
    'Beet in der Bauleiste freigeschaltet (Level 7)',
  );
  await buildAt('beet', bx, by);
  await buildAt('flachsbreche', bx + 4, by);
  await buildAt('webstube', bx + 4, by + 3);
  await page.tap('#build-close');
  await sleep(80);
  const herbs = await game(page, () =>
    window.__game.state.buildings.filter((b) => ['beet', 'flachsbreche', 'webstube'].includes(b.type)).map((b) => `${b.type}@${b.x},${b.y}`),
  );
  check(
    herbs.join(' ') === `beet@${bx},${by} flachsbreche@${bx + 4},${by} webstube@${bx + 4},${by + 3}`,
    `Beet, Flachsbreche und Webstube per Touch gebaut (${herbs.join(', ')})`,
  );
  const beetState = () =>
    game(page, () => {
      const b = window.__game.state.buildings.find((x) => x.type === 'beet');
      const st = window.__game.state;
      return { crop: b.prod.crop, timer: b.prod.timer, seeds: st.storage.leinsamen ?? 0, plants: st.storage.flachspflanze ?? 0, gold: st.gold };
    });
  await tapTile(page, bx, by);
  check((await page.textContent('#info-title')) === 'Beet', 'Beet antippen zeigt Infofenster');
  await sleep(450);
  // v0.20.0: Säen-Knopf mit dem Bild des Samens, Kasten „Wächst hier“
  const sowButton = infoButton(page, 'sow:leinsamen');
  check(
    (await sowButton.textContent()).trim() === 'Säen: Leinsamen' && (await sowButton.isEnabled()) && (await sowButton.locator('canvas[data-item="leinsamen"]').count()) === 1,
    `Leeres Beet: „Säen: Leinsamen“ mit Bild des Samens, aus dem Laden-Lager (${await sowButton.textContent()})`,
  );
  check(!(await page.locator('#info-actions button', { hasText: 'Ernten' }).isVisible()), 'Leeres Beet: kein Ernten-Knopf');
  const beetEmpty = await infoCard(page);
  check(
    beetEmpty?.caption === 'Wächst hier' && beetEmpty.inputs.join() === 'leinsamen 1' && beetEmpty.outputs.join() === 'flachspflanze Flachspflanze' && beetEmpty.sub.includes('in 30:00 min'),
    `Leeres Beet: 1 Leinsamen → Flachspflanze in 30 Minuten (${JSON.stringify(beetEmpty)})`,
  );
  check((await page.textContent('#info-body')).includes('Im Laden-Lager: 1 Leinsamen'), 'Leeres Beet: Leinsamen im Laden-Lager');
  check((await infoFits(page)).length === 0, `Beet: nichts ragt aus dem Fenster (${(await infoFits(page)).join(', ')})`);
  await shot('18-beet-leer');
  await sowButton.tap();
  await sleep(450);
  const sown = await beetState();
  check(sown.crop === 'leinsamen' && sown.seeds === 0, `Gesät: der Leinsamen aus dem Laden-Lager (${JSON.stringify(sown)})`);
  const growingText = await infoText(page);
  check(growingText.includes('Flachspflanze wächst') && growingText.includes('Reif in etwa'), `Infofenster: wächst, reif in etwa … (${growingText.slice(0, 120)})`);
  check(
    (await infoCard(page))?.caption === 'Wächst gerade' && (await page.locator('#info-body .info-card .fill-bar').count()) === 1,
    'Während es wächst: Kasten „Wächst gerade“ mit Balken',
  );
  const reapButton = page.locator('#info-actions button', { hasText: 'Ernten' });
  check((await reapButton.isVisible()) && (await reapButton.isDisabled()), 'Während es wächst: „🌾 Ernten“ gesperrt');
  check(!(await sowButton.isVisible()), 'Während es wächst: kein Säen-Knopf');
  // 30 Minuten vorspulen (nur dieses Beet, damit der Rest der Fabrik gleich bleibt)
  await game(page, () => {
    window.__game.state.buildings.find((x) => x.type === 'beet').prod.timer = 1799.5;
    window.__game.simulate(1);
  });
  await sleep(500);
  const ripeText = await infoText(page);
  check(ripeText.includes('Reif – Flachspflanze ernten'), `Nach 30 Minuten reif (${ripeText.slice(0, 80)})`);
  check(await page.locator('#toast', { hasText: 'Ein Beet ist reif' }).isVisible(), 'Meldung: „Ein Beet ist reif“');
  check(await reapButton.isEnabled(), 'Reif: „🌾 Ernten: 1 Flachspflanze“');
  const ripeCard = await infoCard(page);
  check(
    ripeCard?.caption === 'Reif zum Ernten' && ripeCard.sub.includes('Ernten legt sie ins Laden-Lager') &&
      (await page.locator('#info-body .fill-bar .fill').evaluate((n) => n.style.width)) === '100%',
    `Reif: Kasten „Reif zum Ernten“, Balken voll (${JSON.stringify(ripeCard)})`,
  );
  await shot('18b-beet-reif');
  await reapButton.tap();
  await sleep(450);
  const reaped = await beetState();
  check(reaped.crop === null && reaped.plants === 1, `Geerntet: Flachspflanze im Laden-Lager, Beet leer (${JSON.stringify(reaped)})`);
  check(
    (await sowButton.isVisible()) && (await sowButton.textContent()).includes('kauft 1 für 1.000'),
    'Danach neu säen – ohne Leinsamen im Lager kauft der Knopf einen für 1.000 Gold',
  );
  check((await infoFits(page)).length === 0, `Beet mit Kaufen-Knopf: nichts ragt aus dem Fenster (${(await infoFits(page)).join(', ')})`);
  // Flachsbreche: Pflanze einlegen wie einen Holzstamm; kaufen kann man Pflanzen nicht
  await tapTile(page, bx + 4, by);
  check((await page.textContent('#info-title')) === 'Erntebank', 'Erntebank (bisher Flachsbreche) antippen zeigt Infofenster');
  await sleep(450);
  const refillButton = page.locator('#info-actions button', { hasText: 'Auffüllen' });
  check((await refillButton.textContent()) === '⏫ Auffüllen: 1 Flachspflanze', `Auffüllen aus dem Laden-Lager (${await refillButton.textContent()})`);
  check((await page.locator('#info-panel button[data-key^="buy:"]').count()) === 0, 'Kein Kaufen-Knopf: Flachspflanzen gibt es nicht beim Händler');
  const bankCard7 = await infoCard(page);
  check(
    bankCard7?.inputs.join() === 'flachspflanze 1' && bankCard7.outputs.join() === 'flachsfaser 50 Flachsfasern' && bankCard7.sub.includes('in 10:00 min'),
    `Grüner Kasten: 1 Flachspflanze → 50 Flachsfasern in 10 Minuten, keine Ringelblume auf Level 7 (${JSON.stringify(bankCard7)})`,
  );
  await refillButton.tap();
  await sleep(450);
  const breche = await game(page, () => {
    const b = window.__game.state.buildings.find((x) => x.type === 'flachsbreche');
    return { loaded: b.prod.loaded, plants: window.__game.state.storage.flachspflanze ?? 0 };
  });
  check(breche.loaded && breche.plants === 0, `Flachspflanze eingelegt (${JSON.stringify(breche)})`);
  check(
    (await refillButton.textContent()) === '⏫ Auffüllen – keine Flachspflanzen im Laden-Lager',
    `Ohne Pflanzen im Lager: „keine Flachspflanzen im Laden-Lager“ (${await refillButton.textContent()})`,
  );
  await shot('18c-flachsbreche');
  // Webstube: nur eine Einstellung, nichts umzustellen
  await tapTile(page, bx + 4, by + 3);
  check((await page.textContent('#info-title')) === 'Webstube', 'Webstube antippen zeigt Infofenster');
  await sleep(450);
  const webCard = await infoCard(page);
  check(
    /^flachsfaser \d+ \/ 5/.test(webCard?.inputs.join() ?? '') && webCard.outputs.join() === 'verband Verband' && (await page.textContent('#info-meta')).includes('Wartet auf Flachsfasern'),
    `Webstube: Flachsfasern (… / 5) → Verband (${JSON.stringify(webCard)})`,
  );
  check((await page.locator('#info-body .recipe-option').count()) === 0, 'Webstube: kein Umstellen (nur Verbände)');
  // Neu säen (kauft einen Leinsamen) – das Beet wächst nachher im Hintergrund weiter
  await tapTile(page, bx, by);
  await sleep(450);
  const goldSow = await game(page, () => (window.__game.state.gold += 1000));
  await sowButton.tap();
  await sleep(200);
  const resown = await beetState();
  check(
    resown.crop === 'leinsamen' && resown.gold >= goldSow - 1000 && resown.gold <= goldSow - 1000 + 200,
    `Neu gesät, Leinsamen für 1.000 Gold gekauft (${goldSow} → ${resown.gold})`,
  );
  await page.tap('#info-close');
  // Händler: Leinsamen ja, Flachspflanze nein
  await page.tap('#btn-shop');
  await sleep(80);
  await page.tap('#modal-content .tab[data-tab="haendler"]');
  await sleep(120);
  const traderText = await page.textContent('#modal-content');
  check(traderText.includes('Leinsamen') && !traderText.includes('Flachspflanze'), 'Händler verkauft Leinsamen, aber keine Flachspflanzen');
  await page.tap('#modal-close');

  // ---------- Level 8: Ringelblume, Erntebank, Kräuterstube (v0.17.0) ----------
  // Aufträge von Level 7 mit dem Test-Knopf, dann aufsteigen (4.000 Gold kommen dazu)
  await page.tap('#btn-level');
  await sleep(150);
  for (let i = 0; i < 4; i++) {
    await page.locator('#modal-content button', { hasText: '🧪 Test: Auftrag erledigen' }).tap();
    await sleep(200);
  }
  const l7done = await page.textContent('#modal-content');
  check(
    l7done.includes('850 / 850') && l7done.includes('Nächstes Level: Level 8 · Der Kräutergarten') && l7done.includes('Kräuterstube') &&
      l7done.includes('Ringelblumensamen beim Händler'),
    'Level 7 erledigt; Level 8 kündigt Kräuterstube und Ringelblumensamen an',
  );
  await game(page, () => (window.__game.state.gold += 4000));
  await sleep(450);
  await page.locator('#modal-content button', { hasText: 'Aufsteigen auf Level 8 · 4.000' }).tap();
  await sleep(150);
  const lvl8 = await game(page, () => ({ level: window.__game.state.shopLevel, seeds: window.__game.state.storage.ringelblumensamen ?? 0 }));
  check(lvl8.level === 8 && lvl8.seeds === 1, `Level 8: 1 Ringelblumensamen gratis (${JSON.stringify(lvl8)})`);
  const lvl8Text = await page.textContent('#modal-content');
  check(lvl8Text.includes('Der Kräutergarten') && lvl8Text.includes('50 Ringelblüten') && lvl8Text.includes('0 / 1.332'), 'Level 8: Agnes möchte 50 Ringelblüten, Erfahrung 0 / 1.332');
  await shot('19-level-8');
  await page.tap('#modal-close');
  await game(page, ([x, y]) => {
    const { camera, TILE } = window.__game;
    camera.x = (x + 0.5) * TILE - camera.viewWidth / camera.zoom / 2;
    camera.y = (y + 0.5) * TILE - camera.viewHeight / camera.zoom / 2;
  }, [bx + 3, by + 4]);
  await game(page, () => {
    const s = window.__game.state.storage;
    s.holzplatte = (s.holzplatte ?? 0) + 20;
    s.steinplatte = (s.steinplatte ?? 0) + 10;
    s.eisenblech = (s.eisenblech ?? 0) + 5;
    s.zahnradwelle = (s.zahnradwelle ?? 0) + 2;
  });
  await page.tap('#btn-build');
  await buildAt('beet', bx, by + 3);
  await buildAt('kraeuterstube', bx, by + 6);
  await page.tap('#build-close');
  await sleep(80);
  const herbs8 = await game(page, () =>
    window.__game.state.buildings.filter((b) => ['beet', 'kraeuterstube'].includes(b.type)).map((b) => `${b.type}@${b.x},${b.y}`),
  );
  check(
    herbs8.includes(`beet@${bx},${by + 3}`) && herbs8.includes(`kraeuterstube@${bx},${by + 6}`),
    `Zweites Beet und Kräuterstube per Touch gebaut (${herbs8.join(', ')})`,
  );
  // Ringelblume säen, reif werden lassen, ernten
  await tapTile(page, bx, by + 3);
  await sleep(450);
  const sowRing = infoButton(page, 'sow:ringelblumensamen');
  const sowLein = infoButton(page, 'sow:leinsamen');
  check((await sowRing.isVisible()) && (await sowLein.isVisible()), 'Leeres Beet auf Level 8: zwei Knöpfe – Leinsamen und Ringelblumensamen');
  const beet8 = await infoCard(page);
  check(
    beet8?.inputs.join() === 'leinsamen 1,ringelblumensamen 1' && beet8.outputs.join() === 'flachspflanze Flachspflanze,ringelblume Ringelblume',
    `Leeres Beet auf Level 8: beide Pflanzen im Kasten (${JSON.stringify(beet8)})`,
  );
  check((await infoFits(page)).length === 0, `Beet auf Level 8: nichts ragt aus dem Fenster (${(await infoFits(page)).join(', ')})`);
  await shot('19a-beet-zwei-samen');
  await sowRing.tap();
  await sleep(450);
  const beet2 = () =>
    game(page, ([x, y]) => {
      const b = window.__game.state.buildings.find((g) => g.type === 'beet' && g.x === x && g.y === y);
      return { crop: b.prod.crop, seeds: window.__game.state.storage.ringelblumensamen ?? 0, plants: window.__game.state.storage.ringelblume ?? 0 };
    }, [bx, by + 3]);
  const sownRing = await beet2();
  check(sownRing.crop === 'ringelblumensamen' && sownRing.seeds === 0, `Ringelblumensamen gesät (${JSON.stringify(sownRing)})`);
  check(!(await sowRing.isVisible()) && !(await sowLein.isVisible()), 'Während es wächst: keine Säen-Knöpfe');
  check((await infoText(page)).includes('Ringelblume wächst'), 'Infofenster: Ringelblume wächst');
  await game(page, ([x, y]) => {
    window.__game.state.buildings.find((g) => g.type === 'beet' && g.x === x && g.y === y).prod.timer = 1799.5;
    window.__game.simulate(1);
  }, [bx, by + 3]);
  await sleep(500);
  await shot('19b-ringelblume-reif');
  await page.locator('#info-actions button', { hasText: 'Ernten: 1 Ringelblume' }).tap();
  await sleep(450);
  const reapedRing = await beet2();
  check(reapedRing.crop === null && reapedRing.plants === 1, `Ringelblume geerntet (${JSON.stringify(reapedRing)})`);
  // Erntebank: Ringelblume zur laufenden Flachspflanze dazulegen (gemischter Vorrat)
  await tapTile(page, bx + 4, by);
  check((await page.textContent('#info-title')) === 'Erntebank', 'Erntebank antippen zeigt Infofenster');
  await sleep(450);
  const loadRing = infoButton(page, 'load:ringelblume');
  check(await loadRing.isEnabled(), 'Erntebank: Knopf „➕ 1 Ringelblume einlegen“');
  await loadRing.tap();
  await sleep(450);
  const bankText = await infoText(page);
  const bankSlots = await page.locator('#info-body .source-slots .item-icon').evaluateAll((list) =>
    list.map((c) => `${c.dataset.item}${c.classList.contains('empty') ? '(leer)' : ''}`),
  );
  check(
    bankText.includes('Vorrat 2 / 3') && bankSlots.join() === 'flachspflanze,ringelblume,flachspflanze(leer)',
    `Erntebank: gemischter Vorrat als Bilder (${bankSlots.join()} – ${bankText.slice(0, 120)})`,
  );
  check((await infoCard(page))?.outputs.join() === 'flachsfaser 50 Flachsfasern', 'Erntebank: der Kasten zeigt, was gerade läuft (Flachs)');
  const bankFit = await infoFits(page);
  check(bankFit.length === 0, `Alle Knöpfe passen ins Infofenster der Erntebank (${bankFit.join(' | ')})`);
  const bankState = await game(page, () => {
    const b = window.__game.state.buildings.find((x) => x.type === 'flachsbreche');
    return { input: b.prod.input, queue: b.prod.queue };
  });
  check(bankState.input === 'flachspflanze' && bankState.queue.join() === 'ringelblume', `Erst die Flachspflanze, dann die Ringelblume (${JSON.stringify(bankState)})`);
  await shot('19c-erntebank');
  // Kräuterstube: zwei Einstellungen
  await tapTile(page, bx, by + 6);
  check((await page.textContent('#info-title')) === 'Kräuterstube', 'Kräuterstube antippen zeigt Infofenster');
  await sleep(450);
  const stubeCard = await infoCard(page);
  check(
    /^verband \d+ \/ 1( ✓)?,ringelbluete \d+ \/ 5/.test(stubeCard?.inputs.join() ?? '') && stubeCard.outputs.join() === 'heilverband Heilverband',
    `Kräuterstube: Verband + Ringelblüten → Heilverband (${JSON.stringify(stubeCard)})`,
  );
  check(
    (await recipeOption(page, 'kraeuterkompresse').getAttribute('aria-label')) === 'Umstellen auf Kräuterkompresse: 10 Flachsfasern + 5 Ringelblüten',
    'Umstellen auf: Kräuterkompresse aus 10 Flachsfasern + 5 Ringelblüten',
  );
  await recipeOption(page, 'kraeuterkompresse').tap();
  await sleep(450);
  const kompCard = await infoCard(page);
  check(
    /^flachsfaser \d+ \/ 10( ✓)?,ringelbluete \d+ \/ 5/.test(kompCard?.inputs.join() ?? '') && kompCard.outputs.join() === 'kraeuterkompresse Kräuterkompresse',
    `Umgestellt: Flachsfasern + Ringelblüten → Kräuterkompresse (${JSON.stringify(kompCard)})`,
  );
  check((await recipeOption(page, 'heilverband').count()) === 1, 'Heilverband steht jetzt unter „Umstellen auf“');
  const kompFit = await infoFits(page);
  check(kompFit.length === 0, `Langer Name „Kräuterkompresse“ passt in den grünen Kasten (${kompFit.join(' | ')})`);
  await shot('19d-kraeuterstube');
  await page.tap('#info-close');
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
  await infoButton(page, 'buy:holzstamm').tap();
  await sleep(80);
  const logBought = await game(page, () => ({ gold: window.__game.state.gold, logs: window.__game.state.storage.holzstamm ?? 0 }));
  check(logBought.logs === 1 && logBought.gold <= goldBeforeLog - 550 + 200, `Holzstamm im Infofenster gekauft (${goldBeforeLog} → ${logBought.gold})`);
  // v0.14.0: Auffüllen – erst der Holzstamm aus dem Laden-Lager, der Rest wird gekauft
  await game(page, () => (window.__game.state.gold += 2000));
  await sleep(450);
  const refillText = await page.locator('#info-actions button', { hasText: 'Auffüllen' }).textContent();
  const beforeRefill = await game(page, () => {
    const b = window.__game.state.buildings.find((x) => x.type === 'holzfaeller');
    return { inside: (b.prod.loaded ? 1 : 0) + b.prod.queued, gold: window.__game.state.gold };
  });
  const toBuy = 3 - beforeRefill.inside - 1;
  check(
    refillText === `⏫ Auffüllen: ${3 - beforeRefill.inside} Holzstämme${toBuy > 0 ? ` · kauft ${toBuy} für ${(toBuy * 550).toLocaleString('de-DE')} 🪙` : ''}`,
    `Knopf sagt, was Auffüllen tut („${refillText}“)`,
  );
  await page.locator('#info-actions button', { hasText: 'Auffüllen' }).tap();
  await sleep(450);
  const refilled = await game(page, () => {
    const b = window.__game.state.buildings.find((x) => x.type === 'holzfaeller');
    return { inside: (b.prod.loaded ? 1 : 0) + b.prod.queued, logs: window.__game.state.storage.holzstamm ?? 0, gold: window.__game.state.gold };
  });
  check(
    refilled.inside === 3 && refilled.logs === 0 && refilled.gold <= beforeRefill.gold - toBuy * 550 + 200,
    `Auffüllen: 3 / 3 Holzstämme im Holzfällerlager (${JSON.stringify(beforeRefill)} → ${JSON.stringify(refilled)})`,
  );
  check((await infoText(page)).includes('Vorrat 3 / 3'), 'Infofenster: Vorrat 3 / 3');
  check((await page.locator('#info-body .source-slots .item-icon.empty').count()) === 0, 'Vorrat voll: alle 3 Bilder voll');
  check(
    (await page.locator('#info-actions button', { hasText: 'Vorrat voll' }).isDisabled()) &&
      (await infoButton(page, 'load:holzstamm').isDisabled()),
    'Bei vollem Vorrat: „Vorrat voll“, Einlegen gesperrt',
  );
  await shot('17b-vorrat-voll');
  await page.tap('#info-close');

  // ---------- Spiel im Hintergrund (v0.14.0) ----------
  // a) 20 Minuten weg (App im Hintergrund): Die Fabrik und die Kunden laufen weiter
  await game(page, () => {
    const st = window.__game.state;
    st.counters.forEach((c, i) => Object.assign(c, i === 0 ? { type: 'holzplatte', count: 10 } : { type: null, count: 0 }));
  });
  const awayBefore = await game(page, () => ({
    gold: window.__game.state.gold,
    remaining: window.__game.state.buildings.find((b) => b.type === 'holzfaeller').prod.remaining,
  }));
  await game(page, () => window.__game.away(20 * 60));
  await page.waitForFunction(() => !window.__game.isCatchingUp(), null, { timeout: 15000 });
  await sleep(150);
  check((await page.textContent('#modal-content h2')) === '👋 Willkommen zurück!', 'Nach 20 Minuten: Fenster „Willkommen zurück“');
  const awayText = await page.textContent('#modal-content');
  check(awayText.includes('Du warst 20 Min. weg') && awayText.includes('Kunden haben'), `Bericht nennt Zeit und Verkäufe (${awayText.slice(0, 160)})`);
  const awayAfter = await game(page, () => ({
    gold: window.__game.state.gold,
    counter: window.__game.state.counters[0].count,
    inside: (() => {
      const b = window.__game.state.buildings.find((x) => x.type === 'holzfaeller');
      return (b.prod.loaded ? 1 : 0) + b.prod.queued;
    })(),
  }));
  check(awayAfter.counter === 0 && awayAfter.gold >= awayBefore.gold + 180, `Kunden haben die Theke leer gekauft (${JSON.stringify(awayAfter)})`);
  check(awayAfter.inside >= 1 && awayAfter.inside <= 2, `Nach 20 Minuten ist mindestens ein Holzstamm verarbeitet (${awayAfter.inside} im Vorrat)`);
  await shot('17c-willkommen-zurueck');
  await page.locator('#modal-content button', { hasText: 'Weiter' }).tap();
  await sleep(120);
  check(!(await page.isVisible('#modal')), '„Weiter“ schließt das Fenster');

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

  // b) Spiel 2 Stunden zu: Beim Öffnen wird nachgerechnet. Den Spielstand
  // dafür auf einer anderen Seite derselben Adresse zurückdatieren – das Spiel
  // selbst speichert beim Schließen den neuesten Stand.
  await page.close();
  const page2 = await context.newPage();
  page2.on('pageerror', (e) => errors.push(e.message));
  page2.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  await page2.goto(`${baseUrl}manifest.webmanifest`);
  const backdated = await page2.evaluate(() => {
    const key = 'erstesspiel-spielstand';
    const data = JSON.parse(localStorage.getItem(key));
    data.savedAt -= 2 * 3600 * 1000;
    localStorage.setItem(key, JSON.stringify(data));
    return data.saveVersion;
  });
  check(backdated === 15, `Spielstand-Version 15 (${backdated})`);
  await page2.goto(baseUrl);
  await waitForGame(page2);
  await page2.waitForFunction(() => !window.__game.isCatchingUp(), null, { timeout: 20000 });
  await sleep(200);
  const loadText = await page2.textContent('#modal-content');
  check(
    (await page2.textContent('#modal-content h2')) === '👋 Willkommen zurück!' && loadText.includes('Du warst 2 Std. weg') && loadText.includes('Leer gelaufen: 1× Holzfällerlager'),
    `Nach 2 Stunden: Bericht beim Öffnen, Holzfällerlager leer gelaufen (${loadText.slice(0, 200)})`,
  );
  const woodAfter = await game(page2, () => {
    const b = window.__game.state.buildings.find((x) => x.type === 'holzfaeller');
    return (b.prod.loaded ? 1 : 0) + b.prod.queued;
  });
  check(woodAfter === 0, 'Nach über 45 Minuten sind alle 3 Holzstämme verarbeitet');
  // v0.16.0: Das Beet ist im Hintergrund reif geworden
  check(loadText.includes('Reif zum Ernten: 1× Beet'), 'Bericht: Reif zum Ernten: 1× Beet');
  const beetAfter = await game(page2, () => {
    const b = window.__game.state.buildings.find((x) => x.type === 'beet');
    return { crop: b.prod.crop, timer: b.prod.timer };
  });
  check(beetAfter.crop === 'leinsamen' && beetAfter.timer === 1800, `Beet im Hintergrund gewachsen (${JSON.stringify(beetAfter)})`);
  await page2.screenshot({ path: path.join(OUT, `${device.name}-17d-willkommen-nach-2-std.png`) });

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
