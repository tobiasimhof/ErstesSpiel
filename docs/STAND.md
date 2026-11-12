# Stand

> Zu Beginn jedes Chats lesen (zusammen mit `docs/SPIEL.md`). Wird bei jeder Version aktualisiert: Status, offene Fragen und die **letzten 3 Arbeitsschritte** (der neueste oben; der älteste fällt weg – vollständig steht jeder Schritt im Archiv).

| | |
|---|---|
| **Aktuelle Version** | v0.23.0 – Preise durch 3 |
| **Phase** | M2 – Produktionsketten (Kräuter-Kapitel ab Level 7) |
| **Spielen (live)** | https://tobiasimhof.github.io/ErstesSpiel/ |
| **Nächster Schritt** | **Tobias testet v0.23.0** (neue Preise, sein Gold ist umgerechnet). Danach **v0.24.0 „Theken kaufen, langsamer verkaufen“** – freigegeben (offene Frage 4, Entwurf in `docs/archiv/PLAENE.md`); Tobias' Fabrik geht dabei auf 2 Theken zurück. |

**Tobias' Fabrik** (Screenshots vom 11.11.2026, Gold und Werte vor v0.23.0 – seitdem durch 3): Level 8, ganze Fläche gekauft (38 × 30), **43.870 Gold** (heute 14.623), Laden-Lager 1.004 / 1.000, Waren im Wert von **166.579 Gold** (heute etwa 55.500) (u. a. 61 Zahnradwellen, 69 Räderwerke, 70 Verstärkte Holzplatten, 38 Gewichtsteine). Er spielt seit einigen Versionen auf Level 8 weiter, ohne Aufträge, um zu testen, ob eine Fabrik, die **jede Ware mindestens einmal** herstellt, auf die Fläche passt: Sie passt (alles außer der Pflanzenreihe in voller Größe), rechts und unten in der Mitte ist noch Platz frei – „Der Platz reicht mir.“ Alle Rohstoff-Gebäude hat er 5- bis 6-mal aufgefüllt (etwa 4 bis 4,5 Stunden Produktion). Etwa 8 Holzfällerlager, 9 Steinbrüche, 7 Schmelzhütten, 6 Schmieden, 3 Sägewerke, 3 Steinmetze, 3 Zimmereien, 3 Feinschmieden (Scharnier, Schlüssel, Zirkel), 3 Schlossereien, 5 Beete, 2 Erntebänke, Webstube, Kräuterstube; jede Ausgabe endet in einem Lagerhaus. **Versandportale baut er nicht** – volle Lagerhäuser räumt er von Hand aus oder füllt damit das Lagerhaus einer anderen Straße. Er spielt auf dem Tablet und nutzt für Aufträge den Test-Knopf. Chat 18: Er hat eine Straße umgebaut – seine Scharniere kommen nicht mehr auf die Theke, sondern gehen in Zirkel und Vorhängeschlösser.

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

1. **v0.24.0 Theken kaufen, langsamer verkaufen** (bisher als v0.23.0 geplant) – freigegeben (Tobias, Chat 17), Entwurf in `docs/archiv/PLAENE.md`, Stand in offener Frage 4. Tobias' Fabrik ist gesichert.
2. **Was Tester brauchen** – mit v0.22.0 können Tester auch auf Tobias' Tablet spielen (sichern → neues Spiel → Tester spielt → laden); Testmodus und Test-Knopf bleiben sichtbar. Eine kurze Einführung bleibt im Hinterkopf (M4) (offene Frage 13).
3. **Bereich kopieren** (Tobias: „sehr wichtig“) – einen markierten Bereich als Ganzes noch einmal bauen, wenn die Waren reichen (Tobias baut gleiche Straßen mehrfach). Plan noch zu machen.
4. **Weiche** (Tobias: „sehr sinnvoll“, offene Frage 5) – trennt eine Spur in zwei (hier nur Stäbe, dort nur Bleche). Plan noch zu machen.
5. **Später:** Verbesserungen mit Erfahrung (Frage 7), Level 9 (dritte Pflanze), gründliche Durchsicht des Codes.

Abgelehnt: „Umlagern“, „Alle auffüllen“, Fabrik-Übersicht pro Minute, Ring pro Stück bei Rohstoff-Gebäuden.

## Offene Fragen

