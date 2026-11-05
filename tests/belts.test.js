import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  applyBeltPath,
  buildBeltPath,
  extendTrace,
  inputSides,
  interpolateTiles,
  removeBelt,
  rotateBelt,
} from '../src/core/belts.js';
import { placeBuilding } from '../src/core/buildings.js';
import { createNewGame, beltAt } from '../src/core/state.js';

function emptyGame() {
  const state = createNewGame();
  state.buildings = [];
  return state;
}

// Zieht eine Strecke über die angegebenen Eckpunkte (wie mit dem Finger).
function drag(state, points) {
  let trace = [];
  for (const [x, y] of points) trace = extendTrace(trace, { x, y });
  const path = buildBeltPath(state, trace);
  applyBeltPath(state, path);
  return path;
}

const outs = (state, x, y) => beltAt(state, x, y)?.outs ?? null;

test('Lücken in der Fingerspur werden aufgefüllt', () => {
  assert.deepEqual(interpolateTiles({ x: 0, y: 0 }, { x: 3, y: 0 }), [
    { x: 1, y: 0 },
    { x: 2, y: 0 },
    { x: 3, y: 0 },
  ]);
  const diagonal = interpolateTiles({ x: 0, y: 0 }, { x: 2, y: 2 });
  assert.equal(diagonal.length, 4, 'nur Schritte zu direkten Nachbarn');
});

test('Gerade Strecke zeigt in Zugrichtung, auch das letzte Feld', () => {
  const state = emptyGame();
  drag(state, [
    [10, 8],
    [13, 8],
  ]);
  for (const x of [10, 11, 12, 13]) assert.deepEqual(outs(state, x, 8), ['E']);
});

test('Kurven entstehen automatisch', () => {
  const state = emptyGame();
  drag(state, [
    [10, 8],
    [12, 8],
    [12, 10],
  ]);
  assert.deepEqual(outs(state, 11, 8), ['E']);
  assert.deepEqual(outs(state, 12, 8), ['S']);
  assert.deepEqual(outs(state, 12, 10), ['S']);
});

test('Ein einzelnes Antippen legt kein Band', () => {
  const state = emptyGame();
  drag(state, [[10, 8]]);
  assert.deepEqual(state.belts, {});
});

test('Zurückziehen nimmt das letzte Stück wieder weg', () => {
  const state = emptyGame();
  drag(state, [
    [10, 8],
    [14, 8],
    [12, 8],
  ]);
  assert.ok(beltAt(state, 12, 8));
  assert.equal(beltAt(state, 13, 8), null);
  assert.equal(beltAt(state, 14, 8), null);
  assert.deepEqual(outs(state, 12, 8), ['E']);
});

test('Bänder enden an gesperrter Fläche, gehen aber weiter, wenn der Finger zurückkommt', () => {
  const state = emptyGame();
  const top = state.plot.y;
  drag(state, [
    [12, top],
    [12, top - 2], // in die gesperrte Fläche
    [12, top], // zurück
    [14, top],
  ]);
  assert.deepEqual(outs(state, 12, top), ['E']);
  assert.ok(beltAt(state, 14, top));
  assert.equal(beltAt(state, 12, top - 1), null);
});

test('Aufteilen: Ziehen von einem bestehenden Band fügt einen Ausgang hinzu', () => {
  const state = emptyGame();
  drag(state, [
    [10, 8],
    [14, 8],
  ]);
  drag(state, [
    [12, 8],
    [12, 6],
  ]); // nach oben abzweigen
  assert.deepEqual(outs(state, 12, 8), ['N', 'E']);
  assert.deepEqual(outs(state, 12, 7), ['N']);
  drag(state, [
    [12, 8],
    [12, 10],
  ]); // nach unten abzweigen → 1 Strecke wird zu 3
  assert.deepEqual(outs(state, 12, 8), ['N', 'E', 'S']);
});

test('Aufteilen in 4 Strecken durch zweimaliges Abzweigen', () => {
  const state = emptyGame();
  drag(state, [
    [10, 9],
    [16, 9],
  ]);
  drag(state, [
    [12, 9],
    [12, 7],
    [16, 7],
  ]);
  drag(state, [
    [14, 9],
    [14, 11],
    [16, 11],
  ]);
  drag(state, [
    [14, 7],
    [14, 5],
    [16, 5],
  ]);
  // Enden: (16,5), (16,7), (16,9), (16,11)
  for (const y of [5, 7, 9, 11]) assert.ok(beltAt(state, 16, y), `Strecke bei y=${y}`);
  assert.equal(outs(state, 12, 9).length, 2);
  assert.equal(outs(state, 14, 9).length, 2);
  assert.equal(outs(state, 14, 7).length, 2);
});

test('Zusammenführen: Strecke endet seitlich auf einem bestehenden Band', () => {
  const state = emptyGame();
  drag(state, [
    [10, 8],
    [14, 8],
  ]);
  drag(state, [
    [12, 11],
    [12, 9],
    [12, 8],
  ]);
  assert.deepEqual(outs(state, 12, 8), ['E'], 'bestehendes Band bleibt unverändert');
  assert.deepEqual(outs(state, 12, 9), ['N']);
  assert.deepEqual(inputSides(state, 12, 8).sort(), ['S', 'W']);
});

test('Das Ende einer Strecke lässt sich umlenken statt aufzuteilen', () => {
  const state = emptyGame();
  drag(state, [
    [10, 8],
    [12, 8],
  ]); // Ende (12,8) zeigt nach rechts ins Leere
  drag(state, [
    [12, 8],
    [12, 10],
  ]);
  assert.deepEqual(outs(state, 12, 8), ['S'], 'Ausgang ins Leere wurde ersetzt');
});

test('Eine Strecke kann in ein Gebäude führen', () => {
  const state = emptyGame();
  placeBuilding(state, 'saegewerk', 14, 8, 0); // Eingang links bei (13,8)
  const path = drag(state, [
    [10, 8],
    [15, 8],
  ]);
  assert.equal(path.endDir, 'E');
  assert.deepEqual(outs(state, 13, 8), ['E']);
  assert.equal(beltAt(state, 14, 8), null, 'kein Band im Gebäude');
});

test('Gebäude-Ausgänge zählen als Eingang des Bandes davor', () => {
  const state = emptyGame();
  placeBuilding(state, 'holzfaeller', 10, 6, 0); // Ausgang rechts oben → Feld (12,6)
  drag(state, [
    [12, 6],
    [14, 6],
  ]);
  assert.deepEqual(inputSides(state, 12, 6), ['W']);
});

test('Drehen dreht alle Ausgänge im Uhrzeigersinn', () => {
  const state = emptyGame();
  state.belts['12,8'] = { outs: ['N', 'E'] };
  rotateBelt(state, 12, 8);
  assert.deepEqual(outs(state, 12, 8), ['E', 'S']);
});

test('Abreißen räumt Ausgänge der Nachbarn auf, die hineinzeigten', () => {
  const state = emptyGame();
  drag(state, [
    [10, 8],
    [14, 8],
  ]);
  drag(state, [
    [12, 8],
    [12, 6],
  ]);
  assert.ok(removeBelt(state, 12, 7));
  assert.deepEqual(outs(state, 12, 8), ['E'], 'Abzweig nach oben entfernt');
  assert.ok(removeBelt(state, 13, 8));
  assert.deepEqual(outs(state, 12, 8), ['E'], 'letzter Ausgang bleibt erhalten');
  assert.equal(removeBelt(state, 13, 8), false);
});
