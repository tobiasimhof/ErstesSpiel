// v0.31.0: Level 13 „Die Glashütte“ (Entwurf v0.30.3, Tobias, Chat 22: „Klingt
// alles sehr gut“, „Von mir aus, kannst du das gerne so umsetzen“) – der
// Anfang der Tränke ohne neue Maschine: Der Kohlenmeiler heißt „Ofen“ und
// brennt ab Level 13 auch Sand zu Glas, die Schmiede bläst aus 5 Glas ein
// Fläschchen (30 s); Aufstieg 10.000 Gold, kein Geschenk; die 6. Theke für
// 150.000 Gold gibt es ab Level 13.
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { applyBeltPath, buildBeltPath, extendTrace } from '../src/core/belts.js';
import { placeBuilding } from '../src/core/buildings.js';
import { BUILDINGS, BUILD_TABS, TAB_COLORS } from '../src/core/data/buildings.js';
import { ITEMS } from '../src/core/data/items.js';
import { LEVELS, MAX_LEVEL } from '../src/core/data/levels.js';
import { RECIPES } from '../src/core/data/recipes.js';
import { COUNTERS, SHOP_LEVELS } from '../src/core/data/shop.js';
import { fitWorldToLevel } from '../src/core/land.js';
import { isItemUnlocked, isRecipeUnlocked, itemLevel, levelUp, recipeLevel, unlocksOf } from '../src/core/levels.js';
import { applyTestPack, buyCounter, buyRaw, counterSlots, refillInput, refillPlan, refillSource } from '../src/core/market.js';
import { buildingStatus, loadInput, setRecipe, sourceCount, sourceInputTypes } from '../src/core/production.js';
import { levelQuests, questReward, xpOfLevel } from '../src/core/quests.js';
import { SAVE_VERSION, deserializeGame, serializeGame } from '../src/core/save.js';
import { storageCount } from '../src/core/shop.js';
import { simulate } from '../src/core/sim.js';
import { createNewGame } from '../src/core/state.js';
import { unlockText } from '../src/ui/levels.js';

function levelGame(level, gold = 0) {
  const state = createNewGame(13);
  state.buildings = [];
  state.belts = {};
  state.storage = {};
  state.shopLevel = level;
  state.gold = gold;
  fitWorldToLevel(state); // ab Level 10 ist die Welt größer
  return state;
}

function drag(state, points) {
  let trace = [];
  for (const [x, y] of points) trace = extendTrace(trace, { x, y });
  applyBeltPath(state, buildBeltPath(state, trace));
}

const worth = (items) => Object.entries(items).reduce((sum, [t, n]) => sum + ITEMS[t].price * n, 0);

// ---------- Datentabellen ----------

test('Level 13 gibt es, der Laden bleibt wie auf Level 7 bis 12', () => {
  assert.ok(MAX_LEVEL >= 13);
  assert.deepEqual(SHOP_LEVELS[13], SHOP_LEVELS[12]);
});

test('Ofen (bisher Kohlenmeiler): heißt in allen Leveln „Ofen“, ab Level 9, Reiter „Holz“, Holzstamm → Holzkohle und Sand → Glas', () => {
  const def = BUILDINGS.kohlenmeiler;
  assert.deepEqual([def.name, def.level, def.size, def.color], ['Ofen', 9, [2, 2], TAB_COLORS.holz]);
  assert.deepEqual(BUILD_TABS.find((t) => t.id === 'holz').buildings, ['holzfaeller', 'saegewerk', 'zimmerei', 'kohlenmeiler']);
  // Tobias: „Glas gibt es nur dort, also aus Sand wird dort Glas.“
  assert.deepEqual(def.production.inputs, { holzstamm: 'holzkohle', sand: 'glas' });
  assert.deepEqual([def.production.amount, def.production.duration, def.production.capacity], [100, 900, 3]);
  assert.deepEqual(sourceInputTypes('kohlenmeiler'), ['holzstamm', 'sand']);
  const glassMakers = Object.entries(BUILDINGS).filter(([, b]) => Object.values(b.production?.inputs ?? {}).includes('glas'));
  assert.deepEqual(glassMakers.map(([key]) => key), ['kohlenmeiler'], 'Glas gibt es nur im Ofen');
  assert.ok(!Object.values(RECIPES).some((r) => r.output === 'glas'), 'keine Maschine macht Glas');
  assert.equal(Object.values(BUILDINGS).filter((b) => b.name === 'Kohlenmeiler').length, 0, 'den alten Namen gibt es nicht mehr');
});