1. **Gold-Gleichgewicht testen** (Tobias, Chat 18): Er möchte verhindern, dass es Produkte gibt, „mit denen man zu schnell zu viel Gold macht“, hat aber „ein wenig die Angst, dass wir zu viel regulieren“ – deshalb: umsetzen und testen. Beobachtung: Scharniere direkt verkaufen brachte ihm viel Gold; seit seine Straßen Zirkel und Vorhängeschlösser machen, fällt dieser Gewinn weg. Claudes Rechnung: Je Rohstoff bringt die längere Straße mehr (1 Eisenerz = 2⅔ Scharniere für 1.152 Gold oder 2 Zirkel für 1.324); je Minute kann es weniger sein, weil Zirkel und Vorhängeschloss je 30 s brauchen und die Räderwerke jetzt ins Schloss gehen statt auf die Theke. Mit v0.24.0 zählen die Theken Stück – dann lohnen sich teure Waren aus langen Straßen deutlich mehr. Nach v0.24.0 gemeinsam prüfen; die Tempo-Stufen (Level 1–3 schneller, ab Level 7 langsamer) sind dafür da. Der kleinere Aufschlag bleibt in der Hinterhand.
2. **Kräuterstube mit 2 Eingängen** ist gebaut und angeschlossen (v0.18.2), Tobias' Urteil steht noch aus.
3. **Platzhalter-Zahlen:** Aufstiegspreise, Auftragsmengen, Baukosten. Kostet der Laden-Ausbau später zusätzlich Waren? Begrenzt das Level die kaufbare Fläche?
4. **Theken kaufen, langsamer verkaufen** (Entwurf v0.24.0, **freigegeben**, ausführlich in `docs/archiv/PLAENE.md`): Jede Theke verkauft für sich; Tempo je Level für die 2 Start-Theken zusammen: Level 1–3 6 Stück pro Minute, ab Level 4 3, ab Level 7 1,5 (je Theke 3 / 1,5 / 0,75), jede gekaufte Theke legt ihren Anteil drauf (Tobias: „Jede Theke verkauft, damit der Zukauf von Theken sich auch lohnt“). Weitere Theken nur mit Gold (Platzhalter seit den Preisen durch 3: 3. Theke 13.000, 4. 33.000, 5. 67.000), kein Mindest-Level; Aufstiege bringen keine Theken mehr. Tobias' Fabrik geht auf 2 Theken zurück (Waren der übrigen ins Laden-Lager).
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

### v0.23.0 – Preise durch 3 (12.11.2026)

- **Warum (Tobias, Chat 18):** „Auf der einen Seite sind mir die Beträge zu hoch, dass man mit einem Zirkel 2.000 Gold verdienen kann … Die Idee, alles durch 3 zu teilen, finde ich sehr sinnvoll, weil alle Beträge dadurch kleiner werden.“ Erst die Preise, danach die Theken.
- **Umgesetzt:** Alle Preise durch 3 (Holzblock 1, Eisenbarren 4, Holzplatte 6, Zahnradwelle 108, Scharnier 432, Zirkel 662, Vorhängeschloss 648; Holzstamm 183, Eisenerz 732, Leinsamen 320), +20 % je Stufe bleibt. Startgold und Fläche je 170, Aufstiege 30 bis 1.330, Testpaket 330. Die Erfahrung bleibt gleich (3 je 10 Gold). Alte Spielstände: Gold und letzte Verkäufe durch 3 (Tobias: 43.870 → 14.623), beim Öffnen erscheint ein Hinweis.
- **Offen:** Tobias testet; danach v0.24.0 (Theken).

### v0.22.3 – Preise durch 3 statt kleinerem Aufschlag (12.11.2026, nur Doku)

- **Tobias (Chat 18):** Er hat eine Straße umgebaut – seine Scharniere gehen jetzt in Zirkel und Vorhängeschlösser statt auf die Theke. Wer sich auf teure Waren konzentriert, verdient viel Gold, muss für den Aufstieg aber trotzdem andere Waren herstellen. „Ich glaube, wir müssen gar nicht so sehr an diesen Stellschrauben drehen.“ Vorschlag: alles durch 3 – kleinere Beträge (Zirkel 662 statt knapp 2.000), und den Abverkauf weiter über die Theken steuern.
- **Claude:** durchgerechnet, Entwurf v0.24.0 „Preise durch 3“ (offene Frage 1); Vorschlag: erst v0.23.0, direkt danach v0.24.0.
- Spiel unverändert, nur die Versionsnummer steigt.

### v0.22.2 – Erst die Theken, Preise später (12.11.2026, nur Doku)

- **Tobias (Chat 17):** „Dann lass uns bei der Grundidee bleiben mit den Theken und das darüber regulieren.“ Ein kleinerer Aufschlag als +20 % kommt in einem eigenen Schritt. Die Preise sind ihm fürs Mittelalter zu hoch: Holzblock etwa 1 Gold, Zirkel einige hundert statt knapp 2.000.
- **Claude:** festgehalten; Rechnung zur neuen Preisskala (offene Frage 1). v0.23.0 kommt im neuen Chat.
- Spiel unverändert, nur die Versionsnummer steigt.
