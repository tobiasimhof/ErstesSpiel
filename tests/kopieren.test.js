// v0.41.0: Bereich kopieren (Tobias: „Bereich kopieren und das Ganze nochmal
// bauen finde ich sehr wichtig“; „alles oder nichts ist sehr gut und dann eine
// kurze Meldung was fehlt“).
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { copyArea, copyCost, planAreaCopy, removeArea, selectArea } from '../src/core/area.js';
import { applyBeltPath, buildBeltPath, extendTrace } from '../src/core/belts.js';
import { placeBuilding } from '../src/core/buildings.js';
import { loadInput, setRecipe } from '../src/core/production.js';
import { deserializeGame, serializeGame } from '../src/core/save.js';
import { storageCount } from '../src/core/shop.js';
import { simulate } from '../src/core/sim.js';
import { createNewGame, findBuilding } from '../src/core/state.js';

function emptyGame(storage = {}) {
  const state = createNewGame();
  state.buildings = [];
  state.storage = { holzstamm: 5, ...storage };
  return state;
}

function drag(state, points) {
  let trace = [];
  for (const [x, y] of points) trace = extendTrace(trace, { x, y });
  applyBeltPath(state, buildBeltPath(state, trace));
}

// Holzfäller (10,6) → Band (12–14,6) → Sägewerk (15,6) → Band (17–18,6) → Versandportal (19,6)
function line(state) {
  const wood = placeBuilding(state, 'holzfaeller', 10, 6, 0);
  drag(state, [
    [12, 6],
    [14, 6],
  ]);
  const saw = placeBuilding(state, 'saegewerk', 15, 6, 0);
  drag(state, [
    [17, 6],
    [18, 6],
  ]);
  const portal = placeBuilding(state, 'versandportal', 19, 6, 0);
  return { wood, saw, portal };
}

// Was die ganze Linie kostet: Holzfäller 10 Platten + 10 Stäbe, Sägewerk 40
// Blöcke, Portal 10 Blöcke, 5 Bänder je 1 Block.
const LINE_COST = { holzplatte: 10, holzstab: 10, holzblock: 55 };
const enough = () => ({ holzplatte: 30, holzstab: 30, holzblock: 200 });
const all = (state) => selectArea(state, { x: 10, y: 6 }, { x: 19, y: 7 });

test('Kosten der Kopie: jedes Gebäude nach Tabelle, je Band 1 Holzblock', () => {
  const state = emptyGame();
  line(state);
  assert.deepEqual(copyCost(state, all(state)), LINE_COST);
  const plan = planAreaCopy(state, all(state), 10, 9);
  assert.equal(plan.valid, true);
  assert.deepEqual(plan.cost, LINE_COST);
  assert.deepEqual(plan.missing, LINE_COST, 'Laden-Lager leer: alles fehlt');
  assert.equal(plan.locked, null);
});

test('Kopieren: Original bleibt, Kopie ist leer, behält die Einstellung und läuft', () => {
  const state = emptyGame(enough());
  const { wood, saw } = line(state);
  setRecipe(saw, 'holzstab');
  loadInput(state, wood);
  simulate(state, 40);
  state.belts['17,6'].item = { type: 'holzstab', progress: 0.2, from: 'W' };
  const originalBelts = JSON.stringify(Object.entries(state.belts).filter(([k]) => k.endsWith(',6')));
  const sawBefore = JSON.stringify(saw.prod);
  const count = state.buildings.length;
  const had = { holzplatte: storageCount(state, 'holzplatte'), holzstab: storageCount(state, 'holzstab'), holzblock: storageCount(state, 'holzblock') };

  const res = copyArea(state, all(state), 10, 9);
  assert.equal(res.result, 'ok');
  assert.equal(state.buildings.length, count + 3, 'drei neue Gebäude');
  assert.deepEqual([wood.x, wood.y, saw.x, saw.y], [10, 6, 15, 6], 'Original steht noch');
  assert.equal(JSON.stringify(saw.prod), sawBefore, 'Original unverändert');
  assert.equal(JSON.stringify(Object.entries(state.belts).filter(([k]) => k.endsWith(',6'))), originalBelts);

  const copies = res.sel.buildings.map((id) => findBuilding(state, id));
  assert.deepEqual(copies.map((b) => [b.type, b.x, b.y, b.rot]), [
    ['holzfaeller', 10, 9, 0],
    ['saegewerk', 15, 9, 0],
    ['versandportal', 19, 9, 0],
  ]);
  const sawCopy = copies[1];
  assert.equal(sawCopy.prod.recipe, 'holzstab', 'Einstellung kommt mit');
  assert.deepEqual(sawCopy.prod.stock, {}, 'Sägewerk der Kopie ist leer');
  assert.equal(copies[0].prod.loaded, false, 'Holzfäller der Kopie hat keinen Vorrat');
  assert.deepEqual(res.sel.belts.sort(), ['12,9', '13,9', '14,9', '17,9', '18,9']);
  for (const key of res.sel.belts) assert.deepEqual(state.belts[key], { outs: ['E'], paid: true }, `${key}: leeres, bezahltes Band`);
  assert.deepEqual(copies[0].paid, { holzplatte: 10, holzstab: 10 }, 'Baukosten gemerkt (fürs Abreißen)');

  for (const [type, n] of Object.entries(LINE_COST)) assert.equal(storageCount(state, type), had[type] - n, `${type} bezahlt`);

  loadInput(state, copies[0]);
  const before = storageCount(state, 'holzstab');
  simulate(state, 150);
  assert.ok(storageCount(state, 'holzstab') > before, 'die Kopie stellt Holzstäbe her');
});

