// v0.19.0: Übersichtliches Infofenster (Tobias) – oben, was gerade hergestellt
// wird und was dafür fehlt, darunter die anderen Einstellungen; der Vorrat der
// Rohstoff-Gebäude als Bilder; kurzer Tipp statt langer Beschreibung; der
// Reiter „Kräuter“ heißt „Erde“. Die Darstellung prüft der Browser-Test, hier
// die Daten und Spielregeln dahinter.
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { placeBuilding } from '../src/core/buildings.js';
import { BUILDINGS, BUILD_TABS } from '../src/core/data/buildings.js';
import { ITEMS } from '../src/core/data/items.js';
import { RECIPES } from '../src/core/data/recipes.js';
import { addRawToSource, loadInput, productionOf, setRecipe, sourceSlots, workshopInputs } from '../src/core/production.js';
import { createNewGame } from '../src/core/state.js';
import { formatDuration } from '../src/view/format.js';

function level8() {
  const state = createNewGame(8);
  state.buildings = [];
  state.belts = {};
  state.storage = {};
  state.shopLevel = 8;
  state.gold = 0;
  return state;
}

test('Reiter „Erde“: Name geändert, Kennung und Gebäude bleiben (gemerkter Reiter passt weiter)', () => {
  const tab = BUILD_TABS.find((t) => t.id === 'kraeuter');
  assert.equal(tab.name, 'Erde');
  assert.deepEqual(tab.buildings, ['beet', 'flachsbreche', 'webstube', 'kraeuterstube']);
});

test('Jedes Gebäude hat einen kurzen Tipp und keine lange Beschreibung mehr', () => {
  for (const [key, def] of Object.entries(BUILDINGS)) {
    assert.ok(typeof def.tip === 'string' && def.tip.length > 0, `${key}: Tipp fehlt`);
    assert.ok(def.tip.length <= 160, `${key}: Tipp ist ${def.tip.length} Zeichen lang (höchstens 160)`);
    assert.equal(def.description, undefined, `${key}: description sollte es nicht mehr geben`);
  }
});

test('Jede Ware in einem Rezept oder Rohstoff-Gebäude hat ein Warenbild', () => {
  const used = new Set();
  for (const r of Object.values(RECIPES)) {
    for (const type of Object.keys(r.inputs)) used.add(type);
    used.add(r.output);
  }
  for (const def of Object.values(BUILDINGS)) {
    const p = def.production;
    if (p?.kind !== 'source') continue;
    for (const [input, output] of Object.entries(p.inputs ?? { [p.input]: p.output })) used.add(input).add(output);
  }
  for (const type of used) assert.ok(ITEMS[type]?.shape, `${type}: kein Warenbild (shape)`);
});

test('Vorrat der Reihe nach: der laufende Rohstoff zuerst, dann die wartenden', () => {
  const state = level8();
  const lager = placeBuilding(state, 'holzfaeller', 10, 6);
  assert.deepEqual(sourceSlots(lager), [], 'leer');
  state.storage.holzstamm = 3;
  for (let i = 0; i < 3; i++) assert.ok(loadInput(state, lager, 'holzstamm'));
  assert.deepEqual(sourceSlots(lager), ['holzstamm', 'holzstamm', 'holzstamm']);
  // Erntebank, gemischt: die Reihenfolge, in der eingelegt wurde
  const bank = placeBuilding(state, 'flachsbreche', 13, 6);
  assert.ok(addRawToSource(bank, 'ringelblume'));
  assert.ok(addRawToSource(bank, 'flachspflanze'));
  assert.deepEqual(sourceSlots(bank), ['ringelblume', 'flachspflanze']);
  // Andere Gebäude haben keinen Vorrat
  const saege = placeBuilding(state, 'saegewerk', 16, 6);
  assert.deepEqual(sourceSlots(saege), []);
});

test('Maschine: „Stellt gerade her“ nennt jede Zutat mit hat / braucht; Umstellen behält die Zutaten', () => {
  const state = level8();
  const fein = placeBuilding(state, 'feinschmiede', 10, 6);
  assert.equal(fein.prod.recipe, 'scharnier');
  fein.prod.stock = { eisenblech: 6, eisenstange: 5 };
  assert.deepEqual(workshopInputs(fein), [
    { type: 'eisenblech', need: 10, have: 6, done: false },
    { type: 'eisenstange', need: 5, have: 5, done: true },
  ]);
  // Die anderen Einstellungen („Umstellen auf“)
  const others = productionOf('feinschmiede').recipes.filter((key) => key !== fein.prod.recipe);
  assert.deepEqual(others, ['schluessel', 'zirkel']);
  setRecipe(fein, 'schluessel');
  assert.deepEqual(workshopInputs(fein), [
    { type: 'eisenstange', need: 10, have: 5, done: false },
    { type: 'eisenblech', need: 5, have: 6, done: true },
  ]);
});

test('Zeitangaben im Infofenster', () => {
  assert.equal(formatDuration(20), '20 s');
  assert.equal(formatDuration(900), '15:00 min');
  assert.equal(formatDuration(1925), '32:05 min');
});
