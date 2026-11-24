// v0.52.0: Einführung mit Bürgermeisterin Hilde – wie weit man ist und wann
// ein Schritt erledigt ist. Die Schritte stehen in data/tutorial.js; zeigen
// tut sie src/ui/tutorial.js.
//
// state.tutorial (Spielstand, Format 20):
//   null                         keine Einführung (beendet, fertig, alter Spielstand)
//   { step, seen, review }       step = Nummer des aktuellen Schritts (ab 0),
//                                seen = Ereignisse, die schon passiert sind
//                                (wer vorauseilt, wird nicht aufgehalten),
//                                review = „🎓 Einführung ansehen“ in einer
//                                laufenden Fabrik: Ereignisse aus der Fabrik
//                                zählen dann nicht (sie liefert ja schon)

import { TUTORIAL, TUTORIAL_FACTORY_EVENTS } from './data/tutorial.js';
import { productionOf } from './production.js';

export const TUTORIAL_STEPS = TUTORIAL.length;
const EVENTS = new Set(TUTORIAL.map((step) => step.done));

export function createTutorial({ review = false } = {}) {
  return { step: 0, seen: [], review: Boolean(review) };
}

export const isTutorialActive = (state) => Boolean(state.tutorial);

// Der aktuelle Schritt (aus der Tabelle) oder null
export function tutorialStep(state) {
  return state.tutorial ? (TUTORIAL[state.tutorial.step] ?? null) : null;
}

// Ereignisse aus der Fabrik: Ist etwas im Laden-Lager angekommen, hat ein
// Kunde gekauft? Nur bei einem neuen Spiel (dort fängt alles bei null an).
function factoryEvent(state, event) {
  if (event === 'angekommen') {
    return state.buildings.some((b) => productionOf(b.type)?.kind === 'shipping' && b.prod?.shipped > 0);
  }
  if (event === 'verkauft') return state.market.nextSaleId > 1;
  return false;
}

function isDone(state, step) {
  const t = state.tutorial;
  if (t.seen.includes(step.done)) return true;
  return !t.review && TUTORIAL_FACTORY_EVENTS.includes(step.done) && factoryEvent(state, step.done);
}

// Geht weiter, solange der aktuelle Schritt schon erledigt ist. Ergebnis:
// 'finished' (alle erledigt – state.tutorial ist danach null), 'next'
// (mindestens einen Schritt weiter) oder null (nichts geändert).
export function advanceTutorial(state) {
  const t = state.tutorial;
  if (!t) return null;
  const before = t.step;
  while (t.step < TUTORIAL_STEPS && isDone(state, TUTORIAL[t.step])) t.step++;
  if (t.step >= TUTORIAL_STEPS) {
    state.tutorial = null;
    return 'finished';
  }
  return t.step > before ? 'next' : null;
}

// Ein Ereignis aus der Oberfläche („einlegen:holzfaeller“ …). Gemerkt wird
// nur, was zu einem Schritt gehört; Ergebnis wie advanceTutorial.
export function noteTutorial(state, event) {
  const t = state.tutorial;
  if (!t || !EVENTS.has(event)) return null;
  if (!t.seen.includes(event)) t.seen.push(event);
  return advanceTutorial(state);
}

// „Weiter ›“: diesen Schritt überspringen. Ergebnis wie advanceTutorial
// ('next' oder 'finished').
export function skipTutorialStep(state) {
  const t = state.tutorial;
  if (!t) return null;
  t.step++;
  if (t.step >= TUTORIAL_STEPS) {
    state.tutorial = null;
    return 'finished';
  }
  return advanceTutorial(state) ?? 'next';
}

// „Einführung beenden“
export function endTutorial(state) {
  state.tutorial = null;
}

// „🎓 Einführung ansehen“ (Level-Fenster): von vorn. Hat die Fabrik schon
// geliefert oder verkauft, ist es ein Ansehen – dann zählen Lieferungen und
// Verkäufe nicht (sonst wären diese Schritte sofort vorbei).
export function startTutorial(state) {
  const review = factoryEvent(state, 'angekommen') || factoryEvent(state, 'verkauft');
  state.tutorial = createTutorial({ review });
}

// Für die Prüfung des Spielstands
export function isValidTutorial(t) {
  if (t === null) return true;
  if (!t || typeof t !== 'object' || Array.isArray(t)) return false;
  if (!Number.isInteger(t.step) || t.step < 0 || t.step >= TUTORIAL_STEPS) return false;
  if (typeof t.review !== 'boolean') return false;
  if (!Array.isArray(t.seen) || !t.seen.every((e) => EVENTS.has(e)) || new Set(t.seen).size !== t.seen.length) return false;
  return Object.keys(t).every((key) => key === 'step' || key === 'seen' || key === 'review');
}
