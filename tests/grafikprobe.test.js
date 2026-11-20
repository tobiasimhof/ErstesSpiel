// v0.32.0: Grafik-Probe (Tobias, Chat 22: „Ich würde gerne eine kleine
// Grafik-Probe jetzt machen“) – eine eigene Seite mit einer kleinen Fabrik in
// 3D. Geprüft wird hier, was ohne Browser geht: die Fabrik der Probe läuft nach
// den echten Spielregeln, die Seite lädt die richtigen Dateien, three.js liegt
// mit Lizenz im Projekt, das Spiel hat den Menü-Eintrag. Das Aussehen prüft
// der Browser-Test (tests/browser/smoke.cjs).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

import { simulate } from '../src/core/sim.js';
import { sourceCount } from '../src/core/production.js';
import { warehouseTotal } from '../src/core/warehouse.js';
import { createProbeFactory, keepRunning, PROBE_AREA } from '../src/probe/factory.js';
import { VERSION } from '../src/version.js';
import { PROBE_IMPORTS, sourceFiles } from '../tools/set-version.mjs';

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const exists = (path) => existsSync(new URL(`../${path}`, import.meta.url));

// ---------- Die Fabrik der Probe ----------

test('Probe-Fabrik: Holz- und Glas-Straße auf Level 13, alles innerhalb des Ausschnitts', () => {
  const { state, origin } = createProbeFactory();
  assert.equal(state.shopLevel, 13);
  assert.deepEqual(
    state.buildings.map((b) => `${b.type}@${b.x - origin.x},${b.y - origin.y}`),
    ['holzfaeller@1,2', 'lagerhaus@4,0', 'saegewerk@9,2', 'versandportal@14,2', 'kohlenmeiler@1,6', 'schmiede@9,6', 'versandportal@14,6'],
  );
  assert.equal(state.buildings.find((b) => b.type === 'saegewerk').prod.recipe, 'holzplatte');
  assert.equal(state.buildings.find((b) => b.type === 'schmiede').prod.recipe, 'flaeschchen');
  for (const key of Object.keys(state.belts)) {
    const [x, y] = key.split(',').map(Number);
    assert.ok(x - origin.x >= 0 && x - origin.x < PROBE_AREA.width && y - origin.y >= 0 && y - origin.y < PROBE_AREA.height, `Band ${key} im Ausschnitt`);
  }
  assert.ok(Object.keys(state.belts).length >= 15);
});

test('Probe-Fabrik läuft nach den echten Spielregeln: in 5 Minuten Holzplatten und Fläschchen', () => {
  const { state } = createProbeFactory();
  const shipped = {};
  for (let i = 0; i < 60; i++) {
    simulate(state, 5);
    for (const [type, n] of Object.entries(state.storage)) shipped[type] = (shipped[type] ?? 0) + n;
    keepRunning(state);
  }
  assert.ok(shipped.holzplatte >= 40, `Holzplatten: ${shipped.holzplatte}`);
  assert.ok(shipped.flaeschchen >= 3, `Fläschchen: ${shipped.flaeschchen}`);
  assert.ok(Object.values(state.belts).some((b) => b.item?.type === 'holzblock'), 'Holzblöcke liegen auf dem Band');
});

test('keepRunning legt Holzstämme und Sand nach, füllt das Lagerhaus und leert das Laden-Lager', () => {
  const { state } = createProbeFactory();
  simulate(state, 1000);
  state.storage = { holzplatte: 999 };
  keepRunning(state);
  const by = (type) => state.buildings.find((b) => b.type === type);
  assert.equal(sourceCount(by('holzfaeller')), 3);
  assert.equal(sourceCount(by('kohlenmeiler')), 3);
  assert.equal(by('kohlenmeiler').prod.input, 'sand');
  assert.equal(warehouseTotal(by('lagerhaus')), 150);
  assert.deepEqual(state.storage, {}, 'das Laden-Lager läuft nie voll');
});

// ---------- Die Seite ----------

test('grafik-probe.html: Import-Map mit allen Spieldateien (aktuelle Version) und three.js', () => {
  const html = read('grafik-probe.html');
  const block = html.match(/<script type="importmap">([\s\S]*?)<\/script>/);
  assert.ok(block, 'keine Import-Map');
  const { imports } = JSON.parse(block[1]);
  for (const file of sourceFiles()) assert.equal(imports[file], `${file}?v=${VERSION}`, file);
  for (const [name, target] of Object.entries(PROBE_IMPORTS)) assert.equal(imports[name], target, name);
  assert.ok(html.includes(`src/probe/probe.js?v=${VERSION}`), 'lädt probe.js mit der aktuellen Version');
  assert.ok(html.indexOf('type="importmap"') < html.indexOf('type="module"'));
  assert.ok(html.includes('href="index.html"'), 'Knopf zurück ins Spiel');
});

test('three.js liegt mit Lizenz im Projekt (Version im Ordnernamen)', () => {
  assert.ok(PROBE_IMPORTS.three.includes('three-0.187.0'));
  for (const path of [PROBE_IMPORTS.three, `${PROBE_IMPORTS['three/addons/']}controls/OrbitControls.js`, './vendor/three-0.187.0/build/three.core.js']) {
    assert.ok(exists(path), `${path} fehlt`);
  }
  assert.ok(read('vendor/three-0.187.0/LICENSE').includes('The MIT License'));
});

test('Nur die Probe lädt three.js – das Spiel und die Spielregeln nicht', () => {
  const game = read('index.html');
  assert.ok(!game.includes('"three"'), 'index.html kennt three.js nicht');
  for (const file of sourceFiles()) {
    if (file.startsWith('./src/probe/')) continue;
    assert.ok(!read(file).includes("from 'three'"), `${file} lädt three.js`);
  }
  assert.ok(!read('src/probe/factory.js').includes("from 'three'"), 'die Probe-Fabrik kommt ohne three.js aus');
});

test('Menü ☰ im Spiel: Eintrag „🎨 Grafik-Probe“', () => {
  const html = read('index.html');
  assert.ok(html.includes('id="menu-probe"') && html.includes('🎨 Grafik-Probe'));
  assert.ok(read('src/main.js').includes("location.href = 'grafik-probe.html'"));
});
