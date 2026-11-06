import { test } from 'node:test';
import assert from 'node:assert/strict';

import { BELT_COST, BUILDINGS, BUILD_MENU } from '../src/core/data/buildings.js';
import { ITEMS } from '../src/core/data/items.js';
import { CUSTOMERS, SHOP_LEVELS, TEST_PACK } from '../src/core/data/shop.js';
import { buildBeltPath, buyBeltPath, extendTrace, removeBelt } from '../src/core/belts.js';
import { buyBuilding, placeBuilding, removeBuilding } from '../src/core/buildings.js';
import {
  applyTestPack,
  buyRaw,
  checkBailout,
  clearCounter,
  fillCounter,
  isBroke,
  serveCustomer,
  setCounterItem,
} from '../src/core/market.js';
import { loadInput } from '../src/core/production.js';
import { simulate } from '../src/core/sim.js';
import { deserializeGame, serializeGame } from '../src/core/save.js';
import { canAfford, missingFor, storageCount } from '../src/core/shop.js';
import { createNewGame } from '../src/core/state.js';

// Leeres Grundstück (ohne Startgebäude) mit bestimmtem Lager.
function emptyGame(storage = {}, gold = 0) {
  const state = createNewGame(42);
  state.buildings = [];
  state.storage = { ...storage };
  state.gold = gold;
  return state;
}

function path(state, from, to) {
  return buildBeltPath(state, extendTrace([from], to));
}

// ---------- Händler ----------

test('Händler: Rohstoff kaufen kostet Gold und landet im Laden-Lager', () => {
  const state = emptyGame({}, 1000);
  assert.equal(buyRaw(state, 'holzstamm'), 'ok');
  assert.equal(state.gold, 1000 - ITEMS.holzstamm.buyPrice);
  assert.equal(storageCount(state, 'holzstamm'), 1);
  assert.equal(buyRaw(state, 'holzstamm'), 'gold', 'zu wenig Gold');
  assert.equal(storageCount(state, 'holzstamm'), 1);
  assert.equal(buyRaw(state, 'holzplatte'), 'invalid', 'nur Rohstoffe');
});

test('Händler: Bei vollem Laden-Lager gibt es nichts', () => {
  const state = emptyGame({ holzblock: SHOP_LEVELS[1].storage }, 5000);
  state.shopLevel = 3;
  assert.equal(buyRaw(state, 'eisenerz'), 'full');
  assert.equal(state.gold, 5000);
});

test('Preise des Händlers wie festgelegt: Holz und Stein 550, Eisen 2.200', () => {
  assert.equal(ITEMS.holzstamm.buyPrice, 550);
  assert.equal(ITEMS.felsbrocken.buyPrice, 550);
  assert.equal(ITEMS.eisenerz.buyPrice, 2200);
});

// ---------- Theken ----------

test('Theken: zu Beginn 2 Stück, leer', () => {
  const state = createNewGame(1);
  assert.equal(state.counters.length, 2);
  assert.ok(state.counters.every((c) => c.type === null && c.count === 0));
});

test('Theke bestücken: höchstens 20 Stück, aus dem Laden-Lager', () => {
  const state = emptyGame({ holzplatte: 30 });
  assert.ok(setCounterItem(state, 0, 'holzplatte'));
  assert.equal(fillCounter(state, 0, 5), 5);
  assert.equal(fillCounter(state, 0), 15, 'Auffüllen bis 20');
  assert.equal(fillCounter(state, 0), 0, 'voll');
  assert.deepEqual(state.counters[0], { type: 'holzplatte', count: 20 });
  assert.equal(storageCount(state, 'holzplatte'), 10);
});

test('Theke: nicht mehr als im Lager liegt; Rohstoffe dürfen nicht auf die Theke', () => {
  const state = emptyGame({ holzstab: 3, holzstamm: 2 });
  assert.equal(setCounterItem(state, 1, 'holzstamm'), false);
  setCounterItem(state, 1, 'holzstab');
  assert.equal(fillCounter(state, 1, 10), 3);
  assert.equal(storageCount(state, 'holzstab'), 0);
});

test('Theke umstellen oder abräumen: Waren kommen zurück ins Lager', () => {
  const state = emptyGame({ holzplatte: 10, steinplatte: 10 });
  setCounterItem(state, 0, 'holzplatte');
  fillCounter(state, 0, 8);
  setCounterItem(state, 0, 'steinplatte');
  assert.equal(storageCount(state, 'holzplatte'), 10, 'alte Sorte zurück');
  assert.deepEqual(state.counters[0], { type: 'steinplatte', count: 0 });
  fillCounter(state, 0, 4);
  clearCounter(state, 0);
  assert.equal(storageCount(state, 'steinplatte'), 10);
  assert.deepEqual(state.counters[0], { type: null, count: 0 });
});

