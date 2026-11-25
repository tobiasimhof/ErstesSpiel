// v0.55.0: Level 15 „Der alte Magier“ (Entwurf v0.55.0, Tobias, Chat 31:
// „Passt so für mich“, „Ich würde gerne 1 Trinktur und 5 Blüten machen“,
// „10.000 Gold ist super“) – Magier Ambrosius bringt den Zauberkessel mit
// (Reiter „Stein“, 2 Eingänge, Feuerfach für Holzkohle, von Hand nachlegen),
// der braut den Traumtrank. Dazu Wirt Hannes, Aufstieg 15.000 Gold und je
// Seite ein 4. Flächenstreifen für 10.000 Gold.
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { applyBeltPath, buildBeltPath, extendTrace } from '../src/core/belts.js';
import { placeBuilding, removeBuilding } from '../src/core/buildings.js';
import { BUILDINGS, BUILD_TABS } from '../src/core/data/buildings.js';
import { ITEMS } from '../src/core/data/items.js';
import { LEVELS, MAX_LEVEL } from '../src/core/data/levels.js';
import { RECIPES } from '../src/core/data/recipes.js';
import { SHOP_LEVELS } from '../src/core/data/shop.js';
import { fitWorldToLevel, worldForLevel } from '../src/core/land.js';
import { isBuildingUnlocked, isRecipeUnlocked, levelUp, recipeLevel } from '../src/core/levels.js';
import { catchUp } from '../src/core/offline.js';
import {
  buildingContents,
  buildingStatus,
  fuelRoom,
  fuelSlot,
  hasFuel,
  missingInputs,
  refuel,
} from '../src/core/production.js';
import { levelQuests, questReward, xpNeeded } from '../src/core/quests.js';
import { SAVE_VERSION, deserializeGame, isValidState, serializeGame } from '../src/core/save.js';
import { storageCount } from '../src/core/shop.js';
import { simulate } from '../src/core/sim.js';
import { createNewGame } from '../src/core/state.js';

