// v0.51.0 (Tobias, Chat 29): Neuigkeiten als Schriftrolle – „quasi als Brief
// oder Nachricht zum aufrollen … ohne Zeit, selbst zum wegklicken“. Hier: was
// in den Briefen steht, und dass die Erinnerungen weg sind („Die würde ich
// sogar ganz entfernen“). Wie die Rolle aussieht, prüft der Browser-Test.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

import { levelUp } from '../src/core/levels.js';
import { setPlayerName } from '../src/core/player.js';
import { levelQuests } from '../src/core/quests.js';
import { createNewGame } from '../src/core/state.js';
import { bailoutLetter, brokenSaveLetter, levelUpLetter, newsLetter } from '../src/ui/letters.js';

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const rowText = (letter) => letter.rows.map((r) => `${r.label}: ${r.text}`).join(' | ');

function upTo(level) {
  const state = createNewGame(5);
  setPlayerName(state, 'Tobias');
  let result = null;
  while (state.shopLevel < level) {
    state.quest.index = levelQuests(state.shopLevel).length; // v0.56.0: alle Aufträge abgegeben
    state.gold = 1e9;
    result = levelUp(state);
    assert.ok(result, `Aufstieg auf ${state.shopLevel + 1}`);
  }
  return { state, result };
}

test('Aufstieg auf Level 2: Brief von Hilde mit Bauabschnitt, Neuem, Geschenk und erstem Auftrag', () => {
  const { state, result } = upTo(2);
  const letter = levelUpLetter(state, result);
  assert.equal(letter.banner, 'Laden-Level 2!');
  assert.equal(letter.from, 'Bürgermeisterin Hilde');
  assert.equal(letter.seal, 'H');
  assert.equal(letter.title, '„Wege und Brunnen“');
  assert.ok(letter.text.includes('Der Ort wächst'));
  const rows = rowText(letter);
  assert.ok(rows.includes('Neu: ') && rows.includes('Steinbruch') && rows.includes('Steinmetz'), rows);
  assert.ok(rows.includes('Geschenk: 1 Felsbrocken liegt im Laden-Lager'), rows);
  assert.ok(rows.includes('Erster Auftrag: Steinmetzin Berta: 10 Steinplatten'), rows);
  assert.ok(letter.rows.some((r) => r.icon.item === 'felsbrocken'), 'das Geschenk mit Warenbild');
  assert.ok(!rows.includes('Mehr Fläche'));
});

test('Aufstieg auf Level 10: mehr Fläche; ab Level 11 kein Geschenk mehr', () => {
  const ten = upTo(10);
  const letter10 = levelUpLetter(ten.state, ten.result);
  assert.ok(rowText(letter10).includes('Mehr Fläche: Tippe auf die ＋-Schilder am Rand.'));
  const eleven = upTo(11);
  const letter11 = levelUpLetter(eleven.state, eleven.result);
  assert.equal(letter11.banner, 'Laden-Level 11!');
  assert.ok(!rowText(letter11).includes('Geschenk'), rowText(letter11));
  assert.ok(rowText(letter11).includes('Uhrmacherei'));
});

test('Neuigkeiten nach einem Update, beschädigter Spielstand, Geschenk des Händlers', () => {
  const news = newsLetter({ notes: ['Neu: Dein Name steht über deinem Laden.', 'Die Theken fassen jetzt 30 Stück.'], migrated: true, loadedFile: 'a.txt' });
  assert.equal(news.banner, 'Neuigkeiten');
  assert.equal(news.from, 'Neues im Spiel');
  assert.ok(news.text.includes('Spielstand „a.txt“ geladen.') && news.text.includes('übernommen'));
  assert.deepEqual(
    news.rows.map((r) => [r.label, r.text]),
    [
      ['Neu', 'Dein Name steht über deinem Laden.'],
      ['', 'Die Theken fassen jetzt 30 Stück.'],
    ],
  );
  assert.equal(brokenSaveLetter().banner, 'Spielstand beschädigt');
  const gift = bailoutLetter();
  assert.equal(gift.from, 'Der Händler');
  assert.ok(gift.rows[0].text.includes('1 Holzstamm liegt im Laden-Lager'));
});

test('Keine Erinnerungen mehr unten: „Auftrag bereit“, „Genug Erfahrung und Gold“, „Beet reif“', () => {
  // ohne Kommentare (dort steht, warum sie weg sind)
  const main = read('src/main.js')
    .split('\n')
    .filter((line) => !line.trim().startsWith('//'))
    .join('\n');
  for (const text of ['Auftrag bereit', 'Genug Erfahrung und Gold', 'Beet ist reif', 'Beete sind reif', 'Laden-Level ${level}! Neu']) {
    assert.ok(!main.includes(text), `main.js meldet noch „${text}“`);
  }
  assert.ok(main.includes('letters.show(levelUpLetter('), 'der Aufstieg kommt als Schriftrolle');
  assert.ok(main.includes('letters.show(bailoutLetter())'), 'das Geschenk des Händlers kommt als Schriftrolle');
});

test('Schriftrolle: Kenneys Pergament und rotes Band liegen im Projekt', () => {
  const css = read('src/style.css');
  for (const name of ['panel_brown_damaged.png', 'banner_classic_curtain.png']) {
    assert.ok(css.includes(`ui-pack-adventure/${name}`), name);
    assert.ok(existsSync(new URL(`../assets/kenney-ui/ui-pack-adventure/${name}`, import.meta.url)), name);
  }
});