test('Sand: Rohstoff beim Händler ab Level 13 für 1.100 Gold; 100 Glas à 12 = 1.200 (+9 %)', () => {
  assert.deepEqual([ITEMS.sand.raw, ITEMS.sand.level, ITEMS.sand.buyPrice], [true, 13, 1100]);
  assert.ok(!ITEMS.sand.grown, 'Sand kauft man');
  assert.equal(ITEMS.glas.price, 12);
  const glas = BUILDINGS.kohlenmeiler.production.amount * ITEMS.glas.price;
  assert.equal(glas, 1200);
  assert.ok(glas / 1100 > 1.08 && glas / 1100 < 1.1, 'wie ein Rohstoff zu Blöcken: etwa +9 %');
  assert.ok(ITEMS.sand.buyPrice > ITEMS.kamillensamen.buyPrice, 'teurer als der vorige neue Rohstoff');
});

test('Fläschchen: 3. Einstellung der Schmiede, 5 Glas → 1 Fläschchen, 30 s (Tobias), 72 Gold, erst ab Level 13', () => {
  assert.deepEqual(BUILDINGS.schmiede.production.recipes, ['eisenblech', 'eisenstange', 'flaeschchen']);
  const r = RECIPES.flaeschchen;
  assert.deepEqual([r.building, r.label, r.inputs, r.output, r.amount], ['schmiede', 'Fläschchen', { glas: 5 }, 'flaeschchen', 1]);
  assert.equal(r.time, 30, 'Tobias: „von 10s auf 30s erhöhen“');
  assert.equal(ITEMS.flaeschchen.price, Math.round(worth(r.inputs) * 1.2));
  assert.equal(ITEMS.flaeschchen.price, 72);
  assert.equal(BUILDINGS.schmiede.ports.filter((p) => p.kind === 'in').length, 1, 'die Schmiede bleibt eine Grundmaschine mit 1 Eingang');
  assert.equal(recipeLevel('flaeschchen'), 13);
  assert.equal(recipeLevel('eisenblech'), 3);
  assert.equal(isRecipeUnlocked(levelGame(12), 'flaeschchen'), false);
  assert.equal(isRecipeUnlocked(levelGame(13), 'flaeschchen'), true);
});

test('Waren gehören zu Level 13: Sand, Glas, Fläschchen – Holzkohle bleibt Level 9', () => {
  assert.deepEqual(['sand', 'glas', 'flaeschchen', 'holzkohle'].map(itemLevel), [13, 13, 13, 9]);
  for (const type of ['sand', 'glas', 'flaeschchen']) assert.ok(ITEMS[type].shape, `${type}: Warenbild`);
  assert.equal(isItemUnlocked(levelGame(12), 'glas'), false);
  assert.equal(isItemUnlocked(levelGame(13), 'glas'), true);
});

test('Rechenbeispiel: 1 Sand (1.100) → 100 Glas (1.200) → 20 Fläschchen (1.440)', () => {
  const glas = BUILDINGS.kohlenmeiler.production.amount;
  const vials = glas / RECIPES.flaeschchen.inputs.glas;
  assert.equal(vials, 20);
  assert.equal(vials * ITEMS.flaeschchen.price, 1440);
  // Eine Schmiede (30 s je Fläschchen) schafft das Glas von 1,5 Öfen
  assert.equal((BUILDINGS.kohlenmeiler.production.duration / RECIPES.flaeschchen.time) / vials, 1.5);
});

// ---------- Level 13 ----------

