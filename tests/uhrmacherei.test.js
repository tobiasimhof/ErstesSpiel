// v0.28.0: Level 11 „Die Uhrmacherei“ (Entwurf v0.25.1, Tobias, Chat 20) –
// Uhrmacherei im Reiter „Werkstatt“ mit Räderuhr, Kastenschloss und
// Sternenuhr, je 1 Minute pro Stück; Aufstieg 5.000 Gold, kein Geschenk mehr.
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { buyBuilding, placeBuilding } from '../src/core/buildings.js';
import { BUILDINGS, BUILD_TABS, TAB_COLORS } from '../src/core/data/buildings.js';
import { ITEMS } from '../src/core/data/items.js';
import { LEVELS, MAX_LEVEL } from '../src/core/data/levels.js';
import { RECIPES } from '../src/core/data/recipes.js';
import { SHOP_LEVELS } from '../src/core/data/shop.js';
import { fitWorldToLevel } from '../src/core/land.js';
import { itemLevel, levelUp, unlocksOf } from '../src/core/levels.js';
import { applyTestPack } from '../src/core/market.js';
import { setRecipe } from '../src/core/production.js';
import { levelQuests, questReward, xpNeeded } from '../src/core/quests.js';
import { deserializeGame, serializeGame } from '../src/core/save.js';
import { storageCount } from '../src/core/shop.js';
import { simulate } from '../src/core/sim.js';
import { createNewGame } from '../src/core/state.js';

function levelGame(level, gold = 0) {
  const state = createNewGame(11);
  state.buildings = [];
  state.belts = {};
  state.storage = {};
  state.shopLevel = level;
  state.gold = gold;
  fitWorldToLevel(state); // ab Level 10 ist die Welt größer
  return state;
}

const worth = (items) => Object.entries(items).reduce((sum, [t, n]) => sum + ITEMS[t].price * n, 0);

// ---------- Datentabellen ----------

test('Level 11 ist das höchste Level, der Laden bleibt wie auf Level 7 bis 10', () => {
  assert.equal(MAX_LEVEL, 11);
  assert.deepEqual(SHOP_LEVELS[11], SHOP_LEVELS[10]);
});

test('Uhrmacherei: 2 × 2, zwei Eingänge, Räderuhr, Kastenschloss und Sternenuhr', () => {
  const def = BUILDINGS.uhrmacherei;
  assert.deepEqual([def.level, def.size, def.color], [11, [2, 2], TAB_COLORS.werkstatt]);
  assert.equal(def.ports.filter((p) => p.kind === 'in').length, 2);
  assert.deepEqual(def.production.recipes, ['raederuhr', 'kastenschloss', 'sternenuhr']);
  assert.deepEqual(RECIPES.raederuhr.inputs, { uhrwerk: 1, gewichtstein: 1 });
  assert.deepEqual(RECIPES.kastenschloss.inputs, { vorhaengeschloss: 1, schluessel: 1 });
  assert.deepEqual(RECIPES.sternenuhr.inputs, { uhrwerk: 1, zirkel: 1 });
});

test('Tobias: 1 Minute je Stück („etwas mit der Zeit skalieren“)', () => {
  for (const key of ['raederuhr', 'kastenschloss', 'sternenuhr']) assert.equal(RECIPES[key].time, 60, key);
});

test('Preise: Zutaten + 20 % (570, 1.296, 1.105)', () => {
  for (const key of ['raederuhr', 'kastenschloss', 'sternenuhr']) {
    assert.equal(ITEMS[key].price, Math.round(worth(RECIPES[key].inputs) * 1.2), key);
  }
  assert.deepEqual([ITEMS.raederuhr.price, ITEMS.kastenschloss.price, ITEMS.sternenuhr.price], [570, 1296, 1105]);
});

test('Uhrwerk, Gewichtstein, Schlüssel und Vorhängeschloss werden jetzt weiterverarbeitet', () => {
  const used = new Set(Object.values(RECIPES).flatMap((r) => Object.keys(r.inputs)));
  for (const type of ['uhrwerk', 'gewichtstein', 'schluessel', 'vorhaengeschloss', 'zirkel']) assert.ok(used.has(type), type);
});

test('Bauleiste: Uhrmacherei im Reiter „Werkstatt“ neben der Schreibstube (Tobias: „Ja, mach das in den Reiter.“)', () => {
  const werkstatt = BUILD_TABS.find((t) => t.id === 'werkstatt');
  assert.deepEqual(werkstatt.buildings, ['schreibstube', 'uhrmacherei']);
  assert.deepEqual(BUILD_TABS.find((t) => t.id === 'eisen').buildings.length, 4, '„Eisen“ ist voll');
});

test('Baukosten: 1 Zirkel + 1 Uhrwerk (921 Gold, höchstens ein Eisenerz als Teile)', () => {
  const cost = BUILDINGS.uhrmacherei.cost;
  assert.deepEqual(cost, { zirkel: 1, uhrwerk: 1 });
  assert.equal(worth(cost), 921);
  assert.ok(worth(cost) <= 960);
  for (const item of Object.keys(cost)) assert.ok(itemLevel(item) <= 6, `${item} ist eine Werkzeug-Ware`);
});

