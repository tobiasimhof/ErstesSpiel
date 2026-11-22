// Kenneys Modelle im 3D-Test (seit v0.37.0; vorher in der Grafik-Probe,
// v0.32.0/v0.33.0): genau die gebrauchten Dateien liegen im Projekt (mit
// Farbtafel und Lizenz, zusammen klein), jedes verbaute Modell steht in der
// Liste, die Farbtafeln werden richtig umgefärbt, die Bänder setzen sich aus
// den passenden Stücken zusammen, three.js liegt mit Lizenz im Projekt und nur
// der 3D-Test lädt es. Das Aussehen prüft der Browser-Test (tests/browser/).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';

import { applyBeltPath, buildBeltPath, extendTrace } from '../src/core/belts.js';
import { placeBuilding } from '../src/core/buildings.js';
import { createNewGame } from '../src/core/state.js';
import { BELT_WIDTH, FACE, KENNEY_DIR, MODELS, PALETTES, beltPieces, recolorPixels } from '../src/view3d/kenneyParts.js';
import { THREE_IMPORTS, sourceFiles } from '../tools/set-version.mjs';

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const exists = (path) => existsSync(new URL(`../${path}`, import.meta.url));

// Eine kleine Fabrik zum Prüfen der Band-Stücke (wie früher in der
// Grafik-Probe; Felder relativ zum Grundstück): Holzfällerlager (1,2) →
// Sägewerk (9,2) → Versandportal (14,2), dazu ein Lagerhaus (4,0), das von
// oben auf das Band liefert; Ofen (1,6) → Schmiede (9,6) → Versandportal (14,6).
function smallFactory() {
  const state = createNewGame(7);
  state.buildings = [];
  state.belts = {};
  state.shopLevel = 13;
  const ox = state.plot.x;
  const oy = state.plot.y;
  const at = (type, x, y) => placeBuilding(state, type, ox + x, oy + y, 0);
  const belt = (points) => {
    let trace = [];
    for (const [x, y] of points) trace = extendTrace(trace, { x: ox + x, y: oy + y });
    applyBeltPath(state, buildBeltPath(state, trace));
  };
  at('holzfaeller', 1, 2);
  at('lagerhaus', 4, 0);
  at('saegewerk', 9, 2);
  at('versandportal', 14, 2);
  belt([[3, 2], [8, 2]]);
  belt([[5, 1], [5, 2]]);
  belt([[11, 2], [13, 2]]);
  at('kohlenmeiler', 1, 6);
  at('schmiede', 9, 6);
  at('versandportal', 14, 6);
  belt([[3, 6], [8, 6]]);
  belt([[11, 6], [13, 6]]);
  return { state, origin: { x: ox, y: oy } };
}

// ---------- three.js ----------

test('three.js liegt mit Lizenz im Projekt (Version im Ordnernamen)', () => {
  assert.ok(THREE_IMPORTS.three.includes('three-0.187.0'));
  for (const path of [THREE_IMPORTS.three, './vendor/three-0.187.0/build/three.core.js']) {
    assert.ok(exists(path), `${path} fehlt`);
  }
  assert.ok(read('vendor/three-0.187.0/LICENSE').includes('The MIT License'));
});

test('Nur der 3D-Test lädt three.js – das 2D-Spiel und die Spielregeln nicht', () => {
  // index.html kennt three.js (für den 3D-Test), lädt es aber nur dort:
  // main.js holt die 3D-Ansicht erst mit import(…), wenn ?ansicht=3d gewählt ist.
  const main = read('src/main.js');
  assert.ok(!/^import [^;]*view3d/m.test(main), 'main.js lädt die 3D-Ansicht nicht beim Start');
  assert.ok(main.includes("await import('./view3d/view3d.js')"), 'main.js lädt die 3D-Ansicht nur im 3D-Test nach');
  for (const file of sourceFiles()) {
    if (file.startsWith('./src/view3d/')) continue;
    assert.ok(!read(file).includes("from 'three'"), `${file} lädt three.js`);
  }
  assert.ok(!read('src/view3d/kenneyParts.js').includes("from 'three'"), 'Modell-Liste, Farbtafeln und Band-Stücke kommen ohne three.js aus');
});

