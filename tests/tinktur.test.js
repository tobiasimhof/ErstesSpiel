// v0.45.0: Level 14 „Die Tinktur“ (Entwurf v0.45.0, Tobias, Chat 27: „Ja, die
// Rezepte passen so und der aufstieg + aufträge auch. Aussehen passt auch.“) –
// keine neue Maschine, kein neuer Rohstoff: Die Zimmerei macht Mörser
// (1 Steinplatte + 3 Holzstäbe, 10 s), die Apotheke Tinkturen (1 Fläschchen +
// 1 Kräutermischung, 30 s), die Grundzutat aller Tränke. Aufstieg 12.500 Gold,
// kein Geschenk; die große Ausgabe für Gold kommt mit Level 15.
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { applyBeltPath, buildBeltPath, extendTrace } from '../src/core/belts.js';
import { placeBuilding } from '../src/core/buildings.js';
import { BUILDINGS } from '../src/core/data/buildings.js';
import { ITEMS } from '../src/core/data/items.js';
import { LEVELS, MAX_LEVEL } from '../src/core/data/levels.js';
import { RECIPES } from '../src/core/data/recipes.js';
import { SHOP_LEVELS } from '../src/core/data/shop.js';
import { fitWorldToLevel } from '../src/core/land.js';
import { isItemUnlocked, isRecipeUnlocked, itemLevel, levelUp, recipeLevel, unlocksOf } from '../src/core/levels.js';
import { applyTestPack } from '../src/core/market.js';
import { setRecipe } from '../src/core/production.js';
import { levelQuests, questReward, xpOfLevel } from '../src/core/quests.js';
import { SAVE_VERSION, deserializeGame, serializeGame } from '../src/core/save.js';
import { storageCount } from '../src/core/shop.js';
import { simulate } from '../src/core/sim.js';
import { createNewGame } from '../src/core/state.js';
import { unlockText } from '../src/ui/levels.js';

