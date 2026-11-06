// Fläche kaufen (v0.9.0): Das Grundstück wächst in Streifen an einer Seite.
// Alle Zahlen sind Platzhalter.
//
// strip:         So viele Felder tief ist ein Streifen (am Rand der Welt
//                notfalls weniger).
// pricePerField: Gold je Feld beim ersten Kauf.
// growth:        Jeder weitere Kauf macht jedes Feld um diesen Faktor teurer.
// roundTo:       Preise werden auf so viel Gold gerundet.
//
// Beispiel: Der erste Streifen rechts (2 × 14 = 28 Felder) kostet 280 Gold.

export const LAND = { strip: 2, pricePerField: 10, growth: 1.2, roundTo: 10 };