test('Die Grafik-Probe ist entfernt (v0.37.0) – kein Menü-Eintrag, keine eigene Seite', () => {
  assert.ok(!exists('grafik-probe.html'));
  assert.ok(!exists('src/probe'));
  assert.ok(!read('index.html').includes('menu-probe'));
  assert.ok(!read('src/main.js').includes('grafik-probe'));
});

// ---------- Kenneys Modelle ----------

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

test('Kenneys Modelle sind klein: zusammen unter 1 MB', () => {
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
  assert.ok(bytes < 1024 * 1024, `${Math.round(bytes / 1024)} KB`);
});

test('Jedes Modell, das der 3D-Test verbaut, steht in der Liste – und jedes Modell der Liste wird verbaut', () => {
  const houses = read('src/view3d/kenney3d.js');
  const used = new Set([...houses.matchAll(/\b(FT|CK|FK), '([a-z-]+)'/g)].map(([, kit, name]) => `${KIT[kit]}/${name}`));
  // Wände und Dächer der Häuser (Fantasy Town Kit) stehen als Namen in house(…)
  // (außer dem Burgtor des Portals, das aus dem Castle Kit kommt)
  for (const [, name] of houses.matchAll(/'((?:wall|roof)[a-z-]*)'/g)) if (!used.has(`castle-kit/${name}`)) used.add(`fantasy-town-kit/${name}`);
  // Zaun, Bäume und Felsen setzt die 3D-Welt selbst (scene3d.js)
  for (const [, kit, name] of read('src/view3d/scene3d.js').matchAll(/'(fantasy-town-kit|castle-kit|factory-kit)', '([a-z-]+)'/g)) used.add(`${kit}/${name}`);
  const { state } = smallFactory();
  for (const key of Object.keys(state.belts)) for (const p of beltPieces(state, key)) used.add(`factory-kit/${p.name}`);
  const listed = new Set(Object.entries(MODELS).flatMap(([kit, names]) => names.map((n) => `${kit}/${n}`)));
  for (const model of used) assert.ok(listed.has(model), `${model} fehlt in MODELS`);
  for (const model of listed) assert.ok(used.has(model), `${model} wird nicht verbaut`);
});

test('three.js-Lader für die Modelle liegt im Projekt (GLTFLoader mit seinen Hilfsdateien)', () => {
  for (const file of ['loaders/GLTFLoader.js', 'utils/BufferGeometryUtils.js', 'utils/SkeletonUtils.js']) {
    assert.ok(exists(`${THREE_IMPORTS['three/addons/']}${file}`), `${file} fehlt`);
  }
  assert.ok(read('src/view3d/models.js').includes("from 'three/addons/loaders/GLTFLoader.js'"));
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

test('Farbtafeln: Dächer in der Farbe des Reiters, Bänder aus Holz', () => {
  const fantasy = PALETTES['fantasy-town-kit'].spiel;
  assert.deepEqual(fantasy.find((r) => r.color === 'gebäude'), { band: 3, cols: [0, 1, 2, 3], color: 'gebäude' }, 'rote und grüne Dächer');
  assert.ok(PALETTES['factory-kit'].holz.length >= 4, 'Holz-Bänder');
  for (const rules of Object.values(PALETTES).flatMap((p) => Object.values(p))) {
    for (const r of rules) {
      assert.ok(r.band >= 0 && r.band <= 3 && r.cols.every((c) => c >= 0 && c <= 15), JSON.stringify(r));
    }
  }
});

test('Bänder aus Kenney-Stücken: gerade Strecken mit runden Enden an Gebäuden, der Abzweig am Lagerhaus aus drei Armen', () => {
  const { state, origin } = smallFactory();
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
