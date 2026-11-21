// v0.32.0: Grafik-Probe (Tobias, Chat 22: „Ich würde gerne eine kleine
// Grafik-Probe jetzt machen“) – eine eigene Seite mit einer kleinen Fabrik in
// 3D. Geprüft wird hier, was ohne Browser geht: die Fabrik der Probe läuft nach
// den echten Spielregeln, die Seite lädt die richtigen Dateien, three.js liegt
// mit Lizenz im Projekt, das Spiel hat den Menü-Eintrag. Das Aussehen prüft
// der Browser-Test (tests/browser/smoke.cjs).
//
// v0.33.0 (Teil 2): Kenneys Modelle – genau die gebrauchten Dateien liegen im
// Projekt (mit Farbtafel und Lizenz, zusammen klein), jedes verbaute Modell
// steht in der Liste, „Farben: Spiel“ malt die Farbtafel richtig um, und die
// Bänder setzen sich aus den passenden Stücken zusammen.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';

import { simulate } from '../src/core/sim.js';
import { sourceCount } from '../src/core/production.js';
import { warehouseTotal } from '../src/core/warehouse.js';
import { createProbeFactory, keepRunning, PROBE_AREA } from '../src/probe/factory.js';
import { BELT_WIDTH, FACE, GLOW, KENNEY_DIR, MODELS, PALETTES, beltPieces, glowPixels, recolorPixels } from '../src/probe/kenneyParts.js';
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

test('Nur die Probe und der 3D-Test laden three.js – das 2D-Spiel und die Spielregeln nicht', () => {
  // v0.34.0: index.html kennt three.js (für den 3D-Test), lädt es aber nur dort:
  // main.js holt die 3D-Ansicht erst mit import(…), wenn ?ansicht=3d gewählt ist.
  const main = read('src/main.js');
  assert.ok(!/^import [^;]*view3d/m.test(main), 'main.js lädt die 3D-Ansicht nicht beim Start');
  assert.ok(main.includes("await import('./view3d/view3d.js')"), 'main.js lädt die 3D-Ansicht nur im 3D-Test nach');
  for (const file of sourceFiles()) {
    if (file.startsWith('./src/probe/') || file.startsWith('./src/view3d/')) continue;
    assert.ok(!read(file).includes("from 'three'"), `${file} lädt three.js`);
  }
  assert.ok(!read('src/probe/factory.js').includes("from 'three'"), 'die Probe-Fabrik kommt ohne three.js aus');
  assert.ok(!read('src/probe/kenneyParts.js').includes("from 'three'"), 'Modell-Liste, Farbtafeln und Band-Stücke kommen ohne three.js aus');
});

test('Menü ☰ im Spiel: Eintrag „🎨 Grafik-Probe“', () => {
  const html = read('index.html');
  assert.ok(html.includes('id="menu-probe"') && html.includes('🎨 Grafik-Probe'));
  assert.ok(read('src/main.js').includes("location.href = 'grafik-probe.html'"));
});

// ---------- Kenneys Modelle (v0.33.0) ----------

const url = (path) => new URL(`../${path}`, import.meta.url);
const KIT = { FT: 'fantasy-town-kit', CK: 'castle-kit', FK: 'factory-kit' };

test('Kenneys Modelle: genau die gebrauchten Dateien liegen im Projekt, mit Farbtafel und Lizenz', () => {
  assert.deepEqual(readdirSync(url(KENNEY_DIR)).sort(), Object.keys(MODELS).sort());
  for (const [kit, names] of Object.entries(MODELS)) {
    const dir = `${KENNEY_DIR}/${kit}`;
    const files = readdirSync(url(dir)).filter((f) => f.endsWith('.glb'));
    assert.deepEqual(files.sort(), names.map((n) => `${n}.glb`).sort(), kit);
    assert.ok(exists(`${dir}/Textures/colormap.png`), `${kit}: Farbtafel`);
    assert.ok(read(`${dir}/License.txt`).includes('Creative Commons Zero, CC0'), `${kit}: Lizenz`);
  }
});

