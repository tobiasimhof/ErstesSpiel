# Versionshistorie

> **Archiv.** Wörtlich übernommen aus der README bis v0.18.0 (Abschnitt 9). Hier wird nur gesucht, nicht zu Beginn eines Chats gelesen. Verweise wie „Abschnitt 4.2“ oder „offene Frage 12“ beziehen sich auf die alte README: Abschnitte 3, 4 und 8 stehen in `KONZEPT-VERLAUF.md`, 6 in `PLAENE.md`, 7 in `ENTSCHEIDUNGEN.md`, 9 in `VERSIONEN.md`, 10 in `GESPRAECHE.md`. Den aktuellen Stand beschreiben `docs/SPIEL.md` und `docs/STAND.md`.

Neueste Version oben. Je Version: vorgenommen, Fragen, gemacht, geprüft.

### v0.54.1 – Entwurf Level 15 „Der alte Magier“ (25.11.2026, nur Doku)

**Vorgenommen:**
- Tobias' Rückmeldung zu v0.54.0 festhalten (Herauszoomen „bisher okay“, mit Level 15 wieder prüfen) und, wie vereinbart, Level 15 zuerst als Entwurf mit Zahlen vorlegen („deswegen können wir gerne mit level 15 anfangen“).

**Fragen, die wir uns gestellt haben:**
- Wie viel Holzkohle frisst das Feuer? → 5 je Trank, das Feuerfach fasst 100 (20 Tränke); ein Ofen macht 400 Holzkohle pro Stunde, genug für etwa 80 Tränke.
- Wie viele Kamillenblüten im Traumtrank? → 3: Mit 5 wäre die Kamille ein noch stärkerer Engpass, und eine Straße brächte weniger als die Tinktur.
- Reichen die neuen Ausgaben fürs Gold? → Level 15 bringt 55.000 Gold neue Ausgaben (Fläche, Aufstieg); ob mehr nötig ist, hängt von Tobias' Stand ab – Idee „Zauber des Magiers“ als eigener Schritt.

**Gemacht:**
- `PLAENE.md`: „Entwurf v0.55.0 – Level 15 …“ mit Zahlen aus dem Rechenwerkzeug (an einer Kopie der Daten gerechnet, das Feuer als dritte Zutat). `STAND.md` (Version, nächster Schritt, offene Frage 16, letzte 3 Arbeitsschritte), `GESPRAECHE.md`, `ENTSCHEIDUNGEN.md`. Versionsnummer 0.54.1. Das Spiel ist unverändert.

**Geprüft:**
- `npm test` (Versionsnummer, Import-Map, Größe der Doku).

### v0.54.0 – Ein Spiel: die 2D-Welt ist entfernt (25.11.2026)

**Vorgenommen:**
- Die 2D-Welt löschen (Tobias, Chat 31: „weil ich sie gar nicht mehr spiele und das 3D game, das eigentliche Game geworden ist“; kein Andenken nötig; nach v0.53.0: „Du kannst gerne mit dem nächsten Schritt anfangen“).

**Fragen, die wir uns gestellt haben:**
- Wo liegt der Spielstand? → Weiter auf dem Platz des früheren 3D-Tests (`erstesspiel-spielstand-3d-test`, jetzt `GAME_SLOT`) – so bleibt Tobias' Fabrik ohne Umwandlung; Spielstand-Format bleibt 20.
- Was wird aus dem alten 2D-Spielstand? → Er bleibt unberührt unter `erstesspiel-spielstand` liegen und wird nicht mehr geladen. Ginge man auf eine ältere Version zurück, wäre die 2D-Fabrik wieder da.
- Was passiert mit alten Links (`?ansicht=2d`)? → Sie öffnen einfach das Spiel.
- Braucht die 3D-Steuerung noch etwas aus `src/view2d/`? → Nein: Sie fragt die 3D-Kamera (`tileAt`, `panScreen`); `view2d/renderer.js` und `view2d/camera.js` sind gelöscht, ebenso `tests/camera.test.js` und die 2D-Kamera-Prüfungen in `bauleiste.test.js` und `karte.test.js`.
- Wie bleibt geprüft, was nur der 2D-Browser-Test prüfte (Bauleiste, Bauen, Bänder, Fläche, Bereiche, Speichern, Laden, Theken, Aufträge und Aufstiege bis Level 14, Hochformat, schmales Handy)? → Der Test heißt jetzt `fabrik.cjs` und läuft im 3D-Spiel. `tapTile` und `touchDragTiles` (helpers.cjs) tippen über die 3D-Kamera; liegt ein Feld unter einer Leiste, dem Infofenster oder außerhalb, holen sie es erst in die Mitte (`tilesFree`, `showTiles`, `centerOn`). Die 2D-Kamera-Prüfungen sind in 3D nachgebaut (Zoomen = Abstand, Verschieben = Blickpunkt, unterste Reihe über der Bauleiste, rechter Rand neben dem Infofenster). Der Durchspiel-Test läuft in einfacher Pixeldichte – ohne Grafikkarte rechnet der Browser jedes 3D-Bild selbst, in doppelter Auflösung schaffte er etwa 7 Prüfungen pro Minute. Wo der Test von echter Zeit abhing und in 3D länger dauert, legt er nun selbst fest, was er braucht (Holzfällerlager vor dem Testmodus auffüllen, Beet vor den 2 Stunden frisch gesät).
- Was fand der Test in 3D? → Nach dem Aufstieg auf Level 10 (Welt wächst) zoomte die Kamera nur so weit heraus, wie es die alte Welt erlaubte (sie erfuhr die neue Größe erst beim nächsten Bild) – behoben: erst die neue Weltgröße, dann herauszoomen. Und: Die größte Welt (46 × 38) passt in 3D auch ganz herausgezoomt nicht ganz aufs Tablet (oben fehlt ein schmaler Rand; Grenze das 1,35-Fache der Weltgröße) – das ist eine Spielentscheidung, deshalb nicht geändert, sondern offene Frage an Tobias. Geprüft wird stattdessen, wozu das Herauszoomen nach dem Aufstieg da ist: Alle Schilder „＋ Fläche“ sind im Bild.

**Gemacht:**
- `main.js`: immer 3D (`useSaveSlot(GAME_SLOT)`), ohne 2D-Zweige; nach dem Aufstieg mit mehr Fläche erst `setBounds`, dann `fitRect`; `hud.js`: kein Menüpunkt „🗺️ Zur echten Fabrik (2D)“; `controller.js`: nur noch 3D-Kamera; `index.html`: Dreh-Knöpfe immer sichtbar, Hinweis „zoomen und drehen“, ohne `menu-3d`; `style.css`: ohne `.view-3d`; `storage.js`: `GAME_SLOT`; Kommentare ohne „3D-Test“. `src/view2d/` gelöscht, Import-Map neu (62 Dateien).
- Tests: `dreid.test.js` (ein Spiel, alter Spielstand unberührt, kein Wechsel), `belastungstest.test.js`; Browser: `spiel2d.cjs` → `fabrik.cjs` (in 3D), `spiel3d.cjs` (alter 2D-Spielstand unberührt, Menü ohne 2D, `?ansicht=2d` öffnet das Spiel), `einfuehrung.cjs` (ohne 2D-Teil), `smoke.cjs` (`ONLY=fabrik | 3d | einfuehrung`).
- Doku: `CLAUDE.md` (Technische Regeln ohne `src/view2d/`), `README.md`, `SPIEL.md` (Abschnitt 2 „Ein Spiel in 3D“), `BEDIENUNG.md` (Kamera, Schild über jedem Gebäude), `TECHNIK.md`, `STAND.md`, Archiv. Versionsnummer 0.54.0.

**Geprüft:**
- `npm test`: 464 Tests bestanden (12 Tests der 2D-Kamera entfallen).
- Browser-Test, alle Teile bestanden: Durchspielen (`fabrik.cjs`) 950 Prüfungen – Tablet und Handy je 471 wie vorher in 2D, Hochformat, schmales Handy; 3D-Ansicht 208; Einführung 100. Unterwegs gefunden und behoben: die Kamera nach dem Aufstieg auf Level 10 (siehe oben); im Test selbst zu kleine Felder auf dem Handy (die Hilfe zoomt jetzt heran), echte Zeit (Holzfällerlager, Beet, Band) und das Speichern beim Verlassen der Seite. Screenshots angesehen: Menü ohne 2D und mit „Version 0.54.0“, nach dem Aufstieg auf Level 10 alle vier Schilder im Bild, Fabrik auf Level 14 nah und weit.

### v0.53.0 – Feinschliff: Theke in der Einführung, Leiste oben (25.11.2026)

**Vorgenommen:**
- Den Feinschliff aus dem Entwurf umsetzen (Tobias, Chat 31: „Für die Einführung reicht es, wenn bei diesem Schritt einfach 5 sekunden herunterlaufen“; „Dann können oben gerne die Buttons weg, die du vorgeschlagen hast“).

**Fragen, die wir uns gestellt haben:**
- Genau 5 Sekunden oder „frühestens nach 5“? → Genau 5 (Tobias: „es 5 sekunden dauert bis der Block verkauft wird“): Der Kunden-Takt der Theke wird beim Hinlegen auf 5 gesetzt, auch wenn er fast um oder noch lang war.
- Wann gilt das? → Nur in der Einführung eines neuen Spiels (nicht beim Ansehen) und nur bis zum ersten Verkauf; nur beim Hinlegen auf eine leere Theke (Nachlegen verzögert nichts); auch wer vorauseilt und schon vor Schritt 6 etwas hinlegt. Danach kommen die Kunden in ihrem Takt.
- Wie sieht man es? → Hilde: „Der nächste Kunde kommt in 4 s …“ (zählt in ihrem Fenster herunter, „{sekunden}“ in der Datentabelle), auf der Theke „🧑 Nächster Kunde in etwa 4 s“; beim Verkauf „+1“ oben, dann „Dein erstes Gold! …“.
- Wohin mit Version und Vollbild? → Ins Menü ☰: „⛶ Vollbild“ (bzw. „⛶ Vollbild beenden“) nach „🔊 Audio“, ganz unten klein „Version 0.53.0“. Damit das Menü im Testmodus auch auf niedrigen Handys passt, lässt es sich wischen, wenn es nicht ganz aufs Bild passt.

**Gemacht:**
- `core/data/tutorial.js`: `TUTORIAL_FIRST_CUSTOMER_SECONDS = 5`, Hildes Satz mit „{sekunden}“. `core/tutorial.js`: `tutorialFirstCustomer` (5 oder null), `nextStockedCustomerIn` (Sekunden bis zum nächsten Kunden einer bestückten Theke). `core/market.js`: `fillCounter` setzt beim Hinlegen auf eine leere Theke den Takt. `ui/tutorial.js`: Hildes Text zählt in jedem Bild mit.
- `index.html`, `ui/hud.js`, `style.css`: „Vollbild“ und die Versionsnummer aus der Leiste ins Menü, Bilder/s nur im Testmodus und im Belastungstest (`main.js`), Menü mit Höchsthöhe und Wischen.
- Tests: `einfuehrung.test.js` (genau 5 s bei Takt 0,3 und 14, Nachlegen ändert nichts, nach dem ersten Verkauf normal, ohne Einführung und beim Ansehen nichts, Abräumen und neu hinlegen wieder 5 s); Browser: Einführung (Hilde und Theke zählen herunter, nach 2 s noch kein Verkauf, dann Schritt 7), 3D-Test (oben nur Gold, Laden-Level, ☰; Vollbild und Version im Menü), 2D (Version im Menü).
- Doku: `SPIEL.md`, `BEDIENUNG.md`, `TECHNIK.md`, `STAND.md`, Archiv. Versionsnummer 0.53.0. Spielstand-Format bleibt 20.

**Geprüft:**
- `npm test`: 476 Tests bestanden (2 neue zur Theke).
- Browser-Test (Tablet 1280 × 800, Handy 844 × 390, Hochformat, schmales Handy): 1.262 Prüfungen bestanden. Screenshots angesehen: Leiste oben nur Gold, Laden-Level, ☰; Menü mit „⛶ Vollbild“ und „Version 0.53.0“ passt auch auf dem Handy im Testmodus; Hilde und die Theke zählen herunter („Der nächste Kunde kommt in 1 s …“). Danach „5 s“ mit festem Leerzeichen, damit das „s“ nicht allein in die nächste Zeile rutscht – Einführung noch einmal geprüft.

### v0.52.2 – Antworten zur Beratung, Entwurf v0.53.0 und v0.54.0 (25.11.2026, nur Doku)

**Vorgenommen:**
- Tobias' Antworten aus der Beratung festhalten (Chat 31): Weg 1 – zurück zu Logik und Leveln mit dem Feinschliff vorneweg; Theke in der Einführung mit 5 Sekunden; die Anzeigen oben kommen weg; Überlegung, die 2D-Welt ganz zu löschen. Seine 3D-Fabrik steht auf Level 14, alle Aufträge erledigt.

**Fragen, die wir uns gestellt haben:**
- Braucht es neben A (5 Sekunden) noch B (erst zeigen, dann „Weiter ›“)? → Claude empfiehlt jetzt: nein – das Herunterzählen zeigt den Verkauf, Hilde beginnt danach mit „Dein erstes Gold!“. Frage an Tobias.
- 2D-Welt löschen? → Claude: ja, in einer eigenen Version; Tobias' 3D-Fabrik bleibt unverändert, seine 2D-Fabrik bleibt unsichtbar im Browser liegen; was der Browser-Test nur in 2D prüft, zieht ins 3D-Spiel um.

