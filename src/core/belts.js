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
import { BELT_COST } from './data/buildings.js';
import { RECIPES } from './data/recipes.js';
import { canAccept, productionOf } from './production.js';
import { addToStorage, affordableCount, payCost, refundCost } from './shop.js';
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

// Anzahl neuer Band-Felder einer Strecke (bestehende Bänder kosten nichts).
export function newBeltCount(state, path) {
  return path.tiles.filter((t) => !beltAt(state, t.x, t.y)).length;
}

// Kürzt die Strecke so, dass sie höchstens maxNew neue Felder enthält.
// Ergebnis: { tiles, endDir, cut } – cut: wie viele neue Felder weggefallen sind.
export function limitBeltPath(state, path, maxNew) {
  let fresh = 0;
  for (let i = 0; i < path.tiles.length; i++) {
    const t = path.tiles[i];
    if (beltAt(state, t.x, t.y)) continue;
    fresh++;
    if (fresh > maxNew) {
      const cut = newBeltCount(state, path) - maxNew;
      return { tiles: path.tiles.slice(0, i), endDir: null, cut };
    }
  }
  return { ...path, cut: 0 };
}

// Legt eine Strecke mit Baukosten (v0.7.0): Jedes neue Feld kostet BELT_COST
// aus dem Laden-Lager. Reicht es nicht, wird die Strecke gekürzt.
// Ergebnis: { created, cut }
export function buyBeltPath(state, path) {
  const limited = limitBeltPath(state, path, affordableCount(state, BELT_COST));
  const count = newBeltCount(state, limited);
  if (!payCost(state, BELT_COST, count)) return { created: 0, cut: limited.cut };
  const created = applyBeltPath(state, limited, { paid: true });
  // Wird die Strecke doch nicht gelegt (z. B. nur ein einzelnes Feld), gibt es die Kosten zurück.
  if (created < count) refundCost(state, BELT_COST, count - created);
  return { created, cut: limited.cut };
}

// Legt die Strecke. Gibt die Anzahl neuer Band-Felder zurück.
// paid: neue Bänder wurden bezahlt und geben beim Abreißen ihre Kosten zurück.
export function applyBeltPath(state, path, { paid = false } = {}) {
  const { tiles, endDir } = path;
  if (tiles.length === 0 || (tiles.length === 1 && !endDir)) return 0;
  const dirs = pathDirections(path);
  const existed = tiles.map((t) => Boolean(beltAt(state, t.x, t.y)));

  // 1. Neue Bänder anlegen
  let created = 0;
  tiles.forEach((t, i) => {
    if (existed[i]) return;
    state.belts[tileKey(t.x, t.y)] = paid ? { outs: [dirs[i]], paid: true } : { outs: [dirs[i]] };
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
  belt.rr = 0;
  return true;
}

// Entfernt ein Band. Eine Ware darauf kommt ins Laden-Lager, ebenso die
// Baukosten, falls das Band bezahlt wurde. Nachbarbänder,
// die hineingezeigt haben, verlieren diesen Ausgang, sofern sie noch einen
// anderen haben.
export function removeBelt(state, x, y) {
  const belt = beltAt(state, x, y);
  if (!belt) return false;
  if (belt.item) addToStorage(state, belt.item.type, 1);
  if (belt.paid) refundCost(state, BELT_COST);
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

// ---------- Bänder leeren (v0.12.0) ----------
// Landen falsche Waren auf einer Strecke (z. B. Holzplatten auf der Strecke,
// die nur Holzstäbe zur Zimmerei bringen soll), staut sich alles. Statt die
// Bänder abzureißen, kommen alle Waren der Strecke ins Laden-Lager; die
// Bänder bleiben liegen und die Produktion läuft sofort weiter.

// Die zusammenhängende Strecke: alle Bänder, die mit diesem direkt verbunden
// sind – auch über Abzweige und Zusammenführungen. An Gebäuden endet sie.
// Ergebnis: Schlüssel "x,y" aller Bänder der Strecke.
export function beltLine(state, x, y) {
  if (!beltAt(state, x, y)) return [];
  const seen = new Set([tileKey(x, y)]);
  const queue = [{ x, y }];
  while (queue.length > 0) {
    const tile = queue.pop();
    const belt = beltAt(state, tile.x, tile.y);
    for (const dir of DIRS) {
      const n = step(tile, dir);
      const key = tileKey(n.x, n.y);
      if (seen.has(key)) continue;
      const other = beltAt(state, n.x, n.y);
      if (!other) continue;
      if (belt.outs.includes(dir) || other.outs.includes(opposite(dir))) {
        seen.add(key);
        queue.push(n);
      }
    }
  }
  return [...seen];
}

// Was liegt auf diesen Bändern? { Ware: Anzahl }
export function beltItems(state, keys) {
  const counts = {};
  for (const key of keys) {
    const item = state.belts[key]?.item;
    if (item) counts[item.type] = (counts[item.type] ?? 0) + 1;
  }
  return counts;
}

// Nimmt alle Waren von diesen Bändern und legt sie ins Laden-Lager (wie beim
// Abreißen darf es dabei übervoll werden). Gibt zurück: { Ware: Anzahl }.
function clearBelts(state, keys) {
  const back = beltItems(state, keys);
  for (const key of keys) {
    const belt = state.belts[key];
    if (belt?.item) {
      addToStorage(state, belt.item.type, 1);
      belt.item = null;
    }
  }
  return back;
}

// Knopf „Strecke leeren“ am Band.
export function clearBeltLine(state, x, y) {
  return clearBelts(state, beltLine(state, x, y));
}

// Gestaute Zuleitungen einer Werkstatt: Bänder, die direkt in einen Eingang
// liefern und vorn eine Ware haben, die die Werkstatt gerade nicht annimmt.
// Ergebnis: [{ x, y, type }]
export function jammedFeeds(state, building) {
  if (productionOf(building.type)?.kind !== 'workshop') return [];
  const feeds = [];
  for (const port of buildingPorts(building)) {
    if (port.kind !== 'in') continue;
    const belt = beltAt(state, port.outside.x, port.outside.y);
    if (!belt?.item) continue;
    const feedsIn = belt.outs.some((dir) => {
      const t = step(port.outside, dir);
      return t.x === port.tile.x && t.y === port.tile.y;
    });
    if (!feedsIn || canAccept(state, building, belt.item.type)) continue;
    feeds.push({ x: port.outside.x, y: port.outside.y, type: belt.item.type });
  }
  return feeds;
}

// Knopf „Zulauf leeren“ an einer Werkstatt mit rotem Licht: leert die
// gestauten Strecken, die in sie führen. Bringt eine Strecke eine Ware, die
// die Werkstatt gar nicht braucht, wird nur diese geleert (die anderen warten
// nur auf ihre Zutat); sonst alle gestauten. Gibt zurück: { Ware: Anzahl }.
export function clearFeed(state, building) {
  const jammed = jammedFeeds(state, building);
  if (jammed.length === 0) return {};
  const needed = RECIPES[building.prod.recipe].inputs;
  const wrong = jammed.filter((f) => !needed[f.type]);
  const keys = new Set();
  for (const f of wrong.length > 0 ? wrong : jammed) {
    for (const key of beltLine(state, f.x, f.y)) keys.add(key);
  }
  return clearBelts(state, [...keys]);
}
