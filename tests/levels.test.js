import { test } from 'node:test';
import assert from 'node:assert/strict';

import { BUILDINGS, BUILD_MENU } from '../src/core/data/buildings.js';
import { ITEMS } from '../src/core/data/items.js';
import { LEVELS, MAX_LEVEL } from '../src/core/data/levels.js';
import { SHOP_LEVELS } from '../src/core/data/shop.js';
import { buyBuilding, placeBuilding } from '../src/core/buildings.js';
import {
  canLevelUp,
  isBuildingUnlocked,
  itemLevel,
  levelUp,
  levelUpBlocker,
  nextLevelCost,
  producedCount,
  unlocksOf,
} from '../src/core/levels.js';
import { canDeliver, currentQuest, deliverQuest, levelQuests, xpNeeded } from '../src/core/quests.js';
import { buyRaw } from '../src/core/market.js';
import { loadInput, setRecipe } from '../src/core/production.js';
import { deserializeGame, serializeGame } from '../src/core/save.js';
import { simulate } from '../src/core/sim.js';
import { storageCount } from '../src/core/shop.js';
import { createNewGame } from '../src/core/state.js';

// ---------- Datentabellen ----------

test('Level-Tabelle: jedes Level ein Bauabschnitt mit 2–5 Aufträgen; ab Level 2 Preis und Gratis-Rohstoff (v0.13.0)', () => {
  assert.equal(MAX_LEVEL, 8);
  let lastCost = 0;
  for (let level = 1; level <= MAX_LEVEL; level++) {
    const def = LEVELS[level];
    assert.ok(def?.name && def.story, `Level ${level} hat einen Bauabschnitt und eine Geschichte`);
    assert.ok(SHOP_LEVELS[level], `Laden-Daten für Level ${level}`);
    // Tobias: pro Level 2–5 Aufträge
    assert.ok(def.quests.length >= 2 && def.quests.length <= 5, `Level ${level}: ${def.quests.length} Aufträge`);
    for (const quest of def.quests) {
      assert.ok(quest.from && quest.text, 'Auftrag mit Bewohner und Text');
      for (const [type, n] of Object.entries(quest.items)) {
        assert.ok(ITEMS[type] && !ITEMS[type].raw, `Auftrags-Ware ${type}`);
        assert.ok(Number.isInteger(n) && n > 0);
        assert.ok(itemLevel(type) <= level, `${type} lässt sich auf Level ${level} herstellen`);
      }
    }
    if (level === 1) continue;
    assert.ok(def.cost > lastCost, `Level ${level} kostet mehr als das vorige (${def.cost})`);
    lastCost = def.cost;
    // Zu Beginn jedes Levels genau ein Rohstoff gratis (Tobias): bis Level 3
    // der neue Rohstoff, Level 4–6 Eisenerz (einen vierten Rohstoff gibt es
    // nicht), v0.16.0: Level 7 der erste Samen des Kräuter-Kapitels.
    assert.deepEqual(Object.values(def.gift), [1]);
    const [raw] = Object.keys(def.gift);
    const giftLevel = level <= 3 ? level : level <= 6 ? 3 : level;
    assert.ok(ITEMS[raw].raw && ITEMS[raw].buyPrice > 0 && itemLevel(raw) === giftLevel, `Geschenk ${raw} passt zu Level ${level}`);
  }
});

test('Jedes Kombi-Produkt wird in mindestens einem Auftrag gebraucht', () => {
  const asked = new Set(Object.values(LEVELS).flatMap((def) => def.quests.flatMap((q) => Object.keys(q.items))));
  for (const type of ['zahnradwelle', 'raederwerk', 'verstaerkteholzplatte', 'scharnier', 'schluessel', 'zirkel', 'gewichtstein', 'uhrwerk', 'vorhaengeschloss']) {
    assert.ok(asked.has(type), `${type} kommt in einem Auftrag vor`);
  }
});

