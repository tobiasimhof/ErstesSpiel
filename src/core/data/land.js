// Fläche kaufen (v0.9.0): Das Grundstück wächst in Streifen an einer Seite.
// Alle Zahlen sind Platzhalter.
//
// strips:        So viele Felder tief ist ein Streifen, je nach Laden-Level
//                (am Rand der Welt notfalls weniger). v0.10.1 (Tobias): ab
//                Level 4 doppelt so tief, weil man dort die Produktion
//                deutlich steigern muss.
// pricePerField: Gold je Feld beim ersten Kauf.
// growth:        Jeder weitere Kauf macht jedes Feld um diesen Faktor teurer.
// roundTo:       Preise werden auf so viel Gold gerundet.
//
// Beispiel: Der erste Streifen rechts (2 × 14 = 28 Felder) kostet 280 Gold.

export const LAND = {
  strips: [
    { level: 1, depth: 2 },
    { level: 4, depth: 4 },
  ],
  pricePerField: 10,
  growth: 1.2,
  roundTo: 10,
};
