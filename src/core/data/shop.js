// Laden: Lagergröße, Theken und Kunden je Level, Startvorrat. Platzhalter.

// storage:      Plätze im Laden-Lager
// counterSize:  Plätze auf jeder Theke (alle Theken gleich groß)
// customerSeconds: v0.25.0 – jede Theke hat ihre eigenen Kunden; an jeder
//               kommt alle [min, max] Sekunden einer (zufällig dazwischen)
// v0.10.1 (Tobias): Alle Theken wachsen mit – kleine Theken (20), mittlere
// (25), große (30), dann bleibt es erst einmal so. Das Laden-Lager fasst ab
// Level 4 1.000 Waren, weil man dort auf Masse produzieren muss.
// v0.24.0 (Tobias, Chat 17): Die Theken verkaufen langsamer, je höher das
// Level – die 2 Start-Theken zusammen 6 Stück pro Minute auf Level 1–3, 3 ab
// Level 4 und 1,5 ab Level 7. „Damit reguliert sich der Verkauf ohnehin und
// der Anfang wird nicht so ‚zäh‘.“ Aufstiege bringen keine Theken mehr.
// v0.25.0 (Tobias, Chat 19): „Die Zeiten könnte man etwas angleichen“ – je
// Theke Level 4–6 alle 25–45 Sekunden ein Kunde (vorher 30–50), ab Level 7
// alle 45–60 (vorher 60–100), damit Waren, die man gerade nicht weiter-
// verarbeiten kann, schneller verkauft sind und das Lager nicht volläuft.
// v0.36.0 (Tobias, Chat 24): Level 1–3 genau alle 15 Sekunden (vorher 15–25),
// „weil der Verkauf mit den kleinen Beträgen doch sehr langsam abläuft“ –
// je Theke 4 statt 3 Stück pro Minute.
export const SHOP_LEVELS = {
  1: { storage: 500, counterSize: 20, customerSeconds: [15, 15] },
  2: { storage: 500, counterSize: 20, customerSeconds: [15, 15] },
  3: { storage: 500, counterSize: 20, customerSeconds: [15, 15] },
  4: { storage: 1000, counterSize: 25, customerSeconds: [25, 45] },
  5: { storage: 1000, counterSize: 30, customerSeconds: [25, 45] },
  6: { storage: 1000, counterSize: 30, customerSeconds: [25, 45] },
  // v0.16.0: Level 7 (Kräuter-Kapitel) – der Laden bleibt wie auf Level 6,
  // nur die Kunden kommen seltener.
  7: { storage: 1000, counterSize: 30, customerSeconds: [45, 60] },
  8: { storage: 1000, counterSize: 30, customerSeconds: [45, 60] },
  // v0.26.0: Level 9 – der Laden bleibt wie auf Level 7 und 8.
  9: { storage: 1000, counterSize: 30, customerSeconds: [45, 60] },
  // v0.27.0: Level 10 – der Laden bleibt wie auf Level 7 bis 9.
  10: { storage: 1000, counterSize: 30, customerSeconds: [45, 60] },
  // v0.28.0: Level 11 – der Laden bleibt wie auf Level 7 bis 10.
  11: { storage: 1000, counterSize: 30, customerSeconds: [45, 60] },
  // v0.29.0: Level 12 – der Laden bleibt wie auf Level 7 bis 11.
  12: { storage: 1000, counterSize: 30, customerSeconds: [45, 60] },
  // v0.31.0: Level 13 – der Laden bleibt wie auf Level 7 bis 12.
  13: { storage: 1000, counterSize: 30, customerSeconds: [45, 60] },
  // v0.45.0: Level 14 – der Laden bleibt wie auf Level 7 bis 13.
  14: { storage: 1000, counterSize: 30, customerSeconds: [45, 60] },
  // v0.55.0: Level 15 – der Laden bleibt wie auf Level 7 bis 14.
  15: { storage: 1000, counterSize: 30, customerSeconds: [45, 60] },
  // v0.57.0: Level 16 – der Laden bleibt wie auf Level 7 bis 15.
  16: { storage: 1000, counterSize: 30, customerSeconds: [45, 60] },
  // v0.58.0: Level 17 – der Laden bleibt wie auf Level 7 bis 16.
  17: { storage: 1000, counterSize: 30, customerSeconds: [45, 60] },
  // v0.59.0: Level 18 – der Laden bleibt wie auf Level 7 bis 17.
  18: { storage: 1000, counterSize: 30, customerSeconds: [45, 60] },
};

