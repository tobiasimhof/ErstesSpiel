// Gebäude-Tabelle: Neue Gebäude sind neue Einträge.
//
// size:  [Breite, Höhe] in Feldern (ungedreht).
// ports: Ein- und Ausgänge. x/y = Feld innerhalb des Gebäudes (ungedreht),
//        side = Seite, an der das Förderband andockt (N, E, S, W).
//        kind 'in' = Eingang (blauer Pfeil), 'out' = Ausgang (oranger Pfeil).
// cost:  Baukosten in Waren aus dem Laden-Lager (v0.7.0). Abreißen gibt sie zurück.
// level: ab diesem Laden-Level baubar (v0.9.0, siehe data/levels.js).
// tip:   kurzer Tipp ganz unten im Infofenster (v0.19.0, Tobias: das Fenster
//        soll übersichtlich sein; was ein Gebäude herstellt, zeigen dort die
//        Warenbilder, deshalb gibt es keinen langen Beschreibungstext mehr).
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
// Alle Zahlen sind Platzhalter. Maschinen sind 2 × 2 (docs/SPIEL.md, Abschnitt 6).
// color: Farbe auf der Karte. v0.21.0 (Tobias, Chat 16): Seit die Karte statt
//        des Gebäudebildes das Produkt zeigt, haben alle Gebäude eines Reiters
//        dieselbe Farbe – Holz braun, Stein steingrau, Eisen stahlblau, Erde
//        grün (ein Test prüft das). Lagerhaus und Versandportal haben eigene.

export const TAB_COLORS = {
  holz: '#8a5a2e',
  stein: '#8d8a82',
  eisen: '#4a5c7c',
  kraeuter: '#2f6b4f',
  // v0.26.0: Reiter „Werkstatt“ (ziegelrot) für die Werkzeug-Maschinen ab Level 9
  werkstatt: '#8a3d34',
};

export const BUILDINGS = {
  holzfaeller: {
    level: 1,
    name: 'Holzfällerlager',
    cost: { holzplatte: 10, holzstab: 10 },
    icon: '🪓',
    size: [2, 2],
    color: TAB_COLORS.holz,
    tip: 'Die Holzblöcke kommen am orangen Pfeil heraus.',
    ports: [{ kind: 'out', x: 1, y: 0, side: 'E' }],
    production: { kind: 'source', input: 'holzstamm', output: 'holzblock', amount: 200, duration: 900, capacity: 3 },
  },
  steinbruch: {
    level: 2,
    name: 'Steinbruch',
    cost: { holzplatte: 10, holzstab: 5 },
    icon: '⛏️',
    size: [2, 2],
    color: TAB_COLORS.stein,
    tip: 'Die Steinblöcke kommen am orangen Pfeil heraus.',
    ports: [{ kind: 'out', x: 1, y: 0, side: 'E' }],
    production: { kind: 'source', input: 'felsbrocken', output: 'steinblock', amount: 200, duration: 900, capacity: 3 },
  },
  schmelzhuette: {
    level: 3,
    name: 'Schmelzhütte',
    cost: { steinplatte: 20, holzplatte: 10 },
    icon: '🔥',
    size: [2, 2],
    color: TAB_COLORS.eisen,
    tip: 'Die Eisenbarren kommen am orangen Pfeil heraus.',
    ports: [{ kind: 'out', x: 1, y: 0, side: 'E' }],
    production: { kind: 'source', input: 'eisenerz', output: 'eisenbarren', amount: 200, duration: 900, capacity: 3 },
  },
  saegewerk: {
    level: 1,
    name: 'Sägewerk',
    cost: { holzblock: 40 },
    icon: '🪚',
    size: [2, 2],
    color: TAB_COLORS.holz,
    tip: 'Holzblöcke kommen am blauen Pfeil hinein, die Teile am orangen heraus.',
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
    color: TAB_COLORS.stein,
    tip: 'Steinblöcke kommen am blauen Pfeil hinein, die Teile am orangen heraus.',
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
    color: TAB_COLORS.eisen,
    tip: 'Eisenbarren kommen am blauen Pfeil hinein, die Teile am orangen heraus.',
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
    color: TAB_COLORS.holz,
    tip: 'Zwei Eingänge links – am besten jede Zutat über ihren eigenen.',
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
    color: TAB_COLORS.eisen,
    tip: 'Zwei Eingänge links – am besten jede Zutat über ihren eigenen.',
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
    color: TAB_COLORS.eisen,
    tip: 'Zwei Eingänge links – am besten jede Zutat über ihren eigenen.',
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
    color: TAB_COLORS.kraeuter,
    tip: 'Säen, warten, bis die Pflanze reif ist (🌾), dann ernten – sie kommt ins Laden-Lager. Kein Anschluss ans Band.',
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
    color: TAB_COLORS.kraeuter,
    tip: 'Nimmt jede Pflanze, auch gemischt. Die Waren kommen am orangen Pfeil heraus.',
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
    color: TAB_COLORS.kraeuter,
    tip: 'Flachsfasern kommen am blauen Pfeil hinein, die Verbände am orangen heraus.',
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
    color: TAB_COLORS.kraeuter,
    tip: 'Zwei Eingänge links – am besten jede Zutat über ihren eigenen.',
    ports: [
      { kind: 'in', x: 0, y: 0, side: 'W' },
      { kind: 'in', x: 0, y: 1, side: 'W' },
      { kind: 'out', x: 1, y: 0, side: 'E' },
    ],
    production: { kind: 'workshop', recipes: ['heilverband', 'kraeuterkompresse'] },
  },
  // v0.26.0: Level 9 „Die Schreibstube“ (Tobias, Chat 19) – die Werkzeuge
  // wachsen weiter. Der Kohlenmeiler macht wie das Holzfällerlager aus einem
  // Holzstamm Ware (Tobias' Idee: Holzkohle aus Baumstämmen; im Mittelalter
  // brannte der Köhler sie im Meiler). Baukosten aus Werkzeug-Waren bis
  // höchstens 960 Gold (ein Eisenerz als Teile), wie ab Level 3.
  kohlenmeiler: {
    level: 9,
    name: 'Kohlenmeiler',
    cost: { steinplatte: 20, verstaerkteholzplatte: 2 },
    icon: '♨️',
    size: [2, 2],
    color: TAB_COLORS.holz,
    tip: 'Holzstämme einlegen – die Holzkohle kommt am orangen Pfeil heraus.',
    ports: [{ kind: 'out', x: 1, y: 0, side: 'E' }],
    production: { kind: 'source', input: 'holzstamm', output: 'holzkohle', amount: 100, duration: 900, capacity: 3 },
  },
  schreibstube: {
    level: 9,
    name: 'Schreibstube',
    cost: { verstaerkteholzplatte: 1, zirkel: 1 },
    icon: '📐',
    size: [2, 2],
    color: TAB_COLORS.werkstatt,
    tip: 'Zwei Eingänge links – am besten jede Zutat über ihren eigenen.',
    ports: [
      { kind: 'in', x: 0, y: 0, side: 'W' },
      { kind: 'in', x: 0, y: 1, side: 'W' },
      { kind: 'out', x: 1, y: 0, side: 'E' },
    ],
    production: { kind: 'workshop', recipes: ['zeichenbrett', 'reisszeug'] },
  },
  lagerhaus: {
    level: 1,
    name: 'Lagerhaus',
    cost: { holzplatte: 8 },
    icon: '📦',
    size: [2, 1],
    color: '#b39a68',
    // v0.20.0 (Tobias, Chat 15): Zwischenlager in der Fabrik – das Gegenstück zum Versandportal
    tip: 'Zwischenlager: Was oben links hineinläuft, geht unten rechts weiter, sobald dort Platz ist. Befüllen holt Waren aus dem Laden-Lager.',
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
    // v0.20.0 (Tobias, Chat 15): bleibt – der Ausgang der Fabrik, liefert von selbst in den Laden
    tip: 'Ausgang der Fabrik: schickt alles, was am blauen Pfeil hineinläuft, von selbst ins Laden-Lager. „Drehen“ dreht den Eingang.',
    ports: [{ kind: 'in', x: 0, y: 0, side: 'W' }],
    production: { kind: 'shipping', recent: 3 },
  },
};

