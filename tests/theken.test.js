// v0.24.0: Theken kaufen, langsamer verkaufen (Tobias, Chat 17 und 19).
// Jede Theke hat ihre eigenen Kunden; wie schnell sie kaufen, hängt vom
// Level ab. Jeder Laden beginnt mit 2 Theken, weitere kauft man mit Gold.
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { ITEMS } from '../src/core/data/items.js';
import { COUNTERS, CUSTOMERS, SHOP_LEVELS } from '../src/core/data/shop.js';
import {
  buyCounter,
  counterSlots,
  customerRange,
  customerSeconds,
  fillCounter,
  nextCounterPrice,
  setCounterItem,
} from '../src/core/market.js';
import { levelUp } from '../src/core/levels.js';
import { xpNeeded } from '../src/core/quests.js';
import { catchUp } from '../src/core/offline.js';
import { SAVE_VERSION, deserializeGame, serializeGame } from '../src/core/save.js';
import { simulate } from '../src/core/sim.js';
import { storageCapacity, storageCount, storageTotal } from '../src/core/shop.js';
import { createNewGame } from '../src/core/state.js';

// Laden ohne Gebäude auf einem Level, mit reichlich Ware im Laden-Lager.
function shop(level, counters = COUNTERS.start) {
  const state = createNewGame(19);
  state.buildings = [];
  state.belts = {};
  state.shopLevel = level;
  state.gold = 0;
  state.storage = { holzplatte: 100000, zirkel: 100000 };
  while (state.counters.length < counters) state.counters.push({ type: null, count: 0 });
  return state;
}

// Verkauft so viele Minuten und hält die gewählten Theken voll.
// Gibt die verkauften Stück je Theke zurück.
function sellFor(state, minutes, stocked) {
  for (const i of stocked) setCounterItem(state, i, 'holzplatte');
  const sold = state.counters.map(() => 0);
  for (let m = 0; m < minutes; m++) {
    for (const i of stocked) fillCounter(state, i);
    const before = state.counters.map((c) => c.count);
    simulate(state, 60);
    state.counters.forEach((c, i) => (sold[i] += before[i] - c.count));
  }
  return sold;
}

const near = (value, expected, share = 0.08) => Math.abs(value - expected) <= expected * share;

// ---------- Tempo je Level ----------

test('Tempo je Theke: Level 1–3 3 Stück pro Minute, ab Level 4 1,5, ab Level 7 0,75', () => {
  const expected = { 1: 3, 2: 3, 3: 3, 4: 1.5, 5: 1.5, 6: 1.5, 7: 0.75, 8: 0.75 };
  for (const [level, perMinute] of Object.entries(expected)) {
    assert.equal(SHOP_LEVELS[level].perCounter, perMinute, `Level ${level}`);
  }
  // Ein Kunde kauft 1 Stück: Level 1–3 alle 15–25 s, ab Level 4 alle 30–50 s, ab Level 7 alle 60–100 s
  assert.deepEqual([CUSTOMERS.minItems, CUSTOMERS.maxItems], [1, 1]);
  assert.deepEqual(customerRange(1), { min: 15, max: 25 });
  assert.deepEqual(customerRange(4), { min: 30, max: 50 });
  assert.deepEqual(customerRange(7), { min: 60, max: 100 });
  assert.equal(customerSeconds(8), 80);
});

test('Eine volle Theke verkauft je Level so schnell wie geplant (10 Stunden gemessen)', () => {
  for (const [level, perHour] of [
    [1, 180],
    [4, 90],
    [7, 45],
  ]) {
    const state = shop(level);
    const [sold] = sellFor(state, 600, [0]);
    assert.ok(near(sold, perHour * 10), `Level ${level}: ${sold} Stück in 10 Stunden (erwartet etwa ${perHour * 10})`);
  }
});

test('Die 2 Start-Theken zusammen: 6 / 3 / 1,5 Stück pro Minute', () => {
  for (const [level, perHour] of [
    [2, 360],
    [5, 180],
    [8, 90],
  ]) {
    const state = shop(level);
    const sold = sellFor(state, 600, [0, 1]);
    const total = sold[0] + sold[1];
    assert.ok(near(total, perHour * 10), `Level ${level}: ${total} Stück in 10 Stunden (erwartet etwa ${perHour * 10})`);
    assert.ok(near(sold[0], sold[1], 0.15), `beide Theken verkaufen etwa gleich viel (${sold})`);
  }
});

test('Jede Theke verkauft für sich: Eine leere Theke verkauft nichts, die andere nicht schneller', () => {
  const state = shop(8);
  const sold = sellFor(state, 600, [0]);
  assert.equal(sold[1], 0);
  assert.equal(state.counters[1].count, 0);
  assert.ok(near(sold[0], 450), `nur Theke 1 verkauft, im gleichen Tempo (${sold[0]})`);
  assert.equal(state.gold, sold[0] * ITEMS.holzplatte.price);
});

