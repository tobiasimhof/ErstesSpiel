// Fläche kaufen (v0.9.0): Das Grundstück wächst in Streifen an einer Seite.
// Alle Zahlen sind Platzhalter.
//
// v0.10.2 (Tobias): Jeder Kauf kostet gleich viel und bringt 4 Reihen, schon
// ab Level 1 – wer seine Fabrik ausbauen möchte, soll nicht am Platz
// scheitern. Jede Seite lässt sich 2× erweitern; die Welt ist genau so groß,
// dass auf jeder Seite 2 Streifen Platz haben (siehe WORLD in state.js).
//
// depth:   So viele Felder tief ist ein Streifen.
// perSide: So oft lässt sich jede Seite erweitern.
// price:   Gold für einen vollen Streifen. Ein Rest-Streifen (nur in
//          Spielständen von vor v0.10.2 möglich) kostet anteilig weniger.
// roundTo: Preise werden auf so viel Gold gerundet.
//
// Beispiel: Der erste Streifen rechts (4 × 14 = 56 Felder) kostet 170 Gold,
// jeder weitere Streifen auch (v0.23.0: durch 3 wie alle Preise, vorher 500).

export const LAND = {
  depth: 4,
  perSide: 2,
  price: 170,
  roundTo: 10,
};
