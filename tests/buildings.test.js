import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  canPlaceBuilding,
  findFreeSpot,
  moveBuilding,
  placeBuilding,
  removeBuilding,
  rotateBuilding,
} from '../src/core/buildings.js';
import { buildingPorts, footprintSize, rotateLocal } from '../src/core/geometry.js';
import { createNewGame, buildingAt } from '../src/core/state.js';

function emptyGame() {
  const state = createNewGame();
  state.buildings = [];
  return state;
}

test('Drehung vertauscht Breite und Höhe', () => {
  assert.deepEqual(footprintSize('saegewerk', 0), { width: 2, height: 1 });
  assert.deepEqual(footprintSize('saegewerk', 1), { width: 1, height: 2 });
  assert.deepEqual(footprintSize('saegewerk', 2), { width: 2, height: 1 });
});

test('rotateLocal dreht Felder im Uhrzeigersinn', () => {
  // 2×1: links (0,0) wird nach einer Drehung zu oben (0,0), rechts (1,0) zu unten (0,1)
  assert.deepEqual(rotateLocal(0, 0, 2, 1, 1), { x: 0, y: 0 });
  assert.deepEqual(rotateLocal(1, 0, 2, 1, 1), { x: 0, y: 1 });
  // vier Drehungen ergeben wieder den Anfang
  assert.deepEqual(rotateLocal(1, 0, 2, 1, 4), { x: 1, y: 0 });
});

test('Ein- und Ausgänge drehen mit dem Gebäude', () => {
  const saw = { id: 1, type: 'saegewerk', x: 10, y: 10, rot: 0 };
  let ports = buildingPorts(saw);
  assert.deepEqual(
    ports.map((p) => [p.kind, p.side, p.outside.x, p.outside.y]),
    [
      ['in', 'W', 9, 10],
      ['out', 'E', 12, 10],
    ],
  );
  saw.rot = 1; // Eingang oben, Ausgang unten
  ports = buildingPorts(saw);
  assert.deepEqual(
    ports.map((p) => [p.kind, p.side, p.outside.x, p.outside.y]),
    [
      ['in', 'N', 10, 9],
      ['out', 'S', 10, 12],
    ],
  );
});

test('Gebäude lassen sich nur auf freie, eigene Fläche bauen', () => {
  const state = emptyGame();
  const p = state.plot;
  assert.ok(canPlaceBuilding(state, 'saegewerk', p.x, p.y, 0));
  assert.equal(canPlaceBuilding(state, 'saegewerk', p.x - 1, p.y, 0), false, 'ragt links heraus');
  assert.equal(canPlaceBuilding(state, 'saegewerk', p.x + p.width - 1, p.y, 0), false, 'ragt rechts heraus');
  assert.equal(canPlaceBuilding(state, 'gibtsnicht', p.x, p.y, 0), false);

  const placed = placeBuilding(state, 'saegewerk', p.x, p.y, 0);
  assert.ok(placed);
  assert.equal(canPlaceBuilding(state, 'saegewerk', p.x + 1, p.y, 0), false, 'überlappt');
  assert.equal(placeBuilding(state, 'saegewerk', p.x + 1, p.y, 0), null);

  state.belts['20,10'] = { outs: ['E'] };
  assert.equal(canPlaceBuilding(state, 'saegewerk', 19, 10, 0), false, 'Band im Weg');
});

test('Verschieben ignoriert das eigene Gebäude, aber keine anderen', () => {
  const state = emptyGame();
  const a = placeBuilding(state, 'holzfaeller', 10, 6, 0);
  const b = placeBuilding(state, 'holzfaeller', 14, 6, 0);
  assert.ok(moveBuilding(state, a.id, 11, 6, 0), 'um ein Feld überlappend mit sich selbst');
  assert.equal(moveBuilding(state, a.id, 13, 6, 0), false, 'würde b überlappen');
  assert.equal(a.x, 11);
  assert.equal(buildingAt(state, 14, 6), b);
});

test('Drehen an Ort und Stelle klappt nur mit Platz', () => {
  const state = emptyGame();
  const saw = placeBuilding(state, 'saegewerk', 10, 10, 0); // (10,10),(11,10)
  assert.ok(rotateBuilding(state, saw.id)); // jetzt (10,10),(10,11)
  assert.equal(saw.rot, 1);
  placeBuilding(state, 'saegewerk', 11, 10, 0); // (11,10),(12,10) – blockiert die nächste Drehung
  assert.equal(rotateBuilding(state, saw.id), false);
  assert.equal(saw.rot, 1, 'Drehung bleibt bei fehlgeschlagenem Versuch erhalten');
});

test('Drehen scheitert, wenn ein anderes Gebäude im Weg ist', () => {
  const state = emptyGame();
  const saw = placeBuilding(state, 'saegewerk', 10, 10, 0); // belegt (10,10),(11,10)
  placeBuilding(state, 'saegewerk', 10, 11, 0); // belegt (10,11),(11,11)
  assert.equal(rotateBuilding(state, saw.id), false, '1×2 bräuchte (10,11)');
  assert.equal(saw.rot, 0);
});

test('Abreißen entfernt das Gebäude', () => {
  const state = createNewGame();
  const first = state.buildings[0];
  assert.ok(removeBuilding(state, first.id));
  assert.equal(buildingAt(state, first.x, first.y), null);
  assert.equal(removeBuilding(state, first.id), false);
});

test('findFreeSpot findet die nächste freie Stelle', () => {
  const state = emptyGame();
  const spot = findFreeSpot(state, 'saegewerk', 0, 15, 9);
  assert.deepEqual(spot, { x: 15, y: 9 });
  placeBuilding(state, 'saegewerk', 15, 9, 0);
  const next = findFreeSpot(state, 'saegewerk', 0, 15, 9);
  assert.ok(next && canPlaceBuilding(state, 'saegewerk', next.x, next.y, 0));
  assert.ok(Math.abs(next.x - 15) <= 1 && Math.abs(next.y - 9) <= 1, 'direkt daneben');
  assert.equal(findFreeSpot(state, 'saegewerk', 0, 0, 0, null, 2), null, 'außerhalb nichts frei');
});
