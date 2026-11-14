// Fläche kaufen (v0.9.0): Das Grundstück wächst in Streifen an einer Seite.
// Alle Zahlen sind Platzhalter.
//
// v0.10.2 (Tobias): Jeder Kauf kostet gleich viel und bringt 4 Reihen, schon
// ab Level 1 – wer seine Fabrik ausbauen möchte, soll nicht am Platz
// scheitern. Jede Seite lässt sich 2× erweitern; die Welt ist genau so groß,
// dass auf jeder Seite 2 Streifen Platz haben (siehe WORLD in state.js).
//
// depth:   So viele Felder tief ist ein Streifen.
// perSide: So oft lässt sich jede Seite erweitern (ohne LAND_MORE).
// price:   Gold für einen dieser Streifen. Ein Rest-Streifen (nur in
//          Spielständen von vor v0.10.2 möglich) kostet anteilig weniger.
// roundTo: Preise werden auf so viel Gold gerundet.
//
// Beispiel: Der erste Streifen rechts (4 × 14 = 56 Felder) kostet 170 Gold,
// der zweite auch (v0.23.0: durch 3 wie alle Preise, vorher 500).

export const LAND = {
  depth: 4,
  perSide: 2,
  price: 170,
  roundTo: 10,
};

// v0.27.0 (Tobias, Chat 20): „Aktuell wird es mit dem Platz ein wenig eng,
// deswegen würde ich vorschlagen, dass man auf Level 10 zusätzlich auch noch
// neuen Platz kaufen kann.“ – „Ein Streifen gerne 2000 Gold, weil man hier
// als Spieler schon sehr reich sein kann.“
//
// Ab diesem Level lässt sich jede Seite noch so oft mehr erweitern (strips),
// jeder dieser Streifen kostet price. Beim Aufstieg rückt der Rand der Welt
// an jeder Seite nach außen. Weitere Zeilen (z. B. Level 12) gehen genauso.
// Level 10: bis 46 × 38 Felder.
export const LAND_MORE = [{ level: 10, strips: 1, price: 2000 }];