// ---------- Kunden ----------

test('Kunde kauft 1–3 Stück zum festen Wert und zahlt in Gold', () => {
  const state = emptyGame({ holzplatte: 20, eisenstange: 20 });
  setCounterItem(state, 0, 'holzplatte');
  fillCounter(state, 0);
  setCounterItem(state, 1, 'eisenstange');
  fillCounter(state, 1);
  for (let i = 0; i < 10; i++) {
    const before = { gold: state.gold, a: state.counters[0].count, b: state.counters[1].count };
    const sale = serveCustomer(state);
    const boughtA = before.a - state.counters[0].count;
    const boughtB = before.b - state.counters[1].count;
    assert.ok(boughtA + boughtB >= CUSTOMERS.minItems && boughtA + boughtB <= CUSTOMERS.maxItems);
    const gold = boughtA * ITEMS.holzplatte.price + boughtB * ITEMS.eisenstange.price;
    assert.equal(state.gold - before.gold, gold);
    assert.equal(sale.gold, gold);
  }
});

test('Leere Theken: Kunde geht ohne Kauf', () => {
  const state = emptyGame({ holzplatte: 5 });
  assert.equal(serveCustomer(state), null);
  assert.equal(state.gold, 0);
});

test('Kunden kommen alle 10–30 Sekunden (im Schnitt etwa 6 Stück pro Minute)', () => {
  const state = emptyGame({ holzplatte: 1000 });
  setCounterItem(state, 0, 'holzplatte');
  let sold = 0;
  let customers = 0;
  let lastId = 0;
  // 1 Stunde, Theke immer wieder auffüllen
  for (let minute = 0; minute < 60; minute++) {
    fillCounter(state, 0);
    simulate(state, 60);
    const sales = state.market.sales.filter((s) => s.id > lastId);
    if (state.market.sales.length) lastId = state.market.sales[0].id;
    customers += sales.length;
  }
  sold = 1000 - storageCount(state, 'holzplatte') - state.counters[0].count;
  assert.ok(customers === state.market.nextSaleId - 1);
  assert.ok(customers >= 60 * 2 && customers <= 60 * 6, `${customers} Kunden in einer Stunde`);
  assert.ok(sold >= customers && sold <= customers * 3);
  assert.equal(state.gold, sold * ITEMS.holzplatte.price);
});

test('Kunden-Zufall wiederholt sich mit demselben Startwert', () => {
  const run = () => {
    const state = emptyGame({ holzplatte: 20, holzstab: 20 });
    setCounterItem(state, 0, 'holzplatte');
    fillCounter(state, 0);
    setCounterItem(state, 1, 'holzstab');
    fillCounter(state, 1);
    simulate(state, 120);
    return { gold: state.gold, counters: state.counters };
  };
  assert.deepEqual(run(), run());
});

test('Letzte Verkäufe: höchstens 5, der neueste zuerst', () => {
  const state = emptyGame({ holzplatte: 20 });
  setCounterItem(state, 0, 'holzplatte');
  fillCounter(state, 0);
  for (let i = 0; i < 8; i++) serveCustomer(state);
  assert.equal(state.market.sales.length, 5);
  assert.ok(state.market.sales[0].id > state.market.sales[1].id);
});

// ---------- Baukosten ----------

test('Jedes Gebäude im Baumenü hat Baukosten aus vorhandenen Waren', () => {
  for (const type of BUILD_MENU) {
    const cost = BUILDINGS[type].cost;
    assert.ok(cost && Object.keys(cost).length > 0, `${type} hat keine Kosten`);
    for (const [item, n] of Object.entries(cost)) {
      assert.ok(ITEMS[item] && !ITEMS[item].raw, `${type}: ${item} ist keine herstellbare Ware`);
      assert.ok(Number.isInteger(n) && n > 0);
    }
  }
  assert.deepEqual(BELT_COST, { holzblock: 1 });
});

test('Das Sägewerk kostet nur Holzblöcke – sonst käme man am Anfang nie an Platten', () => {
  assert.deepEqual(Object.keys(BUILDINGS.saegewerk.cost), ['holzblock']);
  assert.deepEqual(Object.keys(BUILDINGS.versandportal.cost), ['holzblock']);
});

