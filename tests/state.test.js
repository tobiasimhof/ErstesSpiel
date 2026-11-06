import { test } from 'node:test';
import assert from 'node:assert/strict';

import { BUILDINGS, BUILD_MENU } from '../src/core/data/buildings.js';
import { footprintSize, occupies } from '../src/core/geometry.js';
import { createNewGame, buildingAt, isInWorld, isOwned, parseTileKey, tileKey } from '../src/core/state.js';

test('Neues Spiel startet mit Holzfällerlager, Steinbruch und Versandportal; der Laden ist die Fläche', () => {
  const state = createNewGame();
  assert.deepEqual(state.buildings.map((b) => b.type).sort(), ['holzfaeller', 'steinbruch', 'versandportal']);
  assert.equal(state.shopLevel, 1);
  assert.equal(state.gold, 0, 'Start ohne Gold');
  assert.deepEqual(state.storage, { holzstamm: 1, felsbrocken: 1, holzblock: 20 });
  assert.ok(state.buildings.every((b) => !b.paid), 'Startgebäude waren gratis');
  assert.deepEqual(state.belts, {});
  assert.ok(state.buildings.every((b) => b.rot === 0));
});

test('Jedes Gebäude hat eine eindeutige ID, nextBuildingId ist größer', () => {
  const state = createNewGame();
  const ids = state.buildings.map((b) => b.id);
  assert.equal(new Set(ids).size, ids.length);
  assert.ok(ids.every((id) => id < state.nextBuildingId));
});

test('Das Grundstück liegt vollständig in der Welt', () => {
  const { plot, world } = createNewGame();
  assert.ok(plot.x >= 0 && plot.y >= 0);
  assert.ok(plot.x + plot.width <= world.width);
  assert.ok(plot.y + plot.height <= world.height);
});

test('Startgebäude stehen komplett auf dem Grundstück und überlappen nicht', () => {
  const state = createNewGame();
  for (const b of state.buildings) {
    const { width, height } = footprintSize(b.type, b.rot);
    for (let ty = b.y; ty < b.y + height; ty++) {
      for (let tx = b.x; tx < b.x + width; tx++) {
        assert.ok(isOwned(state, tx, ty), `${b.type} ragt bei (${tx}, ${ty}) aus dem Grundstück`);
      }
    }
  }
  for (let ty = 0; ty < state.world.height; ty++) {
    for (let tx = 0; tx < state.world.width; tx++) {
      const count = state.buildings.filter((b) => occupies(b, tx, ty)).length;
      assert.ok(count <= 1, `Feld (${tx}, ${ty}) ist ${count}-mal belegt`);
    }
  }
});

test('buildingAt findet Gebäude auf allen ihren Feldern', () => {
  const state = createNewGame();
  const b = state.buildings[0];
  const { width, height } = footprintSize(b.type, b.rot);
  assert.equal(buildingAt(state, b.x, b.y), b);
  assert.equal(buildingAt(state, b.x + width - 1, b.y + height - 1), b);
  assert.equal(buildingAt(state, b.x + width, b.y), null);
  assert.equal(buildingAt(state, b.x - 1, b.y), null);
});

test('isOwned und isInWorld erkennen die Ränder richtig', () => {
  const state = createNewGame();
  const p = state.plot;
  assert.equal(isOwned(state, p.x, p.y), true);
  assert.equal(isOwned(state, p.x + p.width - 1, p.y + p.height - 1), true);
  assert.equal(isOwned(state, p.x - 1, p.y), false);
  assert.equal(isOwned(state, p.x + p.width, p.y), false);
  assert.equal(isInWorld(state, 0, 0), true);
  assert.equal(isInWorld(state, -1, 0), false);
  assert.equal(isInWorld(state, state.world.width, 0), false);
});

test('tileKey und parseTileKey passen zusammen', () => {
  assert.deepEqual(parseTileKey(tileKey(12, -3)), { x: 12, y: -3 });
});

test('Gebäude-Tabelle ist vollständig ausgefüllt', () => {
  for (const [key, def] of Object.entries(BUILDINGS)) {
    for (const field of ['name', 'icon', 'color', 'description']) {
      assert.ok(typeof def[field] === 'string' && def[field].length > 0, `${key}.${field} fehlt`);
    }
    assert.ok(Array.isArray(def.size) && def.size.length === 2, `${key}.size fehlt`);
    assert.ok(def.size.every((n) => Number.isInteger(n) && n > 0), `${key}.size ungültig`);
    for (const port of def.ports ?? []) {
      assert.ok(['in', 'out'].includes(port.kind), `${key}: Port-Art ungültig`);
      assert.ok(port.x >= 0 && port.x < def.size[0] && port.y >= 0 && port.y < def.size[1], `${key}: Port außerhalb`);
      assert.ok(['N', 'E', 'S', 'W'].includes(port.side), `${key}: Port-Seite ungültig`);
    }
  }
  for (const type of BUILD_MENU) assert.ok(BUILDINGS[type], `Baumenü enthält unbekanntes Gebäude ${type}`);
});
