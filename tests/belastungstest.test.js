// v0.39.0: Belastungstest (Tobias, Chat 25) – eine voll bebaute Fabrik zum
// Ablesen der Bilder pro Sekunde. Geprüft wird hier, was ohne Browser geht:
// Die Fabrik füllt die ganze Fläche nach den echten Regeln und läuft, und
// main.js speichert sie nie. Die Anzeige prüft der Browser-Test (spiel3d.cjs).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import { createStressFactory, STRESS_LINES } from '../src/core/belastungstest.js';
import { footprintTiles } from '../src/core/geometry.js';
import { STRESS_SLOT, GAME_SLOT } from '../src/ui/storage.js';

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

test('Belastungstest: die ganze Fläche (Level 13, 46 × 38) voller Straßen, alle Haus-Arten', () => {
  const state = createStressFactory();
  assert.equal(state.shopLevel, 13);
  assert.deepEqual([state.plot.width, state.plot.height], [46, 38]);
  assert.deepEqual(state.plot, state.world);
  assert.ok(state.buildings.length >= 150, `${state.buildings.length} Gebäude`);
  assert.ok(Object.keys(state.belts).length >= 300, `${Object.keys(state.belts).length} Bänder`);
  const types = new Set(state.buildings.map((b) => b.type));
  for (const line of STRESS_LINES) assert.ok(types.has(line.source) && types.has(line.machine), line.source);
  for (const b of state.buildings) {
    for (const c of footprintTiles(b.type, b.x, b.y, b.rot ?? 0)) {
      assert.ok(c.x >= state.plot.x && c.x < state.plot.x + state.plot.width && c.y >= state.plot.y && c.y < state.plot.y + state.plot.height, `${b.type} im Grundstück`);
    }
  }
});

test('Belastungstest: die Fabrik läuft – Waren auf den Bändern und im Laden-Lager', () => {
  const state = createStressFactory();
  assert.ok(Object.values(state.belts).some((b) => b.item), 'Waren liegen auf den Bändern');
  assert.ok(Object.values(state.storage).reduce((a, n) => a + n, 0) > 0, 'die Versandportale haben verschickt');
});

test('Belastungstest: wird nie gespeichert und nutzt einen eigenen Speicherplatz', () => {
  assert.notEqual(STRESS_SLOT, GAME_SLOT);
  const main = read('src/main.js');
  assert.ok(main.includes("const STRESS_TEST = new URLSearchParams(location.search).has('belastungstest');"));
  assert.ok(main.includes('if (STRESS_TEST) useSaveSlot(STRESS_SLOT);'));
  assert.ok(main.includes("const loaded = STRESS_TEST ? { status: 'none' } : loadGame();"), 'lädt keinen Spielstand');
  assert.ok(main.includes('if (!resetting && !catchUpJob && !STRESS_TEST) saveGame(state);'), 'speichert nie');
  assert.equal((main.match(/saveGame\(/g) ?? []).length, 1, 'saveGame nur an dieser einen Stelle');
  assert.ok(main.includes("location.href = 'index.html?belastungstest=1';"));
  const html = read('index.html');
  assert.ok(html.includes('id="menu-stress"') && html.includes('id="stress-banner"') && html.includes('id="stress-exit"'));
});
