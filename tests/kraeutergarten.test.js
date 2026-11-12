// v0.17.0: Level 8 „Der Kräutergarten“ – Ringelblume im selben Beet, Erntebank
// (bisher Flachsbreche) für alle Pflanzen, Kräuterstube mit zwei Eingängen.
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { applyBeltPath, buildBeltPath, extendTrace } from '../src/core/belts.js';
import { placeBuilding, removeBuilding } from '../src/core/buildings.js';
import { BUILDINGS } from '../src/core/data/buildings.js';
import { ITEMS } from '../src/core/data/items.js';
import { LEVELS } from '../src/core/data/levels.js';
import { RECIPES } from '../src/core/data/recipes.js';
import { itemLevel, levelUp, unlocksOf } from '../src/core/levels.js';
import { applyTestPack, defaultSeed, isBuyable, isSellable, refillInput, refillPlan, refillSource, sowPlan, sowSeed } from '../src/core/market.js';
import {
  buildingContents,
  buildingStatus,
  harvest,
  isRipe,
  loadInput,
  setRecipe,
  sourceCount,
  sourceStock,
} from '../src/core/production.js';
import { xpNeeded } from '../src/core/quests.js';
import { SAVE_VERSION, deserializeGame, isValidState, serializeGame } from '../src/core/save.js';
import { storageCount } from '../src/core/shop.js';
import { simulate } from '../src/core/sim.js';
import { createNewGame } from '../src/core/state.js';

const GROW = 1800;

function level8() {
  const state = createNewGame(8);
  state.buildings = [];
  state.belts = {};
  state.storage = {};
  state.shopLevel = 8;
  state.gold = 0;
  return state;
}

function drag(state, points) {
  let trace = [];
  for (const [x, y] of points) trace = extendTrace(trace, { x, y });
  applyBeltPath(state, buildBeltPath(state, trace));
}

const clone = (state) => deserializeGame(serializeGame(state)).state;
const worth = (cost) => Object.entries(cost).reduce((sum, [t, n]) => sum + ITEMS[t].price * n, 0);

// ---------- Datentabellen ----------

test('Datentabellen: Ringelblume im selben Beet, im gleichen Takt wie Flachs (30 Minuten)', () => {
  assert.deepEqual(BUILDINGS.beet.production.crops, {
    leinsamen: { plant: 'flachspflanze', time: GROW },
    ringelblumensamen: { plant: 'ringelblume', time: GROW },
  });
});

test('Erntebank (bisher Flachsbreche): ein Gerät für alle Pflanzen, je 1 Pflanze → 50 Waren', () => {
  const def = BUILDINGS.flachsbreche;
  assert.equal(def.name, 'Erntebank');
  assert.deepEqual(def.production.inputs, { flachspflanze: 'flachsfaser', ringelblume: 'ringelbluete' });
  assert.deepEqual([def.production.amount, def.production.duration, def.production.capacity], [50, 600, 3]);
});

test('Kräuterstube: 2 × 2, zwei Eingänge, Heilverband und Kräuterkompresse', () => {
  const def = BUILDINGS.kraeuterstube;
  assert.deepEqual([def.level, def.size], [8, [2, 2]]);
  assert.equal(def.ports.filter((p) => p.kind === 'in').length, 2);
  assert.deepEqual(def.production.recipes, ['heilverband', 'kraeuterkompresse']);
  assert.deepEqual(RECIPES.heilverband.inputs, { verband: 1, ringelbluete: 5 });
  assert.deepEqual(RECIPES.kraeuterkompresse.inputs, { flachsfaser: 10, ringelbluete: 5 });
  assert.deepEqual([RECIPES.heilverband.time, RECIPES.kraeuterkompresse.time], [20, 20]);
});

test('Preise: Ringelblume teurer, bringt aber mehr – 1 Leinsamen + 1 Ringelblumensamen → 10 Heilverbände', () => {
  // v0.23.0: durch 3 wie alle Preise (vorher 1.500, 1.800, 330 → 396, 430 → 516, 2.500 → 3.960)
  assert.equal(ITEMS.ringelblumensamen.buyPrice, 500);
  assert.equal(50 * ITEMS.ringelbluete.price, 600);
  const verband = RECIPES.heilverband;
  assert.equal(worth(verband.inputs), 108);
  assert.equal(ITEMS.heilverband.price, 130);
  assert.equal(worth(RECIPES.kraeuterkompresse.inputs), 140);
  assert.equal(ITEMS.kraeuterkompresse.price, 168);
  // 50 Ringelblüten + 10 Verbände (= 1 Flachspflanze) → 10 Heilverbände
  const seeds = ITEMS.leinsamen.buyPrice + ITEMS.ringelblumensamen.buyPrice;
  assert.deepEqual([seeds, 10 * ITEMS.heilverband.price], [820, 1300]);
});

