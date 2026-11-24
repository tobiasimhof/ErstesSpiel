// Texte für Zahlen, Waren und Kosten.

import { ITEMS } from '../core/data/items.js';

export const numberFormat = new Intl.NumberFormat('de-DE');

// "1 Holzblock", "40 Holzblöcke"
export function itemCount(type, n) {
  const def = ITEMS[type];
  return `${numberFormat.format(n)} ${n === 1 ? def.name : def.plural}`;
}

// "45 s", "15:00 min"
export function formatDuration(seconds) {
  const s = Math.max(0, Math.round(seconds));
  if (s < 60) return `${s} s`;
  const m = Math.floor(s / 60);
  return `${m}:${String(s % 60).padStart(2, '0')} min`;
}

// "10 Holzplatten + 10 Holzstäbe"
export function costText(cost) {
  return Object.entries(cost ?? {})
    .map(([type, n]) => itemCount(type, n))
    .join(' + ');
}

// v0.50.0: „Tobias' Laden“, „Annas Laden“ – endet der Name auf s, ß, x oder z,
// nur ein Apostroph (deutsche Rechtschreibung), sonst ein angehängtes s.
export function possessive(name) {
  return /[sßxz]$/i.test(name) ? `${name}'` : `${name}s`;
}

// v0.50.0: Texte mit „{name}“ (z. B. „Willkommen im Ort, {name}!“) – ohne
// Namen fällt der Platzhalter samt Komma davor weg („Willkommen im Ort!“).
export function fillName(text, name) {
  return name ? text.replaceAll('{name}', name) : text.replace(/,?\s*\{name\}/g, '');
}
