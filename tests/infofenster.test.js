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
import {
  accept,
  addRawToSource,
  buildingStatus,
  canAccept,
  loadInput,
  productionOf,
  setRecipe,
  sourceSlots,
  workshopInputs,
} from '../src/core/production.js';
import { SAVE_VERSION, deserializeGame, isValidState, serializeGame } from '../src/core/save.js';
import { storageCapacity, storageCount } from '../src/core/shop.js';
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

// ---------- v0.20.0: Beet, Lagerhaus und Versandportal (Tobias, Chat 15) ----------

const clone = (state) => deserializeGame(serializeGame(state)).state;

test('Versandportal merkt sich die zuletzt versendeten Waren: neueste vorn, jede einmal, höchstens 3', () => {
  const state = level8();
  const portal = placeBuilding(state, 'versandportal', 10, 6);
  assert.deepEqual(portal.prod.recent, [], 'neu gebaut: noch nichts versendet');
  const ship = (type) => {
    assert.ok(canAccept(state, portal, type));
    accept(state, portal, type);
  };
  ship('holzplatte');
  ship('holzplatte');
  ship('holzstab');
  assert.deepEqual(portal.prod.recent, ['holzstab', 'holzplatte']);
  ship('holzplatte');
  assert.deepEqual(portal.prod.recent, ['holzplatte', 'holzstab'], 'die neueste rückt nach vorn, keine doppelt');
  ship('steinplatte');
  ship('eisenblech');
  assert.deepEqual(portal.prod.recent, ['eisenblech', 'steinplatte', 'holzplatte'], 'höchstens 3 – die älteste fällt weg');
  assert.equal(portal.prod.recent.length, productionOf('versandportal').recent);
  assert.equal(portal.prod.shipped, 6);
  assert.equal(storageCount(state, 'holzplatte'), 3, 'alles liegt im Laden-Lager');
});

test('Versandportal und Lagerhaus: Status, wenn nichts mehr hineinpasst', () => {
  const state = level8();
  const portal = placeBuilding(state, 'versandportal', 10, 6);
  assert.equal(buildingStatus(state, portal).level, 'work');
  state.storage = { holzblock: storageCapacity(state) };
  assert.deepEqual(buildingStatus(state, portal), { level: 'blocked', text: 'Laden-Lager voll – nimmt nichts an.' });
  assert.equal(canAccept(state, portal, 'holzplatte'), false);
  const lager = placeBuilding(state, 'lagerhaus', 12, 6);
  assert.deepEqual(buildingStatus(state, lager), { level: 'idle', text: 'Leer.' });
  lager.prod.slots = [{ type: 'steinzahnrad', count: 42 }];
  assert.deepEqual(buildingStatus(state, lager), { level: 'work', text: '42 Waren gelagert.' });
  lager.prod.slots = ['steinzahnrad', 'holzstab', 'holzplatte'].map((type) => ({ type, count: 50 }));
  assert.deepEqual(buildingStatus(state, lager), { level: 'blocked', text: 'Voll – nimmt nichts mehr an.' });
});

test('Spielstand (Version 15): Versandportale behalten ihre Liste, Ungültiges wird erkannt', () => {
  assert.ok(SAVE_VERSION >= 15);
  const state = level8();
  const portal = placeBuilding(state, 'versandportal', 10, 6);
  accept(state, portal, 'holzstab');
  accept(state, portal, 'heilverband');
  assert.deepEqual(clone(state).buildings[0].prod.recent, ['heilverband', 'holzstab']);
  for (const change of [
    (p) => (p.recent = ['gibtsnicht']),
    (p) => (p.recent = ['holzstab', 'holzstab']),
    (p) => (p.recent = ['holzstab', 'holzplatte', 'steinplatte', 'eisenblech']),
    (p) => (p.recent = 'holzstab'),
    (p) => delete p.recent,
  ]) {
    const copy = clone(state);
    change(copy.buildings[0].prod);
    assert.equal(isValidState(copy), false, change.toString());
  }
});

test('Spielstand aus v0.19 (Version 14): Versandportale bekommen eine leere Liste, sonst bleibt alles', () => {
  const v14 = createNewGame(14);
  const portal = v14.buildings.find((b) => b.type === 'versandportal');
  portal.prod.shipped = 1234;
  delete portal.prod.recent; // so sah es in Version 14 aus
  const loaded = deserializeGame(JSON.stringify({ saveVersion: 14, savedAt: 1, state: v14 }));
  assert.ok(loaded, 'Spielstand gültig');
  assert.equal(loaded.migratedFrom, 14);
  const p = loaded.state.buildings.find((b) => b.type === 'versandportal').prod;
  assert.deepEqual([p.shipped, p.recent], [1234, []]);
});
