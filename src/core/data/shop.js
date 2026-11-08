// Laden: Lagergröße und Theken je Level, Kunden, Startvorrat. Platzhalter.

// storage:     Plätze im Laden-Lager
// counters:    Anzahl Verkaufstheken
// counterSize: Plätze auf jeder Theke (alle Theken gleich groß)
// v0.9.0: Level 2 und 3 vorerst wie Level 1.
// v0.10.0: Ab Level 4 kommt mit jedem Aufstieg eine Theke dazu (Tobias),
// weil die Waren wertvoller werden – auf Level 6 sind es 5 Theken.
// v0.10.1 (Tobias): Alle Theken wachsen mit – kleine Theken (20), mittlere
// (25), große (30), dann bleibt es erst einmal so. Das Laden-Lager fasst ab
// Level 4 1.000 Waren, weil man dort auf Masse produzieren muss.
export const SHOP_LEVELS = {
  1: { storage: 500, counters: 2, counterSize: 20 },
  2: { storage: 500, counters: 2, counterSize: 20 },
  3: { storage: 500, counters: 2, counterSize: 20 },
  4: { storage: 1000, counters: 3, counterSize: 25 },
  5: { storage: 1000, counters: 4, counterSize: 30 },
  6: { storage: 1000, counters: 5, counterSize: 30 },
  // v0.16.0: Level 7 (Kräuter-Kapitel) – der Laden bleibt wie auf Level 6.
  7: { storage: 1000, counters: 5, counterSize: 30 },
};

// Namen der Theken-Größen für Texte (v0.10.1)
export const COUNTER_SIZE_NAMES = { 20: 'kleine', 25: 'mittlere', 30: 'große' };

// Kunden: kommen alle minInterval–maxInterval Sekunden und kaufen
// minItems–maxItems Stück von den Theken (zum festen Wert der Ware).
export const CUSTOMERS = { minInterval: 10, maxInterval: 30, minItems: 1, maxItems: 3 };

// Neues Spiel (v0.7.0): ein Holzstamm gratis, dazu Holzblöcke für die ersten
// Förderbänder zum Versandportal. Seit v0.9.0 startet man nur mit Holz
// (Level 1); den Felsbrocken gibt es beim Aufstieg auf Level 2.
// v0.9.1: 500 Gold Startkapital (Tobias) – der erste Holzstamm muss auch die
// ersten Gebäude bezahlen und brachte allein nie genug für den zweiten.
export const START_GOLD = 500;
export const START_STORAGE = { holzstamm: 1, holzblock: 20 };

// Pleiteschutz: Wer gar nicht mehr weiterkommt, bekommt diesen Rohstoff geschenkt.
export const BAILOUT_ITEM = 'holzstamm';

// Testpaket im Testmodus: Gold und von jeder freigeschalteten Ware (ohne
// Rohstoffe) diese Menge. v0.10.0: Kombi-Teile (ab Level 4) nur je
// eachAdvanced Stück, sonst wäre das Laden-Lager sofort übervoll.
export const TEST_PACK = { gold: 1000, each: 50, eachAdvanced: 5, advancedLevel: 4 };

// So viele Verkäufe merkt sich der Laden für die Anzeige „Letzte Verkäufe“.
export const SALES_LOG_SIZE = 5;
