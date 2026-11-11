# Stand

> Zu Beginn jedes Chats lesen (zusammen mit `docs/SPIEL.md`). Wird bei jeder Version aktualisiert: Status, offene Fragen und die **letzten 3 Arbeitsschritte** (der neueste oben; der älteste fällt weg – vollständig steht jeder Schritt im Archiv).

| | |
|---|---|
| **Aktuelle Version** | v0.21.2 – Ring bleibt, Bilder pro Sekunde gemessen, Plan „Spielstand sichern“ (nur Doku) |
| **Phase** | M2 – Produktionsketten (Kräuter-Kapitel ab Level 7) |
| **Spielen (live)** | https://tobiasimhof.github.io/ErstesSpiel/ |
| **Nächster Schritt** | Tobias sagt, ob der Entwurf für v0.22.0 „Spielstand sichern und laden“ passt (offene Frage 1), und gibt sein OK. Claude programmiert erst nach seinem OK. |

**Tobias' Fabrik** (Screenshot vom 09.11.2026, ca. 1 Stunde in Echtzeit gespielt, 6.036 Gold): Level 8. Links zwei gleiche Holz-Stein-Straßen (je 3 Holzfällerlager → Sägewerk, 3 Steinbrüche → Steinmetz, Zimmerei, Lagerhäuser als Zwischenlager). Oben 2 Holzfällerlager → Sägewerk, 5 Schmelzhütten → 5 Schmieden, 3 Steinbrüche → Steinmetz; darunter Zimmerei, 2 Feinschmieden und 1 Schlosserei (nur Vorhängeschlösser), jede Ausgabe endet in einem Lagerhaus. Unten 3 Beete, 2 Erntebänke, Webstube und Kräuterstube. Zimmerei und eine Feinschmiede warten auf Eisenstangen. Er spielt auf dem Tablet und nutzt für Aufträge den Test-Knopf. **Versandportale baut er nicht mehr** (er stellt nur noch teure Einzelteile her); läuft in einer der gespiegelten Straßen ein Lagerhaus voll (z. B. Zahnräder, weil die Holzstäbe nicht hinterherkommen), räumt er es aus und befüllt damit das Lagerhaus der anderen Straße (Chat 15).

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

