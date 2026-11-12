// v0.14.0: Spiel im Hintergrund (Fabrik läuft weiter, bis etwas leer ist),
// Rohstoff-Vorrat (bis zu 3 je Gebäude) und „Auffüllen“.
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { applyBeltPath, buildBeltPath, extendTrace } from '../src/core/belts.js';
import { placeBuilding, removeBuilding } from '../src/core/buildings.js';
import { BUILDINGS } from '../src/core/data/buildings.js';
import { OFFLINE } from '../src/core/data/offline.js';
import { refillPlan, refillSource, setCounterAmount, setCounterItem } from '../src/core/market.js';
import { catchUp, catchUpProgress, offlineReport, runCatchUp, startCatchUp } from '../src/core/offline.js';
import { buildingContents, buildingStatus, loadInput, sourceCount, sourceRoom } from '../src/core/production.js';
import { deserializeGame, serializeGame } from '../src/core/save.js';
import { storageCount } from '../src/core/shop.js';
import { TICK, simulate } from '../src/core/sim.js';
import { createNewGame } from '../src/core/state.js';

function emptyGame() {
  const state = createNewGame(7);
  state.buildings = [];
  state.belts = {};
  state.storage = {};
  state.gold = 0;
  return state;
}

function drag(state, points) {
  let trace = [];
  for (const [x, y] of points) trace = extendTrace(trace, { x, y });
  applyBeltPath(state, buildBeltPath(state, trace));
}

// Holzfäller (10,6) → Band → Sägewerk (16,6) → Band → Versandportal (21,6)
function woodFactory(state = emptyGame()) {
  const wood = placeBuilding(state, 'holzfaeller', 10, 6, 0);
  drag(state, [
    [12, 6],
    [15, 6],
  ]);
  const saw = placeBuilding(state, 'saegewerk', 16, 6, 0);
  drag(state, [
    [18, 6],
    [20, 6],
  ]);
  placeBuilding(state, 'versandportal', 21, 6, 0);
  return { state, wood, saw };
}

const clone = (state) => deserializeGame(serializeGame(state)).state;

// ---------- Rohstoff-Vorrat ----------

test('Datentabelle: Holzfällerlager, Steinbruch und Schmelzhütte fassen je 3 Rohstoffe (Tobias)', () => {
  for (const type of ['holzfaeller', 'steinbruch', 'schmelzhuette']) {
    assert.equal(BUILDINGS[type].production.capacity, 3, type);
  }
});

test('Vorrat: 3 Holzstämme werden nacheinander zu 600 Holzblöcken (45 Minuten)', () => {
  const state = emptyGame();
  const wood = placeBuilding(state, 'holzfaeller', 10, 6, 0);
  drag(state, [
    [12, 6],
    [14, 6],
  ]);
  placeBuilding(state, 'versandportal', 15, 6, 0);
  state.shopLevel = 4; // Laden-Lager mit 1.000 Plätzen
  state.storage.holzstamm = 3;
  for (let i = 0; i < 3; i++) assert.ok(loadInput(state, wood));
  assert.equal(sourceCount(wood), 3);
  assert.equal(sourceRoom(wood), 0);
  assert.match(buildingStatus(state, wood).text, /Danach noch 2 Holzstämme\./);
  simulate(state, 900 + 30);
  assert.equal(sourceCount(wood), 2, 'nach 15 Minuten ist der erste verarbeitet, der zweite läuft');
  assert.ok(wood.prod.loaded);
  simulate(state, 1800);
  assert.equal(storageCount(state, 'holzblock'), 600);
  assert.equal(sourceCount(wood), 0);
  assert.equal(buildingStatus(state, wood).text, 'Leer – Rohstoff nachlegen.');
});

test('Vorrat: Abreißen gibt wartende Rohstoffe zurück, der angefangene geht verloren', () => {
  const state = emptyGame();
  const wood = placeBuilding(state, 'holzfaeller', 10, 6, 0);
  state.storage.holzstamm = 3;
  for (let i = 0; i < 3; i++) loadInput(state, wood);
  simulate(state, 10);
  assert.deepEqual(buildingContents(wood), { holzblock: 1, holzstamm: 2 });
  removeBuilding(state, wood.id);
  assert.equal(storageCount(state, 'holzstamm'), 2);
});

