// v0.18.0: Bauleiste mit Reitern (Holz, Stein, Eisen, Kräuter). Den Platz unter
// der Karte für die Bauleiste (2D-Kamera) gibt es seit v0.54.0 nur noch in 3D.
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { BUILDINGS, BUILD_ALWAYS, BUILD_MENU, BUILD_TABS } from '../src/core/data/buildings.js';
import { ITEMS } from '../src/core/data/items.js';
import { unlocksOf } from '../src/core/levels.js';

// v0.19.0 (Tobias): Der Reiter „Kräuter“ heißt „Erde“.
// v0.26.0: dazu „Werkstatt“ für die Werkzeug-Maschinen ab Level 9.
test('Reiter: Holz, Stein, Eisen, Erde, Werkstatt – in dieser Reihenfolge', () => {
  assert.deepEqual(
    BUILD_TABS.map((t) => t.name),
    ['Holz', 'Stein', 'Eisen', 'Erde', 'Werkstatt'],
  );
  assert.equal(new Set(BUILD_TABS.map((t) => t.id)).size, BUILD_TABS.length, 'Reiter-Kennungen sind eindeutig');
  for (const tab of BUILD_TABS) assert.ok(ITEMS[tab.item], `Warenbild ${tab.item} des Reiters ${tab.name} gibt es`);
});

test('Jedes Gebäude steht genau einmal in der Bauleiste (Reiter oder immer sichtbar)', () => {
  const all = [...BUILD_TABS.flatMap((t) => t.buildings), ...BUILD_ALWAYS];
  assert.equal(new Set(all).size, all.length, 'kein Gebäude doppelt');
  assert.deepEqual([...all].sort(), Object.keys(BUILDINGS).sort(), 'alle Gebäude sind erreichbar');
  assert.deepEqual([...BUILD_MENU].sort(), [...all].sort(), 'BUILD_MENU enthält dieselben Gebäude');
});

test('Immer sichtbar: Lagerhaus und Versandportal', () => {
  assert.deepEqual(BUILD_ALWAYS, ['lagerhaus', 'versandportal']);
});

test('Einteilung der Reiter (Tobias): Kombi-Maschinen beim Stoff, zu dem sie passen', () => {
  const tabOf = Object.fromEntries(BUILD_TABS.flatMap((t) => t.buildings.map((b) => [b, t.id])));
  assert.deepEqual(BUILD_TABS.find((t) => t.id === 'holz').buildings, ['holzfaeller', 'saegewerk', 'zimmerei', 'kohlenmeiler']);
  // v0.55.0: der Zauberkessel (Level 15) im Reiter „Stein“ (Tobias, Chat 27: „mehr mit stein arbeiten“)
  assert.deepEqual(BUILD_TABS.find((t) => t.id === 'stein').buildings, ['steinbruch', 'steinmetz', 'zauberkessel']);
  assert.deepEqual(BUILD_TABS.find((t) => t.id === 'eisen').buildings, ['schmelzhuette', 'schmiede', 'feinschmiede', 'schlosserei']);
  assert.deepEqual(BUILD_TABS.find((t) => t.id === 'kraeuter').buildings, ['beet', 'flachsbreche', 'webstube', 'kraeuterstube']);
  assert.deepEqual(BUILD_TABS.find((t) => t.id === 'werkstatt').buildings, ['schreibstube', 'uhrmacherei', 'apotheke']);
  assert.equal(tabOf.zimmerei, 'holz');
  assert.equal(tabOf.schlosserei, 'eisen');
});

test('Höchstens 4 Gebäude je Reiter (passen auch auf dem Handy nebeneinander)', () => {
  for (const tab of BUILD_TABS) assert.ok(tab.buildings.length <= 4, `${tab.name}: ${tab.buildings.length} Gebäude`);
});

test('Level-Fenster nennt die freigeschalteten Gebäude weiter wie bisher', () => {
  assert.deepEqual(unlocksOf(1).buildings.sort(), ['holzfaeller', 'lagerhaus', 'saegewerk', 'versandportal']);
  assert.deepEqual(unlocksOf(7).buildings, ['beet', 'flachsbreche', 'webstube']);
  assert.deepEqual(unlocksOf(8).buildings, ['kraeuterstube']);
});