**Nächste Schritte** (Tobias' Auswahl in Chat 15; Reihenfolge ist Claudes Vorschlag, ausführlich in `docs/archiv/PLAENE.md`): v0.22.0 Spielstand sichern und laden, dazu was Tester brauchen (Fragen 1 und 13; Tobias zeigt das Spiel frühestens ab nächster Woche, 16.11.2026); Bereich kopieren (Tobias: „sehr wichtig“); Weiche (Frage 5). Später: Verbesserungen mit Erfahrung (Frage 7), Level 9. Noch offen: gründliche Durchsicht des Codes. Abgelehnt: „Umlagern“, „Alle auffüllen“, Fabrik-Übersicht pro Minute.

## Offene Fragen

1. **Spielstand sichern und laden** (Entwurf v0.22.0, ausführlich in `docs/archiv/PLAENE.md`): Im Menü ☰ „💾 Spielstand sichern“ (eine kleine Datei) und „📂 Spielstand laden“ (Vorschau mit Level, Gold, Gebäuden und Datum, dann Rückfrage); bei „Neues Spiel“ zuerst „Erst sichern?“. So können Tester auch auf Tobias' Tablet spielen: sichern → neues Spiel → Tester spielt → laden. Fragen an Tobias: Passt das? Datei in „Downloads“ oder über das Teilen-Menü (WhatsApp, E-Mail, Drive)? Sollen Tester Testmodus und Test-Knopf sehen? Läuft die Fabrik nach dem Laden ab dem Sicherungszeitpunkt nach (wie „Willkommen zurück“)?
2. **Kräuterstube mit 2 Eingängen** ist gebaut und angeschlossen (v0.18.2), Tobias' Urteil steht noch aus.
3. **Platzhalter-Zahlen:** Aufstiegspreise, Auftragsmengen, Baukosten. Kostet der Laden-Ausbau später zusätzlich Waren? Begrenzt das Level die kaufbare Fläche?
4. **Weltgröße:** Reichen 38 × 30 Felder für die Masse der höheren Level, oder gibt es später mehr Fläche (`perSide` in `data/land.js`)?
5. **Weiche** (von Tobias gewünscht, Chat 15): trennt eine Spur in zwei, „sodass man sagen kann, hier laufen nur Stäbe und hier nur Bleche“ – damit die Produktionsstraßen länger werden. Noch zu planen: eigenes Gebäude oder Band-Feld, wie man die Ware je Ausgang einstellt, was mit Waren passiert, die zu keinem Ausgang passen.
6. **Eiserner Bestand:** Ein Mindestbestand im Laden-Lager, den die Theken nicht anrühren? Nur, wenn Tobias das möchte.
7. **Verbesserungen mit Erfahrung** (Tobias' Idee; er will sie erst später einführen): z. B. schneller verarbeiten, schnellere Bänder, größerer Rohstoff-Vorrat. Das Spiel zählt alle Erfahrung mit (`xpTotal`, auch die vom Test-Knopf).
8. **Laden-Lager über der Grenze:** Abreißen und Ausräumen geben Waren auch über die Grenze zurück (Tobias hatte 1.500 bei 1.000 Plätzen); bis wieder Platz ist, nimmt das Versandportal nichts an. Lagerhäuser sind damit ein Zusatzlager (10 Lagerhäuser = 1.500 Plätze). Für Tobias in Ordnung – beobachten.
9. **Claudes Lesarten**, die Tobias jederzeit ändern kann (je eine Zahl in `data/shop.js`): Laden-Lager 1.000 erst ab Level 4; mittlere Theken ab Level 4, große ab Level 5.
10. **Einstieg:** Tobias' Idee, am Anfang vor allem die Massenproduktion auszubauen – später austesten.
11. **Pleiteschutz:** Ein Rohstoff ohne passendes Gebäude verhindert das Geschenk – bewusst so gelassen, beobachten.
12. **Vor v1.0:** Test-Knopf entfernen (`QUEST_TEST_SKIP = false`). Später: Schwarzmarkt und verbundene Läden (M5), Arbeitstitel.
13. **Anderen das Spiel zeigen** (Tobias, Chat 15): Er möchte den jetzigen Stand anderen zum Testen geben, ohne dass sein Spielstand verloren geht. Jedes Gerät hat seinen eigenen Spielstand – wer den Link auf seinem eigenen Gerät öffnet, beginnt ein neues Spiel und berührt Tobias' Fabrik nicht. Tobias (Chat 16): „Das können wir im Hinterkopf behalten, aber ich möchte frühestens nächste Woche jemandem das Spiel zeigen.“ Noch offen, rechtzeitig vor dem ersten Tester: eigene Geräte oder Tobias' Tablet (dann braucht es einen zweiten Spielstand)? Bei Level 1 anfangen oder Tobias' Fabrik laden? Kurze Einführung? „Spielstand sichern und mitnehmen“ bleibt als Sicherung sinnvoll.

## Die letzten 3 Arbeitsschritte

### v0.21.2 – Ring bleibt, Bilder pro Sekunde gemessen, Plan „Spielstand sichern“ (11.11.2026, nur Doku)

- **Tobias (Chat 16):** Der Ring der Rohstoff-Gebäude bleibt, wie er ist: „Ist tatsächlich besser so, dann weiß man ca., wann das Rohstoffgebäude leer ist.“ Mit Testmodus zeigt sein Tablet 60 bis 90 Bilder pro Sekunde – das Spiel läuft flüssig.
- **Claude:** Entscheidung und Messung festgehalten; Entwurf für v0.22.0 „Spielstand sichern und laden“ mit Fragen (offene Frage 1).
- Spiel unverändert, nur die Versionsnummer steigt.

### v0.21.1 – Rückmeldung zur Karte: Ring der Rohstoff-Gebäude (11.11.2026, nur Doku)

- **Tobias (Chat 16):** Das Gebäudebild vermisst er nicht, die Farben passen. Er sieht keine „Bilder/s“. Der gelbe Kreis der Rohstoff-Gebäude bleibt nach einiger Zeit stehen – „es wirkt so, als würde die Maschine zum Stillstand kommen“.
- **Claude:** nachgerechnet – die Gebäude arbeiten weiter, der Ring bewegt sich nur 1,8° alle 4,5 Sekunden. Vorschlag für v0.21.2 (offene Frage 1); Rückfrage zum Testmodus (offene Frage 14).
- Spiel unverändert, nur die Versionsnummer steigt.

### v0.21.0 – Maschinen zeigen, was sie herstellen (11.11.2026)

- **Warum (Tobias, Chat 15/16):** Auf der Karte waren die Waren an den Maschinen so klein, dass man nur erahnen konnte, was hergestellt wird. Er wählte Variante B ohne Gebäudebild („noch nicht so aussagekräftig, später werden daraus echte 2D- bzw. 3D-Grafiken“), auch für Rohstoff-Gebäude, und schlug vor, die Gebäude je Reiter einzufärben, „so haben wir immerhin eine kleine Trennung“. Dazu die beiden Punkte aus dem Belastungstest. „Ja, du hast mein Okay.“
- **Umgesetzt:** Produkt groß auf einer hellen Scheibe, Fortschritt als gelber Ring darum; Rohstoff-Gebäude zeigen ihre Ware (leer blass), die Erntebank die der laufenden Pflanze; oben links Vorrat-Punkte oder gelbes „?“-Schild mit den fehlenden Zutaten, rechts das Statuslicht; Lagerhaus mit den Waren seiner Fächer. Farben je Reiter. Nur zeichnen, was im Bild ist; Warenbilder zwischengespeichert; „🎞️ … Bilder/s“ im Testmodus. Spielstand-Format unverändert.
- **Offen:** Tobias' Urteil (offene Fragen 1 und 14).
