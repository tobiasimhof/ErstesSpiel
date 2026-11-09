# Versionshistorie

> **Archiv.** Wörtlich übernommen aus der README bis v0.18.0 (Abschnitt 9). Hier wird nur gesucht, nicht zu Beginn eines Chats gelesen. Verweise wie „Abschnitt 4.2“ oder „offene Frage 12“ beziehen sich auf die alte README: Abschnitte 3, 4 und 8 stehen in `KONZEPT-VERLAUF.md`, 6 in `PLAENE.md`, 7 in `ENTSCHEIDUNGEN.md`, 9 in `VERSIONEN.md`, 10 in `GESPRAECHE.md`. Den aktuellen Stand beschreiben `docs/SPIEL.md` und `docs/STAND.md`.

Neueste Version oben. Je Version: vorgenommen, Fragen, gemacht, geprüft.

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