// Reiter der Bauleiste (v0.18.0, Tobias): je Rohstoff ein Reiter mit allen
// Gebäuden seiner „Straße“. Kombi-Maschinen stehen bei dem Stoff, zu dem sie
// vom Namen her passen. `item` ist das Warenbild auf dem Reiter.
export const BUILD_TABS = [
  // v0.26.0: der Kohlenmeiler (Level 9) macht aus Holzstämmen Holzkohle
  { id: 'holz', name: 'Holz', item: 'holzstamm', color: TAB_COLORS.holz, buildings: ['holzfaeller', 'saegewerk', 'zimmerei', 'kohlenmeiler'] },
  { id: 'stein', name: 'Stein', item: 'felsbrocken', color: TAB_COLORS.stein, buildings: ['steinbruch', 'steinmetz'] },
  { id: 'eisen', name: 'Eisen', item: 'eisenerz', color: TAB_COLORS.eisen, buildings: ['schmelzhuette', 'schmiede', 'feinschmiede', 'schlosserei'] },
  // v0.19.0 (Tobias): Der Reiter heißt „Erde“ – Holz, Stein, Eisen, Erde. Die
  // id bleibt, damit der gemerkte Reiter in den Einstellungen weiter passt.
  { id: 'kraeuter', name: 'Erde', item: 'ringelblume', color: TAB_COLORS.kraeuter, buildings: ['beet', 'flachsbreche', 'webstube', 'kraeuterstube'] },
  // v0.26.0: Die Werkzeuge wachsen ab Level 9 weiter (Tobias, Chat 19). Ihre
  // neuen Maschinen verarbeiten Waren aus mehreren Reitern und passen zu keinem
  // Stoff; je Reiter passen höchstens 4 Gebäude aufs Handy – deshalb ein
  // eigener Reiter (Schreibstube, später die Uhrmacherei).
  { id: 'werkstatt', name: 'Werkstatt', item: 'reisszeug', color: TAB_COLORS.werkstatt, buildings: ['schreibstube'] },
];

// Gebäude, die man oft braucht: stehen immer sichtbar links in der Bauleiste,
// zusammen mit Förderband, Verschieben und Abreißen.
export const BUILD_ALWAYS = ['lagerhaus', 'versandportal'];

// Alle Gebäude, die man bauen kann (Reiter der Reihe nach, dann die immer sichtbaren).
export const BUILD_MENU = [...BUILD_TABS.flatMap((tab) => tab.buildings), ...BUILD_ALWAYS];

// Ein Feld Förderband kostet so viel (v0.7.0).
export const BELT_COST = { holzblock: 1 };
