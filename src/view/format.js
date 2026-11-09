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