function levelGame(level, gold = 0) {
  const state = createNewGame(15);
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

function kessel(state, x = 12, y = 6) {
  return placeBuilding(state, 'zauberkessel', x, y, 0);
}

const worth = (items) => Object.entries(items).reduce((sum, [t, n]) => sum + ITEMS[t].price * n, 0);

// ---------- Datentabellen ----------

test('Level 15 „Der alte Magier“: Geschichte mit Ambrosius, Laden wie auf Level 14, Aufstieg 15.000 Gold ohne Geschenk', () => {
  assert.equal(MAX_LEVEL, 15);
  const def = LEVELS[15];
  assert.equal(def.name, 'Der alte Magier');
  assert.ok(def.story.includes('Ambrosius') && def.story.includes('Zauberkessel'), def.story);
  assert.equal(def.cost, 15000);
  assert.ok(!def.gift, 'kein Geschenk wie seit Level 11');
  assert.deepEqual(SHOP_LEVELS[15], SHOP_LEVELS[14]);
});

test('Traumtrank: 1 Tinktur + 5 Kamillenblüten, Feuer 5 Holzkohle, 60 s, 547 Gold (20 % auf Zutaten und Feuer), erst ab Level 15', () => {
  const r = RECIPES.traumtrank;
  assert.deepEqual(
    [r.building, r.label, r.inputs, r.fuel, r.output, r.amount, r.time],
    ['zauberkessel', 'Traumtränke', { tinktur: 1, kamillenbluete: 5 }, 5, 'traumtrank', 1, 60],
  );
  assert.equal(ITEMS.traumtrank.price, Math.round((worth(r.inputs) + ITEMS.holzkohle.price * r.fuel) * 1.2));
  assert.equal(ITEMS.traumtrank.price, 547);
  assert.equal(ITEMS.traumtrank.shape, 'potion');
  assert.equal(recipeLevel('traumtrank'), 15);
  assert.equal(isRecipeUnlocked(levelGame(14), 'traumtrank'), false);
  assert.equal(isRecipeUnlocked(levelGame(15), 'traumtrank'), true);
});

test('Zauberkessel: Reiter „Stein“, 2 × 2 mit 2 Eingängen, 30 Steinplatten + 10 Eisenbleche, Feuerfach für 100 Holzkohle, ab Level 15', () => {
  const def = BUILDINGS.zauberkessel;
  assert.equal(def.level, 15);
  assert.deepEqual(def.size, [2, 2]);
  assert.deepEqual(def.cost, { steinplatte: 30, eisenblech: 10 });
  assert.deepEqual(def.production, { kind: 'workshop', recipes: ['traumtrank'], fuel: { item: 'holzkohle', capacity: 100 } });
  assert.equal(def.ports.filter((p) => p.kind === 'in').length, 2, 'Tobias: höchstens 2 Eingänge – das Feuer kommt von Hand');
  assert.ok(BUILD_TABS.find((t) => t.id === 'stein').buildings.includes('zauberkessel'));
  assert.equal(isBuildingUnlocked(levelGame(14), 'zauberkessel'), false);
  assert.equal(isBuildingUnlocked(levelGame(15), 'zauberkessel'), true);
});

test('Aufträge auf Level 15: Ambrosius, Wirt Hannes, Klara – zusammen 16.066 Gold und 4.820 Erfahrung (×1,2 gegenüber Level 14)', () => {
  const quests = levelQuests(15);
  assert.deepEqual(
    quests.map((q) => [q.from, q.items]),
    [
      ['Magier Ambrosius', { holzkohle: 300 }],
      ['Magier Ambrosius', { traumtrank: 10 }],
      ['Wirt Hannes', { traumtrank: 8, kamillenkissen: 10 }],
      ['Apothekerin Klara', { tinktur: 10 }],
    ],
  );
  const gold = quests.map((q) => questReward(q).gold).reduce((a, b) => a + b, 0);
  assert.equal(gold, 16066);
  assert.equal(xpNeeded(15), 4820);
  const ratio = gold / 13251;
  assert.ok(ratio > 1.15 && ratio < 1.3, `Sprung zu Level 14: ×${ratio.toFixed(2)}`);
});

test('Aufstieg auf Level 15: 15.000 Gold, die Welt rückt an jeder Seite 4 Felder nach außen (bis 54 × 46)', () => {
  const state = levelGame(14, 20000);
  const before = { ...state.world };
  state.quest.xp = xpNeeded(14);
  const up = levelUp(state);
  assert.deepEqual(up, { level: 15, gift: {}, cost: 15000, moreLand: true });
  assert.equal(state.gold, 5000);
  assert.deepEqual(state.world, worldForLevel(15));
  assert.deepEqual([state.world.width - before.width, state.world.height - before.height], [8, 8]);
  assert.deepEqual([state.world.width, state.world.height], [54, 46]);
});

// ---------- Feuerfach ----------

test('Ein neuer Kessel hat kaltes Feuer: Mit allen Zutaten wartet er – „Feuer aus“, das Schild zeigt die Holzkohle', () => {
  const state = levelGame(15);
  const k = kessel(state);
  assert.deepEqual(fuelSlot(k), { item: 'holzkohle', capacity: 100, have: 0, perCraft: 5 });
  k.prod.stock = { tinktur: 1, kamillenbluete: 5 };
  simulate(state, 5);
  assert.equal(k.prod.busy, false);
  assert.equal(hasFuel(k), false);
  assert.deepEqual(buildingStatus(state, k), { level: 'idle', text: 'Feuer aus – Holzkohle nachlegen (0 / 100).' });
  assert.deepEqual(missingInputs(k), ['holzkohle']);
});

test('„🔥 Auffüllen“ nimmt Holzkohle aus dem Laden-Lager, bis das Feuerfach voll ist', () => {
  const state = levelGame(15);
  const k = kessel(state);
  assert.equal(refuel(state, k), 0, 'ohne Holzkohle im Laden-Lager passiert nichts');
  state.storage.holzkohle = 60;
  assert.equal(refuel(state, k), 60);
  assert.equal(storageCount(state, 'holzkohle'), 0);
  assert.equal(fuelRoom(k), 40);
  state.storage.holzkohle = 500;
  assert.equal(refuel(state, k), 40);
  assert.equal(storageCount(state, 'holzkohle'), 460);
  assert.equal(fuelRoom(k), 0);
  assert.equal(refuel(state, k), 0, 'voll');
});

test('Brauen: jeder Traumtrank verbrennt 5 Holzkohle und dauert 60 s; ist das Feuer aus, wartet der Kessel', () => {
  const state = levelGame(15);
  const k = kessel(state);
  state.storage.holzkohle = 7;
  refuel(state, k);
  k.prod.stock = { tinktur: 2, kamillenbluete: 10 };
  simulate(state, 1);
  assert.equal(k.prod.busy, true);
  assert.equal(k.prod.fuel, 2, '5 Holzkohle beim Anfangen verbrannt');
  assert.deepEqual(buildingStatus(state, k).level, 'work');
  simulate(state, 58);
  assert.equal(k.prod.out, null, 'nach 59 s noch nicht fertig');
  simulate(state, 2);
  assert.deepEqual(k.prod.out, { type: 'traumtrank', count: 1 });
  // Die Ware wird abgeholt – für den zweiten Trank reicht das Feuer nicht mehr
  k.prod.out = null;
  simulate(state, 5);
  assert.equal(k.prod.busy, false);
  assert.deepEqual(k.prod.stock, { tinktur: 1, kamillenbluete: 5 });
  assert.equal(buildingStatus(state, k).text, 'Feuer aus – Holzkohle nachlegen (2 / 100).');
});

test('Kessel über Bänder: Tinktur und Kamillenblüten rein, Traumtränke über das Portal ins Laden-Lager', () => {
  const state = levelGame(15);
  const k = kessel(state, 16, 6);
  placeBuilding(state, 'versandportal', 21, 6, 0);
  drag(state, [
    [18, 6],
    [21, 6],
  ]);
  state.storage.holzkohle = 100;
  refuel(state, k);
  k.prod.stock = { tinktur: 2, kamillenbluete: 10 };
  simulate(state, 130);
  assert.equal(storageCount(state, 'traumtrank'), 2);
  assert.equal(k.prod.fuel, 90);
});

test('Abreißen gibt die Holzkohle zurück – auch die eines angefangenen Tranks', () => {
  const state = levelGame(15);
  const k = kessel(state);
  state.storage.holzkohle = 30;
  refuel(state, k);
  k.prod.stock = { tinktur: 1, kamillenbluete: 5 };
  simulate(state, 1);
  assert.equal(k.prod.busy, true);
  assert.deepEqual(buildingContents(k), { tinktur: 1, kamillenbluete: 5, holzkohle: 30 });
  assert.ok(removeBuilding(state, k.id));
  assert.equal(storageCount(state, 'holzkohle'), 30);
  assert.equal(storageCount(state, 'tinktur'), 1);
});

// ---------- Spielstand und Willkommen zurück ----------

test(`Spielstand-Format ${SAVE_VERSION}: die Holzkohle im Feuerfach bleibt; nur Kessel haben ein Feuerfach`, () => {
  assert.equal(SAVE_VERSION, 21);
  const state = levelGame(15);
  const k = kessel(state);
  state.storage.holzkohle = 42;
  refuel(state, k);
  const loaded = deserializeGame(serializeGame(state));
  assert.ok(loaded);
  assert.equal(loaded.state.buildings.find((b) => b.type === 'zauberkessel').prod.fuel, 42);
  const tooMuch = structuredClone(state);
  tooMuch.buildings[0].prod.fuel = 101;
  assert.equal(isValidState(tooMuch), false, 'mehr als ins Fach passt');
  const noFuel = structuredClone(state);
  delete noFuel.buildings[0].prod.fuel;
  assert.equal(isValidState(noFuel), false, 'ein Kessel ohne Feuerfach');
  const other = levelGame(15);
  const apo = placeBuilding(other, 'apotheke', 12, 6, 0);
  apo.prod.fuel = 5;
  assert.equal(isValidState(other), false, 'die Apotheke hat kein Feuerfach');
});

test('Ein Spielstand von v0.54 (Format 20) lädt unverändert', () => {
  const old = levelGame(14);
  placeBuilding(old, 'apotheke', 12, 6, 0);
  const loaded = deserializeGame(JSON.stringify({ saveVersion: 20, savedAt: 1, state: old }));
  assert.ok(loaded);
  assert.equal(loaded.migratedFrom, 20);
  assert.equal(loaded.state.buildings[0].prod.fuel, undefined);
});

test('Willkommen zurück: Geht das Feuer während der Pause aus, steht es im Bericht', () => {
  const state = levelGame(15);
  const k = kessel(state);
  state.storage.holzkohle = 10;
  refuel(state, k);
  k.prod.stock = { tinktur: 2, kamillenbluete: 10 };
  // der Ausgang ist frei: das Portal direkt am Ausgang
  placeBuilding(state, 'versandportal', 14, 6, 0);
  const report = catchUp(state, 600);
  assert.deepEqual(report.fireOut, { zauberkessel: 1 });
  assert.equal(storageCount(state, 'traumtrank'), 2);
  // war das Feuer schon vorher aus, steht es nicht noch einmal drin
  const again = catchUp(state, 600);
  assert.deepEqual(again.fireOut, {});
});
