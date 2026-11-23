# Technik

Wie das Spiel gebaut ist. Nur lesen, wenn programmiert wird; die Arbeitsregeln stehen in `CLAUDE.md`. Die alte Langfassung mit allen Einzelheiten je Datei und Test (bis v0.36.2) steht in `docs/archiv/TECHNIK-LANGFASSUNG.md`; was sich wann geändert hat, in `docs/archiv/VERSIONEN.md`.

## Grundsätze

- **Browser-Spiel** (HTML, JavaScript, Canvas, three.js für 3D), **kein Build-Schritt:** Der Browser lädt die Dateien direkt. GitHub Pages veröffentlicht `main` aus dem Hauptordner (`.nojekyll` schaltet die Umwandlung durch GitHub ab). Nach einem Merge dauert es einige Minuten, bis die neue Version online ist (Zwischenspeicher bis 10 Minuten).
- **Spielregeln getrennt von der Darstellung:** `src/core/` kennt keine Grafik – testbar, später auch auf einem Server lauffähig. Inhalte stehen nur in den Datentabellen (`src/core/data/`), neue Inhalte sind neue Zeilen.
- **Simulation in festen Takten** (`src/core/sim.js`). Verpasste Zeit wird beim Öffnen und beim Zurückkommen nachgerechnet: Takt für Takt, bis die Fabrik stillsteht, danach nur noch die Kunden im Schnelldurchlauf; in Portionen mit Anzeige „⏩ Die Fabrik holt die Zeit nach …“; währenddessen wird nicht gespeichert. Ein Takt kostet etwa 0,2 ms (voll bebaute Fläche) – der Engpass ist das Zeichnen.
- **Zwei Ansichten, dieselbe Oberfläche:** `src/main.js` verbindet Spielregeln, Oberfläche (`src/ui/`) und einen Zeichner. `index.html` zeigt seit v0.38.0 den 3D-Test: `main.js` lädt die 3D-Ansicht nach (`await import('./view3d/view3d.js')`); mit `?ansicht=2d` zeigt es die echte Fabrik in 2D (`src/view2d/`) und lädt three.js nicht. Die 3D-Ansicht bietet dem Spiel dasselbe wie der 2D-Zeichner (`resize`, `draw(state, camera, ui)`, `clearCache`); die Steuerung (`src/ui/controller.js`) fragt in 3D die 3D-Kamera, welches Feld unter dem Finger liegt (`tileAt`), und verschiebt über sie (`panScreen`).
- **Zwei Spielstände:** die echte Fabrik unter `erstesspiel-spielstand`, der 3D-Test unter `erstesspiel-spielstand-3d-test` (`useSaveSlot` in `src/ui/storage.js`). Spielstand-Format in `src/core/save.js` (bei Änderungen `SAVE_VERSION` erhöhen und alte Spielstände umwandeln); als Datei sichern und laden in `src/ui/backup.js` (Endung `.txt`, weil Chrome auf Android `.json` nicht teilt).
- **3D mit Kenneys Modellen** (CC0, www.kenney.nl): nur die gebrauchten `.glb`-Dateien liegen in `assets/kenney/<Paket>/` (je mit `Textures/colormap.png` und `License.txt`), welche, steht in `MODELS` (`src/view3d/kenneyParts.js`); ein Test prüft beides. Alle Modelle eines Pakets färben sich über eine gemeinsame Farbtafel (16 Spalten × 4 Bänder); für die Farben des Spiels und die Holz-Bänder malt `recolorPixels` einzelne Felder nach. kenney.nl lässt keine automatischen Downloads zu – Tobias lädt Pakete selbst herunter und auf GitHub hoch. Die 3D-Welt wird nicht in jedem Bild neu gebaut: Gebäude, Band-Felder, Boden und Schilder werden nur ersetzt, wenn sich an ihnen etwas ändert. **Wenige Zeichenaufrufe** (v0.40.0, `merge.js`): Jedes Haus und die Pfeile je Gebäude werden beim Bauen zu einem Teil je Material zusammengefügt (was sich bewegt – Wasserrad, Schimmer – bleibt für sich); alle Bänder, alle Pfeile aller Gebäude sowie Zaun, Bäume und Felsen sind je ein Teil, neu zusammengefügt nur bei Änderungen; Waren und Funken sind `InstancedMesh` je Sorte, ohne Schatten; Markierungen und Felder `flatRects`. Von weitem (`SIGN_FAR`, abhängig von der Bildschirmhöhe) statt der Schilder ein `Points`-Teil mit Statuslichtern. Gemessen (Belastungstest, `drawCalls()`): herausgezoomt etwa 730, nah etwa 450 Zeichenaufrufe je Bild (vorher bis 6.200); ein Browser-Test prüft < 1.000.
- **three.js** liegt unverändert in `vendor/three-0.187.0/` (MIT, Version im Ordnernamen, ohne `?v=`).
- **Versionsnummer an jeder Datei:** Die Import-Map in `index.html` hängt an jede Programmdatei `?v=<Version>`, damit der Browser nie alte und neue Dateien mischt. `node tools/set-version.mjs A.B.C` schreibt Version und Import-Map (ohne Zahl: nur die Import-Map, z. B. nach einer neuen Datei); ein Test prüft das.
- **Startet das Spiel nicht,** erscheint eine Meldung mit dem Fehlertext statt eines schwarzen Bildschirms.

