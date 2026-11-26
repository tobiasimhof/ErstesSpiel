// Aufträge der Bewohner (v0.13.0, Modell von Tobias). Kennt keine Grafik.
//
// - Auf jedem Level steht immer genau ein Auftrag an; ist er abgegeben, kommt
//   der nächste. Überspringen geht nicht.
// - Abgeben nimmt die Waren aus dem Laden-Lager und gibt Gold (so viel wie an
//   der Theke).
// - v0.56.0 (Tobias, Chat 32: „Statt Erfahrung könnten wir auch einfach 1 von 4
//   sagen“): Sind alle Aufträge eines Levels abgegeben, kann man aufsteigen
//   (siehe levels.js: aufsteigen kostet zusätzlich Gold). Vorher hing der
//   Aufstieg an der Erfahrung, die aus dem heutigen Wert der Waren berechnet
//   wurde – nach der Preisänderung des Mörsers (v0.55.0) fehlten Tobias 147,
//   obwohl alle Aufträge erledigt waren.
// - Erfahrung (XP) gibt es nur noch im Hintergrund: state.xpTotal zählt sie für
//   später (Verbesserungen mit Erfahrung); im Spiel ist sie nicht mehr zu sehen.
//
// Spielstand: state.quest = { index, xp } – index: nächster Auftrag des
// aktuellen Levels (= so viele sind abgegeben), xp: Erfahrung auf diesem Level
// (wird nur noch mitgezählt).

import { ITEMS } from './data/items.js';
import { LEVELS, QUEST_REWARD, QUEST_TEST_SKIP } from './data/levels.js';
import { storageCount, takeFromStorage } from './shop.js';

export function createQuestState() {
  return { index: 0, xp: 0 };
}

export function levelQuests(level) {
  return LEVELS[level]?.quests ?? [];
}

// Warenwert eines Auftrags (zum festen Wert der Waren)
export function questValue(quest) {
  return Object.entries(quest.items).reduce((sum, [type, n]) => sum + (ITEMS[type]?.price ?? 0) * n, 0);
}

// Belohnung: { gold, xp }
export function questReward(quest) {
  const value = questValue(quest);
  return {
    gold: Math.round(value * QUEST_REWARD.goldFactor),
    xp: Math.max(1, Math.round(value * QUEST_REWARD.xpPerGold)),
  };
}

// So viel Erfahrung bringen alle Aufträge eines Levels zusammen (für später
// und das Rechenwerkzeug; bis v0.55.1 hieß das xpNeeded und war die Grenze für
// den Aufstieg).
export function xpOfLevel(level) {
  return levelQuests(level).reduce((sum, quest) => sum + questReward(quest).xp, 0);
}

// v0.56.0: So viele Aufträge des aktuellen Levels sind abgegeben („1 von 4“).
export function questsDone(state) {
  return Math.min(state.quest?.index ?? 0, levelQuests(state.shopLevel).length);
}

// v0.56.0: Alle Aufträge des aktuellen Levels abgegeben? Dann ist der Weg frei
// für den Aufstieg – egal, ob sich Preise seitdem geändert haben.
export function allQuestsDone(state) {
  return questsDone(state) >= levelQuests(state.shopLevel).length;
}

// Der Auftrag, der gerade ansteht (oder null, wenn alle erledigt sind).
export function currentQuest(state) {
  return levelQuests(state.shopLevel)[state.quest?.index ?? 0] ?? null;
}

// „Auftrag 2 von 4“: { number, total }
export function questNumber(state) {
  const total = levelQuests(state.shopLevel).length;
  return { number: Math.min((state.quest?.index ?? 0) + 1, total), total };
}

// Was verlangt ist und was im Laden-Lager liegt: [{ type, need, have, done }]
export function questNeeds(state, quest = currentQuest(state)) {
  if (!quest) return [];
  return Object.entries(quest.items).map(([type, need]) => {
    const have = storageCount(state, type);
    return { type, need, have: Math.min(have, need), done: have >= need };
  });
}

export function canDeliver(state) {
  const quest = currentQuest(state);
  return Boolean(quest) && questNeeds(state, quest).every((n) => n.done);
}

// Knopf „Abgeben“: Waren aus dem Laden-Lager, Gold (und im Hintergrund
// Erfahrung) dazu, der nächste Auftrag rückt nach. Ergebnis: { quest, gold, xp } oder null.
export function deliverQuest(state) {
  if (!canDeliver(state)) return null;
  const quest = currentQuest(state);
  for (const [type, n] of Object.entries(quest.items)) takeFromStorage(state, type, n);
  const { gold, xp } = questReward(quest);
  state.gold += gold;
  state.quest.xp += xp;
  state.xpTotal = (state.xpTotal ?? 0) + xp;
  state.quest.index++;
  return { quest, gold, xp };
}

// ---------- Test-Knopf (v0.15.0, nur im Prototyp) ----------

// Ist der Knopf „🧪 Test: Auftrag erledigen“ zu sehen? Nur, wenn er in der
// Datentabelle eingeschaltet ist und gerade ein Auftrag ansteht.
export function canSkipQuest(state) {
  return QUEST_TEST_SKIP && Boolean(currentQuest(state));
}

// Wertet den aktuellen Auftrag als erledigt (zählt wie abgegeben, Erfahrung im
// Hintergrund wie beim Abgeben), aber keine Waren aus dem Laden-Lager und kein Gold. Aufsteigen kostet weiter Gold.
// Ergebnis: { quest, gold: 0, xp, skipped: true } oder null.
export function skipQuest(state) {
  if (!canSkipQuest(state)) return null;
  const quest = currentQuest(state);
  const { xp } = questReward(quest);
  state.quest.xp += xp;
  state.xpTotal = (state.xpTotal ?? 0) + xp;
  state.quest.index++;
  return { quest, gold: 0, xp, skipped: true };
}
