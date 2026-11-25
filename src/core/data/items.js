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
// bloom:    v0.47.0 (Tobias, Chat 28): Wuchsform einer Pflanze, damit sich die
//           Kräuter nicht nur in der Farbe unterscheiden – 'stars' (Flachs: Halme
//           mit kleinen Sternblüten), 'disc' (Ringelblume: eine große Blüte),
//           'umbel' (Schafgarbe: flacher Schirm), 'daisies' (Kamille)
// grows:    v0.47.0: Samen – welche Pflanze daraus wächst (Bild auf der Samentüte)
//
// Preise nach dem festgelegten Techbaum (docs/SPIEL.md, Abschnitt 7):
// Blöcke bringen knapp mehr als der Rohstoff kostet (+9 %), jedes weitere Teil
// rund 20 % mehr als seine Zutaten. Eisen kostet viermal so viel wie Holz und Stein.
// v0.23.0 (Tobias, Chat 18): alle Preise durch 3, damit die Beträge zum
// Mittelalter passen – ein Holzblock kostet 1 Gold, ein Zirkel 662 statt 1.987.
// Das Gleichgewicht bleibt; Startgold, Fläche und Aufstiege sind mit geteilt.

export const ITEMS = {
  // Rohstoffe
  holzstamm: { name: 'Holzstamm', plural: 'Holzstämme', raw: true, level: 1, buyPrice: 183, color: '#8a5a2b', shape: 'log' },
  felsbrocken: { name: 'Felsbrocken', plural: 'Felsbrocken', raw: true, level: 2, buyPrice: 183, color: '#8d939b', shape: 'rock' },
  eisenerz: { name: 'Eisenerz', plural: 'Eisenerz', raw: true, level: 3, buyPrice: 732, color: '#7a4f43', shape: 'rock', ore: true },
  // Blöcke
  holzblock: { name: 'Holzblock', plural: 'Holzblöcke', price: 1, color: '#cf9a5f', shape: 'block', grain: true },
  steinblock: { name: 'Steinblock', plural: 'Steinblöcke', price: 1, color: '#a7adb5', shape: 'block' },
  eisenbarren: { name: 'Eisenbarren', plural: 'Eisenbarren', price: 4, color: '#8e98a6', shape: 'ingot' },
  // Teile aus den Grundmaschinen
  holzplatte: { name: 'Holzplatte', plural: 'Holzplatten', price: 6, color: '#c79459', shape: 'plate', grain: true },
  holzstab: { name: 'Holzstab', plural: 'Holzstäbe', price: 6, color: '#c48d55', shape: 'rod' },
  steinplatte: { name: 'Steinplatte', plural: 'Steinplatten', price: 6, color: '#c3c8ce', shape: 'plate' },
  steinzahnrad: { name: 'Stein-Zahnrad', plural: 'Stein-Zahnräder', price: 6, color: '#9aa1aa', shape: 'gear' },
  // v0.13.0: Mini-Eisenplatte heißt Eisenblech (Tobias: Namen sollen zu den Zutaten passen)
  eisenblech: { name: 'Eisenblech', plural: 'Eisenbleche', price: 24, color: '#a9b4c2', shape: 'smallplate' },
  // v0.8.0: Eisenstange statt Eisennägel (vorher 5 Barren → 5 Nägel, das gab zu viele Nägel)
  eisenstange: { name: 'Eisenstange', plural: 'Eisenstangen', price: 24, color: '#9fa9b7', shape: 'bar' },
  // v0.10.0: Kombi-Teile aus zwei Zutaten (Techbaum, Teil 2). Wert = Zutaten + 20 %.
  // v0.13.0 (Tobias): Jedes Produkt heißt so, wie es logisch aus seinen
  // Zutaten entsteht, und bleibt klein. Rezepte und Werte sind unverändert;
  // die alten Namen stehen dahinter.
  // Zimmerei
  zahnradwelle: { name: 'Zahnradwelle', plural: 'Zahnradwellen', price: 108, color: '#b98a52', shape: 'shaft' }, // Handkurbel
  raederwerk: { name: 'Räderwerk', plural: 'Räderwerke', price: 108, color: '#9aa1aa', shape: 'gears' }, // Mechanischer Schalter
  verstaerkteholzplatte: { name: 'Verstärkte Holzplatte', plural: 'Verstärkte Holzplatten', price: 216, color: '#c79459', shape: 'reinforced', grain: true },
  // Feinschmiede
  scharnier: { name: 'Scharnier', plural: 'Scharniere', price: 432, color: '#a9b4c2', shape: 'hinge' },
  schluessel: { name: 'Schlüssel', plural: 'Schlüssel', price: 432, color: '#c9a24a', shape: 'key' }, // Eisenfeder
  zirkel: { name: 'Zirkel', plural: 'Zirkel', price: 662, color: '#b5bfcc', shape: 'compass' }, // Kugellager
  // Schlosserei
  gewichtstein: { name: 'Gewichtstein', plural: 'Gewichtsteine', price: 216, color: '#a7adb5', shape: 'weight' }, // Steinkette
  uhrwerk: { name: 'Uhrwerk', plural: 'Uhrwerke', price: 259, color: '#b0844f', shape: 'clockwork' }, // Regler
  vorhaengeschloss: { name: 'Vorhängeschloss', plural: 'Vorhängeschlösser', price: 648, color: '#8e98a6', shape: 'lock' }, // Mini-Schloss

  // v0.16.0: Kräuter-Kapitel, Level 7 „Die Heilstube“ (Tobias, Chat 11).
  // Leinsamen kaufen → im Beet wächst 1 Flachspflanze (30 Minuten) → in der
  // Flachsbreche 50 Flachsfasern → in der Webstube je 5 Fasern 1 Verband.
  // Mittlere Preise (Tobias): Samen 1.000, aus einem Samen 1.500 Gold.
  // Jede Stufe bringt mehr: 1.000 → 50 × 25 = 1.250 → 10 × 150 = 1.500.
  // v0.23.0 durch 3: 320 → 50 × 8 = 400 → 10 × 48 = 480 (Leinsamen 320 statt
  // 333, damit eine Faser ganze 8 Gold kostet und das Verhältnis bleibt).
  leinsamen: { name: 'Leinsamen', plural: 'Leinsamen', raw: true, level: 7, buyPrice: 320, color: '#c9a66b', shape: 'seeds', grows: 'flachspflanze' },
  flachspflanze: { name: 'Flachspflanze', plural: 'Flachspflanzen', raw: true, grown: true, level: 7, color: '#6f9a45', flower: '#5b8ff9', shape: 'plant', bloom: 'stars' },
  flachsfaser: { name: 'Flachsfaser', plural: 'Flachsfasern', price: 8, color: '#e3d3a4', shape: 'fiber' },
  verband: { name: 'Verband', plural: 'Verbände', price: 48, color: '#f4f1e8', shape: 'bandage' },

  // v0.17.0: Level 8 „Der Kräutergarten“ (Tobias, Chat 11): Die Ringelblume
  // wächst im selben Beet und kommt in dieselbe Maschine wie Flachs (Erntebank).
  // Teurer, bringt aber mehr: 1.500 → 50 × 36 = 1.800 → Heilverbände
  // (v0.23.0 durch 3: 500 → 50 × 12 = 600).
  ringelblumensamen: { name: 'Ringelblumensamen', plural: 'Ringelblumensamen', raw: true, level: 8, buyPrice: 500, color: '#e8a33c', shape: 'seeds', grows: 'ringelblume' },
  ringelblume: { name: 'Ringelblume', plural: 'Ringelblumen', raw: true, grown: true, level: 8, color: '#5f8f3a', flower: '#f59f00', shape: 'plant', bloom: 'disc' },
  ringelbluete: { name: 'Ringelblüte', plural: 'Ringelblüten', price: 12, color: '#f08c00', shape: 'petals' },
  // Kräuterstube: Verband (bzw. Fasern) + Kraut. Wert = Zutaten + 20 %.
  heilverband: { name: 'Heilverband', plural: 'Heilverbände', price: 130, color: '#f4f1e8', herb: '#f59f00', shape: 'bandage' },
  kraeuterkompresse: { name: 'Kräuterkompresse', plural: 'Kräuterkompressen', price: 168, color: '#efe3c2', herb: '#f08c00', shape: 'compress' },

  // v0.26.0: Level 9 „Die Schreibstube“ (Tobias, Chat 19): Die Werkzeuge
  // wachsen weiter, während das Kräuter-Kapitel läuft. Holzkohle aus dem
  // Kohlenmeiler (1 Holzstamm → 100 Stück, 100 × 2 = 200 Gold wie 200
  // Holzblöcke); Zeichenbrett und Reißzeug aus der Schreibstube.
  // Wert = Zutaten + 20 %.
  holzkohle: { name: 'Holzkohle', plural: 'Holzkohle', price: 2, color: '#34302d', shape: 'charcoal' },
  zeichenbrett: { name: 'Zeichenbrett', plural: 'Zeichenbretter', price: 355, color: '#efe6cf', shape: 'drawingboard' },
  reisszeug: { name: 'Reißzeug', plural: 'Reißzeuge', price: 818, color: '#6b4428', shape: 'drawingset' },

  // v0.27.0: Level 10 „Das Spital“ (Entwurf v0.25.1, Tobias: „Ja, darfst du“):
  // Schafgarbe, das Wundkraut des Mittelalters – wächst im selben Beet und
  // läuft durch dieselbe Erntebank. Teurer, bringt aber mehr: 660 → 50 × 16 =
  // 800 (+21 %). In der Kräuterstube: Heilverband + 5 Blüten = Wundverband
  // (130 + 80 = 210, +20 % = 252), der Blut stillt.
  schafgarbensamen: { name: 'Schafgarbensamen', plural: 'Schafgarbensamen', raw: true, level: 10, buyPrice: 660, color: '#a9bf7a', shape: 'seeds', grows: 'schafgarbe' },
  schafgarbe: { name: 'Schafgarbe', plural: 'Schafgarben', raw: true, grown: true, level: 10, color: '#5c7f3a', flower: '#f8f5ea', shape: 'plant', bloom: 'umbel' },
  schafgarbenbluete: { name: 'Schafgarbenblüte', plural: 'Schafgarbenblüten', price: 16, color: '#f4efdc', center: '#d8c98a', shape: 'petals' },
  wundverband: { name: 'Wundverband', plural: 'Wundverbände', price: 252, color: '#f4f1e8', herb: '#f59f00', sprig: '#f8f5ea', shape: 'bandage' },

  // v0.28.0: Level 11 „Die Uhrmacherei“ (Entwurf v0.25.1, Tobias, Chat 20):
  // Uhrwerk, Gewichtstein, Schlüssel und Vorhängeschloss werden weiter-
  // verarbeitet, der Zirkel bekommt eine zweite Verwendung. Wert = Zutaten +
  // 20 % (475 → 570, 1.080 → 1.296, 921 → 1.105).
  raederuhr: { name: 'Räderuhr', plural: 'Räderuhren', price: 570, color: '#8a5a2b', shape: 'weightclock' },
  kastenschloss: { name: 'Kastenschloss', plural: 'Kastenschlösser', price: 1296, color: '#9aa3ad', shape: 'boxlock' },
  sternenuhr: { name: 'Sternenuhr', plural: 'Sternenuhren', price: 1105, color: '#2b3f73', shape: 'starclock' },

  // v0.29.0: Level 12 „Die Apotheke“ (Entwurf v0.29.0, Tobias, Chat 21: „Von
  // mir aus kannst du nach meinem Feedback alles so umsetzen“) – Abschluss des
  // Kräuter-Kapitels. Kamille (beruhigt, hilft beim Schlafen) wächst im selben
  // Beet und läuft durch dieselbe Erntebank: 830 → 50 × 20 = 1.000 (+20 %).
  // Apotheke: Kräutermischung (80 + 100 = 180 → 216), Kamillenkissen
  // (80 + 100 = 180 → 216), Heilpäckchen (252 + 168 = 420 → 504).
  // Schreibstube: Reißbrett = Zeichenbrett + Reißzeug (355 + 818 = 1.173 → 1.408).
  kamillensamen: { name: 'Kamillensamen', plural: 'Kamillensamen', raw: true, level: 12, buyPrice: 830, color: '#e6cf6a', shape: 'seeds', grows: 'kamille' },
  kamille: { name: 'Kamille', plural: 'Kamillen', raw: true, grown: true, level: 12, color: '#6a9a3c', flower: '#ffffff', center: '#f2b705', shape: 'plant', bloom: 'daisies' },
  kamillenbluete: { name: 'Kamillenblüte', plural: 'Kamillenblüten', price: 20, color: '#ffffff', center: '#f2b705', shape: 'daisies' },
  kraeutermischung: { name: 'Kräutermischung', plural: 'Kräutermischungen', price: 216, color: '#9a6a3c', shape: 'herbmix' },
  kamillenkissen: { name: 'Kamillenkissen', plural: 'Kamillenkissen', price: 216, color: '#e9dcc0', shape: 'pillow' },
  heilpaeckchen: { name: 'Heilpäckchen', plural: 'Heilpäckchen', price: 504, color: '#d6bd8e', shape: 'kit' },
  reissbrett: { name: 'Reißbrett', plural: 'Reißbretter', price: 1408, color: '#efe6cf', shape: 'draftingboard' },

  // v0.31.0: Level 13 „Die Glashütte“ (Entwurf v0.30.3, Tobias, Chat 22: „Ich
  // denke die Preise passen so“) – der Anfang der Tränke. Sand vom Händler
  // brennt im Ofen zu Glas: 1.100 → 100 × 12 = 1.200 (+9 %, wie ein Rohstoff
  // zu Blöcken); teurer als Kamillensamen (830), Glas war im Mittelalter
  // kostbar. In der Schmiede 5 Glas → 1 Fläschchen (60 → 72, +20 %).
  sand: { name: 'Sand', plural: 'Sand', raw: true, level: 13, buyPrice: 1100, color: '#d9c08a', shape: 'sandsack' },
  glas: { name: 'Glas', plural: 'Glas', price: 12, color: '#a8dcd9', shape: 'glass' },
  flaeschchen: { name: 'Fläschchen', plural: 'Fläschchen', price: 72, color: '#bfe6e2', shape: 'vial' },

  // v0.45.0: Level 14 „Die Tinktur“ (Entwurf v0.45.0, Tobias, Chat 27: „Ja,
  // die Rezepte passen so“). Mörser: 1 Steinplatte + 3 Holzstäbe = 24 → 29
  // (+20 %), Schale aus Stein, Stößel aus Holz. Tinktur: 1 Fläschchen + 1
  // Kräutermischung = 288 → 346 (+20 %), die Grundzutat aller Tränke.
  // v0.55.0: Mörser aus 5 statt 3 Holzstäben (Tobias, Chat 31) – Wert 43 statt 29
  moerser: { name: 'Mörser', plural: 'Mörser', price: 43, color: '#a7adb5', shape: 'mortar' },
  tinktur: { name: 'Tinktur', plural: 'Tinkturen', price: 346, color: '#7a4a24', herb: '#5f8f3a', shape: 'tincture' },
  // v0.55.0: Level 15 „Der alte Magier“ – der erste Trank: bauchiges Fläschchen
  // mit lila Trank und Korken. Wert (346 + 5 × 20 + 5 × 2 Holzkohle) × 1,2 = 547.
  traumtrank: { name: 'Traumtrank', plural: 'Traumtränke', price: 547, color: '#7b4fc9', glow: '#c9a7ff', shape: 'potion' },
};
