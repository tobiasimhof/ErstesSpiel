// Laden-Level (v0.9.0): Erst bewusst einfach (Tobias), damit der Weg
// Holz → Stein → Eisen früh rund spielbar ist. Später kommen Aufgaben mit
// Erfahrung und Gold dazu.
//
// Was ein Level freischaltet, steht direkt bei den Gebäuden (level in
// data/buildings.js) und bei den Rohstoffen (level in data/items.js).
//
// name: Überschrift des Levels
// goal: Diese Waren muss man hergestellt haben, um auf dieses Level aufzusteigen.
// gift: Das gibt es beim Aufstieg gratis ins Laden-Lager – zu Beginn jedes
//       Levels einen Rohstoff (Level 1: der Holzstamm im Startvorrat).

export const LEVELS = {
  1: { name: 'Holz' },
  2: { name: 'Stein', goal: { holzplatte: 1, holzstab: 1 }, gift: { felsbrocken: 1 } },
  3: { name: 'Eisen', goal: { steinplatte: 1, steinzahnrad: 1 }, gift: { eisenerz: 1 } },
};

export const MAX_LEVEL = Math.max(...Object.keys(LEVELS).map(Number));
