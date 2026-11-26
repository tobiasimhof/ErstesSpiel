// v0.57.0: Level 16 „Die Kräutermühle“ (Entwurf v0.57.0, Tobias, Chat 32: „Ja,
// das passt alles so“) – Müllerin Gretes Kräutermühle mahlt Ringelblüten zu
// Heilpuder, der Zauberkessel braut daraus mit Tinktur den Heiltrank. Dazu
// Aufträge von Grete, Agnes, Ambrosius und Hannes, Aufstieg 17.500 Gold.
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { applyBeltPath, buildBeltPath, extendTrace } from '../src/core/belts.js';
import { placeBuilding } from '../src/core/buildings.js';
import { BUILDINGS, BUILD_TABS } from '../src/core/data/buildings.js';
import { ITEMS } from '../src/core/data/items.js';
import { LEVELS, MAX_LEVEL } from '../src/core/data/levels.js';
import { RECIPES } from '../src/core/data/recipes.js';
import { SHOP_LEVELS } from '../src/core/data/shop.js';
import { fitWorldToLevel, worldForLevel } from '../src/core/land.js';
import { isBuildingUnlocked, isRecipeUnlocked, levelUp, recipeLevel, unlocksOf } from '../src/core/levels.js';
import { buildingStatus, refuel, setRecipe } from '../src/core/production.js';
import { levelQuests, questReward, xpOfLevel } from '../src/core/quests.js';
import { deserializeGame, serializeGame } from '../src/core/save.js';
import { storageCount } from '../src/core/shop.js';
import { simulate } from '../src/core/sim.js';
import { createNewGame } from '../src/core/state.js';

