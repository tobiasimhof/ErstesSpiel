// Waren-Tabelle: Neue Waren sind neue Einträge.
//
// raw:      Rohstoff, wird gekauft und in ein Gebäude eingelegt (nicht aufs Band)
// buyPrice: Kaufpreis beim Händler (ab v0.6.0)
// price:    fester Verkaufspreis im Laden (ab v0.6.0)
// shape/color: Aussehen auf dem Band und in Listen
//
// Alle Zahlen sind Platzhalter. Rechnung (gewünscht von Tobias): Ein Holzstamm
// ergibt 200 Holzblöcke, die zusammen knapp mehr bringen als der Holzstamm
// kostet (550 → 600). Weiterverarbeitet zu 40 Winkeln/Stäben bringen sie
// deutlich mehr (720). So lohnt es sich, die Produktion auszubauen.

export const ITEMS = {
  holzstamm: { name: 'Holzstamm', plural: 'Holzstämme', raw: true, buyPrice: 550, color: '#8a5a2b', shape: 'log' },
  felsbrocken: { name: 'Felsbrocken', plural: 'Felsbrocken', raw: true, buyPrice: 550, color: '#8d939b', shape: 'rock' },
  holzblock: { name: 'Holzblock', plural: 'Holzblöcke', price: 3, color: '#cf9a5f', shape: 'block', grain: true },
  steinblock: { name: 'Steinblock', plural: 'Steinblöcke', price: 3, color: '#a7adb5', shape: 'block' },
  holzwinkel: { name: 'Holzwinkel', plural: 'Holzwinkel', price: 18, color: '#b9803f', shape: 'angle' },
  holzstab: { name: 'Holzstab', plural: 'Holzstäbe', price: 18, color: '#c48d55', shape: 'rod' },
  steinplatte: { name: 'Steinplatte', plural: 'Steinplatten', price: 18, color: '#c3c8ce', shape: 'plate' },
  splitt: { name: 'Splitt', plural: 'Splitt', price: 18, color: '#959ba3', shape: 'grit' },
};
