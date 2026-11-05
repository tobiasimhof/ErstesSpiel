import { test } from 'node:test';
import assert from 'node:assert/strict';

import { applyBeltPath, buildBeltPath, extendTrace } from '../src/core/belts.js';
import { placeBuilding } from '../src/core/buildings.js';
import { loadInput } from '../src/core/production.js';
import { simulate } from '../src/core/sim.js';
import { SAVE_VERSION, deserializeGame, serializeGame } from '../src/core/save.js';
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
  assert.equal(loaded.state.buildings[1].prod.recipe, 'holzwinkel');
  assert.ok(loaded.state.storage.holzstamm > 0, 'Startvorrat dazu');
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
    'Rezept passt nicht zum Gebäude': (s) => (s.buildings.find((b) => b.type === 'saegewerk').prod.recipe = 'splitt'),
  };
  for (const [name, breakIt] of Object.entries(cases)) {
    const state = sampleGame();
    breakIt(state);
    assert.equal(deserializeGame(serializeGame(state)), null, name);
  }
});