test('Kein Gebäude kostet mehr, als ein Rohstoff seiner Stufe einbringt', () => {
  for (const type of BUILD_MENU) {
    const worth = Object.entries(BUILDINGS[type].cost).reduce((sum, [item, n]) => sum + ITEMS[item].price * n, 0);
    assert.ok(worth <= ITEMS.holzstamm.buyPrice, `${type} kostet ${worth} Gold an Waren`);
  }
});

test('Bauen zieht die Kosten ab, Abreißen gibt sie zurück', () => {
  const state = emptyGame({ holzblock: 50 });
  const saw = buyBuilding(state, 'saegewerk', 14, 8);
  assert.ok(saw && saw.id, 'gebaut');
  assert.equal(storageCount(state, 'holzblock'), 10);
  assert.deepEqual(saw.paid, { holzblock: 40 });
  assert.equal(buyBuilding(state, 'saegewerk', 20, 8), 'cost', 'zweites Sägewerk: zu wenig Holzblöcke');
  assert.equal(state.buildings.length, 1);
  removeBuilding(state, saw.id);
  assert.equal(storageCount(state, 'holzblock'), 50);
});

test('Ohne Platz wird nichts bezahlt', () => {
  const state = emptyGame({ holzblock: 100 });
  buyBuilding(state, 'saegewerk', 14, 8);
  assert.equal(buyBuilding(state, 'saegewerk', 15, 8), null);
  assert.equal(storageCount(state, 'holzblock'), 60);
});

test('Gratis-Gebäude (Start, alte Spielstände) geben beim Abreißen keine Baukosten zurück', () => {
  const state = emptyGame({});
  const b = placeBuilding(state, 'lagerhaus', 14, 8);
  removeBuilding(state, b.id);
  assert.deepEqual(state.storage, {});
});

test('missingFor nennt, was zum Bauen fehlt', () => {
  const state = emptyGame({ holzplatte: 4, holzstab: 20 });
  assert.deepEqual(missingFor(state, BUILDINGS.holzfaeller.cost), { holzplatte: 6 });
  assert.equal(canAfford(state, BUILDINGS.holzfaeller.cost), false);
});

test('Förderband: 1 Holzblock je neues Feld; Abreißen gibt ihn zurück', () => {
  const state = emptyGame({ holzblock: 10 });
  const result = buyBeltPath(state, path(state, { x: 12, y: 8 }, { x: 15, y: 8 }));
  assert.deepEqual(result, { created: 4, cut: 0 });
  assert.equal(storageCount(state, 'holzblock'), 6);
  assert.equal(state.belts['12,8'].paid, true);
  removeBelt(state, 15, 8);
  assert.equal(storageCount(state, 'holzblock'), 7);
});

test('Förderband: Aufteilen über bestehende Bänder kostet nur die neuen Felder', () => {
  const state = emptyGame({ holzblock: 10 });
  buyBeltPath(state, path(state, { x: 12, y: 8 }, { x: 15, y: 8 }));
  buyBeltPath(state, path(state, { x: 13, y: 8 }, { x: 13, y: 10 }));
  assert.deepEqual(state.belts['13,8'].outs, ['E', 'S']);
  assert.equal(storageCount(state, 'holzblock'), 10 - 4 - 2);
});

test('Förderband: Reichen die Holzblöcke nicht, wird die Strecke gekürzt', () => {
  const state = emptyGame({ holzblock: 3 });
  const result = buyBeltPath(state, path(state, { x: 12, y: 8 }, { x: 19, y: 8 }));
  assert.deepEqual(result, { created: 3, cut: 5 });
  assert.equal(storageCount(state, 'holzblock'), 0);
  assert.ok(state.belts['14,8'] && !state.belts['15,8']);
});

test('Förderband: Alte, unbezahlte Bänder geben beim Abreißen nichts zurück', () => {
  const state = emptyGame({});
  state.belts['12,8'] = { outs: ['E'] };
  removeBelt(state, 12, 8);
  assert.deepEqual(state.storage, {});
});

// ---------- Neues Spiel bis zum ersten Verkauf ----------

test('Neues Spiel: Bänder zum Versandportal bauen, Holzblöcke kommen an und lassen sich verkaufen', () => {
  const state = createNewGame(7);
  // Holzfäller (10,6) gibt bei (12,6) aus; Versandportal (14,9) nimmt von links (13,9) an.
  const first = buyBeltPath(state, buildBeltPath(state, extendTrace(extendTrace([{ x: 12, y: 6 }], { x: 13, y: 6 }), { x: 13, y: 9 })));
  // Strecke endet auf (13,9) und muss noch ins Portal zeigen
  const last = buyBeltPath(state, { tiles: [{ x: 13, y: 9 }], endDir: 'E' });
  assert.equal(first.created, 5);
  assert.equal(last.created, 0);
  assert.deepEqual(state.belts['13,9'].outs, ['E']);
  assert.equal(storageCount(state, 'holzblock'), 15);
  assert.ok(loadInput(state, state.buildings[0]));
  simulate(state, 120);
  assert.ok(storageCount(state, 'holzblock') > 30, `Blöcke im Lager: ${storageCount(state, 'holzblock')}`);
  setCounterItem(state, 0, 'holzblock');
  fillCounter(state, 0);
  simulate(state, 120);
  assert.ok(state.gold > 0, 'Kunden haben gekauft');
});

