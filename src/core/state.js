// Spielzustand und Abfragen auf dem Raster. Die Dateien in src/core kennen
// keine Grafik und keinen Browser, damit sie automatisch getestet und später
// auch auf einem Server genutzt werden können.
//
// Der Laden ist kein Gebäude, sondern das ganze eigene Grundstück (plot).

import { START_GOLD, START_STORAGE } from './data/shop.js';
import { occupies } from './geometry.js';
import { createCounters, createMarket } from './market.js';
import { createProductionState } from './production.js';

// Gesamte Welt in Feldern. Alles außerhalb des Grundstücks ist gesperrt
// und kann später gekauft werden.
// v0.6.1: Grundstück 22 × 14 (vorher 16 × 10), Welt 40 × 26 (vorher 32 × 20).
export const WORLD_WIDTH = 40;
export const WORLD_HEIGHT = 26;

export const START_PLOT = { x: 8, y: 5, width: 22, height: 14 };
// v0.7.0: dazu ein Versandportal – ohne Portal und ohne Gold käme sonst nie
// eine Ware in den Laden. v0.9.0: Man startet nur mit Holz (Level 1); den
// Steinbruch baut man ab Level 2 selbst.
const START_BUILDINGS = [
  { type: 'holzfaeller', x: 10, y: 6 },
  { type: 'versandportal', x: 14, y: 9 },
];

export function createNewGame(seed) {
  const state = {
    gold: START_GOLD,
    shopLevel: 1,
    world: { width: WORLD_WIDTH, height: WORLD_HEIGHT },
    plot: { ...START_PLOT },
    buildings: [],
    nextBuildingId: 1,
    // Förderbänder: Schlüssel "x,y" → { outs: [Richtungen], item?, rr?, lastFrom? }
    belts: {},
    // Laden-Lager: Ware → Anzahl
    storage: { ...START_STORAGE },
    // Verkaufstheken (v0.7.0): je eine Sorte, { type, count }
    counters: createCounters(1),
    // Kunden, Zufall, letzte Verkäufe, Pleiteschutz (v0.7.0)
    market: createMarket(seed),
    // Bisher hergestellte Waren: Ware → Anzahl (v0.9.0, für die Level)
    produced: {},
    // So oft wurde Fläche gekauft (v0.9.0, macht jeden Kauf teurer)
    landBought: 0,
  };
  for (const start of START_BUILDINGS) {
    state.buildings.push({
      id: state.nextBuildingId++,
      type: start.type,
      x: start.x,
      y: start.y,
      rot: 0,
      prod: createProductionState(start.type),
    });
  }
  return state;
}

export function tileKey(x, y) {
  return `${x},${y}`;
}

export function parseTileKey(key) {
  const [x, y] = key.split(',').map(Number);
  return { x, y };
}

export function findBuilding(state, id) {
  return state.buildings.find((b) => b.id === id) ?? null;
}

export function buildingAt(state, tx, ty) {
  return state.buildings.find((b) => occupies(b, tx, ty)) ?? null;
}

export function beltAt(state, tx, ty) {
  return state.belts[tileKey(tx, ty)] ?? null;
}

export function isInWorld(state, tx, ty) {
  return tx >= 0 && ty >= 0 && tx < state.world.width && ty < state.world.height;
}

export function isOwned(state, tx, ty) {
  const p = state.plot;
  return tx >= p.x && tx < p.x + p.width && ty >= p.y && ty < p.y + p.height;
}
