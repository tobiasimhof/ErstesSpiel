// Rezepte der Werkstätten: Neue Rezepte sind neue Einträge.
//
// building: in welcher Werkstatt es läuft
// label:    Name der Einstellung im Infofenster
// inputs:   benötigte Waren je Durchgang
// output/amount: was herauskommt
// time:     Sekunden je Durchgang
// Festgelegter Techbaum (README, Abschnitt 4.2). Mengen und Zeiten sind Platzhalter.

export const RECIPES = {
  holzplatte: { building: 'saegewerk', label: 'Platten', inputs: { holzblock: 5 }, output: 'holzplatte', amount: 1, time: 5 },
  holzstab: { building: 'saegewerk', label: 'Stäbe', inputs: { holzblock: 5 }, output: 'holzstab', amount: 1, time: 5 },
  steinplatte: { building: 'steinmetz', label: 'Platten', inputs: { steinblock: 5 }, output: 'steinplatte', amount: 1, time: 5 },
  steinzahnrad: { building: 'steinmetz', label: 'Zahnräder', inputs: { steinblock: 5 }, output: 'steinzahnrad', amount: 1, time: 5 },
  minieisenplatte: { building: 'schmiede', label: 'Platten', inputs: { eisenbarren: 5 }, output: 'minieisenplatte', amount: 1, time: 5 },
  // v0.8.0: Eisenstange statt Eisennägel – wie alle Grundmaschinen 5 : 1 (Tobias).
  eisenstange: { building: 'schmiede', label: 'Stangen', inputs: { eisenbarren: 5 }, output: 'eisenstange', amount: 1, time: 5 },

  // v0.10.0: Techbaum, Teil 2 (Tobias): 3 Maschinen mit je 2 Eingängen und
  // 3 Einstellungen. Jedes Produkt hat ein eigenes Rezept; aus Grundteilen
  // meist 10 + 5 Stück, damit alle Rohstoffe etwa gleich viel gebraucht werden.
  // Die erste Zutat ist die Hauptzutat.
  // Zimmerei
  handkurbel: { building: 'zimmerei', label: 'Handkurbeln', inputs: { holzstab: 10, steinzahnrad: 5 }, output: 'handkurbel', amount: 1, time: 20 },
  schalter: { building: 'zimmerei', label: 'Schalter', inputs: { steinzahnrad: 10, holzstab: 5 }, output: 'schalter', amount: 1, time: 20 },
  verstaerkteholzplatte: { building: 'zimmerei', label: 'Verst. Platten', inputs: { holzplatte: 10, eisenstange: 5 }, output: 'verstaerkteholzplatte', amount: 1, time: 20 },
  // Feinschmiede
  scharnier: { building: 'feinschmiede', label: 'Scharniere', inputs: { minieisenplatte: 10, eisenstange: 5 }, output: 'scharnier', amount: 1, time: 20 },
  eisenfeder: { building: 'feinschmiede', label: 'Federn', inputs: { eisenstange: 10, minieisenplatte: 5 }, output: 'eisenfeder', amount: 1, time: 20 },
  kugellager: { building: 'feinschmiede', label: 'Kugellager', inputs: { scharnier: 1, eisenstange: 5 }, output: 'kugellager', amount: 1, time: 30 },
  // Schlosserei
  steinkette: { building: 'schlosserei', label: 'Steinketten', inputs: { steinplatte: 10, eisenstange: 5 }, output: 'steinkette', amount: 1, time: 20 },
  regler: { building: 'schlosserei', label: 'Regler', inputs: { handkurbel: 1, schalter: 1 }, output: 'regler', amount: 1, time: 30 },
  minischloss: { building: 'schlosserei', label: 'Schlösser', inputs: { scharnier: 1, schalter: 1 }, output: 'minischloss', amount: 1, time: 30 },
};
