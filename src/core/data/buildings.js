// Gebäude-Tabelle: Neue Gebäude sind neue Einträge.
//
// size:  [Breite, Höhe] in Feldern (ungedreht).
// ports: Ein- und Ausgänge. x/y = Feld innerhalb des Gebäudes (ungedreht),
//        side = Seite, an der das Förderband andockt (N, E, S, W).
//        kind 'in' = Eingang (blauer Pfeil), 'out' = Ausgang (oranger Pfeil).
// cost:  Baukosten in Waren aus dem Laden-Lager (v0.7.0). Abreißen gibt sie zurück.
// level: ab diesem Laden-Level baubar (v0.9.0, siehe data/levels.js).
// production: was das Gebäude tut
//   source   – verarbeitet eingelegte Rohstoffe nach und nach
//              (je Rohstoff amount Stück in duration Sekunden). v0.14.0
//              (Tobias): Bis zu capacity Rohstoffe passen hinein; sie werden
//              nacheinander verarbeitet – so läuft die Fabrik länger, auch
//              wenn das Spiel geschlossen ist.
//   workshop – verarbeitet Waren vom Band nach einem einstellbaren Rezept
//   storage  – Zwischenlager mit Fächern (slots × slotSize). v0.12.0: lässt
//              sich aus dem Laden-Lager befüllen (src/core/warehouse.js);
//              den Nachschub von dort gibt es seit v0.14.0 nicht mehr.
//   shipping – schickt alles ins Laden-Lager
// Alle Zahlen sind Platzhalter. Maschinen sind 2 × 2 (README, Abschnitt 4.2).