test('Alles oder nichts: Fehlt eine Ware, wird nichts gebaut und gesagt, was fehlt', () => {
  const state = emptyGame({ holzplatte: 30, holzstab: 4, holzblock: 200 });
  line(state);
  const buildings = state.buildings.length;
  const belts = Object.keys(state.belts).length;
  const res = copyArea(state, all(state), 10, 9);
  assert.deepEqual(res, { result: 'cost', missing: { holzstab: 6 } });
  assert.equal(state.buildings.length, buildings);
  assert.equal(Object.keys(state.belts).length, belts);
  assert.deepEqual(state.storage, { holzstamm: 5, holzplatte: 30, holzstab: 4, holzblock: 200 }, 'nichts bezahlt');
});

test('Kein Platz (auch nicht über dem Original) oder gesperrtes Gebäude: nichts passiert', () => {
  const state = emptyGame(enough());
  line(state);
  const plan = planAreaCopy(state, all(state), 11, 6);
  assert.equal(plan.valid, false, 'das Original ist ein Hindernis');
  assert.deepEqual(copyArea(state, all(state), 11, 6), { result: 'space' });
  assert.deepEqual(copyArea(state, all(state), 10, 40), { result: 'space' }, 'außerhalb des Grundstücks');
  assert.equal(storageCount(state, 'holzblock'), 200);

  const locked = emptyGame(enough());
  placeBuilding(locked, 'schmiede', 10, 6, 0);
  const sel = selectArea(locked, { x: 10, y: 6 }, { x: 10, y: 6 });
  assert.equal(planAreaCopy(locked, sel, 10, 9).locked, 'schmiede');
  assert.deepEqual(copyArea(locked, sel, 10, 9), { result: 'locked', type: 'schmiede' });
});

test('Gedreht kopieren und mehrmals hintereinander (Stempel)', () => {
  const state = emptyGame({ holzplatte: 100, holzstab: 100, holzblock: 500 });
  line(state);
  const sel = all(state);
  const a = copyArea(state, sel, 22, 6, 1);
  assert.equal(a.result, 'ok');
  assert.deepEqual(a.sel.buildings.map((id) => findBuilding(state, id).rot), [1, 1, 1]);
  assert.equal(copyArea(state, sel, 10, 9).result, 'ok');
  assert.equal(copyArea(state, sel, 10, 12).result, 'ok');
  assert.equal(state.buildings.length, 12);
  assert.equal(storageCount(state, 'holzplatte'), 100 - 30);
  // jede Kopie läuft für sich
  for (const b of state.buildings.filter((b) => b.type === 'holzfaeller')) loadInput(state, b);
  simulate(state, 150);
  assert.ok(storageCount(state, 'holzplatte') >= 70 + 4 * 3, `${storageCount(state, 'holzplatte')} Holzplatten`);
});

test('Kopie abreißen gibt die Baukosten zurück; Spielstand mit Kopie lässt sich laden', () => {
  const state = emptyGame(enough());
  line(state);
  const res = copyArea(state, all(state), 10, 9);
  const loaded = deserializeGame(serializeGame(state));
  assert.ok(loaded, 'Spielstand mit Kopie ist gültig');
  assert.deepEqual(loaded.state.buildings, state.buildings);
  assert.deepEqual(loaded.state.belts, state.belts);
  removeArea(state, res.sel);
  assert.deepEqual(
    [storageCount(state, 'holzplatte'), storageCount(state, 'holzstab'), storageCount(state, 'holzblock')],
    [30, 30, 200],
    'alles zurück',
  );
});
