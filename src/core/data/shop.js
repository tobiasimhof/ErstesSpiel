// Laden: Lagergröße und Theken je Level, Kunden, Startvorrat. Platzhalter.

export const SHOP_LEVELS = {
  1: { storage: 500, counters: 2, counterSize: 20 },
};

// Kunden: kommen alle minInterval–maxInterval Sekunden und kaufen
// minItems–maxItems Stück von den Theken (zum festen Wert der Ware).
export const CUSTOMERS = { minInterval: 10, maxInterval: 30, minItems: 1, maxItems: 3 };

// Neues Spiel (v0.7.0): kein Gold, ein Holzstamm und ein Felsbrocken gratis,
// dazu Holzblöcke für die ersten Förderbänder zum Versandportal.
export const START_GOLD = 0;
export const START_STORAGE = { holzstamm: 1, felsbrocken: 1, holzblock: 20 };

// Pleiteschutz: Wer gar nicht mehr weiterkommt, bekommt diesen Rohstoff geschenkt.
export const BAILOUT_ITEM = 'holzstamm';

// Testpaket im Testmodus: Gold und von jeder Ware (ohne Rohstoffe) diese Menge.
export const TEST_PACK = { gold: 1000, each: 50 };

// So viele Verkäufe merkt sich der Laden für die Anzeige „Letzte Verkäufe“.
export const SALES_LOG_SIZE = 5;