test('Level 13 schaltet frei: Sand beim Händler, Fläschchen in der Schmiede – keine neue Maschine', () => {
  assert.deepEqual(unlocksOf(13), { buildings: [], raws: ['sand'], recipes: ['flaeschchen'] });
  assert.equal(
    unlockText(13),
    '🔨 Schmiede: Fläschchen · ♨️ Ofen: Glas aus Sand · Sand beim Händler · ⚖️ Theke 6 kaufen (150.000 Gold)',
  );
  assert.equal(unlockText(9), '♨️ Ofen, 📐 Schreibstube', 'auf Level 9 heißt er schon Ofen');
  assert.equal(unlockText(12), '⚗️ Apotheke · 📐 Schreibstube: Reißbrett · Kamillensamen beim Händler', 'Level 12 bleibt, wie es war');
});

test('Level 13 „Die Glashütte“: Aufstieg 10.000 Gold, kein Geschenk, keine neue Fläche', () => {
  const def = LEVELS[13];
  assert.equal(def.name, 'Die Glashütte');
  assert.ok(def.story.includes('Ofen') && def.story.includes('Fläschchen'));
  assert.equal(def.cost, 10000);
  assert.equal(def.gift, undefined);
  const state = levelGame(12, 10500);
  state.quest.index = levelQuests(12).length; // v0.56.0: alle Aufträge abgegeben
  const storageBefore = { ...state.storage };
  const worldBefore = { ...state.world };
  assert.deepEqual(levelUp(state), { level: 13, gift: {}, cost: 10000, moreLand: false });
  assert.equal(state.gold, 500);
  assert.deepEqual(state.storage, storageBefore, 'nichts ins Laden-Lager');
  assert.deepEqual(state.world, worldBefore, 'die Welt bleibt, wie sie ist');
});

test('Ohne genug Gold kein Aufstieg auf Level 13', () => {
  const state = levelGame(12, 9999);
  state.quest.index = levelQuests(12).length; // v0.56.0: alle Aufträge abgegeben
  assert.equal(levelUp(state), null);
  assert.equal(state.shopLevel, 12);
});

test('Aufträge auf Level 13: 4 Stück, zusammen 3.147 Erfahrung und 10.490 Gold', () => {
  const quests = levelQuests(13);
  assert.deepEqual(
    quests.map((q) => [q.from, q.items]),
    [
      ['Schmied Konrad', { glas: 50 }],
      ['Apothekerin Klara', { flaeschchen: 25 }],
      ['Baumeister Anton', { glas: 100, sternenuhr: 2 }],
      ['Apothekerin Klara', { flaeschchen: 20, kraeutermischung: 15 }],
    ],
  );
  const rewards = quests.map((q) => questReward(q));
  assert.deepEqual(
    rewards.map((r) => r.xp),
    [180, 540, 1023, 1404],
  );
  assert.equal(xpOfLevel(13), 3147);
  assert.ok(xpOfLevel(13) > xpOfLevel(12), 'mehr Erfahrung als Level 12');
  assert.equal(
    rewards.reduce((sum, r) => sum + r.gold, 0),
    10490,
  );
  // 375 Glas – knapp 4 Sand
  const glas = quests.reduce((sum, q) => sum + (q.items.glas ?? 0) + (q.items.flaeschchen ?? 0) * RECIPES.flaeschchen.inputs.glas, 0);
  assert.equal(glas, 375);
});

test('6. Theke: ab Level 13 für 150.000 Gold, vorher „🔒 Ab Level 13“', () => {
  assert.equal(COUNTERS.prices[3], 150000);
  const state = levelGame(12, 300000);
  for (let i = 0; i < 3; i++) assert.equal(buyCounter(state), 'ok');
  assert.equal(state.counters.length, 5);
  assert.deepEqual(counterSlots(state)[5], { index: 5, status: 'locked', price: 150000, level: 13 });
  assert.equal(buyCounter(state), 'level');
  state.shopLevel = 13;
  assert.equal(counterSlots(state)[5].status, 'next');
  assert.equal(buyCounter(state), 'ok');
  assert.equal(state.counters.length, 6);
  assert.equal(state.gold, 300000 - 15000 - 35000 - 70000 - 150000);
});

// ---------- Ofen ----------

