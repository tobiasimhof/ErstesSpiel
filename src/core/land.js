// Fläche kaufen (v0.9.0): Das Grundstück bleibt ein Rechteck und wächst
// streifenweise an einer Seite (oben, rechts, unten, links) – bis an den Rand
// der Welt. Gebäude und Bänder bleiben, wo sie sind. Kennt keine Grafik.
//
// v0.10.2: Jeder Streifen ist 4 Felder tief und kostet gleich viel (LAND.price), egal wie oft
// man schon gekauft hat. Die Welt reicht auf jeder Seite 2 Streifen weit, damit
// lässt sich jede Seite 2× erweitern.

import { LAND } from './data/land.js';
import { isInWorld, isOwned } from './state.js';

export const LAND_SIDES = ['N', 'E', 'S', 'W'];

// So viele Felder tief ist ein Streifen (seit v0.10.2 auf jedem Level gleich).
export function stripDepth() {
  return LAND.depth;
}

// So viele Felder liegen an dieser Seite noch zwischen Grundstück und Rand der Welt.
function roomAt(state, side) {
  const p = state.plot;
  const w = state.world;
  return {
    N: p.y - w.y,
    S: w.y + w.height - (p.y + p.height),
    W: p.x - w.x,
    E: w.x + w.width - (p.x + p.width),
  }[side] ?? 0;
}

// Der Streifen, den man an dieser Seite als Nächstes kaufen kann:
// { side, depth, x, y, width, height, fields } oder null am Rand der Welt.
export function landStrip(state, side) {
  const p = state.plot;
  const depth = Math.min(stripDepth(), roomAt(state, side));
  if (depth <= 0) return null;
  const rect = {
    N: { x: p.x, y: p.y - depth, width: p.width, height: depth },
    S: { x: p.x, y: p.y + p.height, width: p.width, height: depth },
    W: { x: p.x - depth, y: p.y, width: depth, height: p.height },
    E: { x: p.x + p.width, y: p.y, width: depth, height: p.height },
  }[side];
  return { side, depth, ...rect, fields: rect.width * rect.height };
}

// Preis eines Streifens: ein voller Streifen kostet immer LAND.price. Nur ein
// Rest-Streifen am Rand der Welt (bei Spielständen von vor v0.10.2, die schon
// 2 Reihen gekauft hatten) kostet anteilig weniger, z. B. 2 Reihen 90 Gold.
export function landPrice(depth) {
  if (depth >= LAND.depth) return LAND.price;
  const raw = (LAND.price * depth) / LAND.depth;
  return Math.max(LAND.roundTo, Math.round(raw / LAND.roundTo) * LAND.roundTo);
}

// Angebot für eine Seite: Streifen plus Preis, oder null.
export function landOffer(state, side) {
  const strip = landStrip(state, side);
  return strip ? { ...strip, price: landPrice(strip.depth) } : null;
}

// So oft lässt sich diese Seite noch erweitern (ein Rest-Streifen zählt mit).
export function landBuysLeft(state, side) {
  return Math.ceil(Math.max(0, roomAt(state, side)) / stripDepth());
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
