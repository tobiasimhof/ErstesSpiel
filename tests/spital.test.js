// v0.27.0: Level 10 „Das Spital“ (Entwurf v0.25.1, Tobias, Chat 20: „Ja,
// darfst du.“) – Schafgarbe als 3. Pflanze, Wundverband in der Kräuterstube –
// und mehr Fläche ab Level 10 (Tobias: „Aktuell wird es mit dem Platz ein
// wenig eng“; „Ein Streifen gerne 2000 Gold“).
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { placeBuilding } from '../src/core/buildings.js';
import { BUILDINGS } from '../src/core/data/buildings.js';
import { ITEMS } from '../src/core/data/items.js';
import { LAND, LAND_MORE } from '../src/core/data/land.js';
import { LEVELS, MAX_LEVEL } from '../src/core/data/levels.js';
import { RECIPES } from '../src/core/data/recipes.js';
import { SHOP_LEVELS } from '../src/core/data/shop.js';
import {
  LAND_SIDES,
  buyLand,
  fitWorldToLevel,
  landBuysLeft,
  landMoreAt,
  landOffer,
  landOffers,
  stripPrice,
  stripsPerSide,
  worldForLevel,
} from '../src/core/land.js';
import { isItemUnlocked, isRecipeUnlocked, itemLevel, levelUp, recipeLevel, unlocksOf } from '../src/core/levels.js';
import { applyTestPack } from '../src/core/market.js';
import { harvest, loadInput, setRecipe, sowFromStorage } from '../src/core/production.js';
import { levelQuests, questReward, xpNeeded } from '../src/core/quests.js';
import { deserializeGame, isValidState, serializeGame } from '../src/core/save.js';
import { storageCount } from '../src/core/shop.js';
import { simulate } from '../src/core/sim.js';
import { WORLD, createNewGame, isOwned } from '../src/core/state.js';

function levelGame(level, gold = 0) {
  const state = createNewGame(10);
  state.buildings = [];
  state.belts = {};
  state.storage = {};
  state.shopLevel = level;
  state.gold = gold;
  fitWorldToLevel(state);
  return state;
}

// Alle 8 Streifen der ersten beiden Runden gekauft – wie Tobias' Fabrik (38 × 30)
function fullPlot(state) {
  state.plot = { ...WORLD };
}

const worth = (items) => Object.entries(items).reduce((sum, [t, n]) => sum + ITEMS[t].price * n, 0);

// ---------- Datentabellen ----------

test('Level 10 gibt es (seit v0.28.0 ist Level 11 das höchste), der Laden bleibt wie auf Level 7 bis 9', () => {
  assert.equal(MAX_LEVEL, 11);
  assert.deepEqual(SHOP_LEVELS[10], SHOP_LEVELS[9]);
});

test('Schafgarbe: Samen 660 Gold, wächst 30 Minuten im Beet, die Erntebank macht 50 Blüten à 16 Gold', () => {
  assert.deepEqual([ITEMS.schafgarbensamen.buyPrice, ITEMS.schafgarbensamen.level, ITEMS.schafgarbensamen.raw], [660, 10, true]);
  assert.ok(ITEMS.schafgarbe.grown && ITEMS.schafgarbe.raw && !ITEMS.schafgarbe.price, 'Pflanze: nicht verkäuflich');
  assert.equal(ITEMS.schafgarbenbluete.price, 16);
  assert.deepEqual(BUILDINGS.beet.production.crops.schafgarbensamen, { plant: 'schafgarbe', time: 1800 });
  assert.equal(BUILDINGS.flachsbreche.production.inputs.schafgarbe, 'schafgarbenbluete');
  // Teurer, bringt aber mehr: 660 → 800 (+21 %)
  assert.equal(50 * ITEMS.schafgarbenbluete.price, 800);
  assert.ok(800 / 660 > 1.19 && 800 / 660 < 1.23);
});

test('Wundverband: Kräuterstube, 1 Heilverband + 5 Schafgarbenblüten, 20 s, 252 Gold (+20 %)', () => {
  assert.deepEqual(BUILDINGS.kraeuterstube.production.recipes, ['heilverband', 'kraeuterkompresse', 'wundverband']);
  const r = RECIPES.wundverband;
  assert.deepEqual([r.building, r.inputs, r.output, r.amount, r.time], ['kraeuterstube', { heilverband: 1, schafgarbenbluete: 5 }, 'wundverband', 1, 20]);
  assert.equal(worth(r.inputs), 210);
  assert.equal(ITEMS.wundverband.price, 252);
  assert.equal(Math.round(worth(r.inputs) * 1.2), 252);
});

