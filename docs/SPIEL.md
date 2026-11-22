# Das Spiel

> Beschreibt kurz, wie das Spiel **jetzt** ist (Stand v0.38.0). Einzelheiten stehen in **`docs/inhalte/`** und werden nur gelesen, wenn wir daran arbeiten: `LEVEL.md` (Level, Aufträge, Aufstiege), `GEBAEUDE.md` (Gebäude, Baukosten), `WAREN.md` (Waren, Rezepte, Preise), `BEDIENUNG.md` (Bedienung im Einzelnen), `AUSBLICK.md` (Techbaum, Ideen). Bei jeder Änderung wird der Text **ersetzt**, nicht ergänzt; wie es dazu kam, steht im Archiv (`docs/archiv/`). Alle Zahlen sind Platzhalter – maßgeblich sind die Datentabellen in `src/core/data/`.

## 1. Idee

- **Aufbau- und Fabrikspiel mit Wirtschaftssimulation im Mittelalter** (Arbeitstitel offen): Rohstoffe kaufen, über Förderbänder durch Werkstätten zu immer komplexeren Waren verarbeiten, im eigenen Laden verkaufen und mit dem Gold ausbauen.
- **Schwerpunkt: die optimale Fabrik bauen – Massenproduktion** (Tobias, Chat 17): Prozesse optimieren und automatisieren, immer längere Straßen bauen; Gold gehört dazu, steht aber nicht im Mittelpunkt. Was gebraucht wird, ändert sich mit dem Level – Umbauen, Abreißen und Neubauen gehören zum Spiel. „Man soll immer gucken wie man was jetzt mit dem verbindet, damit man maximal effizient arbeitet“ (Chat 21).
- **Makro-Spiel:** früh planen – genug Grundrohstoffe, ein Vorrat an Baumaterial, eigene Straßen je Zwischenprodukt, Lagerhäuser als Puffer. Werden zwei Bänder mit verschiedenen Waren zusammengeführt, ist nicht mehr steuerbar, was an der Maschine ankommt.
- **Gold ist bewusst knapp** (Tobias): Man kann nicht alles auf einmal bauen; wer mehr verdienen will, muss teurere Waren anbieten – so gibt es mehrere Spielstile.
- **Roter Faden:** Der Laden liegt in einem kleinen Ort am Fluss, der wächst. Jedes Level ist ein Bauabschnitt, die Bewohner geben Aufträge.
- **Kapitel:** Werkzeuge (Level 1–6: Holz, Stein, Eisen), Kräuter (7–12: Flachs, Ringelblume, Schafgarbe, Kamille, Apotheke), ab Level 9 wachsen die Werkzeuge weiter (Holzkohle, Schreibstube, Uhrmacherei), ab Level 13 Tränke (Sand, Glas, Fläschchen). Die Level wechseln sich ab, die Aufträge verlangen Waren aus beiden Bereichen.
- **Kleine Waren:** Alles auf dem Band ist auch im echten Leben klein. Jedes Produkt entsteht logisch aus seinen Zutaten.
- **Plattform:** Browser-Spiel für Tablet und Handy, **nur Querformat**, alles per Touch (Hauptgerät Galaxy Tab S9, oft mit Tastatur); später als App. Vorerst nur Deutsch.
- **Grafik:** 3D mit Kenneys Modellen (CC0, www.kenney.nl) – Mittelalter in den Farben des Spiels, Kamera frei drehbar (Tobias' Wahl, Chat 23). Gebäude ohne eigenes Haus sind vorerst einfache Steinhäuser („Die Logik ist mir erstmal wichtiger“, Chat 25).
- **Vorbilder nur für Mechaniken** (Alchemy Factory, Clash of Clans, Hay Day) – eigene Namen, Rezepte und Grafik. Geschäftsmodell später: kostenlos, Season Pass und Skins, kein Pay2Win.

## 2. Zwei Spielstände: 3D-Test und echte Fabrik

- **3D-Test** – der Start (der Link ohne Zusatz): das Spiel in 3D mit eigenem Spielstand ab Level 1. **Hier spielt und testet Tobias jetzt** (Chat 25: Level 7). Sichern, Laden und „Neues Spiel“ betreffen dort nur den 3D-Test.
- **Echte Fabrik (2D)** – hinten angestellt (Tobias, Chat 25): Tobias' Fabrik auf Level 13 in der Draufsicht mit Platzhalter-Grafik, über ☰ → „🗺️ Zur echten Fabrik (2D)“ (Adresse `?ansicht=2d`), zurück mit „🧊 Zurück zum 3D-Test“. Sie läuft weiter und holt beim Öffnen die Zeit nach.
- Spielregeln, Fenster und Steuerung sind in beiden gleich; neue Inhalte gibt es in beiden.

## 3. Kernschleife und Zeit

Rohstoff kaufen → ins Gebäude legen → über Bänder und Maschinen verarbeiten → Versandportal → Laden-Lager → Theken → Kunden zahlen Gold → neue Rohstoffe, Fläche, Theken, größeres Lager, Aufstieg. Waren sind zugleich Baumaterial: verkaufen oder damit bauen?

- **Echtzeit:** Die Fabrik läuft auch bei geschlossenem Spiel weiter, **bis etwas leer ist** (Rohstoff, Zutaten, Lagerhaus; Laden-Lager voll; Theken leer; Beete reif). Nachlegen ist Handarbeit („wie Clash of Clans, nur umgekehrt“). Beim Zurückkommen wird nachgerechnet; nach mehr als 10 Minuten erscheint „👋 Willkommen zurück!“.
- **Menü ☰:** Spielstand als Datei sichern und laden (auch zum Teilen), Testmodus (Zeit ×10, Testpaket), 3D-Test ↔ echte Fabrik, Neues Spiel. Oben stehen im 3D-Test immer die Bilder pro Sekunde.

## 4. Die Fabrik

- **Grundstück:** Raster mit Zaun, Start 22 × 14 Felder mit Holzfällerlager und Versandportal. Fläche kaufen in Streifen von 4 Reihen: je Seite 2 für 170 Gold (bis 38 × 30), ab Level 10 je Seite ein dritter für 2.000 (bis 46 × 38).
- **Förderbänder** (1 Holzblock je Feld) transportieren Stück für Stück; aufteilen (bis 3 Richtungen, abwechselnd) und zusammenführen. Ist ein Band voll, staut sich alles – nichts geht verloren. „🧺 Strecke leeren“ und „🧺 Zulauf leeren“ bringen Waren ins Laden-Lager.
- **Anschlüsse:** Pfeile blau = Eingang, orange = Ausgang. Maschinen sind 2 × 2, Kombi-Maschinen haben 2 Eingänge (höchstens 2). Statuslicht: grün arbeitet, gelb wartet, rot blockiert.
- **Rohstoff-Gebäude** (Holzfällerlager, Steinbruch, Schmelzhütte, Ofen, Erntebank): 1 Rohstoff → 200 Blöcke bzw. Barren in 15 Minuten (Ofen 100, Erntebank 50 in 10 Minuten), Vorrat bis 3; „⏫ Auffüllen“ nimmt erst aus dem Laden-Lager, dann vom Händler.
- **Maschinen** verarbeiten nach Rezept und lassen sich umstellen (Teile bleiben drin, „↩ Reste ins Laden-Lager“).
- **Beet:** säen → 30 Minuten wachsen → ernten, von Hand. **Lagerhaus** (2 × 1): 3 Fächer × 50, Puffer und Zusatzlager, von Hand befüllen. **Versandportal** (1 × 1): schickt alles ins Laden-Lager (in 3D ein Burgtor mit Schimmer).
- **Bauen** geht sofort und kostet Waren aus dem Laden-Lager, kein Gold; Abreißen gibt sie zurück, Verschieben und Drehen kosten nichts. Bauleiste mit den Reitern Holz, Stein, Eisen, Erde, Werkstatt (höchstens 4 Gebäude je Reiter), dazu immer Förderband, Lagerhaus, Portal, „✥ Verschieben“ (Bereich markieren, als Ganzes verschieben, drehen oder abreißen) und Abreißen.

## 5. Wirtschaft und Fortschritt

- **Feste Preise:** Ein Holzblock bringt 1 Gold, ein Zirkel 662; jede Stufe bringt rund 20 % mehr als ihre Zutaten.
- **Laden** („⚖️ Laden“: Lager, Theken, Händler): Laden-Lager 500 Plätze bis Level 3, 1.000 ab Level 4, ab Level 7 vergrößerbar bis 2.000. Theken von Hand bestücken; 2 Theken zum Start, Theke 3–5 für 15.000 / 35.000 / 70.000 Gold, die 6. ab Level 13 für 150.000. Jeder Kunde kauft 1 Stück; je Theke kommt auf Level 1–3 alle 15 Sekunden einer, auf Level 4–6 alle 25–45, ab Level 7 alle 45–60. Beim Händler gibt es nur Rohstoffe und Samen.
- **Start:** 500 Gold Startkapital, 1 Holzstamm, 20 Holzblöcke. **Pleiteschutz:** Wer nichts mehr hat, bekommt einen Holzstamm geschenkt.
- **Laden-Level 1–13:** Es gibt immer genau einen Auftrag eines Bewohners; „✓ Abgeben“ gibt Erfahrung und Gold. Die Erfahrung eines Levels reicht genau für den Aufstieg, der Gold kostet (ab Level 11 deutlich mehr); bis Level 10 gibt es dazu einen Rohstoff. Bis v1.0 gibt es den Test-Knopf „🧪 Test: Auftrag erledigen“.
