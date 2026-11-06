// Gebäude-Tabelle: Neue Gebäude sind neue Einträge.
//
// size:  [Breite, Höhe] in Feldern (ungedreht).
// ports: Ein- und Ausgänge. x/y = Feld innerhalb des Gebäudes (ungedreht),
//        side = Seite, an der das Förderband andockt (N, E, S, W).
//        kind 'in' = Eingang (blauer Pfeil), 'out' = Ausgang (oranger Pfeil).
// production: was das Gebäude tut
//   source   – verarbeitet einen eingelegten Rohstoff nach und nach
//              (amount Stück in duration Sekunden)
//   workshop – verarbeitet Waren vom Band nach einem einstellbaren Rezept
//   storage  – Zwischenlager mit Fächern (slots × slotSize)
//   shipping – schickt alles ins Laden-Lager
// Alle Zahlen sind Platzhalter. Maschinen sind 2 × 2 (README, Abschnitt 4.2).

export const BUILDINGS = {
  holzfaeller: {
    name: 'Holzfällerlager',
    icon: '🪓',
    size: [2, 2],
    color: '#4f7f35',
    description:
      'Verarbeitet einen eingelegten Holzstamm nach und nach zu 200 Holzblöcken. Sie kommen am orangen Pfeil heraus.',
    ports: [{ kind: 'out', x: 1, y: 0, side: 'E' }],
    production: { kind: 'source', input: 'holzstamm', output: 'holzblock', amount: 200, duration: 900 },
  },
  steinbruch: {
    name: 'Steinbruch',
    icon: '⛏️',
    size: [2, 2],
    color: '#7d8590',
    description:
      'Verarbeitet einen eingelegten Felsbrocken nach und nach zu 200 Steinblöcken. Sie kommen am orangen Pfeil heraus.',
    ports: [{ kind: 'out', x: 1, y: 0, side: 'E' }],
    production: { kind: 'source', input: 'felsbrocken', output: 'steinblock', amount: 200, duration: 900 },
  },
  schmelzhuette: {
    name: 'Schmelzhütte',
    icon: '🔥',
    size: [2, 2],
    color: '#8a4b32',
    description:
      'Schmilzt ein eingelegtes Eisenerz nach und nach zu 200 Eisenbarren. Sie kommen am orangen Pfeil heraus.',
    ports: [{ kind: 'out', x: 1, y: 0, side: 'E' }],
    production: { kind: 'source', input: 'eisenerz', output: 'eisenbarren', amount: 200, duration: 900 },
  },
  saegewerk: {
    name: 'Sägewerk',
    icon: '🪚',
    size: [2, 2],
    color: '#a0703c',
    description:
      'Macht aus je 5 Holzblöcken eine Holzplatte oder einen Holzstab – je nach Einstellung. Holzblöcke kommen am blauen Pfeil hinein.',
    ports: [
      { kind: 'in', x: 0, y: 0, side: 'W' },
      { kind: 'out', x: 1, y: 0, side: 'E' },
    ],
    production: { kind: 'workshop', recipes: ['holzplatte', 'holzstab'] },
  },
  steinmetz: {
    name: 'Steinmetz',
    icon: '⚒️',
    size: [2, 2],
    color: '#68707a',
    description:
      'Macht aus je 5 Steinblöcken eine Steinplatte oder ein Stein-Zahnrad – je nach Einstellung. Steinblöcke kommen am blauen Pfeil hinein.',
    ports: [
      { kind: 'in', x: 0, y: 0, side: 'W' },
      { kind: 'out', x: 1, y: 0, side: 'E' },
    ],
    production: { kind: 'workshop', recipes: ['steinplatte', 'steinzahnrad'] },
  },
  schmiede: {
    name: 'Schmiede',
    icon: '🔨',
    size: [2, 2],
    color: '#5b5f6b',
    description:
      'Macht aus je 5 Eisenbarren eine Mini-Eisenplatte oder 5 Eisennägel – je nach Einstellung. Eisenbarren kommen am blauen Pfeil hinein.',
    ports: [
      { kind: 'in', x: 0, y: 0, side: 'W' },
      { kind: 'out', x: 1, y: 0, side: 'E' },
    ],
    production: { kind: 'workshop', recipes: ['minieisenplatte', 'eisennagel'] },
  },
  lagerhaus: {
    name: 'Lagerhaus',
    icon: '📦',
    size: [2, 1],
    color: '#8b6b4a',
    description:
      'Zwischenlager mit 3 Fächern zu je 50 Waren. Eingang oben links (blauer Pfeil), Ausgang unten rechts (oranger Pfeil). Was hineinläuft, wird gelagert und weitergegeben, sobald am Ausgang Platz ist.',
    ports: [
      { kind: 'in', x: 0, y: 0, side: 'N' },
      { kind: 'out', x: 1, y: 0, side: 'S' },
    ],
    production: { kind: 'storage', slots: 3, slotSize: 50 },
  },
  versandportal: {
    name: 'Versandportal',
    icon: '🌀',
    size: [1, 1],
    color: '#5f4b8b',
    description:
      'Schickt alles, was am blauen Pfeil hineinläuft, direkt ins Lager deines Ladens. Mit „Drehen“ zeigt der Eingang in eine andere Richtung.',
    ports: [{ kind: 'in', x: 0, y: 0, side: 'W' }],
    production: { kind: 'shipping' },
  },
};

// Reihenfolge im Baumenü.
export const BUILD_MENU = [
  'holzfaeller',
  'steinbruch',
  'schmelzhuette',
  'saegewerk',
  'steinmetz',
  'schmiede',
  'lagerhaus',
  'versandportal',
];
