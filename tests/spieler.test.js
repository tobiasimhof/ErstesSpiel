// v0.50.0 (Tobias, Chat 29): Ladebildschirm und Name – „wenn man sich das
// erste mal regisitriert kurz ein Startbildschirm, gib deinen Namen ein und
// dann gehts schon los“. Hier: der Name im Spielstand (Format 19) und die
// Texte mit dem Namen. Der Ladebildschirm selbst steckt im Browser-Test.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import { LEVELS } from '../src/core/data/levels.js';
import { PLAYER_NAME_MAX, cleanPlayerName, hasPlayerName, setPlayerName } from '../src/core/player.js';
import { SAVE_VERSION, deserializeGame, isValidState, serializeGame } from '../src/core/save.js';
import { createNewGame } from '../src/core/state.js';
import { fillName, possessive } from '../src/ui/format.js';
import { backupFileName, backupSummary } from '../src/ui/backup.js';

test('Ein neues Spiel hat noch keinen Namen – der Ladebildschirm fragt danach', () => {
  const state = createNewGame(1);
  assert.equal(state.playerName, '');
  assert.equal(hasPlayerName(state), false);
  assert.ok(isValidState(state));
});

test('Name setzen: gekürzt, ohne Steuerzeichen, höchstens 16 Zeichen, nie leer', () => {
  const state = createNewGame(1);
  assert.equal(setPlayerName(state, '  Tobias  '), true);
  assert.equal(state.playerName, 'Tobias');
  assert.equal(hasPlayerName(state), true);
  assert.equal(setPlayerName(state, '   '), false, 'leer geht nicht');
  assert.equal(state.playerName, 'Tobias', 'der alte Name bleibt');
  assert.equal(cleanPlayerName('Anna\n  Lena\t'), 'Anna Lena');
  assert.equal(cleanPlayerName('A'.repeat(30)).length, PLAYER_NAME_MAX);
  assert.equal(PLAYER_NAME_MAX, 16);
  assert.equal(Array.from(cleanPlayerName('🦊'.repeat(20))).length, 16, 'Emojis zählen als ein Zeichen');
  assert.equal(cleanPlayerName(42), '');
});

test('Spielstand Format 19: der Name bleibt nach Speichern und Laden', () => {
  assert.equal(SAVE_VERSION, 19);
  const state = createNewGame(1);
  setPlayerName(state, 'Tobias');
  const loaded = deserializeGame(serializeGame(state));
  assert.ok(loaded);
  assert.equal(loaded.state.playerName, 'Tobias');
  assert.equal(loaded.migratedFrom, undefined);
});

test('Spielstand aus v0.49 (Format 18): bekommt einen leeren Namen, sonst bleibt alles gleich', () => {
  const state = createNewGame(3);
  state.gold = 26095;
  state.shopLevel = 13;
  delete state.playerName;
  const loaded = deserializeGame(JSON.stringify({ saveVersion: 18, savedAt: 1000, state }));
  assert.ok(loaded);
  assert.equal(loaded.migratedFrom, 18);
  assert.equal(loaded.state.playerName, '');
  assert.equal(loaded.state.gold, 26095);
  assert.equal(loaded.state.shopLevel, 13);
  assert.equal(loaded.state.buildings.length, 2);
});

test('Ungültige Namen im Spielstand werden erkannt', () => {
  const bad = (value) => {
    const s = createNewGame(2);
    s.playerName = value;
    return isValidState(s);
  };
  assert.equal(bad(''), true);
  assert.equal(bad('Tobias'), true);
  assert.equal(bad(undefined), false);
  assert.equal(bad(7), false);
  assert.equal(bad('A'.repeat(17)), false);
  assert.equal(bad(' Tobias'), false);
  assert.equal(bad('To\nbias'), false);
});

test('Texte mit dem Namen: „Tobias\' Laden“, Hilde begrüßt mit Namen', () => {
  assert.equal(possessive('Tobias'), "Tobias'");
  assert.equal(possessive('Anna'), 'Annas');
  assert.equal(possessive('Max'), "Max'");
  assert.equal(possessive('Fritz'), "Fritz'");
  const hilde = LEVELS[1].quests.find((q) => q.from === 'Bürgermeisterin Hilde');
  assert.ok(hilde.text.includes('{name}'), 'Hilde begrüßt im ersten Level mit Namen');
  assert.ok(fillName(hilde.text, 'Tobias').startsWith('Willkommen im Ort, Tobias!'));
  assert.ok(fillName(hilde.text, '').startsWith('Willkommen im Ort!'), 'ohne Namen fällt der Platzhalter weg');
  for (const level of Object.values(LEVELS)) {
    for (const quest of level.quests ?? []) assert.ok(!fillName(quest.text, '').includes('{'), quest.text);
  }
});

test('Sichern: Dateiname und Vorschau mit Namen', () => {
  const state = createNewGame(1);
  const date = new Date(2026, 10, 24, 21, 45);
  assert.equal(backupFileName(state, date), 'Fabrik Level 1 - 24.11.2026 21-45.txt', 'ohne Namen wie bisher');
  setPlayerName(state, 'Tobias');
  assert.equal(backupFileName(state, date), 'Tobias - Fabrik Level 1 - 24.11.2026 21-45.txt');
  setPlayerName(state, 'A/B: C?');
  assert.equal(backupFileName(state, date), 'A-B- C- - Fabrik Level 1 - 24.11.2026 21-45.txt', 'Zeichen, die Dateinamen nicht mögen, werden ersetzt');
  setPlayerName(state, 'Tobias');
  assert.ok(backupSummary(state).startsWith('Tobias · Level 1 · '));
});

test('Ladebildschirm: steht in index.html, mit Titel, Ladebalken, Tipp und Titelbild', () => {
  const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
  for (const id of ['loading', 'loading-title', 'loading-fill', 'loading-text', 'loading-tip']) assert.ok(html.includes(`id="${id}"`), id);
  const css = readFileSync(new URL('../src/style.css', import.meta.url), 'utf8');
  const image = css.match(/url\('\.\.\/(assets\/titel\/[^']+)'\)/);
  assert.ok(image, 'style.css zeigt ein Titelbild aus assets/titel/');
  const bytes = readFileSync(new URL(`../${image[1]}`, import.meta.url));
  assert.ok(bytes.length > 20000 && bytes.length < 400000, `Titelbild ist ${bytes.length} Byte groß (klein genug für schnelles Laden)`);
});