test('Baukosten der Kräuterstube nur aus Werkzeug-Waren (Tobias)', () => {
  assert.deepEqual(BUILDINGS.kraeuterstube.cost, { holzplatte: 10, eisenblech: 5, zahnradwelle: 2 });
  assert.equal(worth(BUILDINGS.kraeuterstube.cost), 396, 'v0.23.0: durch 3 (vorher 1.188)');
  for (const type of ['beet', 'flachsbreche', 'webstube', 'kraeuterstube']) {
    for (const item of Object.keys(BUILDINGS[type].cost)) {
      assert.ok(itemLevel(item) <= 6, `${type}: ${item} ist eine Werkzeug-Ware`);
    }
  }
});

test('Ringelblume ist ein Rohstoff zum Einlegen: nicht kaufen, nicht verkaufen', () => {
  assert.equal(isBuyable('ringelblume'), false);
  assert.equal(isBuyable('ringelblumensamen'), true);
  assert.equal(isSellable('ringelblume'), false);
  for (const type of ['ringelbluete', 'heilverband', 'kraeuterkompresse']) assert.equal(isSellable(type), true, type);
});

// ---------- Level 8 ----------

test('Level 8 „Der Kräutergarten“: Kräuterstube und Ringelblumensamen, Aufstieg 1.330 Gold, 4 Aufträge', () => {
  assert.deepEqual(unlocksOf(8), { buildings: ['kraeuterstube'], raws: ['ringelblumensamen'] });
  assert.equal(LEVELS[8].name, 'Der Kräutergarten');
  assert.equal(LEVELS[8].quests.length, 4);
  assert.equal(xpNeeded(8), 1305, 'v0.23.0: 1.305 statt 1.332 (Kräuter-Preise gerundet)');
  const state = createNewGame(8);
  state.shopLevel = 7;
  state.quest.xp = xpNeeded(7);
  state.gold = 1330;
  const up = levelUp(state);
  assert.deepEqual([up.level, up.gift, up.cost], [8, { ringelblumensamen: 1 }, 1330]);
  assert.equal(storageCount(state, 'ringelblumensamen'), 1);
  assert.equal(state.gold, 0);
});

// ---------- Beet ----------

test('Beet: Ringelblumensamen säen (aus dem Lager oder für 500 Gold gekauft), nach 30 Minuten ernten', () => {
  const state = level8();
  state.storage.ringelblumensamen = 1;
  const beet = placeBuilding(state, 'beet', 10, 6, 0);
  assert.equal(defaultSeed(state, beet), 'leinsamen', 'ohne Auswahl der erste Samen');
  assert.equal(sowSeed(state, beet, 'ringelblumensamen').result, 'ok');
  assert.equal(buildingStatus(state, beet).text, 'Ringelblume wächst.');
  simulate(state, GROW);
  assert.equal(isRipe(beet), true);
  assert.equal(harvest(state, beet), 'ok');
  assert.equal(storageCount(state, 'ringelblume'), 1);
  state.gold = 499;
  assert.equal(sowPlan(state, beet, 'ringelblumensamen').result, 'gold');
  state.gold = 500;
  assert.deepEqual([sowSeed(state, beet, 'ringelblumensamen').cost, state.gold], [500, 0]);
});

test('Unter Level 8 lassen sich keine Ringelblumen säen', () => {
  const state = level8();
  state.shopLevel = 7;
  state.gold = 5000;
  const beet = placeBuilding(state, 'beet', 10, 6, 0);
  assert.equal(sowPlan(state, beet, 'ringelblumensamen').result, 'locked');
  assert.equal(sowPlan(state, beet, 'leinsamen').result, 'ok');
});

// ---------- Erntebank ----------

