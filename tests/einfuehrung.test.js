// v0.52.0: Einführung mit Bürgermeisterin Hilde (Tobias, Chat 29: „man die
// Schritte überspringen kann oder ganz beenden … oder man macht sie und durch
// das erledigen, springt der Schritt zum nächsten Schritt, quasi als
// interaktive Anleitung“). Hier: die Schritte als Daten, wann ein Schritt
// erledigt ist, Überspringen, Beenden, Ansehen und das Spielstand-Format 20.

import test from 'node:test';
import assert from 'node:assert/strict';
import { TUTORIAL, TUTORIAL_FIRST_CUSTOMER_SECONDS } from '../src/core/data/tutorial.js';
import { BUILDINGS } from '../src/core/data/buildings.js';
import { ITEMS } from '../src/core/data/items.js';
import {
  TUTORIAL_STEPS,
  advanceTutorial,
  endTutorial,
  isValidTutorial,
  nextStockedCustomerIn,
  noteTutorial,
  skipTutorialStep,
  startTutorial,
  tutorialStep,
} from '../src/core/tutorial.js';
import { createNewGame, findBuilding } from '../src/core/state.js';
import { SAVE_VERSION, deserializeGame, isValidState, serializeGame } from '../src/core/save.js';
import { createStressFactory } from '../src/core/belastungstest.js';
import { fillCounter, setCounterAmount, setCounterItem } from '../src/core/market.js';
import { loadInput } from '../src/core/production.js';
import { buildBeltPath, applyBeltPath, extendTrace } from '../src/core/belts.js';
import { moveBuilding } from '../src/core/buildings.js';
import { simulate } from '../src/core/sim.js';
import { tutorialWelcomeLetter, tutorialEndLetter } from '../src/ui/letters.js';
import { setPlayerName } from '../src/core/player.js';

const ids = () => TUTORIAL.map((s) => s.id);

