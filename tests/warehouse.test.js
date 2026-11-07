// v0.12.0: Lagerhaus als Gegenstück zum Versandportal (befüllen, ausräumen;
// den Nachschub gibt es seit v0.14.0 nicht mehr) und Bänder leeren
// („Strecke leeren“, „Zulauf leeren“).
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { applyBeltPath, beltItems, beltLine, buildBeltPath, clearBeltLine, clearFeed, extendTrace, jammedFeeds } from '../src/core/belts.js';
import { placeBuilding, removeBuilding } from '../src/core/buildings.js';
import { BUILDINGS } from '../src/core/data/buildings.js';
import { buildingStatus, inputJam, setRecipe } from '../src/core/production.js';
import { deserializeGame, serializeGame } from '../src/core/save.js';
import { storageCount } from '../src/core/shop.js';
import { simulate } from '../src/core/sim.js';
import { createNewGame } from '../src/core/state.js';
import { emptyWarehouse, fillMax, fillWarehouse, warehouseRoom } from '../src/core/warehouse.js';

function emptyGame() {
  const state = createNewGame(12);
  state.buildings = [];
  state.storage = {};
  return state;
}

function drag(state, points) {
  let trace = [];
  for (const [x, y] of points) trace = extendTrace(trace, { x, y });
  applyBeltPath(state, buildBeltPath(state, trace));
}

const slots = (store) => store.prod.slots.map((s) => [s.type, s.count]);

// Lagerhaus (16,9)-(17,9) gibt unten rechts aus → Band (17,10)…(19,10) →
// Maschine (20,10)-(21,11) → Band (22,10),(23,10) → Versandportal (24,10).
function line(machineType, recipe) {
  const state = emptyGame();
  const store = placeBuilding(state, 'lagerhaus', 16, 9, 0);
  drag(state, [
    [17, 10],
    [19, 10],
  ]);
  const machine = placeBuilding(state, machineType, 20, 10, 0);
  setRecipe(machine, recipe);
  drag(state, [
    [22, 10],
    [23, 10],
  ]);
  placeBuilding(state, 'versandportal', 24, 10, 0);
  return { state, store, machine };
}

// ---------- Befüllen ----------

test('Lagerhaus: 3 Fächer zu je 50, kein Nachschub mehr (Datentabelle, v0.14.0)', () => {
  assert.deepEqual(BUILDINGS.lagerhaus.production, { kind: 'storage', slots: 3, slotSize: 50 });
});

test('Befüllen: 120 Eisenbarren aus dem Laden-Lager verteilen sich auf die Fächer', () => {
  const state = emptyGame();
  const store = placeBuilding(state, 'lagerhaus', 16, 9, 0);
  state.storage.eisenbarren = 120;
  assert.equal(fillMax(state, store, 'eisenbarren'), 120);
  assert.equal(fillWarehouse(state, store, 'eisenbarren', 120), 120);
  assert.deepEqual(slots(store), [
    ['eisenbarren', 50],
    ['eisenbarren', 50],
    ['eisenbarren', 20],
  ]);
  assert.equal(storageCount(state, 'eisenbarren'), 0);
});

test('Befüllen: höchstens so viel, wie im Laden-Lager liegt und ins Lagerhaus passt', () => {
  const state = emptyGame();
  const store = placeBuilding(state, 'lagerhaus', 16, 9, 0);
  store.prod.slots = [{ type: 'holzplatte', count: 30 }];
  state.storage = { holzplatte: 500, holzstab: 7 };
  // Holzplatten: 20 im angefangenen Fach + 2 freie Fächer à 50
  assert.equal(warehouseRoom(store, 'holzplatte'), 120);
  assert.equal(fillWarehouse(state, store, 'holzplatte', 999), 120);
  assert.equal(storageCount(state, 'holzplatte'), 380);
  assert.equal(fillMax(state, store, 'holzstab'), 0, 'alle Fächer belegt');
  emptyWarehouse(state, store);
  assert.equal(fillWarehouse(state, store, 'holzstab', 50), 7, 'nur 7 Holzstäbe im Laden-Lager');
});