**Gemacht:**
- `PLAENE.md`: „Entwurf v0.53.0 und v0.54.0 …“ mit 3 Fragen; die Beratung darunter als beantwortet markiert. `STAND.md`, `SPIEL.md` (Tobias' Level), `GESPRAECHE.md`, `ENTSCHEIDUNGEN.md`. Versionsnummer 0.52.2. Das Spiel ist unverändert.

**Geprüft:**
- `npm test` (Versionsnummer, Import-Map, Größe der Doku).

### v0.52.1 – Tobias' Test von v0.52.0, Durchsicht und Beratung vorbereitet (25.11.2026, nur Doku)

**Vorgenommen:**
- Tobias' Rückmeldung zu v0.52.0 festhalten und seine Bitte erfüllen: „Schau bitte einmal alles durch und lege deine gedanken und antworten in die Doku“ – für eine Beratung im neuen Chat (Design und Grafik oder Logik und Level).

**Fragen, die wir uns gestellt haben:**
- Welcher Schritt war „zu schnell“? → Schritt 6 (Theke): erledigt beim ersten Kauf; der Kunden-Takt jeder Theke (Level 1: 15 Sekunden) läuft auch bei leerer Theke, also kommt der erste Kunde nach 0–15 Sekunden – bei Tobias nach 1. Vorschlag A + B in `PLAENE.md`.
- Was ist noch offen? → Durchsicht von Design (D1–D8), Level (L1–L5) und Aufräumen (A1–A2) mit Aufwand, zwei Wege, Empfehlung, Vorschlag für v1.0, 5 Fragen.

**Gemacht:**
- `PLAENE.md`: „Vorbereitung für den nächsten Chat: Beratung …“. `STAND.md` (Version, Phase, Fahrplan M4, nächster Schritt, letzte 3 Arbeitsschritte), `GESPRAECHE.md`, `ENTSCHEIDUNGEN.md`. Versionsnummer 0.52.1. Das Spiel ist unverändert.

**Geprüft:**
- `npm test` (Versionsnummer, Import-Map, Größe der Doku).

### v0.52.0 – Einführung mit Bürgermeisterin Hilde (24.11.2026)

**Vorgenommen:**
- Den zweiten Teil des Entwurfs aus Chat 29 umsetzen (Tobias, Chat 30: „Bringe dich auf den aktuellen stand und beginne mit v52“): Hildes Einführung in 8 Schritten, jeder überspringbar, ganz beendbar, Erledigen springt weiter.

**Fragen, die wir uns gestellt haben:**
- Woher weiß Hilde, dass ein Schritt erledigt ist? → Handgriffe meldet die Oberfläche als Ereignis („einlegen:holzfaeller“, „verschieben:versandportal“, „laden:lager“, „kaufen:holzstamm“, „level“); was die Fabrik tut, prüft die Logik am Spielstand (ein Portal hat etwas geliefert, ein Kunde hat gekauft). Ereignisse werden gemerkt – wer vorauseilt, wird nicht aufgehalten.
- Was passiert beim Ansehen in Tobias' Fabrik? → Lieferungen und Verkäufe laufen dort ständig; sie zählen beim Ansehen nicht (sonst wären Schritt 4 und 6 sofort vorbei). Ob es ein Ansehen ist, merkt das Spiel daran, dass schon etwas geliefert oder verkauft wurde.
- Worauf zeigt der Pfeil, wenn gerade etwas anderes offen ist? → Je Schritt mehrere Hinweise mit Bedingung („Infofenster des Holzfällerlagers offen“, „Laden mit Reiter Theken“, „Bauleiste offen“ …), der erste passende gilt – alles in der Datentabelle. Ein Browser-Lauf fand dabei: Nach „✓ Fertig“ beim Band ist man in der Bauleiste – Hilde zeigt dann auf ✕.
- Wo steht das Fenster? → In der Ecke, die Ziel und Pfeil nie verdeckt und die Gebäude des Schritts, die Vorschau beim Verschieben und andere Bedienelemente möglichst frei lässt; es gleitet nur weiter, wenn das Ziel darunter rutscht.
- Das Portal direkt an den Ausgang? → Geht (Gebäude geben direkt weiter), dann käme Schritt 4 ohne Band aus. Hilde rät deshalb, 2–3 Felder Platz fürs Band zu lassen; Schritt 4 ist trotzdem erledigt, sobald etwas ankommt.

**Gemacht:**
- Neu: `core/data/tutorial.js` (die Schritte als Daten), `core/tutorial.js` (Stand, Ereignisse, Überspringen, Beenden, von vorn), `ui/tutorial.js` (Fenster, Pfeil als SVG, Ring, Wegklappen), Briefe `tutorialWelcomeLetter` und `tutorialEndLetter` in `ui/letters.js`.
- Spielstand-Format 20 (`state.tutorial`; neue Spiele mit, alte Spielstände ohne, Belastungstest ohne).
- `ui/letter.js`: eigener Knopftext (`okLabel`) und `onRead`. `ui/controller.js`, `ui/shop.js`: `onEvent` (eingelegt, verschoben – auch als Bereich –, Laden-Reiter, gekauft – auch über das Infofenster); Ziele für den Pfeil (`data-item`, `data-buy`, `data-counter-action`). `ui/levels.js`: „🎓 Einführung ansehen“ im Reiter „Ort & Level“. `main.js`: `buildingRect` (2D und 3D), `tutorial.frame()` in jedem Bild, `tutorial.check()` alle 0,4 s, Start nach dem Ladebildschirm. `style.css` (Block v0.52.0; Rückfragen liegen jetzt über Hildes Fenster).
- Tests: neu `tests/einfuehrung.test.js`; Browser: neu `tests/browser/einfuehrung.cjs`, `skipTutorial` in `waitForGame` (beendet die Einführung in allen übrigen Tests), `ONLY=einfuehrung`.
- Doku: `STAND.md`, `SPIEL.md`, `BEDIENUNG.md`, `TECHNIK.md` (gekürzt, damit sie unter der Grenze bleibt), Archiv. Versionsnummer 0.52.0.

**Geprüft:**
- `npm test`: 474 von 474 bestanden (neu: `einfuehrung.test.js` mit 8 Prüfungen).
- Browser-Test (Tablet und Handy): 2D 950, 3D mit Einführung 306 – zusammen 1.256 von 1.256 bestanden. Unterwegs gefunden und behoben: Nach „✓ Fertig“ beim Band zeigt Hilde auf ✕ der Bauleiste (der Test erwartete den Laden-Knopf); auf dem Handy lag „➕ 1 einlegen“ unterhalb des sichtbaren Teils des Infofensters – Hilde schiebt das Ziel jetzt ins Bild und zeigt nur auf sichtbare Knöpfe; beim Band-Ziehen zeigen Pfeil und Ring jetzt auf das Feld vor dem orangen Ausgang statt aufs ganze Haus; zwei Stellen im 2D-Test erwarteten noch Format 19.
- Bildschirmfotos angesehen: Begrüßungsbrief, jeder Schritt auf Tablet und Handy (Fenster verdeckt das Ziel nicht), weggeklappte Hilde am Rand, Abschlussbrief, Rückfrage „Einführung beenden?“, 2D mit Ring ums Holzfällerlager; Start und Aufstieg in 3D ohne Einführung unverändert.

### v0.51.0 – Neuigkeiten als Schriftrolle, keine Erinnerungen mehr (24.11.2026)

**Vorgenommen:**
- Den ersten Teil des Entwurfs umsetzen (Tobias: „Ja, mir gefallen beide Musterbilder gut. Schlicht und einfach.“) und die Erinnerungen entfernen („Die würde ich sogar ganz entfernen, weil man in der Regel weiß, ob und wann diese Sachen fertig sind.“).

**Fragen, die wir uns gestellt haben:**
- Wie rollt sie sich auf? → Das Pergament ist ein Raster mit einer Zeile, deren Höhe von 0fr auf 1fr wächst (0,55 s); der untere Stab sitzt darunter und wandert mit. Zum Schließen umgekehrt (0,45 s), dann der nächste Brief.
- Was bleibt unten? → Nur Rückmeldungen auf das eigene Tippen. „Spielstand geladen“ bleibt kurz; „Die Theken fassen jetzt …“ ist eine Neuigkeit und kommt als Rolle.
- Passt sie aufs Handy? → Der erste Browser-Lauf zeigte: Auf dem Handy (390 hoch) lag „✓ Gelesen“ unter dem Text und war erst nach dem Schieben zu sehen. Jetzt steht der Knopf immer unten in der Rolle, nur der Text darüber lässt sich schieben; das Pergament hat auf dem Handy einen schmaleren Rand.
- Über oder unter den Fenstern? → Darüber (z-index 70): Der Aufstieg passiert im Level-Fenster, die Rolle liegt darauf. Unter dem Ladebildschirm (80) – Neuigkeiten beim Öffnen kommen ohnehin erst danach.

**Gemacht:**
- Neu: `ui/letter.js` (Schriftrolle), `ui/letters.js` (Briefe: Aufstieg, Neuigkeiten, beschädigter Spielstand, Geschenk des Händlers), Kenneys `panel_brown_damaged.png` und `banner_classic_curtain.png` (doppelt groß).
- `main.js`: Aufstieg, Start-Meldungen und Pleiteschutz als Schriftrolle; Erinnerungen „Auftrag bereit“, „Genug Erfahrung und Gold“, „Beet reif“ entfernt. `style.css` (Block v0.51.0).
- Tests: neu `tests/schriftrolle.test.js`. Browser-Test: `readLetter`; jeder Aufstieg im 2D-Test liest die Rolle (Level 2 genau: Hilde, Geschenk, erster Auftrag, bleibt offen, passt auf den Bildschirm, „✓ Gelesen“ rollt sie zu; Level 10–14: Inhalte statt der alten Meldungen); „Beet reif“ erscheint nicht mehr; 3D: Aufstieg auf Level 2 mit Rolle und Bildschirmfoto.
- Doku: `STAND.md`, `SPIEL.md`, `BEDIENUNG.md`, `LEVEL.md`, `TECHNIK.md`, Archiv. Versionsnummer 0.51.0.

**Geprüft:**
- `npm test`: 466 von 466 bestanden (neu: `schriftrolle.test.js`).
- Browser-Test (Tablet und Handy, 2D und 3D): 1.156 von 1.156 bestanden. Vorher fand er drei Dinge: einen Tippfehler im Test, eine zu strenge Prüfung (das Wort „reif“ steht auch in der Säen-Meldung – jetzt „Beet ist reif“) und auf dem Handy den versteckten Knopf „✓ Gelesen“ (behoben, siehe oben).
- Bildschirmfotos angesehen: Schriftrolle zum Aufstieg auf Level 2 im Level-Fenster (2D) und in 3D, Tablet und Handy, auch halb aufgerollt.

### v0.50.1 – Tobias' Test von v0.50.0, Entwurf Schriftrolle und Einführung (24.11.2026, nur Doku)

**Vorgenommen:**
- Tobias' Rückmeldung zu v0.50.0 festhalten und die nächsten zwei Schritte vorschlagen: Neuigkeiten als Schriftrolle und die Einführung mit Hilde.

**Fragen, die wir uns gestellt haben:**
- Welche Meldungen gehen verloren? → Alle erscheinen unten als kurzer Streifen (1–9 Sekunden), auch Aufstieg, Neues nach einem Update und das Geschenk des Händlers. Vorschlag: diese als Schriftrolle ohne Zeit, kurze Rückmeldungen auf das eigene Tippen bleiben unten.
- Wie sieht eine Schriftrolle aus? → Kein fertiges Teil bei Kenney; Musterbild aus `panel_brown_damaged` (Pergament mit ausgefranstem Rand), `banner_classic_curtain` (rotes Band), Holzstäben und Wachssiegel.
- Reihenfolge? → Erst die Schriftrolle (v0.51.0), dann die Einführung (v0.52.0), die Hildes Briefe als Schriftrolle zeigt.

**Gemacht:**
- Entwurf und Musterbilder (A Schriftrolle, B Hildes Fenster) in `PLAENE.md`, `STAND.md`, Archiv. Versionsnummer 0.50.1, Spiel unverändert.

**Geprüft:**
- `npm test`: 461 von 461 bestanden (nur Doku und Versionsnummer geändert).

### v0.50.0 – Ladebildschirm bei jedem Start und Name (24.11.2026)

**Vorgenommen:**
- Den ersten Teil des Entwurfs umsetzen (Tobias: „Ladebildschirm gefällt mir. Immerhin ist es auch Mobile-Game, deswegen sollte man quasi direkt starten können. Erster Start finde ich auch gut.“).

**Fragen, die wir uns gestellt haben:**
- Titel? → Tobias gefallen die Vorschläge noch nicht – Platzhalter „Factory“ (Arbeitstitel) nur auf dem Ladebildschirm; Browser-Reiter und App-Name bleiben, bis es einen Titel gibt.
- Wann erscheint der Ladebildschirm? → Er steht in `index.html`, ist also da, bevor die Programmdateien geladen sind. Der Balken zeigt die Modelle (bis 85 %), dann das Nachholen der verpassten Zeit; danach (beim ersten Start) „Wie heißt du?“, dann blendet er aus – mindestens 2 Sekunden seit dem Öffnen, ohne Antippen. Meldungen beim Start kommen erst danach, „Willkommen zurück“ liegt schon darunter bereit.
- Wo „Name ändern“? → Im Laden-Fenster (✏️ neben „Tobias' Laden“), weil das Menü auf dem Handy im Testmodus keinen neunten Eintrag mehr fasst.
- Spielstand? → Format 19 mit `playerName` (leer = noch nicht gefragt); alte Spielstände bekommen einen leeren Namen und fragen einmal. Das Gerät merkt sich den zuletzt eingegebenen Namen (`settings.lastName`) und schreibt ihn bei „Neues Spiel“ und in der echten Fabrik schon ins Feld.
- Titelbild? → Aufnahme aus dem Belastungstest (1920 × 1080, Schilder ausgeblendet, 193 KB JPEG), darüber ein leichter dunkler Verlauf, damit Schild und Kasten gut lesbar sind.

**Gemacht:**
- Neu: `core/player.js` (Name bereinigen, setzen), `ui/loading.js` (Ladebildschirm, Tipps), `ui/name.js` (Namensfeld, Fenster „✏️ Name ändern“), `assets/titel/ladebild.jpg`.
- Geändert: `index.html` (`#loading`), `style.css` (Block v0.50.0), `main.js` (`boot()`, `applyName`, Start-Meldungen nach dem Ladebildschirm, Nachholen auf dem Balken), `core/save.js` (Format 19), `core/state.js`, `data/levels.js` (Hilde: „Willkommen im Ort, {name}!“), `ui/levels.js`, `ui/shop.js` (Titel, ✏️), `ui/offline.js` („Willkommen zurück, Tobias!“), `ui/backup.js` (Dateiname und Vorschau), `ui/format.js` (`possessive`, `fillName`).
- Tests: neu `tests/spieler.test.js`; Tests, die auf Format 18 festgelegt waren, prüfen „mindestens 18“. Browser-Test: `waitForGame` wartet auf den Ladebildschirm und trägt beim ersten Start „Tester“ ein; 3D: Ladebildschirm, erster Start mit vorausgefülltem Namen, leerer Name geht nicht, ✏️ im Laden mit Enter, neu laden ohne Namensfrage, Belastungstest ohne Frage; 2D: „Willkommen zurück, Tester!“, Dateiname mit Namen, Format 19.
- Doku: `STAND.md`, `SPIEL.md`, `BEDIENUNG.md`, `TECHNIK.md`, Archiv. Versionsnummer 0.50.0.

**Geprüft:**
- `npm test`: 461 von 461 bestanden (neu: `spieler.test.js`).
- Browser-Test (Tablet und Handy, 2D und 3D): 3D-Teil 202 von 202 bestanden; der 2D-Teil fand im ersten Lauf 3 Fehler in den Test-Erwartungen (2× „Tester' Laden“ statt richtig „Testers Laden“; „Danach hast du noch 3.000 Gold“, während ein Kunde gerade für 1 Gold kaufte – jetzt 3.0xx erlaubt), danach 944 von 944. Eine Prüfung des Ladebildschirms hing anfangs von der Zeit ab (der Test sah erst nach dem Laden der Seite hin) – jetzt gleich nach dem Seitenwechsel.
- Bildschirmfotos angesehen: Ladebildschirm mit Balken und Tipp, „Wie heißt du?“ (Tablet und Handy), „Annas Laden“ mit ✏️.

### v0.49.2 – Antworten zu Ladebildschirm, Name und Einführung, Entwurf v0.50.0/v0.51.0 (24.11.2026, nur Doku)

**Vorgenommen:**
- Tobias' Antworten auf die Fragen der Vorbereitung festhalten und den Entwurf für die nächsten zwei Schritte vorschlagen.

**Fragen, die wir uns gestellt haben:**
- Startbildschirm mit Knöpfen oder Ladebildschirm? → Ladebildschirm bei jedem Start wie bei Clash of Clans (Tobias), mit echtem Ladebalken (Modelle laden, Zeit nachholen) und wechselndem Tipp; nur beim ersten Mal danach „Wie heißt du?“.
- Fenster mit Seiten (A) oder geführte Einführung (B)? → Tobias: „wenn man gezeigt bekommt wie das Spiel funktioniert“ – Claudes Lesart B: Bürgermeisterin Hilde führt in 8 kurzen Schritten (einlegen, umplatzieren, Band bauen, Portal → Laden-Lager, Theke, Händler, erster Auftrag), jeder Schritt wartet aufs Tun.
- Welcher Titel? → Noch keiner, „irgendwas in richtung factory“ (Tobias); Claude schlägt „Flussfactory“, „Zunft-Factory“ und „Medieval Factory“ vor (per Websuche geprüft, „Factory Town“ gibt es schon).

**Gemacht:**
- Entwurf in `PLAENE.md`, `STAND.md`, Archiv. Versionsnummer 0.49.2, Spiel unverändert.

**Geprüft:**
- `npm test`: 453 von 453 bestanden (nur Doku und Versionsnummer geändert).

### v0.49.1 – Oberfläche fertig, nächster Chat vorbereitet (24.11.2026, nur Doku)

**Vorgenommen:**
- Tobias' Rückmeldung zu v0.49.0 festhalten („Ja, gefällt mir alles sehr gut“) und den nächsten Chat so vorbereiten, dass Claude auf „bring dich auf den aktuellen Stand“ direkt eine Richtung für Startbildschirm, Name und Spielregeln vorschlägt.

**Fragen, die wir uns gestellt haben:**
- Was braucht der nächste Chat? → In `PLAENE.md`: wie es heute ist (Start direkt in der Fabrik, kein Titel, kein Name, keine Erklärung; Spielstand-Format 18), Claudes Vorschlag (Startbildschirm, Name im Spielstand mit Format 19, Spielregeln als Fenster mit Seiten oder geführte Einführung, zwei Versionen) und erste Fragen.

**Gemacht:**
- `PLAENE.md`, `STAND.md`, Archiv. Versionsnummer 0.49.1, Spiel unverändert.

**Geprüft:**
- `npm test`: 453 von 453 bestanden (nur Doku und Versionsnummer geändert).

### v0.49.0 – Bauleiste, Leisten, Knöpfe und Schilder im Kenney-Stil (24.11.2026)

**Vorgenommen:**
- Den zweiten Teil des Entwurfs umsetzen (Tobias: „Die Fenster sind gut, die Klänge noch ausbaufähig, aber lass uns gerne weitermachen, damit wir das Design abrunden können“).

**Fragen, die wir uns gestellt haben:**
- Wie werden die Leisten zu Holz? → Mit Kenneys Holzfarben in CSS statt mit einem Bild (ein Bild über die ganze Breite hätte sich verzerrt): dunkles Holz #7a512d, Holzrand #b47b41, Umriss #6d4b27 – oben die Leiste mit Rand unten, die Bauleiste mit Rand oben.
- Welche Knöpfe? → Alle auf den Leisten wie in den Fenstern (`button_brown`, grün, rot): Vollbild, ☰, Laden, Bauen, ⟲ ⟳ (mit 6 statt 5 Bildpunkten Rahmen), Gebäude, Werkzeuge, Werkzeugleiste; der offene Reiter `button_dark` mit heller Schrift; gesperrte Gebäude nur blass (ihr alter Hintergrund schimmerte in den runden Ecken durch).
- Passt alles auf das Handy? → Die Reiter hatten durch den 3 Bildpunkte dickeren Rahmen kaum noch Platz („Werkstatt“ bis an den Rand); ihr Innenabstand ist deshalb überall 3 Bildpunkte kleiner. Die Größen der Handy-Regeln bleiben, der neue Block setzt nur Farben und Rahmen. Auf dem Handy haben die nur 72 Bildpunkte breiten Werkzeug-Kacheln einen 3 statt 5 Bildpunkte dicken Rahmen – sonst passte „Verschieben“ nicht hinein (Browser-Test).
- Schilder „＋ Preis“? → In 3D (`drawLandSign` in `scene3d.js`) als Holzschild: dunkler Umriss, Holzrand, Pergament, dunkle Schrift; reicht das Gold nicht, blasser. Die 2D-Karte bleibt (hinten angestellt).

**Gemacht:**
- `style.css` (Block v0.49.0, Innenabstand der Reiter), `view3d/scene3d.js` (Schild).
- Browser-Test: Bauleiste und Leisten (offener Reiter dunkel, Holzknöpfe, ✕ rot, alle Reiter auf dem Bildschirm, `3d-11g-bauleiste`).
- Doku: `STAND.md`, `SPIEL.md`, `BEDIENUNG.md`, `TECHNIK.md`, Archiv; Tobias' Rückmeldung zu v0.48.0 schon vorab festgehalten. Versionsnummer 0.49.0.

**Geprüft:**
- `npm test`: 453 von 453 bestanden.
- Browser-Test (Tablet und Handy, 2D und 3D): 1.122 von 1.122 bestanden. Ein erster Lauf fand auf dem Handy „Verschieben“ zu breit für die Werkzeug-Kachel (behoben, dann neu gestartet). Eigenes Prüfskript: alle Reiter und Kacheln auf Tablet und Handy im Bild; auf dem sehr schmalen Handy (740) liegt die 4. Gebäude-Kachel wie schon in v0.48.0 hinter dem Rand und lässt sich wischen – geprüft werden dort wie bisher die Reiter.
- Bildschirmfotos angesehen: Bauleiste (Holz, Erde, Werkstatt), Werkzeugleiste, Leiste oben, Laden/Bauen, ⟲ ⟳, Schilder „＋ 170“ – Tablet, Handy, schmales Handy.

### v0.48.0 – Fenster, Menü und Klänge im Kenney-Stil (24.11.2026)

**Vorgenommen:**
- Den Entwurf v0.48.0 umsetzen (Tobias: „1. Ja, passt so. 2. Die Klänge sollen erstmal aus sein und du kannst die Klänge gerne aussuchen“).

**Fragen, die wir uns gestellt haben:**
- Welche Klänge? → Alle 50 Klänge von Kenneys UI Audio nach Länge, Lautstärke und Klangfarbe gemessen (`ffmpeg`): `click2` (0,06 s, die wärmste Klick-Datei) für Knöpfe, `switch20` (der tiefste, weichste Schalter) für Reiter. Als MP3 (1 und 3 KB) – Ogg spielen nicht alle iPhones.
- Wie klingen alle Knöpfe, ohne jede Stelle anzufassen? → `onPress` (`ui/press.js`) ruft vor jedem Antippen `pressSound` (`ui/sound.js`); Reiter (`.tab`, `.build-tab`) klingen anders. Web Audio, der Ton entsteht erst nach dem ersten Antippen (so verlangen es die Browser); die Dateien laden erst, wenn die Klänge an sind.
- Wo steht die Einstellung? → Im Browser des Geräts (`erstesspiel-audio`: an/aus, Lautstärke), nicht im Spielstand – das Format bleibt gleich. Unsinn oder nichts gespeichert = aus.
- Wie bekommt der gewählte Reiter dunkles Holz? → Das Paket hat keinen dunklen Knopf: `button_dark.png` ist `button_brown.png` nach Helligkeit dunkel umgefärbt; helle Schrift.
- Was ändert sich am Aussehen? → Nur `style.css` (ein Block hinter den Grundregeln): `.modal-box`, `.catchup-box`, `.menu` mit Rahmen B; Knöpfe, Zeilen (`item-row`, `level-row`, `goal-row` …) wie Holzschilder; Kästen (Theken, Aufträge, Lager vergrößern, nächstes Level) mit verziertem Rahmen; der Test-Knopf bleibt lila. Rückfragen 460 statt 400 breit. Auf niedrigen Bildschirmen (Handy) sind die Menüknöpfe flacher (31 statt 36), sonst passten die 8 Einträge im Testmodus nicht (410 statt höchstens 390, Browser-Test).

**Gemacht:**
- `ui/sound.js` und `ui/audio.js` (neu), `ui/press.js` (Klang beim Antippen), `ui/hud.js` und `index.html` (Menüeintrag „🔊 Audio“), `main.js` (Fenster öffnen), `style.css`, `assets/kenney-ui/ui-audio/` (2 Klänge, Lizenz), `assets/kenney-ui/ui-pack-adventure/button_dark.png`.
- Neuer Test `tests/audio.test.js` (beim Start aus, Einstellung prüfen, Dateien und Lizenz, Reiter klingen anders); Browser-Test: Laden mit Holzrahmen und dunklem Reiter, Menü „🔊 Audio“ aus → an, Lautstärke 30 % gemerkt, Fenster passt (`3d-11f-audio`).
- Doku: `STAND.md`, `SPIEL.md`, `BEDIENUNG.md`, `TECHNIK.md`, Archiv. Versionsnummer 0.48.0.

**Geprüft:**
- `npm test`: 453 von 453 bestanden.
- Browser-Test (Tablet und Handy, 2D und 3D): erster voller Lauf 1.119 von 1.120 – nur das Menü im Testmodus auf dem Handy war zu hoch (410 statt ≤ 390), behoben. Zweiter voller Lauf wurde von außen gestoppt (bis dahin 1.040 von 1.040: der ganze 2D-Teil und 3D auf dem Tablet); danach der 3D-Teil noch einmal: 176 von 176 bestanden (Menü im Testmodus auf dem Handy 348 ≤ 390, Audio aus → an → aus).
- Bildschirmfotos angesehen: Laden (Lager, Theken, Händler), Level-Fenster (Aufträge, Ort & Level), Menü, Audio, Rückfragen (Neues Spiel, Abreißen, Lager vergrößern), Lagerhaus befüllen, Menge wählen, Willkommen zurück, Sichern – Tablet und Handy.

### v0.47.1 – v0.47.0 läuft live, Entwurf Rest der Oberfläche mit Klängen (24.11.2026, nur Doku)

**Vorgenommen:**
- Tobias' Rückmeldung festhalten („Perfek, das hat funktioniert. Lass uns weitermachen“) und den nächsten Schritt planen.

**Fragen, die wir uns gestellt haben:**
- Was ist noch im alten Aussehen? → Große Fenster, Rückfragen, Menü, Bauleiste, Leiste oben, Knöpfe unten, ⟲ ⟳, Schilder „＋ Preis“ (Bildschirmfotos aus dem Browser-Test angesehen).
- Wie viel auf einmal? → Zwei Schritte: v0.48.0 Fenster, Menü und Klänge (Tobias wollte die Klänge zusammen mit dem Menü), v0.49.0 Bauleiste und Leisten.
- Wo wird die Audio-Einstellung gespeichert? → Im Browser des Geräts, nicht im Spielstand – das Spielstand-Format bleibt gleich.

**Gemacht:**
- Entwurf in `PLAENE.md`, `STAND.md`, Archiv. Versionsnummer 0.47.1, Spiel unverändert.

**Geprüft:**
- `npm test`: 449 von 449 bestanden (nur Doku und Versionsnummer geändert).

### v0.47.0 – Probefenster: Kräuter klar unterscheidbar, Infofenster im Kenney-Stil (23.11.2026)

**Vorgenommen:**
- Den Entwurf v0.47.0 umsetzen (Tobias: „Mir gefällt B besser und die neuen Kräuterbilder sind auch sehr gut. Die Idee, dass man die Kräuter auch aufwachsen sieht, finde ich auch super. Die Sounds machen wir erst bei dem Menu …“).

**Fragen, die wir uns gestellt haben:**
- Wo steht die Form der Kräuter? → In der Waren-Tabelle: `bloom` je Pflanze (`stars`, `disc`, `umbel`, `daisies`), `grows` je Samen (welche Pflanze auf die Tüte kommt). `ui/itemArt.js` zeichnet daraus die Bilder (Raster aus 40 Einheiten wie im Musterbild; Umriss nur außen herum, damit kleine Bilder klar bleiben); 2D-Karte, Listen und die 3D-Schilder nutzen dieselben Bilder.
- Wie wachsen die Pflanzen in 3D, ohne langsam zu werden? → `view3d/plantForms.js` beschreibt je Kraut und Stufe eine Pflanze aus Grundkörpern (wie die Waren), ein Beet hat 3 × 3 Pflanzen (1,6-mal so groß wie eine Ware, leicht gedreht und verschieden groß). `scene3d.js` prüft die Beete mit den Schildern (8-mal pro Sekunde) und setzt nur bei neuer Pflanze oder Stufe ein neues Teil; die Geometrie je Pflanze und Stufe teilen sich alle Beete (`items3d.formGeometry`, Material `ITEM_MAT`). Ein wachsendes Beet kostet einen Zeichenaufruf.
- Wohin mit den Kenney-Bildern? → `assets/kenney-ui/ui-pack-adventure/` (6 Bilder, 6 KB, mit Lizenz) – `assets/kenney/` prüft ein Test nur auf 3D-Modelle. Doppelt große Bilder, halb so groß gezeigt (scharf auf dem Tablet). Das Paket hat keinen grünen Knopf: `button_green.png` ist der rote, grün umgefärbt.
- Was ändert sich am Infofenster? → Nur das Aussehen (`style.css`, alles unter `#info-panel`): Rahmen `panel_brown_corners_a` (`border-image`, ohne `fill`, damit der Hintergrund wie bisher einen Hauch durchsichtig bleibt – sonst zeichnet Chrome auf dem Handy die 3D-Welt darunter nicht), Knöpfe `button_brown` / grün / `button_red`, Kästen `panel_border_brown_detail`, Vorrat in `round_brown`. Rahmen 16 Bildpunkte, Fenster 340 statt 320 Bildpunkte breit, halbe Knöpfe etwas weniger fett, „Verschieben, Drehen, Abreißen“ etwas kleiner – sonst passten beim Ofen auf Level 13 „kaufen · 1.100 🪙“ und „Auffüllen … 2.200 🪙“ nicht (Browser-Test). Die 2D-Karte lässt sich rechts entsprechend weiter schieben (`main.js`: `min(340, 44 %) + 24`), damit das breitere Fenster kein Gebäude am Rand verdeckt.
- Klänge? → Nach Tobias' Wunsch erst mit dem Menü (Menüpunkt „Audio“), v0.48.0.

**Gemacht:**
- `core/data/items.js` (`bloom`, `grows`), `ui/itemArt.js` (Pflanzen und Samentüte), `ui/controller.js` (Knöpfe „➕ Pflanze“ mit großem Bild; Säen mit größerem Bild), `style.css` (Infofenster), `view3d/plantForms.js` (neu), `view3d/items3d.js` (`formGeometry`), `view3d/scene3d.js` (`updateCrop`, `cropOf`), `main.js` (`view3d.crop` für den Browser-Test, Rand rechts neben dem Infofenster), `assets/kenney-ui/`.
- Neuer Test `tests/pflanzen.test.js` (Wuchsform je Kraut verschieden, Samentüte zeigt die Pflanze aus dem Beet, Stufen, Formen werden größer, Beet mit 9 Pflanzen im Rahmen); Browser-Test: vier Beete wachsen in Stufen (`3d-11d-beete`), Erntebank mit vier Kräuter-Knöpfen, Kenney-Rahmen, nichts ragt heraus (`3d-11e-erntebank`).
- Doku: `STAND.md`, `SPIEL.md`, `BEDIENUNG.md`, `GEBAEUDE.md`, `WAREN.md`, `TECHNIK.md`, Archiv. Versionsnummer 0.47.0.

**Geprüft:**
- `npm test`: 449 von 449 bestanden.
- Browser-Test (Tablet und Handy, 2D und 3D): im vollen Lauf 1.107 von 1.108 bestanden – nur auf dem Handy „Rechter Rand der Fläche lässt sich links neben das Infofenster schieben“: Der Test begann sein Wischen bei 60 % der Breite, wo jetzt das breitere Infofenster liegt; er beginnt jetzt bei 50 %. Danach der 2D-Teil noch einmal: 944 von 944 bestanden. Vorher gefunden und behoben: beim Ofen auf Level 13 passten „kaufen · 1.100 🪙“ und „Auffüllen … 2.200 🪙“ nicht, die Karte ließ sich rechts nicht weit genug schieben.
- Beete: Keimlinge → Knospen (65 %) → reif, je Pflanze die eigene Form. Belastungstest unverändert: herausgezoomt 828, nah 508–558 Zeichenaufrufe.
- Bildschirmfotos angesehen: Beete in allen Stufen, Erntebank (Tablet und Handy), Ofen auf Level 13, Kräuterstube, Lagerhaus, Beet in 2D.

### v0.46.2 – Entwurf Probefenster mit Kenneys UI-Paketen (23.11.2026, nur Doku)

**Vorgenommen:**
- Tobias' Rückmeldung (Kräuter schwer zu unterscheiden, schlichtes Probefenster) und seinen Upload festhalten; Entwurf v0.47.0 schreiben.

**Fragen, die wir uns gestellt haben:**
- Welche Pakete? → kenney.nl ist aus der Arbeitsumgebung nicht erreichbar; Namen über eine Websuche geprüft. Tobias hat fünf ZIP-Dateien hochgeladen (Commit `eeabe8a`); das Adventure-Paket (Holz und Pergament) passt am besten, Pixel Adventure wird nicht gebraucht.
- Wo genau ist die Auswahl schwer? → Bildschirmfotos (Level 13): Erntebank mit vier Knöpfen „➕ 1 [Bild] einlegen“, die Pflanzen dieselbe Zeichnung in anderer Farbe; Samen derselbe Beutel; Beete in 3D ein leerer Kasten.
- Wohin mit den ZIP-Dateien? → Aus dem Projekt genommen (sonst lägen 2,9 MB auf der Live-Seite); sie bleiben in der Versionsgeschichte (`git show eeabe8a:<Datei>`).

**Gemacht:**
- Musterbild (Erntebank in Rahmen A und B, neue Kräuterbilder) an Tobias geschickt; `PLAENE.md` (Entwurf v0.47.0), `STAND.md`, Archiv. Versionsnummer 0.46.2, Spiel unverändert.

**Geprüft:**
- `npm test`: 444 von 444 bestanden (nur Doku und Versionsnummer geändert).

### v0.46.1 – nächste große Schritte festgehalten (23.11.2026, nur Doku)

**Vorgenommen:**
- Tobias' Rückmeldung zu v0.46.0 und seine nächsten großen Schritte festhalten, damit der nächste Chat mit „bring dich auf den aktuellen stand“ direkt bei den Kenney-UI-Paketen weitermachen kann.

**Fragen, die wir uns gestellt haben:**
- Was braucht der nächste Chat? → In `PLAENE.md`: welche Kenney-UI-Pakete in Frage kommen (Namen dort prüfen), wie sie ins Spiel kommen (Hochladen wie in Chat 23), was sich ändert (Fenster, Knöpfe, Reiter, Ausgewähltes markieren), erste Fragen an Tobias.
- Wo steht die Einführung? → Vorgezogen: nach der Oberfläche Startbildschirm, Name, kurze Spielregeln (vorher „erst, wenn Tobias das Spiel anderen zeigt“).

**Gemacht:**
- `STAND.md` (Status, Nächster Schritt, Nächste Schritte, letzte Arbeitsschritte), `AUSBLICK.md`, `PLAENE.md`, Archiv. Versionsnummer 0.46.1, Spiel unverändert.

**Geprüft:**
- `npm test`: 444 von 444 bestanden (nur Doku und Versionsnummer geändert).

### v0.46.0 – Waren auf dem Band mit eigenem Aussehen (23.11.2026)

**Vorgenommen:**
- Den Entwurf v0.46.0 umsetzen (Tobias: „Die Probebilder haben mir sehr gut gefallen. Die sollen so groß bleiben wie sie sind … Alles gerne auf einmal“).

**Fragen, die wir uns gestellt haben:**
- Wo stehen die Formen? → Als Daten in `view3d/itemForms.js` (Grundkörper `box`, `cyl`, `ball`, `ring`, Gruppen mit Maßstab), ohne three.js – so prüft ein Test in node, dass jede Ware eine eigene Form hat und keine zwei gleich sind.
- Bleibt es schnell? → `items3d.js` fügt jede Form zu einem Teil zusammen (Farben in den Ecken, ein gemeinsames Material `ITEM_MAT`); je Ware bleibt es ein Stapel (Instancing). Belastungstest: herausgezoomt 825–828, nah 508–561 Zeichenaufrufe (vorher 825/508–558). Höchstens 552 Dreiecke je Ware.
- Wie liegen die Verbände? → Erster Lauf: quer zur Laufrichtung, von vorn wie Dosen; jetzt längs mit losem Ende daneben.

**Gemacht:**
- `view3d/itemForms.js` (neu): Formen aller 40 Waren (die 9 bisherigen gleich, das Stein-Zahnrad mit Zähnen; neu: Mechanik, Metall, Uhren, Bretter, Kräuter, Verbände, Glas und Tränke). `view3d/items3d.js` (neu): `itemGeometry`, `ITEM_MAT`. `scene3d.js`: Waren aus `itemGeometry`, die alte `itemTemplate` (Kugeln) entfällt; Abfrage `itemShapes`. `main.js`: `__game.isFree` und `view3d.itemShapes` für den Browser-Test.
- Tests: `tests/waren3d.test.js` (neu, 5 Prüfungen); Browser-Test 3D: alle 40 Waren auf Bändern (Form, Größe höchstens 0,62 × 0,42, Dreiecke), Bild `3d-11c-waren`.
- Doku: `SPIEL.md`, `TECHNIK.md`, `AUSBLICK.md`, `STAND.md`, Archiv.

**Geprüft:**
- `npm test`: 444 von 444 bestanden.
- Browser-Test 2D und 3D (Tablet und Handy): 1.094 Prüfungen bestanden.
- Probebild aller 40 Waren (außerhalb des Spiels) und das Bild im Spiel angesehen und Tobias vor dem Merge geschickt – Tobias: „Ja passt so“.

### v0.45.1 – Entwurf: Waren auf dem Band mit eigenem Aussehen (23.11.2026, nur Doku)

**Vorgenommen:**
- Tobias' Auftrag: Kenneys Modelle und unsere Waren ansehen, damit man besser erkennt, was auf dem Band liegt.

**Fragen, die wir uns gestellt haben:**
- Wie sehen die Waren heute aus? → 9 von 40 haben eine Form, 31 sind Kugeln in ihrer Farbe.
- Was bieten Kenneys Pakete? → Tobias' Upload (Commit `465be0c`, auf einem alten Branch; dafür alle Branches geholt): fast nur Bauteile; als Waren passen Zahnräder, Bretter, Stangen, Felsen.
- Wie sähen eigene Formen aus? → Probebild außerhalb des Spiels (three.js, 10 Waren neben den heutigen Kugeln), an Tobias geschickt.

**Gemacht:**
- `PLAENE.md`: Entwurf v0.46.0. `STAND.md`, `AUSBLICK.md`, Archiv. Versionsnummer 0.45.1, Spiel unverändert.

**Geprüft:**
- `npm test`: 439 von 439 bestanden (nur Doku und Versionsnummer geändert).

### v0.45.0 – Level 14 „Die Tinktur“ (23.11.2026)

**Vorgenommen:**
- Den Entwurf v0.45.0 aus `PLAENE.md` umsetzen (Tobias: „Ja, die Rezepte passen so und der aufstieg + aufträge auch. Aussehen passt auch.“).

**Fragen, die wir uns gestellt haben:**
- Passt das Infofenster mit 4 Einstellungen? → Ja: auf Tablet und Handy ragt nichts heraus; auf dem Handy scrollt das Fenster wie bisher.
- Wie sehen die neuen Waren aus? → Warenbilder `mortar` (graue Steinschale mit Holzstößel) und `tincture` (braune Flasche mit Korken und grünem Kräuter-Etikett); auf den Bändern im 3D-Test wie die anderen besonderen Waren eine Kugel in ihrer Farbe (eigene Formen aus Kenneys Teilen: Tobias' Idee für einen späteren Schritt).
- Muss das Spielstand-Format geändert werden? → Nein, Format 18 bleibt; beide Spielstände können auf Level 14 aufsteigen.

**Gemacht:**
- Daten: `items.js` (Mörser 29, Tinktur 346), `recipes.js` (beide ab Level 14), `buildings.js` (Zimmerei und Apotheke je eine Einstellung mehr), `levels.js` (Level 14 mit Geschichte und 4 Aufträgen, Aufstieg 12.500), `shop.js` (Level 14 wie 13). `ui/itemArt.js`: zwei Warenbilder.
- Tests: `tests/tinktur.test.js` (neu, 12 Prüfungen); Level-Tests auf 14 Level angepasst (`levels`, `quests`, `save`, Kapitel-Tests prüfen nur noch, dass ihr Level da ist, `combo` zählt die Grundeinstellungen); Browser-Test 2D: Aufstieg auf Level 14, Zimmerei und Apotheke mit 4 Einstellungen.
- Doku: `LEVEL.md`, `WAREN.md`, `GEBAEUDE.md`, `BEDIENUNG.md`, `AUSBLICK.md` (Level 14 im Spiel, Idee Waren mit Kenneys Teilen), `SPIEL.md`, `TECHNIK.md`, `ZAHLEN.md` neu geschrieben; `STAND.md`, Archiv.

**Geprüft:**
- `npm test`: 439 von 439 bestanden.
- Browser-Test 2D (`ONLY=2d`): 944 Prüfungen bestanden, Bilder der Infofenster auf Tablet und Handy angesehen.
- Browser-Test 3D (`ONLY=3d`): 142 Prüfungen bestanden, Belastungstest herausgezoomt 825, nah 508 Zeichenaufrufe.

### v0.44.1 – Entwurf Level 14 „Die Tinktur“ (23.11.2026, nur Doku)

**Vorgenommen:**
- Level 14 im Detail planen (Tobias: „Plane gerne alles und stell es mir dann vor“) und seine Rückmeldung festhalten (Level 13 beendet, Platz zu 70 % gefüllt, Gold-Ausgabe erst mit Level 15).

**Fragen, die wir uns gestellt haben:**
- Wie viel soll Level 14 bringen? → Rechenwerkzeug: ab Level 9 je Level ×1,1–1,3; Entwurf an einer Kopie gerechnet: 12.761 Gold (×1,2).
- Was bremste Tobias? → Fehlende Teile für neue Gebäude; Level 14 braucht keins.

**Gemacht:**
- `PLAENE.md`: Entwurf v0.45.0. `STAND.md`, Archiv. Versionsnummer 0.44.1, Spiel unverändert.

**Geprüft:**
- `npm test`: 427 von 427 bestanden (nur Doku und Versionsnummer geändert).

### v0.44.0 – Rechenwerkzeug für die Zahlen (23.11.2026)

**Vorgenommen:**
- Den Entwurf aus `PLAENE.md` umsetzen (Tobias: „das Rechenwerkzeug hat mir noch gefehlt“); am Spiel ändert sich nichts.

**Fragen, die wir uns gestellt haben:**
- Wie rechnet man „Zeit“? → Maschinenzeit (alle Sekunden je Stück, ohne Beet) und Engpass (je Schritt ein Gebäude, je Pflanze ein Beet – der langsamste Schritt bestimmt das Tempo).
- Was sagt der Aufstieg in Theken-Stunden? → Nach dem ersten Lauf: immer nur wenige Minuten, deshalb stattdessen Gold je Stunde der Theken neben dem einer Straße, dazu „Wofür man Gold ausgibt“.
- Bleibt die Seite aktuell? → Ein Test vergleicht sie mit dem, was das Werkzeug aus den Tabellen schreibt.

**Gemacht:**
- `tools/zahlen.mjs` (neu): `unitCost`, `bundleCost`, `levelFigures`, `buildReport`; schreibt `docs/inhalte/ZAHLEN.md`. `tests/zahlen.test.js` (neu): Rechnung an Beispielen (Holzplatte, Wundverband, Level 1), Erfahrung je Level, Seite aktuell.
- Doku: `ZAHLEN.md` in `CLAUDE.md`, `SPIEL.md`, `TECHNIK.md`; Kristallsand in `AUSBLICK.md`; `STAND.md`, Archiv.

**Geprüft:**
- `npm test`: 427 von 427 bestanden.
- Kein Browser-Test: kein Spielcode geändert (nur das Werkzeug, die Doku und die Versionsnummer).

### v0.43.5 – Techbaum Level 14–18 angenommen, Entwurf Rechenwerkzeug (23.11.2026, nur Doku)

**Vorgenommen:**
- Tobias' Antworten zur 2. Fassung festhalten und den nächsten Schritt (Rechenwerkzeug) als Entwurf vorstellen.

**Fragen, die wir uns gestellt haben:**
- Was ist mit „Mühle“ gemeint? → Die Kräutermühle aus Level 16; dass sie Glas mahlt, passt nicht ganz → Vorschlag Steinmetz, Name offen.
- Wann mehr Fläche? → Mit Level 15 (Tobias); Preis bei der Planung von Level 15, vorher mit dem Belastungstest prüfen.

**Gemacht:**
- `AUSBLICK.md`: Techbaum Level 14–18 (angenommene 2. Fassung). `PLAENE.md`: Entwurf v0.44.0 Rechenwerkzeug. `STAND.md`, Archiv. Versionsnummer 0.43.5, Spiel unverändert.

**Geprüft:**
- `npm test`: 423 von 423 bestanden (nur Doku und Versionsnummer geändert).

### v0.43.4 – Grobplan Tränke-Kapitel, 2. Fassung (23.11.2026, nur Doku)

**Vorgenommen:**
- Tobias' Antworten zur 1. Fassung einarbeiten („Verarbeite die Informationen erstmal und schlage mir evtl einen neuen TechBaum mit ähnlicher Struktur vor“).

**Fragen, die wir uns gestellt haben:**
- Wie kommt der Traumtrank auf Level 15? → Ein alter Magier zieht wegen der Tinktur in den Ort und bringt den Zauberkessel mit; alle Tränke entstehen dort.
- Wie wird es weniger Umbau? → Kein bestehendes Rezept ändert sich, 11 statt 16 neue Waren, je Level höchstens 1 neue Maschine.
- Holzkohle als Feuer? → Wäre ein dritter Eingang (Tobias' Regel: höchstens 2) – zwei Wege zur Wahl; der Ofen bleibt unverändert.

**Gemacht:**
- `PLAENE.md`: 2. Fassung. `STAND.md`, `AUSBLICK.md` (Hinweis), Archiv. Versionsnummer 0.43.4, Spiel unverändert.

**Geprüft:**
- `npm test`: 423 von 423 bestanden (nur Doku und Versionsnummer geändert).

### v0.43.3 – Grobplan Tränke-Kapitel Level 14–18 (23.11.2026, nur Doku)

**Vorgenommen:**
- Schritt 1 der Reihenfolge aus der Analyse (Tobias: „Okay, lass uns damit anfangen“): das Gerüst des Tränke-Kapitels ohne Zahlen; Tobias' Rückmeldung (Level 12, Gleichgewicht passt) festhalten.

**Fragen, die wir uns gestellt haben:**
- Woraus bauen wir das Gerüst? → Aus Tobias' Entscheidungen (Archiv): Mörser auf 14, Staub-Maschine auf 15, Tinktur und erster Zaubertrank in der Apotheke, Linse → Lupe/Fernrohr, Farn, Lebens-, Mana-, Alterstrank; Bauabschnitte aus dem Gesamtbild v0.30.1.
- Wie viele neue Maschinen? → Eine (Stampfmühle), vielleicht ein Zauberkessel für Level 18 (Frage an Tobias).
- Sand zu Staub? → Rohstoffe kommen nicht aufs Band, deshalb Glas → Glasstaub.

**Gemacht:**
- `PLAENE.md`: Grobplan. `STAND.md`, `AUSBLICK.md` (Hinweis auf den Grobplan), Archiv. Versionsnummer 0.43.3, Spiel unverändert.

**Geprüft:**
- `npm test`: 423 von 423 bestanden (nur Doku und Versionsnummer geändert).

### v0.43.2 – Kräuterstube passt, Analyse als Spielentwickler Teil 2 (23.11.2026, nur Doku)

**Vorgenommen:**
- Tobias' Urteil zur Kräuterstube mit 2 Eingängen festhalten (offene Frage 2 erledigt) und seine Frage beantworten, ob wir bis Level 13 warten oder schon am Techbaum weitermachen.

**Fragen, die wir uns gestellt haben:**
- Passt die Kräuterstube mit 2 Eingängen? → Ja: „finde ich auch gut“; man baut anders als bei den Baustoffen (zwei Kräuterstuben für Heil- und Wundverbände, mehrere Erntebänke schieben seitlich ein).
- Warten bis Level 13? → Nein (Analyse in `PLAENE.md`): das Gerüst des Tränke-Kapitels jetzt planen, die Zahlen nach Tobias' Gefühl von Level 13.

**Gemacht:**
- `PLAENE.md`: Analyse als Spielentwickler, Teil 2. `STAND.md` (Status, Nächster Schritt, Tobias' 3D-Test, Nächste Schritte, offene Fragen neu nummeriert, letzte Arbeitsschritte), Archiv. Versionsnummer 0.43.2, Spiel unverändert.

**Geprüft:**
- `npm test`: 423 von 423 bestanden (nur Doku und Versionsnummer geändert).

### v0.43.1 – eigene Häuser getestet (23.11.2026, nur Doku)

**Vorgenommen:**
- Tobias' Rückmeldung zu den eigenen Häusern (v0.42.0 und v0.43.0) festhalten (Regel „Nichts darf verloren gehen“).

**Fragen, die wir uns gestellt haben:**
- Erkennt man die Gebäude? → Ja: „Bis v43 sieht alles sehr gut aus und die einzelnen Gebäude wirken auch unterschiedlich genug, sodass man sie erkennt.“
- Was fehlt? → Von hinten sieht man keine Unterschiede (Erkennungszeichen und bewegte Teile sitzen vorn); wer links und rechts einer Straße baut, sieht eine Seite immer von hinten – „nur eine kleine Anmerkung für später“.
- Wie weiter? → Tobias spielt weiter bis Level 13, dann planen wir Level 14 (wie in Chat 26 vereinbart).

**Gemacht:**
- `STAND.md` (Status, Nächster Schritt, Nächste Schritte Punkt 2, offene Frage 15, letzte Arbeitsschritte), Archiv. Versionsnummer 0.43.1, Spiel unverändert.

**Geprüft:**
- `npm test`: 423 von 423 bestanden (nur Doku und Versionsnummer geändert).

### v0.43.0 – eigene Häuser für Level 7–12 (22.11.2026)

**Vorgenommen:**
- Tobias' Test von v0.42.0 („man erkennt alles … BLeibt auch flüssig auf dem Tablet. Mach gerne weiter“) – den Entwurf aus `PLAENE.md` für Level 7–12 umsetzen.

**Fragen, die wir uns gestellt haben:**
- Passt alles unter 1 MB? → Ja: 11 neue Modelle, zusammen jetzt 872 KB. Hecke und Dach mit Dachfenster flogen nach den Probebildern wieder raus (sahen nicht gut aus).
- Wie schwingen die Stoffbahnen? → Jedes Banner hängt an einem Drehpunkt oben (`hangingBanner`) und schwingt beim Arbeiten (`parts.sway`).
- Wie wird die Erntebank „arbeitend“? → Wie jedes Rohstoff-Gebäude, solange eine Pflanze eingelegt ist.

**Gemacht:**
- `view3d/kenney3d.js`: Häuser für Erntebank, Webstube, Kräuterstube, Schreibstube, Uhrmacherei, Apotheke; Helfer `spinningWheel` und `hangingBanner`. `view3d/scene3d.js`: `parts.sway`. `kenneyParts.js`: 11 Modelle, Farbtafeln Castle Kit `turm` (Stein warm, Dach und Fahne in Reiterfarbe) und Factory Kit `glas`.
- Tests: `modelle3d` erkennt auch das Balkon-Geländer als Wandteil; Browser-Test 3D setzt alle zwölf eigenen Häuser und prüft ihre bewegten bzw. leuchtenden Teile.
- Doku: `STAND.md`, `SPIEL.md`, `BEDIENUNG.md`, `TECHNIK.md`, Archiv.

**Geprüft:**
- `npm test`: 423 von 423 bestanden.
- Browser-Test: 2D 912 und 3D 142 Prüfungen bestanden (alle zwölf eigenen Häuser mit ihren bewegten bzw. leuchtenden Teilen, Belastungstest unter 1.000 Zeichenaufrufen).
- Probebilder angesehen und verbessert (Hecken, Dach der Kräuterstube, Rad der Erntebank); Nahaufnahmen und Übersicht an Tobias vor dem Merge.

### v0.42.0 – eigene Häuser für Level 2–6, Flächenpreise (22.11.2026)

**Vorgenommen:**
- Den Entwurf aus `PLAENE.md` für Level 2–6 umsetzen (Tobias: „B passt für mich sehr gut“) und die Flächenpreise je Seite auf 170 → 500 → 2.000 setzen („Die Preise sollen bei der dritten Fläche bei 2000 bleiben“).

**Fragen, die wir uns gestellt haben:**
- Woher die Modelle? → Tobias' Upload aus Chat 23 (Commit `465be0c`), dafür die ganze Versionsgeschichte geholt; nur die gebrauchten 13 Modelle kommen ins Projekt (zusammen jetzt 731 KB, Grenze 1 MB – der hohe Karren mit 88 KB blieb draußen).
- Wie werden Zahnrad und Gitter passend gefärbt? → neue Farbtafeln: Factory Kit `messing` und `stahl` (Band 3, Spalten 0/1 und 4/5), Castle Kit `eisen` (Spalten 5 und 7).
- Wie bleibt es schnell? → Erster Lauf: herausgezoomt 1.088 Zeichenaufrufe (Grenze 1.000), weil jede einfache Form (Block, Stein, Balken) ihr eigenes Material hatte. Lösung: ein gemeinsames Material für alle einfachen Formen, die Farbe steckt in den Ecken der Form (`plain` in `kenney3d.js`), dazu Schornstein und Felsen im selben Material wie ihr Haus, der Kranarm als ein Teil. Danach (Belastungstest): herausgezoomt 829, nah 508 Zeichenaufrufe (vor v0.42.0: 730 und 450).
- Ändern sich alte Spielstände? → Nein; schon gekaufte Fläche bleibt, nur künftige zweite Streifen kosten 500. Ein Rest-Streifen aus sehr alten Spielständen kostet anteilig vom 2. Streifen.

**Gemacht:**
- `data/land.js`: `prices: [170, 500]` statt `price`; `core/land.js` (`stripPrice`), Text im Infofenster und im Hinweis für alte Spielstände.
- `view3d/kenney3d.js`: Häuser für Steinbruch, Steinmetz, Schmelzhütte, Zimmerei, Feinschmiede, Schlosserei; Helfer `gear` (Zahnrad senkrecht), `stones` und `plain` (einfache Formen mit gemeinsamem Material, auch für Beet und Amboss der Schmiede); `chimney` nimmt die Farbe des Hauses; `parts.spin`, `swing`, `dustSpot` bleiben beim Zusammenfügen für sich. `view3d/scene3d.js`: Zahnräder drehen sich, der Kran schwenkt, Staub steigt auf – nur beim Arbeiten; Abfrage `motionOf`. `kenneyParts.js`: 13 Modelle und die Farbtafeln. `main.js`: `__game.place` für den Browser-Test.
- Tests: Flächenpreise (`land`, `spital`, `save`), Browser-Test 2D (zweiter Streifen 500) und 3D (sechs Häuser mit ihren bewegten Teilen, Bild `3d-11b-neue-haeuser`; nach dem Belastungstest zählt der Test die eigenen Gebäude statt „weniger als 10“).
- Doku: `STAND.md`, `SPIEL.md`, `BEDIENUNG.md`, `TECHNIK.md`, Archiv.

**Geprüft:**
- `npm test`: 423 von 423 bestanden.
- Browser-Test: 2D (`ONLY=2d`) 912 Prüfungen bestanden, 3D (`ONLY=3d`) 130 Prüfungen bestanden – sechs Häuser mit ihren bewegten Teilen, Belastungstest herausgezoomt 828 und nah 508 Zeichenaufrufe.
- Nahaufnahmen aller sechs Häuser angesehen (Tablet, zweifache Auflösung) und Tobias vor dem Merge geschickt; auf dem Handy zeigt das Schild am zweiten Streifen „＋ 500“.

### v0.41.2 – Entwurf eigene Häuser und Flächenpreise (22.11.2026, nur Doku)

**Vorgenommen:**
- Tobias' Antworten zum Plan festhalten (Level 10 erreicht; Sichern nicht nötig; Level 14 erst ab Level 13; Einführung später; Flächenpreise 170 → 500 → 2.500) und die eigenen Häuser entwerfen.

**Fragen, die wir uns gestellt haben:**
- Welche Modelle haben wir? → Tobias' vollständiger Upload aus Chat 23 liegt in der Versionsgeschichte (Commit `465be0c`): Fantasy Town Kit 167, Castle Kit 76, Factory Kit rund 150 Teile. Keine Figuren, keine Uhr, kein Amboss.
- Woran erkennt man ein Gebäude? → Bauart je Reiter, Dachform in Reiterfarbe, Erkennungszeichen davor, ein Teil, das sich beim Arbeiten bewegt oder leuchtet.

**Gemacht:**
- `STAND.md`, `PLAENE.md` (Entwurf v0.42.0/v0.43.0 mit Tabelle je Gebäude), Archiv. Versionsnummer 0.41.2, Spiel unverändert.

**Geprüft:**
- `npm test`: 423 von 423 bestanden (nur Doku und Versionsnummer geändert).

### v0.41.1 – Kopieren getestet, Plan für die nächsten Schritte (22.11.2026, nur Doku)

**Vorgenommen:**
- Tobias' Test von v0.41.0 festhalten und die nächsten Schritte planen.

**Fragen, die wir uns gestellt haben:**
- Passt v0.41.0? → Ja: erste Kopie an sinnvoller Stelle, Stempel hilft, Bauleiste schließen fühlt sich gut an (Tobias).
- Lohnt es, die 2D-Ansicht zu entfernen, um den Browser-Test zu beschleunigen? → Kaum: gemessen braucht der 2D-Teil nur noch etwa 5 Minuten, der 3D-Teil etwa 13.

**Gemacht:**
- `STAND.md`, `PLAENE.md` (Entwurf der nächsten Schritte), Archiv. Versionsnummer 0.41.1, Spiel unverändert.

**Geprüft:**
- `npm test`: 423 von 423 bestanden (nur Doku und Versionsnummer geändert).

### v0.41.0 – Bereich kopieren, Bauleiste schließt beim Antippen (22.11.2026)

**Vorgenommen:**
- Den Entwurf „Bereich kopieren“ aus `PLAENE.md` umsetzen (Tobias: „du kannst das umsetzen“, „alles oder nichts ist sehr gut und dann eine kurze Meldung was fehlt“); dazu Tobias' Anmerkung, dass die Bauleiste nur mit ✕ zugeht.

**Fragen, die wir uns gestellt haben:**
- Wo erscheint die erste Kopie? → direkt neben dem Original: bei einer breiten Gruppe darunter, bei einer hohen rechts daneben (wie parallele Straßen); passt dort nichts, links bzw. oben.
- Wie funktioniert der Stempel? → Nach „✓ Hier bauen“ wartet die nächste Kopie im selben Abstand wie zwischen der vorigen und ihrem Vorgänger (erst Original → erste Kopie).
- Darf „✓ Hier bauen“ bei fehlenden Waren antippbar sein? → Ja: Es baut nichts und sagt, was fehlt; unten steht es schon vorher („⚠ Es fehlen: …“). Ausgegraut nur, wenn kein Platz ist.
- Bauleiste: Was schließt sie? → ein kurzes Antippen der Karte (ein angetipptes Gebäude oder Band zeigt sein Infofenster); Wischen nicht, nach dem Bauen bleibt sie offen (Tobias: „Ja, mit in v0.41.0“).

**Gemacht:**
- `core/area.js`: `planAreaMove` mit `copy` (Original als Hindernis, leere Gebäude mit Einstellung, leere Bänder), `copyCost`, `planAreaCopy` (Kosten, was fehlt, gesperrtes Gebäude), `copyArea` (alles oder nichts; Gebäude merken die Baukosten, Bänder `paid`). Spielstand-Format unverändert.
- `ui/controller.js`: Modus `areaCopy` (Vorschau, Text mit Kosten, Stempel, Meldungen), Antippen der Karte schließt die Bauleiste; `ui/buildbar.js` und `index.html`: Knopf „📋 Kopieren“, „✕ Fertig“ statt „✕ Abbrechen“ beim Kopieren.
- `view3d/scene3d.js` und `view2d/renderer.js`: Beim Kopieren bleibt das Original zu sehen und markiert; Abfrage `buildingVisible` für den Browser-Test.
- Tests: `tests/kopieren.test.js` (Kosten, leer mit Einstellung, alles oder nichts, kein Platz, gesperrt, gedreht, Stempel, Abreißen, Spielstand); Browser-Test 3D (kopieren, Stempel, zu wenig Waren, Fertig; Bauleiste: Wischen lässt offen, Antippen schließt) und 2D (Vorschau, Kosten, nichts gebaut).
- Doku: `STAND.md`, `SPIEL.md`, `BEDIENUNG.md`, `TECHNIK.md`, Archiv. Browser-Test: neuer Schalter `ONLY=2d` (nur die echte Fabrik).

**Geprüft:**
- `npm test`: 423 von 423 bestanden (6 neue in `kopieren.test.js`).
- Browser-Test, ganzer Lauf: alles bestanden bis auf eine falsche Erwartung im 2D-Teil (die markierte Gruppe hat 6 Bänder, die Kopie kostet also 46 statt 40 Holzblöcke – das Spiel zeigte es richtig); korrigiert und den 2D-Teil (`ONLY=2d`) noch einmal laufen lassen: 912 Prüfungen bestanden. 3D: 116 Prüfungen bestanden.
- Screenshots angesehen: Kopie als grüne Vorschau direkt neben dem markierten Original (3D und 2D, Tablet und Handy), unten Kosten und „⚠ Es fehlen: …“; auf dem Handy passen „Abreißen“, „Kopieren“, „Verschieben“, „Fertig“ nebeneinander.

### v0.40.2 – Weiche zurückgestellt, Entwurf Bereich kopieren (22.11.2026, nur Doku)

**Vorgenommen:**
- Tobias' Antwort zur Weiche und zum Verschieben festhalten, den nächsten Schritt planen.

**Fragen, die wir uns gestellt haben:**
- Bringt die Weiche etwas? → Tobias: nein, solange jede Ware ihre eigene Straße hat; bei ungleichem Verhältnis (5 hiervon, 10 davon) staut ein gemischtes Band. Im Code bestätigt: Maschinen nehmen jede Zutat an jedem Eingang an (`canAccept`), bei gleichem Verhältnis geht ein gemischtes Band also schon heute ohne Weiche.
- Ist das Verschieben jetzt flüssig? → Ja (Tobias).

**Gemacht:**
- `STAND.md`, `AUSBLICK.md`, `PLAENE.md` (Entwurf v0.41.0 „Bereich kopieren“, Weiche zurückgestellt), Archiv. Versionsnummer 0.40.2, Spiel unverändert.

**Geprüft:**
- `npm test`: 417 von 417 bestanden (nur Doku und Versionsnummer geändert).

### v0.40.1 – 3D gemessen, Entwurf Weiche (22.11.2026, nur Doku)

**Vorgenommen:**
- Tobias' Messung nach v0.40.0 festhalten und den nächsten Schritt (Weiche) planen.

**Fragen, die wir uns gestellt haben:**
- Reicht die 3D-Ansicht jetzt? → Ja: Belastungstest heraus- und hineingezoomt 60–80 Bilder/s (vorher herausgezoomt 40–50).
- Wie passt eine Weiche zu den Bändern? → Ein Band mit mehreren Ausgängen überspringt heute schon Richtungen, die nichts annehmen (`sim.js`); ein Band, das nur eine Ware hineinlässt, macht daraus eine Weiche (Vorschlag A).

**Gemacht:**
- `STAND.md`, `PLAENE.md` (Entwurf v0.41.0 mit Vorschlag A und B und drei Regeln), Archiv. Versionsnummer 0.40.1, Spiel unverändert.

**Geprüft:**
- `npm test`: 417 von 417 bestanden (nur Doku und Versionsnummer geändert).

### v0.40.0 – 3D schneller und lesbarer (22.11.2026)

**Vorgenommen:**
- Tobias' Messung (v0.39.1: herausgezoomt 40–50 Bilder/s, leicht ruckelig; großes Verschieben ruckelt) – den Entwurf aus `PLAENE.md` umsetzen, mit Vorschlag A („von weitem nur Statuslicht“); dazu Tobias' Fund: Bäume ragten aus Häusern, die auf ihnen gebaut wurden.

**Fragen, die wir uns gestellt haben:**
- Was kostet am meisten? → jedes Teil ein eigener Zeichenaufruf (Wände, Dächer, Band-Stücke, Zaunpfähle, Bäume, Pfeile mit eigenem Material je Pfeil, 7 Funken je Tor), Schatten doppelt. Gemessen mit `renderer.info.render.calls` im Belastungstest.
- Warum ruckelt das Verschieben? → die Vorschau wurde bei jedem Wechsel grün ↔ rot neu gebaut, und die Felder darunter bei jedem Fingerschritt als einzelne Teile.
- Handy: Dort steht die Kamera schon beim Start weiter weg → „von weitem“ hängt von der Bildschirmhöhe ab (Tablet ab 32, niedrigere Bildschirme bis doppelt so weit), sonst zeigte das Handy beim Start nur Lichter.

**Gemacht:**
- `src/view3d/merge.js` (neu): `mergeMeshes`, `mergeStatic`, `disposeMerged`, `flatRects`.
- `kenney3d.js`: jedes Haus beim Bauen zusammengefügt (Wasserrad und Schimmer bleiben für sich); Funken als `InstancedMesh`.
- `scene3d.js`: Pfeile mit gemeinsamen Materialien, alle Pfeile aller Gebäude, alle Bänder (mit Laufpfeilen) sowie Zaun, Bäume, Felsen als je ein Teil (neu nur bei Änderungen oder beim Verschieben); Waren als `InstancedMesh` je Sorte ohne Schatten; Statuslichter von weitem als ein `Points`-Teil; Markierungen, Felder und Band-Strecke als `flatRects`; Vorschau beim Verschieben nur einmal gebaut, grün ↔ rot tauscht das Material; Bäume und Felsen nur außerhalb der Welt (Abstand 1,5).
- `view3d.js`/`main.js`: `drawCalls()`, `farSigns()`, `treesInWorld()` für den Browser-Test.
- Browser-Test `spiel3d.cjs`: keine Bäume auf der Welt; Belastungstest herausgezoomt nur Statuslichter und < 1.000 Zeichenaufrufe, nah wieder Schilder (Screenshot `3d-13-belastungstest-weit`).

**Geprüft:**
- Gemessen (volle Fläche, 156 Gebäude, 312 Bänder): herausgezoomt 6.207 → 734 Zeichenaufrufe je Bild, mittel 3.738 → etwa 480, nah etwa 450.
- `npm test`: 417 von 417 bestanden.
- Browser-Test: alle 996 Prüfungen bestanden (im 3D-Teil zeigte das Handy zuerst beim Start nur Lichter – behoben, s. o.); Screenshots vorher/nachher verglichen (gleiches Aussehen, auch die Vorschau beim Verschieben).

### v0.39.1 – Belastungstest gemessen (22.11.2026, nur Doku)

**Vorgenommen:**
- Tobias' Messung festhalten und den nächsten Schritt planen.

**Fragen, die wir uns gestellt haben:**
- Wie flüssig ist eine volle Fläche auf dem Tablet? → herausgezoomt 40–50 Bilder/s (leicht ruckelig), nah etwa 70 (flüssig); größere Bereiche verschieben ruckelt leicht.
- Warum ruckelt das Verschieben? → die Vorschau verdoppelt die Zeichenaufrufe der Gruppe und wird bei jedem Wechsel grün ↔ rot neu gebaut (`syncArea` in `scene3d.js`).

**Gemacht:**
- `STAND.md`, `PLAENE.md` (Entwurf v0.40.0), Archiv. Versionsnummer 0.39.1, Spiel unverändert.

**Geprüft:**
- `npm test`: 417 von 417 bestanden (nur Doku und Versionsnummer geändert).

### v0.39.0 – Belastungstest (22.11.2026)

**Vorgenommen:**
- Tobias (Chat 25): „Lass uns erst sehen, wie der Belastungstest ist“ – auf dem Tablet ablesen, wie flüssig der 3D-Test mit einer voll bebauten Fläche läuft (Analyse v0.38.1: 3.700–6.200 Zeichenaufrufe je Bild).

**Fragen, die wir uns gestellt haben:**
- Wie bleibt Tobias' Spielstand sicher? → eigene Adresse `?belastungstest=1` mit eigenem Speicherplatz (`STRESS_SLOT`); dort wird nie gespeichert, auch „Neues Spiel“ oder „Laden“ träfen nur diesen Platz. Vor dem Wechsel speichert das eigene Spiel.
- Wie realistisch? → die ganze Fläche von Level 13 (46 × 38) mit 52 Straßen aus vier Arten (Holz, Stein, Eisen, Glas), alle mit Waren auf den Bändern.

**Gemacht:**
- `src/core/belastungstest.js` (`createStressFactory`), `main.js` (`STRESS_TEST`, kein Laden, kein Speichern, `onStressTest`), `storage.js` (`STRESS_SLOT`), Menüeintrag „🏭 Belastungstest (volle Fabrik)“ (nur im Testmodus des 3D-Spiels) und Hinweis mit „↩ Beenden“ (`index.html`, `hud.js`, `style.css`).
- Tests: `belastungstest.test.js` (volle Fläche, alle Haus-Arten, läuft, speichert nie), `dreid.test.js` angepasst, Browser-Test `spiel3d.cjs` (Menüeintrag nur im Testmodus, volle Fabrik, Hinweis passt, nichts gespeichert, Beenden; Screenshot `3d-12-belastungstest`).

**Geprüft:**
- `npm test`: 417 von 417 bestanden.
- Browser-Test: alle 990 Prüfungen bestanden. Beim ersten Versuch schlug eine neue Prüfung fehl, weil sie den 3D-Spielstand vor dem gewollten Speichern beim Wechsel verglich – Prüfung korrigiert. Screenshot auf dem Handy angesehen (Hinweis passt, volle Fabrik sichtbar).

### v0.38.1 – Analyse als Spielentwickler (22.11.2026, nur Doku)

**Vorgenommen:**
- Tobias' zweiter Wunsch aus Chat 25: als Spielentwickler die sinnvollsten nächsten Schritte analysieren und vorschlagen.

**Fragen, die wir uns gestellt haben:**
- Schafft die 3D-Ansicht große Fabriken? → gemessen mit einem Playwright-Skript im Scratchpad (nicht im Projekt): Startfabrik etwa 260 Zeichenaufrufe je Bild, voll bebaute Fläche 46 × 38 (52 Holz-Straßen: 156 Gebäude, 312 Bänder) etwa 3.700 bei normalem Zoom und 6.200 ganz herausgezoomt; ein Tablet schafft flüssig grob 1.000–2.000.
- Was fehlt dem Spiel am meisten? → siehe `PLAENE.md` („Analyse als Spielentwickler“).

**Gemacht:**
- `PLAENE.md` (Analyse mit Befunden und Reihenfolge), `STAND.md`, Archiv. Versionsnummer 0.38.1, Spiel unverändert.

**Geprüft:**
- `npm test`: 414 von 414 bestanden (nur Doku und Versionsnummer geändert).

### v0.38.0 – Start im 3D-Test (22.11.2026)

**Vorgenommen:**
- Tobias (Chat 25): „Ja, jetzt das 3D Spiel fokussieren, weil die Kenny dateien alle funktionen und das Spiel spielbar aussieht und funktioniert.“ – der Link soll direkt den 3D-Test öffnen.

**Fragen, die wir uns gestellt haben:**
- Was passiert mit den Spielständen? → nichts: Der 3D-Test bleibt unter `erstesspiel-spielstand-3d-test`, die echte Fabrik unter `erstesspiel-spielstand`.
- Wie kommt man zur echten Fabrik? → Menü ☰ → „🗺️ Zur echten Fabrik (2D)“ bzw. `?ansicht=2d`; zurück mit „🧊 Zurück zum 3D-Test“. Alte Links mit `?ansicht=3d` öffnen weiter den 3D-Test.

**Gemacht:**
- `main.js`: `VIEW_3D` gilt, solange nicht `?ansicht=2d` dasteht; Wechsel `index.html?ansicht=2d` ↔ `index.html`; die Meldung bei einem Ladefehler nennt `?ansicht=2d`. Menütexte in `index.html` und `hud.js`.
- Tests: `dreid.test.js` (Adresse und Wechsel), Browser-Test – der 2D-Teil öffnet `?ansicht=2d`, der 3D-Teil wechselt aus der echten Fabrik zum Link ohne Zusatz und wieder zurück.
- Doku: `STAND.md`, `SPIEL.md`, `TECHNIK.md`, `BEDIENUNG.md`, `README.md`, Archiv.

**Geprüft:**
- `npm test`: 414 von 414 bestanden.
- Browser-Test (Tablet und Handy im Querformat, Hochformat, schmales Handy, 3D-Test): alle 976 Prüfungen bestanden; Screenshots angesehen (Menü in 2D mit „🧊 Zurück zum 3D-Test“, Start im 3D-Test mit 500 Gold).

### v0.37.0 – neue Ordnung (22.11.2026)

**Vorgenommen:**
- Tobias (Chat 25): „eine neue Ordnerstruktur …, damit wir einfacher und schneller arbeiten können“ und Claude „nicht so viel lesen“ muss; die echte Fabrik ist hinten angestellt, der Fokus liegt auf dem 3D-Test; die Grafik-Probe darf weg.

**Fragen, die wir uns gestellt haben:**
- Was liest Claude wirklich? → zu Beginn etwa 62 KB Doku (jetzt etwa 22 KB), beim Programmieren dazu `TECHNIK.md` (37 KB, jetzt etwa 11 KB); die großen Ordner (three.js, Kenneys Modelle) nie.
- Wohin mit den Einzelheiten? → Tabellen und Bedienung nach `docs/inhalte/` (gelesen nur bei Bedarf), die alten Langfassungen wörtlich ins Archiv (`STAND-LANGFASSUNG.md`, `SPIEL-LANGFASSUNG.md`, `TECHNIK-LANGFASSUNG.md`) – nichts geht verloren.
- Was fällt mit der Grafik-Probe weg? → `grafik-probe.html`, `src/probe/probe.js`, `factory.js`, `world3d.js`, der Menü-Eintrag, der Modern-Stil (Maschinen, Leuchtring, Umgebung mit Laternen und Weg, Abendlicht), die Modelle, die nur sie brauchte (15 aus dem Factory Kit, Zauntor, Laterne, Weg) und `OrbitControls.js`. Der 3D-Test sieht genauso aus wie vorher.

**Gemacht:**
- Doku: `STAND.md` (7,7 KB), `SPIEL.md` (7,3 KB) und `TECHNIK.md` (10,5 KB) neu und kurz; `docs/inhalte/` mit `LEVEL.md`, `GEBAEUDE.md`, `WAREN.md`, `BEDIENUNG.md`, `AUSBLICK.md` (die Texte wörtlich aus der alten `SPIEL.md`, ohne die Grafik-Probe); `CLAUDE.md` und `README.md` angepasst (was wann gelesen wird, neue Pfade).
- Code: `src/view/` → `src/ui/` (Oberfläche für 2D und 3D); `renderer.js` und `camera.js` → `src/view2d/`; `kenney3d.js`, `kenneyParts.js`, `models.js` → `src/view3d/` (nur noch Mittelalter in Spiel-Farben, ohne die Parameter für Stil und Farbwahl); `PROBE_IMPORTS` heißt `THREE_IMPORTS`, `set-version.mjs` schreibt nur noch `index.html`. `assets/kenney/` 0,9 → 0,6 MB.
- Tests: `grafikprobe.test.js` → `modelle3d.test.js` (Modelle, Farbtafeln, Band-Stücke mit einer kleinen Test-Fabrik, three.js nur im 3D-Test, Probe entfernt); `version.test.js` prüft strengere Größen (STAND < 10.000, SPIEL < 12.000, TECHNIK < 16.000, CLAUDE < 9.000 Byte) und dass `docs/inhalte/` und die Langfassungen da sind. Browser-Test aufgeteilt: `smoke.cjs` (startet), `helpers.cjs`, `spiel2d.cjs`, `spiel3d.cjs`; der Probe-Durchlauf fällt weg.

**Geprüft:**
- `npm test`: 414 von 414 bestanden.
- Browser-Test (Tablet und Handy im Querformat, Hochformat, schmales Handy, 3D-Test): 2D-Teil alles bestanden; im 3D-Teil erwartete eine Prüfung noch mindestens 40 Modelle (jetzt 33, gewollt) – angepasst, danach `ONLY=3d` alle 72 Prüfungen bestanden. Die Screenshots sind Bild für Bild verglichen: Unterschiede nur bei der Versionsnummer, einer Meldung, die zu einem anderen Zeitpunkt erschien, und im Menü (ohne „🎨 Grafik-Probe“); die 3D-Bilder sind gleich.

### v0.36.2 – neue Ordnung geplant (22.11.2026, nur Doku)

**Vorgenommen:**
- Tobias' Wunsch festhalten (Chat 25): echte Fabrik hinten anstellen, im 3D-Test weiterspielen, zuerst eine neue Ordnerstruktur, danach eine Analyse als Spielentwickler.

**Fragen, die wir uns gestellt haben:**
- Was liest Claude wirklich? → zu Beginn etwa 62 KB Doku, beim Programmieren dazu `TECHNIK.md` (37 KB) und die betroffenen Dateien; three.js und Kenneys Modelle (die MB-Ordner) nie, das Archiv nur per Suche.
- Was bringt am meisten? → die Doku schlanker machen, den Code in Bereiche ordnen, den großen Browser-Test aufteilen (Entwurf v0.37.0).

**Gemacht:**
- `STAND.md` (Status, Nächster Schritt, Tobias' 3D-Test, letzte Arbeitsschritte), `PLAENE.md` (Entwurf v0.37.0), Archiv. Versionsnummer 0.36.2, Spiel unverändert.

**Geprüft:**
- `npm test`: 419 von 419 bestanden (nur Doku und Versionsnummer geändert).

### v0.36.1 – schnellerer Start getestet (22.11.2026, nur Doku)

**Vorgenommen:**
- Tobias' Rückmeldung zum schnelleren Start festhalten (Regel „Nichts darf verloren gehen“).

**Fragen, die wir uns gestellt haben:**
- Passt der neue Start? → Ja: „bisher fühlt er sich sehr gut an“; die 500 Gold „fallen nicht so schwer ins Gewicht und erleichtern die ersten Level erheblich“ (am PC getestet).
- Wie weiter? → Tobias entscheidet: weitere Häuser für Level 2+ im 3D-Test, 3D für die echte Fabrik oder Level 14.

**Gemacht:**
- `STAND.md` (Status, Nächster Schritt, offene Frage 1, letzte Arbeitsschritte), Archiv. Versionsnummer 0.36.1, Spiel unverändert.

**Geprüft:**
- `npm test`: 419 von 419 bestanden (nur Doku und Versionsnummer geändert).

### v0.36.0 – schnellerer Start (21.11.2026)

**Vorgenommen:**
- Den Anfang beschleunigen (Tobias, Chat 24, beim Spielen des 3D-Tests: „am Anfang sehr lange warten … bis man die einzelnen Aufträge erledigt hat“).

**Fragen, die wir uns gestellt haben:**
- Wie viel Startgold? → 500 Gold (Tobias: „sozusagen als "Startkapital" - kann man später vermutlich auch geschichtlich ganz gut einbinden“); damit lassen sich gleich 2 Holzstämme dazukaufen (183 Gold je Stamm). Gilt nur für neue Spielstände; die Umwandlung sehr alter Spielstände (Startkapital vor Format 8) bleibt unberührt.
- Wie schnell verkaufen die Theken am Anfang? → Level 1–3 genau alle 15 Sekunden statt zufällig 15–25 (Tobias' Zahl) – je Theke 4 statt 3 Stück pro Minute, die 2 Start-Theken 480 statt 360 Stück pro Stunde. Im Laden steht dann „alle 15 Sekunden“ statt „alle 15–15“.
- Bilder pro Sekunde → im 3D-Test immer sichtbar (Claudes Vorschlag), im 2D-Spiel weiter nur im Testmodus.

**Gemacht:**
- `data/shop.js`: `START_GOLD` 500, `customerSeconds` Level 1–3 [15, 15]. `view/shop.js`: Text „alle 15 Sekunden“ bzw. „etwa alle 25–45 Sekunden“ (`secondsText`). `hud.js`/`main.js`: Bilder pro Sekunde im 3D-Test. Tests: Startgold, Tempo je Level, Kunden pro Stunde, Browser-Test (Start 500 Gold, Auffüllen kauft 2 Stämme dazu, Bilder pro Sekunde im 3D-Test).

**Geprüft:**
- `npm test`: 419 von 419 bestanden.
- Browser-Test in Tablet- und Handygröße: alle Prüfungen bestanden.

### v0.35.0 – 3D-Test, Teil 2: Tor, Bereich markieren, Fläche kaufen (21.11.2026)

**Vorgenommen:**
- Tobias' Test des 3D-Tests umsetzen: das falsch gedrehte Tor richten und, wie geplant, Bereich markieren und Fläche kaufen in 3D (Tobias: „Können wir Tor drehen und Bereich markieren, die Punkte als nächsten Schritt gemeinsam machen?“).

**Fragen, die wir uns gestellt haben:**
- Warum musste die Ware seitlich ins Tor? → Claude hatte das Burgtor in v0.34.0 um 90° gedreht, weil eine Probe-Ansicht das Modell schon gedreht gezeigt hatte. Kenneys Tor ist von sich aus in x-Richtung offen – genau wie das Band, das von Westen hineinfährt. Jetzt ungedreht (auch in der Grafik-Probe).
- Wie sieht man beim Verschieben, wo der Bereich war? → Er verschwindet an der alten Stelle, dort bleiben blasse Felder; die Vorschau (Häuser und Bänder halbdurchsichtig grün bzw. rot) zeigt die neue Stelle, darunter grüne bzw. rote Felder.
- Wo stehen die Schilder zum Flächenkauf? → Sie schweben vor dem Zaun, mittig zur Seite; sie wachsen mit der Entfernung weniger mit als die Schilder über den Gebäuden.
- Schneller Start (500 Gold, Theken alle 15 Sekunden) → kommt danach (v0.36.0, Tobias).

**Gemacht:**
- `kenney3d.js`: Tor ungedreht. `scene3d.js`: `syncArea` und `syncLand`, Auswahl eines Streifens. Steuerung ohne die Sperren aus v0.34.0 (`areaTool`, `landPurchase` entfernt).

**Geprüft:**
- `npm test`: 419 von 419 bestanden.
- Browser-Test in Tablet- und Handygröße: alle Prüfungen bestanden, neu im 3D-Test Bereich markieren, verschieben, drehen und Fläche kaufen (Screenshots `3d-8` bis `3d-11`) angesehen.

### v0.34.0 – 3D-Test, Teil 1: Level 1 in 3D spielen (21.11.2026)

**Vorgenommen:**
- Level 1 testweise in der neuen Grafik spielbar machen (Tobias, Chat 23: „sodass man evtl. das erste Level in dieser neuen Grafik spielen kann“), mit seinen Entscheidungen aus der Grafik-Probe: frei drehbar, Mittelalter, Spiel-Farben, eigene Häuser je Gebäude.

**Fragen, die wir uns gestellt haben:**
- Eigener Test-Spielstand oder Schalter für die echte Fabrik? → eigener Spielstand ab Level 1 (Tobias: A, „Ich will es erstmal testen, bevor wir die ganze Spielwelt in die "Neue Grafik" holen.“).
- Wie sieht das Versandportal aus? → Tobias wollte es erst herausnehmen; ohne Portal bleibt der Start aber stecken (die ersten Holzblöcke kommen nur übers Portal ins Laden-Lager). Dann: „sehr schlicht … mehr ein Torbogen … mit einem kleinem mythischen Schauer“ → Kenneys kleines Burgtor (Castle Kit, `wall-narrow-gate`) in warmem Steingrau mit violettem Schimmer und Funken. Kenneys Pakete lagen noch im Verlauf des Projekts, Tobias musste nichts neu hochladen.
- Wie kommt die 3D-Ansicht ins Spiel, ohne das 2D-Spiel zu belasten? → dieselbe Seite mit `?ansicht=3d`; `main.js` lädt die 3D-Ansicht (und three.js) nur dann nach. Die Steuerung bleibt dieselbe und fragt im 3D-Test die 3D-Kamera nach dem Feld unter dem Finger.
- Wie dreht man, ohne beim Bauen versehentlich zu drehen? → Ein Finger bleibt wie im 2D-Spiel (verschieben bzw. bauen), zwei Finger zoomen, verschieben und drehen; dazu Knöpfe ⟲ ⟳ und Tasten Q/E (je 45°, weich).

**Gemacht:**
- Neue Dateien `src/view3d/view3d.js`, `camera3d.js`, `scene3d.js`; Menü-Eintrag „🧊 3D-Test (Level 1)“ bzw. „🗺️ Zurück zur echten Fabrik (2D)“; eigener Spielstand (`useSaveSlot`), Anzeige „Lädt die Modelle …“, oben „· 3D-Test“; Kamera mit Neigung je nach Zoom und Startansicht um die Gebäude; Schilder über den Gebäuden (wie die 2D-Karte), Pfeile an den Anschlüssen, Vorschau beim Bauen (halbdurchsichtig grün/rot), Band-Vorschau, Auswahlrahmen, Hüpfen, Wasserrad; Zaun ums Grundstück, Bäume um die Welt; Gebäude ohne eigenes Haus als Steinhaus mit Dach in Reiterfarbe bzw. Beet. „Verschieben“ (Bereich) und Fläche kaufen sind im 3D-Test noch aus.
- Grafik-Probe: Das Portal im Mittelalter ist dort jetzt ebenfalls das Burgtor (der Brunnen `fountain-round` wurde entfernt).

**Geprüft:**
- `npm test`: 418 von 418 bestanden (neu: `tests/dreid.test.js`).
- Browser-Test in Tablet- und Handygröße: alle Prüfungen bestanden, neu der 3D-Test (`run3d`, Screenshots `3d-1-start` bis `3d-7-nah`) angesehen.

### v0.33.1 – Grafik-Probe, Teil 2 getestet (21.11.2026, nur Doku)

**Vorgenommen:**
- Tobias' Feedback zur Grafik-Probe, Teil 2 festhalten, damit es im neuen Chat weitergeht.

**Fragen, die wir uns gestellt haben:**
- Welche Richtung? → frei drehbare Kamera, Mittelalter, Spiel-Farben, eigene Häuser je Gebäude; konstant 60 Bilder pro Sekunde. Offen: das Versandportal und ob moderne Teile mittelalterlicher werden (ohne Greifarm).
- Wie weiter? → Level 1 testweise in der neuen Grafik spielbar machen; Plan im neuen Chat.

**Gemacht:**
- `STAND.md` (Status, Nächster Schritt, offene Frage 15, letzte Arbeitsschritte), `PLAENE.md` („Level 1 in der neuen Grafik – vorgemerkt“), Archiv. Versionsnummer 0.33.1, Spiel unverändert.

**Geprüft:**
- `npm test`: 414 von 414 bestanden (nur Doku und Versionsnummer geändert).

### v0.33.0 – Grafik-Probe, Teil 2: Kenneys Modelle (20.11.2026)

**Vorgenommen:**
- Die Platzhalter der Grafik-Probe durch Kenneys 3D-Modelle ersetzen (Mittelalter: Fantasy Town Kit und Castle Kit, Modern: Factory Kit) und einen Schalter „Farben: Kenney ↔ Spiel“ einbauen (Tobias: „Ja lass uns beides probieren, damit ich alles sehen kann“).

**Fragen, die wir uns gestellt haben:**
- Wie kommen die Pakete ins Projekt? → Die eigene Umgebung mit kenney.nl hat Tobias bestätigt, aber kenney.nl lässt keine automatischen Programme zu; Tobias hat die drei Pakete selbst heruntergeladen und auf GitHub hochgeladen. Ins Projekt kommen nur die 51 gebrauchten Modelle (1,1 MB), die ZIP-Dateien nicht.
- Wie bekommen die Modelle andere Farben? → Alle Modelle eines Pakets nutzen eine gemeinsame Farbtafel; für „Farben: Spiel“ und die Holz-Bänder malt die Probe einzelne Felder einer Kopie nach (Helligkeit bleibt).
- Kenneys Kurven- und Abzweigteile passen in Farbe und Breite nicht zu den geraden Bändern → Kurven, Abzweige und Kreuzungen setzen sich aus „Armen“ zusammen.
- Wie bleiben die reinen Daten testbar? → Modell-Liste, Farbtafeln und Band-Stücke stehen in `src/probe/kenneyParts.js` ohne three.js.

**Gemacht:**
- `assets/kenney/` (je Paket Modelle, Farbtafel, Lizenz), `GLTFLoader` mit Hilfsdateien in `vendor/three-0.187.0/`, neue Dateien `src/probe/kenneyParts.js`, `models.js`, `kenney3d.js`; `world3d.js` baut Gebäude, Bänder und Umgebung daraus (bei Stil- oder Farbwechsel neu), `probe.js` lädt zuerst die Modelle („Lädt …“) und hat den Schalter „Farben“; auf dem Handy heißt der Kamera-Knopf nur „📐 Schräg“.
- Tests: Modelle und Lizenz im Projekt, Größe, verbaute Modelle ↔ Liste, Umfärben, Leucht-Tafel, Band-Stücke; Browser-Test mit Modellen, Farben-Schalter und drehendem Wasserrad bzw. Zahnrad.
- Doku: `STAND.md`, `SPIEL.md`, `TECHNIK.md`, `vendor/README.md`, Archiv. Versionsnummer 0.33.0.

**Geprüft:**
- `npm test`: 414 von 414 bestanden.
- Browser-Test (Tablet und Handy quer): 956 von 957 Prüfungen bestanden – rot war „Die Probe zeichnet laufend“ auf dem Tablet (0 Bilder/s): ohne Grafikchip braucht ein Bild mit den Modellen über eine Sekunde, und die Anzeige zählte langsame Bilder nur mit höchstens ¼ Sekunde. Behoben: Die Bilder pro Sekunde zählen jetzt nach der echten Zeit, der Test wartet bis zu 15 Sekunden auf die erste Zählung. Danach den Probe-Teil in Tablet- und Handygröße noch einmal laufen lassen: alle Prüfungen bestanden. Screenshots angesehen (Mittelalter und Modern, beide Farben, Abend, frei drehbar, Handy mit kurzem Kamera-Knopf).

### v0.32.1 – Grafik-Probe getestet, Kenney im nächsten Chat (20.11.2026, nur Doku)

**Vorgenommen:**
- Tobias' Test der Grafik-Probe festhalten (60–90 Bilder pro Sekunde auf dem Tablet) und den Ablauf für den nächsten Chat: auf „Bringe dich auf den aktuellen Stand“ nach den Kenney-Sachen fragen, Tobias gibt am PC die Freigabe, sonst lädt er die Pakete hoch.

**Fragen, die wir uns gestellt haben:**
- Warum ging die Freigabe nicht? → Auf dem Tablet zeigte die App, dass die Freigabe nur am PC geht.

**Gemacht:**
- `STAND.md` (Nächster Schritt mit genauem Ablauf), `PLAENE.md` („Grafik-Probe, Teil 2“), Archiv. Versionsnummer 0.32.1, Spiel unverändert.

**Geprüft:**
- `npm test`: 405 von 405 bestanden (nur Doku und Versionsnummer geändert).

### v0.32.0 – Grafik-Probe, Teil 1 (20.11.2026)

**Vorgenommen:**
- Die Grafik-Probe nach dem Entwurf v0.32.0 (Tobias: „Passt alles so, du darfst loslegen.“).

**Fragen, die wir uns gestellt haben:**
- Wie kommen Kenneys Modelle ins Projekt? → kenney.nl ist in der Arbeitsumgebung gesperrt; die vorgeschlagene Freigabe wurde abgelehnt, npm hat nur inoffizielle Kopien. Teil 1 deshalb mit Platzhalter-Gebäuden; Tobias entscheidet den Weg.
- Wie kommt three.js ohne Build-Schritt ins Spiel? → unverändert in `vendor/three-0.187.0/` (Version im Ordnernamen), Import-Map nur in `grafik-probe.html`.
- Wie bleiben Spiel und Probe beim Laden zusammen? → `tools/set-version.mjs` schreibt die Import-Map auch in `grafik-probe.html`.
- Läuft die Probe nach den echten Regeln? → Ja: `src/probe/factory.js` baut die Fabrik mit `src/core` und rechnet in festen Takten; die Waren stehen dort, wo sie auch im 2D-Spiel stehen.
- Auf dem Handy verdeckten Leiste und Hinweis die Fabrik → mehr Welt in der Schräg-Ansicht auf niedrigen Bildschirmen, Hinweis mit ✕.

**Gemacht:**
- `grafik-probe.html`, `src/probe/factory.js`, `src/probe/world3d.js`, `src/probe/probe.js`, `vendor/` mit three.js r187 und Lizenz; Menü-Eintrag „🎨 Grafik-Probe“ (`index.html`, `hud.js`, `main.js`); `tools/set-version.mjs`.
- Tests: neue Datei `tests/grafikprobe.test.js` (7 Tests); Browser-Test `runProbe` in Tablet- und Handygröße.
- Doku: `SPIEL.md`, `STAND.md`, `TECHNIK.md`, Archiv.

**Geprüft:**
- `npm test`: alle bestanden. Browser-Test: alle Prüfungen bestanden (auch die Probe in Tablet- und Handygröße), Screenshots angesehen. Im Test ohne Grafikchip zeichnet die Probe nur etwa 5 Bilder pro Sekunde – wie flüssig sie wirklich ist, zeigt erst Tobias' Tablet.

### v0.31.1 – Grafik-Probe geplant (20.11.2026, nur Doku)

**Vorgenommen:**
- Tobias' Antworten auf die Grafik-Fragen festhalten (Probe jetzt, sehen „was alles möglich ist“, Mittelalter – notfalls modern, Sound später) und den Plan für die Grafik-Probe schreiben.

**Fragen, die wir uns gestellt haben:**
- A (Bilder in Schrägansicht) oder B (echtes 3D)? → Mit three.js ist der Clash-of-Clans-Look eine Kamera-Einstellung; die Probe zeigt beides zum Umschalten.
- Kommen wir an die Bausteine? → three.js über npm: ja. kenney.nl: in der Arbeitsumgebung gesperrt – Freigabe erst nach Tobias' OK anfragen.

**Gemacht:**
- `PLAENE.md`: Entwurf v0.32.0 „Grafik-Probe“ mit 4 Fragen. `STAND.md`, Archiv. Versionsnummer 0.31.1, Spiel unverändert.

**Geprüft:**
- `npm test`: 398 von 398 bestanden (nur Doku und Versionsnummer geändert).

### v0.31.0 – Level 13 „Die Glashütte“ (20.11.2026)

**Vorgenommen:**
- Level 13 nach dem Entwurf v0.30.3 mit Tobias' Änderungen: Fläschchen 30 s, der Ofen heißt schon ab Spielbeginn „Ofen“. Mörser (Steinplatte + 3 Holzstäbe) für Level 14 festhalten. Danach Tobias' Frage zur 3D-Grafik beantworten.

**Fragen, die wir uns gestellt haben:**
- Wie nimmt der Ofen Sand? → Wie die Erntebank mehrere Pflanzen: `inputs` mit Holzstamm und Sand, je 100 Stück in 15 Minuten. Sand-Knöpfe gibt es erst, wenn Sand freigeschaltet ist; bis Level 12 sieht der Ofen aus wie bisher (auch der Status ohne Rohstoff-Namen).
- Muss das Spielstand-Format steigen? → Nein: Rohstoff-Gebäude speichern ihren Rohstoff schon (seit v0.17.0); ein alter Kohlenmeiler lädt als Ofen.
- Wie kommt die 6. Theke auf Level 13? → `COUNTERS.levels` (ab welchem Level), `buyCounter` antwortet 'level'; die Ansicht zeigt „🔒 Ab Level 13 · 150.000 🪙“.
- Wie erfährt man, dass der Ofen jetzt Glas macht? → Das Level-Fenster und die Aufstiegsmeldung nennen „♨️ Ofen: Glas aus Sand“ und „⚖️ Theke 6 kaufen (150.000 Gold)“.
- Der Browser-Test fand abgeschnittene Knöpfe im Ofen-Fenster („🧺 [Bild] kaufen · 1.100 🪙“) → bei zwei kaufbaren Rohstoffen steht vorne nur das Warenbild.

**Gemacht:**
- Datentabellen: Ofen (`kohlenmeiler`, Name „Ofen“, Tipp), Sand, Glas, Fläschchen (Rezept der Schmiede, `level: 13`, 30 s), Level 13 mit Geschichte und 4 Aufträgen, Laden für Level 13, 6. Theke 150.000 ab Level 13; Level-9-Geschichte „Holzkohle aus dem neuen Ofen“.
- `market.js` (`counterLevel`, Theken-Plätze mit Level), `shop.js` (Ansicht), `controller.js` (Kaufen-Knöpfe), `buildingInfo.js` („je Pflanze“ nur bei Pflanzen), `production.js` (Status), `levels.js` (Ankündigung), `itemArt.js` (Sandsack, Glasklumpen, Fläschchen mit Korken).
- Tests: neue Datei `tests/glashuette.test.js` (20 Tests), angepasst: höchstes Level 13, Theken (6. ab Level 13), Erfahrung je Level, Ofen-Daten; Browser-Test mit Level 13 (Screenshots `24a` bis `24e`).
- Doku: `SPIEL.md`, `STAND.md`, `TECHNIK.md`, Archiv; Überlegung zur Grafik in `PLAENE.md`.

**Geprüft:**
- `npm test`: alle bestanden. Browser-Test in Tablet- und Handygröße: alle Prüfungen bestanden, Screenshots angesehen (Ofen leer mit zwei Rohstoffen, Ofen mit Sand, Schmiede auf Fläschchen, Theken auf Level 13).

### v0.30.3 – Antworten zum Tränke-Kapitel, Entwurf Level 13 (19.11.2026, nur Doku)

**Vorgenommen:**
- Tobias' Antworten auf die 6 Fragen aus v0.30.2 festhalten (Ofen, Fläschchen in der Schmiede, Mörser auf Level 14 nicht 1 : 1 und auf Level 15 eine Maschine zum Zerkleinern, Tinktur später, kein Reiter „Tränke“, 10.000 Gold) und den Entwurf für Level 13 schreiben.

**Fragen, die wir uns gestellt haben:**
- Wie viel Glas bringt ein Sack Sand? → Wie der Holzstamm im Ofen 100 Stück in 15 Minuten – dann gelten für beide Rohstoffe dieselbe Menge und Zeit, wie bei der Erntebank.
- Was kostet Sand? → 1.100 Gold (teurer als Kamillensamen mit 830), Glas 12, Fläschchen 72 – die Regeln +9 % und +20 % bleiben.
- „eine Holzplatte und 3 Holzstäbe“ für den Mörser, aber davor „Steinplatte und Holzstab“? → als Frage für Level 14 an Tobias.

**Gemacht:**
- `PLAENE.md`: Tobias' Antworten wörtlich, Entwurf Level 13 „Die Glashütte“ mit 4 Fragen; Plan v0.30.2 als beantwortet markiert. `SPIEL.md`: Ausblick und Leitlinie. `ENTSCHEIDUNGEN.md`, `STAND.md`, Archiv. Versionsnummer 0.30.3, Spiel unverändert.

**Geprüft:**
- `npm test`: 378 von 378 bestanden (nur Doku und Versionsnummer geändert).

### v0.30.2 – Tränke-Kapitel: alte Maschinen statt neuer (19.11.2026, nur Doku)

**Vorgenommen:**
- Tobias' Rückmeldung zum Entwurf v0.30.1 festhalten: keine neue Maschine je Level, alte Maschinen bekommen neue Funktionen; Kohlenmeiler → „Ofen“ mit Sand → Glas ab Level 13; Fläschchen in einer alten Maschine; Level 14 der Mörser als Ware, Level 15 als Maschine (Kräuter, Kohle, Sand → Staub); Grundzutat aus Fläschchen + Kräutermischung, dann der erste Zaubertrank; Linse → Lupe/Fernrohr gut. Weiter im nächsten Chat.

**Fragen, die wir uns gestellt haben:**
- Lässt sich das so bauen? → Ja: Einstellungen ab einem Level gibt es schon (Wundverband, Reißbrett), Rohstoff-Gebäude mit mehreren Rohstoffen auch (Erntebank).
- Eisenblech und Eisenstangen „in der Feinschmiede“? → Die macht die Schmiede; im Plan als Frage an Tobias.

**Gemacht:**
- `PLAENE.md`: überarbeiteter Plan mit Tobias' Worten, Claudes Einschätzung und 6 Fragen; der Entwurf v0.30.1 ist als überholt markiert. `SPIEL.md`: neue Leitlinie. `ENTSCHEIDUNGEN.md`, `STAND.md` (zeigt wieder 3 Arbeitsschritte – seit v0.30.0 standen dort versehentlich nur 2), Archiv. Versionsnummer 0.30.2, Spiel unverändert.

**Geprüft:**
- `npm test`: 378 von 378 bestanden (nur Doku und Versionsnummer geändert).

### v0.30.1 – Lager getestet, Entwurf Tränke-Kapitel (19.11.2026, nur Doku)

**Vorgenommen:**
- Tobias' Rückmeldung zu v0.30.0 festhalten („Das größere Lager ist getestet und funktioniert“) und den Entwurf für das Tränke-Kapitel ab Level 13 schreiben.

**Fragen, die wir uns gestellt haben:**
- Wie fängt das Kapitel an? → Wieder einfach wie Level 1 und 7: Level 13 nur Sand, Glas und Fläschchen; die ersten Tränke mit Level 14, der Alchemist mit Level 15 (Tobias: „erst um Level 15“).
- Wohin mit den neuen Gebäuden (höchstens 4 je Reiter)? → Sandwäsche und Glashütte in „Stein“ (2 Plätze frei), Glasbläserei, Trankküche, Mörser und Alchemistenlabor in den neuen Reiter „Tränke“ – reicht bis Level 15.
- Passen 6 Reiter auf das Handy? → Mit Namen nicht (5 Reiter reichen auf 844 Bildpunkten schon bis 822). Vorschlag: auf allen Handys nur der Name des geöffneten Reiters.

**Gemacht:**
- Entwurf in `PLAENE.md` (Gesamtbild 13–18, Level 13 im Detail, 5 Fragen). `STAND.md`, Archiv. Versionsnummer 0.30.1, Spiel unverändert.

**Geprüft:**
- `npm test`: 419 von 419 bestanden (nur Doku und Versionsnummer geändert).

### v0.30.0 – Laden-Lager vergrößern (19.11.2026)

**Vorgenommen:**
- Entwurf v0.30.0 mit Tobias' Antworten (Chat 21): +100 Plätze je Ausbau, der erste 5.000 Gold, jeder weitere 2.500 mehr, 10 Ausbauten (das Lager verdoppelt sich auf 2.000), ab Level 7.

**Fragen, die wir uns gestellt haben:**
- Wo steht der Knopf? → Oben im Reiter „Lager“ des Ladens, in einem Kasten mit der Größe des Lagers; darunter wie bisher die Waren.
- Was sieht man unter Level 7 bzw. ganz ausgebaut? → „🔒 Ab Level 7 kannst du es vergrößern: je +100 Plätze, der erste Ausbau kostet 5.000 🪙.“ bzw. „Ganz ausgebaut (10 von 10 Ausbauten).“ – ohne Knopf.
- Zählt der Ausbau auch für das Versandportal, das Ernten und den Händler? → Ja, alles fragt `storageCapacity`, das die Ausbauten mitzählt.
- Spielstand? → Format 18 mit `storageUpgrades`; ältere Spielstände beginnen mit 0, sonst bleibt alles gleich.

**Gemacht:**
- `data/shop.js`: `STORAGE_UPGRADE` (100, 5.000, 2.500, 10, Level 7). `core/shop.js`: `storageCapacity` zählt die Ausbauten mit; `storageUpgrades`, `storageUpgradePrice`, `nextStorageUpgrade`, `storageUpgradeBlocker`, `buyStorageUpgrade`. `core/state.js`: neues Spiel mit 0 Ausbauten. `core/save.js`: Format 18, Umwandlung und Prüfung (0 bis 10).
- `view/shop.js`: Kasten „📦 Laden-Lager: … Plätze“ mit „Ausbau 1 von 10: +100 Plätze (1.000 → 1.100)“, Knopf „📦 Vergrößern · 5.000 🪙“, „Dir fehlen noch …“, Rückfrage („Danach hast du noch … Gold“) und Meldung „Laden-Lager vergrößert – jetzt 1.100 Plätze“. `style.css`: Kasten.
- Tests: neue Datei `lager.test.js` (13 Tests), `theken.test.js` auf Format 18; Browser-Test: Lager auf Level 1 gesperrt, auf Level 12 ein Ausbau per Touch mit Rückfrage. Doku: `STAND.md`, `SPIEL.md`, `TECHNIK.md`, Archiv. Der älteste Absatz zu Tobias' Fabrik (11.11.2026) ist aus `STAND.md` wörtlich nach `GESPRAECHE.md` gewandert, damit `STAND.md` unter der Größengrenze bleibt.

**Geprüft:**
- `npm test`: 378 von 378 bestanden. Browser-Test in Tablet- und Handygröße und auf dem schmalen Handy: alle 862 Prüfungen bestanden (im ersten Lauf fielen nur die zwei alten Prüfungen durch, die die Spielstand-Formatnummer 17 erwarteten – auf 18 angepasst). Screenshots angesehen: Lager auf Level 1 mit „🔒 Ab Level 7“, Ausbau-Kasten mit Knopf, Rückfrage, danach 1.100 Plätze und „Dir fehlen noch …“ für den nächsten Ausbau (7.500), auf Tablet und Handy.

### v0.29.0 – Level 12 „Die Apotheke“ (18.11.2026)

**Vorgenommen:**
- Entwurf v0.29.0 mit Tobias' Antworten (Chat 21): Apotheke im Reiter „Werkstatt“ (die Tränke bekommen später einen eigenen Reiter), Aufstieg 7.500 Gold, Reißbrett mit 60 s „erstmal versuchen“, die Kleinigkeit mit den Reitern auf schmalen Handys.

**Fragen, die wir uns gestellt haben:**
- Die 6. Theke? → Tobias: erst mit Level 13 für 150.000 Gold – kommt mit Level 13, nicht in dieser Version.
- Das größere Laden-Lager (Tobias' neue Idee)? → Eigener Schritt mit Plan (Entwurf v0.30.0), weil Preis, Anzahl und Spielstand-Format zu klären sind.
- Wie passen 5 Reiter auf ein 740 breites Handy? → Unter 820 Bildpunkten Breite zeigt nur der geöffnete Reiter seinen Namen, die anderen ihr Warenbild (gesperrte blass, ohne Schloss). Die Regel steht am Ende von `style.css`, damit sie die Regeln für niedrige Bildschirme überschreibt (sonst wirkte der kleinere Abstand nicht).

**Gemacht:**
- `data/items.js`: Kamillensamen (830, ab Level 12), Kamille, Kamillenblüte (20), Kräutermischung (216), Kamillenkissen (216), Heilpäckchen (504), Reißbrett (1.408). `data/recipes.js`: drei Rezepte der Apotheke (20 / 20 / 30 s), Reißbrett in der Schreibstube (60 s, `level: 12`). `data/buildings.js`: Kamille im Beet und in der Erntebank, Schreibstube mit 3 Einstellungen, Apotheke (Level 12, Reiter „Werkstatt“, 1 Verstärkte Holzplatte + 1 Gewichtstein). `data/levels.js`: Level 12 (7.500 Gold, ohne Geschenk, Apothekerin Klara). `data/shop.js`: Laden auf Level 12 wie Level 7 bis 11.
- `view/itemArt.js`: Bilder für Kamillenblüte (drei Köpfchen mit gelber Mitte), Kräutermischung (Holzschale mit Blüten), Kamillenkissen (Leinenkissen mit Blüte), Heilpäckchen (verschnürtes Päckchen mit grünem Kreuz und Schafgarbenzweig), Reißbrett (Brett mit Ofenplan, Reißschiene und Zirkel); die Kamille im Beet hat eine kräftig gelbe Mitte. `style.css`: Reiter auf schmalen Handys.
- Tests: neue Datei `apotheke.test.js` (17 Tests), bestehende auf Level 12 umgestellt; Browser-Test mit Level 12 und einem schmalen Handy (740 × 360). Doku: `STAND.md`, `SPIEL.md`, `TECHNIK.md`, Archiv (dazu Entwurf v0.30.0 „Laden-Lager vergrößern“).

**Geprüft:**
- `npm test`: 365 von 365 bestanden. Browser-Test in Tablet- und Handygröße und auf einem schmalen Handy (740 × 360): alle 846 Prüfungen bestanden (im ersten Lauf fiel nur die alte Level-11-Prüfung des Reiters „Werkstatt“ durch, weil dort jetzt die gesperrte Apotheke steht – Prüfung angepasst). Screenshots angesehen: Level-12-Fenster mit Klara, Reiter „Werkstatt“ mit drei Gebäuden (Tablet, Handy, schmales Handy nur mit dem Namen des offenen Reiters), Apotheke mit Heilpäckchen, Schreibstube mit Reißbrett, Beet mit vier Samen; die neuen Warenbilder groß und in Bandgröße.

### v0.28.1 – Rückmeldung zu Level 11, Plan für Level 12 (17.11.2026, nur Doku)

**Vorgenommen:**
- Tobias' Rückmeldung zu v0.28.0 festhalten (Level 11 läuft, alle Gebäude gebaut, Platz zu etwa 60 % belegt, etwa 60.000 Gold, Kräuterstraße noch nicht gebaut) und die nächsten Schritte nennen.

**Fragen, die wir uns gestellt haben:**
- Wohin mit der Apotheke? → „Erde“ ist voll, ein 6. Reiter passt auf dem Handy nicht (gemessen: die 5 Reiter reichen bis 812 von 844 Bildpunkten). Vorschlag „Werkstatt“, Alternative eigener Reiter mit schmaleren Reitern – Frage an Tobias.
- Nebenbei gemessen: Auf einem 740 Bildpunkte breiten Handy ragt der Reiter „Werkstatt“ über den Rand → im Entwurf v0.29.0 vorgemerkt.

**Gemacht:**
- Entwurf v0.29.0 – Level 12 „Die Apotheke“ in `PLAENE.md` (Kamille, Apotheke, Reißbrett, Aufstieg 7.500 Gold, 4 Aufträge, 4 Fragen). `STAND.md`, Archiv. Versionsnummer 0.28.1, Spiel unverändert.

**Geprüft:**
- `npm test`: 348 von 348 bestanden (nur Doku und Versionsnummer geändert).

### v0.28.0 – Level 11 „Die Uhrmacherei“ (14.11.2026)

**Vorgenommen:**
- Entwurf v0.28.0 mit Tobias' Änderungen (Chat 20): keine Geschenke mehr ab Level 11, je 1 Minute pro Stück, Aufstieg 5.000 Gold; Uhrmacherei im Reiter „Werkstatt“, Baukosten 1 Zirkel + 1 Uhrwerk.

**Fragen, die wir uns gestellt haben:**
- Was zeigen Level-Fenster und Meldung ohne Geschenk? → Kein „Gratis im Laden-Lager“ und keine Zeile „🎁 Gratis“; „Ort & Level“ sagt „bis Level 10 auch zu Beginn einen Rohstoff gratis“.
- Passt der Reiter „Werkstatt“ mit 2 Gebäuden aufs Handy? → Ja (Browser-Test misst es).

**Gemacht:**
- `data/items.js`: Räderuhr (570), Kastenschloss (1.296), Sternenuhr (1.105). `data/recipes.js`: drei Rezepte der Uhrmacherei, je 60 s. `data/buildings.js`: Uhrmacherei (Level 11, Reiter „Werkstatt“). `data/levels.js`: Level 11 (5.000 Gold, ohne Geschenk). `data/shop.js`: Laden auf Level 11 wie Level 7 bis 10.
- `main.js`: Meldung beim Aufstieg ohne „Gratis“, wenn es kein Geschenk gibt. `view/levels.js`: Text in „Ort & Level“. `view/itemArt.js`: Bilder für Räderuhr (Gehäuse mit Zifferblatt und zwei Gewichten), Kastenschloss (Schlosskasten mit Schlüssel), Sternenuhr (blaues Zifferblatt mit Sonne, Mond und Sternen).
- Tests: neue Datei `uhrmacherei.test.js` (13 Tests), bestehende auf Level 11 umgestellt (Geschenke nur bis Level 10); Browser-Test mit Level 11. Doku: `STAND.md`, `SPIEL.md`, `TECHNIK.md`, Archiv.

**Geprüft:**
- `npm test`: 348 von 348 bestanden. Browser-Test in Tablet- und Handygröße: alle 787 Prüfungen bestanden; Screenshots angesehen (Level-11-Fenster ohne Geschenk, Reiter „Werkstatt“ mit Schreibstube und Uhrmacherei auf dem Handy, Uhrmacherei mit Sternenuhr und den beiden anderen Einstellungen).

### v0.27.1 – Rückmeldung zu Level 10, Plan für Level 11 (14.11.2026, nur Doku)

**Vorgenommen:**
- Tobias' Rückmeldung zu v0.27.0 festhalten („sieht sehr gut aus und fühlt sich auch gut an“, alle vier neuen Streifen gekauft) und seinen Wunsch, Level 11 noch in dieser Session zu bekommen.

**Fragen, die wir uns gestellt haben:**
- Wohin mit der Uhrmacherei? → Reiter „Werkstatt“ neben der Schreibstube; „Eisen“ hat schon 4 Gebäude.
- Was kostet sie? → 1 Zirkel + 1 Uhrwerk (921 Gold, unter der Grenze von 960).

**Gemacht:**
- `docs/archiv/PLAENE.md`: Entwurf v0.28.0 (Level 11 „Die Uhrmacherei“) mit 3 Fragen. `docs/STAND.md`: Status, Tobias' Fabrik (Screenshot 22:49), nächste Schritte, neuer Arbeitsschritt oben (v0.26.0 fällt aus der Liste). `docs/SPIEL.md`: Ausblick Level 11. Gespräch und Entscheidungen ergänzt.
- Spiel unverändert, nur die Versionsnummer steigt.

### v0.27.0 – Level 10 „Das Spital“ und mehr Fläche (14.11.2026)

**Vorgenommen:**
- Entwurf v0.27.0 (Tobias, Chat 20: „Ein Streifen gerne 2000 Gold … Ja weiter rauszoomen soll gehen … Ja, darfst du … Ja, gerne beides zusammen“): Level 10 mit Schafgarbe und Wundverband, ab Level 10 ein Streifen Fläche mehr je Seite für 2.000 Gold, weiter herauszoomen. Dazu Tobias' Ärger beim Hereinzoomen: Das Infofenster verdeckt Gebäude am rechten Rand.

**Fragen, die wir uns gestellt haben:**
- Wie wächst die Welt, ohne dass Tobias' Fabrik verrutscht? → Die Welt hat seit v0.10.2 ihre eigene Ecke; beim Aufstieg rückt sie an jeder Seite 4 Felder nach außen, Gebäude und Bänder behalten ihre Felder. Kein neues Spielstand-Format: Beim Laden wird die Welt nur nachgezogen, wenn sie für das Level zu klein ist.
- Wie viel herauszoomen? → So weit, dass die ganze Welt mit etwas Rand ins Bild passt, höchstens bis 0,12. Gemessen: Tablet im Browser-Test (Karte 1280 × 756) reicht 0,35, Handy quer (844 × 350) braucht 0,15.
- Was genau stört am Hereinzoomen? → Rückfrage an Tobias: „Infofenster verdeckt“. Deshalb lässt sich die Karte rechts so weit über den Rand schieben, wie das Infofenster breit ist.
- Soll die Kräuterstube den Wundverband schon auf Level 8 und 9 anbieten? → Nein, ohne Schafgarbe wäre das verwirrend: Rezepte bekommen ein eigenes Level.

**Gemacht:**
- `data/land.js`: `LAND_MORE` (Level 10: 1 Streifen, 2.000 Gold). `land.js`: `stripsPerSide`, `worldForLevel`, `fitWorldToLevel`, `landMoreAt`, `stripPrice` (Preis nach der Nummer des Streifens an der Seite). `levels.js`: Aufstieg lässt die Welt wachsen (`moreLand`), `recipeLevel` / `isRecipeUnlocked`, `unlocksOf` mit neuen Rezepten, `itemLevel` nach Rezept- und Pflanzen-Level. `save.js`: Welt beim Laden nachziehen.
- `data/items.js`: Schafgarbensamen (660), Schafgarbe, Schafgarbenblüte (16), Wundverband (252). `data/buildings.js`: Beet und Erntebank mit Schafgarbe, Kräuterstube mit 3. Einstellung. `data/recipes.js`: Wundverband (ab Level 10). `data/levels.js`: Level 10. `data/shop.js`: Laden auf Level 10 wie Level 7 bis 9.
- `view/camera.js`: `minZoom`, `FLOOR_ZOOM`, `padRight`. `main.js`: Platz rechts für das Infofenster, nach dem Aufstieg mit mehr Fläche die ganze Welt zeigen, Meldung mit Hinweis auf die Schilder. `view/levels.js`: „Neu“ nennt neue Rezepte und mehr Fläche. `view/controller.js`: Infofenster „Fläche kaufen“ nennt die Preise. `view/buildingInfo.js`: gesperrte Rezepte nicht unter „Umstellen auf“. `view/itemArt.js`, `view/renderer.js`: Bilder für Schafgarbe, Blüten, Wundverband.
- Tests: neue Datei `spital.test.js` (16 Tests), Kamera-Tests (herauszoomen bis die Welt passt, `padRight`), bestehende Tests auf Level 10 umgestellt; Browser-Test mit Level 10, neuer Fläche, Zoom und Infofenster. Doku: `STAND.md`, `SPIEL.md`, `TECHNIK.md`, Archiv.

**Geprüft:**
- `npm test`: 335 von 335 bestanden. Browser-Test in Tablet- und Handygröße: alle 755 Prüfungen bestanden; Screenshots angesehen (Level-10-Fenster mit Agnes' Auftrag, ganze Welt nach dem Aufstieg mit dem Schild „＋ 2.000“, ganz herausgezoomt auf dem Handy, 3. Streifen rechts gekauft, Beet mit drei Samen, Kräuterstube mit Wundverband, rechter Rand neben dem Infofenster).

### v0.26.1 – Rückmeldung zu Level 9, Plan für Level 10 mit mehr Fläche (14.11.2026, nur Doku)

**Vorgenommen:**
- Tobias' Rückmeldung zu Level 9 festhalten (Chat 20: „sehr gut gelungen mit dem neuen Reiter“, Techbaum „sehr gut“) und seinen Wunsch, ab Level 10 neue Fläche kaufen zu können („Aktuell wird es mit dem Platz ein wenig eng“).

**Fragen, die wir uns gestellt haben:**
- Wie viel Fläche mehr? → Wie bisher in Streifen von 4 Reihen: ab Level 10 je Seite einer mehr, bis 46 × 38 (gut 50 % mehr). Preis 1.000 Gold je Streifen (bisher 170), Platzhalter.
- Passt die größere Fläche aufs Tablet? → Ohne Vollbild steht die Karte schon bei 38 × 30 fast an der Zoom-Grenze; deshalb soll man weiter herauszoomen dürfen.
- Was bringt Level 10 sonst? → Wie im Entwurf aus v0.25.1: Schafgarbe, Wundverband; dazu Aufstieg 2.000 Gold, 1 Schafgarbensamen als Geschenk, 4 Aufträge (2.116 Erfahrung).

**Gemacht:**
- `docs/archiv/PLAENE.md`: Entwurf v0.27.0 mit 4 Fragen. `docs/STAND.md`: Status, Tobias' Fabrik (Screenshot vom 14.11.2026), nächste Schritte, offene Fragen 3 und 9, neuer Arbeitsschritt oben. `docs/SPIEL.md`: Ausblick Level 10. Gespräch und Entscheidungen ergänzt.
- Spiel unverändert, nur die Versionsnummer steigt.

### v0.26.0 – Level 9 „Die Schreibstube“ (14.11.2026)

**Vorgenommen:**
- Level 9 nach dem Entwurf aus v0.25.1 (Tobias, Chat 19: „Das hört sich alles sehr gut an und macht auch Sinn … Wenn du willst, kannst du direkt anfangen mit Level 9.“): Kohlenmeiler, Schreibstube, Holzkohle, Zeichenbrett, Reißzeug.

**Fragen, die wir uns gestellt haben:**
- Wo stehen die neuen Gebäude in der Bauleiste? → Ein Test hält seit v0.18.0 fest: höchstens 4 Gebäude je Reiter, sonst passen sie nicht aufs Handy (gemessen: die Schreibstube ragte 38 Pixel über den Rand). Der Kohlenmeiler kommt als 4. Gebäude in „Holz“, die Schreibstube in einen neuen Reiter **„Werkstatt“** (ziegelrot) für die Werkzeug-Maschinen ab Level 9 – später auch die Uhrmacherei.
- Passen 5 Reiter aufs Handy? → Auf Level 1 nicht ganz (4 gesperrte Reiter mit Bild und Schloss). Seitdem ersetzt das Schloss bei gesperrten Reitern das Warenbild.
- Welcher Rohstoff als Geschenk? → Level 9 bringt keinen neuen; 1 Holzstamm für den ersten Kohlenmeiler.
- Wie viel Erfahrung? → 4 Aufträge mit Waren aus beiden Bereichen (Holzkohle, Zeichenbretter, Reißzeuge, Heilverbände), zusammen 1.657 – etwas mehr als Level 8 (1.305), weniger als Level 6 (1.840). Aufstieg 1.670 Gold (+340 wie die Schritte davor).

**Gemacht:**
- `data/items.js`: Holzkohle (2), Zeichenbrett (355), Reißzeug (818). `data/recipes.js`: Zeichenbrett, Reißzeug. `data/buildings.js`: Kohlenmeiler (Rohstoff-Gebäude, Vorrat 3), Schreibstube (2 Eingänge), Reiter „Werkstatt“ mit eigener Farbe. `data/levels.js`: Level 9. `data/shop.js`: Laden auf Level 9 wie Level 7 und 8.
- `view/itemArt.js`: Bilder für Holzkohle (zwei Brocken), Zeichenbrett (Holzrahmen mit Leinen und Hausplan), Reißzeug (Lederetui mit Zirkel und Kohle). `style.css`: gesperrter Reiter zeigt das Schloss statt des Bildes.
- Tests: neue Datei `schreibstube.test.js` (17 Tests), bestehende auf Level 9 und 5 Reiter umgestellt; Browser-Test mit Level 9. Doku: `STAND.md`, `SPIEL.md`, `TECHNIK.md`, Archiv.

**Geprüft:**
- `npm test`: 317 von 317 bestanden. Browser-Test in Tablet- und Handygröße: alle 713 Prüfungen bestanden; Screenshots angesehen (5 Reiter auf dem Handy auf Level 1, Level-9-Fenster mit Konrads Auftrag, Kohlenmeiler mit 1 Holzstamm → 100 Holzkohle, Schreibstube mit Reißzeug und „Umstellen auf Zeichenbrett“).

### v0.25.1 – Entwurf Level 9–12 (13.11.2026, nur Doku)

**Vorgenommen:**
- Tobias' Wunsch: „Du kannst mir gerne mal einen Entwurf schreiben für die Level 9 bis 12“ – mit seinen Vorgaben (Werkzeuge nicht stillstehen lassen, 2 Eingänge, 1–2 weitere Kräuter für Tränke, Holzkohle als Randidee).

**Fragen, die wir uns gestellt haben:**
- Wie wachsen Werkzeuge und Kräuter nebeneinander? → Die Level wechseln sich ab (9 und 11 Werkzeuge, 10 und 12 Kräuter), die Aufträge verlangen Waren aus beiden Bereichen.
- Was wird aus den Werkzeug-Endprodukten? → Zirkel ins Reißzeug und in die Sternenuhr, Uhrwerk in Räder- und Sternenuhr, Gewichtstein in die Räderuhr, Schlüssel und Vorhängeschloss ins Kastenschloss, Verstärkte Holzplatte ins Zeichenbrett (mit Flachsfasern).
- Wo kommt die Holzkohle hin? → Kohlenmeiler (Rohstoff-Gebäude, 1 Holzstamm → 100 Holzkohle) ab Level 9; zuerst fürs Reißzeug, später für Glas (Tränke) und vielleicht Stahl.

**Gemacht:**
- `docs/archiv/PLAENE.md`: Entwurf Level 9–12 mit Rezepten, Werten (+20 % je Stufe) und 5 Fragen. `docs/STAND.md`: Status, nächster Schritt, offene Frage 14, neuer Arbeitsschritt oben (v0.24.0 fällt aus der Liste). `docs/SPIEL.md`: Ausblick Level 9–13. Gespräch und Entscheidungen ergänzt.
- Spiel unverändert, nur die Versionsnummer steigt; `npm test` bestanden.

### v0.25.0 – Kunden-Tempo angeglichen (13.11.2026)

**Vorgenommen:**
- Entwurf v0.25.0 (Tobias, Chat 19: „Ja, darfst du gerne so umsetzen.“): je Theke Level 4–6 alle 25–45 Sekunden ein Kunde, ab Level 7 alle 45–60; Level 1–3 bleibt.

**Fragen, die wir uns gestellt haben:**
- Wie trägt man Tobias' Zahlen ein? → Die Datentabelle nennt je Level direkt die Sekunden (`customerSeconds: [45, 60]`) statt Stück pro Minute mit Streuung – Tobias' Bereiche sind nicht gleichmäßig um einen Mittelwert verteilt (25–45, 45–60).
- Braucht der Spielstand ein neues Format? → Nein. Laufende Kunden-Takte laufen ab und folgen dann dem neuen Tempo.

**Gemacht:**
- `data/shop.js`: `customerSeconds` je Level, `CUSTOMERS` ohne Streuung. `shop.js`: `customerSecondsFor`. `market.js`: Abstand der Kunden aus der Tabelle (`customerRange`, `customerSeconds`, `perCounterMinute`). `view/shop.js`: Kauf-Karte „eigene Kunden: alle 45–60 Sekunden einer“, Rückfrage mit den Sekunden.
- Tests (`theken.test.js`) auf die neuen Zeiten umgestellt (Level 8 mit 4 Theken etwa 274 Stück pro Stunde), Browser-Test prüft die Texte. Doku: `STAND.md`, `SPIEL.md` (Kunden, Ausblick: drei Bereiche parallel), `TECHNIK.md`, Archiv; dazu Tobias' Bild vom Techbaum (offene Frage 14).

**Geprüft:**
- `npm test`: 300 von 300 bestanden. Browser-Test in Tablet- und Handygröße: alle 681 Prüfungen bestanden; Screenshots angesehen (Theken-Reiter „alle 45–60 Sekunden“, Kauf-Karte, Rückfrage). Eine Prüfung war vom laufenden Verkauf abhängig („Dir fehlen noch 1.000“ – ein Kunde hatte gerade 1 Gold gebracht, es stand 999 da); sie verträgt das jetzt.

### v0.24.1 – Kunden schneller, danach der Techbaum (13.11.2026, nur Doku)

**Vorgenommen:**
- Tobias' Rückmeldung zu v0.24.0 festhalten (Regel „Nichts darf verloren gehen“) und den nächsten Schritt entwerfen.

**Fragen, die wir uns gestellt haben:**
- Was heißt „Zeiten angleichen“ in Zahlen? → Je Theke kommt Level 4–6 alle 25–45 Sekunden ein Kunde (vorher 30–50), ab Level 7 alle 45–60 (vorher 60–100); Level 1–3 bleibt bei 15–25. Ab Level 7 verkauft eine Theke damit etwa 1,1 statt 0,75 Stück pro Minute; Tobias' 4 Theken etwa 274 statt 180 Stück pro Stunde.
- Was meint Tobias mit den „überproportional vielen Zirkeln“? → Claudes Lesart (noch zu bestätigen): Ab Level 7 verlangt nichts mehr Werkzeug-Waren, die Straßen laufen aber weiter. Gehört in die Planung von Level 9.

**Gemacht:**
- `docs/STAND.md`: Status, Tobias' Fabrik (4 Theken, 6.000 Gold), neue Reihenfolge der nächsten Schritte (Tempo, Techbaum ab Level 9; Tester, Bereich kopieren und Weiche nach hinten), offene Fragen 1 und 14, neuer Arbeitsschritt oben (v0.22.3 fällt aus der Liste). `docs/SPIEL.md`: Ausblick Level 9. `docs/archiv/PLAENE.md`: Entwurf v0.25.0. Gespräch und Entscheidungen ergänzt.
- Spiel unverändert, nur die Versionsnummer steigt; `npm test` bestanden.

### v0.24.0 – Theken kaufen, langsamer verkaufen (13.11.2026)

**Vorgenommen:**
- Entwurf „Theken kaufen, langsamer verkaufen“ (freigegeben in Chat 17) mit Tobias' runderen Preisen aus Chat 19: „Wir können mit v24 anfangen, aber lass uns die Thekenpreise noch etwas mehr runden. Die dritte für 15.000, die vierte für 35.000 und die fünfte für 70.000.“ Eine 6. Theke kommt später, Preis offen.

**Fragen, die wir uns gestellt haben:**
- Wie oft kommen die Kunden einer Theke? → Jeder kauft 1 Stück (wie im Entwurf „ein Kunde, der 1 Stück kauft“); je Theke im Schnitt alle 20 / 40 / 80 Sekunden (Level 1–3 / ab 4 / ab 7), 25 % früher oder später – also alle 15–25, 30–50, 60–100 Sekunden. Das ergibt genau Tobias' Tempo (2 Theken zusammen 6 / 3 / 1,5 pro Minute).
- Wie sieht die 6. Theke aus, solange sie keinen Preis hat? → Die Ansicht zeigt immer 6 Plätze (2 × 3, „damit die Thekenansicht auch voll ist“); die 6. steht als „🔒 Kommt später im Spiel“ da, die übrigen noch nicht kaufbaren ausgegraut mit Preis.
- Kauf mit einem Tippen? → Nein, mit Rückfrage (15.000 Gold sind viel).
- Was passiert bei Tobias? → Theken 3 bis 5 werden abgebaut, ihre Waren kommen ins Laden-Lager (auch über die Grenze); Gold bleibt; Hinweis beim Öffnen. Mit 14.623 Gold (Stand der Screenshots) fehlen ihm für Theke 3 noch 377 Gold.

**Gemacht:**
- `data/shop.js`: `perCounter` je Level (3 / 1,5 / 0,75 Stück pro Minute je Theke) statt `counters`; `COUNTERS` (Start 2, Preise 15.000 / 35.000 / 70.000 / offen, 6 Plätze); `CUSTOMERS` jetzt Stück je Kunde und Streuung.
- `market.js`: Kunden je Theke (`market.timers`, `syncCustomerTimers`), `serveCustomer(state, theke)`, Verkäufe merken sich ihre Theke; `buyCounter`, `nextCounterPrice`, `counterSlots`. `shop.js`: `perCounterFor`, `addMissingCounters` entfällt. `levels.js`: Aufstieg ohne Theken.
- `save.js`: Format 17 – zurück auf 2 Theken (`shrinkCounters`), Kunden-Takte statt einem; Prüfung der Takte und der Theke je Verkauf. `main.js`: Hinweis beim Öffnen alter Spielstände, lange Hinweise bleiben länger stehen.
- `view/shop.js` und `style.css`: Reiter „Theken“ mit Tempo-Text, nächstem Kunden je Theke, 6 Plätzen (kaufen / später / kommt später), „Dir fehlen noch …“, Rückfrage; „Letzte Verkäufe“ mit Theke. `view/levels.js`: Level 4–6 kündigen keine Theke mehr an.
- Tests: neue Datei `theken.test.js` (16 Tests), bestehende Tests angepasst; Browser-Test mit Theken-Kauf auf Level 7. Doku: `STAND.md`, `SPIEL.md`, `TECHNIK.md`, Archiv.

**Geprüft:**
- `npm test`: 300 von 300 bestanden. Browser-Test in Tablet- und Handygröße: alle 681 Prüfungen bestanden; Screenshots angesehen (6 Plätze, gesperrter Kauf mit „Dir fehlen noch 1.000“, Rückfrage, Theke 3 gekauft, Theke 4 als Nächste).
- Eigener Browser-Versuch mit einem Spielstand im Format 16 wie Tobias' Fabrik (Level 8, 14.623 Gold, 5 Theken): 2 Theken bleiben, 35 Waren der übrigen liegen im Laden-Lager (1.005 / 1.000), Hinweis erscheint, „Dir fehlen noch 377“; Kauf mit 16.000 Gold klappt.

### v0.23.0 – Preise durch 3 (12.11.2026)

**Vorgenommen:**
- Entwurf „Preise durch 3“ aus v0.22.3 (Tobias, Chat 18: „Das kannst du gerne schon mal machen. Ich würde gerne zuerst die Preise teilen und danach die Theken machen.“): alle Preise und festen Gold-Beträge durch 3, +20 % je Stufe bleibt, Erfahrung bleibt, alte Spielstände umrechnen.

**Fragen, die wir uns gestellt haben:**
- 733 oder 732 für Eisenerz? → 732 – Eisen kostet genau viermal so viel wie Holz (eine Regel, die ein Test prüft).
- Was sieht Tobias beim ersten Öffnen? → Sein Gold ist durch 3 geteilt (43.870 → 14.623), dazu ein Hinweis, dass alle Preise durch 3 geteilt sind.
- Was ist mit Spielständen von vor v0.9.1, die noch Startkapital bekommen? → Sie bekommen die damaligen 500 Gold und danach durch 3, wie alle anderen.

**Gemacht:**
- `data/items.js`: alle Preise durch 3 (Holzblock 1, Eisenbarren 4, Grundteile 6, Eisenteile 24, Zahnradwelle/Räderwerk 108, Verstärkte Holzplatte/Gewichtstein 216, Scharnier/Schlüssel 432, Zirkel 662, Uhrwerk 259, Vorhängeschloss 648; Holzstamm/Felsbrocken 183, Eisenerz 732; Leinsamen 320, Faser 8, Verband 48, Ringelblumensamen 500, Blüte 12, Heilverband 130, Kompresse 168).
- `data/shop.js`: Startgold 170, Testpaket 330. `data/land.js`: Streifen 170. `data/levels.js`: Aufstiege 30 / 80 / 170 / 330 / 670 / 1.000 / 1.330, Erfahrung 3 je 10 Gold (`xpPerGold` 0,3) – Erfahrung je Level wie vorher (Level 6–8 durch Rundung 1.840 / 816 / 1.305).
- `save.js`: Format 16 – Gold und „Letzte Verkäufe“ durch 3 (gerundet). `main.js`: Hinweis beim Öffnen alter Spielstände, Testpaket-Meldung aus der Datentabelle.
- Tests auf die neuen Zahlen umgestellt, neuer Test für das Umwandeln von Format 15 (Tobias' Fabrik); Browser-Test ebenso. Doku: `SPIEL.md` (alle Tabellen), `STAND.md`, `TECHNIK.md`.

**Geprüft:**
- `npm test`: 284 von 284 bestanden. Browser-Test in Tablet- und Handygröße: alle Prüfungen bestanden; Screenshots angesehen (Händler 183 / 183 / 732, Flächen-Schilder „+ 170“, Zimmerei „Wert 108“, Auftrag „+30“).
- Eigener Browser-Versuch mit einem Spielstand im Format 15 (Level 8, 43.870 Gold): oben 14.623 Gold, Hinweis erscheint.

### v0.22.3 – Preise durch 3 statt kleinerem Aufschlag (12.11.2026, nur Doku)

**Vorgenommen:**
- Tobias' Rückmeldung festhalten (Scharniere gehen bei ihm in Zirkel und Vorhängeschlösser; teure Waren bringen viel Gold, für den Aufstieg braucht man trotzdem andere; an den Stellschrauben muss kaum gedreht werden) und seinen Vorschlag „alles durch 3“ durchrechnen.

**Fragen, die wir uns gestellt haben:**
- Geht „durch 3“ glatt auf? → In der Werkzeug-Kette fast (alles entsteht aus Blöcken zu 3 Gold; Zirkel 662, Uhrwerk 259); bei den Kräutern Leinsamen 320, damit die Faser 8 Gold kostet.
- Was muss mit umgerechnet werden? → Startgold, Fläche, Aufstiege, Theken-Preise, Testpaket, Gold und „Letzte Verkäufe“ im Spielstand. Die Erfahrung bleibt gleich (3 je 10 Gold statt 1).
- Ändert sich das Gleichgewicht? → Nein, nur die Zahlen; gebremst wird über die Theken (v0.23.0).

**Gemacht:**
- `docs/STAND.md`: Status, nächster Schritt (Reihenfolge v0.23.0 → v0.24.0), Tobias' Fabrik, nächste Schritte (Preise jetzt Punkt 2), offene Frage 1, neuer Arbeitsschritt oben (v0.22.0 fällt aus der Liste). `docs/archiv/PLAENE.md`: Entwurf v0.24.0 mit Preistabelle. Gespräch und Entscheidungen ergänzt.
- Spiel unverändert, nur die Versionsnummer steigt; `npm test` bestanden.

### v0.22.2 – Erst die Theken, Preise später (12.11.2026, nur Doku)

**Vorgenommen:**
- Tobias' Entscheidung festhalten (Gold über die Theken regulieren, v0.23.0 wie freigegeben; kleinerer Aufschlag und mittelalterliche Preise in einem eigenen Schritt) und den Stand für den neuen Chat vorbereiten.

**Fragen, die wir uns gestellt haben:**
- Wie sähe „Holzblock 1 Gold, Zirkel einige hundert“ aus? → Alle Preise durch 3 (Zirkel 662), mit +10 % ab Level 4 Zirkel 567; ein nächstes Produkt aus Zirkel + Vorhängeschloss 1.223 statt 4.717.
- Was ist beim Umstellen zu beachten? → Gold im Spielstand, Aufstiege, Fläche, Theken und Startgold mit umrechnen.

**Gemacht:**
- `docs/STAND.md`: Status, nächster Schritt (v0.23.0 im neuen Chat), nächste Schritte (Punkt 5 „Preise überarbeiten“), offene Frage 1, neuer Arbeitsschritt oben (v0.21.6 fällt aus der Liste). `docs/archiv/PLAENE.md`: Entscheidung und Preistabelle. Gespräch und Entscheidungen ergänzt.
- Spiel unverändert, nur die Versionsnummer steigt; `npm test` bestanden.

### v0.22.1 – Rohstoffpreise und Rezepte durchgerechnet (12.11.2026, nur Doku)

**Vorgenommen:**
- Tobias' Rückmeldung zu v0.22.0 („Hat funktioniert“) und seine neue Idee festhalten (Rohstoffe billiger, weniger Teile je Rezept) und mit seiner Fabrik durchrechnen.

**Fragen, die wir uns gestellt haben:**
- Wächst der Wert je Schritt aufs Dreifache? → Nein, +20 % auf die Zutaten; die großen Zahlen kommen von der Menge (15 Teile in einer Welle).
- Was bringt „Rohstoffe billiger“? → Alles halbiert sich, auch die Kosten – wirkt nur gegenüber festen Preisen.
- Was bringt „weniger Teile“? → Gleicher Gewinn je Rohstoff, wirkt nur über die Theken-Grenze; weniger Massenproduktion.
- Was trifft genau die höheren Level? → Kleinerer Aufschlag ab Level 4 (C).

**Gemacht:**
- `docs/STAND.md`: Status, offene Frage 1 (jetzt Gold auf höheren Leveln), neuer Arbeitsschritt oben (v0.21.5 fällt aus der Liste). `docs/archiv/PLAENE.md`: Überlegung mit Tabelle. Gespräch und Entscheidungen ergänzt.
- Spiel unverändert, nur die Versionsnummer steigt; `npm test` bestanden.

### v0.22.0 – Spielstand sichern und laden (11.11.2026)

**Vorgenommen:**
- Entwurf v0.22.0 mit Claudes Vorschlägen zu den 4 Fragen (Tobias, Chat 17: „Wir können das gerne so machen in der Reihenfolge … Du kannst gerne damit anfangen“): Spielstand als Datei sichern (Downloads oder Teilen) und laden, Vorschau und Rückfrage, Nachrechnen seit dem Sichern, „Erst sichern?“ bei „Neues Spiel“; Testmodus und Test-Knopf bleiben sichtbar.

**Fragen, die wir uns gestellt haben:**
- `.json` oder `.txt`? → `.txt`: Chrome auf Android teilt nur bestimmte Dateiarten, `.json` gehört nicht dazu. Laden nimmt beides.
- Downloads oder Teilen? → Beides zur Wahl, wo das Gerät teilen kann („📤 Teilen …“ und „⬇️ In Downloads“); sonst nur Downloads.
- Wie holt die Fabrik die Zeit nach? → Die Datei ersetzt den Spielstand im Browser, die Seite startet neu und rechnet wie beim normalen Öffnen ab `savedAt` nach – derselbe, schon getestete Weg wie „Willkommen zurück“.
- Was, wenn man versehentlich lädt? → Vorher „💾 Jetzigen erst sichern“; außerdem bleibt der vorige Spielstand als Sicherheitskopie im Browser (`erstesspiel-spielstand-vor-dem-laden`), damit Claude ihn notfalls retten kann. Vor dem Ersetzen wird der jetzige Stand noch einmal gespeichert (fiel im Browser-Test auf).
- Was sagt das Fenster nach dem Laden? → „📂 Spielstand geladen – Seit dem Sichern sind … vergangen“ statt „Willkommen zurück! Du warst … weg“.

**Gemacht:**
- Neu `src/view/backup.js` (Dateiname, Vorschau, `readBackup`, Downloads/Teilen, Dateiauswahl). `src/view/storage.js`: `replaceGame`, Dateiname über den Neustart. `src/view/panels.js`: Rückfrage mit optionalem dritten Knopf. `src/view/hud.js`, `index.html`: Menü „💾 Spielstand sichern“, „📂 Spielstand laden“, versteckte Dateiauswahl. `src/view/offline.js`: Texte nach dem Laden. `src/main.js`: alles verbunden, „Neues Spiel“ mit „Erst sichern“. `src/style.css`: Zeilenumbrüche in Rückfragen. Spielstand-Format unverändert (15).
- Tests: `tests/sichern.test.js` (7 Tests), Browser-Test ergänzt (sichern, teilen, neues Spiel mit „Erst sichern“, laden mit 2 Stunden Nachrechnen, Sicherheitskopie, falsche Datei). Doku: `STAND.md`, `SPIEL.md`, `TECHNIK.md`, Archiv.

**Geprüft:**
- `npm test` bestanden (283 Tests), Browser-Test in Tablet- und Handygröße bestanden (661 Prüfungen), Screenshots angesehen (Menü, Sichern mit und ohne Teilen, Neues Spiel, Laden-Frage, Geladen, falsche Datei).

### v0.21.6 – Theken: Tempo je Level, nur Gold, Tobias auf 2 Theken (11.11.2026, nur Doku)

**Vorgenommen:**
- Tobias' Antworten zum Entwurf v0.23.0 festhalten: Verkaufstempo je Level (6 / 3 / 1–2 pro Minute), Theken nur mit Gold, seine Fabrik direkt auf 2 Theken.

**Fragen, die wir uns gestellt haben:**
- Gelten Tobias' Zahlen für alle Theken zusammen oder je Theke? → Claudes Lesart: für die 2 Start-Theken zusammen, jede gekaufte Theke legt ihren Anteil drauf (sonst brächte eine gekaufte Theke keinen zusätzlichen Verkauf) – Tobias bestätigt noch.
- Was heißt das für Tobias' Fabrik? → Level 8 mit 2 Theken: 90 Stück pro Stunde; eine volle Füllung kostet etwa 74.000 Gold – er muss vor allem teure Teile verkaufen oder Theken dazukaufen.

**Gemacht:**
- `docs/STAND.md`: Status, nächste Schritte, offene Fragen 1 (Claudes Vorschläge zu v0.22.0) und 4, neuer Arbeitsschritt oben (v0.21.3 fällt aus der Liste). `docs/archiv/PLAENE.md`: Entwurf v0.23.0 angepasst, Vorschläge zu v0.22.0. Entscheidungen und Gespräch ergänzt.
- Spiel unverändert, nur die Versionsnummer steigt; `npm test` bestanden.

### v0.21.5 – Antworten zum Gold-Gleichgewicht, Entwurf „Theken kaufen“ (11.11.2026, nur Doku)

**Vorgenommen:**
- Tobias' Antworten aus Chat 17 festhalten (Platz reicht, 5–6-mal aufgefüllt, Schwerpunkt Massenproduktion, Möglichkeit D, Theken langsamer) und daraus einen Entwurf machen.

**Fragen, die wir uns gestellt haben:**
- Bringt eine gekaufte Theke heute etwas? → Kaum: Die Kunden kaufen zusammen etwa 6 Stück pro Minute, egal wie viele Theken es gibt. Deshalb soll jede Theke eigene Kunden bekommen.
- Wie langsam? → Vorschlag 1 Stück pro Minute je Theke: Billige Waren lohnen kaum, Tobias' Fabrik stößt mit 2 Theken an die Grenze, der Anfang wird langsamer.
- Was kostet die 3. Theke, damit man sie um Level 8 schafft? → Platzhalter 40.000 Gold (die Aufträge bis Level 7 bringen rund 52.000, die Aufstiege bis Level 8 kosten 10.850).

**Gemacht:**
- `docs/STAND.md`: Status, Tobias' Fabrik, nächste Schritte (Punkt 5 jetzt v0.23.0), offene Frage 4 jetzt der Entwurf v0.23.0 (die Frage zur Weltgröße ist beantwortet), Frage 14 erledigt, neuer Arbeitsschritt oben (v0.21.2 fällt aus der Liste). `docs/SPIEL.md`: Schwerpunkt Massenproduktion. `docs/archiv/PLAENE.md`: Entwurf v0.23.0. Entscheidungen und Gespräch ergänzt.
- Spiel unverändert, nur die Versionsnummer steigt; `npm test` bestanden.

### v0.21.4 – Frage zum Gold-Gleichgewicht (11.11.2026, nur Doku)

**Vorgenommen:**
- Tobias' Frage aus Chat 17 festhalten (Regel „Nichts darf verloren gehen“): Ist es in Ordnung, lange auf einem Level zu bleiben und „unendlich Gold“ zu verdienen, und wie lässt sich das steuern? Dazu seine Screenshots (Fabrik, die jede Ware mindestens einmal herstellt; Laden-Lager mit Waren für 166.579 Gold).

**Fragen, die wir uns gestellt haben:**
- Wie viel verdient eine Fabrik auf Level 8, und was verlangt das Spiel dagegen? → Grob 30.000 bis 50.000 Gold pro Stunde, wenn alles läuft; alle Aufstiege und die ganze Fläche zusammen 14.850 Gold, einmalig.
- Bremsen die Theken? → Nur billige Waren (6 Stück pro Minute); bei teuren Waren begrenzen sie nur die Zeit ohne den Spieler.
- Lohnt sich Weiterspielen beim Gold? → Gerade nicht: Level 7/8 bringen +47 % bis +58 %, Zirkel und Vorhängeschloss (Level 5/6) +81 % bis +89 %.

**Gemacht:**
- `docs/STAND.md`: Status, Tobias' Fabrik nach den neuen Screenshots, nächste Schritte (Punkt 5), offene Fragen 4 und 14, neuer Arbeitsschritt oben (v0.21.1 fällt aus der Liste). `docs/archiv/PLAENE.md`: Überlegung „Gold-Gleichgewicht“ mit Rechnung, fünf Möglichkeiten und Empfehlung. Gespräch ergänzt.
- Spiel unverändert, nur die Versionsnummer steigt; `npm test` bestanden.

### v0.21.3 – Grüner Ring für Rohstoff-Gebäude (11.11.2026)

**Vorgenommen:**
- Tobias' Idee: Ring der Fertigung gelb, Ring „bis der Rohstoff leer ist“ grün. Dazu die nächsten Schritte aufschreiben, bevor ein neuer Chat beginnt.

**Fragen, die wir uns gestellt haben:**
- v0.21.3 oder v0.22.0? → v0.21.3: kleiner Feinschliff nach Tobias' Test (wie v0.10.1); „Spielstand sichern und laden“ bleibt v0.22.0.
- Auch die Vorrat-Punkte grün? → Nein, nur der Ring (Tobias hat nur den Ring genannt).

**Gemacht:**
- `src/view/buildingFace.js`: Art des Rings (`ringKind`: `work` bzw. `supply`). `src/view/renderer.js`: grüner Ring für Rohstoff-Gebäude. `tests/karte.test.js` ergänzt. Doku: `STAND.md` (nächste Schritte als Liste), `SPIEL.md`, `TECHNIK.md`, Archiv. Spielstand-Format unverändert.

**Geprüft:**
- `npm test` bestanden, Browser-Test in Tablet- und Handygröße bestanden, Screenshots angesehen.

### v0.21.2 – Ring bleibt, Bilder pro Sekunde gemessen, Plan „Spielstand sichern“ (11.11.2026, nur Doku)

**Vorgenommen:**
- Tobias' Entscheidung zum Ring und seine Messung festhalten; Entwurf für den nächsten Schritt.

**Fragen, die wir uns gestellt haben:**
- Ring pro Stück oder Rest des Rohstoffs? → Rest des Rohstoffs bleibt (Tobias: so sieht man, wann das Gebäude leer ist).
- Läuft das Spiel auf dem Tablet flüssig? → Ja, 60 bis 90 Bilder pro Sekunde im Testmodus.
- Brauchen Tester auf Tobias' Tablet einen zweiten Spielstand? → Nicht, wenn man den Spielstand sichern und wieder laden kann.

**Gemacht:**
- `docs/STAND.md`: Status, offene Frage 1 (jetzt der Entwurf v0.22.0), Frage 14 erledigt, neuer Arbeitsschritt oben. `docs/SPIEL.md`: Satz zum langsamen Ring. `docs/archiv/PLAENE.md`: Entwurf v0.22.0. Gespräch und Entscheidungen ergänzt.
- Spiel unverändert, nur die Versionsnummer steigt; `npm test` bestanden.

### v0.21.1 – Rückmeldung zur Karte: Ring der Rohstoff-Gebäude (11.11.2026, nur Doku)

**Vorgenommen:**
- Tobias' Rückmeldung zu v0.21.0 festhalten (Regel „Nichts darf verloren gehen“) und einen Vorschlag für den Ring der Rohstoff-Gebäude machen.

**Fragen, die wir uns gestellt haben:**
- Bleiben die Rohstoff-Gebäude wirklich stehen? → Nein, der Ring zeigt den Rest des laufenden Rohstoffs und bewegt sich nur 1,8° alle 4,5 Sekunden (Erntebank 7,2° alle 12 Sekunden).
- Warum sieht Tobias keine „Bilder/s“? → Die Anzeige gibt es nur im Testmodus; im Browser-Test war sie da. Rückfrage an Tobias.

**Gemacht:**
- `docs/STAND.md`: Status, offene Fragen 1 und 14, neuer Arbeitsschritt oben (v0.20.3 fällt aus der Liste). Gespräch und Entscheidungen ergänzt.
- Spiel unverändert, nur die Versionsnummer steigt; `npm test` bestanden.

### v0.21.0 – Maschinen zeigen, was sie herstellen (11.11.2026)

**Vorgenommen:**
- Variante B in der luftigen Fassung (Tobias, Chat 15/16): Produkt groß in der Mitte, Fortschritt als Ring, kein Gebäudebild, auch Rohstoff-Gebäude. Tobias' Idee dazu: Farbe je Reiter. Aus dem Belastungstest: nur zeichnen, was im Bild ist; Bilder pro Sekunde im Testmodus.

**Fragen, die wir uns gestellt haben:**
- Was zeigt ein leeres Rohstoff-Gebäude? → Seine Ware blass; die Erntebank die Ware der ersten Pflanze (oder der, die noch am Ausgang wartet).
- Was zeigt die Vorschau beim Platzieren? → Das Produkt der ersten Einstellung, ohne Ring und Schild; beim Verschieben das, was das Gebäude gerade herstellt.
- Wo ist Platz, wenn Pfeile oben oder unten sitzen (gedrehte Gebäude) oder der Name auf der Kante steht? → Jede Seite hält so viel frei, wie ihre Pfeile hineinragen; die obere Zeile rutscht nach unten, die Scheibe wird etwas kleiner.
- Darf das Lagerhaus braun bleiben? → Nein, dann sähe es aus wie ein Holz-Gebäude; es ist jetzt sandfarben.
- Wird das Zeichnen wirklich schneller? → Die neue Scheibe kostet mehr als das Emoji; erst mit zwischengespeicherten Warenbildern und dem Boden in einem Rutsch ist die Rechenarbeit nah dran und ganz herausgezoomt etwa halbiert, bei mittlerem Zoom gleich.

**Gemacht:**
- `src/view/buildingFace.js` (neu): was ein Gebäude zeigt (Produkt, blass, Ring, fehlende Zutaten, Vorrat, Lagerhaus-Waren). `src/view/renderer.js`: neue Aufteilung der Gebäude (obere Zeile, Scheibe mit Ring, Name; Pfeile bleiben frei), Lagerhaus mit Warenschild, nur zeichnen, was im Bild ist, Boden in einem Rutsch, zwischengespeicherte Warenbilder. `src/view/camera.js`: sichtbarer Ausschnitt. `src/core/data/buildings.js`: Farbe je Reiter (`TAB_COLORS`), Lagerhaus sandfarben. `main.js`, `hud.js`, `index.html`, `style.css`: „🎞️ … Bilder/s“ im Testmodus. Spielstand-Format unverändert.
- Tests: `tests/karte.test.js` (neu), Browser-Test mit Screenshots der Karte nah und weit und der Anzeige im Testmodus. Doku: `STAND.md`, `SPIEL.md`, `TECHNIK.md`, Archiv.

**Geprüft:**
- `npm test` bestanden, Browser-Test in Tablet- und Handygröße bestanden, Screenshots angesehen (auch eine eigene Testfabrik mit allen Gebäuden in allen Drehungen, Zoom 0,35 bis 2). Messung alt gegen neu mit voll bebauter Fläche.

### v0.20.3 – Antworten zum Belastungstest und zu den Testern (11.11.2026, nur Doku)

**Vorgenommen:**
- Tobias' Antworten auf die Fragen aus Chat 15 festhalten (Regel „Nichts darf verloren gehen“).

**Fragen, die wir uns gestellt haben:**
- Gehören die beiden Punkte aus dem Belastungstest in v0.21.0? → Ja (Tobias: „Passt“).
- Ist das Zeichnen auf dem Tablet ein Problem? → Nein, es ruckelt auch herausgezoomt nicht; die Verbesserung ist Vorsorge für größere Fabriken.
- Was brauchen Tester? → Hat Zeit; Tobias zeigt das Spiel frühestens nächste Woche.
- Darf Claude mit v0.21.0 anfangen? → Noch nicht: Die Frage zu Variante B (ohne oder mit kleinem Gebäudebild) ist unbeantwortet, ein ausdrückliches OK fehlt.

**Gemacht:**
- `docs/STAND.md`: Status, nächste Schritte, offene Fragen 1, 13, 14, neuer Arbeitsschritt oben (v0.20.0 fällt aus der Liste). Gespräch, Entscheidungen und Entwurf v0.21.0 in `docs/archiv/PLAENE.md` ergänzt.
- Spiel unverändert, nur die Versionsnummer steigt; `npm test` bestanden.

### v0.20.2 – Tobias' Wahl, Variante B luftiger, Belastungstest (10.11.2026, nur Doku)

**Vorgenommen:**
- Tobias' Antworten auf die Vorschläge festhalten, Variante B überarbeiten, den Belastungstest als Messung durchführen.

**Fragen, die wir uns gestellt haben:**
- Warum wirkte Variante B gequetscht? → Leiste, Punkte, Statuslicht, Scheibe, Gebäudebild, „?“-Schild und Name teilten sich ein kleines Feld. Neu: Fortschritt als Ring um das Produkt, kein Gebäudebild.
- Geht Tobias' Spielstand verloren, wenn andere testen? → Nein, jedes Gerät hat seinen eigenen; nur auf demselben Gerät teilt man ihn.
- Hält das Spiel eine voll bebaute Fläche aus? → Rechnen ja, mit großem Abstand; das Zeichnen ist der Engpass.

**Gemacht:**
- Neue Vorschaubilder (im Chat). Belastungstest in einer Kopie des Spiels (Ergebnisse im Gesprächsprotokoll und in `docs/archiv/PLAENE.md`). `docs/STAND.md`: Status, nächste Schritte, offene Fragen 1, 5, 7, 13, 14 (die Frage „Alle auffüllen“ ist entschieden), neuer Arbeitsschritt oben (v0.19.1 fällt aus der Liste). Entscheidungen und Gespräch ergänzt, `docs/TECHNIK.md` mit den Messwerten.
- Spiel unverändert, nur die Versionsnummer steigt; `npm test` bestanden.

### v0.20.1 – Plan: Maschinen zeigen, was sie herstellen (10.11.2026, nur Doku)

**Vorgenommen:**
- Tobias' Rückmeldung zu v0.20.0 und seinen Wunsch festhalten (auf der Karte besser sehen, was eine Maschine herstellt); Vorschlag mit Vorschaubildern und weitere mögliche Schritte.

**Fragen, die wir uns gestellt haben:**
- Was zeigt die Karte heute? → Nur, was einer wartenden Kombi-Maschine fehlt – nicht, was sie herstellt.
- Schild in der Ecke (A) oder Produkt in der Mitte (B)? → Claude empfiehlt B (herausgezoomt lesbar); Tobias entscheidet.

**Gemacht:**
- `docs/archiv/PLAENE.md`: Entwurf v0.21.0 und die Liste weiterer Schritte. `docs/STAND.md`: Status, nächster Schritt, mögliche nächste Schritte, offene Fragen 1 und 13, neuer Arbeitsschritt oben (v0.19.0 fällt aus der Liste). Gespräch ergänzt.
- Spiel unverändert, nur die Versionsnummer steigt; `npm test` bestanden.

### v0.20.0 – Infofenster für Beet, Lagerhaus und Versandportal (10.11.2026)

**Vorgenommen:**
- Die drei Gebäude, die noch Textzeilen zeigten, im Stil von v0.19.0 darstellen (Tobias, Chat 15). Das Versandportal bleibt (Variante A).

**Fragen, die wir uns gestellt haben:**
- Woher weiß das Versandportal, was ankommt? → Es merkt sich die zuletzt angekommenen Waren (bis 3); dafür Spielstand-Format 15, alte Portale beginnen mit einer leeren Liste.
- Springen die Bilder bei gemischten Bändern? → Nein, sie stehen in fester Reihenfolge (wie in der Warentabelle).
- Wie bleibt der Kasten ruhig, wenn sich etwas ändert? → Wie in v0.19.0: einmal bauen, danach nur Zahlen und Balken ändern; neu gebaut wird nur, wenn sich die Waren ändern (anderer Samen, andere Waren in den Fächern, andere Waren am Portal).

**Gemacht:**
- `src/view/buildingInfo.js`: Inhalte für Beet („Wächst hier / Wächst gerade / Reif zum Ernten“, Samen → Pflanze, Wachstumsbalken, Samen im Laden-Lager), Lagerhaus („Im Lagerhaus“ mit Summe, je Fach Bild, Name, Menge, Füllbalken; freie Fächer gestrichelt) und Versandportal („Schickt ins Laden-Lager“: zuletzt angekommene Waren → Laden-Lager mit Füllstand, roter Hinweis, wenn voll; bisher versendet); Füllbalken als gemeinsames Bauteil.
- `controller.js`: Textzeilen für die drei Gebäude entfallen; Säen-Knöpfe groß mit Bild des Samens, Ernten groß, Befüllen groß, „Ausräumen ins Laden-Lager“ kleiner. `production.js`: Portal merkt sich `recent`; Status „Voll – nimmt nichts mehr an.“ und „Laden-Lager voll – nimmt nichts an.“ `data/buildings.js`: neue Tipps, `recent: 3`. `save.js`: Format 15. `main.js`: `storageCapacity` für den Browser-Test. CSS für Füllbalken und Fächer (Tablet und Handy).

**Geprüft:**
- 266 automatische Tests (neu in `infofenster.test.js`: zuletzt versendete Waren – neueste vorn, jede einmal, höchstens 3; Status von Portal und Lagerhaus; Spielstand-Format 15 mit Prüfung ungültiger Listen; alter Spielstand bekommt eine leere Liste) – alle bestanden.
- Browser-Test in Tablet- und Handygröße (neu: Beet leer / wächst / reif mit Kasten, Balken und Säen-Knopf mit Samenbild, zwei Samen auf Level 8; Lagerhaus mit 3 Fächern, gemischt mit vollem Fach, leer; Versandportal mit zuletzt angekommenen Eisenbarren und Laden-Lager, Laden-Lager voll mit rotem Balken; nichts ragt aus dem Fenster) – alle bestanden.

### v0.19.1 – Gespräch: Braucht es das Versandportal noch? (10.11.2026, nur Doku)

**Vorgenommen:**
- Tobias' Frage aus Chat 15 festhalten (Versandportal neben dem Lagerhaus noch sinnvoll?) und die nächsten Schritte theoretisch durchgehen, bevor etwas programmiert wird.

**Fragen, die wir uns gestellt haben:**
- Machen Versandportal und Lagerhaus dasselbe? → Nur beim Ausräumen. Das Portal liefert automatisch und ohne Mengengrenze, das Lagerhaus puffert 150 Stück und bringt Ware aus dem Laden-Lager zurück aufs Band. Varianten A (behalten), B (zusammenlegen), C (weglassen) – Tobias entscheidet (offene Frage 13).

**Gemacht:**
- `docs/STAND.md`: Status, nächster Schritt, mögliche nächste Schritte, offene Frage 13, neuer Arbeitsschritt oben (v0.18.4 fällt aus der Liste). Gespräch ergänzt, Entwurf v0.20.0 in `docs/archiv/PLAENE.md`.
- Spiel unverändert, nur die Versionsnummer steigt; `npm test` bestanden.

### v0.19.0 – Übersichtliches Infofenster und Reiter „Erde“ (09.11.2026)

**Vorgenommen:**
- Das Infofenster eines Gebäudes übersichtlicher machen (Tobias, Chat 14): oben, was gerade hergestellt wird und was dafür fehlt, darunter die anderen Einstellungen. Der Reiter „Kräuter“ heißt „Erde“.

**Fragen, die wir uns gestellt haben:**
- Warenbilder in der Bauleiste oder im Infofenster? → Im Infofenster; die Bauleiste bleibt bei Symbol, Name, Kosten (Tobias).
- Welche Bilder? → Dieselben wie auf dem Band, etwas größer – eine Ware sieht überall gleich aus (Tobias' Idee).
- Wie geht beim ständigen Aktualisieren kein Tippen verloren? → Der Inhalt wird einmal gebaut und danach nur geändert; neu gebaut wird nur, wenn sich der Aufbau ändert (anderes Rezept, anderer Rohstoff im Vorrat).

**Gemacht:**
- Neu `src/view/buildingInfo.js` (grüner Kasten „Stellt gerade her“, „Umstellen auf“, Vorrat als Bilder). `panels.js`: Bereich für Warenbilder, kleine Knopfzeile unten, kurzer Tipp, Status im Kopf, Knöpfe mit Bild und Schlüssel (`data-key`). `controller.js`: Rezept-Knöpfe entfallen, Einlegen/Kaufen kleiner, Verschieben/Drehen/Abreißen in die Knopfzeile. `production.js`: `sourceSlots` (Vorrat der Reihe nach). `format.js`: `formatDuration`. Datentabelle: `tip` statt `description`, Reiter „Erde“. CSS für das neue Fenster (Tablet und Handy), Infofenster 320 statt 310 Pixel breit.
- Spielstand-Format unverändert.

**Geprüft:**
- 262 automatische Tests (neu in `infofenster.test.js`: Reiter „Erde“ mit gleicher Kennung, kurze Tipps statt Beschreibung, Warenbilder für alle Rezepte und Rohstoff-Gebäude, Vorrat der Reihe nach, hat / braucht beim Umstellen, Zeitangaben) – alle bestanden.
- Browser-Test in Tablet- und Handygröße (neu: Knöpfe über ihren Schlüssel, Statuszeile, grüner Kasten mit hat / braucht und roten Zutaten, Umstellen per Tippen auf ein Rezept, Vorrat als Bilder voll/blass, Knopfzeile unten, Tipp statt Beschreibung, Reiter „Erde“; nichts ragt aus dem Fenster oder dem grünen Kasten – diese Prüfung fand zwei echte Fehler, die behoben sind) – alle bestanden.

### v0.18.5 – Plan: übersichtliches Infofenster (09.11.2026, nur Doku)

**Vorgenommen:**
- Tobias' Antwort auf den Plan v0.18.4 festhalten: keine Warenbilder in der Bauleiste, Reiter „Erde“, Infofenster übersichtlicher.

**Fragen, die wir uns gestellt haben:**
- Gilt Tobias' „Go“ schon fürs Programmieren? → Für die Bauleiste und den Reiter ja; das Infofenster ist ein neuer Entwurf, den Tobias erst sehen soll (oberste Regel). Claude hat Vorschaubilder gezeigt und wartet auf sein OK.

**Gemacht:**
- `docs/archiv/PLAENE.md`: Plan für v0.19.0 „Übersichtliches Infofenster und Reiter ‚Erde‘“ (der Entwurf „Warenbilder in der Bauleiste“ ist als überholt markiert). `docs/STAND.md`: Status, nächster Schritt, offene Frage 1, neuer Arbeitsschritt oben (v0.18.2 fällt aus der Liste). Gespräch und Entscheidungen ergänzt.
- Spiel unverändert, nur die Versionsnummer steigt; `npm test` bestanden.

### v0.18.4 – Plan: Warenbilder in der Bauleiste (09.11.2026, nur Doku)

**Vorgenommen:**
- Tobias' Wahl (Punkt 1, Reiter umbenennen) und Claudes Plan-Entwurf für v0.19.0 festhalten.

**Fragen, die wir uns gestellt haben:**
- Wie zeigt man, was ein Gebäude herstellt? → Mit den Warenbildern vom Band, etwas größer (Tobias' Idee, Claudes Empfehlung). Wo im Knopf? → Varianten B und C, Tobias wählt.
- Wie stellt man die Gebäude selbst dar? → Emojis vorerst; selbst gezeichnete Gebäudebilder später in M4.

**Gemacht:**
- `docs/archiv/PLAENE.md`: Plan für v0.19.0 (Entwurf). `docs/STAND.md`: Status, nächster Schritt, offene Frage 1, neuer Arbeitsschritt oben (v0.18.1 fällt aus der Liste). Gesprächsprotokoll und Entscheidungen ergänzt.
- Vorschaubilder nur im Chat (nicht im Projekt gespeichert). Spiel unverändert, nur die Versionsnummer steigt; `npm test` bestanden.

### v0.18.3 – Balance bleibt, oberste Regel (09.11.2026, nur Doku)

**Vorgenommen:**
- Tobias' Antwort auf v0.18.2 festhalten (Option A) und seine neue oberste Regel in `CLAUDE.md` eintragen.

**Fragen, die wir uns gestellt haben:**
- Gilt die Regel „nie ohne Erlaubnis programmieren“ auch für reine Doku-Versionen? → Nein, die hält Claude weiter sofort fest („Nichts darf verloren gehen“); Claudes Lesart, Tobias kann sie ändern.

**Gemacht:**
- `CLAUDE.md`: neuer Abschnitt „Oberste Regel“ ganz oben.
- `docs/STAND.md`: Status, nächster Schritt, mögliche nächste Schritte, offene Frage 3 (Balance) gestrichen und die übrigen neu nummeriert, neuer Arbeitsschritt oben (v0.18.0 fällt aus der Liste).
- `docs/SPIEL.md`: Gold ist bewusst knapp, mehrere Spielstile; Kunden kaufen etwa 6 Stück pro Minute.
- Archiv: Entscheidungen (Balance bleibt, Theken-Verkauf bleibt, oberste Regel), Gesprächsprotokoll Chat 14 ergänzt.
- Spiel unverändert, nur die Versionsnummer steigt; `npm test` bestanden.

### v0.18.2 – Feedback nach einer Stunde Spielen (09.11.2026, nur Doku)

**Vorgenommen:**
- Tobias' Feedback nach etwa einer Stunde Spielen in Echtzeit (Chat 14) sofort festhalten, damit nichts verloren geht.

**Fragen, die wir uns gestellt haben:**
- Warum macht das Auffüllen mit Eisen fast pleite? → Claudes Rechnung (siehe Gesprächsprotokoll und offene Frage 3 in `docs/STAND.md`): Eine volle Schmelzhütte kostet 6.600 Gold, eine Feinschmiede verbraucht bei voller Arbeit das Eisen von etwa 17 Schmelzhütten, und die Kunden kaufen immer etwa 6 Stück pro Minute.
- Muss etwas geändert werden? → Noch offen; Tobias entscheidet nach Claudes Vorschlag.

**Gemacht:**
- `docs/STAND.md`: Status, Tobias' Fabrik nach dem Screenshot, offene Fragen 2 und 3, neuer Arbeitsschritt oben (v0.17.0 fällt aus der Liste). Gesprächsprotokoll ergänzt.
- Spiel unverändert, nur die Versionsnummer steigt; `npm test` bestanden.

### v0.18.1 – Doku neu geordnet (09.11.2026, nur Doku)

**Vorgenommen:**
- Die README (rund 280 KB) war zu lang: Claude las sie zu Beginn jedes Chats komplett, obwohl meist nur der aktuelle Stand gebraucht wird (Tobias).

**Fragen, die wir uns gestellt haben:**
- Was muss Claude zu Beginn wissen? → Regeln (`CLAUDE.md`), wo wir stehen (`docs/STAND.md`) und wie das Spiel heute ist (`docs/SPIEL.md`). Alles andere wird nur gezielt durchsucht.
- Wie bleibt `STAND.md` kurz? → Nur die letzten 3 Arbeitsschritte; vollständig steht jeder Schritt im Archiv.
- Wie bleibt `SPIEL.md` kurz? → Es beschreibt nur den aktuellen Stand; bei Änderungen wird ersetzt statt angehängt.
- Geht etwas verloren? → Nein: Die alten Abschnitte stehen wörtlich im Archiv, die alte README außerdem in der Git-Geschichte.

**Gemacht:**
- `README.md` als kurze Startseite; `CLAUDE.md` mit Lese-Reihenfolge, Zusammenarbeitsregeln, Arbeitsablauf und Doku-Pflege; `docs/STAND.md`, `docs/SPIEL.md` und `docs/TECHNIK.md` neu; im Archiv `PLAENE.md` (alter Abschnitt 6), `ENTSCHEIDUNGEN.md` (7), `VERSIONEN.md` (9), `GESPRAECHE.md` (10) und `KONZEPT-VERLAUF.md` (3, 4 und 8) wörtlich.
- Der Test der Versionsnummer prüft jetzt `docs/STAND.md`; Verweise im Code zeigen auf `docs/SPIEL.md`.
- Spiel unverändert; Tests (`npm test`) und Browser-Test in Tablet- und Handygröße bestanden.

### v0.18.0 – Bauleiste mit Reitern (09.11.2026)

**Vorgenommen:**
- Die Bauleiste übersichtlicher machen (Tobias, Chat 12 und 13): Reiter Holz, Stein, Eisen, Kräuter; was man oft braucht, immer sichtbar; ganz unten bauen können, ohne dass die Leiste die Fläche verdeckt.

**Fragen, die wir uns gestellt haben:**
- Reiter nach Straße (Holz, Stein, Eisen, Kräuter) oder nach Stufe (Rohstoff-Gebäude, Werkstätten, Kombi-Maschinen)? → Nach Straße (Tobias).
- Wohin mit den Kombi-Maschinen? → Zum Stoff, zu dem sie vom Namen her passen: Zimmerei bei Holz, Feinschmiede und Schlosserei bei Eisen (Claudes Vorschlag, Tobias: „passt so“).
- Werkzeuge als eigener Reiter oder immer sichtbar? → Immer sichtbar links, zusammen mit Lagerhaus und Versandportal (Tobias).
- Zuklappen oder „aus der Baufläche raus“? → Die Karte bekommt unten so viel Platz, wie die Leiste samt Reitern hoch ist; so liegt die Leiste unter der Karte statt darüber. Die Leiste wird dabei nicht höher.

**Gemacht:**
- Datentabelle: `BUILD_TABS` (Reiter mit Warenbild und Gebäuden) und `BUILD_ALWAYS` in `data/buildings.js`; `BUILD_MENU` ergibt sich daraus.
- Oberfläche: Bauleiste mit Werkzeug-Gruppe links, Trennstrich, Reitern und den Gebäuden des Reiters; gesperrte Reiter mit 🔒; Reiter wird in den Einstellungen gemerkt; eigene Größen für das Handy; Meldungen über der gerade offenen Leiste; Hinweis ausgeblendet, solange eine Leiste offen ist.
- Kamera: unten zusätzlicher Platz (`padBottom`), gemessen an der Höhe der Bauleiste samt Reitern.
- 255 automatische Tests (neu in `bauleiste.test.js`: Reiter und Reihenfolge, jedes Gebäude genau einmal erreichbar, immer sichtbar Lagerhaus und Versandportal, Einteilung der Kombi-Maschinen, höchstens 4 Gebäude je Reiter, Level-Fenster unverändert, Kamera mit Platz unten bei verschiedenen Zoomstufen, oben und an den Seiten unverändert) und der Browser-Test (neu: vier Reiter, „Holz“ zu Beginn offen, Werkzeuge immer links, Schloss am Reiter „Stein“ auf Level 1, Reiter „Eisen“ zeigt seine 4 Gebäude, alle Knöpfe passen auf den Bildschirm ohne herausragende Namen, Reiter bleibt gemerkt, Hinweis nicht über der Leiste, ganz nach unten geschoben liegt der Rand der Welt über den Reitern, Meldung über der Leiste; alle bisherigen Schritte wählen Gebäude jetzt über ihren Reiter) in Tablet- und Handygröße – alle bestanden.

### v0.17.0 – Ringelblume und Level 8 „Der Kräutergarten“ (09.11.2026)

**Vorgenommen:**
- Level 8 umsetzen, wie in v0.16.1 geplant und von Tobias freigegeben: Ringelblume im selben Beet, ein Gerät für alle Pflanzen (Erntebank), die erste Maschine des Kräuter-Kapitels mit zwei Eingängen.

**Fragen, die wir uns gestellt haben:**
- Wie verarbeitet ein Gerät zwei Pflanzen? → Es merkt sich, welche Pflanze gerade läuft und welche im Vorrat warten; der Vorrat darf gemischt sein und wird der Reihe nach verarbeitet. Holzfällerlager, Steinbruch und Schmelzhütte bleiben bei ihrem einen Rohstoff.
- Womit füllt „Auffüllen“? → Mit der Pflanze, die gerade läuft; ist die Erntebank leer, mit der, von der am meisten im Laden-Lager liegt.
- Was passiert mit bestehenden Flachsbrechen? → Sie heißen Erntebank und laufen weiter; der Spielstand trägt bei allen Rohstoff-Gebäuden den bisherigen Rohstoff ein (Version 14).

**Gemacht:**
- Datentabellen: 5 Waren (Ringelblumensamen, Ringelblume, Ringelblüte, Heilverband, Kräuterkompresse), Kräuterstube, 2 Rezepte, Ringelblume im Beet, Erntebank mit zwei Pflanzen, Level 8 mit 4 Aufträgen, Laden-Daten für Level 8.
- Spielregeln: Rohstoff-Gebäude mit mehreren Rohstoffen (`sourceInputs`, Vorrat mit Sorten, `refillInput`), Spielstand-Version 14 mit Umwandlung von Version 13.
- Oberfläche: Infofenster der Erntebank (je Pflanze einlegen, Vorrat mit Sorten), ein Säen-Knopf je Samen, Ringelblume im Beet mit orangen Blüten, 3 neue Warenbilder und 2 neue Varianten, Meldung zu Level 8 beim Öffnen.
- 247 automatische Tests (neu in `kraeutergarten.test.js`: Datentabellen, Preise, Baukosten nur aus Werkzeug-Waren, Ringelblume nicht kaufbar/verkäuflich, Level 8 mit Aufstieg, Ringelblume säen (mit Kauf) und ernten, gesperrt unter Level 8, Erntebank mit Ringelblume und gemischtem Vorrat in der richtigen Reihenfolge, Auffüllen mit der richtigen Pflanze, Kette Ringelblume → Erntebank → Band → Kräuterstube → 10 Heilverbände, Kräuterkompresse, Testpaket, Spielstand Version 14 und Umwandlung von Version 13; angepasst: Level-Tabelle, Aufstieg bis Level 8, Erfahrung je Level, Preistabelle mit mehreren Pflanzen) und der Browser-Test (neu: Aufträge von Level 7 per Test-Knopf, Aufstieg auf Level 8, zweites Beet und Kräuterstube per Touch bauen, zwei Säen-Knöpfe, Ringelblume säen, reif, ernten, in die Erntebank zur Flachspflanze legen, Kräuterstube mit beiden Einstellungen) in Tablet- und Handygröße – alle bestanden.
- Beim Testen gefunden und behoben: Das kleine Bild der Pflanzen (seit v0.16.0) zeigte die Stängel oben links in der Ecke statt unter den Blüten; die Blüten sind jetzt auch größer.

### v0.16.1 – Plan für Level 8 „Der Kräutergarten“ (08.11.2026, nur README)

**Vorgenommen:**
- Tobias' Test von v0.16.0 festhalten und Level 8 auf dem Papier planen, wie bei Level 7 („Der Vorplan war gut“).

**Fragen, die wir uns gestellt haben:**
- Braucht die Ringelblume ein eigenes Gerät? → Nein (Tobias): dieselbe Maschine wie für Flachs, 1 Pflanze → 50 getrocknete Ringelblüten. Deshalb ein allgemeiner Name – Claudes Vorschlag „Erntebank“.
- Was kostet die Kräuterstube? → Nur Werkzeug-Waren (Tobias: Aus Verbänden wird keine Maschine).
- Wofür ist die Kräuterkompresse? → Für Prellungen und Schwellungen (der Verband ist für Wunden); später Zutat für Größeres.
- Gleicher Takt? → Ja, 30 Minuten wie Flachs (Tobias); so ergeben 1 Beet Flachs + 1 Beet Ringelblumen genau 10 Heilverbände.

**Gemacht:**
- README: Plan für v0.17.0 (Abschnitt 6), Antworten in Abschnitt 4.4, Level 8 in Abschnitt 3.8, Status, Fahrplan, Entscheidungen, offene Fragen, Gesprächsprotokoll. Spiel unverändert; nur die Versionsnummer im Spiel steigt auf v0.16.1.

### v0.16.0 – Beet und Level 7 „Die Heilstube“ (08.11.2026)

**Vorgenommen:**
- Das Kräuter-Kapitel beginnen, wie in v0.15.1 geplant und von Tobias freigegeben: Beet (säen, wachsen, ernten), Flachsbreche, Webstube, Level 7 mit Heilerin Agnes.

**Fragen, die wir uns gestellt haben:**
- Wie passt ein Beet ohne Band in die Fabrik? → Es ist eine neue Art Gebäude: Säen und Ernten von Hand, die Pflanze kommt ins Laden-Lager und wird wie ein Holzstamm in die Flachsbreche eingelegt. Ab dort läuft alles über Bänder wie bisher.
- Wie sieht man, wann man ernten kann? → Die Pflanze wächst sichtbar in Stufen; reif blüht sie blau und zeigt 🌾, dazu einmal eine Meldung und im „Willkommen zurück“ die Zahl der reifen Beete.
- Was passiert mit dem Pleiteschutz? → Wer etwas im Beet wachsen hat, ist nicht pleite; Flachspflanzen zählen nicht als Händler-Rohstoff.
- Muss Tobias' Spielstand umgewandelt werden? → Nein; die Version steigt auf 13, damit eine ältere Version des Spiels einen neuen Spielstand nicht falsch liest.

**Gemacht:**
- Datentabellen: 4 Waren (Leinsamen, Flachspflanze, Flachsfaser, Verband), 3 Gebäude (Beet, Flachsbreche, Webstube), Rezept Verband, Level 7 mit 4 Aufträgen, Laden-Daten für Level 7.
- Spielregeln: neue Gebäudeart „Beet“ in `production.js` (säen, wachsen, ernten, Abreißen, Status, Fortschritt), „Säen“ mit Kauf in `market.js`, Pleiteschutz und Händler-Liste nur mit kaufbaren Rohstoffen, Spielstand-Version 13, reife Beete im Bericht „Willkommen zurück“.
- Oberfläche: Beet mit Erde, Furchen und wachsender Pflanze (Keimling → Blüten → 🌾), Infofenster mit „🌱 Säen“ und „🌾 Ernten“, 4 neue Warenbilder (Säckchen, Flachspflanze, Faserbündel, Verbandsrolle), Meldungen.
- 230 automatische Tests (neu in `garden.test.js`: Datentabellen, Preise je Stufe, Baukosten-Grenze, Flachspflanze nicht kaufbar/verkäuflich, Level 7 mit Aufstieg und Geschenk, säen und nach genau 30 Minuten reif, Ernten und Säen getrennt, Säen mit Kauf, gesperrt unter Level 7, Ernten bei vollem Lager, Abreißen, Flachsbreche mit Auffüllen nur aus dem Lager, ganze Kette 1 Pflanze → 10 Verbände, Rhythmus 3 Beete je Flachsbreche, Hintergrund mit reifen Beeten, Pleiteschutz, Testpaket, Spielstand Version 13 und Umwandlung von Version 12; angepasst: Level-Tabelle, Aufstieg bis Level 7, Erfahrung je Level, höchstes Level, Preistabelle) und der Browser-Test (neu: Aufstieg auf Level 7, Beet, Flachsbreche und Webstube per Touch bauen, säen, reif, Meldung, ernten, neu säen mit Kauf, Auffüllen der Flachsbreche ohne Kaufen-Knopf, Webstube ohne Umstellen, Händler, reifes Beet nach 2 Stunden im „Willkommen zurück“) in Tablet- und Handygröße – alle bestanden.
- Beim Testen gefunden und behoben: Nach genau 30 Minuten fehlte durch Rundung ein winziger Rest bis „reif“; „Auffüllen“ rechnete bei der Flachsbreche einen ungültigen Preis aus und schrieb „kein Flachspflanze …, Gold reicht nicht“ (jetzt: „keine Flachspflanzen im Laden-Lager“); die Blüten ragten oben aus dem Beet.

### v0.15.1 – Plan für Level 7 „Die Heilstube“ (08.11.2026, nur README)

**Vorgenommen:**
- Das Kräuter-Kapitel auf dem Papier planen, bevor Code entsteht: Gesamtbild Level 7–12 und Level 7 im Detail.

**Fragen, die wir uns gestellt haben:**
- Wie kommt die Pflanze ohne Band in die Faser-Maschine? → Ernten legt sie ins Laden-Lager, von dort legt man sie ein wie einen Holzstamm (Tobias: „Ja“).
- Ernten und Säen in einem Tipp? → Nein, zwei Schritte (Tobias).
- Wie viele Beete braucht eine Flachsbreche? → 3: Mit 10 Minuten je Pflanze und Vorrat 3 läuft die Flachsbreche genau eine Wachszeit (30 Minuten).
- Passen die Preise zu den Regeln? → Ja: jede Stufe bringt mehr (1.000 → 1.250 → 1.500), und kein neues Gebäude kostet mehr, als ein Samen einbringt.
- Wie geht es nach Level 7 weiter? → Schritt für Schritt wie im Werkzeug-Kapitel: Level 8 Ringelblume und die erste Maschine mit 2 Eingängen, Level 9 eine dritte Pflanze, bis Level 10 Fasern + 3 Pflanzen, Level 11–12 weiter kombinieren (Tobias).

**Gemacht:**
- README: Plan für v0.16.0 (Abschnitt 6), Gesamtbild und Antworten in Abschnitt 4.4, Level 7 in Abschnitt 3.8, Status, Fahrplan, Entscheidungen, offene Fragen, Gesprächsprotokoll. Spiel unverändert; nur die Versionsnummer im Spiel steigt auf v0.15.1.

### v0.15.0 – Test-Knopf „Auftrag erledigen“ (08.11.2026)

**Vorgenommen:**
- Tobias' Wunsch nach dem Test von v0.14.0: ein Knopf für den Prototyp, der einen Auftrag automatisch abschließt – die Aufträge macht Tobias gerade nicht aktiv, weil die Spielmechanik im Vordergrund steht.

**Fragen, die wir uns gestellt haben:**
- Was gibt der Knopf? → Nur die Erfahrung. Keine Waren weg, kein Gold – sonst wäre es Gratis-Gold, das die Wirtschaft verfälscht. Aufsteigen kostet weiter Gold.
- Wann ist er zu sehen? → Immer, solange das Spiel ein Prototyp ist (Tobias); im Testmodus liefe die Zeit ×10, Tobias spielt aber in Echtzeit.
- Was bringt er auf Level 6? → Die Erfahrung der Stadttor-Aufträge sammelt sich bis Level 7; richtig nützlich wird er mit dem Kräuter-Kapitel und bei einem neuen Spiel.
- Muss der Spielstand umgewandelt werden? → Nein.

**Gemacht:**
- Datentabelle `data/levels.js`: `QUEST_TEST_SKIP = true`. Spielregeln in `quests.js`: `canSkipQuest`, `skipQuest` (Erfahrung und `xpTotal`, nächster Auftrag, keine Waren, kein Gold).
- Level-Fenster: lila, gestrichelter Kasten mit „🧪 Test: Auftrag erledigen“ und der Erfahrung, die er bringt; Bestätigung „Auftrag als erledigt gewertet (Test)“ und kurze Meldung.
- 211 automatische Tests (neu in `quests.test.js`: Knopf eingeschaltet, Erfahrung ohne Waren und Gold, geht auch ohne die Waren und danach normal weiter, alle Aufträge jedes Levels ergeben genau die Erfahrung und Aufsteigen braucht weiter Gold, höchstes Level sammelt Erfahrung, Spielstand-Format unverändert) und der Browser-Test (neu: Knopf ohne Testmodus sichtbar, auf Level 6 per Touch: +259 Erfahrung, kein Gold, keine Waren, alle 4 Stadttor-Aufträge, danach kein Knopf mehr) in Tablet- und Handygröße – alle bestanden.

### v0.14.0 – Fabrik läuft im Hintergrund weiter & Rohstoff-Vorrat (07.11.2026)

**Vorgenommen:**
- Tobias' Wunsch (Chat 10): Das Spiel läuft im Hintergrund weiter, aber man muss selbst nachlegen – wie Clash of Clans, nur umgekehrt. Dazu mehrere Rohstoffe je Gebäude, ein Knopf „Auffüllen“ und das Lagerhaus nur noch zum Befüllen.

**Fragen, die wir uns gestellt haben:**
- Wie lange läuft eine Fabrik ohne Spieler? → Mit einem Rohstoff nur 15 Minuten, egal wie viele Holzfäller (sie arbeiten gleichzeitig). Deshalb ein Vorrat: 3 Rohstoffe (Tobias), also 45 Minuten, und die Maschinen danach, bis ihre Zutaten aufgebraucht sind.
- Dürfen Kunden im Hintergrund kaufen? → Ja, bis die Theken leer sind (Tobias).
- Was bleibt vom Lagerhaus? → Befüllen und Ausräumen; der Nachschub fällt weg, weil er die Bänder aushebelt (Tobias).
- Wie rechnet man Stunden nach, ohne dass das Tablet hängt? → Die Fabrik Takt für Takt, bis sie stillsteht (geprüft alle 10 Sekunden Spielzeit); danach nur noch die Kunden im Schnelldurchlauf. In Portionen, mit Hinweis und Fortschrittsleiste. Laufen Waren endlos im Kreis, rechnet die Fabrik höchstens 4 Stunden nach.
- Was passiert mit der Uhr? → Gerechnet wird ab dem letzten Speichern (alle 10 Sekunden und beim Verlassen). Während des Nachrechnens wird nicht gespeichert; eine zurückgestellte Uhr ändert nichts.

**Gemacht:**
- Datentabellen: Vorrat `capacity: 3` bei Holzfällerlager, Steinbruch und Schmelzhütte; neue Tabelle `data/offline.js`; Lagerhaus ohne `supplyBuffer`; neue Gebäudetexte.
- Spielregeln: Vorrat (`queued`) in `production.js` (nacheinander verarbeiten, beim Abreißen kommen wartende Rohstoffe zurück), „Auffüllen“ in `market.js`, Nachschub aus `warehouse.js` entfernt, neues `src/core/offline.js` (Nachrechnen in Portionen, Stillstand erkennen, Bericht).
- Oberfläche: Knöpfe „⏫ Auffüllen“ und „➕ 1 Holzstamm einlegen“, Vorrat und „Leer in etwa …“ im Infofenster, drei Punkte am Gebäude; Lagerhaus-Fenster nur noch zum Befüllen; Hinweis „Die Fabrik holt die Zeit nach …“ und Fenster „Willkommen zurück“ (`src/view/offline.js`); `main.js` erkennt Pausen (App im Hintergrund, Standby) und rechnet nach.
- Spielstand-Version 12 mit Umwandlung von Version 11 (leerer Vorrat, Nachschub weg, Meldung).
- 206 automatische Tests (neu in `offline.test.js`: Vorrat aus der Datentabelle, 3 Holzstämme → 600 Blöcke, Abreißen mit Vorrat, Speichern und ungültiger Vorrat, Umwandlung von Version 11, Auffüllen aus dem Laden-Lager und per Kauf, Gold- und Level-Grenzen, Nachrechnen ergibt genau dasselbe wie das laufende Spiel, Stillstand und Schnelldurchlauf, Kunden bis die Theken leer sind, volles Laden-Lager, endloser Kreis, in Stücken nachrechnen, keine oder negative Zeit; in `warehouse.test.js`: leeres Lagerhaus bleibt leer, Umwandlung des Nachschubs) und der Browser-Test (neu: Auffüllen mit Kauf, Vorrat 3 / 3, Lagerhaus ohne Nachschub, 20 Minuten weg in der App, 2 Stunden mit geschlossenem Spiel) in Tablet- und Handygröße – alle bestanden.
- Beim Testen gefunden und behoben: Der Browser-Test zählte beim Lagerhaus auch Eisenbarren einer anderen Linie mit und schlug deshalb manchmal fehl.

### v0.13.0 – Aufträge aus dem Ort & neue Warennamen (07.11.2026)

**Vorgenommen:**
- Tobias' Wunsch nach v0.12.0: Das Spiel soll in der Gesamtheit mehr Sinn ergeben. Ein roter Faden (wachsender Ort, Bewohner, Bauabschnitte), Produktnamen, die zu ihren Zutaten passen, und Aufträge mit Erfahrung als Weg zum nächsten Level (Modell von Tobias).

**Fragen, die wir uns gestellt haben:**
- Ist es logisch, was aus zwei Produkten entsteht? → Nicht immer (z. B. Kugellager aus einem Scharnier). Lösung: Namen ändern, Rezepte behalten – so bleibt die Balance, und Tobias' Fabrik läuft weiter.
- Wo stehen die Aufträge? → Im Level-Fenster, weil die Erfahrung fürs Level gebraucht wird (Tobias).
- Wie viele gleichzeitig, und gibt es weitere Bestellungen? → Immer genau einer, 2–5 je Level, keine weiteren Anfragen – der Ladenverkauf bleibt im Vordergrund (Tobias).
- Wie viel Gold? → So viel wie an der Theke, nicht mehr; die Erfahrung steht im Vordergrund (Tobias).
- Wie passen Erfahrung und Aufstieg zusammen? → Die Aufträge eines Levels bringen genau die nötige Erfahrung; der Aufstieg kostet dann Gold.
- Was passiert mit Tobias' Fabrik auf Level 6? → Sie behält ihr Level und bekommt die Aufträge vom Stadttor; die Erfahrung sammelt sich bis Level 7.

**Gemacht:**
- Datentabellen: neue Namen, Bilder und Einstellungs-Namen für 8 Waren; `data/levels.js` mit Bauabschnitten, Geschichte, 21 Aufträgen, Aufstiegspreisen und Belohnungs-Regel.
- Neue Spielregeln `src/core/quests.js` (aktueller Auftrag, Belohnung, abgeben, Erfahrung je Level); `src/core/levels.js`: Aufsteigen mit Erfahrung und Gold, Grund, warum es noch nicht geht.
- Level-Fenster neu mit den Reitern „📜 Aufträge“ und „🏘️ Ort & Level“; Erfahrungsleiste und ❗ im Knopf „Laden-Level“; Meldungen, wenn ein Auftrag bereit ist oder man aufsteigen kann.
- Neue Warenbilder: Zahnradwelle, Räderwerk, Schlüssel, Zirkel, Gewichtstein, Uhrwerk.
- Spielstand-Version 11 mit Umwandlung von Version 10 (Namen überall, Aufträge von vorn) und Meldung beim Öffnen.
- 195 automatische Tests (neu in `quests.test.js`: neue Namen mit gleichen Rezepten und Werten, Belohnung, Erfahrung eines Levels reicht genau, Abgeben aus dem Laden-Lager, Theken zählen nicht, letzter Auftrag, höchstes Level, Speichern, Umwandlung von Version 10 mit alten Namen an allen Stellen, ungültige Aufträge; in `levels.test.js`: jedes Level mit 2–5 Aufträgen aus herstellbaren Waren, jedes Kombi-Produkt kommt in einem Auftrag vor, Aufstieg erst mit Erfahrung, dann mit Gold, neues Spiel mit echter Produktion bis Eisen) und der Browser-Test (neu: ❗ erscheint, Auftrag per Touch abgeben, Erfahrungsleiste, Aufstieg kostet 100 Gold, Reiter „Ort & Level“, Aufträge vom Stadttor auf Level 6) in Tablet- und Handygröße – alle bestanden.
- Beim Testen gefunden und behoben: Auf dem höchsten Level war die Erfahrungsleiste voll, obwohl „0“ dastand; sie zeigt jetzt den Fortschritt im Bauabschnitt.

### v0.12.0 – Nachschub aus dem Laden-Lager & Bänder leeren (07.11.2026)

**Vorgenommen:**
- Tobias' Wunsch nach Level 6: Waren aus dem Laden-Lager zurück auf ein Band bringen – ein Gegenstück zum Versandportal, am besten über das Zwischenlager (Lagerhaus). Dazu die in v0.11.1 vorgemerkten Knöpfe „Strecke leeren“ und „Zulauf leeren“.

**Fragen, die wir uns gestellt haben:**
- Neues Gebäude oder das Lagerhaus? → Das Lagerhaus (Tobias' Idee): Es kann ohnehin lagern und ausgeben und bekommt so eine klare Aufgabe.
- Einmal befüllen oder dauerhaft nachholen? → Beides: „Befüllen“ für einen Vorrat (z. B. 120 Eisenbarren), „Nachschub“ als echtes Gegenstück zum Versandportal.
- Wie verhindert man, dass der Nachschub das Baumaterial leer zieht? → Ein einstellbarer Rest bleibt immer im Laden-Lager.
- Wie viel holt der Nachschub auf einmal? → Nur bis zu 10 Stück; der Rest bleibt im Laden-Lager sichtbar und nutzbar, mehrere Lagerhäuser teilen sich eine Ware.
- Welche Zuleitung leert „Zulauf leeren“? → Die mit der falschen Ware; die richtige wartet nur auf ihre Zutat.
- Muss Tobias' Spielstand umgewandelt werden? → Ja, kurz: Lagerhäuser bekommen „kein Nachschub“ (Version 10); sonst bleibt alles, wie es ist.

**Gemacht:**
- Neue Spielregeln `src/core/warehouse.js` (befüllen, Nachschub mit Rest, ausräumen), Nachschub im Takt der Simulation und im Statuslicht; Datentabelle `supplyBuffer: 10` beim Lagerhaus.
- `src/core/belts.js`: zusammenhängende Strecke finden, Strecke leeren, gestaute Zuleitungen einer Maschine erkennen und leeren.
- Neues Fenster `src/view/warehouse.js` (Ware wählen, Menge bzw. Rest), Knöpfe in den Infofenstern von Lagerhaus, Band und Maschinen, Kreispfeil mit Warenbild am Lagerhaus, hell markierte Strecke beim angetippten Band.
- Spielstand-Version 10 mit Umwandlung von Version 9 und Meldung beim Öffnen.
- 184 automatische Tests (neu in `warehouse.test.js`: Befüllen auf 3 Fächer, Grenzen durch Laden-Lager und Platz, keine Rohstoffe, 120 Eisenbarren → 24 Eisenstangen, Nachschub hält 10 bereit, Nachschub durch die Fabrik und weiter, sobald Neues ins Laden-Lager kommt, Rest bleibt liegen, zwei Lagerhäuser teilen sich eine Ware, Ausräumen schaltet ab, Abreißen, Speichern, Umwandlung von Version 9, ungültiger Nachschub, Strecke über Abzweig und Zusammenführung, Band daneben bleibt, Strecke endet am Gebäude, Zulauf leeren nur bei falscher Ware, gemischtes Band, ohne Stau nichts) und der Browser-Test (neu: Zuleitung per Touch, Strecke antippen und leeren, Zulauf leeren an der Zimmerei, Lagerhaus mit Band zum Versandportal per Touch bauen, Befüllen mit Mengenwahl, 120 Eisenbarren laufen über das Band zurück ins Laden-Lager, Nachschub mit Rest 20, „Nachschub aus“, Ausräumen) in Tablet- und Handygröße – alle bestanden.
- Beim Testen gefunden und behoben: Eine ältere Prüfung im Browser-Test („Alle“ auf die Theke) schwankte, wenn genau dann ein Kunde kaufte; sie rechnet seine Einkäufe jetzt mit (wie schon die Prüfung mit 8 Stück).

### v0.11.1 – Test-Feedback (07.11.2026, nur README)

**Vorgenommen:**
- Tobias' Feedback zu v0.11.0 festhalten und die Idee „Bänder leeren“ vormerken, damit der nächste Chat direkt daran anknüpfen kann.

**Fragen, die wir uns gestellt haben:**
- Wie werden falsche Waren auf einer Strecke los, ohne die Bänder abzureißen? → Knopf „🧺 Strecke leeren“ am Band und „🧺 Zulauf leeren“ an blockierten Maschinen; die Waren kommen ins Laden-Lager (vorgemerkt).
- Liegt das Problem am Spiel oder an der Spielweise? → Beides ein wenig: Tobias merkt selbst, dass ein „eiserner Bestand“ an Baumaterialien hilft; der Knopf bleibt trotzdem eine gute Erleichterung.
- Jetzt programmieren? → Nein (Tobias): erst bis Level 6 spielen und Feedback sammeln.

**Gemacht:**
- README: Status, Fahrplan, Abschnitt „Vorgemerkt: Bänder leeren“, Entscheidungen, offene Fragen, Gesprächsprotokoll. Spiel unverändert; nur die Versionsnummer im Spiel steigt auf v0.11.1.

### v0.11.0 – Umbauen: Bereiche verschieben (07.11.2026)

**Vorgenommen:**
- Tobias' Wunsch nach dem Test von v0.10.2: Umbauen ist umständlich, weil man jedes Band einzeln abreißen und neu legen muss. Teile sollen sich verschieben lassen, und ein markierter Bereich – z. B. die ganze Eisen-Produktion – soll sich als Ganzes versetzen lassen. Dazu die Taste R zum Drehen.

**Fragen, die wir uns gestellt haben:**
- Wie markiert man mit dem Finger, ohne dass die Karte mitwandert? → Wie beim Förderband: Ein Finger zieht das Rechteck, zwei Finger bewegen die Karte.
- Was gehört zur Markierung? → Alles im Rechteck, auch Gebäude, die nur zum Teil darin liegen (Tobias); das gelbe Leuchten zeigt genau, was dabei ist.
- Bleibt die Linie beim Drehen verbunden? → Ja: Bänder drehen ihre Richtungen mit, Gebäude ihre Ein- und Ausgänge; auch Waren auf den Bändern drehen mit. Ein Test lässt eine gedrehte Linie in allen drei Drehungen bis ins Versandportal laufen.
- Was ist mit Bändern, die von außen hineinführen? → Sie bleiben stehen; an der neuen Stelle schließt man neu an.

**Gemacht:**
- Neue Spielregeln `src/core/area.js`: markieren, Vorschau mit belegten Feldern, verschieben mit Drehung, abreißen mit Rückerstattung.
- Bauleiste mit dem Werkzeug „✥ Verschieben“, Werkzeugleiste mit „🧹 Abreißen“ und „✥ Verschieben“, gelbe Markierung, gestrichelter Rahmen beim Ziehen, Vorschau der Gruppe mit grünen und roten Feldern, Taste R.
- 163 automatische Tests (neu in `area.test.js`: Markieren mit halb erfassten Gebäuden, Linie verschieben mit Waren und angefangenem Holzstamm, gedreht verschieben um 90°/180°/270° mit laufender Produktion bis ins Laden-Lager, Ware dreht mit, belegte Felder und Grundstücksrand, Abzweig ins Leere, Bereich abreißen mit Rückerstattung, Speichern nach dem Verschieben) und der Browser-Test (neu: Rechteck per Touch ziehen, Gruppe mit Taste R drehen und mit dem Finger verschieben, Zuleitung zeigt danach in den Eingang, Bereich abreißen mit Rückfrage, Taste R dreht ein angetipptes Gebäude) in Tablet- und Handygröße – alle bestanden.
- Beim Testen gefunden und behoben: Eine Prüfung im Browser-Test (Theke mit genau 8 Holzblöcken) schwankte, wenn genau in diesem Moment ein Kunde kaufte; sie rechnet seine Einkäufe jetzt mit.

### v0.10.2 – Fläche für 500 Gold & Warenbilder in der Bauleiste (07.11.2026)

**Vorgenommen:**
- Tobias' Rückmeldungen zu v0.10.1: Die Fläche ist noch immer ein entscheidender Faktor – jeder Kauf soll 500 Gold kosten, ohne teurer zu werden, und jede Seite soll sich 2× erweitern lassen. Außerdem fehlten in der Bauleiste die Warenbilder.

**Fragen, die wir uns gestellt haben:**
- Wie tief ist ein Streifen? → 4 Reihen, schon ab Level 1 (Tobias: „4 Reihen reichen“).
- Wie hat jede Seite Platz für 2 Käufe? Oben waren bisher nur 5 Reihen frei, rechts 10. → Die Welt ist jetzt genau 8 Felder um das Startgrundstück herum groß (38 × 30). Damit Gebäude ihre Felder behalten, beginnt sie oben bei Reihe −3 statt 0.
- Was passiert mit schon gekaufter Fläche? → Sie bleibt und zählt mit; übrig gebliebene Rest-Streifen kosten anteilig weniger.
- Warum fehlten die Bilder? → Sie wurden nur beim Start gezeichnet; nach dem Minimieren darf der Browser sie wegwerfen. Tobias bestätigte: Die Bilder waren erst nach dem Minimieren weg.

**Gemacht:**
- Datentabelle `land.js`: Streifentiefe 4, 2 Käufe je Seite, 500 Gold je Streifen. Welt mit eigener Ecke (`state.js`), Spielregeln für Preis und „wie oft noch“ (`land.js`), Zeichnen und Kamera mit der neuen Welt.
- Spielstand-Version 9 mit Umwandlung von Version 8 (Welt passend zur gekauften Fläche), Meldung beim Öffnen.
- Warenbilder: merken sich, was sie zeigen, und werden beim Öffnen der Bauleiste sowie beim Zurückkehren ins Spiel neu gezeichnet.
- Nachgestellt: ein Spielstand aus v0.10.1 auf Level 4 mit gekaufter Fläche (oben bis an den alten Rand, rechts 6 Spalten) öffnet sich mit Meldung, Fabrik und Fläche unverändert; die Schilder zeigen oben 380 Gold (3 Reihen) und rechts 250 Gold (2 Spalten).
- 155 automatische Tests (neu u. a.: 500 Gold bei jedem Kauf, 4 Reihen auf jedem Level, jede Seite genau 2×, alles gekauft = 38 × 30 für 4.000 Gold, Bauen oberhalb von Reihe 0, Rest-Streifen anteilig, Umwandlung von Version 8 auch mit Fläche über die neue Welt hinaus) und der Browser-Test (neu: Angebot 4 Spalten für 500 Gold schon auf Level 1, rechts 2× kaufen bis zum Rand, Warenbilder der Bauleiste erscheinen nach dem Wegwerfen beim Öffnen und beim Zurückkehren wieder) in Tablet- und Handygröße – alle bestanden.

### v0.10.1 – Feinschliff nach Tobias' Test (07.11.2026)

**Vorgenommen:**
- Tobias' Rückmeldungen zu v0.10.0 umsetzen: Theken, Laden-Lager, Fläche, Umstellen von Maschinen.

**Fragen, die wir uns gestellt haben:**
- Wohin waren die Teile beim Umstellen „verschwunden“? → Ins Laden-Lager (es gab nur eine kurze Meldung). Verloren ging nichts, aber es war verwirrend. Jetzt bleiben sie in der Maschine.
- Wie sieht man die Rezepte der anderen Einstellungen, ohne umzustellen? → Im Infofenster unter „Andere Einstellungen“.
- Wann werden die Theken größer? → Alle gemeinsam: 20 bis Level 3, 25 auf Level 4, 30 ab Level 5.
- Was passiert mit Theken, auf denen mehr liegt, als jetzt passt? → Der Rest kommt beim Öffnen ins Laden-Lager, mit Meldung.
- Wie viel mehr Fläche? → Ab Level 4 doppelt so tiefe Streifen bei gleichem Preis je Feld.

**Gemacht:**
- Datentabellen: Theken-Größe je Level, Laden-Lager 1.000 ab Level 4, Streifentiefe je Level.
- Spielregeln: Teile bleiben beim Umstellen in der Maschine, „Reste ins Laden-Lager“, Theken beim Laden anpassen.
- Anzeige: Infofenster mit den Rezepten aller Einstellungen und dem, was noch in der Maschine liegt; Level-Fenster nennt größere Theken und Laden-Lager.
- 150 automatische Tests (neu u. a.: Theken 20/25/30 bis Level 6, Laden-Lager 500/1.000, Streifen 4 tief ab Level 4 und am Rand der Welt kürzer, Teile bleiben beim Umstellen und mitten im Durchgang, Reste-Knopf, Spielstand mit 35 Stück auf einer Theke) und der Browser-Test (neu: andere Einstellungen im Infofenster, Umstellen und Zurückstellen ohne Verlust, Reste-Knopf, fünf Theken mit je 30 Plätzen, Laden-Lager 1.000, Fläche 4 Spalten auf Level 6) in Tablet- und Handygröße – alle bestanden.

### v0.10.0 – Techbaum, Teil 2 (06.11.2026)

**Vorgenommen:**
- Die nächste Stufe des Techbaums mit Maschinen, die zwei verschiedene Zutaten verarbeiten – nach Tobias' Wunsch nur 3 Maschinen mit je 3 Produkten statt 6 Maschinen.
- Level 4 bis 6, mit jedem Level eine Verkaufstheke mehr; die Menge auf der Theke soll sich genau einstellen lassen.

**Fragen, die wir uns gestellt haben:**
- Wie viele Maschinen? → 3 (Tobias), sonst wird es unübersichtlich; dafür 3 Einstellungen je Maschine.
- Wie werden alle Rohstoffe gleich gebraucht? → Eigene Rezepte mit 10 + 5 Grundteilen (Tobias); die Steinkette nimmt Steinplatten, damit jedes Grundteil vorkommt.
- Was passiert, wenn beide Zutaten über ein Band kommen? → Es klappt, solange das Verhältnis passt; nimmt eine Zutat überhand, staut sich der Eingang. Die Maschine zeigt das rot an („Eingang blockiert“); am sichersten bekommt jede Zutat ihren eigenen Eingang.
- Woran sieht man, was fehlt? → Bild der fehlenden Zutat an der Maschine, im Infofenster jede Zutat mit Häkchen und „fehlt noch …“.
- Was ist das Geschenk ab Level 4, wenn es keinen vierten Rohstoff gibt? → 1 Eisenerz.
- Muss Tobias' Spielstand umgewandelt werden? → Nein, das Format bleibt gleich; neue Theken kommen beim Aufstieg (und beim Laden, falls welche fehlen) dazu.

**Gemacht:**
- Datentabellen: 9 Waren, 9 Rezepte, 3 Gebäude, Level 4–6, Theken je Level und Plätze je Theke; Testpaket mit je 5 Kombi-Teilen.
- Spielregeln: Theken beim Aufstieg, Menge auf der Theke einstellen, Zutaten der Werkstatt mit Vorrat, Stau am Eingang erkennen, nicht gebrauchte Zutaten beim Umstellen zurück ins Laden-Lager.
- Anzeige: neue Warenbilder (Kurbel, Schalter, beschlagene Platte, Scharnier, Feder, Kugellager, Kette, Regler, Schloss), Sprechblase mit fehlender Zutat, Infofenster mit Zutatenliste und drei Einstellungen, Mengenwahl für die Theken, Level-Fenster nennt neue Theken, breitere Fenster.
- 145 automatische Tests (neu u. a. in `combo.test.js`: beide Eingänge, vertauschte Eingänge, Mini-Schloss, Regler, Kugellager, fehlende Zutat ohne Stau, Stau auf gemischtem Band, falsche Ware, Umstellen, Theken bis Level 6 mit 20/20/25/30/35 Plätzen, genau 8 Stück auf die Theke, Spielstand mit fehlender Theke) und der Browser-Test (neu: Menge 8 einstellen, „Alle“, Aufstieg bis Level 6, Zimmerei per Touch bauen, Infofenster mit fehlender Zutat, Umstellen, 5 Theken) in Tablet- und Handygröße – alle bestanden.
- Beim Testen gefunden und behoben: Die Sprechblase rutschte bei größerer Darstellung auf den Namen; auf dem Tablet brachen „Ware wählen“ und „Abräumen“ um und „Alle (20)“ rutschte in eine eigene Zeile. Außerdem eine Prüfung im Browser-Test, die schwankte, wenn genau beim Kauf ein Kunde bezahlte.

### v0.9.2 – Test-Feedback (06.11.2026, nur README)

**Vorgenommen:**
- Tobias' Feedback zum Test von v0.9.1 festhalten, damit der neue Chat direkt mit dem Plan für v0.10.0 starten kann.

**Fragen, die wir uns gestellt haben:**
- Ist das Grinden zu viel? → Nein, Tobias hat es sich genau so vorgestellt.
- Passen die Flächenpreise? → Noch nicht genutzt, wirken aber erschwinglich.
- Was heißt das für v0.10.0? → Die neuen Maschinen sollen mit ein paar weiteren Runden Rohstoffe erreichbar sein.

**Gemacht:**
- README: Status, Fahrplan, Ausblick v0.10.0, Entscheidungen, offene Fragen, Gesprächsprotokoll. Spiel unverändert; nur die Versionsnummer im Spiel steigt auf v0.9.2.

### v0.9.1 – Startkapital (06.11.2026)

**Vorgenommen:**
- Tobias ist beim Test in Echtzeit nach dem ersten Holzstamm fast pleite gegangen (372 Gold, der nächste Stamm kostet 550). Vorschlag von Tobias: 500 Gold Startkapital.

**Fragen, die wir uns gestellt haben:**
- Liegt es an der Spielweise? → Nein: Der erste Holzstamm muss die ersten Gebäude mitbezahlen und bringt dann höchstens rund 400 Gold – nie genug für den zweiten.
- Muss Tobias neu anfangen? → Nein, bestehende Spielstände bekommen die 500 Gold einmalig nachgezahlt.
- Soll der Pleiteschutz einen Rohstoff ohne passendes Gebäude ignorieren? → Vorerst nicht (Tobias); mit Startkapital kaum noch nötig.

**Gemacht:**
- Startgold 500 in der Datentabelle, Spielstand-Version 8 mit Nachzahlung, Meldung beim Öffnen.
- Nachgestellt: Tobias' Testspiel (Level 2, 372 Gold, Felsbrocken) öffnet sich mit 872 Gold auf Level 2.
- 125 automatische Tests (neu: Startkapital reicht nach 2 Sägewerken für den zweiten Holzstamm, Nachzahlung nur einmal) und der Browser-Test – alle bestanden.

### v0.9.0 – Fläche kaufen & erste Level (06.11.2026)

**Vorgenommen:**
- Mehr Platz für neue Maschinen: Fläche kaufen vorziehen (Tobias: Der Platz ist das Problem, nicht die Zeit).
- Erste, bewusst einfache Level, damit der Weg Holz → Stein → Eisen schon jetzt rund spielbar ist.

**Fragen, die wir uns gestellt haben:**
- Wie wächst das Grundstück, ohne dass Gebäude verrutschen? → Es bleibt ein Rechteck und wächst in Streifen an einer Seite; alles behält seine Stelle.
- Wie verhindert man versehentliche Käufe? → Erst die Fläche antippen (Streifen wird hell, Fenster mit Preis), dann „Kaufen“.
- Woran sieht man, was ein Level bringt und was fehlt? → Level-Fenster mit Häkchen-Liste, ⬆ oben in der Leiste, gesperrte Gebäude mit Schloss in der Bauleiste und beim Händler.
- Was passiert mit Tobias' Fabrik? → Sie bekommt Level 3; nichts wird gesperrt.

**Gemacht:**
- Neue Datentabellen `levels.js` und `land.js`, Level bei Gebäuden und Rohstoffen, neue Spielregeln `src/core/levels.js` und `src/core/land.js`, Level-Fenster `src/view/levels.js`.
- Spielstand-Version 7 mit Umwandlung von Version 6 (Level 3, Zähler, gekaufte Fläche).
- Nachgestellt: Ein Spielstand wie Tobias' Fabrik aus v0.8.0 öffnet sich mit Level 3, Gold und Gebäuden; die Meldung zum Flächenkauf erscheint.
- 123 automatische Tests (neu u. a.: Streifen und Preise an allen Seiten, Rand der Welt, ganze Welt kaufen, Antippen der gesperrten Fläche, Sperren beim Bauen und beim Händler, Zählen hergestellter Waren, Aufstieg mit Geschenk, neues Spiel von Holz bis Eisen, Umwandlung von Version 6) und der Browser-Test (neu: Start nur mit Holz, gesperrte Gebäude und Rohstoffe, Fläche kaufen per Touch, Aufsteigen auf Level 2 und 3 im Level-Fenster) – alle bestanden.
- Beim Testen gefunden und behoben: Die Schilder über und unter dem Grundstück lagen beim Öffnen halb unter der oberen Leiste; der Rand beim Öffnen ist jetzt etwas größer.

### v0.8.0 – Eisenstange statt Eisennägel (06.11.2026)

**Vorgenommen:**
- Tobias' Wunsch: weniger Nägel. Die Schmiede macht Eisenstangen im Verhältnis 5 : 1 wie die anderen Grundmaschinen.

**Fragen, die wir uns gestellt haben:**
- Wie heißt das neue Teil? → „Eisenstange“, passend zu Eisenerz und Eisenbarren (Tobias: „klingt sehr gut“).
- Was passiert mit vorhandenen Nägeln? → Je 5 werden zu 1 Stange (aufgerundet), überall, wo sie liegen; eine Meldung sagt, wie viele.
- Was heißt das für den Techbaum Teil 2? → „2 Eisennägel“ wird zu „1 Eisenstange“; Werte neu gerechnet als Entwurf (Abschnitt 4.2).

**Gemacht:**
- Datentabellen: Ware Eisenstange (eigene Form), Rezept „Stangen“; Eisennagel entfernt.
- Spielstand-Version 6 mit Umwandlung von Version 5 (Lager, Theken, Lagerhäuser, Bänder, Schmiede, Verkaufsliste).
- Nachgestellt: Update von v0.7.1 mit 140 Nägeln im Lager und 12 auf der Theke → 28 und 3 Eisenstangen, Meldung erscheint, kein Startfehler.
- 103 automatische Tests (neu: Schmiede 200 Barren → 40 Stangen, alle Grundmaschinen 5 : 1, Umwandlung von Version 5 mit Nägeln an allen Stellen) und der Browser-Test (Schmiede auf „Stangen“ umstellen) – alle bestanden.

### v0.7.1 – Startfehler behoben (06.11.2026)

**Vorgenommen:**
- Das Spiel startete bei Tobias nach dem Update auf v0.7.0 nicht mehr (schwarzer Bildschirm, oben nur „v“).

**Fragen, die wir uns gestellt haben:**
- Ist der Spielstand kaputt? → Nein: Ein Browser ohne Zwischenspeicher öffnet Tobias' Fabrik in v0.7.0 problemlos.
- Warum dann? → Der Browser lud nur die Startdatei neu (sie hatte als einzige eine Versionsnummer) und nahm die übrigen bis zu 10 Minuten aus dem Zwischenspeicher. Neue und alte Dateien passten nicht zusammen. Nachgestellt mit einem Testserver, der wie GitHub Pages zwischenspeichert.
- Wie verhindern wir das dauerhaft? → Versionsnummer an jeder Datei (Import-Map), ein Werkzeug, das sie schreibt, und ein Test, der prüft, dass keine Datei fehlt.

**Gemacht:**
- Import-Map in `index.html`, `tools/set-version.mjs`, Meldung bei Startfehlern.
- Nachgestellt und geprüft: Wechsel v0.6.1 → v0.7.1, v0.7.0 → v0.7.1 und v0.7.1 → eine gedachte v0.7.2 mit geänderter Datentabelle starten alle sauber; ein absichtlich eingebauter Fehler zeigt die Meldung.
- 101 automatische Tests (neu: Import-Map vollständig) und der Browser-Test (neu: alle Dateien mit Versionsnummer geladen, keine Startfehler-Meldung) – alle bestanden.

### v0.7.0 – Handel (06.11.2026)

**Vorgenommen:**
- Mit der Fabrik Gold verdienen: Händler, Verkaufstheken, Kunden; Bauen kostet Waren; Start ohne Gold; Pleiteschutz.

**Fragen, die wir uns gestellt haben:**
- Gold oder Waren als Baukosten? → Waren (Tobias), damit man zwischen Verkaufen und Bauen abwägt.
- Wie kommt man ohne Gold an die ersten Waren? → Versandportal steht schon, 20 Holzblöcke für die Bänder, das erste Sägewerk kostet nur Holzblöcke.
- Was bekommt man beim Abreißen zurück? → Genau das, was bezahlt wurde; Gratis-Gebäude geben nichts zurück.
- Wie bleiben Knöpfe im Laden-Fenster zuverlässig antippbar, obwohl es sich ständig aktualisiert? → Knöpfe werden nicht neu erzeugt, nur ihre Beschriftung geändert.

**Gemacht:**
- Neue Datei `src/core/market.js` (Händler, Theken, Kunden, Pleiteschutz, Testpaket), Baukosten in der Gebäude-Tabelle, neues Laden-Fenster `src/view/shop.js`.
- Spielstand-Version 5 mit Umwandlung von Version 4.
- 100 automatische Tests (neu u. a.: Händler, Theken, Kunden-Takt über eine Stunde, Baukosten und Rückgabe, gekürzte Bänder, Pleiteschutz, neues Spiel bis zum ersten Verkauf, Umwandlung von Version 4) und der Browser-Test (neu: Einstieg ohne Gold, Theke bestücken, Kunden kaufen, Händler, Testpaket) – alle bestanden.
- Beim Testen gefunden und behoben: Das „+Gold“ überdeckte das Laden-Level-Symbol; der Abräumen-Knopf war ohne Text unklar.

### v0.6.1 – Größeres Grundstück (06.11.2026)

**Vorgenommen:**
- Platz für eine zweite Eisen-Linie schaffen, ohne „Fläche kaufen“ vorzuziehen.

**Fragen, die wir uns gestellt haben:**
- In welche Richtung wächst das Grundstück? → Nach rechts und unten, damit bestehende Gebäude und Bänder unverändert bleiben.
- Passt auf dem Handy noch alles auf den Bildschirm? → Ja, beim Öffnen wird das ganze Grundstück gezeigt; Gebäude bleiben erkennbar (Browser-Test).

**Gemacht:**
- Grundstück 22 × 14, Welt 40 × 26, Spielstand-Version 4 mit Umwandlung.
- 69 automatische Tests (neu: Umwandlung von Version 3, Startgröße) und der Browser-Test in Tablet- und Handygröße – alle bestanden.

### v0.6.0 – Techbaum, Teil 1 (06.11.2026)

**Vorgenommen:**
- Den festgelegten Techbaum bis zu den Grundmaschinen einbauen: neue Waren, Maschinen 2 × 2, Eisen-Kette, Preistabelle.
- Bestehende Fabriken ohne Verlust übernehmen.

**Fragen, die wir uns gestellt haben:**
- Wie wächst ein gedrehtes 2 × 1-Sägewerk auf 2 × 2, ohne dass die Bänder abreißen? → Es wächst auf der Seite gegenüber den Pfeilen; die Anschlüsse bleiben, wo sie waren.
- Was, wenn dort ein anderes Gebäude oder Band steht? → Nächste freie Stelle; geht das nicht, abreißen mit Rückerstattung. Das Spiel sagt beim Öffnen Bescheid.
- Wie zeigt man „5 Barren → 5 Nägel“ richtig an? → Bei mehr als einem Stück steht die Mehrzahl.

**Gemacht:**
- Datentabellen: 12 Waren, 6 Rezepte, 8 Gebäude im Baumenü; neue Formen für Zahnrad, Barren, Mini-Platte, Nagel und Eisenerz.
- Spielstand-Version 3 mit Umwandlung von Version 1 und 2.
- 67 automatische Tests (neu: Eisen-Kette, Nägel, Preistabelle für alle Stufen, Datentabellen passen zusammen, Umwandlung alter Spielstände inkl. gedrehter, versetzter und abgerissener Maschinen) und der Browser-Test (neu: Schmelzhütte und Schmiede per Touch bauen, Eisenerz einlegen, auf Nägel umstellen) – alle bestanden.

### v0.5.2 – Techbaum festgelegt (06.11.2026, nur README)

**Vorgenommen:**
- Tobias' Antworten zum Techbaum festhalten, damit ein neuer Chat direkt mit v0.6.0 starten kann.

**Fragen, die wir uns gestellt haben:**
- Welche Namen bekommen die Maschinen? → Claude hat passende Namen gewählt (Abschnitt 4.2).
- Wie bleiben die Preise logisch, sodass man anfangs nie Minus macht? → Regel: Blöcke +9 %, jedes weitere Teil rund +20 % gegenüber seinen Zutaten; Eisennägel entstehen zu fünft aus 5 Barren.
- Was passiert mit bestehenden Sägewerken (2 × 1), wenn Maschinen 2 × 2 werden? → Sie wachsen, rücken oder werden mit Rückerstattung abgerissen (Plan für v0.6.0).

**Gemacht:**
- Festgelegter Techbaum mit Gebäuden, Größen, Freischaltungen, Rezepten und Preistabelle (Abschnitt 4.2), Plan für v0.6.0 (Abschnitt 6), Entscheidungen und offene Fragen aktualisiert.
- Spiel unverändert; nur die Versionsnummer im Spiel steigt auf v0.5.2.

### v0.5.1 – Kompaktes Lagerhaus & Versandportal (06.11.2026)

**Vorgenommen:**
- Tobias' Wünsche nach dem Test von v0.5.0: weniger Eingänge am Versandportal, kleineres Lagerhaus.
- Tobias' Techbaum festhalten und den Fahrplan danach ausrichten.

**Fragen, die wir uns gestellt haben:**
- Wo genau sitzen die Anschlüsse des 2 × 1 Lagerhauses? → Wie von Tobias beschrieben: oben links rein, unten rechts raus.
- Wie viele Eingänge braucht das Versandportal? → Einer reicht; mehrere Bänder lassen sich vorher zusammenführen.
- In welcher Reihenfolge kommen Techbaum und Handel? → Vorschlag: erst Techbaum, dann Handel (offene Frage 11).

**Gemacht:**
- Lagerhaus 2 × 1 mit neuen Anschlüssen, Versandportal 1 × 1 mit einem Eingang.
- Statuslicht passt sich der Gebäudegröße an.
- Techbaum in Abschnitt 4 abgeschrieben, Lesart und Rückfragen notiert, Fahrplan neu (v0.6.0 bis v0.10.0).
- 61 automatische Tests (neu: Anschlüsse von Lagerhaus und Versandportal) und der Browser-Test bestanden.

### v0.5.0 – Produktion (05.11.2026)

**Vorgenommen:**
- Die Fabrik zum Leben erwecken: Rohstoffe einlegen, Waren herstellen und über Bänder transportieren.
- Tobias' Vorgaben umsetzen: ein Rohstoff pro Holzfäller, Stein wie Holz, Werkstätten mit zwei Einstellungen, Lagerhaus mit 3 × 50, Versandportal, Stau bei vollem Band.

**Fragen, die wir uns gestellt haben:**
- Wie verteilen Abzweigungen fair, ohne dass eine volle Strecke alles blockiert? → Abwechselnd, volle Richtungen werden übersprungen.
- Wie kommen beim Zusammenführen alle Zuläufe dran, auch ein Gebäude neben einem vollen Band? → Bänder und Gebäude melden sich jeden Takt an, das Ziel nimmt reihum an.
- Wie testet man eine 15-Minuten-Produktion? → Testmodus (×10) für Tobias, Zeitraffer in den automatischen Tests.
- Wie bleiben bestehende Fabriken erhalten? → Spielstand-Format Version 2 mit Umwandlung von Version 1; beschädigte Spielstände werden vor dem Überschreiben gesichert.

**Gemacht:**
- Datentabellen für Waren, Rezepte, Laden; neue Gebäude Steinmetz, Lagerhaus, Versandportal.
- Simulation in festen Takten (`src/core/sim.js`) mit Stau, Aufteilen und Zusammenführen.
- Waren auf Bändern sichtbar, Statuslicht und Fortschrittsleiste an Gebäuden, Infofenster mit laufendem Status, Laden-Fenster mit Laden-Lager, Testmodus.
- Namen an Gebäuden suchen sich eine Stelle, an der sie keinen Pfeil verdecken.
- 59 automatische Tests (u. a. 200 Blöcke pro Stamm, 200 → 40 Winkel, Stau, faires Aufteilen und Zusammenführen, Lagerhaus 3 × 50, falsche Ware, Rückerstattung, Wirtschaftsrechnung, Umwandlung alter Spielstände) und der Browser-Test mit Produktionsablauf – alle bestanden, mehrfach wiederholt.
- Beim Testen gefunden und behoben: eine versehentlich doppelt ersetzte Stil-Regel, die alle Knopfreihen rechtsbündig machte; zwei Prüfungen im Browser-Test, die je nach Zeitpunkt schwankten.

### v0.4.1 – Saubere Abzweigungen (05.11.2026)

**Vorgenommen:**
- Den „unsauberen“ Look an Band-Abzweigungen beheben, den Tobias auf dem Tablet gefunden hat.
- Tobias' neues Produktionskonzept festhalten und den Plan für v0.5.0 daran anpassen.

**Fragen, die wir uns gestellt haben:**
- Warum sahen die Abzweigungen unsauber aus? → Pro Abzweig-Feld standen zwei Pfeile gedrängt in einer Ecke, einer davon genau auf der Kante zum Abzweig. Außerdem schimmerten an den Feldgrenzen feine Linien durch.
- Wie zeigt man die Richtung an Abzweigungen, ohne zu überladen? → Nur der Pfeil geradeaus steht in der Mitte; die Abzweige zeigen ihre Richtung mit dem nächsten Bandfeld.

**Gemacht:**
- Bänder werden in drei Durchgängen gezeichnet (Ränder, Laufflächen, Pfeile) und überlappen minimal: keine Fugen mehr.
- Neue Pfeil-Regel für Abzweigungen; Abzweige, die direkt in ein Gebäude führen, bekommen einen kleinen Pfeil an der Mündung; Verteiler ohne Pfeil bekommen einen Punkt.
- README: neues Produktionskonzept (Händler, Holzstamm → Holzblöcke, Sägewerk mit Einstellung, Lagerhaus, Versandportal, Verkaufstheken), Rezepttabelle mit Spalte „Stand“, neuer Plan für v0.5.0, neue offene Fragen.
- Alle 44 Tests und der Browser-Test bestanden.

### v0.4.0 – Bauen & Speichern (05.11.2026)

**Vorgenommen:**
- Gebäude und Förderbänder bauen, verschieben, drehen und abreißen.
- Den Laden zur ganzen Fläche machen, mit Knöpfen „Laden“ und „Bauen“ unten.
- Förderbänder durch Ziehen aufteilen und zusammenführen.
- Spielstand speichern.

**Fragen, die wir uns gestellt haben:**
- Wie zieht man Förderbänder mit dem Finger, ohne dass die Karte mitwandert? → Ein Finger legt Bänder, zwei Finger bewegen die Karte.
- Wie teilt man eine Strecke ohne Verteiler? → Von einem bestehenden Band aus ziehen fügt einen Ausgang hinzu.
- Was passiert, wenn der Finger beim Ziehen kurz auf gesperrte Fläche rutscht? → Die Strecke pausiert und geht weiter, sobald der Finger zurück ist.
- Wie schützen wir Spielstände vor Beschädigung? → Jeder Spielstand wird beim Laden geprüft; ist er kaputt, startet ein neues Spiel mit Hinweis.

**Gemacht:**
- Laden-Gebäude entfernt; das Grundstück trägt das Schild „Dein Laden“. Laden-Fenster mit Inventar-Platzhalter.
- Bauleiste, Vorschau beim Platzieren (grün/rot), Werkzeugleiste mit Drehen, Abbrechen, Bauen/Fertig.
- Förderbänder mit Kurven, Aufteilen, Zusammenführen, Anschluss an Gebäude, Drehen, Wisch-Abriss.
- Ein- und Ausgangspfeile an Gebäuden, Sägewerk als drittes Gebäude.
- Infofenster mit Aktionen, Rückfragen beim Abreißen und bei „Neues Spiel“, kurze Meldungen.
- Automatisches Speichern im Browser mit Prüfung beim Laden.
- 44 automatische Tests und ein Browser-Test, der alles per Touch auf Tablet- und Handygröße durchspielt – alle bestanden.
- Beim Browser-Test gefunden und behoben: Nach schnellem Wischen verschluckte Chrome den nächsten Knopfdruck; Namen verdeckten Pfeile und Symbole; der Auswahlrahmen lief durch den Namen.

### v0.3.0 – Spielfeld (05.11.2026)

**Vorgenommen:**
- Der erste Spielcode: ein Spielfeld, das man auf Tablet und Handy im Querformat bedienen kann.
- Das Spiel zum ersten Mal live schalten.

**Fragen, die wir uns gestellt haben:**
- Wie fühlt sich Verschieben und Zoomen per Touch an?
- Wie stellen wir sicher, dass man immer sieht, welche Version live ist?
- Wie testet Claude ohne eigenes Tablet?

**Gemacht:**
- Spielfeld mit Grundstück (16 × 10) und gesperrter Fläche, drei Startgebäude, Infofenster, obere Leiste mit Versionsnummer, Dreh-Hinweis im Hochformat, Vollbild-Knopf, App-Symbol.
- Code aufgeteilt in Spielregeln (`src/core/`) und Darstellung (`src/view/`), Gebäude als Datentabelle.
- 18 automatische Tests (Spielregeln, Kamera, Versionsnummer) und ein Browser-Test in Tablet-, Handy- und Hochformat-Größe, alle bestanden.
- Beim Browser-Test gefunden und behoben: Emojis wurden blass gezeichnet; auf dem Handy verdeckte der Name das Symbol.

### v0.2.0 – Spielkonzept & Fahrplan (05.11.2026)

**Vorgenommen:**
- Tobias' Antworten auf die 15 Rückfragen festhalten.
- Daraus ein Spielkonzept, einen ersten Rezeptbaum und einen Fahrplan ableiten.
- Den ersten Programmierschritt (v0.3.0) planen.

**Fragen, die wir uns gestellt haben:**
- Wie passen Fabrikspiel, Wirtschaftssimulation und Clash-of-Clans-Universum zusammen?
- Was davon geht ohne Server, was braucht einen?
- Wie entsteht der Anreiz, die Fabrik ständig umzubauen?
- Wie sieht der kleinste spielbare Kreislauf aus?

**Gemacht:**
- README neu gegliedert: Spielkonzept, Waren & Rezepte, Technik und Fahrplan sind neue Abschnitte; die alten „Bausteine“ sind im Spielkonzept und Fahrplan aufgegangen.
- Entscheidungen aus den Antworten eingetragen, neue offene Fragen gesammelt.
- Plan für v0.3.0 (Spielfeld) zur Freigabe beschrieben.
- Noch kein Spielcode (Regel 6).

### v0.1.1 – Korrektur Versionierung (05.11.2026)

**Vorgenommen:**
- Nach dem Merge von v0.1.0 einen Versions-Tag setzen.

**Fragen, die wir uns gestellt haben:**
- Was tun, wenn das Setzen von Tags nicht funktioniert?

**Gemacht:**
- Festgestellt: Claudes Arbeitsumgebung darf keine Tags pushen (die Verbindung wird jedes Mal abgelehnt).
- Versionierung umgestellt: Die Versionsnummer steht jetzt im Titel jedes Pull Requests und Merge-Commits. README und `CLAUDE.md` entsprechend korrigiert.

### v0.1.0 – Projektstart (05.11.2026)

**Vorgenommen:**
- Grundregeln der Zusammenarbeit festhalten.
- Prüfen, ob GitHub funktioniert.
- Projekt in Bausteine zerlegen und Rückfragen sammeln.
- Klären, woher wir Assets bekommen.

**Fragen, die wir uns gestellt haben:**
- Wie stellen wir sicher, dass jeder neue Chat weiß, woran wir arbeiten?
- Wie können wir bei Fehlern auf alte Versionen zurückgehen?
- Woher kommen Grafiken, damit das Spiel später anschaulich wird?

**Gemacht:**
- README zum Projektgedächtnis ausgebaut (Regeln, Ablauf, Bausteine, Entscheidungen, offene Fragen, Historie, Protokoll).
- `CLAUDE.md` angelegt, die Claude in jedem neuen Chat automatisch auf die README verweist.
- Ablauf Branch → Pull Request → Merge einmal komplett durchgespielt.
- Noch kein Spielcode (Regel 6).
