// Texte für Zahlen, Waren und Kosten.

import { ITEMS } from '../core/data/items.js';

export const numberFormat = new Intl.NumberFormat('de-DE');

// "1 Holzblock", "40 Holzblöcke"
export function itemCount(type, n) {
  const def = ITEMS[type];
  return `${numberFormat.format(n)} ${n === 1 ? def.name : def.plural}`;
}

// "10 Holzplatten + 10 Holzstäbe"
export function costText(cost) {
  return Object.entries(cost ?? {})
    .map(([type, n]) => itemCount(type, n))
    .join(' + ');
}
