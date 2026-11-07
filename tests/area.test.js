import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  areaLosesWork,
  cleanSelection,
  isEmptySelection,
  moveArea,
  planAreaMove,
  removeArea,
  selectArea,
  selectionBounds,
} from '../src/core/area.js';
import { applyBeltPath, buildBeltPath, extendTrace } from '../src/core/belts.js';
import { placeBuilding } from '../src/core/buildings.js';
import { loadInput } from '../src/core/production.js';
import { deserializeGame, serializeGame } from '../src/core/save.js';
import { storageCount } from '../src/core/shop.js';
import { simulate } from '../src/core/sim.js';
import { createNewGame, findBuilding } from '../src/core/state.js';

function emptyGame() {
  const state = createNewGame();
  state.buildings = [];
  state.storage = { holzstamm: 5 };
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

const beltItems = (state) => Object.values(state.belts).filter((b) => b.item).length;
const keys = (state) => Object.keys(state.belts).sort();

test('Markieren: Gebäude zählen, sobald ein Feld im Rechteck liegt; Bänder im Rechteck', () => {
  const state = emptyGame();
  const { wood, saw } = line(state);
  const sel = selectArea(state, { x: 12, y: 6 }, { x: 11, y: 5 });
  assert.deepEqual(sel, { buildings: [wood.id], belts: ['12,6'] }, 'Holzfäller nur mit seiner rechten Spalte im Rechteck');
  const all = selectArea(state, { x: 10, y: 6 }, { x: 19, y: 6 });
  assert.equal(all.buildings.length, 3);
  assert.equal(all.belts.length, 5);
  assert.deepEqual(selectionBounds(state, all), { x: 10, y: 6, width: 10, height: 2 });
  assert.ok(isEmptySelection(selectArea(state, { x: 20, y: 12 }, { x: 25, y: 15 })), 'leerer Bereich');
  assert.deepEqual(selectArea(state, { x: 16, y: 7 }, { x: 16, y: 7 }).buildings, [saw.id], 'ein Feld antippen');
});

test('Ganze Linie verschieben: alles bleibt verbunden, Waren ziehen mit um, die Fabrik läuft weiter', () => {
  const state = emptyGame();
  const { wood, saw, portal } = line(state);
  loadInput(state, wood);
  simulate(state, 40);
  state.belts['17,6'].item = { type: 'holzplatte', progress: 0.2, from: 'W' }; // sicher eine Ware unterwegs
  const onBelts = beltItems(state);
  const remaining = wood.prod.remaining;
  const sawBefore = JSON.stringify(saw.prod);
  const sel = selectArea(state, { x: 10, y: 6 }, { x: 19, y: 7 });

  const moved = moveArea(state, sel, 10, 12);
  assert.ok(moved);
  assert.deepEqual([wood.x, wood.y, saw.x, saw.y, portal.x, portal.y], [10, 12, 15, 12, 19, 12]);
  assert.deepEqual(keys(state), ['12,12', '13,12', '14,12', '17,12', '18,12']);
  assert.deepEqual(moved.belts.sort(), keys(state), 'Auswahl an der neuen Stelle');
  assert.equal(beltItems(state), onBelts, 'Waren auf den Bändern sind mitgekommen');
  assert.equal(wood.prod.remaining, remaining, 'angefangener Holzstamm läuft weiter');
  assert.equal(JSON.stringify(saw.prod), sawBefore, 'Inhalt des Sägewerks ist mitgekommen');
  assert.deepEqual(state.belts['17,12'].item, { type: 'holzplatte', progress: 0.2, from: 'W' });

  const before = storageCount(state, 'holzplatte');
  simulate(state, 120);
  assert.ok(storageCount(state, 'holzplatte') > before, 'Holzplatten kommen weiter im Laden an');
});

test('Gedreht verschieben (90°, 180°, 270°): Linie läuft weiter bis ins Versandportal', () => {
  const targets = { 1: [22, 6], 2: [10, 10], 3: [25, 6] };
  for (const turns of [1, 2, 3]) {
    const state = emptyGame();
    const { wood, portal } = line(state);
    const sel = selectArea(state, { x: 10, y: 6 }, { x: 19, y: 7 });
    const [x, y] = targets[turns];
    const plan = planAreaMove(state, sel, x, y, turns);
    assert.equal(plan.valid, true, `${turns}: passt`);
    assert.deepEqual([plan.width, plan.height], turns % 2 ? [2, 10] : [10, 2]);
    assert.ok(moveArea(state, sel, x, y, turns), `${turns}: verschoben`);
    assert.equal(wood.rot, turns);
    assert.equal(portal.rot, turns);
    loadInput(state, wood);
    simulate(state, 150);
    assert.ok(storageCount(state, 'holzplatte') >= 3, `${turns}: ${storageCount(state, 'holzplatte')} Holzplatten im Laden`);
  }
});

test('Gedreht: Ware auf dem Band dreht mit (sie kommt von der gedrehten Seite)', () => {
  const state = emptyGame();
  drag(state, [
    [12, 8],
    [14, 8],
  ]);
  state.belts['13,8'].item = { type: 'holzblock', progress: 0.3, from: 'W' };
  const sel = selectArea(state, { x: 12, y: 8 }, { x: 14, y: 8 });
  moveArea(state, sel, 20, 8, 1);
  assert.deepEqual(keys(state), ['20,10', '20,8', '20,9']);
  assert.deepEqual(state.belts['20,9'].item, { type: 'holzblock', progress: 0.3, from: 'N' });
  assert.deepEqual(state.belts['20,8'].outs, ['S']);
});

test('Belegt oder außerhalb des Grundstücks: rot, nichts passiert; über die alte Stelle schieben geht', () => {
  const state = emptyGame();
  line(state);
  const other = placeBuilding(state, 'lagerhaus', 12, 11, 0);
  const sel = selectArea(state, { x: 10, y: 6 }, { x: 19, y: 7 });
  const before = JSON.stringify(state);

  const plan = planAreaMove(state, sel, 10, 11);
  assert.equal(plan.valid, false);
  assert.ok(plan.tiles.some((t) => t.x === 12 && t.y === 11 && !t.ok), 'das Lagerhaus-Feld ist rot');
  assert.equal(moveArea(state, sel, 10, 11), null);
  assert.equal(JSON.stringify(state), before, 'nichts verändert');

  assert.equal(planAreaMove(state, sel, 25, 6).valid, false, 'ragt rechts aus dem Grundstück');
  assert.equal(planAreaMove(state, sel, 10, 4).valid, false, 'ragt oben aus dem Grundstück');
  assert.equal(planAreaMove(state, sel, 11, 6).valid, true, 'um ein Feld nach rechts: überlappt nur sich selbst');
  assert.ok(moveArea(state, sel, 11, 7));
  assert.equal(findBuilding(state, other.id).x, 12, 'fremdes Gebäude bleibt');
});

test('Bänder außerhalb: einfache Strecke bleibt, Abzweig ins Leere wird entfernt', () => {
  const state = emptyGame();
  // Zuleitung (12,10)→(16,10) mit Abzweig bei (14,10) nach unten bis (14,12)
  drag(state, [
    [12, 10],
    [16, 10],
  ]);
  drag(state, [
    [14, 10],
    [14, 12],
  ]);
  assert.deepEqual(state.belts['14,10'].outs, ['E', 'S']);
  // Den Abzweig (14,11)-(14,12) wegschieben
  const sel = selectArea(state, { x: 14, y: 11 }, { x: 14, y: 12 });
  assert.ok(moveArea(state, sel, 20, 11));
  assert.deepEqual(state.belts['14,10'].outs, ['E'], 'Abzweig ins Leere entfernt');
  // Das Ende einer einfachen Strecke wegschieben: die Strecke behält ihre Richtung
  const end = selectArea(state, { x: 16, y: 10 }, { x: 16, y: 10 });
  assert.ok(moveArea(state, end, 20, 15));
  assert.deepEqual(state.belts['15,10'].outs, ['E']);
});

test('Bereich abreißen: Waren und bezahlte Baukosten ins Laden-Lager, angefangener Rohstoff zählt', () => {
  const state = emptyGame();
  const { wood, saw } = line(state);
  saw.paid = { holzblock: 40 };
  for (const belt of Object.values(state.belts)) belt.paid = true;
  const sel = selectArea(state, { x: 10, y: 6 }, { x: 19, y: 7 });
  assert.equal(areaLosesWork(state, sel), false);
  loadInput(state, wood);
  simulate(state, 30);
  assert.equal(areaLosesWork(state, sel), true, 'Holzstamm ist angefangen');
  const inFactory = beltItems(state) + (wood.prod.out?.count ?? 0) + Object.values(saw.prod.stock).reduce((a, b) => a + b, 0);
  const blocksBefore = storageCount(state, 'holzblock');

  const result = removeArea(state, sel);
  assert.deepEqual([result.buildings, result.belts], [3, 5]);
  assert.equal(state.buildings.length, 0);
  assert.deepEqual(state.belts, {});
  // 40 (Sägewerk) + 5 Bänder à 1 Holzblock + Holzblöcke aus Fabrik
  assert.ok(storageCount(state, 'holzblock') - blocksBefore >= 45, `Baukosten zurück (${result.returned.holzblock})`);
  assert.ok(inFactory > 0);
  assert.equal(result.returned.holzblock, storageCount(state, 'holzblock') - blocksBefore);
  assert.ok(isEmptySelection(cleanSelection(state, sel)), 'Auswahl ist danach leer');
});

test('Verschobene Fabrik lässt sich speichern und laden', () => {
  const state = emptyGame();
  line(state);
  const sel = selectArea(state, { x: 10, y: 6 }, { x: 19, y: 7 });
  assert.ok(moveArea(state, sel, 8, 12, 2));
  const loaded = deserializeGame(serializeGame(state));
  assert.ok(loaded);
  assert.deepEqual(loaded.state.belts, state.belts);
  assert.deepEqual(loaded.state.buildings, state.buildings);
});