test('Erntebank: 1 Ringelblume → 50 Ringelblüten in 10 Minuten', () => {
  const state = level8();
  state.storage.ringelblume = 1;
  const bank = placeBuilding(state, 'flachsbreche', 10, 6, 0);
  placeBuilding(state, 'versandportal', 12, 6, 0);
  assert.ok(loadInput(state, bank, 'ringelblume'));
  assert.equal(buildingStatus(state, bank).text, 'Arbeitet Ringelblume: noch 50 von 50.');
  simulate(state, 600 + 5);
  assert.equal(storageCount(state, 'ringelbluete'), 50);
  assert.equal(sourceCount(bank), 0);
});

test('Erntebank mit gemischtem Vorrat: der Reihe nach, erst Fasern, dann Blüten, dann wieder Fasern', () => {
  const state = level8();
  state.storage = { flachspflanze: 2, ringelblume: 1 };
  const bank = placeBuilding(state, 'flachsbreche', 10, 6, 0);
  placeBuilding(state, 'versandportal', 12, 6, 0);
  assert.ok(loadInput(state, bank, 'flachspflanze'));
  assert.ok(loadInput(state, bank, 'ringelblume'));
  assert.ok(loadInput(state, bank, 'flachspflanze'));
  assert.deepEqual(sourceStock(bank), { flachspflanze: 2, ringelblume: 1 });
  assert.deepEqual([bank.prod.input, bank.prod.queue, bank.prod.queued], ['flachspflanze', ['ringelblume', 'flachspflanze'], 2]);
  assert.equal(buildingStatus(state, bank).text, 'Arbeitet Flachspflanze: noch 50 von 50. Danach noch 1 Ringelblume und 1 Flachspflanze.');
  // Abreißen jetzt: die unberührten Pflanzen kämen alle zurück
  assert.deepEqual(buildingContents(bank), { flachspflanze: 2, ringelblume: 1 });
  simulate(state, 605);
  assert.deepEqual([storageCount(state, 'flachsfaser'), storageCount(state, 'ringelbluete')], [50, 0]);
  assert.equal(bank.prod.input, 'ringelblume');
  simulate(state, 600);
  assert.deepEqual([storageCount(state, 'flachsfaser'), storageCount(state, 'ringelbluete')], [50, 50]);
  simulate(state, 600);
  assert.deepEqual([storageCount(state, 'flachsfaser'), storageCount(state, 'ringelbluete')], [100, 50]);
  assert.deepEqual([bank.prod.loaded, bank.prod.input, bank.prod.queue], [false, null, []]);
});

test('Auffüllen: mit der Pflanze, die gerade läuft – ist die Erntebank leer, mit der häufigsten im Laden-Lager', () => {
  const state = level8();
  state.storage = { flachspflanze: 1, ringelblume: 4 };
  const bank = placeBuilding(state, 'flachsbreche', 10, 6, 0);
  assert.equal(refillInput(state, bank), 'ringelblume', 'leer: die häufigste');
  assert.ok(loadInput(state, bank, 'flachspflanze'));
  assert.equal(refillInput(state, bank), 'flachspflanze', 'läuft: dieselbe');
  const plan = refillPlan(state, bank);
  assert.deepEqual([plan.input, plan.fromStorage, plan.buy, plan.cost], ['flachspflanze', 0, 0, 0]);
  const empty = placeBuilding(state, 'flachsbreche', 14, 6, 0);
  refillSource(state, empty);
  assert.deepEqual(sourceStock(empty), { ringelblume: 3 });
  assert.equal(storageCount(state, 'ringelblume'), 1);
  // Holzfällerlager & Co. bleiben bei ihrem einen Rohstoff
  const wood = placeBuilding(state, 'holzfaeller', 18, 6, 0);
  assert.equal(refillInput(state, wood), 'holzstamm');
});

// ---------- Kräuterstube ----------

test('Kette: Ringelblume → Erntebank → Band → Kräuterstube (mit Verbänden) → 10 Heilverbände im Laden-Lager', () => {
  const state = level8();
  state.storage.ringelblume = 1;
  const bank = placeBuilding(state, 'flachsbreche', 10, 6, 0);
  drag(state, [
    [12, 6],
    [15, 6],
  ]);
  const stube = placeBuilding(state, 'kraeuterstube', 16, 6, 0);
  drag(state, [
    [18, 6],
    [20, 6],
  ]);
  placeBuilding(state, 'versandportal', 21, 6, 0);
  stube.prod.stock = { verband: 10 }; // die Verbände kämen sonst über den zweiten Eingang
  assert.ok(loadInput(state, bank, 'ringelblume'));
  simulate(state, 600 + 60);
  assert.equal(storageCount(state, 'heilverband'), 10);
  assert.equal(storageCount(state, 'heilverband') * ITEMS.heilverband.price, 1300);
});