test('Ofen auf Level 12: nur Holzstämme – Sand gibt es beim Händler noch nicht', () => {
  const state = levelGame(12, 5000);
  assert.equal(buyRaw(state, 'sand'), 'locked');
  assert.equal(state.gold, 5000);
  const ofen = placeBuilding(state, 'kohlenmeiler', 10, 6, 0);
  assert.equal(refillInput(state, ofen), 'holzstamm');
  assert.equal(refillPlan(state, ofen).cost, 3 * ITEMS.holzstamm.buyPrice);
  state.storage.holzstamm = 1;
  assert.ok(loadInput(state, ofen, 'holzstamm'));
  assert.equal(buildingStatus(state, ofen).text, 'Arbeitet: noch 100 von 100.', 'ohne Namen – es gibt nur einen Rohstoff');
});

test('Ofen auf Level 13: 1 Sand → 100 Glas in 15 Minuten, ins Laden-Lager', () => {
  const state = levelGame(13, 1100);
  assert.equal(buyRaw(state, 'sand'), 'ok');
  assert.equal(state.gold, 0);
  const ofen = placeBuilding(state, 'kohlenmeiler', 10, 6, 0);
  placeBuilding(state, 'versandportal', 12, 6, 0);
  assert.ok(loadInput(state, ofen, 'sand'));
  assert.equal(buildingStatus(state, ofen).text, 'Arbeitet Sand: noch 100 von 100.');
  simulate(state, 450);
  assert.ok(storageCount(state, 'glas') >= 49 && storageCount(state, 'glas') <= 51, 'nach der halben Zeit etwa 50 Glas');
  simulate(state, 450 + 5);
  assert.equal(storageCount(state, 'glas'), 100);
  assert.equal(storageCount(state, 'holzkohle'), 0);
  assert.equal(sourceCount(ofen), 0);
});

test('Ofen gemischt: erst der Holzstamm, dann der Sand – Holzkohle und Glas über dasselbe Band', () => {
  const state = levelGame(13);
  state.storage = { holzstamm: 1, sand: 1 };
  const ofen = placeBuilding(state, 'kohlenmeiler', 10, 6, 0);
  placeBuilding(state, 'versandportal', 12, 6, 0);
  assert.ok(loadInput(state, ofen, 'holzstamm'));
  assert.ok(loadInput(state, ofen, 'sand'));
  assert.equal(buildingStatus(state, ofen).text, 'Arbeitet Holzstamm: noch 100 von 100. Danach noch 1 Sand.');
  simulate(state, 1800 + 10);
  assert.equal(storageCount(state, 'holzkohle'), 100);
  assert.equal(storageCount(state, 'glas'), 100);
});

test('Ofen auffüllen: läuft Sand, kauft er Sand nach', () => {
  const state = levelGame(13, 5000);
  state.storage.sand = 1;
  const ofen = placeBuilding(state, 'kohlenmeiler', 10, 6, 0);
  assert.equal(refillInput(state, ofen), 'sand', 'leer: der Rohstoff, von dem am meisten im Laden-Lager liegt');
  const plan = refillSource(state, ofen);
  assert.deepEqual([plan.input, plan.fromStorage, plan.buy, plan.cost], ['sand', 1, 2, 2200]);
  assert.equal(sourceCount(ofen), 3);
  assert.equal(state.gold, 5000 - 2200);
  assert.equal(refillInput(state, ofen), 'sand', 'läuft Sand, bleibt es Sand');
});

// ---------- Schmiede: Fläschchen ----------

test('Schmiede auf Fläschchen: 5 Glas → 1 Fläschchen in 30 Sekunden', () => {
  const state = levelGame(13);
  const schmiede = placeBuilding(state, 'schmiede', 16, 6, 0);
  assert.ok(setRecipe(schmiede, 'flaeschchen'));
  schmiede.prod.stock = { glas: 5 };
  simulate(state, 29);
  assert.equal(schmiede.prod.out, null, 'nach 29 s noch nicht fertig');
  simulate(state, 2);
  assert.deepEqual(schmiede.prod.out, { type: 'flaeschchen', count: 1 });
  assert.deepEqual(schmiede.prod.stock, { glas: 0 });
});

