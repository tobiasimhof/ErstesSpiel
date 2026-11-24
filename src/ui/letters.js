// v0.51.0 (Tobias, Chat 29): Was in den Schriftrollen steht – „quasi als Brief
// oder Nachricht zum aufrollen, wie man das aus dem Mittelalter kennt“. Nur
// Inhalte (ohne Bildschirm, in node testbar); zeigen tut sie letter.js.
//
// Ein Brief: { banner, from, seal, title?, text?, rows: [{ icon, label?, text }] }
// icon: { item: 'holzstamm' } (Warenbild) oder { emoji: '🔓' }.

import { BAILOUT_ITEM } from '../core/data/shop.js';
import { ITEMS } from '../core/data/items.js';
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