test('Kenneys Modelle sind klein: zusammen unter 2 MB', () => {
  let bytes = 0;
  const walk = (dir) => {
    for (const name of readdirSync(url(dir))) {
      const path = `${dir}/${name}`;
      const info = statSync(url(path));
      if (info.isDirectory()) walk(path);
      else bytes += info.size;
    }
  };
  walk(KENNEY_DIR);
  assert.ok(bytes < 2 * 1024 * 1024, `${Math.round(bytes / 1024)} KB`);
});

test('Jedes Modell, das die Probe verbaut, steht in der Liste – und jedes Modell der Liste wird verbaut', () => {
  const source = read('src/probe/kenney3d.js');
  const used = new Set([...source.matchAll(/\b(FT|CK|FK), '([a-z-]+)'/g)].map(([, kit, name]) => `${KIT[kit]}/${name}`));
  // Wände und Dächer der Häuser (Fantasy Town Kit) stehen als Namen in house(…)
  // (v0.34.0: außer dem Burgtor des Portals, das aus dem Castle Kit kommt)
  for (const [, name] of source.matchAll(/'((?:wall|roof)[a-z-]*)'/g)) if (!used.has(`castle-kit/${name}`)) used.add(`fantasy-town-kit/${name}`);
  const { state } = createProbeFactory();
  for (const key of Object.keys(state.belts)) for (const p of beltPieces(state, key)) used.add(`factory-kit/${p.name}`);
  const listed = new Set(Object.entries(MODELS).flatMap(([kit, names]) => names.map((n) => `${kit}/${n}`)));
  for (const model of used) assert.ok(listed.has(model), `${model} fehlt in MODELS`);
  for (const model of listed) assert.ok(used.has(model), `${model} wird nicht verbaut`);
});

test('three.js-Lader für die Modelle liegt im Projekt (GLTFLoader mit seinen Hilfsdateien)', () => {
  for (const file of ['loaders/GLTFLoader.js', 'utils/BufferGeometryUtils.js', 'utils/SkeletonUtils.js']) {
    assert.ok(exists(`${PROBE_IMPORTS['three/addons/']}${file}`), `${file} fehlt`);
  }
  assert.ok(read('src/probe/models.js').includes("from 'three/addons/loaders/GLTFLoader.js'"));
});

// Farbtafel 16 × 8 Bildpunkte: jedes Feld 1 × 2 (oben hell, unten dunkel)
function testColormap() {
  const width = 16;
  const height = 8;
  const data = new Uint8ClampedArray(width * height * 4);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      data.set(y % 2 === 0 ? [200, 100, 50, 255] : [100, 50, 25, 255], i);
    }
  }
  const px = (x, y) => [...data.slice((y * width + x) * 4, (y * width + x) * 4 + 4)];
  return { data, width, height, px };
}

test('Farben: Spiel – ein Feld bekommt die Farbe des Reiters, hell und dunkel bleiben, alles andere bleibt', () => {
  const { data, width, height, px } = testColormap();
  recolorPixels(data, width, height, [{ band: 3, cols: [2], color: 'gebäude' }], '#4a5c7c');
  // Feld Spalte 2, Band 3 = Bildpunkte (2, 6) und (2, 7): Eisen-Blau, oben heller als unten
  assert.deepEqual(px(2, 6), [99, 123, 165, 255]);
  assert.deepEqual(px(2, 7), [49, 61, 83, 255]);
  assert.deepEqual(px(3, 6), [200, 100, 50, 255], 'Nachbarspalte bleibt');
  assert.deepEqual(px(2, 4), [200, 100, 50, 255], 'anderes Band bleibt');
});