test('Rohstoffe kommen nicht ins Lagerhaus (die legt man ein)', () => {
  const state = emptyGame();
  const store = placeBuilding(state, 'lagerhaus', 16, 9, 0);
  state.storage.holzstamm = 3;
  assert.equal(fillWarehouse(state, store, 'holzstamm', 1), 0);
  assert.deepEqual(store.prod.slots, []);
});

test('Tobias’ Beispiel: 120 Eisenbarren aus dem Laden-Lager werden zu 24 Eisenstangen', () => {
  const { state, store } = line('schmiede', 'eisenstange');
  state.storage.eisenbarren = 120;
  fillWarehouse(state, store, 'eisenbarren', 120);
  simulate(state, 200);
  assert.equal(storageCount(state, 'eisenstange'), 24);
  assert.equal(storageCount(state, 'eisenbarren'), 0);
  assert.deepEqual(store.prod.slots, []);
});

test('Befüllen ist Handarbeit (v0.14.0): Ist das Lagerhaus leer, bleibt es leer – auch wenn im Laden-Lager genug liegt', () => {
  const { state, store } = line('saegewerk', 'holzplatte');
  state.storage.holzblock = 300;
  assert.equal(fillWarehouse(state, store, 'holzblock', 100), 100);
  simulate(state, 150);
  assert.equal(storageCount(state, 'holzplatte'), 20, '100 Holzblöcke → 20 Holzplatten');
  assert.deepEqual(store.prod.slots, []);
  assert.deepEqual(buildingStatus(state, store), { level: 'idle', text: 'Leer.' });
  simulate(state, 60);
  assert.equal(storageCount(state, 'holzblock'), 200, 'nichts wird von selbst nachgeholt');
  assert.equal(storageCount(state, 'holzplatte'), 20);
  // Neu befüllen – dann läuft es weiter
  fillWarehouse(state, store, 'holzblock', 10);
  simulate(state, 30);
  assert.equal(storageCount(state, 'holzplatte'), 22);
});

// ---------- Ausräumen, Abreißen ----------

test('Ausräumen: alles zurück ins Laden-Lager', () => {
  const state = emptyGame();
  const store = placeBuilding(state, 'lagerhaus', 16, 9, 0);
  state.storage = { eisenbarren: 30, holzplatte: 20 };
  fillWarehouse(state, store, 'eisenbarren', 30);
  fillWarehouse(state, store, 'holzplatte', 10);
  assert.deepEqual(emptyWarehouse(state, store), { eisenbarren: 30, holzplatte: 10 });
  assert.deepEqual(state.storage, { eisenbarren: 30, holzplatte: 20 });
  simulate(state, 1);
  assert.deepEqual(store.prod.slots, [], 'bleibt leer');
});

test('Abreißen eines befüllten Lagerhauses gibt seinen Inhalt zurück', () => {
  const state = emptyGame();
  const store = placeBuilding(state, 'lagerhaus', 16, 9, 0);
  state.storage.holzstab = 25;
  fillWarehouse(state, store, 'holzstab', 25);
  removeBuilding(state, store.id);
  assert.equal(storageCount(state, 'holzstab'), 25);
});

// ---------- Spielstand ----------

test('Spielstand: Inhalt des Lagerhauses wird mitgespeichert', () => {
  const state = emptyGame();
  const store = placeBuilding(state, 'lagerhaus', 16, 9, 0);
  state.storage.holzplatte = 50;
  fillWarehouse(state, store, 'holzplatte', 20);
  const loaded = deserializeGame(serializeGame(state));
  assert.ok(loaded);
  assert.deepEqual(loaded.state.buildings[0].prod, { slots: [{ type: 'holzplatte', count: 20 }], blocked: false });
});