function levelGame(level, gold = 0) {
  const state = createNewGame(16);
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

test('Level 16 „Die Kräutermühle“: Geschichte mit Grete und Ambrosius, Laden wie auf Level 15, Aufstieg 17.500 Gold ohne Geschenk', () => {
  assert.equal(MAX_LEVEL, 16);
  const def = LEVELS[16];
  assert.equal(def.name, 'Die Kräutermühle');
  assert.ok(def.story.includes('Grete') && def.story.includes('Heilpuder') && def.story.includes('Ambrosius'), def.story);
  assert.equal(def.cost, 17500, 'die Reihe 12.500 → 15.000 → 17.500');
  assert.equal(def.gift, undefined, 'kein Geschenk');
  assert.deepEqual(SHOP_LEVELS[16], SHOP_LEVELS[15]);
  assert.deepEqual(worldForLevel(16), worldForLevel(15), 'keine neue Fläche');
});

test('Heilpuder: 5 Ringelblüten in der Kräutermühle, 15 s, 72 Gold (20 % auf die Blüten)', () => {
  assert.deepEqual(RECIPES.heilpuder, { building: 'kraeutermuehle', label: 'Heilpuder', inputs: { ringelbluete: 5 }, output: 'heilpuder', amount: 1, time: 15 });
  assert.equal(ITEMS.heilpuder.price, Math.round(worth({ ringelbluete: 5 }) * 1.2));
  assert.equal(ITEMS.heilpuder.price, 72);
  assert.equal(recipeLevel('heilpuder'), 16);
});

test('Heiltrank: 1 Tinktur + 2 Heilpuder, Feuer 5 Holzkohle, 60 s, 600 Gold – 10 % mehr als der Traumtrank, erst ab Level 16', () => {
  assert.deepEqual(RECIPES.heiltrank, {
    building: 'zauberkessel',
    label: 'Heiltränke',
    inputs: { tinktur: 1, heilpuder: 2 },
    fuel: 5,
    output: 'heiltrank',
    amount: 1,
    time: 60,
    level: 16,
  });
  assert.equal(ITEMS.heiltrank.price, Math.round((worth({ tinktur: 1, heilpuder: 2 }) + 5 * ITEMS.holzkohle.price) * 1.2));
  assert.equal(ITEMS.heiltrank.price, 600);
  assert.ok(ITEMS.heiltrank.price > ITEMS.traumtrank.price);
  assert.equal(ITEMS.heiltrank.shape, 'potion', 'dieselbe Form wie der Traumtrank, in Rot');
  assert.equal(recipeLevel('heiltrank'), 16);
  assert.equal(isRecipeUnlocked(levelGame(15), 'heiltrank'), false);
  assert.equal(isRecipeUnlocked(levelGame(16), 'heiltrank'), true);
});

test('Kräutermühle: Reiter „Stein“ (jetzt voll), 2 × 2 mit 1 Eingang, 10 Mörser + 4 Räderwerke, ab Level 16', () => {
  const def = BUILDINGS.kraeutermuehle;
  assert.equal(def.level, 16);
  assert.deepEqual(def.cost, { moerser: 10, raederwerk: 4 });
  assert.equal(worth(def.cost), 862, 'unter der Grenze von 960 Gold');
  assert.deepEqual(def.size, [2, 2]);
  assert.deepEqual(def.ports.map((p) => p.kind), ['in', 'out']);
  assert.deepEqual(def.production, { kind: 'workshop', recipes: ['heilpuder'] });
  assert.deepEqual(BUILD_TABS.find((t) => t.id === 'stein').buildings, ['steinbruch', 'steinmetz', 'zauberkessel', 'kraeutermuehle']);
  assert.equal(isBuildingUnlocked(levelGame(15), 'kraeutermuehle'), false);
  assert.equal(isBuildingUnlocked(levelGame(16), 'kraeutermuehle'), true);
  assert.deepEqual(unlocksOf(16), { buildings: ['kraeutermuehle'], raws: [], recipes: ['heiltrank'] });
});

test('Aufträge auf Level 16: Grete, Agnes, Ambrosius, Hannes – zusammen 19.391 Gold (×1,2 gegenüber Level 15)', () => {
  const quests = levelQuests(16);
  assert.deepEqual(
    quests.map((q) => [q.from, q.items]),
    [
      ['Müllerin Grete', { heilpuder: 50 }],
      ['Heilerin Agnes', { heilpuder: 20, wundverband: 8 }],
      ['Magier Ambrosius', { heiltrank: 10 }],
      ['Wirt Hannes', { heiltrank: 6, traumtrank: 5 }],
    ],
  );
  const gold = quests.map((q) => questReward(q).gold).reduce((a, b) => a + b, 0);
  assert.equal(gold, 19391);
  assert.equal(xpOfLevel(16), 5818);
  const ratio = gold / 16066;
  assert.ok(ratio > 1.15 && ratio < 1.3, `Sprung zu Level 15: ×${ratio.toFixed(2)}`);
});

test('Aufstieg auf Level 16: 17.500 Gold, keine neue Fläche; danach ist Level 16 das höchste', () => {
  const state = levelGame(15, 20000);
  const before = { ...state.world };
  state.quest.index = levelQuests(15).length;
  assert.deepEqual(levelUp(state), { level: 16, gift: {}, cost: 17500, moreLand: false });
  assert.equal(state.gold, 2500);
  assert.deepEqual(state.world, before);
  state.quest.index = levelQuests(16).length;
  assert.equal(levelUp(state), null);
});

// ---------- Mühle und Kessel ----------

test('Kräutermühle mahlt: 5 Ringelblüten → 1 Heilpuder in 15 s; mit 4 Blüten wartet sie', () => {
  const state = levelGame(16);
  const m = placeBuilding(state, 'kraeutermuehle', 12, 6, 0);
  assert.equal(m.prod.recipe, 'heilpuder');
  m.prod.stock = { ringelbluete: 4 };
  simulate(state, 20);
  assert.equal(m.prod.out, null);
  assert.equal(buildingStatus(state, m).text, 'Wartet auf Ringelblüten (4 / 5).');
  m.prod.stock = { ringelbluete: 5 };
  simulate(state, 14);
  assert.equal(m.prod.out, null, 'nach 14 s noch nicht fertig');
  simulate(state, 2);
  assert.deepEqual(m.prod.out, { type: 'heilpuder', count: 1 });
});

test('Kessel auf Heiltrank umstellen: braucht Tinktur, 2 Heilpuder und Feuer, 60 s', () => {
  const state = levelGame(16);
  const k = placeBuilding(state, 'zauberkessel', 12, 6, 0);
  assert.equal(k.prod.recipe, 'traumtrank', 'ein neuer Kessel braut erst den Traumtrank');
  assert.equal(setRecipe(k, 'heiltrank'), true);
  k.prod.stock = { tinktur: 1, heilpuder: 2 };
  simulate(state, 2);
  assert.equal(k.prod.busy, false, 'ohne Feuer wartet er');
  state.storage.holzkohle = 100;
  refuel(state, k);
  simulate(state, 1);
  assert.equal(k.prod.busy, true);
  assert.equal(k.prod.fuel, 95);
  simulate(state, 60);
  assert.deepEqual(k.prod.out, { type: 'heiltrank', count: 1 });
});

test('Eine Straße: Ringelblüten → Mühle → Kessel (mit Tinktur am 2. Eingang) → Portal ins Laden-Lager', () => {
  const state = levelGame(16);
  const m = placeBuilding(state, 'kraeutermuehle', 10, 6, 0);
  const k = placeBuilding(state, 'zauberkessel', 15, 6, 0);
  placeBuilding(state, 'versandportal', 20, 6, 0);
  // Mühle (Ausgang bei 11,6 nach Osten) → Kessel (Eingang 15,6)
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
  setRecipe(k, 'heiltrank');
  k.prod.stock = { tinktur: 2 };
  m.prod.stock = { ringelbluete: 20 };
  simulate(state, 200);
  assert.equal(storageCount(state, 'heiltrank'), 2, 'zwei Heiltränke im Laden-Lager');
  assert.equal(k.prod.fuel, 90);
});

test('Spielstand: Mühle, Kessel auf Heiltrank und die neuen Waren bleiben erhalten', () => {
  const state = levelGame(16);
  const m = placeBuilding(state, 'kraeutermuehle', 10, 6, 0);
  const k = placeBuilding(state, 'zauberkessel', 15, 6, 0);
  setRecipe(k, 'heiltrank');
  m.prod.stock = { ringelbluete: 3 };
  state.storage.heilpuder = 4;
  state.storage.heiltrank = 2;
  const loaded = deserializeGame(serializeGame(state));
  assert.ok(loaded);
  const [m2, k2] = loaded.state.buildings;
  assert.deepEqual([m2.type, m2.prod.stock], ['kraeutermuehle', { ringelbluete: 3 }]);
  assert.deepEqual([k2.type, k2.prod.recipe], ['zauberkessel', 'heiltrank']);
  assert.deepEqual([loaded.state.storage.heilpuder, loaded.state.storage.heiltrank], [4, 2]);
});
