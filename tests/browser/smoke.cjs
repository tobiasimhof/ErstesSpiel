// Browser-Test: startet einen kleinen Webserver, öffnet das Spiel in
// Tablet- und Handygröße (Querformat) sowie im Hochformat und spielt die
// wichtigsten Funktionen per Touch durch. Screenshots landen im Ordner aus
// SCREENSHOT_DIR (Standard: test-output/).
//
// Aufruf: node tests/browser/smoke.cjs (ONLY=3d davor: nur der 3D-Test, ONLY=2d: nur die echte Fabrik)
// Teile: helpers.cjs (gemeinsame Hilfen), spiel2d.cjs (2D), spiel3d.cjs (3D).

const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');

const { DEVICES, OUT, ROOT, startServer, summary } = require('./helpers.cjs');
const { runDevice, runPortrait, runNarrowPhone } = require('./spiel2d.cjs');
const { run3d } = require('./spiel3d.cjs');

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const versionSource = fs.readFileSync(path.join(ROOT, 'src', 'version.js'), 'utf8');
  const expectedVersion = versionSource.match(/VERSION = '([^']+)'/)[1];

  const server = await startServer();
  const baseUrl = `http://127.0.0.1:${server.address().port}/`;
  const browser = await chromium.launch();
  try {
    // v0.34.0: ONLY=3d prüft nur den 3D-Test (schneller beim Entwickeln)
    if (process.env.ONLY !== '3d') {
      for (const device of DEVICES) await runDevice(browser, baseUrl, device, expectedVersion);
      await runPortrait(browser, baseUrl);
      await runNarrowPhone(browser, baseUrl);
    }
    // v0.41.0: ONLY=2d prüft nur die echte Fabrik
    if (process.env.ONLY !== '2d') for (const device of DEVICES) await run3d(browser, baseUrl, device);
  } finally {
    await browser.close();
    server.close();
  }

  const { failures, failed } = summary();
  console.log(failures === 0 ? '\nAlle Browser-Prüfungen bestanden.' : `\n${failures} Prüfung(en) fehlgeschlagen:\n  - ${failed.join('\n  - ')}`);
  console.log(`Screenshots: ${OUT}`);
  process.exit(failures === 0 ? 0 : 1);
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
