// Spielzustand und Abfragen auf dem Raster. Die Dateien in src/core kennen
// keine Grafik und keinen Browser, damit sie automatisch getestet und später
// auch auf einem Server genutzt werden können.
//
// Der Laden ist kein Gebäude, sondern das ganze eigene Grundstück (plot).

import { occupies } from './geometry.js';

// Gesamte Welt in Feldern. Alles außerhalb des Grundstücks ist gesperrt
// und kann später gekauft werden.
export const WORLD_WIDTH = 32;
export const WORLD_HEIGHT = 20;

const START_PLOT = { x: 8, y: 5, width: 16, height: 10 };
const START_GOLD = 100;
const START_BUILDINGS = [
  { type: 'holzfaeller', x: 10, y: 6 },
  { type: 'steinbruch', x: 10, y: 12 },
];

export function createNewGame() {
  const state = {
    gold: START_GOLD,
    shopLevel: 1,
    world: { width: WORLD_WIDTH, height: WORLD_HEIGHT },
    plot: { ...START_PLOT },
    buildings: [],
    nextBuildingId: 1,
    // Förderbänder: Schlüssel "x,y" → { outs: [Richtungen] }
    belts: {},
  };
  for (const start of START_BUILDINGS) {
    state.buildings.push({ id: state.nextBuildingId++, type: start.type, x: start.x, y: start.y, rot: 0 });
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
