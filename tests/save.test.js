import { test } from 'node:test';
import assert from 'node:assert/strict';

import { applyBeltPath, buildBeltPath, extendTrace } from '../src/core/belts.js';
import { placeBuilding } from '../src/core/buildings.js';
import { loadInput } from '../src/core/production.js';
import { simulate } from '../src/core/sim.js';
import { footprintSize, buildingPorts } from '../src/core/geometry.js';
import { SAVE_VERSION, deserializeGame, isValidState, serializeGame } from '../src/core/save.js';
import { createNewGame } from '../src/core/state.js';

function sampleGame() {
  const state = createNewGame();
  placeBuilding(state, 'saegewerk', 15, 8, 1);
  let trace = extendTrace([], { x: 12, y: 6 });
  trace = extendTrace(trace, { x: 14, y: 6 });
  applyBeltPath(state, buildBeltPath(state, trace));
  loadInput(state, state.buildings[0]);
  simulate(state, 30); // Waren auf dem Band und im Gebäude
  return state;
}

test('Speichern und Laden ergibt denselben Spielstand', () => {
  const state = sampleGame();
  const loaded = deserializeGame(serializeGame(state, 1234));
  assert.ok(loaded);
  assert.equal(loaded.savedAt, 1234);
  assert.deepEqual(loaded.state, state);
});

test('Waren auf Bändern und Zustand der Gebäude werden mitgespeichert', () => {
  const state = sampleGame();
  assert.ok(Object.values(state.belts).some((b) => b.item), 'Testaufbau hat Waren auf dem Band');
  const loaded = deserializeGame(serializeGame(state));
  assert.deepEqual(loaded.state.belts, state.belts);
  assert.deepEqual(loaded.state.buildings[0].prod, state.buildings[0].prod);
  assert.deepEqual(loaded.state.storage, state.storage);
});

test('Spielstand aus v0.4 (Version 1) wird umgewandelt, die Fabrik bleibt erhalten', () => {
  const v1 = {
    gold: 100,
    shopLevel: 1,
    world: { width: 32, height: 20 },
    plot: { x: 8, y: 5, width: 16, height: 10 },
    buildings: [
      { id: 1, type: 'holzfaeller', x: 10, y: 6, rot: 1 },
      { id: 3, type: 'saegewerk', x: 15, y: 11, rot: 0 },
    ],
    nextBuildingId: 4,
    belts: { '12,6': { outs: ['E'] }, '13,6': { outs: ['E', 'S'] } },
  };
  const loaded = deserializeGame(JSON.stringify({ saveVersion: 1, savedAt: 5, state: v1 }));
  assert.ok(loaded, 'wird angenommen');
  assert.equal(loaded.migratedFrom, 1);
  assert.equal(loaded.state.buildings.length, 2);
  assert.equal(loaded.state.buildings[0].rot, 1);
  assert.deepEqual(loaded.state.belts['13,6'].outs, ['E', 'S']);
  assert.equal(loaded.state.buildings[0].prod.loaded, false);
  assert.equal(loaded.state.buildings[1].prod.recipe, 'holzplatte');
  assert.ok(loaded.state.storage.holzstamm > 0, 'Startvorrat dazu');
});

// Spielstand aus v0.5 (Version 2): Sägewerk und Steinmetz noch 2 × 1, mit Winkeln und Splitt.
function v2Game() {
  return {
    gold: 100,
    shopLevel: 1,
    world: { width: 32, height: 20 },
    plot: { x: 8, y: 5, width: 16, height: 10 },
    buildings: [
      { id: 1, type: 'holzfaeller', x: 10, y: 6, rot: 0, prod: { loaded: false, remaining: 0, timer: 0, out: null, blocked: false } },
      // 1) ungedreht, unten frei → wächst nach unten
      { id: 2, type: 'saegewerk', x: 14, y: 6, rot: 0, prod: { recipe: 'holzwinkel', stock: { holzblock: 3 }, busy: false, timer: 0, out: { type: 'holzwinkel', count: 1 }, blocked: true } },
      // 2) gedreht (Eingang oben), links frei → wächst nach links, Anschlüsse bleiben
      { id: 3, type: 'steinmetz', x: 19, y: 6, rot: 1, prod: { recipe: 'splitt', stock: {}, busy: false, timer: 0, out: null, blocked: false } },
      // 3) ungedreht, darunter ein Lagerhaus → muss rücken
      { id: 4, type: 'saegewerk', x: 14, y: 10, rot: 0, prod: { recipe: 'holzstab', stock: {}, busy: false, timer: 0, out: null, blocked: false } },
      { id: 5, type: 'lagerhaus', x: 14, y: 11, rot: 0, prod: { slots: [{ type: 'splitt', count: 7 }, { type: 'holzblock', count: 2 }], blocked: false } },
    ],
    nextBuildingId: 6,
    belts: { '13,6': { outs: ['E'], item: { type: 'holzwinkel', progress: 0.5, from: 'W' } } },
    storage: { holzstamm: 2, holzwinkel: 10, holzplatte: 1, splitt: 4 },
  };
}

