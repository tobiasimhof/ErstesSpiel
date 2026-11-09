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
//              (je Rohstoff amount Stück in duration Sekunden). v0.17.0: Statt
//              input/output kann inputs mehrere Rohstoffe nennen ({ Rohstoff:
//              Ware }) – die Erntebank verarbeitet so alle Pflanzen. v0.14.0
//              (Tobias): Bis zu capacity Rohstoffe passen hinein; sie werden
//              nacheinander verarbeitet – so läuft die Fabrik länger, auch
//              wenn das Spiel geschlossen ist.
//   workshop – verarbeitet Waren vom Band nach einem einstellbaren Rezept
//   storage  – Zwischenlager mit Fächern (slots × slotSize). v0.12.0: lässt
//              sich aus dem Laden-Lager befüllen (src/core/warehouse.js);
//              den Nachschub von dort gibt es seit v0.14.0 nicht mehr.
//   shipping – schickt alles ins Laden-Lager
//   garden   – v0.16.0 (Tobias): Beet. Man sät einen Samen; nach der
//              Wachszeit ist daraus 1 Pflanze geworden, die man erntet (sie
//              kommt ins Laden-Lager). Säen und Ernten sind zwei Schritte.
//              Kein Anschluss ans Band. Im Beet wächst jede Pflanze: crops
//              sagt, welcher Samen welche Pflanze in welcher Zeit ergibt.
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
  // v0.16.0: Kräuter-Kapitel, Level 7 „Die Heilstube“ (Tobias, Chat 11) –
  // aufgebaut wie Level 1: Beet (wie der Händler-Rohstoff), Flachsbreche (wie
  // das Holzfällerlager), Webstube (wie das Sägewerk). Die Baukosten kommen aus
  // Waren von Level 1–6, damit diese ihren Wert behalten.
  beet: {
    level: 7,
    name: 'Beet',
    cost: { holzplatte: 10, steinplatte: 10 },
    icon: '🌱',
    size: [2, 2],
    color: '#6b4a2e',
    description:
      'Hier wächst aus einem Samen eine Pflanze. Säen, warten, bis sie reif ist (🌾), dann ernten – die Pflanze kommt ins Laden-Lager. Kein Anschluss ans Band.',
    ports: [],
    // v0.17.0: Ringelblumen wachsen im selben Beet, im gleichen Takt (Tobias)
    production: {
      kind: 'garden',
      crops: {
        leinsamen: { plant: 'flachspflanze', time: 1800 },
        ringelblumensamen: { plant: 'ringelblume', time: 1800 },
      },
    },
  },
  // v0.17.0 (Tobias): ein Gerät für alle Pflanzen – deshalb heißt die
  // Flachsbreche jetzt Erntebank (der Schlüssel bleibt, damit Spielstände passen).
  flachsbreche: {
    level: 7,
    name: 'Erntebank',
    cost: { holzplatte: 10, zahnradwelle: 2 },
    icon: '🪢',
    size: [2, 2],
    color: '#8a7a3e',
    description:
      'Verarbeitet geerntete Pflanzen nach und nach: 1 Flachspflanze → 50 Flachsfasern, 1 Ringelblume → 50 getrocknete Ringelblüten. Bis zu 3 Pflanzen passen hinein, auch gemischt. Die Waren kommen am orangen Pfeil heraus.',
    ports: [{ kind: 'out', x: 1, y: 0, side: 'E' }],
    production: {
      kind: 'source',
      inputs: { flachspflanze: 'flachsfaser', ringelblume: 'ringelbluete' },
      amount: 50,
      duration: 600,
      capacity: 3,
    },
  },
  webstube: {
    level: 7,
    name: 'Webstube',
    cost: { holzstab: 20, raederwerk: 2 },
    icon: '🧵',
    size: [2, 2],
    color: '#7f6a8f',
    description: 'Webt aus je 5 Flachsfasern einen Verband. Flachsfasern kommen am blauen Pfeil hinein.',
    ports: [
      { kind: 'in', x: 0, y: 0, side: 'W' },
      { kind: 'out', x: 1, y: 0, side: 'E' },
    ],
    production: { kind: 'workshop', recipes: ['verband'] },
  },
  // v0.17.0: Level 8 – Kombi-Maschine des Kräuter-Kapitels (zwei Eingänge wie
  // die Zimmerei). Baukosten nur aus Werkzeug-Waren (Tobias).
  kraeuterstube: {
    level: 8,
    name: 'Kräuterstube',
    cost: { holzplatte: 10, eisenblech: 5, zahnradwelle: 2 },
    icon: '🌿',
    size: [2, 2],
    color: '#4f7a4a',
    description:
      'Macht Heilverbände (Verband + Ringelblüten) oder Kräuterkompressen (Flachsfasern + Ringelblüten). Zwei Eingänge links – am besten jede Zutat über ihren eigenen.',
    ports: [
      { kind: 'in', x: 0, y: 0, side: 'W' },
      { kind: 'in', x: 0, y: 1, side: 'W' },
      { kind: 'out', x: 1, y: 0, side: 'E' },
    ],
    production: { kind: 'workshop', recipes: ['heilverband', 'kraeuterkompresse'] },
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

// Reiter der Bauleiste (v0.18.0, Tobias): je Rohstoff ein Reiter mit allen
// Gebäuden seiner „Straße“. Kombi-Maschinen stehen bei dem Stoff, zu dem sie
// vom Namen her passen. `item` ist das Warenbild auf dem Reiter.
export const BUILD_TABS = [
  { id: 'holz', name: 'Holz', item: 'holzstamm', buildings: ['holzfaeller', 'saegewerk', 'zimmerei'] },
  { id: 'stein', name: 'Stein', item: 'felsbrocken', buildings: ['steinbruch', 'steinmetz'] },
  { id: 'eisen', name: 'Eisen', item: 'eisenerz', buildings: ['schmelzhuette', 'schmiede', 'feinschmiede', 'schlosserei'] },
  { id: 'kraeuter', name: 'Kräuter', item: 'ringelblume', buildings: ['beet', 'flachsbreche', 'webstube', 'kraeuterstube'] },
];

// Gebäude, die man oft braucht: stehen immer sichtbar links in der Bauleiste,
// zusammen mit Förderband, Verschieben und Abreißen.
export const BUILD_ALWAYS = ['lagerhaus', 'versandportal'];

// Alle Gebäude, die man bauen kann (Reiter der Reihe nach, dann die immer sichtbaren).
export const BUILD_MENU = [...BUILD_TABS.flatMap((tab) => tab.buildings), ...BUILD_ALWAYS];

// Ein Feld Förderband kostet so viel (v0.7.0).
export const BELT_COST = { holzblock: 1 };
