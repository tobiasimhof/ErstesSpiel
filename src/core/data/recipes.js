// Rezepte der Werkstätten: Neue Rezepte sind neue Einträge.
//
// building: in welcher Werkstatt es läuft
// label:    Name der Einstellung im Infofenster
// inputs:   benötigte Waren je Durchgang
// output/amount: was herauskommt
// time:     Sekunden je Durchgang
// Festgelegter Techbaum (docs/SPIEL.md, Abschnitt 7). Mengen und Zeiten sind Platzhalter.

export const RECIPES = {
  holzplatte: { building: 'saegewerk', label: 'Platten', inputs: { holzblock: 5 }, output: 'holzplatte', amount: 1, time: 5 },
  holzstab: { building: 'saegewerk', label: 'Stäbe', inputs: { holzblock: 5 }, output: 'holzstab', amount: 1, time: 5 },
  steinplatte: { building: 'steinmetz', label: 'Platten', inputs: { steinblock: 5 }, output: 'steinplatte', amount: 1, time: 5 },
  steinzahnrad: { building: 'steinmetz', label: 'Zahnräder', inputs: { steinblock: 5 }, output: 'steinzahnrad', amount: 1, time: 5 },
  eisenblech: { building: 'schmiede', label: 'Bleche', inputs: { eisenbarren: 5 }, output: 'eisenblech', amount: 1, time: 5 },
  // v0.8.0: Eisenstange statt Eisennägel – wie alle Grundmaschinen 5 : 1 (Tobias).
  eisenstange: { building: 'schmiede', label: 'Stangen', inputs: { eisenbarren: 5 }, output: 'eisenstange', amount: 1, time: 5 },

  // v0.10.0: Techbaum, Teil 2 (Tobias): 3 Maschinen mit je 2 Eingängen und
  // 3 Einstellungen. Jedes Produkt hat ein eigenes Rezept; aus Grundteilen
  // meist 10 + 5 Stück, damit alle Rohstoffe etwa gleich viel gebraucht werden.
  // Die erste Zutat ist die Hauptzutat.
  // v0.13.0: neue Namen, die zu den Zutaten passen – Mengen und Zeiten wie bisher.
  // Zimmerei: Zahnräder auf einer Holzachse; viele ineinandergreifende Räder; Holz mit Eisen
  zahnradwelle: { building: 'zimmerei', label: 'Wellen', inputs: { holzstab: 10, steinzahnrad: 5 }, output: 'zahnradwelle', amount: 1, time: 20 },
  raederwerk: { building: 'zimmerei', label: 'Räderwerke', inputs: { steinzahnrad: 10, holzstab: 5 }, output: 'raederwerk', amount: 1, time: 20 },
  verstaerkteholzplatte: { building: 'zimmerei', label: 'Verst. Platten', inputs: { holzplatte: 10, eisenstange: 5 }, output: 'verstaerkteholzplatte', amount: 1, time: 20 },
  // Feinschmiede: zwei Bleche und ein Stift; Schaft aus der Stange, Bart aus dem Blech; zwei Schenkel am Gelenk
  scharnier: { building: 'feinschmiede', label: 'Scharniere', inputs: { eisenblech: 10, eisenstange: 5 }, output: 'scharnier', amount: 1, time: 20 },
  schluessel: { building: 'feinschmiede', label: 'Schlüssel', inputs: { eisenstange: 10, eisenblech: 5 }, output: 'schluessel', amount: 1, time: 20 },
  zirkel: { building: 'feinschmiede', label: 'Zirkel', inputs: { scharnier: 1, eisenstange: 5 }, output: 'zirkel', amount: 1, time: 30 },
  // Schlosserei: Stein mit Eisenhaken; Wellen und Räder; Bügel am Gelenk und Schließwerk
  gewichtstein: { building: 'schlosserei', label: 'Gewichte', inputs: { steinplatte: 10, eisenstange: 5 }, output: 'gewichtstein', amount: 1, time: 20 },
  uhrwerk: { building: 'schlosserei', label: 'Uhrwerke', inputs: { zahnradwelle: 1, raederwerk: 1 }, output: 'uhrwerk', amount: 1, time: 30 },
  vorhaengeschloss: { building: 'schlosserei', label: 'Schlösser', inputs: { scharnier: 1, raederwerk: 1 }, output: 'vorhaengeschloss', amount: 1, time: 30 },

  // v0.16.0: Webstube (Level 7) – aus Flachsfasern werden Verbände (Leinenbinden).
  // Vorerst nur diese eine Einstellung (Tobias); mehr kommt mit Level 8.
  verband: { building: 'webstube', label: 'Verbände', inputs: { flachsfaser: 5 }, output: 'verband', amount: 1, time: 10 },

  // v0.17.0: Kräuterstube (Level 8) – die erste Maschine des Kräuter-Kapitels
  // mit zwei Eingängen (Tobias: Faser bzw. Verband + Kraut). Der Verband kommt
  // auf Wunden, die Kompresse auf Prellungen und Schwellungen.
  heilverband: { building: 'kraeuterstube', label: 'Heilverbände', inputs: { verband: 1, ringelbluete: 5 }, output: 'heilverband', amount: 1, time: 20 },
  kraeuterkompresse: { building: 'kraeuterstube', label: 'Kompressen', inputs: { flachsfaser: 10, ringelbluete: 5 }, output: 'kraeuterkompresse', amount: 1, time: 20 },
};
