// v0.13.0: Aufträge der Bewohner (Erfahrung und Gold) und neue Warennamen.
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { placeBuilding } from '../src/core/buildings.js';
import { ITEMS } from '../src/core/data/items.js';
import { LEVELS, MAX_LEVEL } from '../src/core/data/levels.js';
import { RECIPES } from '../src/core/data/recipes.js';
import { hasEnoughXp, levelUpBlocker } from '../src/core/levels.js';
import {
  canDeliver,
  currentQuest,
  deliverQuest,
  levelQuests,
  questNeeds,
  questNumber,
  questReward,
  questValue,
  xpNeeded,
} from '../src/core/quests.js';
import { deserializeGame, serializeGame } from '../src/core/save.js';
import { createNewGame } from '../src/core/state.js';

function fillFor(state, quest) {
  for (const [type, n] of Object.entries(quest.items)) state.storage[type] = (state.storage[type] ?? 0) + n;
}

// ---------- Neue Namen ----------

test('Neue Namen passen zu den Zutaten, Rezepte und Werte bleiben', () => {
  const r = (key) => [RECIPES[key].inputs, ITEMS[key].price];
  assert.deepEqual(r('zahnradwelle'), [{ holzstab: 10, steinzahnrad: 5 }, 324]);
  assert.deepEqual(r('raederwerk'), [{ steinzahnrad: 10, holzstab: 5 }, 324]);
  assert.deepEqual(r('schluessel'), [{ eisenstange: 10, eisenblech: 5 }, 1296]);
  assert.deepEqual(r('zirkel'), [{ scharnier: 1, eisenstange: 5 }, 1987]);
  assert.deepEqual(r('gewichtstein'), [{ steinplatte: 10, eisenstange: 5 }, 648]);
  assert.deepEqual(r('uhrwerk'), [{ zahnradwelle: 1, raederwerk: 1 }, 778]);
  assert.deepEqual(r('vorhaengeschloss'), [{ scharnier: 1, raederwerk: 1 }, 1944]);
  assert.deepEqual(r('eisenblech'), [{ eisenbarren: 5 }, 72]);
  for (const old of ['minieisenplatte', 'handkurbel', 'schalter', 'eisenfeder', 'kugellager', 'steinkette', 'regler', 'minischloss']) {
    assert.equal(ITEMS[old], undefined, `${old} gibt es nicht mehr`);
  }
});

// ---------- Belohnung ----------

test('Belohnung: Gold so viel wie an der Theke, Erfahrung 1 je 10 Gold Warenwert', () => {
  const quest = { items: { raederwerk: 4 } };
  assert.equal(questValue(quest), 1296);
  assert.deepEqual(questReward(quest), { gold: 1296, xp: 130 });
  assert.deepEqual(questReward({ items: { holzplatte: 5 } }), { gold: 90, xp: 9 });
  assert.deepEqual(questReward({ items: { holzstab: 20, holzplatte: 10 } }), { gold: 540, xp: 54 });
});

test('Die Erfahrung aller Aufträge eines Levels reicht genau für den Aufstieg', () => {
  for (let level = 1; level < MAX_LEVEL; level++) {
    const state = createNewGame(level);
    state.shopLevel = level;
    const quests = levelQuests(level);
    quests.forEach((quest, i) => {
      assert.equal(hasEnoughXp(state), false, `Level ${level}: vor Auftrag ${i + 1} noch nicht genug`);
      fillFor(state, quest);
      assert.ok(deliverQuest(state));
    });
    assert.equal(state.quest.xp, xpNeeded(level));
    assert.equal(hasEnoughXp(state), true, `Level ${level}: nach allen Aufträgen genug Erfahrung`);
  }
});

test('Erfahrung je Level steigt mit dem Level', () => {
  const needs = Object.keys(LEVELS).map((level) => xpNeeded(Number(level)));
  assert.deepEqual(needs, [81, 90, 162, 714, 1495, 1841]);
});

// ---------- Abgeben ----------

test('Immer nur ein Auftrag; Abgeben nimmt die Waren aus dem Laden-Lager und gibt Gold und Erfahrung', () => {
  const state = createNewGame(1);
  const first = currentQuest(state);
  assert.equal(first.from, 'Zimmermann Jakob');
  assert.deepEqual(first.items, { holzplatte: 5 });
  assert.deepEqual(questNumber(state), { number: 1, total: 3 });
  state.storage.holzplatte = 4;
  assert.deepEqual(questNeeds(state), [{ type: 'holzplatte', need: 5, have: 4, done: false }]);
  assert.equal(canDeliver(state), false);
  assert.equal(deliverQuest(state), null);
  state.storage.holzplatte = 7;
  assert.deepEqual(questNeeds(state), [{ type: 'holzplatte', need: 5, have: 5, done: true }], 'have höchstens need');
  const gold = state.gold;
  const result = deliverQuest(state);
  assert.deepEqual([result.gold, result.xp], [90, 9]);
  assert.equal(state.storage.holzplatte, 2, '5 Holzplatten abgegeben');
  assert.equal(state.gold, gold + 90);
  assert.deepEqual(state.quest, { index: 1, xp: 9 });
  assert.equal(state.xpTotal, 9);
  assert.deepEqual(currentQuest(state).items, { holzstab: 10 }, 'der nächste Auftrag rückt nach');
  assert.deepEqual(questNumber(state), { number: 2, total: 3 });
});