function levelGame(level, gold = 0) {
  const state = createNewGame(14);
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

test('Level 14 gibt es, der Laden bleibt wie auf Level 7 bis 13', () => {
  assert.ok(MAX_LEVEL >= 14);
  assert.deepEqual(SHOP_LEVELS[14], SHOP_LEVELS[13]);
});

// v0.55.0: 5 statt 3 Holzstäbe (Tobias, Chat 31: „damit wir irgendwo dieses Gleichgewicht behalten“)
test('Mörser: 4. Einstellung der Zimmerei, 1 Steinplatte + 5 Holzstäbe → 1 Mörser, 10 s, 43 Gold, erst ab Level 14', () => {
  assert.deepEqual(BUILDINGS.zimmerei.production.recipes, ['zahnradwelle', 'raederwerk', 'verstaerkteholzplatte', 'moerser']);
  const r = RECIPES.moerser;
  assert.deepEqual([r.building, r.label, r.inputs, r.output, r.amount, r.time], ['zimmerei', 'Mörser', { steinplatte: 1, holzstab: 5 }, 'moerser', 1, 10]);
  assert.equal(ITEMS.moerser.price, Math.round(worth(r.inputs) * 1.2));
  assert.equal(ITEMS.moerser.price, 43);
  assert.equal(recipeLevel('moerser'), 14);
  assert.equal(isRecipeUnlocked(levelGame(13), 'moerser'), false);
  assert.equal(isRecipeUnlocked(levelGame(14), 'moerser'), true);
});

test('Tinktur: 4. Einstellung der Apotheke, 1 Fläschchen + 1 Kräutermischung → 1 Tinktur, 30 s, 346 Gold, erst ab Level 14', () => {
  assert.deepEqual(BUILDINGS.apotheke.production.recipes, ['kraeutermischung', 'kamillenkissen', 'heilpaeckchen', 'tinktur']);
  const r = RECIPES.tinktur;
  assert.deepEqual([r.building, r.label, r.inputs, r.output, r.amount, r.time], ['apotheke', 'Tinkturen', { flaeschchen: 1, kraeutermischung: 1 }, 'tinktur', 1, 30]);
  assert.equal(ITEMS.tinktur.price, Math.round(worth(r.inputs) * 1.2));
  assert.equal(ITEMS.tinktur.price, 346);
  assert.equal(recipeLevel('tinktur'), 14);
  assert.equal(isRecipeUnlocked(levelGame(13), 'tinktur'), false);
  assert.equal(isRecipeUnlocked(levelGame(14), 'tinktur'), true);
  // Tobias' Regel: höchstens 2 Eingänge – auch mit 4 Einstellungen
  for (const type of ['zimmerei', 'apotheke']) assert.equal(BUILDINGS[type].ports.filter((p) => p.kind === 'in').length, 2, type);
});

test('Waren gehören zu Level 14, haben ein eigenes Warenbild; Fläschchen werden jetzt weiterverarbeitet', () => {
  assert.deepEqual(['moerser', 'tinktur'].map(itemLevel), [14, 14]);
  assert.deepEqual(['moerser', 'tinktur'].map((t) => ITEMS[t].shape), ['mortar', 'tincture']);
  assert.equal(isItemUnlocked(levelGame(13), 'tinktur'), false);
  assert.equal(isItemUnlocked(levelGame(14), 'tinktur'), true);
  const used = new Set(Object.values(RECIPES).flatMap((r) => Object.keys(r.inputs)));
  assert.ok(used.has('flaeschchen') && used.has('kraeutermischung'));
});

// ---------- Level 14 ----------

test('Level 14 schaltet frei: Mörser in der Zimmerei, Tinktur in der Apotheke – keine neue Maschine, kein Rohstoff', () => {
  assert.deepEqual(unlocksOf(14), { buildings: [], raws: [], recipes: ['moerser', 'tinktur'] });
  assert.equal(unlockText(14), '🛠️ Zimmerei: Mörser · ⚗️ Apotheke: Tinktur');
});

test('Level 14 „Die Tinktur“: Aufstieg 12.500 Gold, kein Geschenk, keine neue Fläche', () => {
  const def = LEVELS[14];
  assert.equal(def.name, 'Die Tinktur');
  assert.ok(def.story.includes('Mörser') && def.story.includes('Tinktur'));
  assert.equal(def.cost, 12500);
  assert.equal(def.gift, undefined);
  const state = levelGame(13, 13000);
  state.quest.index = levelQuests(13).length; // v0.56.0: alle Aufträge abgegeben
  const worldBefore = { ...state.world };
  assert.deepEqual(levelUp(state), { level: 14, gift: {}, cost: 12500, moreLand: false });
  assert.equal(state.gold, 500);
  assert.deepEqual(state.storage, {}, 'nichts ins Laden-Lager');
  assert.deepEqual(state.world, worldBefore, 'die Welt bleibt, wie sie ist (mehr Fläche kommt mit Level 15)');
});

test('Ohne genug Gold kein Aufstieg auf Level 14', () => {
  const state = levelGame(13, 12499);
  state.quest.index = levelQuests(13).length; // v0.56.0: alle Aufträge abgegeben
  assert.equal(levelUp(state), null);
  assert.equal(state.shopLevel, 13);
});

// v0.55.0: mit dem Mörser für 43 Gold 3.976 Erfahrung und 13.251 Gold (vorher 3.829 und 12.761)
test('Aufträge auf Level 14: 4 Stück, zusammen 3.976 Erfahrung und 13.251 Gold (×1,26 gegenüber Level 13)', () => {
  const quests = levelQuests(14);
  assert.deepEqual(
    quests.map((q) => [q.from, q.items]),
    [
      ['Apothekerin Klara', { moerser: 15 }],
      ['Apothekerin Klara', { tinktur: 10 }],
      ['Müllerin Grete', { moerser: 20, raederwerk: 10 }],
      ['Heilerin Agnes', { tinktur: 15, wundverband: 8 }],
    ],
  );
  const rewards = quests.map((q) => questReward(q));
  assert.equal(xpOfLevel(14), 3976);
  assert.equal(
    rewards.reduce((sum, r) => sum + r.gold, 0),
    13251,
  );
  const ratio = 13251 / 10490;
  assert.ok(ratio > 1.15 && ratio < 1.3, `Sprung zu Level 13: ×${ratio.toFixed(2)}`);
});

// ---------- Herstellen ----------

test('Zimmerei auf Mörser: 1 Steinplatte + 5 Holzstäbe → 1 Mörser in 10 Sekunden', () => {
  const state = levelGame(14);
  const zimmerei = placeBuilding(state, 'zimmerei', 16, 6, 0);
  assert.ok(setRecipe(zimmerei, 'moerser'));
  zimmerei.prod.stock = { steinplatte: 1, holzstab: 5 };
  simulate(state, 9);
  assert.equal(zimmerei.prod.out, null, 'nach 9 s noch nicht fertig');
  simulate(state, 2);
  assert.deepEqual(zimmerei.prod.out, { type: 'moerser', count: 1 });
  assert.deepEqual(zimmerei.prod.stock, { steinplatte: 0, holzstab: 0 });
});

test('Apotheke auf Tinktur: 3 Fläschchen + 3 Kräutermischungen → 3 Tinkturen über das Band ins Laden-Lager', () => {
  const state = levelGame(14);
  const apo = placeBuilding(state, 'apotheke', 16, 6, 0);
  assert.ok(setRecipe(apo, 'tinktur'));
  apo.prod.stock = { flaeschchen: 3, kraeutermischung: 3 };
  drag(state, [
    [18, 6],
    [20, 6],
  ]);
  placeBuilding(state, 'versandportal', 21, 6, 0);
  simulate(state, 29);
  assert.equal(storageCount(state, 'tinktur'), 0, 'nach 29 s noch keine');
  simulate(state, 3 * 30 + 30);
  assert.equal(storageCount(state, 'tinktur'), 3);
  assert.deepEqual(apo.prod.stock, { flaeschchen: 0, kraeutermischung: 0 });
});

// ---------- Testpaket und Spielstand ----------

test('Testpaket auf Level 14: Mörser und Tinkturen; auf Level 13 noch nicht', () => {
  const fourteen = levelGame(14);
  applyTestPack(fourteen);
  for (const type of ['moerser', 'tinktur']) assert.ok(storageCount(fourteen, type) > 0, type);
  const thirteen = levelGame(13);
  applyTestPack(thirteen);
  for (const type of ['moerser', 'tinktur']) assert.equal(storageCount(thirteen, type), 0, type);
});

test('Spielstand: Zimmerei auf Mörser und Apotheke auf Tinktur bleiben nach Speichern und Laden – kein eigenes Format nötig', () => {
  assert.ok(SAVE_VERSION >= 18, 'kein neues Spielstand-Format nötig');
  const state = levelGame(14);
  state.storage = { moerser: 4, tinktur: 2 };
  const zimmerei = placeBuilding(state, 'zimmerei', 10, 6, 0);
  setRecipe(zimmerei, 'moerser');
  zimmerei.prod.stock = { steinplatte: 1, holzstab: 2 };
  const apo = placeBuilding(state, 'apotheke', 16, 6, 0);
  setRecipe(apo, 'tinktur');
  apo.prod.stock = { flaeschchen: 1, kraeutermischung: 0 };
  const loaded = deserializeGame(serializeGame(state));
  assert.ok(loaded);
  assert.equal(loaded.state.shopLevel, 14);
  const z = loaded.state.buildings.find((b) => b.type === 'zimmerei');
  assert.deepEqual([z.prod.recipe, z.prod.stock], ['moerser', { steinplatte: 1, holzstab: 2 }]);
  const a = loaded.state.buildings.find((b) => b.type === 'apotheke');
  assert.deepEqual([a.prod.recipe, a.prod.stock], ['tinktur', { flaeschchen: 1, kraeutermischung: 0 }]);
  assert.deepEqual([storageCount(loaded.state, 'moerser'), storageCount(loaded.state, 'tinktur')], [4, 2]);
});
