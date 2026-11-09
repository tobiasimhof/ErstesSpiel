// v0.18.0: Bauleiste mit Reitern (Holz, Stein, Eisen, Kräuter) und Platz unter
// der Karte, damit die unterste Reihe über die Bauleiste geschoben werden kann.
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { BUILDINGS, BUILD_ALWAYS, BUILD_MENU, BUILD_TABS } from '../src/core/data/buildings.js';
import { ITEMS } from '../src/core/data/items.js';
import { unlocksOf } from '../src/core/levels.js';
import { clampCamera, createCamera, panBy, setViewSize } from '../src/view/camera.js';

test('Reiter: Holz, Stein, Eisen, Kräuter – in dieser Reihenfolge', () => {
  assert.deepEqual(
    BUILD_TABS.map((t) => t.name),
    ['Holz', 'Stein', 'Eisen', 'Kräuter'],
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
  assert.deepEqual(BUILD_TABS.find((t) => t.id === 'holz').buildings, ['holzfaeller', 'saegewerk', 'zimmerei']);
  assert.deepEqual(BUILD_TABS.find((t) => t.id === 'stein').buildings, ['steinbruch', 'steinmetz']);
  assert.deepEqual(BUILD_TABS.find((t) => t.id === 'eisen').buildings, ['schmelzhuette', 'schmiede', 'feinschmiede', 'schlosserei']);
  assert.deepEqual(BUILD_TABS.find((t) => t.id === 'kraeuter').buildings, ['beet', 'flachsbreche', 'webstube', 'kraeuterstube']);
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

function camera(width, height) {
  const cam = createCamera();
  setViewSize(cam, width, height);
  return cam;
}

test('Kamera: Mit Platz unten lässt sich die unterste Reihe über die Bauleiste schieben', () => {
  const world = { x: 0, y: 0, width: 2000, height: 2000 };
  for (const zoom of [0.5, 1, 2]) {
    const cam = camera(1280, 756);
    cam.zoom = zoom;
    const bounds = { ...world, padBottom: 158 };
    panBy(cam, 0, -1e7, bounds); // ganz nach unten schieben
    const worldBottomOnScreen = (world.y + world.height - cam.y) * cam.zoom;
    assert.ok(Math.abs(worldBottomOnScreen - (756 - 158)) < 1e-6, `Zoom ${zoom}: Weltrand bei ${worldBottomOnScreen}`);
    // Ohne Platz endet die Karte am Bildschirmrand (wie bisher).
    panBy(cam, 0, -1e7, world);
    assert.ok(Math.abs((world.y + world.height - cam.y) * cam.zoom - 756) < 1e-6);
  }
});

test('Kamera: Der Platz gilt nur unten – oben und an den Seiten bleibt alles wie bisher', () => {
  const world = { x: 0, y: 0, width: 2000, height: 2000 };
  const cam = camera(800, 400);
  panBy(cam, 1e7, 1e7, { ...world, padBottom: 120 });
  assert.equal(cam.x, 0);
  assert.equal(cam.y, 0);
  panBy(cam, -1e7, 0, { ...world, padBottom: 120 });
  assert.equal(cam.x, 2000 - 800);
  clampCamera(cam, { ...world, padBottom: 0 });
  assert.equal(cam.y, 0);
});
