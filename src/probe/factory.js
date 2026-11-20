// v0.32.0: Grafik-Probe (Tobias, Chat 22: „Ich würde gerne eine kleine
// Grafik-Probe jetzt machen, damit ich weiß in welche Richtung das Spiel gehen
// kann“). Die kleine Fabrik der Probe – nach den echten Spielregeln aus
// src/core, ohne Grafik (deshalb auch in node testbar).
//
// Zwei Straßen (Felder relativ zur linken oberen Ecke des Grundstücks):
//   Holz:  Holzfällerlager (1,2) → Band → Sägewerk (9,2, Platten) → Band →
//          Versandportal (14,2). Dazu ein Lagerhaus (4,0) mit Holzblöcken, das
//          von oben auf das Band liefert – so ist die Straße belebt.
//   Glas:  Ofen (1,6) mit Sand → Band → Schmiede (9,6, Fläschchen) → Band →
//          Versandportal (14,6).

import { applyBeltPath, buildBeltPath, extendTrace } from '../core/belts.js';
import { placeBuilding } from '../core/buildings.js';
import { addRawToSource, setRecipe, sourceRoom } from '../core/production.js';
import { createNewGame } from '../core/state.js';
import { fillWarehouse, warehouseRoom } from '../core/warehouse.js';

// Ausschnitt der Probe in Feldern (relativ zum Grundstück)
export const PROBE_AREA = { width: 16, height: 9 };

function belt(state, ox, oy, points) {
  let trace = [];
  for (const [x, y] of points) trace = extendTrace(trace, { x: ox + x, y: oy + y });
  applyBeltPath(state, buildBeltPath(state, trace));
}

// Baut die Probe-Fabrik. Gibt { state, origin, sources } zurück.
export function createProbeFactory(seed = 7) {
  const state = createNewGame(seed);
  state.buildings = [];
  state.belts = {};
  state.storage = {};
  state.shopLevel = 13; // Ofen mit Sand, Schmiede mit Fläschchen
  state.gold = 0;
  const ox = state.plot.x;
  const oy = state.plot.y;
  const at = (type, x, y) => placeBuilding(state, type, ox + x, oy + y, 0);

  // Holz-Straße
  at('holzfaeller', 1, 2);
  at('lagerhaus', 4, 0);
  const saege = at('saegewerk', 9, 2);
  at('versandportal', 14, 2);
  belt(state, ox, oy, [[3, 2], [8, 2]]);
  belt(state, ox, oy, [[5, 1], [5, 2]]); // vom Lagerhaus aufs Band
  belt(state, ox, oy, [[11, 2], [13, 2]]);
  setRecipe(saege, 'holzplatte');

  // Glas-Straße
  at('kohlenmeiler', 1, 6);
  const schmiede = at('schmiede', 9, 6);
  at('versandportal', 14, 6);
  belt(state, ox, oy, [[3, 6], [8, 6]]);
  belt(state, ox, oy, [[11, 6], [13, 6]]);
  setRecipe(schmiede, 'flaeschchen');

  keepRunning(state);
  return { state, origin: { x: ox, y: oy } };
}

// Hält die Probe am Laufen: Rohstoffe nachlegen (Holzstamm, Sand), das
// Lagerhaus mit Holzblöcken nachfüllen, das Laden-Lager leeren.
export function keepRunning(state) {
  for (const b of state.buildings) {
    if (b.type === 'holzfaeller') while (sourceRoom(b) > 0) addRawToSource(b, 'holzstamm');
    if (b.type === 'kohlenmeiler') while (sourceRoom(b) > 0) addRawToSource(b, 'sand');
    if (b.type === 'lagerhaus') {
      // wie „📥 Befüllen“ im Spiel – die Holzblöcke kommen aus dem Laden-Lager
      const room = warehouseRoom(b, 'holzblock');
      state.storage = { holzblock: room };
      fillWarehouse(state, b, 'holzblock', room);
    }
  }
  state.storage = {};
}
