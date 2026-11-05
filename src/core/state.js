// Spielzustand und Spielregeln. Diese Datei kennt keine Grafik und keinen
// Browser, damit sie automatisch getestet und später auch auf einem Server
// genutzt werden kann.

import { BUILDINGS } from './data/buildings.js';

// Gesamte Welt in Feldern. Alles außerhalb des Grundstücks ist gesperrt
// und kann später gekauft werden.
export const WORLD_WIDTH = 32;
export const WORLD_HEIGHT = 20;

const START_PLOT = { x: 8, y: 5, width: 16, height: 10 };
const START_GOLD = 100;
const START_BUILDINGS = [
  { type: 'laden', x: 19, y: 8 },
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
  };
  for (const start of START_BUILDINGS) {
    state.buildings.push({ id: state.nextBuildingId++, type: start.type, x: start.x, y: start.y });
  }
  return state;
}

export function buildingSize(building) {
  const [width, height] = BUILDINGS[building.type].size;
  return { width, height };
}

export function occupies(building, tx, ty) {
  const { width, height } = buildingSize(building);
  return tx >= building.x && tx < building.x + width && ty >= building.y && ty < building.y + height;
}

export function buildingAt(state, tx, ty) {
  return state.buildings.find((b) => occupies(b, tx, ty)) ?? null;
}

export function isInWorld(state, tx, ty) {
  return tx >= 0 && ty >= 0 && tx < state.world.width && ty < state.world.height;
}

export function isOwned(state, tx, ty) {
  const p = state.plot;
  return tx >= p.x && tx < p.x + p.width && ty >= p.y && ty < p.y + p.height;
}
