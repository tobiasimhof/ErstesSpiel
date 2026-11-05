// Himmelsrichtungen auf dem Raster. N = oben, E = rechts, S = unten, W = links.

export const DIRS = ['N', 'E', 'S', 'W'];

export const DELTA = {
  N: { x: 0, y: -1 },
  E: { x: 1, y: 0 },
  S: { x: 0, y: 1 },
  W: { x: -1, y: 0 },
};

export const DIR_NAMES = { N: 'oben', E: 'rechts', S: 'unten', W: 'links' };

export function isDir(value) {
  return DIRS.includes(value);
}

export function opposite(dir) {
  return DIRS[(DIRS.indexOf(dir) + 2) % 4];
}

// Dreht eine Richtung im Uhrzeigersinn (times × 90°).
export function rotateCW(dir, times = 1) {
  return DIRS[(DIRS.indexOf(dir) + times) % 4];
}

export function step(tile, dir) {
  return { x: tile.x + DELTA[dir].x, y: tile.y + DELTA[dir].y };
}

// Richtung von Feld a zum direkt benachbarten Feld b, sonst null.
export function dirBetween(a, b) {
  for (const dir of DIRS) {
    if (a.x + DELTA[dir].x === b.x && a.y + DELTA[dir].y === b.y) return dir;
  }
  return null;
}

export function sortDirs(dirs) {
  return [...dirs].sort((a, b) => DIRS.indexOf(a) - DIRS.indexOf(b));
}
