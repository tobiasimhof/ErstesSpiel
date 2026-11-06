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
  // v0.10.0: Jedes Level schaltet eine Kombi-Maschine frei (Tobias: bis etwa
  // Level 10 lernt man so nach und nach alles kennen). Ziel: die Produkte der
  // zuletzt freigeschalteten Maschine. Einen vierten Rohstoff gibt es nicht,
  // deshalb jeweils 1 Eisenerz (der wertvollste Rohstoff).
  4: { name: 'Zimmerei', goal: { minieisenplatte: 1, eisenstange: 1 }, gift: { eisenerz: 1 } },
  5: { name: 'Feinschmiede', goal: { handkurbel: 1, schalter: 1 }, gift: { eisenerz: 1 } },
  6: { name: 'Schlosserei', goal: { scharnier: 1, eisenfeder: 1 }, gift: { eisenerz: 1 } },
};

export const MAX_LEVEL = Math.max(...Object.keys(LEVELS).map(Number));