test('Spielstand aus v0.13 (Version 11): Nachschub fällt weg, der Inhalt bleibt, mit Hinweis', () => {
  const v11 = emptyGame();
  const a = placeBuilding(v11, 'lagerhaus', 16, 9, 0);
  a.prod.slots = [{ type: 'holzplatte', count: 7 }];
  a.prod.supply = { type: 'holzplatte', keep: 20 };
  const b = placeBuilding(v11, 'lagerhaus', 16, 12, 0);
  b.prod.supply = null;
  const loaded = deserializeGame(JSON.stringify({ saveVersion: 11, savedAt: 1, state: v11 }));
  assert.ok(loaded);
  assert.equal(loaded.migratedFrom, 11);
  const [pa, pb] = loaded.state.buildings.map((x) => x.prod);
  assert.deepEqual([pa.slots, 'supply' in pa, 'supply' in pb], [[{ type: 'holzplatte', count: 7 }], false, false]);
  assert.deepEqual(loaded.notes, ['1 Lagerhaus hatte Nachschub – den gibt es nicht mehr. Was darin liegt, läuft noch aufs Band; danach von Hand befüllen.']);
});

test('Spielstand aus v0.11 (Version 9): Lagerhäuser laufen weiter wie bisher', () => {
  const v9 = emptyGame();
  const store = placeBuilding(v9, 'lagerhaus', 16, 9, 0);
  store.prod.slots = [{ type: 'holzblock', count: 42 }];
  const loaded = deserializeGame(JSON.stringify({ saveVersion: 9, savedAt: 1, state: v9 }));
  assert.ok(loaded);
  assert.equal(loaded.migratedFrom, 9);
  assert.deepEqual(loaded.notes, []);
  const prod = loaded.state.buildings[0].prod;
  assert.equal('supply' in prod, false);
  assert.deepEqual(prod.slots, [{ type: 'holzblock', count: 42 }]);
});

// ---------- Strecke leeren ----------

// Hauptstrecke (13,9)→(16,9), Abzweig bei (14,9) nach unten bis (14,11), von
// rechts mündet (17,10)→(15,10) in den Abzweig. Darüber (Reihe 8) eine eigene
// Strecke, die nur parallel läuft.
function beltNet() {
  const state = emptyGame();
  drag(state, [
    [13, 9],
    [16, 9],
  ]);
  drag(state, [
    [14, 9],
    [14, 11],
  ]);
  drag(state, [
    [17, 10],
    [15, 10],
  ]);
  drag(state, [
    [13, 8],
    [16, 8],
  ]);
  return state;
}

test('Strecke: alle verbundenen Bänder, auch über Abzweig und Zusammenführung – nicht das Band daneben', () => {
  const state = beltNet();
  assert.deepEqual(state.belts['15,10'].outs, ['W'], 'mündet in den Abzweig');
  assert.deepEqual(state.belts['14,9'].outs, ['E', 'S'], 'Abzweig');
  const keys = beltLine(state, 16, 9).sort();
  assert.deepEqual(keys, ['13,9', '14,9', '14,10', '14,11', '15,9', '15,10', '16,9', '16,10', '17,10'].sort());
  assert.deepEqual(beltLine(state, 17, 10).sort(), keys, 'egal, wo man antippt');
  assert.deepEqual(beltLine(state, 13, 8).sort(), ['13,8', '14,8', '15,8', '16,8']);
});

test('Strecke leeren: Waren ins Laden-Lager, Bänder bleiben liegen', () => {
  const state = beltNet();
  const put = (key, type) => (state.belts[key].item = { type, progress: 1, from: 'W' });
  put('13,9', 'holzplatte');
  put('14,11', 'holzplatte');
  put('17,10', 'holzstab');
  put('14,8', 'steinblock');
  const beltCount = Object.keys(state.belts).length;
  assert.deepEqual(beltItems(state, beltLine(state, 14, 10)), { holzplatte: 2, holzstab: 1 });
  assert.deepEqual(clearBeltLine(state, 14, 10), { holzplatte: 2, holzstab: 1 });
  assert.deepEqual(state.storage, { holzplatte: 2, holzstab: 1 });
  assert.equal(Object.keys(state.belts).length, beltCount);
  assert.equal(state.belts['14,8'].item.type, 'steinblock', 'das Band daneben bleibt, wie es ist');
  assert.deepEqual(clearBeltLine(state, 14, 10), {}, 'schon leer');
});

