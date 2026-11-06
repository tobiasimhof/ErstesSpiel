import { test } from 'node:test';
import assert from 'node:assert/strict';

import { LAND } from '../src/core/data/land.js';
import { buyBuilding } from '../src/core/buildings.js';
import { LAND_SIDES, buyLand, landOffer, landOffers, landSideAt, pricePerField } from '../src/core/land.js';
import { deserializeGame, serializeGame } from '../src/core/save.js';
import { createNewGame, isOwned } from '../src/core/state.js';

function richGame(gold = 100000) {
  const state = createNewGame(3);
  state.gold = gold;
  return state;
}

test('Erster Streifen rechts: 2 × 14 = 28 Felder für 280 Gold', () => {
  const state = richGame(1000);
  const offer = landOffer(state, 'E');
  assert.deepEqual(offer, { side: 'E', depth: 2, x: 30, y: 5, width: 2, height: 14, fields: 28, price: 280 });
  assert.equal(LAND.strip, 2);
  assert.equal(buyLand(state, 'E'), 'ok');
  assert.equal(state.gold, 720);
  assert.deepEqual(state.plot, { x: 8, y: 5, width: 24, height: 14 });
  assert.equal(state.landBought, 1);
  assert.ok(isOwned(state, 31, 10), 'neue Felder gehören dazu');
});

test('Jeder Kauf macht jedes Feld 20 % teurer', () => {
  const state = richGame();
  assert.equal(pricePerField(state), 10);
  buyLand(state, 'E');
  assert.equal(landOffer(state, 'E').price, 340, '28 Felder × 12 Gold = 336 → 340');
  buyLand(state, 'E');
  assert.ok(Math.abs(pricePerField(state) - 14.4) < 1e-9);
  // unten: inzwischen 26 Felder breit
  assert.deepEqual([landOffer(state, 'S').fields, landOffer(state, 'S').price], [52, 750]);
  assert.ok(landOffers(state).every((o) => o.price % LAND.roundTo === 0), 'auf 10 Gold gerundet');
});

test('Links und oben kaufen: Grundstück wächst, Gebäude und Bänder bleiben an ihrem Platz', () => {
  const state = richGame();
  const before = JSON.stringify({ buildings: state.buildings, belts: state.belts });
  assert.equal(buyLand(state, 'W'), 'ok');
  assert.equal(buyLand(state, 'N'), 'ok');
  assert.deepEqual(state.plot, { x: 6, y: 3, width: 24, height: 16 });
  assert.equal(JSON.stringify({ buildings: state.buildings, belts: state.belts }), before);
  // Auf der neuen Fläche lässt sich bauen (auch in der Ecke oben links)
  state.storage.holzblock = 100;
  assert.equal(typeof buyBuilding(state, 'saegewerk', 6, 3, 0), 'object');
});

test('Zu wenig Gold: nichts passiert', () => {
  const state = richGame(279);
  assert.equal(buyLand(state, 'E'), 'gold');
  assert.equal(state.gold, 279);
  assert.deepEqual(state.plot, { x: 8, y: 5, width: 22, height: 14 });
  assert.equal(state.landBought, 0);
});

test('Am Rand der Welt ist Schluss; der letzte Streifen ist notfalls schmaler', () => {
  const state = richGame(1e9);
  // oben sind 5 Reihen frei: 2 + 2 + 1
  assert.equal(landOffer(state, 'N').depth, 2);
  buyLand(state, 'N');
  buyLand(state, 'N');
  assert.equal(landOffer(state, 'N').depth, 1);
  buyLand(state, 'N');
  assert.equal(landOffer(state, 'N'), null);
  assert.equal(buyLand(state, 'N'), 'edge');
  assert.equal(state.plot.y, 0);
});

test('Die ganze Welt lässt sich kaufen (40 × 26 Felder, gut dreimal so viel wie zum Start)', () => {
  const state = richGame(1e12);
  const start = state.plot.width * state.plot.height;
  let buys = 0;
  while (landOffers(state).length > 0) {
    buyLand(state, landOffers(state)[0].side);
    buys++;
  }
  assert.deepEqual(state.plot, { x: 0, y: 0, width: 40, height: 26 });
  assert.ok((40 * 26) / start > 3);
  assert.equal(buys, 3 + 5 + 4 + 4, 'oben 3, rechts 5, unten 4, links 4 Streifen');
});

test('Antippen der gesperrten Fläche: Seite wird erkannt, Ecken und eigene Felder nicht', () => {
  const state = createNewGame();
  // Grundstück: x 8–29, y 5–18
  assert.equal(landSideAt(state, 7, 10), 'W');
  assert.equal(landSideAt(state, 0, 10), 'W', 'auch weiter weg');
  assert.equal(landSideAt(state, 30, 5), 'E');
  assert.equal(landSideAt(state, 39, 18), 'E');
  assert.equal(landSideAt(state, 8, 4), 'N');
  assert.equal(landSideAt(state, 29, 25), 'S');
  assert.equal(landSideAt(state, 7, 4), null, 'Ecke');
  assert.equal(landSideAt(state, 30, 19), null, 'Ecke');
  assert.equal(landSideAt(state, 10, 10), null, 'eigenes Feld');
  assert.equal(landSideAt(state, -1, 10), null, 'außerhalb der Welt');
  assert.deepEqual(LAND_SIDES, ['N', 'E', 'S', 'W']);
});

test('Gekaufte Fläche wird mitgespeichert', () => {
  const state = richGame();
  buyLand(state, 'S');
  buyLand(state, 'W');
  const loaded = deserializeGame(serializeGame(state));
  assert.deepEqual(loaded.state.plot, state.plot);
  assert.equal(loaded.state.landBought, 2);
  assert.equal(landOffer(loaded.state, 'E').price, landOffer(state, 'E').price);
});
