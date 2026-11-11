// Was ein Gebäude auf der Karte zeigt (v0.21.0, Tobias, Chat 15/16:
// „Variante B“ – das Produkt groß in der Mitte statt des Gebäudebildes).
// Reine Abfrage ohne Zeichnen, damit sie automatisch testbar ist; gezeichnet
// wird in renderer.js.
//
// Ergebnis:
//   { kind: 'product', item, faded, ring, missing, dots }
//       Maschinen und Rohstoff-Gebäude. item = Ware auf der hellen Scheibe;
//       faded = blass (Rohstoff-Gebäude ist leer); ring = Fortschritt als Ring
//       um die Scheibe (0 … 1, Maschine: laufendes Stück, Rohstoff-Gebäude:
//       was vom laufenden Rohstoff noch übrig ist); missing = fehlende
//       Zutaten einer wartenden Kombi-Maschine (gelbes „?“-Schild);
//       dots = Rohstoff-Vorrat { capacity, filled } oder null.
//   { kind: 'storage', items }   Lagerhaus: die Waren seiner Fächer (bis 3,
//                                jede Sorte einmal); leer = [] (dann 📦).
//   { kind: 'icon' }             Versandportal: sein Bild bleibt.
//   { kind: 'garden' }           Beet: zeichnet seine Pflanze selbst.

import { RECIPES } from '../core/data/recipes.js';
import {
  buildingProgress,
  createProductionState,
  missingInputs,
  productionOf,
  sourceCapacity,
  sourceCount,
  sourceInputs,
} from '../core/production.js';

export function buildingFace(building) {
  const p = productionOf(building.type);
  // Vorschau beim Platzieren: noch kein Zustand – so, wie es nach dem Bauen aussieht.
  const live = Boolean(building.prod);
  const prod = building.prod ?? createProductionState(building.type);
  const probe = live ? building : { ...building, prod };
  switch (p?.kind) {
    case 'workshop': {
      // Maschinen zeigen ihr Produkt immer klar – ob sie arbeiten, sagt das Statuslicht.
      const ring = prod.busy ? buildingProgress(probe) : prod.out ? 1 : 0;
      return {
        kind: 'product',
        item: RECIPES[prod.recipe].output,
        faded: false,
        ring: live ? ring : null,
        missing: live ? missingInputs(probe) : [],
        dots: null,
      };
    }
    case 'source': {
      const outputs = sourceInputs(p);
      const running = prod.loaded && prod.input ? outputs[prod.input] : null;
      // Leer: blass, was es herstellen würde – bei der Erntebank die Ware, die
      // noch am Ausgang wartet, sonst die der ersten Pflanze.
      const item = running ?? prod.out?.type ?? Object.values(outputs)[0];
      const capacity = sourceCapacity(probe);
      return {
        kind: 'product',
        item,
        faded: !running,
        ring: live ? (running ? buildingProgress(probe) : 0) : null,
        missing: [],
        dots: live && capacity > 1 ? { capacity, filled: sourceCount(probe) } : null,
      };
    }
    case 'storage': {
      const items = [];
      for (const slot of prod.slots ?? []) if (slot.count > 0 && !items.includes(slot.type)) items.push(slot.type);
      return { kind: 'storage', items: items.slice(0, p.slots ?? 3) };
    }
    case 'garden':
      return { kind: 'garden' };
    default:
      return { kind: 'icon' };
  }
}