test('Jede gekaufte Theke legt ihren Anteil drauf: Level 8 mit 3 Theken etwa 2,25 Stück pro Minute', () => {
  const state = shop(8, 3);
  const sold = sellFor(state, 600, [0, 1, 2]);
  const total = sold.reduce((a, b) => a + b, 0);
  assert.ok(near(total, 1350), `${total} Stück in 10 Stunden (erwartet etwa 1.350)`);
  assert.ok(sold.every((n) => near(n, 450, 0.15)), `jede Theke etwa 450 (${sold})`);
});

test('Verkäufe merken sich ihre Theke', () => {
  const state = shop(1);
  sellFor(state, 3, [1]);
  assert.ok(state.market.sales.length > 0);
  assert.ok(state.market.sales.every((sale) => sale.counter === 1));
});

// ---------- Theken kaufen ----------

test('Jeder Laden beginnt mit 2 Theken und je einem Kunden-Takt', () => {
  const state = createNewGame(3);
  assert.equal(state.counters.length, 2);
  assert.equal(state.market.timers.length, 2);
  assert.equal(state.market.timer, undefined);
  assert.ok(state.market.timers.every((t) => t >= 15 && t <= 25));
});

test('Theken kaufen: 3. für 15.000, 4. für 35.000, 5. für 70.000 Gold – die 6. kommt später', () => {
  assert.deepEqual(COUNTERS.prices, [15000, 35000, 70000, null]);
  const state = createNewGame(5);
  state.gold = 14999;
  assert.equal(nextCounterPrice(state), 15000);
  assert.equal(buyCounter(state), 'gold');
  assert.equal(state.gold, 14999, 'zu wenig Gold: nichts passiert');
  assert.equal(state.counters.length, 2);
  state.gold = 15000;
  assert.equal(buyCounter(state), 'ok');
  assert.equal(state.gold, 0);
  assert.equal(state.counters.length, 3);
  assert.deepEqual(state.counters[2], { type: null, count: 0 });
  assert.equal(state.market.timers.length, 3, 'die neue Theke hat ihre eigenen Kunden');
  assert.equal(nextCounterPrice(state), 35000);
  state.gold = 105000;
  assert.equal(buyCounter(state), 'ok');
  assert.equal(nextCounterPrice(state), 70000);
  assert.equal(buyCounter(state), 'ok');
  assert.equal(state.gold, 0);
  assert.equal(state.counters.length, 5);
  assert.equal(nextCounterPrice(state), null, 'die 6. Theke hat noch keinen Preis');
  state.gold = 1e9;
  assert.equal(buyCounter(state), 'later');
  assert.equal(state.counters.length, 5);
  assert.equal(state.gold, 1e9);
});

test('Theken kaufen geht auf jedem Level – es zählt nur das Gold', () => {
  const state = createNewGame(5);
  assert.equal(state.shopLevel, 1);
  state.gold = 15000;
  assert.equal(buyCounter(state), 'ok');
  assert.equal(state.counters.length, 3);
});

test('Theken-Ansicht: immer 6 Plätze – gekauft, als Nächste zu kaufen, später, kommt später', () => {
  const state = createNewGame(5);
  assert.deepEqual(
    counterSlots(state).map((s) => [s.status, s.price]),
    [
      ['owned', null],
      ['owned', null],
      ['next', 15000],
      ['later', 35000],
      ['later', 70000],
      ['locked', null],
    ],
  );
  state.gold = 50000;
  buyCounter(state);
  buyCounter(state);
  assert.deepEqual(
    counterSlots(state).map((s) => s.status),
    ['owned', 'owned', 'owned', 'owned', 'next', 'locked'],
  );
});

test('Gekaufte Theken bleiben nach Speichern und Laden, mit ihren Kunden', () => {
  const state = createNewGame(5);
  state.gold = 50000;
  buyCounter(state);
  buyCounter(state);
  state.storage.holzplatte = 30;
  setCounterItem(state, 3, 'holzplatte');
  fillCounter(state, 3);
  const loaded = deserializeGame(serializeGame(state)).state;
  assert.equal(loaded.counters.length, 4);
  assert.deepEqual(loaded.counters[3], { type: 'holzplatte', count: 20 });
  assert.deepEqual(loaded.market.timers, state.market.timers);
  assert.equal(loaded.gold, 0);
});

test('Aufstiege bringen keine Theken – auch nicht bis Level 8', () => {
  const state = createNewGame(5);
  state.gold = 1e6;
  while (state.shopLevel < 8) {
    state.quest.xp = xpNeeded(state.shopLevel);
    assert.ok(levelUp(state));
    assert.equal(state.counters.length, 2, `Level ${state.shopLevel}`);
  }
});

