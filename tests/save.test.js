import { test } from 'node:test';
import assert from 'node:assert/strict';

import { applyBeltPath, buildBeltPath, extendTrace } from '../src/core/belts.js';
import { placeBuilding } from '../src/core/buildings.js';
import { SAVE_VERSION, deserializeGame, serializeGame } from '../src/core/save.js';
import { createNewGame } from '../src/core/state.js';

function sampleGame() {
  const state = createNewGame();
  placeBuilding(state, 'saegewerk', 15, 8, 1);
  let trace = extendTrace([], { x: 12, y: 6 });
  trace = extendTrace(trace, { x: 14, y: 6 });
  applyBeltPath(state, buildBeltPath(state, trace));
  return state;
}

test('Speichern und Laden ergibt denselben Spielstand', () => {
  const state = sampleGame();
  const loaded = deserializeGame(serializeGame(state, 1234));
  assert.ok(loaded);
  assert.equal(loaded.savedAt, 1234);
  assert.deepEqual(loaded.state, state);
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
  };
  for (const [name, breakIt] of Object.entries(cases)) {
    const state = sampleGame();
    breakIt(state);
    assert.equal(deserializeGame(serializeGame(state)), null, name);
  }
});
