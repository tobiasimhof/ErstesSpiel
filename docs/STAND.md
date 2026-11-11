# Stand

> Zu Beginn jedes Chats lesen (zusammen mit `docs/SPIEL.md`). Wird bei jeder Version aktualisiert: Status, offene Fragen und die **letzten 3 Arbeitsschritte** (der neueste oben; der älteste fällt weg – vollständig steht jeder Schritt im Archiv).

| | |
|---|---|
| **Aktuelle Version** | v0.22.0 – Spielstand sichern und laden |
| **Phase** | M2 – Produktionsketten (Kräuter-Kapitel ab Level 7) |
| **Spielen (live)** | https://tobiasimhof.github.io/ErstesSpiel/ |
| **Nächster Schritt** | Tobias probiert v0.22.0 aus und **sichert seine Fabrik als Datei** (☰ → „💾 Spielstand sichern“). Danach baut Claude v0.23.0 „Theken kaufen, langsamer verkaufen“ – von Tobias freigegeben (offene Frage 4); seine Fabrik geht dabei auf 2 Theken zurück. |

**Tobias' Fabrik** (Screenshots vom 11.11.2026): Level 8, ganze Fläche gekauft (38 × 30), **43.870 Gold**, Laden-Lager 1.004 / 1.000, Waren im Wert von **166.579 Gold** (u. a. 61 Zahnradwellen, 69 Räderwerke, 70 Verstärkte Holzplatten, 38 Gewichtsteine). Er spielt seit einigen Versionen auf Level 8 weiter, ohne Aufträge, um zu testen, ob eine Fabrik, die **jede Ware mindestens einmal** herstellt, auf die Fläche passt: Sie passt (alles außer der Pflanzenreihe in voller Größe), rechts und unten in der Mitte ist noch Platz frei – „Der Platz reicht mir.“ Alle Rohstoff-Gebäude hat er 5- bis 6-mal aufgefüllt (etwa 4 bis 4,5 Stunden Produktion). Etwa 8 Holzfällerlager, 9 Steinbrüche, 7 Schmelzhütten, 6 Schmieden, 3 Sägewerke, 3 Steinmetze, 3 Zimmereien, 3 Feinschmieden (Scharnier, Schlüssel, Zirkel), 3 Schlossereien, 5 Beete, 2 Erntebänke, Webstube, Kräuterstube; jede Ausgabe endet in einem Lagerhaus. **Versandportale baut er nicht** – volle Lagerhäuser räumt er von Hand aus oder füllt damit das Lagerhaus einer anderen Straße. Er spielt auf dem Tablet und nutzt für Aufträge den Test-Knopf.

## Fahrplan

| | Meilenstein | Inhalt |
|---|---|---|
| M0 | Planung | Regeln, Konzept, Fahrplan |
| M1 | Fabrik-Grundgerüst | Spielfeld, Bauen, Bänder, erste Kette, Speichern, Offline-Produktion – erledigt |
| **M2** | **Produktionsketten** | **jetzt:** Werkzeug-Kapitel (Level 1–6) fertig, Kräuter-Kapitel ab Level 7 läuft |
| M3 | Wirtschaft & Fortschritt | Nachfrage und Trends, Laden-Ausbau mit Waren, evtl. Freischaltpunkte (Laden-Level, Aufträge und Fläche kaufen gibt es schon) |
| M4 | Optik & Gefühl | Grafik, Animationen, Sound, Einführung für neue Spieler |
| M5 | Online | Spielerkonto, Spielstand auf dem Server, globaler Schwarzmarkt |
| M6 | Clans & Handel | Clans, Handel zwischen Spielern |
| M7 | App | Android und iOS |

