// v0.59.0: Level 18 „Die Zauberei“ (Entwurf v0.59.0, Tobias, Chat 33: „Farn
// können wir gerne als 5. Pflanze einführen, damit wir auch bei den Pflanzen
// genug Varität reinbringen können“, „Gerne A“, „Ja, können wir auch gerne so
// machen“) – der Farn als 5. Pflanze (Farnsporen, Beet, Erntebank → Farnwedel),
// der Zauberkessel braut Lebenstrank (Heiltrank + 5 Farnwedel) und Manatrank
// (Traumtrank + 2 Kristallsand) und ist damit voll. Aufträge von Ambrosius,
// Agnes und Hilde (das Fest der Zauberei), Aufstieg 22.500 Gold.
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { applyBeltPath, buildBeltPath, extendTrace } from '../src/core/belts.js';
import { placeBuilding } from '../src/core/buildings.js';
import { BUILDINGS } from '../src/core/data/buildings.js';
import { ITEMS } from '../src/core/data/items.js';
import { LEVELS, MAX_LEVEL } from '../src/core/data/levels.js';
import { RECIPES } from '../src/core/data/recipes.js';
import { SHOP_LEVELS } from '../src/core/data/shop.js';
import { fitWorldToLevel, worldForLevel } from '../src/core/land.js';
import { isItemUnlocked, isRecipeUnlocked, itemLevel, levelUp, recipeLevel, unlocksOf } from '../src/core/levels.js';
import { applyTestPack, buyRaw } from '../src/core/market.js';
import { buildingStatus, harvest, loadInput, refuel, setRecipe, sowFromStorage } from '../src/core/production.js';
import { levelQuests, questReward, xpOfLevel } from '../src/core/quests.js';
import { deserializeGame, serializeGame } from '../src/core/save.js';
import { storageCount } from '../src/core/shop.js';
import { simulate } from '../src/core/sim.js';
import { createNewGame } from '../src/core/state.js';

function levelGame(level, gold = 0) {
  const state = createNewGame(18);
  state.buildings = [];
  state.belts = {};
  state.storage = {};
  state.shopLevel = level;
  state.gold = gold;
  fitWorldToLevel(state);
  return state;
}

function drag(state, points) {
  let trace = [];
  for (const [x, y] of points) trace = extendTrace(trace, { x, y });
  applyBeltPath(state, buildBeltPath(state, trace));
}

const worth = (items) => Object.entries(items).reduce((sum, [t, n]) => sum + ITEMS[t].price * n, 0);

// ---------- Datentabellen ----------

test('Level 18 „Die Zauberei“: Geschichte mit Ambrosius, Farn und den zwei Tränken, Laden wie auf Level 17, Aufstieg 22.500 Gold ohne Geschenk', () => {
  assert.ok(MAX_LEVEL >= 18); // v0.60.0: Level 19 kommt dazu
  const def = LEVELS[18];
  assert.equal(def.name, 'Die Zauberei');
  for (const word of ['Ambrosius', 'Farn', 'Kristallsand', 'Lebenstrank', 'Manatrank']) assert.ok(def.story.includes(word), word);
  assert.equal(def.cost, 22500, 'die Reihe 17.500 → 20.000 → 22.500');
  assert.equal(def.gift, undefined, 'kein Geschenk');
  assert.deepEqual(SHOP_LEVELS[18], SHOP_LEVELS[17]);
  assert.deepEqual(worldForLevel(18), worldForLevel(17), 'keine neue Fläche');
  assert.deepEqual(unlocksOf(18), { buildings: [], raws: ['farnsporen'], recipes: ['lebenstrank', 'manatrank'] });
});

