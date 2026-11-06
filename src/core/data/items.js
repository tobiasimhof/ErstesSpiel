// Waren-Tabelle: Neue Waren sind neue Einträge.
//
// raw:      Rohstoff, wird gekauft und in ein Gebäude eingelegt (nicht aufs Band)
// buyPrice: Kaufpreis beim Händler (ab v0.7.0)
// price:    fester Wert/Verkaufspreis im Laden
// shape/color: Aussehen auf dem Band und in Listen
//
// Preise nach dem festgelegten Techbaum (README, Abschnitt 4.2), alle Beträge ×10:
// Blöcke bringen knapp mehr als der Rohstoff kostet (+9 %), jedes weitere Teil
// rund 20 % mehr als seine Zutaten. Eisen kostet viermal so viel wie Holz und Stein.

export const ITEMS = {
  // Rohstoffe
  holzstamm: { name: 'Holzstamm', plural: 'Holzstämme', raw: true, buyPrice: 550, color: '#8a5a2b', shape: 'log' },
  felsbrocken: { name: 'Felsbrocken', plural: 'Felsbrocken', raw: true, buyPrice: 550, color: '#8d939b', shape: 'rock' },
  eisenerz: { name: 'Eisenerz', plural: 'Eisenerz', raw: true, buyPrice: 2200, color: '#7a4f43', shape: 'rock', ore: true },
  // Blöcke
  holzblock: { name: 'Holzblock', plural: 'Holzblöcke', price: 3, color: '#cf9a5f', shape: 'block', grain: true },
  steinblock: { name: 'Steinblock', plural: 'Steinblöcke', price: 3, color: '#a7adb5', shape: 'block' },
  eisenbarren: { name: 'Eisenbarren', plural: 'Eisenbarren', price: 12, color: '#8e98a6', shape: 'ingot' },
  // Teile aus den Grundmaschinen
  holzplatte: { name: 'Holzplatte', plural: 'Holzplatten', price: 18, color: '#c79459', shape: 'plate', grain: true },
  holzstab: { name: 'Holzstab', plural: 'Holzstäbe', price: 18, color: '#c48d55', shape: 'rod' },
  steinplatte: { name: 'Steinplatte', plural: 'Steinplatten', price: 18, color: '#c3c8ce', shape: 'plate' },
  steinzahnrad: { name: 'Stein-Zahnrad', plural: 'Stein-Zahnräder', price: 18, color: '#9aa1aa', shape: 'gear' },
  minieisenplatte: { name: 'Mini-Eisenplatte', plural: 'Mini-Eisenplatten', price: 72, color: '#a9b4c2', shape: 'smallplate' },
  // v0.8.0: Eisenstange statt Eisennägel (vorher 5 Barren → 5 Nägel, das gab zu viele Nägel)
  eisenstange: { name: 'Eisenstange', plural: 'Eisenstangen', price: 72, color: '#9fa9b7', shape: 'bar' },
};