**Nächste Schritte** (der Reihe nach; Auswahl von Tobias in Chat 15, Reihenfolge von Claude vorgeschlagen; jeder Schritt erst nach Tobias' OK):

1. **v0.23.0 Theken kaufen, langsamer verkaufen** – freigegeben (Tobias, Chat 17), Entwurf in `docs/archiv/PLAENE.md`, Stand in offener Frage 4. Startet, sobald Tobias seine Fabrik mit v0.22.0 gesichert hat.
2. **Was Tester brauchen** – mit v0.22.0 können Tester auch auf Tobias' Tablet spielen (sichern → neues Spiel → Tester spielt → laden); Testmodus und Test-Knopf bleiben sichtbar. Eine kurze Einführung bleibt im Hinterkopf (M4) (offene Frage 13).
3. **Bereich kopieren** (Tobias: „sehr wichtig“) – einen markierten Bereich als Ganzes noch einmal bauen, wenn die Waren reichen (Tobias baut gleiche Straßen mehrfach). Plan noch zu machen.
4. **Weiche** (Tobias: „sehr sinnvoll“, offene Frage 5) – trennt eine Spur in zwei (hier nur Stäbe, dort nur Bleche). Plan noch zu machen.
5. **Später:** Verbesserungen mit Erfahrung (Frage 7), Level 9 (dritte Pflanze), gründliche Durchsicht des Codes.

Abgelehnt: „Umlagern“, „Alle auffüllen“, Fabrik-Übersicht pro Minute, Ring pro Stück bei Rohstoff-Gebäuden.

## Offene Fragen

1. **Spielstand sichern und laden** (v0.22.0): Tobias' Eindruck steht aus – klappt Sichern über „Downloads“ und über Teilen auf dem Tablet, findet er die Datei beim Laden wieder? Die Datei endet auf `.txt` (Chrome auf Android teilt keine `.json`-Dateien).
2. **Kräuterstube mit 2 Eingängen** ist gebaut und angeschlossen (v0.18.2), Tobias' Urteil steht noch aus.
3. **Platzhalter-Zahlen:** Aufstiegspreise, Auftragsmengen, Baukosten. Kostet der Laden-Ausbau später zusätzlich Waren? Begrenzt das Level die kaufbare Fläche?
4. **Theken kaufen, langsamer verkaufen** (Entwurf v0.23.0, **freigegeben**, ausführlich in `docs/archiv/PLAENE.md`): Jede Theke verkauft für sich; Tempo je Level für die 2 Start-Theken zusammen: Level 1–3 6 Stück pro Minute, ab Level 4 3, ab Level 7 1,5 (je Theke 3 / 1,5 / 0,75), jede gekaufte Theke legt ihren Anteil drauf (Tobias: „Jede Theke verkauft, damit der Zukauf von Theken sich auch lohnt“). Weitere Theken nur mit Gold (Platzhalter: 3. Theke 40.000, 4. 100.000, 5. 200.000), kein Mindest-Level; Aufstiege bringen keine Theken mehr. Tobias' Fabrik geht auf 2 Theken zurück (Waren der übrigen ins Laden-Lager).
5. **Weiche** (von Tobias gewünscht, Chat 15): trennt eine Spur in zwei, „sodass man sagen kann, hier laufen nur Stäbe und hier nur Bleche“ – damit die Produktionsstraßen länger werden. Noch zu planen: eigenes Gebäude oder Band-Feld, wie man die Ware je Ausgang einstellt, was mit Waren passiert, die zu keinem Ausgang passen.
6. **Eiserner Bestand:** Ein Mindestbestand im Laden-Lager, den die Theken nicht anrühren? Nur, wenn Tobias das möchte.
7. **Verbesserungen mit Erfahrung** (Tobias' Idee; er will sie erst später einführen): z. B. schneller verarbeiten, schnellere Bänder, größerer Rohstoff-Vorrat; die Theke verbessern, „damit man 10 % mehr Kundschaft oder so was bekommt“ (Chat 17). Das Spiel zählt alle Erfahrung mit (`xpTotal`, auch die vom Test-Knopf).
8. **Laden-Lager über der Grenze:** Abreißen und Ausräumen geben Waren auch über die Grenze zurück (Tobias hatte 1.500 bei 1.000 Plätzen); bis wieder Platz ist, nimmt das Versandportal nichts an. Lagerhäuser sind damit ein Zusatzlager (10 Lagerhäuser = 1.500 Plätze). Für Tobias in Ordnung – beobachten.
9. **Claudes Lesarten**, die Tobias jederzeit ändern kann (je eine Zahl in `data/shop.js`): Laden-Lager 1.000 erst ab Level 4; mittlere Theken ab Level 4, große ab Level 5.
10. **Einstieg:** Tobias' Idee, am Anfang vor allem die Massenproduktion auszubauen – später austesten.
11. **Pleiteschutz:** Ein Rohstoff ohne passendes Gebäude verhindert das Geschenk – bewusst so gelassen, beobachten.
12. **Vor v1.0:** Test-Knopf entfernen (`QUEST_TEST_SKIP = false`). Später: Schwarzmarkt und verbundene Läden (M5), Arbeitstitel.
13. **Anderen das Spiel zeigen** (Tobias, Chat 15): Er möchte den jetzigen Stand anderen zum Testen geben, ohne dass sein Spielstand verloren geht. Jedes Gerät hat seinen eigenen Spielstand – wer den Link auf seinem eigenen Gerät öffnet, beginnt ein neues Spiel und berührt Tobias' Fabrik nicht. Tobias (Chat 16): „Das können wir im Hinterkopf behalten, aber ich möchte frühestens nächste Woche jemandem das Spiel zeigen.“ Seit v0.22.0 geht beides ohne zweiten Spielstand: auf eigenen Geräten (Start bei Level 1 oder Tobias' Datei laden) oder auf Tobias' Tablet (sichern → neues Spiel → Tester spielt → laden). Testmodus und Test-Knopf bleiben sichtbar. Noch offen: kurze Einführung?

## Die letzten 3 Arbeitsschritte

### v0.22.0 – Spielstand sichern und laden (11.11.2026)

- **Warum (Tobias, Chat 15):** Er möchte das Spiel anderen zeigen, ohne dass seine Fabrik verloren geht – und vor v0.23.0 (Theken) seine Fabrik sichern können.
- **Umgesetzt:** Im Menü ☰ „💾 Spielstand sichern“ (Datei in „Downloads“ oder über Teilen – WhatsApp, E-Mail, Drive) und „📂 Spielstand laden“ (Vorschau, dann Rückfrage; „💾 Jetzigen erst sichern“). Nach dem Laden holt die Fabrik die Zeit seit dem Sichern nach („📂 Spielstand geladen – Seit dem Sichern sind … vergangen“). „Neues Spiel“ bietet „💾 Erst sichern“ an. Falsche Dateien werden abgelehnt; der vorige Spielstand bleibt als Sicherheitskopie im Browser.
- **Tobias (Chat 17):** Lesart zu v0.23.0 bestätigt, Reihenfolge und Start freigegeben; Rückfrage, wie das Nachrechnen nach dem Laden funktioniert (im Chat erklärt).
- **Offen:** Tobias' Eindruck auf dem Tablet; danach v0.23.0.

### v0.21.6 – Theken: Tempo je Level, nur Gold, Tobias auf 2 Theken (11.11.2026, nur Doku)

- **Tobias (Chat 17):** „Das Tempo passt so für mich, aber wir könnten es ja nochmal drosseln, dass wir sagen von Level 1–3 sind es 6 die Minute, ab Level 4 sind es nur noch 3 die Minute und ab Level 7 sind es nur noch 1–2 die Minute.“ Theken sollen nur Gold kosten. Seine Fabrik soll direkt auf 2 Theken zurück, „damit ich ein besseres Gefühl dafür bekommen kann. Immerhin muss ich genug Gold verdienen, dass ich meine Fabriken mit Rohstoffen befüllen kann.“
- **Claude:** Entscheidungen festgehalten, Entwurf v0.23.0 angepasst; Rückfrage zur Lesart der Zahlen und Vorschläge zu den offenen Fragen von v0.22.0.
- Spiel unverändert, nur die Versionsnummer steigt.

### v0.21.5 – Antworten zum Gold-Gleichgewicht, Entwurf „Theken kaufen“ (11.11.2026, nur Doku)

- **Tobias (Chat 17):** Der Platz reicht; die Fabrik hat er 5- bis 6-mal aufgefüllt. „Ich finde, Gold sollte Teil des Spiels sein, aber der Hauptfokus sollte auf der Massenproduktion sein, sodass man immer längere Straßen bauen kann.“ Von den Möglichkeiten gefällt ihm D am besten: Theken teuer machen, sodass man die dritte erst auf Level 8 schafft; dazu die Theken „langsamer“ machen, damit man auf Produkten sitzen bleibt und sie in längere Straßen steckt.
- **Claude:** Entscheidungen festgehalten; Entwurf v0.23.0 „Theken kaufen, langsamer verkaufen“ mit Zahlen und 4 Fragen (offene Frage 4). Die frühere Frage zur Weltgröße und die Frage zum Gold-Gleichgewicht sind beantwortet.
- Spiel unverändert, nur die Versionsnummer steigt.