test('Jedes Gebäude und jede Ware gehört zu einem Level', () => {
  for (const type of Object.keys(BUILDINGS)) {
    const level = BUILDINGS[type].level;
    assert.ok(Number.isInteger(level) && level >= 1 && level <= MAX_LEVEL, `${type}: Level ${level}`);
  }
  for (const type of Object.keys(ITEMS)) {
    const level = itemLevel(type);
    assert.ok(level >= 1 && level <= MAX_LEVEL, `${type}: Level ${level}`);
  }
});

test('Holz ab Level 1, Stein ab Level 2, Eisen ab Level 3', () => {
  assert.deepEqual(unlocksOf(1), { buildings: ['holzfaeller', 'saegewerk', 'lagerhaus', 'versandportal'], raws: ['holzstamm'] });
  assert.deepEqual(unlocksOf(2), { buildings: ['steinbruch', 'steinmetz'], raws: ['felsbrocken'] });
  assert.deepEqual(unlocksOf(3), { buildings: ['schmelzhuette', 'schmiede'], raws: ['eisenerz'] });
  assert.equal(itemLevel('holzblock'), 1);
  assert.equal(itemLevel('holzstab'), 1);
  assert.equal(itemLevel('steinblock'), 2);
  assert.equal(itemLevel('steinzahnrad'), 2);
  assert.equal(itemLevel('eisenbarren'), 3);
  assert.equal(itemLevel('eisenstange'), 3);
  assert.equal(BUILD_MENU.filter((t) => BUILDINGS[t].level === 1).length, 4);
});

test('Level 4 bis 6 schalten je eine Kombi-Maschine frei (v0.10.0)', () => {
  assert.deepEqual(unlocksOf(4), { buildings: ['zimmerei'], raws: [] });
  assert.deepEqual(unlocksOf(5), { buildings: ['feinschmiede'], raws: [] });
  assert.deepEqual(unlocksOf(6), { buildings: ['schlosserei'], raws: [] });
  for (const type of ['zahnradwelle', 'raederwerk', 'verstaerkteholzplatte']) assert.equal(itemLevel(type), 4, type);
  for (const type of ['scharnier', 'schluessel', 'zirkel']) assert.equal(itemLevel(type), 5, type);
  for (const type of ['gewichtstein', 'uhrwerk', 'vorhaengeschloss']) assert.equal(itemLevel(type), 6, type);
  // Baukosten bestehen nur aus Waren, die man vorher herstellen kann
  for (const type of ['zimmerei', 'feinschmiede', 'schlosserei']) {
    for (const item of Object.keys(BUILDINGS[type].cost)) {
      assert.ok(itemLevel(item) < BUILDINGS[type].level, `${type}: ${item} vorher herstellbar`);
    }
  }
});

// ---------- Sperren ----------

test('Level 1: Stein- und Eisen-Gebäude lassen sich nicht bauen, auch mit genug Waren', () => {
  const state = createNewGame(1);
  state.storage = { holzplatte: 100, holzstab: 100, steinplatte: 100, steinblock: 100, eisenbarren: 100 };
  assert.equal(isBuildingUnlocked(state, 'saegewerk'), true);
  assert.equal(isBuildingUnlocked(state, 'steinbruch'), false);
  assert.equal(buyBuilding(state, 'steinbruch', 20, 12), 'locked');
  assert.equal(buyBuilding(state, 'schmiede', 20, 12), 'locked');
  assert.equal(storageCount(state, 'holzplatte'), 100, 'nichts bezahlt');
  assert.equal(state.buildings.length, 2);
  state.shopLevel = 2;
  assert.ok(typeof buyBuilding(state, 'steinbruch', 20, 12) === 'object', 'ab Level 2 baubar');
  assert.equal(buyBuilding(state, 'schmiede', 24, 12), 'locked', 'Eisen erst ab Level 3');
});

