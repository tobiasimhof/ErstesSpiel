// v0.22.0: Spielstand sichern und laden – Dateiname, Vorschau, Prüfung der
// Datei und dass die Fabrik nach dem Laden die Zeit seit dem Sichern nachholt.
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { applyBeltPath, buildBeltPath, extendTrace } from '../src/core/belts.js';
import { placeBuilding } from '../src/core/buildings.js';
import { catchUp } from '../src/core/offline.js';
import { loadInput, sourceCount } from '../src/core/production.js';
import { SAVE_VERSION, serializeGame } from '../src/core/save.js';
import { addMissingCounters } from '../src/core/shop.js';
import { createNewGame } from '../src/core/state.js';
import { backupFileName, backupSummary, loadQuestion, readBackup, savedAtText } from '../src/view/backup.js';

function drag(state, points) {
  let trace = [];
  for (const [x, y] of points) trace = extendTrace(trace, { x, y });
  applyBeltPath(state, buildBeltPath(state, trace));
}

// Holzfällerlager (10,6) → Band → Versandportal (15,6), 3 Holzstämme im Vorrat
function smallFactory() {
  const state = createNewGame(7);
  state.buildings = [];
  state.belts = {};
  state.storage = {};
  state.shopLevel = 4; // Laden-Lager mit 1.000 Plätzen
  addMissingCounters(state);
  const wood = placeBuilding(state, 'holzfaeller', 10, 6, 0);
  drag(state, [
    [12, 6],
    [14, 6],
  ]);
  placeBuilding(state, 'versandportal', 15, 6, 0);
  state.storage.holzstamm = 3;
  for (let i = 0; i < 3; i++) assert.ok(loadInput(state, wood));
  return state;
}

test('Dateiname: Level, Datum und Uhrzeit, ohne Doppelpunkt, endet auf .txt (lässt sich auf Android teilen)', () => {
  const state = createNewGame(1);
  state.shopLevel = 8;
  const name = backupFileName(state, new Date(2026, 10, 11, 21, 45));
  assert.equal(name, 'Fabrik Level 8 - 11.11.2026 21-45.txt');
  assert.doesNotMatch(name, /[:/\\]/);
  assert.equal(backupFileName(state, new Date(2026, 0, 3, 7, 5)), 'Fabrik Level 8 - 03.01.2026 07-05.txt');
});

test('Vorschau: Level, Gold, Gebäude und wann gesichert', () => {
  const state = createNewGame(1);
  state.shopLevel = 8;
  state.gold = 43870;
  assert.equal(backupSummary(state), `Level 8 · 43.870 Gold · ${state.buildings.length} Gebäude`);
  assert.equal(savedAtText(new Date(2026, 10, 11, 9, 5).getTime()), 'am 11.11.2026 um 09:05 Uhr');
  assert.equal(savedAtText(0), '');
  const savedAt = new Date(2026, 10, 11, 21, 45).getTime();
  const result = readBackup(serializeGame(state, savedAt));
  const question = loadQuestion('Fabrik Level 8 - 11.11.2026 21-45.txt', result.loaded);
  assert.match(question, /„Fabrik Level 8 - 11\.11\.2026 21-45\.txt“/);
  assert.match(question, /Level 8 · 43\.870 Gold · \d+ Gebäude, gesichert am 11\.11\.2026 um 21:45 Uhr\./);
  assert.match(question, /jetziger Spielstand wird dabei ersetzt/);
  assert.match(question, /holt die Zeit seit dem Sichern nach/);
});

test('Sichern und Laden ergeben denselben Spielstand mit derselben Uhrzeit', () => {
  const state = smallFactory();
  state.gold = 12345;
  const savedAt = Date.UTC(2026, 10, 11, 20, 45);
  const text = serializeGame(state, savedAt);
  const result = readBackup(text);
  assert.equal(result.ok, true);
  assert.equal(result.loaded.savedAt, savedAt);
  assert.equal(result.loaded.migratedFrom, undefined);
  assert.deepEqual(JSON.parse(JSON.stringify(result.loaded.state)), JSON.parse(JSON.stringify(state)));
});

test('Nach dem Laden holt die Fabrik die Zeit seit dem Sichern nach (wie „Willkommen zurück“)', () => {
  const state = smallFactory();
  const result = readBackup(serializeGame(state, Date.now() - 40 * 60 * 1000));
  const loaded = result.loaded.state;
  const wood = loaded.buildings.find((b) => b.type === 'holzfaeller');
  assert.equal(sourceCount(wood), 3);
  // So rechnet das Spiel beim Start: Zeit seit dem Sichern
  const seconds = (Date.now() - result.loaded.savedAt) / 1000;
  const report = catchUp(loaded, seconds);
  assert.ok(Math.abs(report.seconds - 2400) < 5, `etwa 40 Minuten nachgeholt (${report.seconds})`);
  assert.equal(sourceCount(wood), 1, 'nach 40 Minuten: 2 Holzstämme verarbeitet, der dritte läuft');
  assert.ok(wood.prod.loaded, 'der dritte Holzstamm läuft noch');
  assert.ok((loaded.storage.holzblock ?? 0) > 450, `Holzblöcke im Laden-Lager (${loaded.storage.holzblock})`);
});

test('Ältere Spielstände lassen sich laden und werden umgewandelt', () => {
  const state = smallFactory();
  const data = JSON.parse(serializeGame(state, Date.now()));
  // Format 14 kannte die zuletzt versendeten Waren des Versandportals noch nicht
  data.saveVersion = 14;
  for (const b of data.state.buildings) if (b.type === 'versandportal') delete b.prod.recent;
  const result = readBackup(JSON.stringify(data));
  assert.equal(result.ok, true);
  assert.equal(result.loaded.migratedFrom, 14);
  assert.ok(result.loaded.state.buildings.find((b) => b.type === 'versandportal').prod.recent);
});

test('Falsche oder beschädigte Dateien werden abgelehnt', () => {
  const good = serializeGame(smallFactory(), Date.now());
  for (const text of ['', 'Hallo', '{}', '[]', 'null', good.slice(0, good.length / 2), JSON.stringify({ saveVersion: SAVE_VERSION, state: {} })]) {
    assert.deepEqual(readBackup(text), { ok: false, reason: 'invalid' }, text.slice(0, 40));
  }
  assert.deepEqual(readBackup(undefined), { ok: false, reason: 'invalid' });
  assert.deepEqual(readBackup(null), { ok: false, reason: 'invalid' });
});

test('Spielstand aus einer neueren Version: eigener Hinweis', () => {
  const data = JSON.parse(serializeGame(smallFactory(), Date.now()));
  data.saveVersion = SAVE_VERSION + 1;
  assert.deepEqual(readBackup(JSON.stringify(data)), { ok: false, reason: 'newer' });
});