test('Farn als 5. Pflanze: Farnsporen für 1.000 Gold ab Level 18, wachsen im Beet in 30 Minuten, Erntebank: 1 Farn → 50 Farnwedel (24 Gold)', () => {
  assert.deepEqual([ITEMS.farnsporen.buyPrice, ITEMS.farnsporen.level, ITEMS.farnsporen.raw, ITEMS.farnsporen.grows], [1000, 18, true, 'farn']);
  // die Reihe der Samen: 320 → 500 → 660 → 830 → 1.000
  assert.deepEqual(['leinsamen', 'ringelblumensamen', 'schafgarbensamen', 'kamillensamen', 'farnsporen'].map((t) => ITEMS[t].buyPrice), [320, 500, 660, 830, 1000]);
  assert.deepEqual([ITEMS.farn.grown, ITEMS.farn.level, ITEMS.farn.bloom], [true, 18, 'fronds']);
  assert.equal(ITEMS.farn.buyPrice, undefined, 'den Farn selbst kann man nicht kaufen');
  assert.deepEqual(BUILDINGS.beet.production.crops.farnsporen, { plant: 'farn', time: 1800 });
  assert.equal(BUILDINGS.flachsbreche.production.inputs.farn, 'farnwedel');
  assert.equal(ITEMS.farnwedel.price, 24);
  // aus einer Tüte Sporen: 50 × 24 = 1.200 Gold (+20 %, wie die Blüten)
  assert.equal(50 * ITEMS.farnwedel.price, Math.round(ITEMS.farnsporen.buyPrice * 1.2));
  assert.equal(itemLevel('farnwedel'), 18, 'Farnwedel erst ab Level 18');
  assert.equal(isItemUnlocked(levelGame(17), 'farnsporen'), false);
  assert.equal(isItemUnlocked(levelGame(18), 'farnsporen'), true);
});

test('Zauberkessel: Lebenstrank aus 1 Heiltrank + 5 Farnwedeln (876 Gold), Manatrank aus 1 Traumtrank + 2 Kristallsand (841 Gold), je 90 s und 5 Holzkohle, erst ab Level 18', () => {
  assert.deepEqual(BUILDINGS.zauberkessel.production.recipes, ['traumtrank', 'heiltrank', 'lebenstrank', 'manatrank']);
  assert.deepEqual(RECIPES.lebenstrank, { building: 'zauberkessel', label: 'Lebenstränke', inputs: { heiltrank: 1, farnwedel: 5 }, fuel: 5, output: 'lebenstrank', amount: 1, time: 90, level: 18 });
  assert.deepEqual(RECIPES.manatrank, { building: 'zauberkessel', label: 'Manatränke', inputs: { traumtrank: 1, kristallsand: 2 }, fuel: 5, output: 'manatrank', amount: 1, time: 90, level: 18 });
  // Wert = (Zutaten + 5 Holzkohle) × 1,2
  for (const key of ['lebenstrank', 'manatrank']) {
    const r = RECIPES[key];
    assert.equal(ITEMS[key].price, Math.round((worth(r.inputs) + r.fuel * ITEMS.holzkohle.price) * 1.2), key);
    assert.equal(recipeLevel(key), 18);
    assert.equal(isRecipeUnlocked(levelGame(17), key), false);
    assert.equal(isRecipeUnlocked(levelGame(18), key), true);
  }
  assert.deepEqual([ITEMS.lebenstrank.price, ITEMS.manatrank.price], [876, 841]);
  // Variante A: kein Verhältnis 1 : 1, beide etwa gleich viel wert
  assert.ok(Math.abs(ITEMS.lebenstrank.price - ITEMS.manatrank.price) < 50);
});