test('Die Einführung hat die 8 besprochenen Schritte, jeder mit Ereignis und Hinweisen', () => {
  assert.equal(TUTORIAL_STEPS, 8);
  assert.deepEqual(ids(), ['willkommen', 'einlegen', 'verschieben', 'band', 'lager', 'theke', 'haendler', 'auftrag']);
  assert.ok(TUTORIAL[0].letter, 'Schritt 1 ist Hildes Begrüßungsbrief');
  const whens = /^(info:[a-z]+|place:[a-z]+|mode:[a-z]+|tool|shop(:[a-z]+)?|picker|amount|modal|stocked|belts)$/;
  const targets = /^(building:[a-z]+|port:[a-z]+:(in|out)|#[a-z-]+|info:[a-z:]+|tool:[a-z]+|tab:[a-z]+|counter:(ware|stocked)|pick:[a-z]+|amount:ok|buy:[a-z]+)$/;
  for (const step of TUTORIAL.slice(1)) {
    assert.ok(typeof step.done === 'string' && step.done.length > 0, step.id);
    assert.ok(step.hints.length > 0, step.id);
    assert.equal(step.hints.at(-1).when, undefined, `${step.id}: die letzte Zeile gilt immer`);
    for (const hint of step.hints) {
      assert.ok(hint.text.length > 10 && hint.text.length < 200, `${step.id}: kurzer Text (${hint.text})`);
      if (hint.when) assert.match(hint.when, whens, step.id);
      if (hint.target) assert.match(hint.target, targets, step.id);
      const [kind, type] = (hint.target ?? '').split(':');
      if (kind === 'building' || kind === 'port') assert.ok(BUILDINGS[type], `${step.id}: Gebäude ${type}`);
      if (kind === 'pick' || kind === 'buy') assert.ok(ITEMS[type], `${step.id}: Ware ${type}`);
    }
  }
  // Zahlen kommen aus den Tabellen
  const einlegen = TUTORIAL[1].hints.at(-1).text;
  assert.ok(einlegen.includes(String(BUILDINGS.holzfaeller.production.amount)), einlegen);
});

test('Neues Spiel: die Einführung beginnt mit dem Brief, alte Spielstände bekommen keine (Format 20)', () => {
  assert.ok(SAVE_VERSION >= 20); // v0.55.0: Format 21 (Feuerfach)
  const state = createNewGame(1);
  assert.deepEqual(state.tutorial, { step: 0, seen: [], review: false });
  assert.equal(tutorialStep(state).id, 'willkommen');
  const loaded = deserializeGame(serializeGame(state));
  assert.deepEqual(loaded.state.tutorial, state.tutorial);
  // Tobias' Fabrik (Format 19) startet sie nicht von selbst
  const old = createNewGame(2);
  old.shopLevel = 13;
  delete old.tutorial;
  const migrated = deserializeGame(JSON.stringify({ saveVersion: 19, savedAt: 1, state: old }));
  assert.ok(migrated);
  assert.equal(migrated.migratedFrom, 19);
  assert.equal(migrated.state.tutorial, null);
  assert.equal(migrated.state.shopLevel, 13);
  // Der Belastungstest hat keine
  assert.equal(createStressFactory().tutorial, null);
});

test('Spielstand prüft die Einführung', () => {
  assert.ok(isValidTutorial(null));
  assert.ok(isValidTutorial({ step: 3, seen: ['brief', 'kaufen:holzstamm'], review: true }));
  assert.ok(!isValidTutorial({ step: 8, seen: [], review: false }), 'Schritt zu groß');
  assert.ok(!isValidTutorial({ step: -1, seen: [], review: false }));
  assert.ok(!isValidTutorial({ step: 1, seen: ['quatsch'], review: false }), 'unbekanntes Ereignis');
  assert.ok(!isValidTutorial({ step: 1, seen: ['brief', 'brief'], review: false }), 'doppelt');
  assert.ok(!isValidTutorial({ step: 1, seen: [] }), 'ohne review');
  assert.ok(!isValidTutorial(undefined));
  const state = createNewGame(1);
  state.tutorial = { step: 'zwei', seen: [], review: false };
  assert.ok(!isValidState(state));
});

test('Schritte erledigen: durchs Tun geht es weiter, am Ende ist die Einführung fertig', () => {
  const state = createNewGame(4);
  const wood = state.buildings.find((b) => b.type === 'holzfaeller');
  const portal = state.buildings.find((b) => b.type === 'versandportal');
  assert.equal(noteTutorial(state, 'brief'), 'next');
  assert.equal(tutorialStep(state).id, 'einlegen');
  // falsches Gebäude zählt nicht
  assert.equal(noteTutorial(state, 'einlegen:steinbruch'), null);
  assert.ok(loadInput(state, wood));
  assert.equal(noteTutorial(state, 'einlegen:holzfaeller'), 'next');
  assert.equal(tutorialStep(state).id, 'verschieben');
  // Portal neben das Holzfällerlager (2 Felder Platz) und ein Band dazwischen
  assert.ok(moveBuilding(state, portal.id, wood.x + 4, wood.y, 0));
  assert.equal(noteTutorial(state, 'verschieben:versandportal'), 'next');
  assert.equal(tutorialStep(state).id, 'band');
  assert.equal(advanceTutorial(state), null, 'noch nichts angekommen');
  let trace = [];
  for (const x of [wood.x + 2, wood.x + 3]) trace = extendTrace(trace, { x, y: wood.y });
  applyBeltPath(state, buildBeltPath(state, trace));
  simulate(state, 20);
  assert.ok(findBuilding(state, portal.id).prod.shipped > 0, 'Holzblöcke sind angekommen');
  assert.equal(advanceTutorial(state), 'next');
  assert.equal(tutorialStep(state).id, 'lager');
  assert.equal(noteTutorial(state, 'laden:theken'), null, 'nur der Reiter Lager zählt');
  assert.equal(noteTutorial(state, 'laden:lager'), 'next');
  assert.equal(tutorialStep(state).id, 'theke');
  setCounterItem(state, 0, 'holzblock');
  assert.ok(fillCounter(state, 0, 5) > 0);
  assert.equal(advanceTutorial(state), null, 'noch kein Kunde');
  simulate(state, 20);
  assert.ok(state.market.nextSaleId > 1, 'ein Kunde hat gekauft');
  assert.equal(advanceTutorial(state), 'next');
  assert.equal(tutorialStep(state).id, 'haendler');
  assert.equal(noteTutorial(state, 'kaufen:holzstamm'), 'next');
  assert.equal(tutorialStep(state).id, 'auftrag');
  assert.equal(noteTutorial(state, 'level'), 'finished');
  assert.equal(state.tutorial, null);
  assert.equal(noteTutorial(state, 'level'), null, 'danach passiert nichts mehr');
});

test('Wer vorauseilt, wird nicht aufgehalten: Erledigtes wird übersprungen', () => {
  const state = createNewGame(5);
  noteTutorial(state, 'brief');
  // schon beim Händler gekauft und den Laden geöffnet, bevor der Schritt dran ist
  noteTutorial(state, 'kaufen:holzstamm');
  noteTutorial(state, 'laden:lager');
  assert.equal(tutorialStep(state).id, 'einlegen');
  noteTutorial(state, 'einlegen:holzfaeller');
  noteTutorial(state, 'verschieben:versandportal');
  assert.equal(tutorialStep(state).id, 'band');
  // Portal direkt am Ausgang: es kommt ohne Band etwas an → „band“ und „lager“ fallen weg
  state.buildings.find((b) => b.type === 'versandportal').prod.shipped = 3;
  assert.equal(advanceTutorial(state), 'next');
  assert.equal(tutorialStep(state).id, 'theke');
});

test('„Weiter ›“ überspringt, „Einführung beenden“ beendet', () => {
  const state = createNewGame(6);
  for (let i = 1; i < TUTORIAL_STEPS; i++) {
    assert.equal(skipTutorialStep(state), 'next');
    assert.equal(state.tutorial.step, i);
  }
  assert.equal(skipTutorialStep(state), 'finished');
  assert.equal(state.tutorial, null);
  assert.equal(skipTutorialStep(state), null);
  const other = createNewGame(7);
  skipTutorialStep(other);
  endTutorial(other);
  assert.equal(other.tutorial, null);
  assert.equal(tutorialStep(other), null);
});

test('„🎓 Einführung ansehen“: in einer laufenden Fabrik zählen Lieferungen und Verkäufe nicht', () => {
  const state = createNewGame(8);
  endTutorial(state);
  // eine Fabrik, die schon liefert und verkauft
  state.buildings.find((b) => b.type === 'versandportal').prod.shipped = 500;
  state.market.nextSaleId = 300;
  startTutorial(state);
  assert.deepEqual(state.tutorial, { step: 0, seen: [], review: true });
  // in einem frischen Spiel ist es kein Ansehen – dort zählt das Tun
  const fresh = createNewGame(10);
  endTutorial(fresh);
  startTutorial(fresh);
  assert.equal(fresh.tutorial.review, false);
  noteTutorial(state, 'brief');
  noteTutorial(state, 'einlegen:holzfaeller');
  noteTutorial(state, 'verschieben:versandportal');
  assert.equal(tutorialStep(state).id, 'band');
  assert.equal(advanceTutorial(state), null, 'beim Ansehen nicht von selbst weiter');
  assert.equal(skipTutorialStep(state), 'next');
  assert.equal(tutorialStep(state).id, 'lager');
  noteTutorial(state, 'laden:lager');
  assert.equal(tutorialStep(state).id, 'theke');
  assert.equal(advanceTutorial(state), null);
  // im neuen Spiel wäre „theke“ jetzt erledigt
  state.tutorial.review = false;
  assert.equal(advanceTutorial(state), 'next');
});

test('Hildes Briefe: Begrüßung mit Namen und „▶ Los geht’s“, Abschluss mit dem ersten Auftrag und Tipp', () => {
  const state = createNewGame(9);
  setPlayerName(state, 'Tobias');
  const hello = tutorialWelcomeLetter(state);
  assert.equal(hello.from, 'Bürgermeisterin Hilde');
  assert.ok(hello.banner.includes('Tobias'), hello.banner);
  assert.ok(hello.okLabel.includes('Los geht'), hello.okLabel);
  assert.ok(hello.rows.some((r) => r.text.includes('Weiter ›')), 'erklärt Überspringen');
  const end = tutorialEndLetter(state);
  const text = JSON.stringify(end);
  assert.ok(text.includes('Zimmermann Jakob') && text.includes('5 Holzplatten'), text);
  assert.ok(text.includes('Sägewerk') && text.includes(`${BUILDINGS.saegewerk.cost.holzblock} Holzblöcke`), text);
  assert.ok(text.includes('Ort & Level'), 'wo man sie wieder ansieht');
});

// v0.53.0 (Tobias, Chat 31: „dass man sobald man einen Block in die Theke legt,
// es 5 sekunden dauert bis der Block verkauft wird, damit man das ganze auch sieht“)
test('Theke in der Einführung: der erste Kunde kommt genau 5 Sekunden nach dem Hinlegen', () => {
  assert.equal(TUTORIAL_FIRST_CUSTOMER_SECONDS, 5);
  const theke = TUTORIAL.find((s) => s.id === 'theke');
  assert.ok(theke.hints.find((h) => h.when === 'stocked').text.includes('{sekunden}'), 'Hilde zählt herunter');
  for (const wasLeft of [0.3, 14]) {
    const state = createNewGame(21);
    state.market.timers[0] = wasLeft; // Kunden-Takt der leeren Theke fast um bzw. noch lang
    assert.equal(nextStockedCustomerIn(state), null, 'noch liegt nichts auf einer Theke');
    setCounterItem(state, 0, 'holzblock');
    assert.ok(fillCounter(state, 0, 5) > 0);
    assert.equal(state.market.timers[0], 5, `Takt ${wasLeft} s → genau 5 s`);
    assert.equal(nextStockedCustomerIn(state), 5);
    // Nachlegen auf eine Theke, auf der schon etwas liegt, ändert den Takt nicht
    simulate(state, 2);
    fillCounter(state, 0, 3);
    assert.ok(Math.abs(state.market.timers[0] - 3) < 0.01, `noch etwa 3 s (${state.market.timers[0]})`);
    simulate(state, 2.8);
    assert.equal(state.market.nextSaleId, 1, 'nach 4,8 s noch kein Verkauf');
    simulate(state, 0.4);
    assert.equal(state.market.nextSaleId, 2, 'nach 5 s hat der erste Kunde gekauft');
    // danach wie immer: eine zweite Theke bekommt keine 5 Sekunden
    state.market.timers[1] = 12;
    setCounterItem(state, 1, 'holzblock');
    setCounterAmount(state, 1, 4);
    assert.equal(state.market.timers[1], 12, 'nach dem ersten Verkauf normaler Kunden-Takt');
  }
});

test('Theke: die 5 Sekunden gelten nur in der Einführung eines neuen Spiels', () => {
  // ohne Einführung (beendet)
  const ended = createNewGame(22);
  endTutorial(ended);
  ended.market.timers[0] = 0.3;
  setCounterItem(ended, 0, 'holzblock');
  setCounterAmount(ended, 0, 5);
  assert.equal(ended.market.timers[0], 0.3);
  // beim Ansehen in einer laufenden Fabrik
  const review = createNewGame(23);
  review.market.nextSaleId = 300;
  startTutorial(review);
  assert.equal(review.tutorial.review, true);
  review.market.timers[0] = 9;
  setCounterItem(review, 0, 'holzblock');
  fillCounter(review, 0, 5);
  assert.equal(review.market.timers[0], 9);
  // Abräumen und neu hinlegen vor dem ersten Verkauf: wieder 5 Sekunden
  const again = createNewGame(24);
  setCounterItem(again, 0, 'holzblock');
  fillCounter(again, 0, 5);
  simulate(again, 3);
  setCounterAmount(again, 0, 0);
  setCounterAmount(again, 0, 2);
  assert.equal(again.market.timers[0], 5);
  assert.equal(again.market.nextSaleId, 1);
});
