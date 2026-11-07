// Fläche kaufen (v0.9.0): Das Grundstück bleibt ein Rechteck und wächst
// streifenweise an einer Seite (oben, rechts, unten, links) – bis an den Rand
// der Welt. Gebäude und Bänder bleiben, wo sie sind. Kennt keine Grafik.

import { LAND } from './data/land.js';
import { isInWorld, isOwned } from './state.js';

export const LAND_SIDES = ['N', 'E', 'S', 'W'];

// So viele Felder tief ist ein Streifen auf dem aktuellen Laden-Level (v0.10.1).
export function stripDepth(state) {
  let depth = LAND.strips[0].depth;
  for (const s of LAND.strips) if (s.level <= (state.shopLevel ?? 1)) depth = s.depth;
  return depth;
}

// Der Streifen, den man an dieser Seite als Nächstes kaufen kann:
// { side, depth, x, y, width, height, fields } oder null am Rand der Welt.
export function landStrip(state, side) {
  const p = state.plot;
  const w = state.world;
  const room = {
    N: p.y,
    S: w.height - (p.y + p.height),
    W: p.x,
    E: w.width - (p.x + p.width),
  }[side];
  if (room === undefined) return null;
  const depth = Math.min(stripDepth(state), room);
  if (depth <= 0) return null;
  const rect = {
    N: { x: p.x, y: p.y - depth, width: p.width, height: depth },
    S: { x: p.x, y: p.y + p.height, width: p.width, height: depth },
    W: { x: p.x - depth, y: p.y, width: depth, height: p.height },
    E: { x: p.x + p.width, y: p.y, width: depth, height: p.height },
  }[side];
  return { side, depth, ...rect, fields: rect.width * rect.height };
}

// Gold je Feld beim nächsten Kauf (jeder Kauf macht es teurer).
export function pricePerField(state) {
  return LAND.pricePerField * LAND.growth ** (state.landBought ?? 0);
}

export function landPrice(state, fields) {
  const raw = fields * pricePerField(state);
  return Math.max(LAND.roundTo, Math.round(raw / LAND.roundTo) * LAND.roundTo);
}

// Angebot für eine Seite: Streifen plus Preis, oder null.
export function landOffer(state, side) {
  const strip = landStrip(state, side);
  return strip ? { ...strip, price: landPrice(state, strip.fields) } : null;
}

export function landOffers(state) {
  return LAND_SIDES.map((side) => landOffer(state, side)).filter(Boolean);
}

// Zu welcher Seite gehört ein gesperrtes Feld? Alles links, rechts, über oder
// unter dem Grundstück zählt zu dieser Seite (auch weiter weg), damit man
// nicht genau den Streifen treffen muss. Ecken gehören zu keiner Seite.
export function landSideAt(state, tx, ty) {
  if (!isInWorld(state, tx, ty) || isOwned(state, tx, ty)) return null;
  const p = state.plot;
  const inCols = tx >= p.x && tx < p.x + p.width;
  const inRows = ty >= p.y && ty < p.y + p.height;
  if (inCols) return ty < p.y ? 'N' : 'S';
  if (inRows) return tx < p.x ? 'W' : 'E';
  return null;
}

// Kauft den nächsten Streifen an einer Seite.
// Ergebnis: 'ok' | 'gold' (zu wenig Gold) | 'edge' (Rand der Welt)
export function buyLand(state, side) {
  const offer = landOffer(state, side);
  if (!offer) return 'edge';
  if (state.gold < offer.price) return 'gold';
  state.gold -= offer.price;
  const p = state.plot;
  if (side === 'N') p.y -= offer.depth;
  if (side === 'W') p.x -= offer.depth;
  if (side === 'N' || side === 'S') p.height += offer.depth;
  else p.width += offer.depth;
  state.landBought = (state.landBought ?? 0) + 1;
  return 'ok';
}