test('Aufträge auf Level 18: Ambrosius, Agnes, Ambrosius, Hilde mit dem Fest – zusammen 27.891 Gold (×1,19 gegenüber Level 17)', () => {
  const quests = levelQuests(18);
  assert.deepEqual(
    quests.map((q) => [q.from, q.items]),
    [
      ['Magier Ambrosius', { farnwedel: 100 }],
      ['Heilerin Agnes', { lebenstrank: 8 }],
      ['Magier Ambrosius', { manatrank: 8 }],
      ['Bürgermeisterin Hilde', { lebenstrank: 5, manatrank: 5, fernrohr: 5 }],
    ],
  );
  assert.ok(quests[3].text.includes('Fest der Zauberei'));
  const gold = quests.map((q) => questReward(q).gold);
  assert.deepEqual(gold, [2400, 7008, 6728, 11755]);
  assert.equal(gold.reduce((a, b) => a + b, 0), 27891);
  assert.equal(xpOfLevel(18), 8367);
  const ratio = 27891 / 23437;
  assert.ok(ratio > 1.15 && ratio < 1.3, `Sprung zu Level 17: ×${ratio.toFixed(2)}`);
});

test('Aufstieg auf Level 18: 22.500 Gold, keine neue Fläche', () => {
  const state = levelGame(17, 30000);
  const before = { ...state.world };
  state.quest.index = levelQuests(17).length;
  assert.deepEqual(levelUp(state), { level: 18, gift: {}, cost: 22500, moreLand: false });
  assert.equal(state.gold, 7500);
  assert.deepEqual(state.world, before);
});

// ---------- In der Fabrik ----------

test('Kette: Farnsporen kaufen → Beet → Erntebank → 50 Farnwedel ins Laden-Lager', () => {
  const state = levelGame(18, 1000);
  assert.equal(buyRaw(state, 'farnsporen'), 'ok');
  assert.equal(state.gold, 0);
  const beet = placeBuilding(state, 'beet', 8, 6, 0);
  assert.ok(sowFromStorage(state, beet, 'farnsporen'));
  simulate(state, 1799);
  assert.equal(harvest(state, beet), 'unripe', 'nach knapp 30 Minuten noch nicht reif');
  simulate(state, 2);
  assert.equal(harvest(state, beet), 'ok');
  assert.equal(storageCount(state, 'farn'), 1);
  const bank = placeBuilding(state, 'flachsbreche', 12, 6, 0);
  assert.ok(loadInput(state, bank, 'farn'));
  placeBuilding(state, 'versandportal', 14, 6, 0);
  simulate(state, 600 + 30);
  assert.equal(storageCount(state, 'farnwedel'), 50);
  // eine Pflanze reicht für 10 Lebenstränke – der Farn bremst nicht
  assert.equal(50 / RECIPES.lebenstrank.inputs.farnwedel, 10);
});

test('Auf Level 17 gibt es noch keine Farnsporen beim Händler', () => {
  const state = levelGame(17, 5000);
  assert.equal(buyRaw(state, 'farnsporen'), 'locked');
});

test('Kessel auf Lebenstrank: 1 Heiltrank + 5 Farnwedel, Feuer 5 Holzkohle, 90 s; mit 4 Wedeln wartet er', () => {
  const state = levelGame(18);
  const k = placeBuilding(state, 'zauberkessel', 12, 6, 0);
  assert.equal(setRecipe(k, 'lebenstrank'), true);
  state.storage.holzkohle = 100;
  refuel(state, k);
  k.prod.stock = { heiltrank: 1, farnwedel: 4 };
  simulate(state, 5);
  assert.equal(k.prod.busy, false);
  assert.equal(buildingStatus(state, k).text, 'Wartet auf Farnwedel (4 / 5).');
  k.prod.stock = { heiltrank: 1, farnwedel: 5 };
  simulate(state, 1);
  assert.equal(k.prod.busy, true);
  assert.equal(k.prod.fuel, 95);
  simulate(state, 88);
  assert.equal(k.prod.out, null, 'nach 89 s noch nicht fertig');
  simulate(state, 2);
  assert.deepEqual(k.prod.out, { type: 'lebenstrank', count: 1 });
});

