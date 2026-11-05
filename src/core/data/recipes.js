// Rezepte der Werkstätten: Neue Rezepte sind neue Einträge.
//
// building: in welcher Werkstatt es läuft
// label:    Name der Einstellung im Infofenster
// inputs:   benötigte Waren je Durchgang
// output/amount: was herauskommt
// time:     Sekunden je Durchgang
// Alle Zahlen sind Platzhalter (200 Holzblöcke → 40 Winkel, wie von Tobias beschrieben).

export const RECIPES = {
  holzwinkel: { building: 'saegewerk', label: 'Winkel', inputs: { holzblock: 5 }, output: 'holzwinkel', amount: 1, time: 5 },
  holzstab: { building: 'saegewerk', label: 'Stäbe', inputs: { holzblock: 5 }, output: 'holzstab', amount: 1, time: 5 },
  steinplatte: { building: 'steinmetz', label: 'Platten', inputs: { steinblock: 5 }, output: 'steinplatte', amount: 1, time: 5 },
  splitt: { building: 'steinmetz', label: 'Splitt', inputs: { steinblock: 5 }, output: 'splitt', amount: 1, time: 5 },
};
