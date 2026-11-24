// v0.30.0: Laden-Lager vergrößern (Tobias, Chat 21: „dass man sein Lager z.b.
// um 100 vergrößert für einen bestimmten Preis, sodass man sein Gold auch für
// das Lager ausgeben kann.“) – je Ausbau +100 Plätze, der erste 5.000 Gold,
// jeder weitere 2.500 mehr, 10-mal (das Lager verdoppelt sich), ab Level 7.
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { placeBuilding } from '../src/core/buildings.js';
import { SHOP_LEVELS, STORAGE_UPGRADE } from '../src/core/data/shop.js';
import { buyRaw } from '../src/core/market.js';
import { SAVE_VERSION, deserializeGame, isValidState, serializeGame } from '../src/core/save.js';
import {
  buyStorageUpgrade,
  nextStorageUpgrade,
  storageCapacity,
  storageFree,
  storageUpgradeBlocker,
  storageUpgradePrice,
  storageUpgrades,
} from '../src/core/shop.js';
import { simulate } from '../src/core/sim.js';
import { createNewGame } from '../src/core/state.js';

function levelGame(level, gold = 0) {
  const state = createNewGame(30);
  state.shopLevel = level;
  state.gold = gold;
  return state;
}

// ---------- Datentabelle ----------

test('Tobias: +100 Plätze, 5.000 Gold, jeder weitere Ausbau 2.500 mehr, 10-mal, ab Level 7', () => {
  assert.deepEqual(STORAGE_UPGRADE, { size: 100, firstPrice: 5000, priceStep: 2500, max: 10, level: 7 });
});

test('Preise der 10 Ausbauten: 5.000, 7.500 … 27.500 – zusammen 162.500 Gold', () => {
  const prices = Array.from({ length: STORAGE_UPGRADE.max }, (_, i) => storageUpgradePrice(i));
  assert.deepEqual(prices, [5000, 7500, 10000, 12500, 15000, 17500, 20000, 22500, 25000, 27500]);
  assert.equal(
    prices.reduce((a, b) => a + b, 0),
    162500,
  );
});

test('Ganz ausgebaut verdoppelt sich das Lager: 1.000 → 2.000 Plätze („sodass das Lager sich verdoppelt“)', () => {
  assert.equal(SHOP_LEVELS[7].storage, 1000);
  assert.equal(SHOP_LEVELS[7].storage + STORAGE_UPGRADE.max * STORAGE_UPGRADE.size, 2000);
});

// ---------- Kaufen ----------

test('Ein neues Spiel hat noch keinen Ausbau', () => {
  const state = createNewGame(1);
  assert.equal(state.storageUpgrades, 0);
  assert.equal(storageUpgrades(state), 0);
  assert.equal(storageCapacity(state), 500);
});

test('Unter Level 7 gesperrt („ab Level 7 beginnen, wenn wir auch mit Kräutern anfangen“)', () => {
  const state = levelGame(6, 100000);
  assert.equal(storageUpgradeBlocker(state), 'level');
  assert.equal(buyStorageUpgrade(state), 'level');
  assert.equal(state.gold, 100000);
  assert.equal(storageCapacity(state), 1000);
  state.shopLevel = 7;
  assert.equal(storageUpgradeBlocker(state), null);
  assert.equal(buyStorageUpgrade(state), 'ok');
});

test('Der erste Ausbau auf Level 7: 5.000 Gold, +100 Plätze (1.000 → 1.100)', () => {
  const state = levelGame(7, 6000);
  assert.deepEqual(nextStorageUpgrade(state), { number: 1, price: 5000, size: 100, from: 1000, to: 1100 });
  assert.equal(buyStorageUpgrade(state), 'ok');
  assert.equal(state.gold, 1000);
  assert.equal(state.storageUpgrades, 1);
  assert.equal(storageCapacity(state), 1100);
  assert.deepEqual(nextStorageUpgrade(state), { number: 2, price: 7500, size: 100, from: 1100, to: 1200 });
});