test('Kessel auf Manatrank: 1 Traumtrank + 2 Kristallsand, ohne Feuer wartet er, 90 s', () => {
  const state = levelGame(18);
  const k = placeBuilding(state, 'zauberkessel', 12, 6, 0);
  assert.equal(setRecipe(k, 'manatrank'), true);
  k.prod.stock = { traumtrank: 1, kristallsand: 2 };
  simulate(state, 3);
  assert.equal(k.prod.busy, false, 'ohne Feuer wartet er');
  state.storage.holzkohle = 100;
  refuel(state, k);
  simulate(state, 92);
  assert.deepEqual(k.prod.out, { type: 'manatrank', count: 1 });
  assert.equal(k.prod.fuel, 95);
});

test('Auf Level 17 lässt sich der Kessel noch nicht auf Lebens- oder Manatrank stellen', () => {
  const state = levelGame(17);
  const k = placeBuilding(state, 'zauberkessel', 12, 6, 0);
  assert.equal(isRecipeUnlocked(state, 'lebenstrank'), false);
  assert.equal(isRecipeUnlocked(state, 'manatrank'), false);
  assert.equal(k.prod.recipe, 'traumtrank');
});

test('Eine Straße: Farn → Erntebank → Kessel (Heiltränke am 2. Eingang) → Portal ins Laden-Lager', () => {
  const state = levelGame(18);
  const bank = placeBuilding(state, 'flachsbreche', 10, 6, 0);
  const k = placeBuilding(state, 'zauberkessel', 15, 6, 0);
  placeBuilding(state, 'versandportal', 20, 6, 0);
  // Erntebank (Ausgang bei 11,6 nach Osten) → Kessel (Eingang 15,6)
  drag(state, [
    [12, 6],
    [14, 6],
  ]);
  // Kessel (Ausgang 16,6 nach Osten) → Portal
  drag(state, [
    [17, 6],
    [20, 6],
  ]);
  state.storage.holzkohle = 100;
  refuel(state, k);
  setRecipe(k, 'lebenstrank');
  k.prod.stock = { heiltrank: 2 };
  state.storage.farn = 1;
  assert.ok(loadInput(state, bank, 'farn'));
  simulate(state, 900);
  assert.equal(storageCount(state, 'lebenstrank'), 2, 'zwei Lebenstränke im Laden-Lager');
  assert.equal(k.prod.fuel, 90);
});

test('Testpaket auf Level 18: Farnwedel, Lebens- und Manatränke; Farn und Sporen nicht', () => {
  const state = levelGame(18);
  applyTestPack(state);
  for (const type of ['farnwedel', 'lebenstrank', 'manatrank']) assert.ok(storageCount(state, type) > 0, type);
  assert.equal(storageCount(state, 'farn'), 0, 'Pflanzen gibt es im Testpaket nicht');
  assert.equal(storageCount(state, 'farnsporen'), 0, 'Rohstoffe auch nicht');
  const seventeen = levelGame(17);
  applyTestPack(seventeen);
  for (const type of ['farnwedel', 'lebenstrank', 'manatrank']) assert.equal(storageCount(seventeen, type), 0, type);
});

test('Spielstand: Farn im Beet, Kessel auf Manatrank und die neuen Waren bleiben erhalten', () => {
  const state = levelGame(18);
  const beet = placeBuilding(state, 'beet', 8, 6, 0);
  const k = placeBuilding(state, 'zauberkessel', 15, 6, 0);
  state.storage.farnsporen = 1;
  sowFromStorage(state, beet, 'farnsporen');
  setRecipe(k, 'manatrank');
  k.prod.stock = { kristallsand: 1 };
  Object.assign(state.storage, { farn: 2, farnwedel: 30, lebenstrank: 3, manatrank: 1 });
  const loaded = deserializeGame(serializeGame(state));
  assert.ok(loaded);
  const [beet2, k2] = loaded.state.buildings;
  assert.equal(beet2.prod.crop, 'farnsporen');
  assert.deepEqual([k2.prod.recipe, k2.prod.stock], ['manatrank', { kristallsand: 1 }]);
  assert.deepEqual(['farn', 'farnwedel', 'lebenstrank', 'manatrank'].map((t) => loaded.state.storage[t]), [2, 30, 3, 1]);
});
