# Technik

Wie das Spiel gebaut ist. Nur lesen, wenn programmiert wird; die Arbeitsregeln dazu stehen in `CLAUDE.md`.

## Grundsätze

- **Browser-Spiel** (HTML, JavaScript, Canvas). Es läuft auf Handy, Tablet und PC, ohne Installation.
- **Live über GitHub Pages:** ein einziger Link, nach jedem Merge aktuell.
- **Spielregeln getrennt von der Darstellung.** Die Simulation (Produktion, Förderbänder, Preise) kennt keine Grafik. Vorteile:
  - Die Regeln lassen sich automatisch testen.
  - Der gleiche Code kann später auf einem Server laufen (Online-Teil).
  - Die Grafik lässt sich austauschen, z. B. später eine Schrägansicht wie in Clash of Clans.
- **Inhalte als Datentabellen:** Waren, Rezepte, Gebäude und Preise stehen in Tabellen. Neue Inhalte sind neue Zeilen.
- **Simulation in festen Takten.** Verpasste Zeit wird beim Öffnen (und beim Zurückkommen aus dem Hintergrund) nachgerechnet (seit v0.14.0): Die Fabrik rechnet Takt für Takt wie im laufenden Spiel, bis sie stillsteht; danach kaufen nur noch die Kunden ein, das geht im Schnelldurchlauf. Gerechnet wird in Portionen, damit der Bildschirm nicht einfriert; dauert es länger, erscheint „⏩ Die Fabrik holt die Zeit nach …“ mit Fortschritt. Während des Nachrechnens wird nicht gespeichert. Gemessen: eine Fabrik mit 9 Holz-Linien braucht für 8 Stunden Abwesenheit gut 1 Sekunde (auf dem Tablet etwas mehr).
- **Belastungstest (v0.20.2, voll bebaute Fläche 38 × 30):** Ein Takt kostet etwa 0,2 Millisekunden – das Rechnen ist unkritisch. Der Engpass ist das Zeichnen: 18 bis 21 Millisekunden je Bild (Testrechner ohne Grafikchip), weil in jedem Bild alle Gebäude und Bänder gezeichnet werden, auch die außerhalb des Bildes. Einzelheiten und mögliche Verbesserungen in `docs/archiv/PLAENE.md`.
- **Spielstand** wird im Browser gespeichert, später auf dem Server.
- **Später als App:** Das Web-Spiel wird in eine App verpackt (z. B. mit Capacitor), oder wir steigen auf eine Engine um. Entscheidung in M7.
- **Kein Build-Schritt:** Der Browser lädt die Dateien direkt. GitHub Pages veröffentlicht `main` aus dem Hauptordner (`/ (root)`), die Datei `.nojekyll` schaltet die Umwandlung durch GitHub ab.
- **Zwischenspeicher:** GitHub Pages lässt Browser Dateien bis zu 10 Minuten zwischenspeichern. Nach einem Merge dauert es einige Minuten, bis die neue Version online ist. Zeigt das Spiel oben noch die alte Versionsnummer, kurz warten und neu laden.
- **Versionsnummer an jeder Datei (seit v0.7.1):** Eine Import-Map in `index.html` hängt an jede Programmdatei `?v=<Version>`. So lädt der Browser nach einem Update alle Dateien neu und mischt nie alte mit neuen (das hatte v0.7.0 am Start gehindert). `node tools/set-version.mjs A.B.C` schreibt die Map; ein Test prüft, dass keine Datei fehlt.
- **Startet das Spiel nicht,** erscheint eine Meldung mit dem Fehlertext statt eines schwarzen Bildschirms.

## Projektstruktur