test('Spielstand: Vorrat wird mitgespeichert; zu viel oder ohne laufenden Rohstoff ist ungültig', () => {
  const state = emptyGame();
  const wood = placeBuilding(state, 'holzfaeller', 10, 6, 0);
  state.storage.holzstamm = 2;
  loadInput(state, wood);
  loadInput(state, wood);
  const loaded = deserializeGame(serializeGame(state));
  assert.deepEqual([loaded.state.buildings[0].prod.loaded, loaded.state.buildings[0].prod.queued], [true, 1]);
  for (const change of [(p) => (p.queued = 3), (p) => (p.queued = -1), (p) => Object.assign(p, { loaded: false, queued: 1 }), (p) => delete p.queued]) {
    const bad = clone(state);
    change(bad.buildings[0].prod);
    assert.equal(deserializeGame(serializeGame(bad)), null, change.toString());
  }
});

test('Spielstand aus v0.13 (Version 11): Rohstoff-Gebäude bekommen einen leeren Vorrat', () => {
  const v11 = emptyGame();
  const wood = placeBuilding(v11, 'holzfaeller', 10, 6, 0);
  v11.storage.holzstamm = 1;
  loadInput(v11, wood);
  delete wood.prod.queued;
  const loaded = deserializeGame(JSON.stringify({ saveVersion: 11, savedAt: 1, state: v11 }));
  assert.ok(loaded);
  assert.deepEqual(loaded.notes, []);
  const prod = loaded.state.buildings[0].prod;
  assert.deepEqual([prod.loaded, prod.remaining, prod.queued], [true, 200, 0]);
});

// ---------- Auffüllen ----------

test('Auffüllen: erst aus dem Laden-Lager, was fehlt, wird beim Händler gekauft', () => {
  const state = emptyGame();
  state.shopLevel = 3;
  const wood = placeBuilding(state, 'holzfaeller', 10, 6, 0);
  state.storage.holzstamm = 1;
  state.gold = 400;
  assert.deepEqual(refillPlan(state, wood), { input: 'holzstamm', room: 3, fromStorage: 1, buy: 2, cost: 366, short: 0 });
  refillSource(state, wood);
  assert.deepEqual([sourceCount(wood), storageCount(state, 'holzstamm'), state.gold], [3, 0, 34]);
  assert.deepEqual(refillPlan(state, wood), { input: 'holzstamm', room: 0, fromStorage: 0, buy: 0, cost: 0, short: 0 });
});

test('Auffüllen: kauft nur so viel, wie das Gold reicht; braucht keinen Platz im Laden-Lager', () => {
  const state = emptyGame();
  state.shopLevel = 3;
  const smelter = placeBuilding(state, 'schmelzhuette', 10, 6, 0);
  state.storage = { holzblock: 500 }; // Laden-Lager voll
  state.gold = 1600;
  assert.deepEqual(refillPlan(state, smelter), { input: 'eisenerz', room: 3, fromStorage: 0, buy: 2, cost: 1464, short: 1 });
  refillSource(state, smelter);
  assert.equal(sourceCount(smelter), 2);
  assert.equal(state.gold, 136);
});

test('Auffüllen: gesperrte Rohstoffe werden nicht gekauft', () => {
  const state = emptyGame();
  state.shopLevel = 1;
  const quarry = placeBuilding(state, 'steinbruch', 10, 6, 0);
  state.gold = 5000;
  assert.equal(refillPlan(state, quarry).buy, 0);
  assert.equal(refillPlan(state, placeBuilding(state, 'saegewerk', 14, 6, 0)), null, 'kein Rohstoff-Gebäude');
});

// ---------- Spiel im Hintergrund ----------

test('Hintergrund: Die Fabrik läuft weiter, bis die Rohstoffe verbraucht sind – genau wie im laufenden Spiel', () => {
  const { state, wood } = woodFactory();
  state.storage.holzstamm = 3;
  for (let i = 0; i < 3; i++) loadInput(state, wood);
  const live = clone(state);
  const report = catchUp(state, 3 * 3600);
  simulate(live, 3 * 3600);
  assert.deepEqual(state.storage, live.storage);
  assert.deepEqual(state.buildings, live.buildings);
  assert.deepEqual(state.belts, live.belts);
  assert.equal(storageCount(state, 'holzplatte'), 120, '3 Holzstämme → 600 Blöcke → 120 Holzplatten');
  assert.deepEqual(report.stored, { holzplatte: 120 });
  assert.deepEqual(report.emptied, { holzfaeller: 1 });
  assert.equal(report.running, false);
});

