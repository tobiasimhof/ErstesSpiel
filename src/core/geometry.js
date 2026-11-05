// Geometrie von Gebäuden: Größe, Drehung, belegte Felder, Ein- und Ausgänge.

import { BUILDINGS } from './data/buildings.js';
import { DELTA, rotateCW } from './dirs.js';

// Größe eines Gebäudes nach Drehung (rot = 0..3, jeweils 90° im Uhrzeigersinn).
export function footprintSize(type, rot = 0) {
  const [width, height] = BUILDINGS[type].size;
  return rot % 2 === 1 ? { width: height, height: width } : { width, height };
}

// Rechnet ein Feld (x, y) innerhalb eines ungedrehten Gebäudes in die
// gedrehte Lage um.
export function rotateLocal(x, y, width, height, rot) {
  let px = x;
  let py = y;
  let w = width;
  let h = height;
  for (let i = 0; i < rot % 4; i++) {
    [px, py] = [h - 1 - py, px];
    [w, h] = [h, w];
  }
  return { x: px, y: py };
}

export function footprintTiles(type, x, y, rot = 0) {
  const { width, height } = footprintSize(type, rot);
  const tiles = [];
  for (let ty = y; ty < y + height; ty++) {
    for (let tx = x; tx < x + width; tx++) tiles.push({ x: tx, y: ty });
  }
  return tiles;
}

export function occupies(building, tx, ty) {
  const { width, height } = footprintSize(building.type, building.rot);
  return tx >= building.x && tx < building.x + width && ty >= building.y && ty < building.y + height;
}

// Ein- und Ausgänge in Weltkoordinaten.
// tile = Feld des Gebäudes, outside = Nachbarfeld, auf dem das Band andockt.
export function buildingPorts(building) {
  const def = BUILDINGS[building.type];
  const [width, height] = def.size;
  return (def.ports ?? []).map((port) => {
    const local = rotateLocal(port.x, port.y, width, height, building.rot);
    const side = rotateCW(port.side, building.rot);
    const tile = { x: building.x + local.x, y: building.y + local.y };
    return {
      kind: port.kind,
      side,
      tile,
      outside: { x: tile.x + DELTA[side].x, y: tile.y + DELTA[side].y },
    };
  });
}
