// v0.21.0: Maschinen zeigen auf der Karte, was sie herstellen (Tobias, Chat 15/16:
// „Variante B“, ohne Gebäudebild, Farbe je Reiter). Wie es aussieht, prüft der
// Browser-Test mit Screenshots; hier, WAS ein Gebäude zeigt, die Farben und
// der sichtbare Ausschnitt (nur zeichnen, was im Bild ist).
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { placeBuilding } from '../src/core/buildings.js';
import { BUILDINGS, BUILD_ALWAYS, BUILD_TABS, TAB_COLORS } from '../src/core/data/buildings.js';
import { RECIPES } from '../src/core/data/recipes.js';
import { addRawToSource, productionOf, setRecipe, updateProduction } from '../src/core/production.js';
import { createNewGame } from '../src/core/state.js';
import { buildingFace } from '../src/view/buildingFace.js';
import { createCamera, intersects, setViewSize, visibleRect } from '../src/view/camera.js';

function level8() {
  const state = createNewGame(21);
  state.buildings = [];
  state.belts = {};
  state.storage = {};
  state.shopLevel = 8;
  return state;
}

test('Maschinen zeigen das Produkt ihrer Einstellung, jede Einstellung', () => {
  const state = level8();
  for (const [type, def] of Object.entries(BUILDINGS)) {
    if (def.production.kind !== 'workshop') continue;
    const b = placeBuilding(state, type, 10, 6);
    for (const recipe of def.production.recipes) {
      assert.ok(setRecipe(b, recipe));
      const face = buildingFace(b);
      assert.equal(face.kind, 'product', type);
      assert.equal(face.item, RECIPES[recipe].output, `${type} / ${recipe}`);
      assert.equal(face.faded, false, `${type}: Maschinen zeigen ihr Produkt immer klar`);
      assert.equal(face.dots, null);
    }
    state.buildings = [];
  }
});

test('Maschine: Ring zeigt den Fortschritt des laufenden Stücks', () => {
  const state = level8();
  const saw = placeBuilding(state, 'saegewerk', 10, 6);
  setRecipe(saw, 'holzstab');
  assert.equal(buildingFace(saw).ring, 0, 'wartet: leerer Ring');
  saw.prod.stock.holzblock = 5;
  updateProduction(state, saw, 0); // fängt an
  updateProduction(state, saw, RECIPES.holzstab.time / 2);
  assert.ok(Math.abs(buildingFace(saw).ring - 0.5) < 1e-9, 'halb fertig: halber Ring');
  updateProduction(state, saw, RECIPES.holzstab.time / 2);
  assert.equal(buildingFace(saw).ring, 1, 'fertiges Stück wartet am Ausgang: voller Ring');
});

test('Kombi-Maschine wartet: gelbes „?“-Schild mit den fehlenden Zutaten', () => {
  const state = level8();
  const z = placeBuilding(state, 'zimmerei', 10, 6);
  setRecipe(z, 'raederwerk'); // 10 Stein-Zahnräder + 5 Holzstäbe
  assert.deepEqual(buildingFace(z).missing, ['steinzahnrad', 'holzstab']);
  z.prod.stock.steinzahnrad = 10;
  assert.deepEqual(buildingFace(z).missing, ['holzstab']);
  z.prod.stock.holzstab = 5;
  updateProduction(state, z, 0.1);
  assert.deepEqual(buildingFace(z).missing, [], 'arbeitet: kein Schild');
  // Grundmaschinen mit nur einer Zutat zeigen kein Schild
  const saw = placeBuilding(state, 'saegewerk', 14, 6);
  assert.deepEqual(buildingFace(saw).missing, []);
});

test('Rohstoff-Gebäude: leer blass, gefüllt klar, Ring = was vom laufenden Rohstoff übrig ist, Punkte = Vorrat', () => {
  const state = level8();
  const lager = placeBuilding(state, 'holzfaeller', 10, 6);
  let face = buildingFace(lager);
  assert.deepEqual(
    { item: face.item, faded: face.faded, ring: face.ring, dots: face.dots },
    { item: 'holzblock', faded: true, ring: 0, dots: { capacity: 3, filled: 0 } },
  );
  addRawToSource(lager);
  addRawToSource(lager);
  face = buildingFace(lager);
  assert.equal(face.faded, false);
  assert.equal(face.ring, 1, 'frischer Holzstamm: voller Ring');
  assert.deepEqual(face.dots, { capacity: 3, filled: 2 });
  const p = productionOf('holzfaeller');
  lager.prod.remaining = p.amount / 4;
  assert.equal(buildingFace(lager).ring, 0.25);
  for (const type of ['steinbruch', 'schmelzhuette']) {
    const b = placeBuilding(state, type, 14 + (type === 'steinbruch' ? 0 : 4), 6);
    assert.equal(buildingFace(b).item, productionOf(type).output, type);
  }
});