test('Strecke leeren: an einem Gebäude endet die Strecke', () => {
  const { state, store } = line('saegewerk', 'holzplatte');
  state.belts['18,10'].item = { type: 'holzstab', progress: 0.5, from: 'W' };
  state.belts['23,10'].item = { type: 'holzplatte', progress: 0.5, from: 'W' };
  assert.deepEqual(beltLine(state, 18, 10).sort(), ['17,10', '18,10', '19,10']);
  assert.deepEqual(clearBeltLine(state, 17, 10), { holzstab: 1 });
  assert.equal(state.belts['23,10'].item.type, 'holzplatte');
  assert.ok(store);
});

// ---------- Zulauf leeren ----------

// Zimmerei auf Zahnradwellen: oben Holzstäbe, unten erst 3 Holzplatten (falsch),
// dahinter Stein-Zahnräder.
function jammedZimmerei() {
  const state = emptyGame();
  const machine = placeBuilding(state, 'zimmerei', 20, 10, 0);
  setRecipe(machine, 'zahnradwelle');
  const a = placeBuilding(state, 'lagerhaus', 16, 9, 0);
  a.prod.slots = [{ type: 'holzstab', count: 30 }];
  drag(state, [
    [17, 10],
    [19, 10],
  ]);
  const b = placeBuilding(state, 'lagerhaus', 16, 11, 0);
  b.prod.slots = [
    { type: 'holzplatte', count: 3 },
    { type: 'steinzahnrad', count: 10 },
  ];
  drag(state, [
    [17, 12],
    [18, 12],
    [18, 11],
    [19, 11],
  ]);
  drag(state, [
    [22, 10],
    [23, 10],
  ]);
  placeBuilding(state, 'versandportal', 24, 10, 0);
  return { state, machine };
}

test('Zulauf leeren: nur die Strecke mit der falschen Ware wird geleert, danach läuft die Zimmerei', () => {
  const { state, machine } = jammedZimmerei();
  simulate(state, 60);
  assert.equal(inputJam(state, machine), 'holzstab', 'rotes Licht');
  assert.deepEqual(
    jammedFeeds(state, machine).map((f) => f.type),
    ['holzstab', 'holzplatte'],
  );
  const back = clearFeed(state, machine);
  assert.equal(back.holzplatte, 3, 'die falschen Holzplatten liegen im Laden-Lager');
  assert.equal(back.holzstab, undefined, 'die Holzstäbe oben bleiben auf dem Band');
  assert.equal(storageCount(state, 'holzplatte'), 3);
  assert.equal(state.belts['19,10'].item?.type, 'holzstab');
  simulate(state, 60);
  assert.ok(storageCount(state, 'zahnradwelle') >= 1, 'jetzt kommen die Zahnräder an');
  assert.notEqual(buildingStatus(state, machine).level, 'blocked');
});

test('Zulauf leeren bei gemischtem Band: die gestaute Strecke wird geleert', () => {
  const { state, store, machine } = line('zimmerei', 'zahnradwelle');
  store.prod.slots = [
    { type: 'holzstab', count: 23 }, // 20 passen in die Zimmerei, 3 stauen sich auf dem Band
    { type: 'steinzahnrad', count: 5 },
  ];
  simulate(state, 60);
  assert.equal(inputJam(state, machine), 'holzstab');
  assert.deepEqual(clearFeed(state, machine), { holzstab: 3 });
  simulate(state, 60);
  assert.equal(storageCount(state, 'zahnradwelle'), 1, 'die Zahnräder kommen durch');
});

test('Zulauf leeren ohne Stau tut nichts', () => {
  const { state, machine } = line('saegewerk', 'holzplatte');
  state.belts['19,10'].item = { type: 'holzblock', progress: 1, from: 'W' };
  assert.deepEqual(jammedFeeds(state, machine), []);
  assert.deepEqual(clearFeed(state, machine), {});
  assert.equal(state.belts['19,10'].item.type, 'holzblock');
});