// ---------- Level 11 ----------

test('Level 11 „Die Uhrmacherei“: Aufstieg 5.000 Gold, kein Geschenk mehr, keine neue Fläche', () => {
  const def = LEVELS[11];
  assert.equal(def.name, 'Die Uhrmacherei');
  assert.equal(def.cost, 5000);
  assert.equal(def.gift, undefined, 'Tobias: Geschenke enden mit Level 10');
  assert.deepEqual(unlocksOf(11), { buildings: ['uhrmacherei'], raws: [], recipes: [] });
  const state = levelGame(10, 6000);
  state.quest.xp = xpNeeded(10);
  const storageBefore = { ...state.storage };
  const worldBefore = { ...state.world };
  assert.deepEqual(levelUp(state), { level: 11, gift: {}, cost: 5000, moreLand: false });
  assert.equal(state.gold, 1000);
  assert.deepEqual(state.storage, storageBefore, 'nichts ins Laden-Lager');
  assert.deepEqual(state.world, worldBefore, 'die Welt bleibt, wie sie ist');
});

test('Aufträge auf Level 11: 4 Stück, zusammen 2.550 Erfahrung und 8.497 Gold', () => {
  const quests = levelQuests(11);
  assert.deepEqual(
    quests.map((q) => [q.from, q.items]),
    [
      ['Bürgermeisterin Hilde', { raederuhr: 2 }],
      ['Händlerin Marta', { kastenschloss: 2 }],
      ['Baumeister Anton', { sternenuhr: 1 }],
      ['Heilerin Agnes', { raederuhr: 2, wundverband: 10 }],
    ],
  );
  const rewards = quests.map((q) => questReward(q));
  assert.deepEqual(
    rewards.map((r) => r.xp),
    [342, 778, 332, 1098],
  );
  assert.equal(xpNeeded(11), 2550);
  assert.equal(
    rewards.reduce((sum, r) => sum + r.gold, 0),
    8497,
  );
});

test('Unter Level 11 lässt sich die Uhrmacherei nicht bauen', () => {
  const state = levelGame(10);
  state.storage = { zirkel: 1, uhrwerk: 1 };
  assert.equal(buyBuilding(state, 'uhrmacherei', 10, 6), 'locked');
  state.shopLevel = 11;
  assert.ok(buyBuilding(state, 'uhrmacherei', 10, 6)?.id, 'ab Level 11 gebaut');
  assert.deepEqual(state.storage, {}, 'Baukosten bezahlt');
});

// ---------- Herstellen ----------

test('Jede Einstellung braucht 1 Minute: nach 59 s noch nichts, nach 61 s ein Stück', () => {
  const stocks = {
    raederuhr: { uhrwerk: 1, gewichtstein: 1 },
    kastenschloss: { vorhaengeschloss: 1, schluessel: 1 },
    sternenuhr: { uhrwerk: 1, zirkel: 1 },
  };
  for (const [key, stock] of Object.entries(stocks)) {
    const state = levelGame(11);
    const uhr = placeBuilding(state, 'uhrmacherei', 16, 6, 0);
    assert.ok(setRecipe(uhr, key));
    uhr.prod.stock = { ...stock };
    simulate(state, 59);
    assert.equal(uhr.prod.out, null, `${key}: nach 59 s noch nicht fertig`);
    simulate(state, 2);
    assert.deepEqual(uhr.prod.out, { type: key, count: 1 }, key);
  }
});

test('Testpaket auf Level 11: Räderuhr, Kastenschloss und Sternenuhr; auf Level 10 noch nicht', () => {
  const eleven = levelGame(11);
  applyTestPack(eleven);
  for (const type of ['raederuhr', 'kastenschloss', 'sternenuhr']) assert.ok(storageCount(eleven, type) > 0, type);
  const ten = levelGame(10);
  applyTestPack(ten);
  assert.equal(storageCount(ten, 'raederuhr'), 0);
});

test('Spielstand: Uhrmacherei auf Level 11 bleibt nach Speichern und Laden erhalten', () => {
  const state = levelGame(11);
  const uhr = placeBuilding(state, 'uhrmacherei', 16, 6, 0);
  setRecipe(uhr, 'kastenschloss');
  uhr.prod.stock = { vorhaengeschloss: 1, schluessel: 0 };
  const loaded = deserializeGame(serializeGame(state));
  assert.ok(loaded);
  assert.equal(loaded.state.shopLevel, 11);
  const u = loaded.state.buildings.find((b) => b.type === 'uhrmacherei');
  assert.equal(u.prod.recipe, 'kastenschloss');
  assert.deepEqual(u.prod.stock, { vorhaengeschloss: 1, schluessel: 0 });
});
