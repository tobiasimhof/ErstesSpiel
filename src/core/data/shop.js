// Laden: Lagergröße und Theken je Level, Kunden, Startvorrat. Platzhalter.

// storage:  Plätze im Laden-Lager
// counters: Anzahl Verkaufstheken
// v0.9.0: Level 2 und 3 vorerst wie Level 1.
// v0.10.0: Ab Level 4 kommt mit jedem Aufstieg eine Theke dazu (Tobias),
// weil die Waren wertvoller werden – auf Level 6 sind es 5 Theken.
export const SHOP_LEVELS = {
  1: { storage: 500, counters: 2 },
  2: { storage: 500, counters: 2 },
  3: { storage: 500, counters: 2 },
  4: { storage: 500, counters: 3 },
  5: { storage: 500, counters: 4 },
  6: { storage: 500, counters: 5 },
};

// Plätze je Theke (v0.10.0): Die ersten beiden fassen 20 Stück, jede neue
// Theke 5 mehr als die vorige (Tobias). Theke 3 = 25, Theke 4 = 30, Theke 5 = 35.
export const COUNTER_SIZES = [20, 20, 25, 30, 35];

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