test('Erntebank zeigt die Ware der Pflanze, die gerade läuft', () => {
  const state = level8();
  const bank = placeBuilding(state, 'flachsbreche', 10, 6);
  assert.deepEqual([buildingFace(bank).item, buildingFace(bank).faded], ['flachsfaser', true], 'leer: blass');
  addRawToSource(bank, 'ringelblume');
  addRawToSource(bank, 'flachspflanze');
  assert.deepEqual([buildingFace(bank).item, buildingFace(bank).faded], ['ringelbluete', false]);
  // Ringelblume fertig verarbeitet → die Flachspflanze ist dran
  bank.prod.remaining = 1;
  bank.prod.timer = 0;
  updateProduction(state, bank, productionOf('flachsbreche').duration / productionOf('flachsbreche').amount);
  assert.equal(buildingFace(bank).item, 'flachsfaser');
});

test('Lagerhaus zeigt die Waren seiner Fächer (0 bis 3, jede Sorte einmal)', () => {
  const state = level8();
  const lager = placeBuilding(state, 'lagerhaus', 10, 6);
  assert.deepEqual(buildingFace(lager), { kind: 'storage', items: [] }, 'leer: 📦');
  lager.prod.slots = [{ type: 'holzplatte', count: 50 }];
  assert.deepEqual(buildingFace(lager).items, ['holzplatte']);
  lager.prod.slots = [
    { type: 'holzplatte', count: 50 },
    { type: 'holzplatte', count: 3 },
    { type: 'eisenstange', count: 4 },
  ];
  assert.deepEqual(buildingFace(lager).items, ['holzplatte', 'eisenstange']);
  lager.prod.slots = [
    { type: 'holzplatte', count: 1 },
    { type: 'holzstab', count: 2 },
    { type: 'eisenstange', count: 3 },
  ];
  assert.deepEqual(buildingFace(lager).items, ['holzplatte', 'holzstab', 'eisenstange']);
});

test('Beet und Versandportal behalten ihr Aussehen', () => {
  const state = level8();
  assert.equal(buildingFace(placeBuilding(state, 'beet', 10, 6)).kind, 'garden');
  assert.equal(buildingFace(placeBuilding(state, 'versandportal', 14, 6)).kind, 'icon');
});

test('Vorschau beim Platzieren (noch ohne Zustand): Produkt der ersten Einstellung, ohne Ring und Schild', () => {
  const ghost = { type: 'zimmerei', x: 0, y: 0, rot: 0 };
  assert.deepEqual(buildingFace(ghost), {
    kind: 'product',
    item: 'zahnradwelle',
    faded: false,
    ring: null,
    missing: [],
    dots: null,
  });
  const source = buildingFace({ type: 'steinbruch', x: 0, y: 0, rot: 1 });
  assert.equal(source.item, 'steinblock');
  assert.equal(source.dots, null);
  assert.equal(buildingFace({ type: 'lagerhaus', x: 0, y: 0, rot: 0 }).kind, 'storage');
});

test('Farbe je Reiter (Tobias): alle Gebäude eines Reiters gleich, die Reiter verschieden', () => {
  for (const tab of BUILD_TABS) {
    assert.equal(tab.color, TAB_COLORS[tab.id], tab.id);
    for (const type of tab.buildings) assert.equal(BUILDINGS[type].color, tab.color, `${type} hat die Farbe von „${tab.name}“`);
  }
  const tabColors = BUILD_TABS.map((t) => t.color.toLowerCase());
  assert.equal(new Set(tabColors).size, BUILD_TABS.length, 'jeder Reiter hat seine eigene Farbe');
  for (const type of BUILD_ALWAYS) {
    assert.ok(!tabColors.includes(BUILDINGS[type].color.toLowerCase()), `${type} hat eine eigene Farbe`);
  }
  for (const [type, def] of Object.entries(BUILDINGS)) assert.match(def.color, /^#[0-9a-f]{6}$/i, type);
});

test('Sichtbarer Ausschnitt: nur zeichnen, was hineinragt', () => {
  const cam = createCamera();
  setViewSize(cam, 800, 400);
  cam.x = 100;
  cam.y = 50;
  cam.zoom = 2; // 400 × 200 Welteinheiten zu sehen
  assert.deepEqual(visibleRect(cam), { x0: 100, y0: 50, x1: 500, y1: 250 });
  assert.deepEqual(visibleRect(cam, 10), { x0: 90, y0: 40, x1: 510, y1: 260 });
  const view = visibleRect(cam);
  assert.equal(intersects(view, 0, 0, 96, 96), false, 'ganz links oben außerhalb');
  assert.equal(intersects(view, 60, 20, 48, 48), true, 'ragt ein Stück hinein');
  assert.equal(intersects(view, 500, 100, 48, 48), false, 'beginnt genau am rechten Rand');
  assert.equal(intersects(view, 200, 100, 48, 48), true, 'mittendrin');
});