test('Spielstand aus v0.5 (Version 2) wird auf den Techbaum umgestellt', () => {
  const v2 = v2Game();
  const loaded = deserializeGame(JSON.stringify({ saveVersion: 2, savedAt: 5, state: v2 }));
  assert.ok(loaded, 'wird angenommen');
  assert.equal(loaded.migratedFrom, 2);
  const s = loaded.state;
  const byId = (id) => s.buildings.find((b) => b.id === id);

  // Waren umbenannt, Eisenerz dazu
  assert.deepEqual(s.storage, { holzstamm: 2, holzplatte: 11, steinzahnrad: 4, eisenerz: 2 });
  assert.equal(s.belts['13,6'].item.type, 'holzplatte');
  assert.equal(byId(2).prod.recipe, 'holzplatte');
  assert.deepEqual(byId(2).prod.out, { type: 'holzplatte', count: 1 });
  assert.equal(byId(3).prod.recipe, 'steinzahnrad');
  assert.equal(byId(4).prod.recipe, 'holzstab');
  assert.deepEqual(byId(5).prod.slots[0], { type: 'steinzahnrad', count: 7 });

  // 1) wächst nach unten, Anschlüsse bleiben
  assert.deepEqual([byId(2).x, byId(2).y], [14, 6]);
  assert.deepEqual(
    buildingPorts(byId(2)).map((p) => [p.kind, p.outside.x, p.outside.y]),
    [
      ['in', 13, 6],
      ['out', 16, 6],
    ],
  );
  // 2) gedreht: Anschlüsse bleiben bei x = 19
  assert.deepEqual([byId(3).x, byId(3).y], [18, 6]);
  assert.deepEqual(
    buildingPorts(byId(3)).map((p) => [p.kind, p.outside.x, p.outside.y]),
    [
      ['in', 19, 5],
      ['out', 19, 8],
    ],
  );
  // 3) ist gerückt und überlappt nichts
  const moved = byId(4);
  assert.ok(moved, 'nicht abgerissen');
  for (const other of s.buildings) {
    if (other === moved) continue;
    const ox = [other.x, other.x + footprintSize(other.type, other.rot).width];
    const oy = [other.y, other.y + footprintSize(other.type, other.rot).height];
    const overlap = moved.x < ox[1] && moved.x + 2 > ox[0] && moved.y < oy[1] && moved.y + 2 > oy[0];
    assert.equal(overlap, false, `überlappt nicht mit ${other.type}`);
  }
  assert.equal(loaded.notes.length, 1, 'Hinweis auf das versetzte Gebäude');
  assert.ok(isValidState(s));

  // Der umgewandelte Spielstand lässt sich speichern und wieder laden
  const again = deserializeGame(serializeGame(s));
  assert.deepEqual(again.state, s);
  assert.equal(again.migratedFrom, undefined);
});

