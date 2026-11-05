// Browser-Test: startet einen kleinen Webserver, öffnet das Spiel in
// Tablet- und Handygröße (Querformat) sowie im Hochformat und prüft die
// wichtigsten Funktionen. Screenshots landen im Ordner aus SCREENSHOT_DIR
// (Standard: test-output/).
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

async function screenToCanvas(page, wx, wy) {
  return page.evaluate(
    ([x, y]) => {
      const { camera } = window.__game;
      const rect = document.getElementById('game').getBoundingClientRect();
      return { x: rect.left + (x - camera.x) * camera.zoom, y: rect.top + (y - camera.y) * camera.zoom };
    },
    [wx, wy],
  );
}

async function centerOfBuilding(page, type) {
  const world = await page.evaluate((t) => {
    const { state, TILE } = window.__game;
    const b = state.buildings.find((x) => x.type === t);
    const sizes = { laden: 3, holzfaeller: 2, steinbruch: 2 };
    return { x: (b.x + sizes[t] / 2) * TILE, y: (b.y + sizes[t] / 2) * TILE };
  }, type);
  return screenToCanvas(page, world.x, world.y);
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
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));

  await page.goto(baseUrl);
  await page.waitForFunction(() => window.__game && window.__game.camera.viewWidth > 0);
  await page.waitForTimeout(200);

  check((await page.textContent('#hud-version')) === `v${expectedVersion}`, `Versionsnummer v${expectedVersion} sichtbar`);
  check((await page.textContent('#hud-gold')).trim().length > 0, 'Gold wird angezeigt');
  check(!(await page.isVisible('#rotate-overlay')), 'Kein Dreh-Hinweis im Querformat');

  // Ganzes Grundstück sichtbar?
  const plot = await page.evaluate(() => {
    const { state, TILE } = window.__game;
    const p = state.plot;
    return { x: p.x * TILE, y: p.y * TILE, w: p.width * TILE, h: p.height * TILE };
  });
  const tl = await screenToCanvas(page, plot.x, plot.y);
  const br = await screenToCanvas(page, plot.x + plot.w, plot.y + plot.h);
  const canvasBox = await page.locator('#game').boundingBox();
  check(
    tl.x >= canvasBox.x - 1 &&
      tl.y >= canvasBox.y - 1 &&
      br.x <= canvasBox.x + canvasBox.width + 1 &&
      br.y <= canvasBox.y + canvasBox.height + 1,
    'Ganzes Grundstück beim Start sichtbar',
  );

  await page.screenshot({ path: path.join(OUT, `${device.name}-start.png`) });

  // Antippen des Ladens öffnet das Infofenster
  const laden = await centerOfBuilding(page, 'laden');
  await page.touchscreen.tap(laden.x, laden.y);
  await page.waitForTimeout(100);
  check(await page.isVisible('#info-panel'), 'Antippen des Ladens öffnet Infofenster');
  check((await page.textContent('#info-title')) === 'Laden', 'Infofenster zeigt „Laden“');
  await page.screenshot({ path: path.join(OUT, `${device.name}-info.png`) });

  // Antippen des Holzfällerlagers wechselt die Auswahl
  const holz = await centerOfBuilding(page, 'holzfaeller');
  await page.touchscreen.tap(holz.x, holz.y);
  await page.waitForTimeout(100);
  check((await page.textContent('#info-title')) === 'Holzfällerlager', 'Infofenster wechselt zum Holzfällerlager');

  // Schließen-Knopf
  await page.tap('#info-close');
  check(!(await page.isVisible('#info-panel')), 'Schließen-Knopf schließt Infofenster');

  // Gesperrte Fläche antippen (Feld direkt links neben dem Grundstück)
  const locked = await screenToCanvas(page, plot.x - 12, plot.y + plot.h / 2);
  check(locked.x > canvasBox.x, 'Gesperrte Fläche neben dem Grundstück ist sichtbar');
  await page.touchscreen.tap(locked.x, locked.y);
  await page.waitForTimeout(100);
  check((await page.textContent('#info-title')) === 'Gesperrte Fläche', 'Antippen gesperrter Fläche zeigt Hinweis');

  // Antippen freier Fläche schließt das Infofenster
  const free = await screenToCanvas(page, plot.x + plot.w / 2, plot.y + 24);
  await page.touchscreen.tap(free.x, free.y);
  await page.waitForTimeout(100);
  check(!(await page.isVisible('#info-panel')), 'Antippen freier Fläche schließt Infofenster');

  // Zoomen mit zwei Fingern (über die Chrome-Schnittstelle für echte Touch-Ereignisse)
  const cdp = await context.newCDPSession(page);
  const cx = canvasBox.x + canvasBox.width / 2;
  const cy = canvasBox.y + canvasBox.height / 2;
  const zoomBefore = await page.evaluate(() => window.__game.camera.zoom);
  await cdp.send('Input.dispatchTouchEvent', {
    type: 'touchStart',
    touchPoints: [
      { x: cx - 40, y: cy, id: 1 },
      { x: cx + 40, y: cy, id: 2 },
    ],
  });
  for (let step = 1; step <= 8; step++) {
    await cdp.send('Input.dispatchTouchEvent', {
      type: 'touchMove',
      touchPoints: [
        { x: cx - 40 - step * 10, y: cy, id: 1 },
        { x: cx + 40 + step * 10, y: cy, id: 2 },
      ],
    });
  }
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await page.waitForTimeout(100);
  const zoomAfter = await page.evaluate(() => window.__game.camera.zoom);
  check(zoomAfter > zoomBefore * 1.3, `Zwei-Finger-Zoom vergrößert (${zoomBefore.toFixed(2)} → ${zoomAfter.toFixed(2)})`);
  check(!(await page.isVisible('#info-panel')), 'Zoomen öffnet kein Infofenster');

  // Verschieben mit einem Finger
  const camBefore = await page.evaluate(() => ({ ...window.__game.camera }));
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: cx, y: cy, id: 3 }] });
  for (let step = 1; step <= 8; step++) {
    await cdp.send('Input.dispatchTouchEvent', {
      type: 'touchMove',
      touchPoints: [{ x: cx - step * 15, y: cy - step * 5, id: 3 }],
    });
  }
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await page.waitForTimeout(100);
  const camAfter = await page.evaluate(() => ({ ...window.__game.camera }));
  check(camAfter.x > camBefore.x, 'Ein-Finger-Ziehen verschiebt die Karte');
  check(!(await page.isVisible('#info-panel')), 'Ziehen öffnet kein Infofenster');
  check(await page.evaluate(() => document.getElementById('hint').classList.contains('hidden')), 'Bedienhinweis verschwindet nach Benutzung');

  // Mausrad (PC)
  const zoomBeforeWheel = await page.evaluate(() => window.__game.camera.zoom);
  await page.mouse.move(cx, cy);
  await page.mouse.wheel(0, 300);
  await page.waitForTimeout(100);
  const zoomAfterWheel = await page.evaluate(() => window.__game.camera.zoom);
  check(zoomAfterWheel < zoomBeforeWheel, 'Mausrad zoomt heraus');

  await page.screenshot({ path: path.join(OUT, `${device.name}-nach-zoom.png`) });

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