## Projektstruktur

| Pfad | Inhalt |
|---|---|
| `CLAUDE.md`, `README.md` | Arbeitsregeln für Claude; kurze Startseite mit Link zum Spielen |
| `docs/STAND.md`, `docs/SPIEL.md` | Wo wir stehen; das Spiel kurz (zu Beginn jedes Chats) |
| `docs/inhalte/` | Einzelheiten zum Spiel: `LEVEL.md`, `GEBAEUDE.md`, `WAREN.md`, `BEDIENUNG.md`, `AUSBLICK.md`; `ZAHLEN.md` wird von `tools/zahlen.mjs` geschrieben |
| `docs/TECHNIK.md` | Diese Datei |
| `docs/archiv/` | Verlauf: Entscheidungen, Versionen, Gespräche, Pläne, Konzept, Langfassungen von Stand, Spiel und Technik bis v0.36.2 – nur durchsuchen |
| `index.html` | Gerüst der Oberfläche, Import-Map (Spieldateien mit `?v=`, dazu three.js) |
| `manifest.webmanifest`, `assets/icons/` | „Zum Startbildschirm hinzufügen“ (Name, Symbol, Vollbild, Querformat); Symbole aus `tools/make-icons.py` |
| `assets/kenney/` | Kenneys Modelle für den 3D-Test (Fantasy Town Kit, Castle Kit, die Bänder aus dem Factory Kit) |
| `vendor/` | three.js mit `GLTFLoader` und seinen Hilfsdateien; `vendor/README.md` |
| `src/version.js`, `src/main.js`, `src/style.css` | Versionsnummer; Verbindung von Regeln, Oberfläche und Zeichner (Spielschleife, Speichern, Menü, Nachrechnen); Aussehen der Oberfläche (am Ende die Regeln für schmale Handys unter 820 px) |
| **`src/core/` – Logik** | |
| `core/data/buildings.js` | Gebäude (Größe, Anschlüsse, Farbe, Tipp, Produktion), Reiter der Bauleiste (`BUILD_TABS`, höchstens 4 je Reiter; `BUILD_ALWAYS`), Farbe je Reiter (`TAB_COLORS`) |
| `core/data/items.js`, `core/data/recipes.js` | Waren (Name, Preis, Aussehen); Rezepte (Zutaten, Ergebnis, Zeit, evtl. eigenes Level) |
| `core/data/shop.js` | Laden-Lager, Theken (Plätze, Tempo `customerSeconds` je Level, `COUNTERS`), Startkapital `START_GOLD`, Startvorrat, Testpaket, `STORAGE_UPGRADE` |
| `core/data/levels.js`, `core/data/land.js`, `core/data/offline.js` | Laden-Level (Geschichte, Aufträge, Aufstieg, Geschenk, `QUEST_TEST_SKIP`); Fläche kaufen (`LAND_MORE` ab Level 10); Grenzen für das Nachrechnen |
| `core/state.js`, `dirs.js`, `geometry.js` | Spielzustand und Raster; Himmelsrichtungen; Größe, Drehung, Felder und Anschlüsse von Gebäuden |
| `core/buildings.js`, `belts.js`, `area.js` | Gebäude bauen, verschieben, drehen, abreißen; Förderbänder legen, aufteilen, zusammenführen, Strecke und Zulauf leeren; Bereich markieren und als Ganzes bewegen, Bereich kopieren (`planAreaCopy`, `copyArea`: alles oder nichts) |
| `core/production.js`, `warehouse.js`, `sim.js` | Was Gebäude tun (einlegen, herstellen, wachsen, versenden, Status); Lagerhaus und Laden-Lager; Takte, Waren auf Bändern, Stau |
| `core/shop.js`, `market.js` | Laden-Lager, Baukosten, Theken-Tempo je Level, Lager vergrößern; Händler, Theken, Kunden (eigener Zufall im Spielstand), Theken kaufen, Pleiteschutz, Testpaket, Auffüllen, Säen |
| `core/levels.js`, `quests.js`, `land.js` | Freischalten, Aufstieg, Rezepte mit eigenem Level; Aufträge und Belohnung, Test-Knopf; Fläche je Level und Preis je Streifen |
| `core/belastungstest.js` | Belastungstest: voll bebaute Fläche (Level 13, 46 × 38, 52 Straßen) nach den echten Regeln; `main.js` zeigt sie unter `?belastungstest=1` mit eigenem Speicherplatz (`STRESS_SLOT`) und speichert nie |
| `core/offline.js`, `save.js` | Verpasste Zeit nachrechnen, Bericht „Willkommen zurück“; Spielstand in Text umwandeln, prüfen, alte Formate umwandeln (Format 18) |
| **`src/ui/` – Oberfläche (2D und 3D)** | |
| `ui/controller.js`, `input.js`, `press.js` | Modi (Ansehen, Bauen, Band, Abreißen, Bereich) und was Gesten und Tasten darin tun; Touch, Maus, Mausrad, zwei Finger (auch drehen); Knöpfe reagieren aufs Loslassen (`onPress`) |
| `ui/hud.js`, `buildbar.js`, `panels.js` | Obere Leiste (Gold, Laden-Level, Bilder pro Sekunde) und Menü ☰; Bauleiste mit Reitern und Werkzeugen; Infofenster, große Fenster, Rückfragen, Meldungen |
| `ui/buildingInfo.js`, `buildingFace.js` | Inhalt des Infofensters mit Warenbildern; was ein Gebäude anzeigt (Produkt, Ring, „?“, Vorrat) – reine Abfrage für 2D und 3D |
| `ui/shop.js`, `warehouse.js`, `levels.js`, `offline.js` | Laden-Fenster (Lager, Theken, Händler); Lagerhaus befüllen; Level-Fenster (Aufträge, Ort & Level, `unlockText`); Nachrechnen und „Willkommen zurück“ |
| `ui/itemArt.js`, `format.js` | Aussehen der Waren (Warenbilder, auch für die 3D-Schilder); Texte für Zahlen, Waren, Kosten, Zeiten |
| `ui/storage.js`, `backup.js` | Speichern im Browser, eigener Spielstand für den 3D-Test; Spielstand als Datei sichern und laden |
| **`src/view3d/` – 3D-Grafik** | |
| `view3d/view3d.js`, `camera3d.js` | Lädt die Modelle, baut Zeichner, Welt und Kamera; frei drehbare Kamera (Neigung mit dem Zoom, `tileAt`, `panBy`, `zoomAt`, `rotate`, `fitRect`) |
| `view3d/scene3d.js` | Die Fabrik als 3D-Welt: Licht und Schatten, Boden, Zaun, Bäume, Gebäude mit Pfeilen und schwebendem Schild, Bänder, Waren, Vorschau beim Bauen, Bereich markieren (`syncArea`), Fläche kaufen (`syncLand`); Abfragen für den Browser-Test |
| `view3d/merge.js` | Teile je Material zusammenfügen (`mergeMeshes`, `mergeStatic`, `disposeMerged`) und viele flache Rechtecke als ein Teil (`flatRects`) |
| `view3d/kenney3d.js`, `kenneyParts.js`, `models.js` | Häuser aus Kenneys Teilen (eigene für Holzfällerlager, Sägewerk, Ofen, Schmiede, Lagerhaus, Portal als Burgtor mit Schimmer, seit v0.42.0/v0.43.0 für alle übrigen Gebäude mit bewegten Teilen `parts.spin`/`swing`/`sway`/`dustSpot`; einfache Formen mit gemeinsamem Material `plain`; ohne eigenes Haus ein Steinhaus), Band-Felder; Modell-Liste, Farbtafeln, Band-Stücke (ohne three.js, in node testbar); Laden der Modelle und Materialien |
| **`src/view2d/` – 2D-Grafik (hinten angestellt)** | |
| `view2d/renderer.js`, `camera.js` | Zeichnet die Draufsicht (nur, was im Bild ist; Warenbilder zwischengespeichert); 2D-Kamera (verschieben, zoomen, sichtbarer Ausschnitt; `TILE` nutzt auch die Steuerung) |
| `tools/set-version.mjs` | Versionsnummer und Import-Map setzen (`THREE_IMPORTS` für three.js) |
| `tools/zahlen.mjs` | Rechenwerkzeug: liest die Datentabellen und schreibt `docs/inhalte/ZAHLEN.md` (je Level Aufträge, Rohstoffe, Maschinenzeit, Engpass, Aufstieg, Theken, neue Gebäude; je Ware Wert, Rohstoffe, Aufschlag, Gold je Stunde). Nach jeder Änderung an Waren, Rezepten, Gebäuden, Leveln oder Laden: `node tools/zahlen.mjs` |