| Pfad | Inhalt |
|---|---|
| `README.md` | Kurze Startseite des Projekts mit Link zum Spielen und Wegweiser zu den Doku-Dateien |
| `CLAUDE.md` | Arbeitsregeln für Claude (wird in jedem Chat automatisch geladen) |
| `docs/STAND.md` | Wo wir stehen: Version, nächster Schritt, offene Fragen, die letzten 3 Arbeitsschritte |
| `docs/SPIEL.md` | Das Spiel, wie es heute ist (Konzept, Gebäude, Waren, Rezepte, Level) |
| `docs/TECHNIK.md` | Diese Datei: Technik und Projektstruktur |
| `docs/archiv/` | Vollständiger Verlauf: Entscheidungen, Versionen, Gespräche, Pläne je Version, Konzept mit Verlauf |
| `index.html` | Startseite des Spiels (Gerüst der Oberfläche) |
| `manifest.webmanifest` | Angaben für „Zum Startbildschirm hinzufügen“ (Name, Symbol, Vollbild, Querformat) |
| `src/version.js` | Versionsnummer, wird im Spiel angezeigt |
| `src/main.js` | Verbindet Spielregeln, Kamera, Eingabe und Anzeige |
| `src/core/` | Spielregeln und Spielzustand, ohne Grafik |
| `src/core/data/buildings.js` | Datentabelle der Gebäude (Größe, Ein- und Ausgänge, kurzer Tipp fürs Infofenster, Produktion) und Einteilung der Bauleiste: Reiter mit ihren Gebäuden (`BUILD_TABS`) und was immer sichtbar ist (`BUILD_ALWAYS`, v0.18.0) |
| `src/core/data/items.js` | Datentabelle der Waren (Name, Preise, Aussehen) |
| `src/core/data/recipes.js` | Datentabelle der Rezepte (Zutaten, Ergebnis, Zeit) |
| `src/core/data/shop.js` | Laden: Lagergröße und Theken je Level, Kunden-Takt, Startvorrat, Testpaket |
| `src/core/data/levels.js` | Laden-Level: Bauabschnitt des Ortes, Geschichte, Aufträge der Bewohner, Preis des Aufstiegs, Gratis-Rohstoff; Belohnungs-Regel der Aufträge; Test-Knopf an/aus (`QUEST_TEST_SKIP`, v0.15.0) (was ein Level freischaltet, steht als `level` bei Gebäuden und Rohstoffen) |
| `src/core/data/land.js` | Fläche kaufen: Streifentiefe, Käufe je Seite, Preis je Streifen |
| `src/core/data/offline.js` | Spiel im Hintergrund (v0.14.0): ab wann nachgerechnet wird, Grenzen, ab wann Meldung bzw. Fenster „Willkommen zurück“ |
| `src/core/state.js` | Spielzustand anlegen, Größe von Grundstück und Welt, Abfragen auf dem Raster |
| `src/core/dirs.js` | Himmelsrichtungen (oben, rechts, unten, links) |
| `src/core/geometry.js` | Größe, Drehung, Felder sowie Ein- und Ausgänge von Gebäuden |
| `src/core/buildings.js` | Gebäude bauen, verschieben, drehen, abreißen, freie Stelle suchen |
| `src/core/belts.js` | Förderbänder legen, aufteilen, zusammenführen, drehen, abreißen; Strecke finden und leeren, Zulauf leeren (v0.12.0) |
| `src/core/area.js` | Bereich markieren und alles darin verschieben, drehen oder abreißen (v0.11.0) |
| `src/core/production.js` | Was Gebäude tun: einlegen (seit v0.17.0 mehrere Rohstoffe je Gebäude, z. B. Erntebank), herstellen, zwischenlagern, versenden, wachsen lassen (Beet: säen, ernten, v0.16.0), Status |
| `src/core/warehouse.js` | Lagerhaus und Laden-Lager (v0.12.0): befüllen, ausräumen (Nachschub seit v0.14.0 entfernt) |
| `src/core/offline.js` | Spiel im Hintergrund (v0.14.0): verpasste Zeit nachrechnen (in Portionen, Stillstand erkennen, dann nur Kunden), Bericht „Willkommen zurück“ |
| `src/core/sim.js` | Simulation in festen Takten: Waren auf Bändern, Stau, Aufteilen, Zusammenführen |
| `src/core/shop.js` | Laden-Lager, Baukosten bezahlen und zurückgeben |
| `src/core/market.js` | Handel: Händler, Theken, Kunden (mit eigenem Zufall im Spielstand), Pleiteschutz, Testpaket, „Auffüllen“ der Rohstoff-Gebäude (v0.14.0), „Säen“ mit Kauf des Samens (v0.16.0) |
| `src/core/levels.js` | Laden-Level: was freigeschaltet ist, hergestellte Waren zählen, aufsteigen (Erfahrung und Gold) |
| `src/core/quests.js` | Aufträge der Bewohner (v0.13.0): aktueller Auftrag, Belohnung, abgeben, Erfahrung je Level; Test-Knopf „Auftrag erledigen“ (v0.15.0) |
| `src/core/land.js` | Fläche kaufen: Streifen und Preis je Seite, wie oft noch, Kauf, welche Seite ein Feld der gesperrten Fläche ist |
| `src/core/save.js` | Spielstand in Text umwandeln, prüfen und alte Spielstände umwandeln (Format 15 seit v0.20.0: Versandportale merken sich die zuletzt angekommenen Waren, `prod.recent`) |
| `src/view/camera.js` | Kamera: verschieben, zoomen, Bildschirm ↔ Welt umrechnen; unten Platz, damit die unterste Reihe über die Bauleiste passt (v0.18.0) |
| `src/view/input.js` | Touch, Maus und Mausrad (Antippen, Ziehen, zwei Finger) |
| `src/view/controller.js` | Modi (Ansehen, Bauleiste, Platzieren, Förderband, Abreißen, Bereich markieren und verschieben) und was Gesten und die Taste R darin tun |
| `src/view/renderer.js` | Zeichnet Spielfeld, Bänder, Waren, Gebäude mit Statuslicht, Vorschau |
| `src/view/itemArt.js` | Aussehen der Waren (auf dem Band und in Listen); kleine Warenbilder lassen sich neu zeichnen |
| `src/view/hud.js` | Obere Leiste (Gold, Knopf „Laden-Level“ mit kleiner Erfahrungsleiste, ⬆ und ❗) und Menü ☰ |
| `src/view/panels.js` | Infofenster (seit v0.19.0 mit Bereich für Warenbilder, kleiner Knopfzeile unten und kurzem Tipp), großes Fenster, Rückfragen, Meldungen |
| `src/view/buildingInfo.js` | Inhalt des Infofensters mit Warenbildern (v0.19.0): Maschinen „Stellt gerade her“ und „Umstellen auf“, Rohstoff-Gebäude mit Vorrat; seit v0.20.0 auch Beet (Samen → Pflanze mit Wachstumsbalken), Lagerhaus (Fächer mit Füllbalken) und Versandportal (zuletzt angekommene Waren → Laden-Lager mit Füllstand); wird einmal gebaut und danach nur aktualisiert |
| `src/view/shop.js` | Laden-Fenster mit den Reitern Lager, Theken, Händler |
| `src/view/warehouse.js` | Lagerhaus-Fenster (v0.12.0): Ware wählen, dann Menge (Befüllen) |
| `src/view/offline.js` | Spiel im Hintergrund (v0.14.0): Hinweis „Die Fabrik holt die Zeit nach …“ und Fenster „Willkommen zurück“ |
| `src/view/levels.js` | Level-Fenster mit den Reitern „📜 Aufträge“ (Geschichte, Erfahrungsleiste, Auftrag mit „Abgeben“ und Test-Knopf, Aufstieg) und „🏘️ Ort & Level“ (alle Bauabschnitte) |
| `src/view/format.js` | Texte für Zahlen, Waren und Kosten |
| `src/view/buildbar.js` | Untere Leisten: Laden/Bauen, Bauleiste (seit v0.18.0 mit Reitern und den Werkzeugen links; misst, wie hoch sie ist, und setzt die Meldungen darüber), Werkzeugleiste |
| `src/view/press.js` | Knöpfe reagieren aufs Loslassen des Fingers (siehe Entscheidungen) |
| `src/view/storage.js` | Speichern und Laden im Browser |
| `src/style.css` | Aussehen der Oberfläche |
| `assets/icons/` | App-Symbole (erzeugt mit `tools/make-icons.py`) |
| `tools/set-version.mjs` | Setzt die Versionsnummer in `src/version.js` und `index.html` (inkl. Import-Map) |
| `tests/*.test.js` | Automatische Tests: Spielregeln, Gebäude, Förderbänder, Handel, Level, Fläche, Speichern, Kamera, Versionsnummer, Kombi-Maschinen und Theken (`combo.test.js`), Bereiche verschieben (`area.test.js`), Lagerhaus befüllen und Bänder leeren (`warehouse.test.js`), Aufträge, neue Warennamen und Test-Knopf (`quests.test.js`), Spiel im Hintergrund, Rohstoff-Vorrat und Auffüllen (`offline.test.js`), Beet, Flachs-Kette und Level 7 (`garden.test.js`), Ringelblume, Erntebank, Kräuterstube und Level 8 (`kraeutergarten.test.js`), Reiter der Bauleiste und Platz unter der Karte (`bauleiste.test.js`), Infofenster: Reiter „Erde“, kurze Tipps, Warenbilder für alle Rezepte, Vorrat der Reihe nach, hat / braucht; seit v0.20.0 die zuletzt versendeten Waren des Versandportals, Status von Portal und Lagerhaus, Spielstand-Format 15 (`infofenster.test.js`) |
| `tests/browser/smoke.cjs` | Browser-Test in Tablet- und Handygröße: spielt die Bauleiste mit Reitern (Reiter wechseln, Werkzeuge immer da, alles passt auf den Bildschirm, Reiter bleibt gemerkt, unterste Reihe über die Leiste schieben, Meldung über der Leiste), Bauen, Bänder, Fläche kaufen (bis eine Seite fertig ist), Abreißen, Bereich markieren/verschieben/drehen (auch mit Taste R)/abreißen, Speichern, Neues Spiel, Theken mit Mengenwahl, Aufträge abgeben und Aufsteigen bis Level 6 (mit Reiter „Ort & Level“), Test-Knopf „Auftrag erledigen“ (Stadttor-Aufträge ohne Waren und Gold), Aufstieg auf Level 7 mit Beet (säen, reif, ernten), Erntebank und Webstube, Aufstieg auf Level 8 mit Ringelblume, gemischtem Vorrat in der Erntebank und Kräuterstube, die Eisen-Kette, die Zimmerei, Strecke und Zulauf leeren, Lagerhaus befüllen und ausräumen (kein Nachschub), Auffüllen des Holzfällerlagers sowie das Spiel im Hintergrund (20 Minuten weg in der App, 2 Stunden mit geschlossenem Spiel → Fenster „Willkommen zurück“ mit reifem Beet) per Touch durch; prüft, dass die Warenbilder der Bauleiste nach dem Wegwerfen wieder erscheinen; seit v0.19.0 das Infofenster mit Warenbildern (grüner Kasten mit hat / braucht, Umstellen per Tippen, Vorrat als Bilder, Knopfzeile unten, kurzer Tipp) und dass nichts aus dem Fenster oder dem grünen Kasten ragt; seit v0.20.0 Beet (Kasten leer / wächst / reif, Säen-Knopf mit Samenbild), Lagerhaus (Fächer mit Menge, volles Fach, gemischt, leer) und Versandportal (zuletzt angekommen, Laden-Lager voll) |

## Prüfen vor jedem Merge

`npm test` (Spielregeln) und `SCREENSHOT_DIR=<Scratchpad>/shots npm run test:browser` (Browser-Test in Tablet- und Handygröße, danach die Screenshots ansehen).
