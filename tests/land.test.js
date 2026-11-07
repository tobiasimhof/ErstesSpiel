import { test } from 'node:test';
import assert from 'node:assert/strict';

import { LAND } from '../src/core/data/land.js';
import { buyBuilding } from '../src/core/buildings.js';
import { LAND_SIDES, buyLand, landBuysLeft, landOffer, landOffers, landPrice, landSideAt, stripDepth } from '../src/core/land.js';
import { deserializeGame, serializeGame } from '../src/core/save.js';
import { WORLD, createNewGame, isInWorld, isOwned } from '../src/core/state.js';

function richGame(gold = 100000) {
  const state = createNewGame(3);
  state.gold = gold;
  return state;
}

test('Datentabelle (v0.10.2): 4 Reihen je Kauf, 500 Gold, jede Seite 2×', () => {
  assert.deepEqual(LAND, { depth: 4, perSide: 2, price: 500, roundTo: 10 });
  assert.equal(stripDepth(), 4);
});

test('Die Welt reicht auf jeder Seite genau 2 Streifen über das Startgrundstück hinaus', () => {
  const state = createNewGame();
  assert.deepEqual(WORLD, { x: 0, y: -3, width: 38, height: 30 });
  assert.deepEqual(state.world, WORLD);
  assert.deepEqual(state.plot, { x: 8, y: 5, width: 22, height: 14 });
  for (const side of LAND_SIDES) assert.equal(landBuysLeft(state, side), 2, side);
});

test('Erster Streifen rechts: 4 × 14 = 56 Felder für 500 Gold', () => {
  const state = richGame(1000);
  const offer = landOffer(state, 'E');
  assert.deepEqual(offer, { side: 'E', depth: 4, x: 30, y: 5, width: 4, height: 14, fields: 56, price: 500 });
  assert.equal(buyLand(state, 'E'), 'ok');
  assert.equal(state.gold, 500);
  assert.deepEqual(state.plot, { x: 8, y: 5, width: 26, height: 14 });
  assert.equal(state.landBought, 1);
  assert.ok(isOwned(state, 33, 10), 'neue Felder gehören dazu');
});

test('Schon auf Level 1 sind Streifen 4 tief – auf jedem Level gleich', () => {
  for (const level of [1, 3, 4, 6]) {
    const state = richGame();
    state.shopLevel = level;
    assert.deepEqual([landOffer(state, 'W').depth, landOffer(state, 'N').depth], [4, 4], `Level ${level}`);
  }
  const state = richGame();
  assert.deepEqual([landOffer(state, 'N').fields, landOffer(state, 'N').price], [88, 500], 'oben 4 × 22 Felder');
});

test('Der Preis steigt nicht: jeder Kauf kostet 500 Gold', () => {
  const state = richGame(1e6);
  const prices = [];
  for (const side of ['E', 'E', 'S', 'N', 'W', 'S', 'W', 'N']) {
    prices.push(landOffer(state, side).price);
    const gold = state.gold;
    assert.equal(buyLand(state, side), 'ok', side);
    assert.equal(gold - state.gold, 500, `${side} kostet 500 Gold`);
  }
  assert.deepEqual(prices, Array(8).fill(500));
  assert.equal(state.landBought, 8);
});

test('Jede Seite lässt sich 2× erweitern, danach ist dort Schluss', () => {
  const state = richGame(1e6);
  assert.equal(landBuysLeft(state, 'N'), 2);
  assert.equal(buyLand(state, 'N'), 'ok');
  assert.equal(landBuysLeft(state, 'N'), 1);
  assert.equal(buyLand(state, 'N'), 'ok');
  assert.equal(landBuysLeft(state, 'N'), 0);
  assert.equal(landOffer(state, 'N'), null);
  assert.equal(buyLand(state, 'N'), 'edge');
  assert.equal(state.plot.y, -3, 'oben bis an den Rand der Welt');
  assert.equal(state.gold, 1e6 - 1000);
  // Die anderen Seiten sind davon unberührt
  for (const side of ['E', 'S', 'W']) assert.equal(landBuysLeft(state, side), 2, side);
});

test('Alles gekauft: 38 × 30 Felder für 8 × 500 = 4.000 Gold, fast viermal so viel wie zum Start', () => {
  const state = richGame(4000);
  const start = state.plot.width * state.plot.height;
  let buys = 0;
  while (landOffers(state).length > 0) {
    assert.equal(buyLand(state, landOffers(state)[0].side), 'ok');
    buys++;
  }
  assert.equal(buys, 8, 'je Seite 2 Käufe');
  assert.equal(state.gold, 0);
  assert.deepEqual(state.plot, { x: 0, y: -3, width: 38, height: 30 });
  assert.deepEqual(state.plot, { ...state.world });
  assert.ok((38 * 30) / start > 3.6);
});

