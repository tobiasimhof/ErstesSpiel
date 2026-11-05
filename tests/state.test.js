import { test } from 'node:test';
import assert from 'node:assert/strict';

import { BUILDINGS } from '../src/core/data/buildings.js';
import { createNewGame, buildingAt, buildingSize, isInWorld, isOwned, occupies } from '../src/core/state.js';

test('Neues Spiel startet mit Laden, Holzfällerlager und Steinbruch', () => {
  const state = createNewGame();
  assert.deepEqual(state.buildings.map((b) => b.type).sort(), ['holzfaeller', 'laden', 'steinbruch']);
  assert.equal(state.shopLevel, 1);
  assert.ok(state.gold > 0);
});

test('Jedes Gebäude hat eine eindeutige ID', () => {
  const state = createNewGame();
  const ids = state.buildings.map((b) => b.id);
  assert.equal(new Set(ids).size, ids.length);
});

test('Das Grundstück liegt vollständig in der Welt', () => {
  const { plot, world } = createNewGame();
  assert.ok(plot.x >= 0 && plot.y >= 0);
  assert.ok(plot.x + plot.width <= world.width);
  assert.ok(plot.y + plot.height <= world.height);
});

test('Startgebäude stehen komplett auf dem eigenen Grundstück', () => {
  const state = createNewGame();
  for (const b of state.buildings) {
    const { width, height } = buildingSize(b);
    for (let ty = b.y; ty < b.y + height; ty++) {
      for (let tx = b.x; tx < b.x + width; tx++) {
        assert.ok(isOwned(state, tx, ty), `${b.type} ragt bei (${tx}, ${ty}) aus dem Grundstück`);
      }
    }
  }
});

test('Startgebäude überlappen sich nicht', () => {
  const state = createNewGame();
  for (let ty = 0; ty < state.world.height; ty++) {
    for (let tx = 0; tx < state.world.width; tx++) {
      const count = state.buildings.filter((b) => occupies(b, tx, ty)).length;
      assert.ok(count <= 1, `Feld (${tx}, ${ty}) ist ${count}-mal belegt`);
    }
  }
});

test('buildingAt findet Gebäude auf allen ihren Feldern', () => {
  const state = createNewGame();
  const laden = state.buildings.find((b) => b.type === 'laden');
  const { width, height } = buildingSize(laden);
  assert.equal(buildingAt(state, laden.x, laden.y), laden);
  assert.equal(buildingAt(state, laden.x + width - 1, laden.y + height - 1), laden);
  assert.equal(buildingAt(state, laden.x + width, laden.y), null);
  assert.equal(buildingAt(state, laden.x - 1, laden.y), null);
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

test('Gebäude-Tabelle ist vollständig ausgefüllt', () => {
  for (const [key, def] of Object.entries(BUILDINGS)) {
    for (const field of ['name', 'icon', 'color', 'description']) {
      assert.ok(typeof def[field] === 'string' && def[field].length > 0, `${key}.${field} fehlt`);
    }
    assert.ok(Array.isArray(def.size) && def.size.length === 2, `${key}.size fehlt`);
    assert.ok(def.size.every((n) => Number.isInteger(n) && n > 0), `${key}.size ungültig`);
  }
});
