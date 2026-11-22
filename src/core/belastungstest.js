// v0.39.0: Belastungstest (Tobias, Chat 25: „Lass uns erst sehen, wie der
// Belastungstest ist“) – eine voll bebaute Fabrik, um auf dem Tablet
// abzulesen, wie flüssig die Ansicht läuft. Nach den echten Spielregeln, ohne
// Grafik (deshalb in node testbar). main.js zeigt sie unter
// index.html?belastungstest=1 und speichert sie nie.
//
// Die ganze Fläche (Level 13, 46 × 38) ist mit Straßen gefüllt, je 11 Felder
// breit und 3 hoch: Rohstoff-Gebäude → Band → Maschine → Band → Versandportal.
// Die vier Arten wechseln sich ab, damit alle Haus-Arten vorkommen.

import { applyBeltPath, buildBeltPath, extendTrace } from './belts.js';
import { placeBuilding } from './buildings.js';
import { fitWorldToLevel } from './land.js';
import { addRawToSource, setRecipe } from './production.js';
import { simulate } from './sim.js';
import { createNewGame } from './state.js';

export const STRESS_LINES = [
  { source: 'holzfaeller', raw: 'holzstamm', machine: 'saegewerk', recipe: 'holzplatte' },
  { source: 'steinbruch', raw: 'felsbrocken', machine: 'steinmetz', recipe: 'steinplatte' },
  { source: 'schmelzhuette', raw: 'eisenerz', machine: 'schmiede', recipe: 'eisenstange' },
  { source: 'kohlenmeiler', raw: 'sand', machine: 'schmiede', recipe: 'flaeschchen' },
];

// Baut die Fabrik und lässt sie 2 Minuten laufen, damit Waren auf den Bändern liegen.
export function createStressFactory(seed = 7) {
  const state = createNewGame(seed);
  state.shopLevel = 13;
  fitWorldToLevel(state);
  state.plot = { ...state.world };
  state.buildings = [];
  state.belts = {};
  const belt = (points) => {
    let trace = [];
    for (const [x, y] of points) trace = extendTrace(trace, { x, y });
    applyBeltPath(state, buildBeltPath(state, trace));
  };
  let n = 0;
  for (let row = 0; row + 2 <= state.plot.height; row += 3) {
    for (let col = 0; col + 11 <= state.plot.width; col += 11) {
      const line = STRESS_LINES[n++ % STRESS_LINES.length];
      const x = state.plot.x + col;
      const y = state.plot.y + row;
      const source = placeBuilding(state, line.source, x, y, 0);
      const machine = placeBuilding(state, line.machine, x + 5, y, 0);
      placeBuilding(state, 'versandportal', x + 10, y, 0);
      belt([[x + 2, y], [x + 4, y]]);
      belt([[x + 7, y], [x + 9, y]]);
      if (machine) setRecipe(machine, line.recipe);
      if (source) for (let i = 0; i < 3; i++) addRawToSource(source, line.raw);
    }
  }
  simulate(state, 120);
  return state;
}