test('Links und oben kaufen: Grundstück wächst, Gebäude und Bänder bleiben an ihrem Platz', () => {
  const state = richGame();
  const before = JSON.stringify({ buildings: state.buildings, belts: state.belts });
  assert.equal(buyLand(state, 'W'), 'ok');
  assert.equal(buyLand(state, 'N'), 'ok');
  assert.deepEqual(state.plot, { x: 4, y: 1, width: 26, height: 18 });
  assert.equal(buyLand(state, 'N'), 'ok');
  assert.deepEqual(state.plot, { x: 4, y: -3, width: 26, height: 22 });
  assert.equal(JSON.stringify({ buildings: state.buildings, belts: state.belts }), before);
  // Auf der neuen Fläche lässt sich bauen (auch in der Ecke oben links, bei y < 0)
  state.storage.holzblock = 100;
  assert.equal(typeof buyBuilding(state, 'saegewerk', 4, -3, 0), 'object');
});

test('Zu wenig Gold: nichts passiert', () => {
  const state = richGame(499);
  assert.equal(buyLand(state, 'E'), 'gold');
  assert.equal(state.gold, 499);
  assert.deepEqual(state.plot, { x: 8, y: 5, width: 22, height: 14 });
  assert.equal(state.landBought, 0);
});

test('Rest-Streifen (aus alten Spielständen) kosten anteilig weniger', () => {
  assert.deepEqual([1, 2, 3, 4, 5].map(landPrice), [130, 250, 380, 500, 500]);
  // Spielstand von vor v0.10.2: rechts schon 2 Spalten gekauft
  const state = richGame(1e6);
  state.plot.width += 2;
  assert.equal(landBuysLeft(state, 'E'), 2);
  assert.deepEqual([landOffer(state, 'E').depth, landOffer(state, 'E').price], [4, 500]);
  buyLand(state, 'E');
  assert.deepEqual([landOffer(state, 'E').depth, landOffer(state, 'E').price], [2, 250], 'Rest: 2 Spalten für 250 Gold');
  buyLand(state, 'E');
  assert.equal(landOffer(state, 'E'), null);
  assert.equal(state.plot.x + state.plot.width, 38);
});

test('Antippen der gesperrten Fläche: Seite wird erkannt, Ecken und eigene Felder nicht', () => {
  const state = createNewGame();
  // Grundstück: x 8–29, y 5–18; Welt: x 0–37, y −3–26
  assert.equal(landSideAt(state, 7, 10), 'W');
  assert.equal(landSideAt(state, 0, 10), 'W', 'auch weiter weg');
  assert.equal(landSideAt(state, 30, 5), 'E');
  assert.equal(landSideAt(state, 37, 18), 'E');
  assert.equal(landSideAt(state, 8, 4), 'N');
  assert.equal(landSideAt(state, 8, -3), 'N', 'oberste Reihe der Welt');
  assert.equal(landSideAt(state, 29, 26), 'S');
  assert.equal(landSideAt(state, 7, 4), null, 'Ecke');
  assert.equal(landSideAt(state, 30, 19), null, 'Ecke');
  assert.equal(landSideAt(state, 10, 10), null, 'eigenes Feld');
  assert.equal(landSideAt(state, -1, 10), null, 'außerhalb der Welt');
  assert.equal(landSideAt(state, 10, -4), null, 'außerhalb der Welt');
  assert.equal(landSideAt(state, 38, 10), null, 'außerhalb der Welt');
  assert.equal(isInWorld(state, 0, -3), true);
  assert.equal(isInWorld(state, 37, 26), true);
  assert.equal(isInWorld(state, 37, 27), false);
  assert.deepEqual(LAND_SIDES, ['N', 'E', 'S', 'W']);
});

test('Gekaufte Fläche wird mitgespeichert, auch oberhalb von Reihe 0', () => {
  const state = richGame();
  buyLand(state, 'S');
  buyLand(state, 'W');
  buyLand(state, 'N');
  buyLand(state, 'N');
  const loaded = deserializeGame(serializeGame(state));
  assert.ok(loaded);
  assert.deepEqual(loaded.state.plot, state.plot);
  assert.deepEqual(loaded.state.world, state.world);
  assert.equal(loaded.state.landBought, 4);
  assert.equal(landOffer(loaded.state, 'N'), null);
  assert.equal(landOffer(loaded.state, 'E').price, 500);
});