// ---------- Tobias' Fabrik: zurück auf 2 Theken ----------

// Ein Spielstand aus v0.23.0 (Format 16) mit 5 Theken wie Tobias' Fabrik.
function v16WithFiveCounters() {
  const state = createNewGame(8);
  state.shopLevel = 8;
  state.gold = 14623;
  state.storage = { holzplatte: 990, zirkel: 10 };
  state.counters = [
    { type: 'zirkel', count: 30 },
    { type: 'scharnier', count: 12 },
    { type: 'zahnradwelle', count: 30 },
    { type: null, count: 0 },
    { type: 'zirkel', count: 5 },
  ];
  delete state.market.timers;
  state.market.timer = 12.5;
  state.market.sales = [{ id: 1, items: { zirkel: 2 }, gold: 1324 }];
  state.market.nextSaleId = 2;
  return JSON.stringify({ saveVersion: 16, savedAt: 1000, state });
}

test('Spielstand aus v0.23.0: zurück auf 2 Theken, die Waren der übrigen liegen im Laden-Lager', () => {
  assert.equal(SAVE_VERSION, 17);
  const loaded = deserializeGame(v16WithFiveCounters());
  assert.ok(loaded);
  assert.equal(loaded.migratedFrom, 16);
  const s = loaded.state;
  assert.deepEqual(s.counters, [
    { type: 'zirkel', count: 30 },
    { type: 'scharnier', count: 12 },
  ]);
  assert.equal(storageCount(s, 'zahnradwelle'), 30);
  assert.equal(storageCount(s, 'zirkel'), 15, '10 im Lager + 5 von Theke 5');
  assert.equal(storageTotal(s), 1035, 'auch über die Grenze von 1.000 – nichts geht verloren');
  assert.equal(storageCapacity(s), 1000);
  assert.equal(s.gold, 14623, 'Gold bleibt');
  assert.equal(s.market.timer, undefined);
  assert.equal(s.market.timers.length, 2);
  assert.ok(s.market.timers.every((t) => t >= 60 && t <= 100), 'Level 8: alle 60–100 s ein Kunde');
  assert.deepEqual(s.market.sales, [{ id: 1, items: { zirkel: 2 }, gold: 1324 }], 'alte Verkäufe bleiben stehen');
  assert.deepEqual(loaded.notes, ['Deine Theken 3 bis 5 sind abgebaut – 35 Waren davon liegen wieder im Laden-Lager.']);
  // Nur einmal: Danach bleibt alles, wie es ist.
  const again = deserializeGame(serializeGame(s));
  assert.equal(again.migratedFrom, undefined);
  assert.equal(again.state.counters.length, 2);
  assert.equal(storageTotal(again.state), 1035);
});

test('Spielstand aus v0.23.0 mit 2 Theken: Theken bleiben, nur die Kunden bekommen ihren Takt', () => {
  const state = createNewGame(8);
  state.counters[0] = { type: 'holzplatte', count: 7 };
  delete state.market.timers;
  state.market.timer = 3;
  const loaded = deserializeGame(JSON.stringify({ saveVersion: 16, savedAt: 1, state }));
  assert.ok(loaded);
  assert.deepEqual(loaded.state.counters, [
    { type: 'holzplatte', count: 7 },
    { type: null, count: 0 },
  ]);
  assert.equal(loaded.state.market.timers.length, 2);
  assert.deepEqual(loaded.notes, []);
});

test('Spielstand mit falschen Kunden-Takten wird erkannt', () => {
  const state = createNewGame(8);
  state.market.timers = ['bald', 3];
  assert.equal(deserializeGame(serializeGame(state)), null);
  state.market.timers = [3, 4];
  state.market.sales = [{ id: 1, counter: -1, items: { holzplatte: 1 }, gold: 6 }];
  state.market.nextSaleId = 2;
  assert.equal(deserializeGame(serializeGame(state)), null);
});

// ---------- Im Hintergrund ----------

test('Hintergrund: Jede Theke verkauft für sich weiter, bis sie leer ist', () => {
  const state = shop(8);
  state.storage = {};
  state.counters[0] = { type: 'zirkel', count: 30 };
  state.counters[1] = { type: 'zirkel', count: 5 };
  // 30 Minuten weg: Jede Theke verkauft etwa 22 Stück (0,75 pro Minute).
  const report = catchUp(state, 30 * 60);
  assert.equal(state.counters[1].count, 0, 'Theke 2 ist leer verkauft');
  const sold1 = 30 - state.counters[0].count;
  assert.ok(sold1 >= 17 && sold1 <= 28, `Theke 1 verkauft in 30 Minuten ${sold1} Stück (etwa 22)`);
  assert.equal(report.sold.zirkel, sold1 + 5);
  assert.equal(report.gold, (sold1 + 5) * ITEMS.zirkel.price);
  assert.equal(report.countersEmpty, false);
});