export const BUILDINGS = {
  holzfaeller: {
    level: 1,
    name: 'Holzfällerlager',
    cost: { holzplatte: 10, holzstab: 10 },
    icon: '🪓',
    size: [2, 2],
    color: '#4f7f35',
    description:
      'Verarbeitet Holzstämme nach und nach zu je 200 Holzblöcken. Bis zu 3 Holzstämme passen hinein. Die Blöcke kommen am orangen Pfeil heraus.',
    ports: [{ kind: 'out', x: 1, y: 0, side: 'E' }],
    production: { kind: 'source', input: 'holzstamm', output: 'holzblock', amount: 200, duration: 900, capacity: 3 },
  },
  steinbruch: {
    level: 2,
    name: 'Steinbruch',
    cost: { holzplatte: 10, holzstab: 5 },
    icon: '⛏️',
    size: [2, 2],
    color: '#7d8590',
    description:
      'Verarbeitet Felsbrocken nach und nach zu je 200 Steinblöcken. Bis zu 3 Felsbrocken passen hinein. Die Blöcke kommen am orangen Pfeil heraus.',
    ports: [{ kind: 'out', x: 1, y: 0, side: 'E' }],
    production: { kind: 'source', input: 'felsbrocken', output: 'steinblock', amount: 200, duration: 900, capacity: 3 },
  },
  schmelzhuette: {
    level: 3,
    name: 'Schmelzhütte',
    cost: { steinplatte: 20, holzplatte: 10 },
    icon: '🔥',
    size: [2, 2],
    color: '#8a4b32',
    description:
      'Schmilzt Eisenerz nach und nach zu je 200 Eisenbarren. Bis zu 3 Eisenerz passen hinein. Die Barren kommen am orangen Pfeil heraus.',
    ports: [{ kind: 'out', x: 1, y: 0, side: 'E' }],
    production: { kind: 'source', input: 'eisenerz', output: 'eisenbarren', amount: 200, duration: 900, capacity: 3 },
  },
  saegewerk: {
    level: 1,
    name: 'Sägewerk',
    cost: { holzblock: 40 },
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
    level: 2,
    name: 'Steinmetz',
    cost: { steinblock: 30, holzstab: 5 },
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
    level: 3,
    name: 'Schmiede',
    cost: { steinplatte: 10, eisenbarren: 30 },
    icon: '🔨',
    size: [2, 2],
    color: '#5b5f6b',
    description:
      'Macht aus je 5 Eisenbarren ein Eisenblech oder eine Eisenstange – je nach Einstellung. Eisenbarren kommen am blauen Pfeil hinein.',
    ports: [
      { kind: 'in', x: 0, y: 0, side: 'W' },
      { kind: 'out', x: 1, y: 0, side: 'E' },
    ],
    production: { kind: 'workshop', recipes: ['eisenblech', 'eisenstange'] },
  },
  // v0.10.0: Kombi-Maschinen (Techbaum, Teil 2) – zwei Eingänge links oben und
  // links unten (jeder nimmt jede passende Zutat), Ausgang rechts oben.
  zimmerei: {
    level: 4,
    name: 'Zimmerei',
    cost: { holzplatte: 20, eisenstange: 10 },
    icon: '🛠️',
    size: [2, 2],
    color: '#7a5636',
    description:
      'Baut Zahnradwellen, Räderwerke oder Verstärkte Holzplatten. Zwei Eingänge links – am besten jede Zutat über ihren eigenen.',
    ports: [
      { kind: 'in', x: 0, y: 0, side: 'W' },
      { kind: 'in', x: 0, y: 1, side: 'W' },
      { kind: 'out', x: 1, y: 0, side: 'E' },
    ],
    production: { kind: 'workshop', recipes: ['zahnradwelle', 'raederwerk', 'verstaerkteholzplatte'] },
  },
  feinschmiede: {
    level: 5,
    name: 'Feinschmiede',
    cost: { eisenblech: 10, raederwerk: 2 },
    icon: '⚙️',
    size: [2, 2],
    color: '#4c5a70',
    description:
      'Fertigt Scharniere, Schlüssel oder Zirkel. Zwei Eingänge links – am besten jede Zutat über ihren eigenen.',
    ports: [
      { kind: 'in', x: 0, y: 0, side: 'W' },
      { kind: 'in', x: 0, y: 1, side: 'W' },
      { kind: 'out', x: 1, y: 0, side: 'E' },
    ],
    production: { kind: 'workshop', recipes: ['scharnier', 'schluessel', 'zirkel'] },
  },
  schlosserei: {
    level: 6,
    name: 'Schlosserei',
    cost: { scharnier: 1, verstaerkteholzplatte: 2 },
    icon: '🔐',
    size: [2, 2],
    color: '#6e5a2c',
    description:
      'Stellt Gewichtsteine, Uhrwerke oder Vorhängeschlösser her. Zwei Eingänge links – am besten jede Zutat über ihren eigenen.',
    ports: [
      { kind: 'in', x: 0, y: 0, side: 'W' },
      { kind: 'in', x: 0, y: 1, side: 'W' },
      { kind: 'out', x: 1, y: 0, side: 'E' },
    ],
    production: { kind: 'workshop', recipes: ['gewichtstein', 'uhrwerk', 'vorhaengeschloss'] },
  },
  lagerhaus: {
    level: 1,
    name: 'Lagerhaus',
    cost: { holzplatte: 8 },
    icon: '📦',
    size: [2, 1],
    color: '#8b6b4a',
    description:
      'Zwischenlager mit 3 Fächern zu je 50 Waren. Eingang oben links (blauer Pfeil), Ausgang unten rechts (oranger Pfeil). Was hineinläuft, wird gelagert und weitergegeben, sobald am Ausgang Platz ist. Lässt sich von Hand aus dem Laden-Lager befüllen; ist es leer, füllst du es neu.',
    ports: [
      { kind: 'in', x: 0, y: 0, side: 'N' },
      { kind: 'out', x: 1, y: 0, side: 'S' },
    ],
    production: { kind: 'storage', slots: 3, slotSize: 50 },
  },
  versandportal: {
    level: 1,
    name: 'Versandportal',
    cost: { holzblock: 10 },
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
  'zimmerei',
  'feinschmiede',
  'schlosserei',
  'lagerhaus',
  'versandportal',
];

// Ein Feld Förderband kostet so viel (v0.7.0).
export const BELT_COST = { holzblock: 1 };