// Namen der Theken-Größen für Texte (v0.10.1)
export const COUNTER_SIZE_NAMES = { 20: 'kleine', 25: 'mittlere', 30: 'große' };

// v0.24.0: Theken kaufen (Tobias, Chat 17 und 19). Jeder beginnt mit `start`
// Theken; weitere gibt es nur für Gold. prices: Preis der 3., 4., 5. …
// Theke (null = gibt es noch nicht zu kaufen). levels: ab welchem Laden-Level
// sie sich kaufen lässt (fehlt = ab Level 1). v0.31.0 (Tobias, Chat 21): „erst
// mit Beginn der Tränke freischalten …, also dass wir auf Level 13 dann auch
// die 6. Theke freischalten können für einen Preis von 150.000 Gold.“ Der
// Laden zeigt immer `max` Plätze, damit die Theken-Ansicht voll ist.
export const COUNTERS = { start: 2, prices: [15000, 35000, 70000, 150000], levels: [1, 1, 1, 13], max: 6 };

// v0.30.0: Laden-Lager vergrößern (Tobias, Chat 21: „dass man sein Lager z.b.
// um 100 vergrößert für einen bestimmten Preis, sodass man sein Gold auch für
// das Lager ausgeben kann.“). Jeder Ausbau bringt `size` Plätze mehr; der erste
// kostet firstPrice, jeder weitere priceStep mehr (5.000, 7.500, 10.000 …);
// höchstens `max` Ausbauten – Tobias: „10 Ausbauten, sodass das Lager sich
// verdoppelt reicht erstmal im ersten Schritt“ (1.000 → 2.000); ab Level
// `level` – „ab Level 7 beginnen, wenn wir auch mit Kräutern anfangen“.
export const STORAGE_UPGRADE = { size: 100, firstPrice: 5000, priceStep: 2500, max: 10, level: 7 };

// Kunden (v0.24.0): Jede Theke hat ihre eigenen Kunden (wie oft: oben,
// customerSeconds). Jeder kauft minItems–maxItems Stück.
export const CUSTOMERS = { minItems: 1, maxItems: 1 };

// Neues Spiel (v0.7.0): ein Holzstamm gratis, dazu Holzblöcke für die ersten
// Förderbänder zum Versandportal. Seit v0.9.0 startet man nur mit Holz
// (Level 1); den Felsbrocken gibt es beim Aufstieg auf Level 2.
// v0.9.1: 500 Gold Startkapital (Tobias) – der erste Holzstamm muss auch die
// ersten Gebäude bezahlen und brachte allein nie genug für den zweiten.
// v0.23.0: durch 3 wie alle Preise (500 → 170).
// v0.36.0 (Tobias, Chat 24): 500 Gold „sozusagen als "Startkapital"“, damit man
// am Anfang gleich mehrere Holzstämme kaufen kann (vorher reichten 170 Gold
// nicht einmal für einen). Gilt für neue Spielstände.
export const START_GOLD = 500;
export const START_STORAGE = { holzstamm: 1, holzblock: 20 };

// Pleiteschutz: Wer gar nicht mehr weiterkommt, bekommt diesen Rohstoff geschenkt.
export const BAILOUT_ITEM = 'holzstamm';

// Testpaket im Testmodus: Gold und von jeder freigeschalteten Ware (ohne
// Rohstoffe) diese Menge. v0.10.0: Kombi-Teile (ab Level 4) nur je
// eachAdvanced Stück, sonst wäre das Laden-Lager sofort übervoll.
// v0.23.0: Gold durch 3 wie alle Preise (1.000 → 330).
export const TEST_PACK = { gold: 330, each: 50, eachAdvanced: 5, advancedLevel: 4 };

// So viele Verkäufe merkt sich der Laden für die Anzeige „Letzte Verkäufe“.
export const SALES_LOG_SIZE = 5;