test('Waren auf der Theke zählen nicht – nur das Laden-Lager', () => {
  const state = createNewGame(1);
  state.counters[0] = { type: 'holzplatte', count: 20 };
  assert.equal(canDeliver(state), false);
});

test('Nach dem letzten Auftrag eines Levels steht keiner mehr an', () => {
  const state = createNewGame(1);
  for (const quest of levelQuests(1)) {
    fillFor(state, quest);
    deliverQuest(state);
  }
  assert.equal(currentQuest(state), null);
  assert.equal(canDeliver(state), false);
  assert.equal(deliverQuest(state), null);
  assert.deepEqual(questNumber(state), { number: 3, total: 3 });
});

test('Höchstes Level: Aufträge gehen, die Erfahrung sammelt sich, aufsteigen geht (noch) nicht', () => {
  const state = createNewGame(6);
  state.shopLevel = 6;
  assert.equal(currentQuest(state).from, 'Torwächter Ulrich');
  for (const quest of levelQuests(6)) {
    fillFor(state, quest);
    assert.ok(deliverQuest(state));
  }
  assert.equal(state.quest.xp, xpNeeded(6));
  assert.equal(state.xpTotal, xpNeeded(6));
  assert.equal(levelUpBlocker(state), 'max');
});

// ---------- Spielstand ----------

test('Spielstand: Auftrag und Erfahrung werden mitgespeichert', () => {
  const state = createNewGame(2);
  fillFor(state, currentQuest(state));
  deliverQuest(state);
  const loaded = deserializeGame(serializeGame(state));
  assert.ok(loaded);
  assert.deepEqual(loaded.state.quest, { index: 1, xp: 9 });
  assert.equal(loaded.state.xpTotal, 9);
});

test('Spielstand aus v0.12 (Version 10): neue Namen überall, Aufträge beginnen auf dem aktuellen Level', () => {
  const v10 = createNewGame(10);
  v10.shopLevel = 6;
  v10.storage = { schalter: 5, minieisenplatte: 3, holzplatte: 2 };
  v10.counters = [
    { type: 'minischloss', count: 2 },
    { type: null, count: 0 },
  ];
  v10.produced = { regler: 1, steinkette: 2, holzblock: 9 };
  v10.market.sales = [{ id: 1, gold: 1944, items: { minischloss: 1 } }];
  v10.market.nextSaleId = 2;
  const zim = placeBuilding(v10, 'zimmerei', 20, 10, 0);
  zim.prod.recipe = 'schalter';
  zim.prod.stock = { steinzahnrad: 4, holzstab: 2 };
  zim.prod.out = { type: 'schalter', count: 1 };
  const fein = placeBuilding(v10, 'feinschmiede', 24, 10, 0);
  fein.prod.recipe = 'kugellager';
  fein.paid = { minieisenplatte: 10, schalter: 2 };
  const store = placeBuilding(v10, 'lagerhaus', 16, 9, 0);
  store.prod.slots = [{ type: 'kugellager', count: 2 }];
  store.prod.supply = { type: 'eisenfeder', keep: 3 };
  v10.belts['17,10'] = { outs: ['E'], item: { type: 'handkurbel', progress: 0.5, from: 'W' } };
  delete v10.quest;
  delete v10.xpTotal;

  const loaded = deserializeGame(JSON.stringify({ saveVersion: 10, savedAt: 1, state: v10 }));
  assert.ok(loaded, 'Spielstand gültig');
  assert.equal(loaded.migratedFrom, 10);
  const s = loaded.state;
  assert.equal(s.shopLevel, 6, 'Level bleibt');
  assert.deepEqual(s.storage, { raederwerk: 5, eisenblech: 3, holzplatte: 2 });
  assert.deepEqual(s.counters[0], { type: 'vorhaengeschloss', count: 2 });
  assert.deepEqual(s.produced, { uhrwerk: 1, gewichtstein: 2, holzblock: 9 });
  assert.deepEqual(s.market.sales[0].items, { vorhaengeschloss: 1 });
  const [z, f, l] = s.buildings.slice(-3);
  assert.deepEqual([z.prod.recipe, z.prod.stock, z.prod.out], ['raederwerk', { steinzahnrad: 4, holzstab: 2 }, { type: 'raederwerk', count: 1 }]);
  assert.deepEqual([f.prod.recipe, f.paid], ['zirkel', { eisenblech: 10, raederwerk: 2 }]);
  assert.deepEqual([l.prod.slots, l.prod.supply], [[{ type: 'zirkel', count: 2 }], { type: 'schluessel', keep: 3 }]);
  assert.equal(s.belts['17,10'].item.type, 'zahnradwelle');
  assert.deepEqual(s.quest, { index: 0, xp: 0 });
  assert.equal(s.xpTotal, 0);
  assert.equal(currentQuest(s).from, 'Torwächter Ulrich', 'Aufträge von Level 6');
});

test('Ungültige Aufträge im Spielstand werden erkannt', () => {
  for (const change of [
    (s) => delete s.quest,
    (s) => (s.quest = { index: -1, xp: 0 }),
    (s) => (s.quest = { index: 0, xp: 1.5 }),
    (s) => delete s.xpTotal,
  ]) {
    const state = createNewGame(1);
    change(state);
    assert.equal(deserializeGame(serializeGame(state)), null);
  }
});