test('Hintergrund: Steht die Fabrik still, rechnet nur noch der Laden (Schnelldurchlauf)', () => {
  const { state, wood } = woodFactory();
  state.storage.holzstamm = 1;
  loadInput(state, wood);
  const job = startCatchUp(state, 24 * 3600);
  assert.ok(runCatchUp(job));
  // 1 Holzstamm: 15 Minuten plus etwas Weg – danach nur noch Kunden
  assert.ok(job.still, 'Stillstand erkannt');
  const ticks = Math.round((24 * 3600) / TICK);
  assert.equal(job.done, ticks);
  assert.equal(storageCount(state, 'holzplatte'), 40);
});

test('Hintergrund: Kunden kaufen weiter, bis die Theken leer sind', () => {
  const state = emptyGame();
  state.storage = { holzplatte: 40, holzstab: 10 };
  setCounterItem(state, 0, 'holzplatte');
  setCounterAmount(state, 0, 20);
  setCounterItem(state, 1, 'holzstab');
  setCounterAmount(state, 1, 10);
  const live = clone(state);
  const report = catchUp(state, 8 * 3600);
  simulate(live, 8 * 3600);
  assert.deepEqual(state.counters, [
    { type: 'holzplatte', count: 0 },
    { type: 'holzstab', count: 0 },
  ]);
  assert.equal(state.gold, 30 * 6, '30 Teile à 6 Gold');
  assert.equal(state.gold, live.gold, 'genau wie im laufenden Spiel');
  assert.deepEqual(report.sold, { holzplatte: 20, holzstab: 10 });
  assert.equal(report.gold, 180);
  assert.equal(report.countersEmpty, true);
  assert.equal(storageCount(state, 'holzplatte'), 20, 'das Laden-Lager füllt die Theken nicht von selbst nach');
});

test('Hintergrund: Ist das Laden-Lager voll, staut sich alles', () => {
  const { state, wood } = woodFactory();
  state.storage = { holzblock: 495, holzstamm: 1 };
  loadInput(state, wood);
  const report = catchUp(state, 3600);
  assert.equal(storageCount(state, 'holzplatte'), 5);
  assert.equal(report.storageFull, true);
  assert.equal(report.running, false);
});

test('Hintergrund: Laufen Waren endlos im Kreis, rechnet die Fabrik höchstens maxBusySeconds Takt für Takt', () => {
  const state = emptyGame();
  // Ein Ring aus Bändern mit einer Ware darauf
  drag(state, [
    [10, 6],
    [13, 6],
    [13, 8],
    [10, 8],
    [10, 7],
  ]);
  state.belts['10,7'].outs = ['N'];
  state.belts['10,6'].item = { type: 'holzplatte', progress: 0, from: 'S' };
  const job = startCatchUp(state, 10 * 24 * 3600);
  assert.ok(runCatchUp(job));
  assert.equal(job.still, false);
  assert.equal(Object.values(state.belts).filter((b) => b.item).length, 1, 'die Ware ist noch da');
  assert.ok(OFFLINE.maxBusySeconds <= 4 * 3600, 'bleibt auf dem Tablet schnell genug');
});

test('Hintergrund: in Stücken nachrechnen ergibt dasselbe, Fortschritt steigt bis 1', () => {
  const a = woodFactory().state;
  a.storage.holzstamm = 2;
  loadInput(a, a.buildings[0]);
  loadInput(a, a.buildings[0]);
  const b = clone(a);
  const job = startCatchUp(a, 2 * 3600);
  let last = 0;
  let parts = 0;
  while (!runCatchUp(job, 997)) {
    const progress = catchUpProgress(job);
    assert.ok(progress >= last && progress < 1);
    last = progress;
    parts++;
  }
  assert.equal(catchUpProgress(job), 1);
  assert.ok(parts > 5);
  catchUp(b, 2 * 3600);
  assert.deepEqual(a.storage, b.storage);
  assert.deepEqual(offlineReport(job).stored, { holzplatte: 80 });
});

test('Hintergrund: keine oder negative Zeit (Uhr zurückgestellt) ändert nichts', () => {
  const { state, wood } = woodFactory();
  state.storage.holzstamm = 1;
  loadInput(state, wood);
  const before = serializeGame(state, 0);
  for (const seconds of [0, -500, NaN]) {
    const report = catchUp(state, seconds);
    assert.equal(report.seconds, 0);
  }
  assert.equal(serializeGame(state, 0), before);
});