test('Ohne genug Gold kein Ausbau, nichts ändert sich', () => {
  const state = levelGame(11, 4999);
  assert.equal(storageUpgradeBlocker(state), 'gold');
  assert.equal(buyStorageUpgrade(state), 'gold');
  assert.equal(state.gold, 4999);
  assert.equal(storageUpgrades(state), 0);
});

test('Alle 10 Ausbauten: 2.000 Plätze für 162.500 Gold, danach ist Schluss', () => {
  const state = levelGame(12, 200000);
  for (let i = 0; i < 10; i++) assert.equal(buyStorageUpgrade(state), 'ok', `Ausbau ${i + 1}`);
  assert.equal(storageCapacity(state), 2000);
  assert.equal(state.gold, 200000 - 162500);
  assert.equal(nextStorageUpgrade(state), null);
  assert.equal(storageUpgradeBlocker(state), 'max');
  assert.equal(buyStorageUpgrade(state), 'max');
  assert.equal(state.gold, 37500);
});

test('Tobias’ Lager mit 950+ Waren: nach dem Ausbau ist wieder Platz', () => {
  const state = levelGame(11, 60000);
  state.storage = { zirkel: 600, kastenschloss: 400 };
  assert.equal(storageFree(state), 0);
  assert.equal(buyRaw(state, 'holzstamm'), 'full');
  buyStorageUpgrade(state);
  assert.equal(storageFree(state), 100);
  assert.equal(buyRaw(state, 'holzstamm'), 'ok');
});

test('Das Versandportal schickt Waren, bis auch das größere Lager voll ist', () => {
  const state = levelGame(11, 60000);
  state.buildings = [];
  state.belts = {};
  state.storage = { zirkel: 1000 };
  placeBuilding(state, 'versandportal', 10, 6, 0);
  // Ein Band vor dem Eingang (links) mit einem Scharnier darauf
  state.belts['9,6'] = { outs: ['E'], item: { type: 'scharnier', progress: 1, from: 'W' } };
  simulate(state, 2);
  assert.equal(state.storage.scharnier, undefined, 'Lager voll (1.000): das Portal nimmt nichts an');
  assert.ok(state.belts['9,6'].item, 'das Scharnier wartet auf dem Band');
  buyStorageUpgrade(state);
  assert.equal(storageCapacity(state), 1100);
  simulate(state, 2);
  assert.equal(state.storage.scharnier, 1, 'Platz im größeren Lager');
});

// ---------- Spielstand ----------

test('Spielstand: ab Format 18 bleiben die Ausbauten nach Speichern und Laden erhalten', () => {
  assert.ok(SAVE_VERSION >= 18);
  const state = levelGame(11, 20000);
  buyStorageUpgrade(state);
  buyStorageUpgrade(state);
  const loaded = deserializeGame(serializeGame(state));
  assert.ok(loaded);
  assert.equal(loaded.state.storageUpgrades, 2);
  assert.equal(storageCapacity(loaded.state), 1200);
});

test('Spielstand aus v0.29.0 (Format 17): beginnt mit 0 Ausbauten, sonst bleibt alles gleich', () => {
  const state = levelGame(11, 60000);
  state.storage = { zirkel: 950 };
  delete state.storageUpgrades;
  const loaded = deserializeGame(JSON.stringify({ saveVersion: 17, savedAt: 1000, state }));
  assert.ok(loaded);
  assert.equal(loaded.migratedFrom, 17);
  assert.equal(loaded.state.storageUpgrades, 0);
  assert.equal(loaded.state.gold, 60000);
  assert.deepEqual(loaded.state.storage, { zirkel: 950 });
  assert.equal(storageCapacity(loaded.state), 1000);
});

test('Ungültige Ausbauten werden erkannt', () => {
  const bad = (value) => {
    const s = createNewGame(2);
    s.storageUpgrades = value;
    return isValidState(s);
  };
  assert.equal(bad(0), true);
  assert.equal(bad(10), true);
  assert.equal(bad(11), false);
  assert.equal(bad(-1), false);
  assert.equal(bad(1.5), false);
  assert.equal(bad(undefined), false);
});
