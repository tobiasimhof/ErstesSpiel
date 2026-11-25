// Browser-Test: startet einen kleinen Webserver, öffnet das Spiel in
// Tablet- und Handygröße (Querformat) sowie im Hochformat und spielt die
// wichtigsten Funktionen per Touch durch. Screenshots landen im Ordner aus
// SCREENSHOT_DIR (Standard: test-output/).
//
// Aufruf: node tests/browser/smoke.cjs (ONLY=fabrik davor: nur das Durchspielen bis Level 14,
// ONLY=3d: nur die 3D-Ansicht, ONLY=einfuehrung: nur Hildes Einführung)
// Teile: helpers.cjs (gemeinsame Hilfen), fabrik.cjs (Durchspielen, Hochformat, schmales Handy),
// spiel3d.cjs (3D-Ansicht), einfuehrung.cjs (Hilde). Seit v0.54.0 alles im 3D-Spiel.

const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');

const { DEVICES, OUT, ROOT, startServer, summary } = require('./helpers.cjs');
const { runDevice, runPortrait, runNarrowPhone } = require('./fabrik.cjs');
const { run3d } = require('./spiel3d.cjs');
const { runTutorial } = require('./einfuehrung.cjs');

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const versionSource = fs.readFileSync(path.join(ROOT, 'src', 'version.js'), 'utf8');
  const expectedVersion = versionSource.match(/VERSION = '([^']+)'/)[1];

  const server = await startServer();
  const baseUrl = `http://127.0.0.1:${server.address().port}/`;
  const browser = await chromium.launch();
  try {
    const only = process.env.ONLY;
    // ONLY=fabrik | 3d | einfuehrung prüft nur diesen Teil (schneller beim Entwickeln)
    if (!only || only === 'fabrik') {
      for (const device of DEVICES) await runDevice(browser, baseUrl, device, expectedVersion);
      await runPortrait(browser, baseUrl);
      await runNarrowPhone(browser, baseUrl);
    }
    if (!only || only === '3d') for (const device of DEVICES) await run3d(browser, baseUrl, device, expectedVersion);
    // v0.52.0: Einführung mit Hilde
    if (!only || only === 'einfuehrung') for (const device of DEVICES) await runTutorial(browser, baseUrl, device);
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