## Tests

- **`npm test`** (node, `tests/*.test.js`): Spielregeln und Datentabellen je Bereich – Grundlagen (`state`, `buildings`, `belts`, `sim`, `area`, `kopieren`, `warehouse`, `market`, `combo`, `theken`, `lager`, `land`, `levels`, `quests`, `offline`, `save`, `sichern`), je Kapitel (`garden` Level 7, `kraeutergarten` 8, `schreibstube` 9, `spital` 10, `uhrmacherei` 11, `apotheke` 12, `glashuette` 13, `tinktur` 14), Oberfläche ohne Browser (`bauleiste`, `camera`, `infofenster`, `karte`), 3D (`dreid`: eigener Spielstand, Menü, Burgtor; `modelle3d`: Kenneys Modelle, Farbtafeln, Band-Stücke, three.js nur im 3D-Test), `zahlen` (Rechenwerkzeug an Beispielen, `ZAHLEN.md` passt zu den Tabellen), `belastungstest` (volle Fläche, läuft, wird nie gespeichert) und `version` (Versionsnummer, Import-Map, Größe der Doku).
- **Browser-Test** (Playwright, Tablet 1280 × 800 und Handy 844 × 390 im Querformat): `tests/browser/smoke.cjs` startet `helpers.cjs` (Webserver, Geräte, `check`, Felder antippen und wischen, Infofenster auslesen), `spiel2d.cjs` (die echte Fabrik: Bauleiste, Bauen, Bänder, Fläche, Bereiche, Speichern, Laden, Theken, Aufträge und Aufstiege bis Level 14 (Zimmerei und Apotheke mit 4 Einstellungen), Hochformat, schmales Handy 740 × 360) und `spiel3d.cjs` (der 3D-Test: eigener Spielstand, Modelle, Bauen, Bänder, Kamera, Abreißen, Bereich markieren und kopieren, Bauleiste schließt beim Antippen der Karte, die eigenen Häuser bis Level 12 mit bewegten Teilen (`__game.place`, `view3d.motion`), Fläche kaufen, Belastungstest mit Zeichenaufrufen und Statuslichtern von weitem, Bäume außerhalb der Welt, zurück zur echten Fabrik). Prüfungen nutzen `window.__game.simulate(sekunden)` statt echter Zeit; Gebäude in der Bauleiste über `tapBuild(page, typ)`.

## Prüfen vor jedem Merge

`npm test` und `SCREENSHOT_DIR=<Scratchpad>/shots npm run test:browser`, danach die Screenshots ansehen. `ONLY=3d` davor prüft nur den 3D-Test, `ONLY=2d` nur die echte Fabrik (schneller beim Entwickeln; vor dem Merge den ganzen Test).
