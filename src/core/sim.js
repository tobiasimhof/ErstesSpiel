// Simulation in festen Takten: Waren laufen über Bänder, Gebäude geben aus,
// nehmen an und arbeiten. Kennt keine Grafik.
//
// Regeln:
// - Jedes Band-Feld trägt höchstens eine Ware. Sie läuft vom Eingang zum
//   Ausgang des Feldes (progress 0 → 1) und wird am Ende weitergegeben.
// - Kann sie nicht weiter (Band voll, Gebäude nimmt sie nicht an), bleibt sie
//   stehen – alles dahinter staut sich, Gebäude davor halten an.
// - Aufteilen: Ein Band mit mehreren Ausgängen gibt abwechselnd in jede
//   Richtung ab und überspringt Richtungen, die gerade voll sind.
// - Zusammenführen: Wollen mehrere Bänder gleichzeitig auf dasselbe Feld,
//   kommen sie abwechselnd zum Zug.

import { DIRS, opposite, step } from './dirs.js';
import { buildingPorts } from './geometry.js';
import { updateMarket } from './market.js';
import { accept, canAccept, peekOutput, takeOutput, updateProduction } from './production.js';
import { beltAt, buildingAt, parseTileKey, tileKey } from './state.js';

export const TICK = 0.1; // Sekunden je Takt
export const BELT_SPEED = 2; // Felder pro Sekunde (Platzhalter)

// Wer auf Feld "target" eine Ware vom Nachbarfeld "source" annehmen könnte.
function receiverAt(state, target, source) {
  const belt = beltAt(state, target.x, target.y);
  if (belt) return { kind: 'belt', belt, key: `b${tileKey(target.x, target.y)}` };
  const building = buildingAt(state, target.x, target.y);
  if (!building) return null;
  const port = buildingPorts(building).find(
    (p) =>
      p.kind === 'in' &&
      p.tile.x === target.x &&
      p.tile.y === target.y &&
      p.outside.x === source.x &&
      p.outside.y === source.y,
  );
  return port ? { kind: 'building', building, key: `g${building.id}:${tileKey(target.x, target.y)}` } : null;
}

function canReceive(state, receiver, type) {
  return receiver.kind === 'belt' ? !receiver.belt.item : canAccept(state, receiver.building, type);
}

// fromSide: Seite des Zielfeldes, von der die Ware kommt.
function receive(state, receiver, type, fromSide) {
  if (receiver.kind === 'belt') {
    receiver.belt.item = { type, progress: 0, from: fromSide };
    receiver.belt.lastFrom = fromSide;
  } else {
    accept(state, receiver.building, type);
  }
}

// Reihenfolge der Bewerber für ein Feld: die Seite nach der zuletzt bedienten zuerst.
function byRotation(requests, lastFrom) {
  if (requests.length < 2) return requests;
  const start = lastFrom ? DIRS.indexOf(lastFrom) + 1 : 0;
  const rank = (r) => (DIRS.indexOf(opposite(r.dir)) - start + 4) % 4;
  return [...requests].sort((a, b) => rank(a) - rank(b));
}

export function tick(state, dt = TICK) {
  const belts = Object.entries(state.belts);

  // 1. Waren auf den Bändern vorwärts bewegen
  for (const [, belt] of belts) {
    if (belt.item && belt.item.progress < 1) belt.item.progress = Math.min(1, belt.item.progress + BELT_SPEED * dt);
  }

  // 2. Übergaben: Bänder (Ware am Feldende) und Gebäude (fertige Ware) melden
  //    ihren Wunsch an, dann bekommt je Ziel einer den Zuschlag – reihum, damit
  //    beim Zusammenführen alle abwechselnd drankommen.
  const wishes = new Map();
  const wish = (receiver, request) => {
    if (!wishes.has(receiver.key)) wishes.set(receiver.key, { receiver, requests: [] });
    wishes.get(receiver.key).requests.push(request);
  };

  for (const [key, belt] of belts) {
    if (!belt.item || belt.item.progress < 1) continue;
    const tile = parseTileKey(key);
    const n = belt.outs.length;
    const rr = belt.rr ?? 0;
    for (let i = 0; i < n; i++) {
      const outIndex = (rr + i) % n;
      const dir = belt.outs[outIndex];
      const receiver = receiverAt(state, step(tile, dir), tile);
      if (!receiver || !canReceive(state, receiver, belt.item.type)) continue;
      wish(receiver, { belt, dir, outIndex, type: belt.item.type });
      break;
    }
  }

  for (const building of state.buildings) {
    const type = peekOutput(building);
    building.prod.blocked = Boolean(type); // bis eine Übergabe klappt
    if (!type) continue;
    for (const port of buildingPorts(building)) {
      if (port.kind !== 'out') continue;
      const receiver = receiverAt(state, port.outside, port.tile);
      if (!receiver || !canReceive(state, receiver, type)) continue;
      wish(receiver, { building, dir: port.side, type });
      break;
    }
  }

  for (const { receiver, requests } of wishes.values()) {
    const lastFrom = receiver.kind === 'belt' ? receiver.belt.lastFrom : null;
    for (const req of byRotation(requests, lastFrom)) {
      if (!canReceive(state, receiver, req.type)) continue;
      receive(state, receiver, req.type, opposite(req.dir));
      if (req.belt) {
        req.belt.item = null;
        req.belt.rr = (req.outIndex + 1) % req.belt.outs.length;
      } else {
        takeOutput(req.building);
        req.building.prod.blocked = false;
      }
      if (receiver.kind === 'belt') break; // ein Band-Feld nimmt pro Takt nur eine Ware
    }
  }

  // 3. Gebäude arbeiten
  for (const building of state.buildings) updateProduction(state, building, dt);

  // 4. Kunden kaufen an den Theken, Pleiteschutz
  updateMarket(state, dt);
}

// Mehrere Sekunden am Stück durchrechnen (Tests, später Offline-Produktion).
export function simulate(state, seconds, dt = TICK) {
  const steps = Math.round(seconds / dt);
  for (let i = 0; i < steps; i++) tick(state, dt);
}