test('Farben: Spiel – feste Farben und ohne Gebäude (Bäume, Zaun) ein Grau-Braun statt eines Fehlers', () => {
  const a = testColormap();
  recolorPixels(a.data, a.width, a.height, [{ band: 1, cols: [0], color: '#808080' }]);
  assert.deepEqual(a.px(0, 2), [171, 171, 171, 255], 'Grau, oben heller');
  assert.deepEqual(a.px(0, 3), [85, 85, 85, 255], 'Grau, unten dunkler');
  const b = testColormap();
  recolorPixels(b.data, b.width, b.height, [{ band: 3, cols: [0], color: 'gebäude' }], null);
  assert.notDeepEqual(b.px(0, 6), [200, 100, 50, 255]);
});

test('Farbtafeln: Dächer und Maschinen in der Farbe des Reiters, Bänder im Mittelalter aus Holz', () => {
  const fantasy = PALETTES['fantasy-town-kit'].spiel;
  assert.deepEqual(fantasy.find((r) => r.color === 'gebäude'), { band: 3, cols: [0, 1, 2, 3], color: 'gebäude' }, 'rote und grüne Dächer');
  assert.ok(PALETTES['factory-kit'].spiel.some((r) => r.color === 'gebäude' && r.cols.includes(8)), 'blaue Maschinen');
  assert.ok(PALETTES['factory-kit'].holz.length >= 4, 'Holz-Bänder');
  for (const rules of Object.values(PALETTES).flatMap((p) => Object.values(p))) {
    for (const r of rules) {
      assert.ok(r.band >= 0 && r.band <= 3 && r.cols.every((c) => c >= 0 && c <= 15), JSON.stringify(r));
    }
  }
});

test('Am Abend leuchtet nur das Glas der Laternen', () => {
  const { data, width, height, px } = testColormap();
  glowPixels(data, width, height, GLOW['fantasy-town-kit']);
  assert.deepEqual(px(5, 4), [255, 210, 122, 255]);
  assert.deepEqual(px(5, 5), [255, 210, 122, 255]);
  assert.deepEqual(px(4, 4), [0, 0, 0, 255]);
  assert.deepEqual(px(5, 6), [0, 0, 0, 255]);
});

test('Bänder aus Kenney-Stücken: gerade Strecken mit runden Enden an Gebäuden, der Abzweig am Lagerhaus aus drei Armen', () => {
  const { state, origin } = createProbeFactory();
  const at = (x, y) => beltPieces(state, `${origin.x + x},${origin.y + y}`);
  const names = (pieces) => pieces.map((p) => p.name.replace('conveyor-long-part-', ''));
  assert.deepEqual(names(at(3, 2)), ['end', 'middle'], 'Anfang am Holzfällerlager: rund im Westen');
  assert.deepEqual(at(3, 2).map((p) => p.rot), [FACE.W, FACE.E]);
  assert.deepEqual(names(at(6, 2)), ['middle', 'middle'], 'Mitte der Strecke');
  assert.deepEqual(names(at(8, 2)), ['middle', 'end'], 'Ende am Sägewerk: rund im Osten');
  assert.deepEqual(names(at(5, 1)), ['end', 'middle'], 'vom Lagerhaus nach Süden: oben rund');
  assert.deepEqual(at(5, 1).map((p) => p.rot), [FACE.N, FACE.S]);
  const junction = at(5, 2);
  assert.deepEqual(junction.map((p) => p.rot).sort(), [FACE.W, FACE.N, FACE.E].sort(), 'Abzweig: Arme nach Westen, Norden, Osten');
  for (const arm of junction) {
    assert.equal(arm.name, 'conveyor-long-part-middle');
    assert.equal(arm.len, (0.5 + BELT_WIDTH / 2) / 0.5, 'jeder Arm reicht vom Rand bis über die Mitte');
  }
  assert.deepEqual(names(at(13, 6)), ['middle', 'end'], 'Glas-Straße endet rund am Versandportal');
});
