// Förderbänder legen, aufteilen, zusammenführen, drehen und abreißen.
//
// Jedes Band-Feld hat eine Liste von Ausgängen (outs). Eingänge ergeben sich
// von selbst: Jedes Nachbarband und jeder Gebäude-Ausgang, der auf dieses Feld
// zeigt, liefert hinein.
//
// - Zusammenführen: Ein neues Band endet seitlich auf einem bestehenden Band.
// - Aufteilen: Ein neues Band startet auf einem bestehenden Band. Das Feld
//   bekommt einen zusätzlichen Ausgang (bis zu 3 Richtungen). Durch mehrfaches
//   Aufteilen wird aus 1 Strecke 2, 3, 4 oder mehr.
// Verteiler-Gebäude braucht es dafür nicht.

import { DIRS, dirBetween, opposite, rotateCW, sortDirs, step } from './dirs.js';
import { buildingPorts } from './geometry.js';
import { beltAt, buildingAt, isInWorld, isOwned, tileKey } from './state.js';

export function canHoldBelt(state, x, y) {
  return isOwned(state, x, y) && !buildingAt(state, x, y);
}

// Liegt auf dem Feld etwas, in das ein Ausgang liefern kann?
function hasTarget(state, tile) {
  return Boolean(beltAt(state, tile.x, tile.y) || buildingAt(state, tile.x, tile.y));
}

const sameTile = (a, b) => a && b && a.x === b.x && a.y === b.y;

// Felder von "from" (ohne) bis "to" (mit) in Schritten zu direkten Nachbarn.
// Füllt Lücken, wenn der Finger schnell über mehrere Felder springt.
export function interpolateTiles(from, to) {
  const tiles = [];
  let { x, y } = from;
  while (x !== to.x || y !== to.y) {
    const dx = to.x - x;
    const dy = to.y - y;
    if (Math.abs(dx) >= Math.abs(dy)) x += Math.sign(dx);
    else y += Math.sign(dy);
    tiles.push({ x, y });
  }
  return tiles;
}

// Hängt ein Feld an die Fingerspur an (mit aufgefüllten Lücken).
export function extendTrace(trace, tile) {
  if (trace.length === 0) return [tile];
  const last = trace[trace.length - 1];
  if (sameTile(last, tile)) return trace;
  return [...trace, ...interpolateTiles(last, tile)];
}

// Macht aus der Fingerspur eine Band-Strecke.
// Ergebnis: tiles = Felder mit Band, endDir = Richtung in ein Gebäude am Ende.
// - Zurückziehen über das vorletzte Feld nimmt das letzte Stück wieder weg.
// - Läuft der Finger auf ein Feld ohne Platz für ein Band (Gebäude, gesperrte
//   Fläche, schon belegtes Feld der Strecke), pausiert die Strecke, bis der
//   Finger auf ihr letztes Feld zurückkehrt. Zeigt sie dabei in ein Gebäude,
//   wird sie mit ihm verbunden.
export function buildBeltPath(state, trace) {
  const tiles = [];
  let endDir = null;
  let away = false;
  for (const t of trace) {
    if (tiles.length === 0) {
      // Startet der Finger auf einem Gebäude, beginnt die Strecke erst daneben.
      if (canHoldBelt(state, t.x, t.y)) tiles.push(t);
      continue;
    }
    const last = tiles[tiles.length - 1];
    if (away) {
      if (sameTile(t, last)) {
        away = false;
        endDir = null;
      }
      continue;
    }
    if (tiles.length >= 2 && sameTile(t, tiles[tiles.length - 2])) {
      tiles.pop();
      continue;
    }
    const dir = dirBetween(last, t);
    if (dir && canHoldBelt(state, t.x, t.y) && !tiles.some((p) => sameTile(p, t))) {
      tiles.push(t);
      continue;
    }
    away = true;
    if (dir && isInWorld(state, t.x, t.y) && buildingAt(state, t.x, t.y)) endDir = dir;
  }
  return { tiles, endDir };
}

// Richtung, in die jedes Feld der Strecke zeigt.
export function pathDirections(path) {
  const { tiles, endDir } = path;
  return tiles.map((t, i) => {
    if (i < tiles.length - 1) return dirBetween(t, tiles[i + 1]);
    if (endDir) return endDir;
    return tiles.length >= 2 ? dirBetween(tiles[i - 1], t) : null;
  });
}

// Legt die Strecke. Gibt die Anzahl neuer Band-Felder zurück.
export function applyBeltPath(state, path) {
  const { tiles, endDir } = path;
  if (tiles.length === 0 || (tiles.length === 1 && !endDir)) return 0;
  const dirs = pathDirections(path);
  const existed = tiles.map((t) => Boolean(beltAt(state, t.x, t.y)));

  // 1. Neue Bänder anlegen
  let created = 0;
  tiles.forEach((t, i) => {
    if (existed[i]) return;
    state.belts[tileKey(t.x, t.y)] = { outs: [dirs[i]] };
    created++;
  });

  // 2. Bestehende Bänder auf der Strecke bekommen einen zusätzlichen Ausgang
  //    (Aufteilen). Endet die Strecke auf einem bestehenden Band, läuft sie
  //    dort hinein (Zusammenführen) und das Band bleibt, wie es ist.
  tiles.forEach((t, i) => {
    if (!existed[i]) return;
    const isLast = i === tiles.length - 1;
    if (isLast && !endDir) return;
    addOutput(state, t, dirs[i]);
  });
  return created;
}

// Fügt einem Band einen Ausgang hinzu. Ausgänge, die ins Leere zeigen,
// werden dabei ersetzt (so lässt sich das Ende einer Strecke umlenken).
export function addOutput(state, tile, dir) {
  const belt = beltAt(state, tile.x, tile.y);
  if (!belt) return false;
  const kept = belt.outs.filter((d) => d === dir || hasTarget(state, step(tile, d)));
  if (!kept.includes(dir)) kept.push(dir);
  belt.outs = sortDirs(kept);
  return true;
}

export function rotateBelt(state, x, y) {
  const belt = beltAt(state, x, y);
  if (!belt) return false;
  belt.outs = sortDirs(belt.outs.map((d) => rotateCW(d)));
  return true;
}

// Entfernt ein Band. Nachbarbänder, die hineingezeigt haben, verlieren diesen
// Ausgang, sofern sie noch einen anderen haben.
export function removeBelt(state, x, y) {
  if (!beltAt(state, x, y)) return false;
  delete state.belts[tileKey(x, y)];
  for (const dir of DIRS) {
    const n = step({ x, y }, dir);
    const neighbor = beltAt(state, n.x, n.y);
    const back = opposite(dir);
    if (neighbor && neighbor.outs.includes(back) && neighbor.outs.length > 1) {
      neighbor.outs = neighbor.outs.filter((d) => d !== back);
    }
  }
  return true;
}

// Seiten, von denen Waren in dieses Feld geliefert werden
// (Nachbarbänder und Gebäude-Ausgänge).
export function inputSides(state, x, y) {
  const sides = [];
  for (const dir of DIRS) {
    const n = step({ x, y }, dir);
    const neighbor = beltAt(state, n.x, n.y);
    if (neighbor && neighbor.outs.includes(opposite(dir))) {
      sides.push(dir);
      continue;
    }
    const building = buildingAt(state, n.x, n.y);
    if (building && buildingPorts(building).some((p) => p.kind === 'out' && p.outside.x === x && p.outside.y === y)) {
      sides.push(dir);
    }
  }
  return sides;
}