test('Händler: Felsbrocken erst ab Level 2, Eisenerz ab Level 3', () => {
  const state = createNewGame(1);
  state.gold = 10000;
  assert.equal(buyRaw(state, 'felsbrocken'), 'locked');
  assert.equal(buyRaw(state, 'eisenerz'), 'locked');
  assert.equal(state.gold, 10000, 'nichts bezahlt');
  assert.equal(buyRaw(state, 'holzstamm'), 'ok');
  state.shopLevel = 2;
  assert.equal(buyRaw(state, 'felsbrocken'), 'ok');
  assert.equal(buyRaw(state, 'eisenerz'), 'locked');
  state.shopLevel = 3;
  assert.equal(buyRaw(state, 'eisenerz'), 'ok');
});

// ---------- Hergestellte Waren zählen ----------

// Neues Spiel: Holzfäller (10,6) gibt bei (12,6) direkt ins Sägewerk (12,6),
// das gibt bei (14,6) direkt in ein Versandportal.
function woodLine(seed = 5) {
  const state = createNewGame(seed);
  const saw = placeBuilding(state, 'saegewerk', 12, 6, 0);
  placeBuilding(state, 'versandportal', 14, 6, 0);
  assert.ok(loadInput(state, state.buildings[0]));
  return { state, saw };
}

test('Hergestellte Waren werden gezählt – Blöcke und Teile', () => {
  const { state } = woodLine();
  simulate(state, 60);
  assert.ok(producedCount(state, 'holzblock') >= 12, `Blöcke: ${producedCount(state, 'holzblock')}`);
  assert.ok(producedCount(state, 'holzplatte') >= 1, `Platten: ${producedCount(state, 'holzplatte')}`);
  assert.equal(producedCount(state, 'holzstab'), 0);
  // Die Zähler werden mitgespeichert
  const loaded = deserializeGame(serializeGame(state));
  assert.deepEqual(loaded.state.produced, state.produced);
});

// ---------- Aufsteigen (v0.13.0: Erfahrung aus Aufträgen, dann Gold) ----------

// Gibt die Waren des aktuellen Auftrags ins Laden-Lager und gibt ihn ab.
function deliverWithGoods(state) {
  const quest = currentQuest(state);
  for (const [type, n] of Object.entries(quest.items)) state.storage[type] = (state.storage[type] ?? 0) + n;
  return deliverQuest(state);
}

test('Aufstieg auf Level 2: erst genug Erfahrung, dann kostet er Gold; dafür gibt es einen Felsbrocken', () => {
  const state = createNewGame(5);
  assert.equal(levelUpBlocker(state), 'xp');
  assert.equal(levelUp(state), null, 'noch keine Erfahrung');
  assert.equal(nextLevelCost(state), 100);
  deliverWithGoods(state);
  deliverWithGoods(state);
  assert.equal(levelUpBlocker(state), 'xp', 'ein Auftrag fehlt noch');
  deliverWithGoods(state);
  assert.equal(state.quest.xp, xpNeeded(1));
  assert.equal(currentQuest(state), null, 'alle Aufträge von Level 1 erledigt');
  state.gold = 99;
  assert.equal(levelUpBlocker(state), 'gold');
  assert.equal(levelUp(state), null);
  state.gold = 450;
  assert.equal(canLevelUp(state), true);
  assert.deepEqual(levelUp(state), { level: 2, gift: { felsbrocken: 1 }, counters: 0, cost: 100 });
  assert.equal(state.gold, 350, '100 Gold bezahlt');
  assert.equal(storageCount(state, 'felsbrocken'), 1, 'Gratis-Felsbrocken im Laden-Lager');
  assert.deepEqual(state.quest, { index: 0, xp: 0 }, 'Aufträge von Level 2 beginnen');
  assert.equal(currentQuest(state), levelQuests(2)[0]);
  assert.equal(levelUpBlocker(state), 'xp');
});