test('Passt eine gewachsene Maschine nirgends hin, kommt ihr Inhalt ins Laden-Lager', () => {
  const v2 = v2Game();
  v2.buildings = [v2.buildings[1]]; // Sägewerk 2 × 1 bei (14,6)
  v2.storage = {};
  // Alles andere auf dem (gewachsenen) Grundstück ist mit Bändern belegt.
  v2.belts = {};
  for (let y = 5; y < 5 + 14; y++) {
    for (let x = 8; x < 8 + 22; x++) if (!(y === 6 && (x === 14 || x === 15))) v2.belts[`${x},${y}`] = { outs: ['E'] };
  }
  const loaded = deserializeGame(JSON.stringify({ saveVersion: 2, savedAt: 5, state: v2 }));
  assert.ok(loaded);
  assert.equal(loaded.state.buildings.length, 0, 'abgerissen');
  assert.deepEqual(loaded.state.storage, { eisenerz: 2, holzblock: 3, holzplatte: 1 });
  assert.equal(loaded.notes.length, 1);
});

test('Spielstand aus v0.6.0 (Version 3): Grundstück wächst nach rechts und unten, alles bleibt an seinem Platz', () => {
  const v3 = createNewGame();
  v3.world = { width: 32, height: 20 };
  v3.plot = { x: 8, y: 5, width: 16, height: 10 };
  const before = JSON.stringify(v3.buildings);
  const loaded = deserializeGame(JSON.stringify({ saveVersion: 3, savedAt: 5, state: v3 }));
  assert.ok(loaded);
  assert.equal(loaded.migratedFrom, 3);
  assert.deepEqual(loaded.state.plot, { x: 8, y: 5, width: 22, height: 14 });
  assert.deepEqual(loaded.state.world, { width: 40, height: 26 });
  assert.equal(JSON.stringify(loaded.state.buildings), before, 'Gebäude unverändert');
  assert.deepEqual(loaded.state.storage, v3.storage, 'kein Geschenk doppelt');
  assert.deepEqual(loaded.notes, []);
});

test('Neues Spiel startet mit 22 × 14 Feldern', () => {
  const s = createNewGame();
  assert.deepEqual([s.plot.width, s.plot.height], [22, 14]);
  assert.ok(s.plot.x + s.plot.width < s.world.width && s.plot.y + s.plot.height < s.world.height, 'gesperrte Fläche rundherum');
});

test('Kaputte oder fremde Daten werden abgelehnt', () => {
  assert.equal(deserializeGame('kein json'), null);
  assert.equal(deserializeGame('null'), null);
  assert.equal(deserializeGame(JSON.stringify({ saveVersion: SAVE_VERSION + 1, state: createNewGame() })), null);
  assert.equal(deserializeGame(JSON.stringify({ saveVersion: SAVE_VERSION })), null);
});

test('Ungültige Inhalte im Spielstand werden erkannt', () => {
  const cases = {
    'unbekanntes Gebäude': (s) => (s.buildings[0].type = 'raumschiff'),
    'doppelte ID': (s) => (s.buildings[1].id = s.buildings[0].id),
    'Drehung ungültig': (s) => (s.buildings[0].rot = 7),
    'Band ohne Ausgang': (s) => (s.belts['12,6'].outs = []),
    'Band-Richtung ungültig': (s) => (s.belts['12,6'].outs = ['X']),
    'Band-Schlüssel ungültig': (s) => (s.belts['a,b'] = { outs: ['E'] }),
    'Gold fehlt': (s) => delete s.gold,
    'Grundstück außerhalb der Welt': (s) => (s.plot.width = 999),
    'nextBuildingId zu klein': (s) => (s.nextBuildingId = 1),
    'Laden-Lager fehlt': (s) => delete s.storage,
    'unbekannte Ware im Lager': (s) => (s.storage.gold = 5),
    'Ware auf Band ungültig': (s) => (s.belts['12,6'].item = { type: 'holzblock', progress: 2, from: 'W' }),
    'Gebäudezustand fehlt': (s) => delete s.buildings[0].prod,
    'Rezept passt nicht zum Gebäude': (s) => (s.buildings.find((b) => b.type === 'saegewerk').prod.recipe = 'steinplatte'),
    'alte Ware in aktuellem Spielstand': (s) => (s.storage.holzwinkel = 3),
  };
  for (const [name, breakIt] of Object.entries(cases)) {
    const state = sampleGame();
    breakIt(state);
    assert.equal(deserializeGame(serializeGame(state)), null, name);
  }
});
