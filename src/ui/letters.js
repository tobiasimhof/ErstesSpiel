// v0.51.0 (Tobias, Chat 29): Was in den Schriftrollen steht – „quasi als Brief
// oder Nachricht zum aufrollen, wie man das aus dem Mittelalter kennt“. Nur
// Inhalte (ohne Bildschirm, in node testbar); zeigen tut sie letter.js.
//
// Ein Brief: { banner, from, seal, title?, text?, rows: [{ icon, label?, text }],
//             okLabel? (sonst „✓ Gelesen“) }
// icon: { item: 'holzstamm' } (Warenbild) oder { emoji: '🔓' }.

import { BAILOUT_ITEM } from '../core/data/shop.js';
import { BUILDINGS, BUILD_TABS } from '../core/data/buildings.js';
import { ITEMS } from '../core/data/items.js';
import { RECIPES } from '../core/data/recipes.js';
import { TUTORIAL_STEPS } from '../core/tutorial.js';
import { LEVELS } from '../core/levels.js';
import { currentQuest } from '../core/quests.js';
import { costText, fillName, itemCount } from './format.js';
import { unlockText } from './levels.js';

const HILDE = { from: 'Bürgermeisterin Hilde', seal: 'H' };
const GAME = { from: 'Neues im Spiel', seal: '★' };

// Aufstieg: Bauabschnitt mit Geschichte, was neu ist, Geschenk, Fläche, erster Auftrag
export function levelUpLetter(state, { level, gift, moreLand }) {
  const def = LEVELS[level] ?? {};
  const rows = unlockText(level)
    .split(' · ')
    .filter(Boolean)
    .map((text) => ({ icon: { emoji: '🔓' }, label: 'Neu', text }));
  for (const [type, n] of Object.entries(gift ?? {})) {
    rows.push({ icon: { item: type }, label: 'Geschenk', text: `${itemCount(type, n)} ${n === 1 ? 'liegt' : 'liegen'} im Laden-Lager` });
  }
  if (moreLand) rows.push({ icon: { emoji: '🗺️' }, label: 'Mehr Fläche', text: 'Tippe auf die ＋-Schilder am Rand.' });
  const quest = currentQuest(state);
  if (quest) rows.push({ icon: { emoji: '📜' }, label: 'Erster Auftrag', text: `${quest.from}: ${costText(quest.items)}` });
  return {
    ...HILDE,
    banner: `Laden-Level ${level}!`,
    title: def.name ? `„${def.name}“` : '',
    text: fillName(def.story ?? '', state.playerName),
    rows,
  };
}

// Neues nach einem Update (Spielstand in neuem Format übernommen) und andere
// Hinweise beim Öffnen. notes: Texte („Neu: …“); loadedFile: gerade aus einer
// Datei geladen.
export function newsLetter({ notes = [], loadedFile = null, migrated = false }) {
  const intro = [loadedFile ? `Spielstand „${loadedFile}“ geladen.` : '', migrated ? 'Dein Spielstand ist übernommen – alles bleibt erhalten.' : '']
    .filter(Boolean)
    .join(' ');
  return {
    ...GAME,
    banner: 'Neuigkeiten',
    text: intro,
    rows: notes.map((note) => {
      const isNew = note.startsWith('Neu: ');
      return { icon: { emoji: isNew ? '✨' : '📌' }, label: isNew ? 'Neu' : '', text: isNew ? note.slice(5) : note };
    }),
  };
}

export function brokenSaveLetter() {
  return {
    ...GAME,
    banner: 'Spielstand beschädigt',
    text: 'Dein Spielstand ließ sich nicht mehr lesen. Deshalb hat ein neues Spiel begonnen.',
    rows: [{ icon: { emoji: '💾' }, label: 'Tipp', text: 'Hast du deine Fabrik als Datei gesichert, holst du sie mit ☰ → „📂 Spielstand laden“ zurück.' }],
  };
}

// Pleiteschutz: Der Händler schenkt einen Rohstoff.
export function bailoutLetter() {
  const name = ITEMS[BAILOUT_ITEM].name;
  return {
    from: 'Der Händler',
    seal: '⚖',
    banner: 'Ein Geschenk!',
    text: `Ich sehe, dir ist alles ausgegangen. Hier, nimm einen ${name} – so kommt deine Fabrik wieder in Gang.`,
    rows: [{ icon: { item: BAILOUT_ITEM }, label: 'Geschenk', text: `${itemCount(BAILOUT_ITEM, 1)} liegt im Laden-Lager` }],
  };
}

// ---------- Einführung mit Hilde (v0.52.0) ----------

// Hildes Begrüßungsbrief – Schritt 1 der Einführung
export function tutorialWelcomeLetter(state) {
  return {
    ...HILDE,
    banner: fillName('Willkommen, {name}!', state.playerName) || 'Willkommen!',
    text: 'Schön, dass du da bist! Am Fluss wächst unser kleiner Ort, und du führst den neuen Laden: Aus Rohstoffen machst du Waren, verkaufst sie und baust mit dem Gold deine Fabrik aus.',
    rows: [
      { icon: { emoji: '🎓' }, label: 'Einführung', text: `In ${TUTORIAL_STEPS - 1} kleinen Schritten zeige ich dir, wie alles läuft. Ein gelber Pfeil zeigt dir, wo du tippst.` },
      { icon: { emoji: '⏭️' }, label: 'Dein Tempo', text: 'Mach es selbst, oder lies mit „Weiter ›“ einfach weiter. Mit ✕ klappst du mich weg, „Beenden“ beendet die Einführung.' },
    ],
    okLabel: '▶ Los geht’s',
  };
}

// Das Rezept, das eine Ware macht (oder undefined)
const recipeFor = (type) => Object.values(RECIPES).find((r) => r.output === type);

// Hildes Abschlussbrief: der Auftrag, ein Tipp für die Maschine dazu, wo man
// die Einführung wiederfindet
export function tutorialEndLetter(state) {
  const rows = [];
  const quest = currentQuest(state);
  if (quest) {
    rows.push({ icon: { emoji: '📜' }, label: 'Dein Auftrag', text: `${quest.from}: ${costText(quest.items)}` });
    const item = Object.keys(quest.items)[0];
    const recipe = recipeFor(item);
    const maker = recipe?.building;
    if (maker) {
      const def = BUILDINGS[maker];
      const has = state.buildings.some((b) => b.type === maker);
      const tab = BUILD_TABS.find((t) => t.buildings.includes(maker));
      const where = tab ? `🔨 Bauen → ${tab.name}` : '🔨 Bauen';
      rows.push({
        icon: { emoji: def.icon },
        label: def.name,
        text: has
          ? `macht ${ITEMS[item].plural} (Einstellung „${recipe.label}“).`
          : `macht ${ITEMS[item].plural} und kostet ${costText(def.cost)}. Sobald genug im Laden-Lager ist: ${where}.`,
      });
    }
  }
  rows.push({ icon: { emoji: '🎓' }, label: 'Einführung', text: 'Du findest sie jederzeit wieder im Level-Fenster unter „🏘️ Ort & Level“.' });
  return {
    ...HILDE,
    banner: 'Jetzt bist du dran!',
    text: `${fillName('Gut gemacht, {name}!', state.playerName)} Du kennst die Grundlagen: Rohstoffe einlegen, mit Förderbändern verbinden, im Laden verkaufen und beim Händler einkaufen.`,
    rows,
    okLabel: '✓ Danke, Hilde!',
  };
}