test('Kräuterstube umstellen: Kräuterkompresse aus 10 Flachsfasern + 5 Ringelblüten', () => {
  const state = level8();
  const stube = placeBuilding(state, 'kraeuterstube', 16, 6, 0);
  assert.equal(stube.prod.recipe, 'heilverband');
  assert.ok(setRecipe(stube, 'kraeuterkompresse'));
  stube.prod.stock = { flachsfaser: 10, ringelbluete: 5 };
  simulate(state, 21);
  assert.deepEqual(stube.prod.out, { type: 'kraeuterkompresse', count: 1 });
  assert.deepEqual(stube.prod.stock, { flachsfaser: 0, ringelbluete: 0 });
});

// ---------- Testpaket und Spielstand ----------

test('Testpaket auf Level 8: Ringelblüten, Heilverbände und Kompressen je 5, keine Samen oder Pflanzen', () => {
  const state = level8();
  applyTestPack(state);
  for (const type of ['ringelbluete', 'heilverband', 'kraeuterkompresse']) assert.equal(storageCount(state, type), 5, type);
  for (const type of ['ringelblumensamen', 'ringelblume']) assert.equal(storageCount(state, type), 0, type);
});

test('Spielstand (seit Version 14): gemischter Vorrat der Erntebank bleibt erhalten, Ungültiges wird erkannt', () => {
  assert.ok(SAVE_VERSION >= 14);
  const state = level8();
  state.storage = { flachspflanze: 1, ringelblume: 1 };
  const bank = placeBuilding(state, 'flachsbreche', 10, 6, 0);
  loadInput(state, bank, 'ringelblume');
  loadInput(state, bank, 'flachspflanze');
  const loaded = clone(state);
  assert.deepEqual([loaded.buildings[0].prod.input, loaded.buildings[0].prod.queue], ['ringelblume', ['flachspflanze']]);
  for (const change of [
    (p) => (p.input = 'holzstamm'),
    (p) => (p.input = null),
    (p) => (p.queue = ['holzstamm']),
    (p) => (p.queue = []),
    (p) => delete p.queue,
  ]) {
    const copy = clone(state);
    change(copy.buildings[0].prod);
    assert.equal(isValidState(copy), false, change.toString());
  }
});

test('Spielstand aus v0.16 (Version 13): Flachsbreche und Holzfällerlager bekommen ihren Rohstoff eingetragen', () => {
  const v13 = createNewGame(13);
  v13.shopLevel = 7;
  v13.buildings = [];
  v13.belts = {};
  const wood = placeBuilding(v13, 'holzfaeller', 10, 6, 0);
  const bank = placeBuilding(v13, 'flachsbreche', 14, 6, 0);
  const idle = placeBuilding(v13, 'steinbruch', 18, 6, 0);
  // So sah der Zustand in Version 13 aus: ohne input und queue
  Object.assign(wood.prod, { loaded: true, remaining: 120, queued: 2 });
  Object.assign(bank.prod, { loaded: true, remaining: 30, queued: 1 });
  for (const b of [wood, bank, idle]) {
    delete b.prod.input;
    delete b.prod.queue;
  }
  const loaded = deserializeGame(JSON.stringify({ saveVersion: 13, savedAt: 1, state: v13 }));
  assert.ok(loaded, 'Spielstand gültig');
  assert.equal(loaded.migratedFrom, 13);
  const [w, b, s] = loaded.state.buildings;
  assert.deepEqual([w.prod.input, w.prod.queue, w.prod.remaining], ['holzstamm', ['holzstamm', 'holzstamm'], 120]);
  assert.deepEqual([b.prod.input, b.prod.queue], ['flachspflanze', ['flachspflanze']]);
  assert.deepEqual([s.prod.input, s.prod.queue], [null, []]);
  removeBuilding(loaded.state, b.id);
  assert.equal(storageCount(loaded.state, 'flachspflanze'), 1, 'die wartende Pflanze kommt zurück');
});