test('Der Wundverband kommt erst mit Level 10, obwohl es die Kräuterstube schon ab Level 8 gibt', () => {
  assert.equal(recipeLevel('heilverband'), 8);
  assert.equal(recipeLevel('wundverband'), 10);
  assert.equal(itemLevel('wundverband'), 10);
  assert.equal(itemLevel('schafgarbenbluete'), 10, 'die Erntebank macht Schafgarbenblüten erst mit der Schafgarbe');
  assert.equal(itemLevel('ringelbluete'), 8);
  const nine = levelGame(9);
  assert.equal(isRecipeUnlocked(nine, 'wundverband'), false);
  assert.equal(isItemUnlocked(nine, 'schafgarbensamen'), false);
  const ten = levelGame(10);
  assert.equal(isRecipeUnlocked(ten, 'wundverband'), true);
  assert.equal(isItemUnlocked(ten, 'schafgarbensamen'), true);
});

test('Level 10 schaltet frei: Wundverband, Schafgarbensamen beim Händler, mehr Fläche – kein neues Gebäude', () => {
  assert.deepEqual(unlocksOf(10), { buildings: [], raws: ['schafgarbensamen'], recipes: ['wundverband'] });
  assert.deepEqual(landMoreAt(10), { level: 10, strips: 1, price: 2000 });
  assert.equal(landMoreAt(9), null);
});

// ---------- Level und Aufträge ----------

test('Level 10 „Das Spital“: Aufstieg 2.000 Gold, 1 Schafgarbensamen gratis', () => {
  const def = LEVELS[10];
  assert.equal(def.name, 'Das Spital');
  assert.equal(def.cost, 2000);
  assert.deepEqual(def.gift, { schafgarbensamen: 1 });
  const state = levelGame(9, 2500);
  state.quest.xp = xpNeeded(9);
  const result = levelUp(state);
  assert.deepEqual(result, { level: 10, gift: { schafgarbensamen: 1 }, cost: 2000, moreLand: true });
  assert.equal(state.gold, 500);
  assert.equal(storageCount(state, 'schafgarbensamen'), 1);
});

test('Aufträge auf Level 10: 4 Stück aus beiden Bereichen, zusammen 2.116 Erfahrung und 7.052 Gold', () => {
  const quests = levelQuests(10);
  assert.deepEqual(
    quests.map((q) => [q.from, q.items]),
    [
      ['Heilerin Agnes', { schafgarbenbluete: 50 }],
      ['Heilerin Agnes', { wundverband: 5 }],
      ['Bürgermeisterin Hilde', { vorhaengeschloss: 2 }],
      ['Torwächter Ulrich', { wundverband: 8, kraeuterkompresse: 10 }],
    ],
  );
  const rewards = quests.map((q) => questReward(q));
  assert.deepEqual(
    rewards.map((r) => r.xp),
    [240, 378, 389, 1109],
  );
  assert.equal(xpNeeded(10), 2116);
  assert.equal(
    rewards.reduce((sum, r) => sum + r.gold, 0),
    7052,
  );
});

// ---------- Mehr Fläche ab Level 10 ----------

test('Datentabelle: ab Level 10 je Seite ein Streifen mehr für 2.000 Gold; die ersten beiden bleiben bei 170', () => {
  assert.deepEqual(LAND, { depth: 4, perSide: 2, price: 170, roundTo: 10 });
  assert.deepEqual(LAND_MORE, [{ level: 10, strips: 1, price: 2000 }]);
  assert.deepEqual([1, 9, 10, 12].map(stripsPerSide), [2, 2, 3, 3]);
  assert.deepEqual([0, 1, 2].map(stripPrice), [170, 170, 2000]);
});

test('Die Welt wächst mit dem Level: bis Level 9 38 × 30, ab Level 10 46 × 38', () => {
  assert.deepEqual(worldForLevel(1), WORLD);
  assert.deepEqual(worldForLevel(9), WORLD);
  assert.deepEqual(worldForLevel(10), { x: -4, y: -7, width: 46, height: 38 });
  assert.deepEqual(createNewGame().world, WORLD, 'ein neues Spiel beginnt wie bisher');
});

test('Tobias’ Fabrik: alles gekauft auf Level 9 – beim Aufstieg auf Level 10 kommt an jeder Seite ein Angebot für 2.000 Gold', () => {
  const state = levelGame(9, 100000);
  fullPlot(state);
  const buildingsBefore = JSON.stringify(state.buildings);
  assert.deepEqual(landOffers(state), [], 'Level 9: kein Angebot mehr');
  state.quest.xp = xpNeeded(9);
  assert.equal(levelUp(state).moreLand, true);
  assert.deepEqual(state.world, { x: -4, y: -7, width: 46, height: 38 });
  assert.deepEqual(state.plot, WORLD, 'das Grundstück bleibt, wie es war');
  assert.equal(JSON.stringify(state.buildings), buildingsBefore, 'Gebäude bleiben auf ihren Feldern');
  const offers = landOffers(state);
  assert.deepEqual(
    offers.map((o) => [o.side, o.depth, o.price]),
    [
      ['N', 4, 2000],
      ['E', 4, 2000],
      ['S', 4, 2000],
      ['W', 4, 2000],
    ],
  );
  assert.deepEqual(
    offers.map((o) => o.fields),
    [4 * 38, 4 * 30, 4 * 38, 4 * 30],
  );
  for (const side of LAND_SIDES) assert.equal(landBuysLeft(state, side), 1, side);
});

