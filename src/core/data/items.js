// Waren-Tabelle: Neue Waren sind neue Einträge.
//
// raw:      Rohstoff, wird gekauft und in ein Gebäude eingelegt (nicht aufs Band)
// buyPrice: Kaufpreis beim Händler (ab v0.7.0). Ohne buyPrice gibt es den
//           Rohstoff nicht beim Händler.
// grown:    v0.16.0: wächst im Beet (Flachspflanze) – ein Rohstoff, den man
//           erntet und dann einlegt; kaufen kann man ihn nicht
// level:    Rohstoff: ab diesem Laden-Level beim Händler (v0.9.0)
// price:    fester Wert/Verkaufspreis im Laden
// shape/color: Aussehen auf dem Band und in Listen
//
// Preise nach dem festgelegten Techbaum (docs/SPIEL.md, Abschnitt 7), alle Beträge ×10:
// Blöcke bringen knapp mehr als der Rohstoff kostet (+9 %), jedes weitere Teil
// rund 20 % mehr als seine Zutaten. Eisen kostet viermal so viel wie Holz und Stein.

export const ITEMS = {
  // Rohstoffe
  holzstamm: { name: 'Holzstamm', plural: 'Holzstämme', raw: true, level: 1, buyPrice: 550, color: '#8a5a2b', shape: 'log' },
  felsbrocken: { name: 'Felsbrocken', plural: 'Felsbrocken', raw: true, level: 2, buyPrice: 550, color: '#8d939b', shape: 'rock' },
  eisenerz: { name: 'Eisenerz', plural: 'Eisenerz', raw: true, level: 3, buyPrice: 2200, color: '#7a4f43', shape: 'rock', ore: true },
  // Blöcke
  holzblock: { name: 'Holzblock', plural: 'Holzblöcke', price: 3, color: '#cf9a5f', shape: 'block', grain: true },
  steinblock: { name: 'Steinblock', plural: 'Steinblöcke', price: 3, color: '#a7adb5', shape: 'block' },
  eisenbarren: { name: 'Eisenbarren', plural: 'Eisenbarren', price: 12, color: '#8e98a6', shape: 'ingot' },
  // Teile aus den Grundmaschinen
  holzplatte: { name: 'Holzplatte', plural: 'Holzplatten', price: 18, color: '#c79459', shape: 'plate', grain: true },
  holzstab: { name: 'Holzstab', plural: 'Holzstäbe', price: 18, color: '#c48d55', shape: 'rod' },
  steinplatte: { name: 'Steinplatte', plural: 'Steinplatten', price: 18, color: '#c3c8ce', shape: 'plate' },
  steinzahnrad: { name: 'Stein-Zahnrad', plural: 'Stein-Zahnräder', price: 18, color: '#9aa1aa', shape: 'gear' },
  // v0.13.0: Mini-Eisenplatte heißt Eisenblech (Tobias: Namen sollen zu den Zutaten passen)
  eisenblech: { name: 'Eisenblech', plural: 'Eisenbleche', price: 72, color: '#a9b4c2', shape: 'smallplate' },
  // v0.8.0: Eisenstange statt Eisennägel (vorher 5 Barren → 5 Nägel, das gab zu viele Nägel)
  eisenstange: { name: 'Eisenstange', plural: 'Eisenstangen', price: 72, color: '#9fa9b7', shape: 'bar' },
  // v0.10.0: Kombi-Teile aus zwei Zutaten (Techbaum, Teil 2). Wert = Zutaten + 20 %.
  // v0.13.0 (Tobias): Jedes Produkt heißt so, wie es logisch aus seinen
  // Zutaten entsteht, und bleibt klein. Rezepte und Werte sind unverändert;
  // die alten Namen stehen dahinter.
  // Zimmerei
  zahnradwelle: { name: 'Zahnradwelle', plural: 'Zahnradwellen', price: 324, color: '#b98a52', shape: 'shaft' }, // Handkurbel
  raederwerk: { name: 'Räderwerk', plural: 'Räderwerke', price: 324, color: '#9aa1aa', shape: 'gears' }, // Mechanischer Schalter
  verstaerkteholzplatte: { name: 'Verstärkte Holzplatte', plural: 'Verstärkte Holzplatten', price: 648, color: '#c79459', shape: 'reinforced', grain: true },
  // Feinschmiede
  scharnier: { name: 'Scharnier', plural: 'Scharniere', price: 1296, color: '#a9b4c2', shape: 'hinge' },
  schluessel: { name: 'Schlüssel', plural: 'Schlüssel', price: 1296, color: '#c9a24a', shape: 'key' }, // Eisenfeder
  zirkel: { name: 'Zirkel', plural: 'Zirkel', price: 1987, color: '#b5bfcc', shape: 'compass' }, // Kugellager
  // Schlosserei
  gewichtstein: { name: 'Gewichtstein', plural: 'Gewichtsteine', price: 648, color: '#a7adb5', shape: 'weight' }, // Steinkette
  uhrwerk: { name: 'Uhrwerk', plural: 'Uhrwerke', price: 778, color: '#b0844f', shape: 'clockwork' }, // Regler
  vorhaengeschloss: { name: 'Vorhängeschloss', plural: 'Vorhängeschlösser', price: 1944, color: '#8e98a6', shape: 'lock' }, // Mini-Schloss

  // v0.16.0: Kräuter-Kapitel, Level 7 „Die Heilstube“ (Tobias, Chat 11).
  // Leinsamen kaufen → im Beet wächst 1 Flachspflanze (30 Minuten) → in der
  // Flachsbreche 50 Flachsfasern → in der Webstube je 5 Fasern 1 Verband.
  // Mittlere Preise (Tobias): Samen 1.000, aus einem Samen 1.500 Gold.
  // Jede Stufe bringt mehr: 1.000 → 50 × 25 = 1.250 → 10 × 150 = 1.500.
  leinsamen: { name: 'Leinsamen', plural: 'Leinsamen', raw: true, level: 7, buyPrice: 1000, color: '#c9a66b', shape: 'seeds' },
  flachspflanze: { name: 'Flachspflanze', plural: 'Flachspflanzen', raw: true, grown: true, level: 7, color: '#6f9a45', flower: '#5b8ff9', shape: 'plant' },
  flachsfaser: { name: 'Flachsfaser', plural: 'Flachsfasern', price: 25, color: '#e3d3a4', shape: 'fiber' },
  verband: { name: 'Verband', plural: 'Verbände', price: 150, color: '#f4f1e8', shape: 'bandage' },

  // v0.17.0: Level 8 „Der Kräutergarten“ (Tobias, Chat 11): Die Ringelblume
  // wächst im selben Beet und kommt in dieselbe Maschine wie Flachs (Erntebank).
  // Teurer, bringt aber mehr: 1.500 → 50 × 36 = 1.800 → Heilverbände.
  ringelblumensamen: { name: 'Ringelblumensamen', plural: 'Ringelblumensamen', raw: true, level: 8, buyPrice: 1500, color: '#e8a33c', shape: 'seeds' },
  ringelblume: { name: 'Ringelblume', plural: 'Ringelblumen', raw: true, grown: true, level: 8, color: '#5f8f3a', flower: '#f59f00', shape: 'plant' },
  ringelbluete: { name: 'Ringelblüte', plural: 'Ringelblüten', price: 36, color: '#f08c00', shape: 'petals' },
  // Kräuterstube: Verband (bzw. Fasern) + Kraut. Wert = Zutaten + 20 %.
  heilverband: { name: 'Heilverband', plural: 'Heilverbände', price: 396, color: '#f4f1e8', herb: '#f59f00', shape: 'bandage' },
  kraeuterkompresse: { name: 'Kräuterkompresse', plural: 'Kräuterkompressen', price: 516, color: '#efe3c2', herb: '#f08c00', shape: 'compress' },
};
