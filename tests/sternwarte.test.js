// v0.58.0: Level 17 „Die Sternwarte“ (Entwurf v0.58.0, Tobias, Chat 32: „Neue
// einstellung passen“, „Linse lieber aus 10 Glas. Die Aufträge passen alle so.“)
// – keine neue Maschine: Der Steinmetz schleift Linsen und mahlt Kristallsand,
// die Uhrmacherei baut Fernrohre. Aufträge von Berta, Kaspar, Anton und
// Ambrosius, Aufstieg 20.000 Gold. Dazu Tobias' Regel: höchstens 4 Einstellungen
// je Maschine.
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
import { isRecipeUnlocked, levelUp, recipeLevel, unlocksOf } from '../src/core/levels.js';
import { buildingStatus, setRecipe } from '../src/core/production.js';
import { levelQuests, questReward, xpOfLevel } from '../src/core/quests.js';
import { deserializeGame, serializeGame } from '../src/core/save.js';
import { storageCount } from '../src/core/shop.js';
import { simulate } from '../src/core/sim.js';
import { createNewGame } from '../src/core/state.js';

function levelGame(level, gold = 0) {
  const state = createNewGame(17);
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

// ---------- Tobias' Regel ----------

// v0.59.0: Mit Lebens- und Manatrank ist auch der Zauberkessel voll (Level 18)
// v0.60.0: dazu Feinschmiede, Schlosserei und Kräuterstube (Level 19)
test('Tobias (Chat 32): Keine Maschine hat mehr als 4 Einstellungen – Zimmerei, Apotheke, Steinmetz, Uhrmacherei, Zauberkessel, Feinschmiede, Schlosserei und Kräuterstube sind voll', () => {
  const full = [];
  for (const [type, def] of Object.entries(BUILDINGS)) {
    const recipes = def.production?.kind === 'workshop' ? def.production.recipes : [];
    assert.ok(recipes.length <= 4, `${type}: ${recipes.length} Einstellungen`);
    if (recipes.length === 4) full.push(type);
  }
  assert.deepEqual(full.sort(), ['apotheke', 'feinschmiede', 'kraeuterstube', 'schlosserei', 'steinmetz', 'uhrmacherei', 'zauberkessel', 'zimmerei']);
});

// ---------- Datentabellen ----------

test('Level 17 „Die Sternwarte“: Geschichte mit Anton, Berta, Kaspar und Ambrosius, Laden wie auf Level 16, Aufstieg 20.000 Gold ohne Geschenk', () => {
  assert.ok(MAX_LEVEL >= 17); // v0.59.0: Level 18 kommt dazu
  const def = LEVELS[17];
  assert.equal(def.name, 'Die Sternwarte');
  for (const name of ['Anton', 'Berta', 'Kaspar', 'Ambrosius', 'Sternwarte']) assert.ok(def.story.includes(name), name);
  assert.equal(def.cost, 20000, 'die Reihe 15.000 → 17.500 → 20.000');
  assert.equal(def.gift, undefined, 'kein Geschenk');
  assert.deepEqual(SHOP_LEVELS[17], SHOP_LEVELS[16]);
  assert.deepEqual(worldForLevel(17), worldForLevel(16), 'keine neue Fläche');
  assert.deepEqual(unlocksOf(17), { buildings: [], raws: [], recipes: ['linse', 'kristallsand', 'fernrohr'] });
});

test('Steinmetz: Linse aus 10 Glas (30 s, 144 Gold), Kristallsand aus 5 Glas (10 s, 72 Gold), erst ab Level 17', () => {
  assert.deepEqual(BUILDINGS.steinmetz.production.recipes, ['steinplatte', 'steinzahnrad', 'linse', 'kristallsand']);
  assert.deepEqual(RECIPES.linse, { building: 'steinmetz', label: 'Linsen', inputs: { glas: 10 }, output: 'linse', amount: 1, time: 30, level: 17 });
  assert.deepEqual(RECIPES.kristallsand, { building: 'steinmetz', label: 'Kristallsand', inputs: { glas: 5 }, output: 'kristallsand', amount: 1, time: 10, level: 17 });
  assert.equal(ITEMS.linse.price, Math.round(worth({ glas: 10 }) * 1.2));
  assert.equal(ITEMS.kristallsand.price, Math.round(worth({ glas: 5 }) * 1.2));
  assert.deepEqual([ITEMS.linse.price, ITEMS.kristallsand.price], [144, 72]);
  for (const key of ['linse', 'kristallsand']) {
    assert.equal(recipeLevel(key), 17);
    assert.equal(isRecipeUnlocked(levelGame(16), key), false);
    assert.equal(isRecipeUnlocked(levelGame(17), key), true);
  }
});

test('Uhrmacherei: Fernrohr aus 2 Linsen + 10 Eisenblechen, 60 s, 634 Gold – die beste Ware der Uhrmacherei je Stunde', () => {
  assert.deepEqual(RECIPES.fernrohr, { building: 'uhrmacherei', label: 'Fernrohre', inputs: { linse: 2, eisenblech: 10 }, output: 'fernrohr', amount: 1, time: 60, level: 17 });
  assert.equal(ITEMS.fernrohr.price, Math.round(worth({ linse: 2, eisenblech: 10 }) * 1.2));
  assert.equal(ITEMS.fernrohr.price, 634);
  assert.equal(recipeLevel('fernrohr'), 17);
  assert.equal(isRecipeUnlocked(levelGame(16), 'fernrohr'), false);
});

test('Aufträge auf Level 17: Berta, Kaspar, Anton, Ambrosius – zusammen 23.437 Gold (×1,2 gegenüber Level 16)', () => {
  const quests = levelQuests(17);
  assert.deepEqual(
    quests.map((q) => [q.from, q.items]),
    [
      ['Steinmetzin Berta', { linse: 20 }],
      ['Uhrmacher Kaspar', { fernrohr: 10 }],
      ['Baumeister Anton', { steinplatte: 300, sternenuhr: 3, fernrohr: 3 }],
      ['Magier Ambrosius', { kristallsand: 50, heiltrank: 6 }],
    ],
  );
  const gold = quests.map((q) => questReward(q).gold).reduce((a, b) => a + b, 0);
  assert.equal(gold, 23437);
  assert.equal(xpOfLevel(17), 7031);
  const ratio = gold / 19391;
  assert.ok(ratio > 1.15 && ratio < 1.3, `Sprung zu Level 16: ×${ratio.toFixed(2)}`);
});

test('Aufstieg auf Level 17: 20.000 Gold, keine neue Fläche', () => {
  const state = levelGame(16, 25000);
  const before = { ...state.world };
  state.quest.index = levelQuests(16).length;
  assert.deepEqual(levelUp(state), { level: 17, gift: {}, cost: 20000, moreLand: false });
  assert.equal(state.gold, 5000);
  assert.deepEqual(state.world, before);
});

// ---------- In der Fabrik ----------

test('Steinmetz auf Linsen: 10 Glas → 1 Linse in 30 s; mit 9 Glas wartet er', () => {
  const state = levelGame(17);
  const s = placeBuilding(state, 'steinmetz', 12, 6, 0);
  assert.equal(setRecipe(s, 'linse'), true);
  s.prod.stock = { glas: 9 };
  simulate(state, 40);
  assert.equal(s.prod.out, null);
  assert.equal(buildingStatus(state, s).text, 'Wartet auf Glas (9 / 10).');
  s.prod.stock = { glas: 10 };
  simulate(state, 29);
  assert.equal(s.prod.out, null, 'nach 29 s noch nicht fertig');
  simulate(state, 2);
  assert.deepEqual(s.prod.out, { type: 'linse', count: 1 });
});

test('Steinmetz auf Kristallsand: 5 Glas → 1 Kristallsand in 10 s', () => {
  const state = levelGame(17);
  const s = placeBuilding(state, 'steinmetz', 12, 6, 0);
  setRecipe(s, 'kristallsand');
  s.prod.stock = { glas: 5 };
  simulate(state, 11);
  assert.deepEqual(s.prod.out, { type: 'kristallsand', count: 1 });
});

test('Eine Straße: Glas → Steinmetz (Linsen) → Uhrmacherei (Eisenbleche am 2. Eingang) → Portal ins Laden-Lager', () => {
  const state = levelGame(17);
  const s = placeBuilding(state, 'steinmetz', 10, 6, 0);
  const u = placeBuilding(state, 'uhrmacherei', 15, 6, 0);
  placeBuilding(state, 'versandportal', 20, 6, 0);
  // Steinmetz (Ausgang bei 11,6 nach Osten) → Uhrmacherei (Eingang 15,6)
  drag(state, [
    [12, 6],
    [14, 6],
  ]);
  // Uhrmacherei (Ausgang 16,6 nach Osten) → Portal
  drag(state, [
    [17, 6],
    [20, 6],
  ]);
  setRecipe(s, 'linse');
  setRecipe(u, 'fernrohr');
  s.prod.stock = { glas: 40 };
  u.prod.stock = { eisenblech: 20 };
  simulate(state, 300);
  assert.equal(storageCount(state, 'fernrohr'), 2, 'zwei Fernrohre im Laden-Lager');
});

test('Spielstand: Steinmetz auf Linsen, Uhrmacherei auf Fernrohre und die neuen Waren bleiben erhalten', () => {
  const state = levelGame(17);
  const s = placeBuilding(state, 'steinmetz', 10, 6, 0);
  const u = placeBuilding(state, 'uhrmacherei', 15, 6, 0);
  setRecipe(s, 'linse');
  setRecipe(u, 'fernrohr');
  s.prod.stock = { glas: 7 };
  Object.assign(state.storage, { linse: 3, kristallsand: 12, fernrohr: 1 });
  const loaded = deserializeGame(serializeGame(state));
  assert.ok(loaded);
  const [s2, u2] = loaded.state.buildings;
  assert.deepEqual([s2.prod.recipe, s2.prod.stock, u2.prod.recipe], ['linse', { glas: 7 }, 'fernrohr']);
  assert.deepEqual(['linse', 'kristallsand', 'fernrohr'].map((t) => loaded.state.storage[t]), [3, 12, 1]);
});