test('Alle vier neuen Streifen kaufen: 46 × 38 Felder für 4 × 2.000 Gold, danach ist Schluss', () => {
  const state = levelGame(10, 8000);
  fullPlot(state);
  for (const side of ['E', 'S', 'N', 'W']) {
    const gold = state.gold;
    assert.equal(buyLand(state, side), 'ok', side);
    assert.equal(gold - state.gold, 2000, `${side} kostet 2.000 Gold`);
  }
  assert.equal(state.gold, 0);
  assert.deepEqual(state.plot, { x: -4, y: -7, width: 46, height: 38 });
  assert.equal(state.plot.width * state.plot.height, 1748);
  assert.deepEqual(landOffers(state), []);
  assert.ok(isOwned(state, -4, -7) && isOwned(state, 41, 30), 'die Ecken gehören dazu');
});

test('Wer auf Level 10 noch nicht alles gekauft hat, zahlt für die ersten beiden Streifen weiter 170 Gold', () => {
  const state = levelGame(10, 100000);
  const prices = [];
  for (let i = 0; i < 3; i++) {
    prices.push(landOffer(state, 'E').price);
    assert.equal(buyLand(state, 'E'), 'ok');
  }
  assert.deepEqual(prices, [170, 170, 2000]);
  assert.equal(landOffer(state, 'E'), null);
  assert.equal(buyLand(state, 'E'), 'edge');
  assert.equal(state.plot.x + state.plot.width, 42);
});

test('Ohne genug Gold: kein Kauf', () => {
  const state = levelGame(10, 1999);
  fullPlot(state);
  assert.equal(buyLand(state, 'N'), 'gold');
  assert.deepEqual(state.plot, WORLD);
  assert.equal(state.gold, 1999);
});

test('Spielstand: Level 9 bleibt bei 38 × 30, Level 10 behält die größere Welt; ältere Level-10-Stände wachsen beim Laden', () => {
  const nine = levelGame(9);
  fullPlot(nine);
  assert.deepEqual(deserializeGame(serializeGame(nine)).state.world, WORLD);

  const ten = levelGame(10, 5000);
  fullPlot(ten);
  buyLand(ten, 'W');
  const loaded = deserializeGame(serializeGame(ten)).state;
  assert.deepEqual(loaded.world, { x: -4, y: -7, width: 46, height: 38 });
  assert.deepEqual(loaded.plot, { x: -4, y: -3, width: 42, height: 30 });
  assert.equal(loaded.gold, 3000);
  assert.ok(isValidState(loaded));

  // Ein Spielstand auf Level 10 mit der alten, kleineren Welt (gibt es nur im Test)
  const old = levelGame(9);
  old.shopLevel = 10;
  assert.deepEqual(old.world, WORLD);
  assert.deepEqual(deserializeGame(serializeGame(old)).state.world, { x: -4, y: -7, width: 46, height: 38 });
});

// ---------- Produktion ----------

test('Kette: Schafgarbensamen → Beet → Erntebank → 50 Schafgarbenblüten; mit 10 Heilverbänden 10 Wundverbände', () => {
  const state = levelGame(10);
  state.storage.schafgarbensamen = 1;
  const beet = placeBuilding(state, 'beet', 8, 6, 0);
  assert.ok(sowFromStorage(state, beet, 'schafgarbensamen'));
  simulate(state, 1800);
  assert.ok(harvest(state, beet));
  assert.equal(storageCount(state, 'schafgarbe'), 1);
  const bank = placeBuilding(state, 'flachsbreche', 12, 6, 0);
  assert.ok(loadInput(state, bank, 'schafgarbe'));
  placeBuilding(state, 'versandportal', 14, 6, 0);
  simulate(state, 600 + 30);
  assert.equal(storageCount(state, 'schafgarbenbluete'), 50);

  const stube = placeBuilding(state, 'kraeuterstube', 16, 9, 0);
  assert.ok(setRecipe(stube, 'wundverband'));
  stube.prod.stock = { heilverband: 1, schafgarbenbluete: 5 };
  simulate(state, 21);
  assert.deepEqual(stube.prod.out, { type: 'wundverband', count: 1 });
  // Rechenbeispiel: 1 Leinsamen + 1 Ringelblumensamen + 1 Schafgarbensamen → 10 Wundverbände
  assert.equal(ITEMS.leinsamen.buyPrice + ITEMS.ringelblumensamen.buyPrice + ITEMS.schafgarbensamen.buyPrice, 1480);
  assert.equal(10 * ITEMS.wundverband.price, 2520);
});

test('Testpaket auf Level 10: Schafgarbenblüten und Wundverbände; auf Level 9 noch nicht', () => {
  const ten = levelGame(10);
  applyTestPack(ten);
  assert.ok(storageCount(ten, 'schafgarbenbluete') > 0);
  assert.ok(storageCount(ten, 'wundverband') > 0);
  const nine = levelGame(9);
  applyTestPack(nine);
  assert.equal(storageCount(nine, 'schafgarbenbluete'), 0);
  assert.equal(storageCount(nine, 'wundverband'), 0);
});
