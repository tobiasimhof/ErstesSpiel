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
  // Nägel sind klein und werden oft doppelt gebraucht: aus 5 Barren werden 5 Nägel.
  eisennagel: { building: 'schmiede', label: 'Nägel', inputs: { eisenbarren: 5 }, output: 'eisennagel', amount: 5, time: 5 },
};