test('Kette: Sand → Ofen → Band → Schmiede → 20 Fläschchen im Laden-Lager', () => {
  const state = levelGame(13);
  state.storage.sand = 1;
  const ofen = placeBuilding(state, 'kohlenmeiler', 10, 6, 0);
  drag(state, [
    [12, 6],
    [15, 6],
  ]);
  const schmiede = placeBuilding(state, 'schmiede', 16, 6, 0);
  drag(state, [
    [18, 6],
    [20, 6],
  ]);
  placeBuilding(state, 'versandportal', 21, 6, 0);
  assert.ok(setRecipe(schmiede, 'flaeschchen'));
  assert.ok(loadInput(state, ofen, 'sand'));
  simulate(state, 900 + 60);
  assert.equal(storageCount(state, 'flaeschchen'), 20);
  assert.equal(storageCount(state, 'flaeschchen') * ITEMS.flaeschchen.price, 1440);
});

// ---------- Testpaket und Spielstand ----------

test('Testpaket auf Level 13: Glas und Fläschchen (kein Sand); auf Level 12 noch nicht', () => {
  const thirteen = levelGame(13);
  applyTestPack(thirteen);
  for (const type of ['glas', 'flaeschchen']) assert.ok(storageCount(thirteen, type) > 0, type);
  assert.equal(storageCount(thirteen, 'sand'), 0, 'Rohstoffe gibt es im Testpaket nicht');
  const twelve = levelGame(12);
  applyTestPack(twelve);
  for (const type of ['glas', 'flaeschchen']) assert.equal(storageCount(twelve, type), 0, type);
});

test('Spielstand: Ofen mit Sand und Holzstamm, Schmiede auf Fläschchen und 6 Theken bleiben nach Speichern und Laden – kein eigenes Format nötig', () => {
  assert.ok(SAVE_VERSION >= 18, 'kein neues Spielstand-Format nötig');
  const state = levelGame(13, 400000);
  state.storage = { sand: 2, holzstamm: 1 };
  const ofen = placeBuilding(state, 'kohlenmeiler', 10, 6, 0);
  loadInput(state, ofen, 'sand');
  loadInput(state, ofen, 'holzstamm');
  loadInput(state, ofen, 'sand');
  const schmiede = placeBuilding(state, 'schmiede', 16, 6, 0);
  setRecipe(schmiede, 'flaeschchen');
  schmiede.prod.stock = { glas: 3 };
  while (buyCounter(state) === 'ok');
  assert.equal(state.counters.length, 6);
  const loaded = deserializeGame(serializeGame(state));
  assert.ok(loaded);
  assert.equal(loaded.state.shopLevel, 13);
  const o = loaded.state.buildings.find((b) => b.type === 'kohlenmeiler');
  assert.deepEqual([o.prod.input, o.prod.queue], ['sand', ['holzstamm', 'sand']]);
  const s = loaded.state.buildings.find((b) => b.type === 'schmiede');
  assert.equal(s.prod.recipe, 'flaeschchen');
  assert.deepEqual(s.prod.stock, { glas: 3 });
  assert.equal(loaded.state.counters.length, 6);
});

test('Ein Kohlenmeiler aus einem älteren Spielstand (Level 9, Holzstamm) lädt als Ofen weiter', () => {
  const state = levelGame(9);
  state.storage.holzstamm = 2;
  const ofen = placeBuilding(state, 'kohlenmeiler', 10, 6, 0);
  loadInput(state, ofen, 'holzstamm');
  loadInput(state, ofen, 'holzstamm');
  const text = serializeGame(state);
  assert.ok(text.includes('"kohlenmeiler"'), 'intern heißt er weiter kohlenmeiler');
  const loaded = deserializeGame(text);
  const o = loaded.state.buildings.find((b) => b.type === 'kohlenmeiler');
  assert.deepEqual([o.prod.loaded, o.prod.input, o.prod.queue], [true, 'holzstamm', ['holzstamm']]);
  assert.equal(BUILDINGS[o.type].name, 'Ofen');
});