test('Level 4 bis 6: Eisenerz als Geschenk und je eine neue Theke; Level 7 und 8 mit Samen; danach ist Schluss', () => {
  const state = createNewGame(3);
  state.shopLevel = 3;
  state.gold = 100000;
  const results = [];
  for (let i = 0; i < 5; i++) {
    state.quest.xp = xpNeeded(state.shopLevel);
    results.push(levelUp(state));
  }
  assert.deepEqual(results, [
    { level: 4, gift: { eisenerz: 1 }, counters: 1, cost: 500 },
    { level: 5, gift: { eisenerz: 1 }, counters: 1, cost: 1000 },
    { level: 6, gift: { eisenerz: 1 }, counters: 1, cost: 2000 },
    // v0.16.0: Kräuter-Kapitel – der Laden bleibt wie auf Level 6
    { level: 7, gift: { leinsamen: 1 }, counters: 0, cost: 3000 },
    // v0.17.0: Level 8 „Der Kräutergarten“
    { level: 8, gift: { ringelblumensamen: 1 }, counters: 0, cost: 4000 },
  ]);
  assert.equal(state.gold, 100000 - 10500);
  assert.equal(state.counters.length, 5);
  assert.equal(storageCount(state, 'eisenerz'), 3);
  assert.equal(storageCount(state, 'leinsamen'), 1);
  assert.equal(storageCount(state, 'ringelblumensamen'), 1);
  state.quest.xp = 99999;
  assert.equal(levelUpBlocker(state), 'max', 'höchstes Level');
  assert.equal(nextLevelCost(state), null);
  assert.equal(levelUp(state), null);
  assert.equal(state.shopLevel, 8);
});

test('Ein neues Spiel lässt sich von Holz bis Eisen durchspielen', () => {
  const { state, saw } = woodLine(11);
  // Die ersten Aufträge mit echter Produktion: 5 Holzplatten, dann 10 Holzstäbe
  simulate(state, 150);
  assert.ok(storageCount(state, 'holzplatte') >= 5, `Holzplatten: ${storageCount(state, 'holzplatte')}`);
  assert.ok(canDeliver(state));
  assert.equal(deliverQuest(state).gold, 90);
  setRecipe(saw, 'holzstab');
  simulate(state, 300);
  assert.ok(deliverQuest(state), 'Holzstäbe abgegeben');
  // Den Zaun liefern wir aus dem Test (sonst dauert es einen zweiten Holzstamm)
  deliverWithGoods(state);
  assert.ok(levelUp(state));
  // Stein: Steinbruch und Steinmetz bauen (Waren aus dem Test), Felsbrocken einlegen
  Object.assign(state.storage, { holzplatte: 10, holzstab: 10, steinblock: 30 });
  const quarry = buyBuilding(state, 'steinbruch', 10, 12, 0);
  const mason = buyBuilding(state, 'steinmetz', 12, 12, 0);
  assert.ok(typeof quarry === 'object' && typeof mason === 'object');
  placeBuilding(state, 'versandportal', 14, 12, 0);
  assert.ok(loadInput(state, quarry), 'Gratis-Felsbrocken eingelegt');
  simulate(state, 300);
  assert.ok(storageCount(state, 'steinplatte') >= 10, `Steinplatten: ${storageCount(state, 'steinplatte')}`);
  assert.ok(deliverQuest(state), 'Pflaster für den Weg abgegeben');
  setRecipe(mason, 'steinzahnrad');
  simulate(state, 300);
  assert.ok(deliverQuest(state), 'Zahnräder für die Brunnenwinde abgegeben');
  deliverWithGoods(state);
  assert.deepEqual(levelUp(state), { level: 3, gift: { eisenerz: 1 }, counters: 0, cost: 250 });
  Object.assign(state.storage, { steinplatte: 30, holzplatte: 10, eisenbarren: 30 });
  assert.equal(typeof buyBuilding(state, 'schmelzhuette', 18, 12, 0), 'object');
  assert.equal(typeof buyBuilding(state, 'schmiede', 20, 12, 0), 'object');
});