// ---------- Pleiteschutz ----------

test('Pleiteschutz: Wer nichts mehr hat, bekommt einen Holzstamm geschenkt', () => {
  const state = emptyGame({ holzblock: 10 }, 100);
  assert.ok(isBroke(state));
  assert.ok(checkBailout(state));
  assert.equal(storageCount(state, 'holzstamm'), 1);
  assert.equal(state.market.gifts, 1);
  assert.equal(checkBailout(state), false, 'nur einmal, solange der Stamm da ist');
});

test('Pleiteschutz greift nicht, solange noch etwas geht', () => {
  assert.equal(isBroke(emptyGame({}, 600)), false, 'genug Gold');
  assert.equal(isBroke(emptyGame({ felsbrocken: 1 }, 0)), false, 'Rohstoff im Lager');
  assert.equal(isBroke(emptyGame({ holzplatte: 40 }, 0)), false, 'Waren im Wert von 720 Gold');
  const state = emptyGame({ holzplatte: 20 }, 300);
  assert.equal(isBroke(state), false, 'Gold und Waren zusammen reichen');
  setCounterItem(state, 0, 'holzplatte');
  fillCounter(state, 0);
  assert.equal(isBroke(state), false, 'Waren auf der Theke zählen mit');
  const working = createNewGame(3);
  working.storage = {};
  working.gold = 0;
  loadInput(working, working.buildings[0]); // kein Stamm im Lager → klappt nicht
  working.buildings[0].prod.loaded = true;
  working.buildings[0].prod.remaining = 100;
  assert.equal(isBroke(working), false, 'Holzfäller arbeitet noch');
});

test('Pleiteschutz läuft in der Simulation mit', () => {
  const state = emptyGame({}, 0);
  simulate(state, 1);
  assert.equal(storageCount(state, 'holzstamm'), 1);
  simulate(state, 10);
  assert.equal(storageCount(state, 'holzstamm'), 1);
});

// ---------- Testpaket ----------

test('Testpaket: 1.000 Gold und 50 von jeder Ware (ohne Rohstoffe)', () => {
  const state = emptyGame({});
  state.shopLevel = 3;
  applyTestPack(state);
  assert.equal(state.gold, TEST_PACK.gold);
  assert.equal(storageCount(state, 'holzplatte'), 50);
  assert.equal(storageCount(state, 'eisenstange'), 50);
  assert.equal(storageCount(state, 'holzstamm'), 0);
  for (const type of BUILD_MENU) assert.ok(canAfford(state, BUILDINGS[type].cost), `${type} baubar`);
});

test('Testpaket auf Level 1: nur Holz-Waren', () => {
  const state = emptyGame({});
  applyTestPack(state);
  assert.deepEqual(state.storage, { holzblock: 50, holzplatte: 50, holzstab: 50 });
});

// ---------- Speichern ----------

test('Theken, Kunden und bezahlte Baukosten werden mitgespeichert', () => {
  const state = emptyGame({ holzblock: 60, holzplatte: 20 });
  buyBuilding(state, 'saegewerk', 14, 8);
  buyBeltPath(state, path(state, { x: 12, y: 12 }, { x: 15, y: 12 }));
  setCounterItem(state, 0, 'holzplatte');
  fillCounter(state, 0);
  serveCustomer(state);
  const loaded = deserializeGame(serializeGame(state));
  assert.ok(loaded);
  assert.deepEqual(loaded.state, state);
});

test('Beschädigte Theken oder Kunden-Daten werden erkannt', () => {
  const bad = (change) => {
    const state = createNewGame(5);
    change(state);
    return deserializeGame(serializeGame(state));
  };
  assert.equal(bad((s) => (s.counters[0] = { type: 'holzstamm', count: 2 })), null);
  assert.equal(bad((s) => (s.counters[0] = { type: null, count: 2 })), null);
  assert.equal(bad((s) => delete s.market), null);
  assert.equal(bad((s) => (s.market.rng = -1)), null);
  assert.equal(bad((s) => (s.buildings[0].paid = { holzblock: -1 })), null);
});
