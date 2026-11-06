// Laden: Lagergröße und Theken je Level, Kunden, Startvorrat. Platzhalter.

// v0.9.0: Level 2 und 3 vorerst wie Level 1 (Lager und Theken wachsen noch nicht mit).
export const SHOP_LEVELS = {
  1: { storage: 500, counters: 2, counterSize: 20 },
  2: { storage: 500, counters: 2, counterSize: 20 },
  3: { storage: 500, counters: 2, counterSize: 20 },
};

// Kunden: kommen alle minInterval–maxInterval Sekunden und kaufen
// minItems–maxItems Stück von den Theken (zum festen Wert der Ware).
export const CUSTOMERS = { minInterval: 10, maxInterval: 30, minItems: 1, maxItems: 3 };

// Neues Spiel (v0.7.0): kein Gold, ein Holzstamm gratis, dazu Holzblöcke für
// die ersten Förderbänder zum Versandportal. Seit v0.9.0 startet man nur mit
// Holz (Level 1); den Felsbrocken gibt es beim Aufstieg auf Level 2.
export const START_GOLD = 0;
export const START_STORAGE = { holzstamm: 1, holzblock: 20 };

// Pleiteschutz: Wer gar nicht mehr weiterkommt, bekommt diesen Rohstoff geschenkt.
export const BAILOUT_ITEM = 'holzstamm';

// Testpaket im Testmodus: Gold und von jeder freigeschalteten Ware (ohne Rohstoffe) diese Menge.
export const TEST_PACK = { gold: 1000, each: 50 };

// So viele Verkäufe merkt sich der Laden für die Anzeige „Letzte Verkäufe“.
export const SALES_LOG_SIZE = 5;
