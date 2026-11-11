# Stand

> Zu Beginn jedes Chats lesen (zusammen mit `docs/SPIEL.md`). Wird bei jeder Version aktualisiert: Status, offene Fragen und die **letzten 3 Arbeitsschritte** (der neueste oben; der älteste fällt weg – vollständig steht jeder Schritt im Archiv).

| | |
|---|---|
| **Aktuelle Version** | v0.21.0 – Maschinen zeigen, was sie herstellen |
| **Phase** | M2 – Produktionsketten (Kräuter-Kapitel ab Level 7) |
| **Spielen (live)** | https://tobiasimhof.github.io/ErstesSpiel/ |
| **Nächster Schritt** | Tobias spielt v0.21.0: Erkennt er auf der Karte, was jede Maschine herstellt, passen die Farben je Reiter (offene Frage 1)? Wie viele Bilder pro Sekunde zeigt der Testmodus auf seinem Tablet (offene Frage 14)? Danach Plan für „Spielstand sichern und was Tester brauchen“ – Claude programmiert erst nach seinem OK. |

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

**Nächste Schritte** (Tobias' Auswahl in Chat 15; Reihenfolge ist Claudes Vorschlag, ausführlich in `docs/archiv/PLAENE.md`): Spielstand sichern und was Tester brauchen (Frage 13; Tobias zeigt das Spiel frühestens ab nächster Woche, 16.11.2026); Bereich kopieren (Tobias: „sehr wichtig“); Weiche (Frage 5). Später: Verbesserungen mit Erfahrung (Frage 7), Level 9. Noch offen: gründliche Durchsicht des Codes. Abgelehnt: „Umlagern“, „Alle auffüllen“, Fabrik-Übersicht pro Minute.

## Offene Fragen

1. **Karte mit Produkten und Farben (v0.21.0):** Maschinen und Rohstoff-Gebäude zeigen ihr Produkt statt des Gebäudebildes, jeder Reiter hat seine Farbe (Holz braun, Stein steingrau, Eisen stahlblau, Erde grün). Tobias' Urteil steht aus: Erkennt er alles, auch herausgezoomt? Fehlt ihm das Gebäudebild? Passen die Farben (je eine Zahl in `data/buildings.js`)? Eigene Gebäudebilder kommen später mit echter Grafik (M4).
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
14. **Flüssig auch mit großer Fabrik?** Auf Tobias' Tablet ruckelt es nicht (Chat 16). Seit v0.21.0 zeichnet das Spiel nur, was im Bild ist, und speichert die Warenbilder zwischen; die Rechenarbeit fürs Zeichnen hat sich nah dran und ganz herausgezoomt etwa halbiert (Testrechner ohne Grafikchip). Der Testmodus zeigt oben „🎞️ … Bilder/s“: Welche Zahl sieht Tobias mit seiner Fabrik, nah und ganz herausgezoomt? (Das Tab S9 schafft bis zu 120; ab etwa 50 wirkt es flüssig.)

## Die letzten 3 Arbeitsschritte

### v0.21.0 – Maschinen zeigen, was sie herstellen (11.11.2026)

- **Warum (Tobias, Chat 15/16):** Auf der Karte waren die Waren an den Maschinen so klein, dass man nur erahnen konnte, was hergestellt wird. Er wählte Variante B ohne Gebäudebild („noch nicht so aussagekräftig, später werden daraus echte 2D- bzw. 3D-Grafiken“), auch für Rohstoff-Gebäude, und schlug vor, die Gebäude je Reiter einzufärben, „so haben wir immerhin eine kleine Trennung“. Dazu die beiden Punkte aus dem Belastungstest. „Ja, du hast mein Okay.“
- **Umgesetzt:** Produkt groß auf einer hellen Scheibe, Fortschritt als gelber Ring darum; Rohstoff-Gebäude zeigen ihre Ware (leer blass), die Erntebank die der laufenden Pflanze; oben links Vorrat-Punkte oder gelbes „?“-Schild mit den fehlenden Zutaten, rechts das Statuslicht; Lagerhaus mit den Waren seiner Fächer. Farben je Reiter. Nur zeichnen, was im Bild ist; Warenbilder zwischengespeichert; „🎞️ … Bilder/s“ im Testmodus. Spielstand-Format unverändert.
- **Offen:** Tobias' Urteil (offene Fragen 1 und 14).

### v0.20.3 – Antworten zum Belastungstest und zu den Testern (11.11.2026, nur Doku)

- **Tobias (Chat 16):** Die beiden Punkte aus dem Belastungstest sollen in v0.21.0 mit hinein („Passt“). Auf seinem Tablet ruckelt das Spiel nicht, auch herausgezoomt nicht. Tester: „Das können wir im Hinterkopf behalten, aber ich möchte frühestens nächste Woche jemandem das Spiel zeigen.“ Die Frage zu Variante B (ohne oder mit kleinem Gebäudebild) und sein OK für v0.21.0 sind noch unbeantwortet.
- **Claude:** Antworten festgehalten, bei Variante B nachgefragt (offene Frage 1).
- Spiel unverändert, nur die Versionsnummer steigt.

### v0.20.2 – Tobias' Wahl, Variante B luftiger, Belastungstest (10.11.2026, nur Doku)

- **Tobias (Chat 15):** Variante B, aber „nicht so 100 % hübsch, wirkt etwas gequetscht“. Spielstand sichern gefällt ihm, weil er den Stand anderen zum Testen zeigen möchte, ohne seinen Spielstand zu verlieren. Bereich kopieren „sehr wichtig“, eine Weiche „sehr sinnvoll“, der Belastungstest sinnvoll. Nein zu „Umlagern“ und „Alle auffüllen“ (das händische Arbeiten ginge verloren) und zur Übersicht pro Minute (nicht in dieser Phase); Verbesserungen mit Erfahrung erst später.
- **Claude:** neue Vorschaubilder für Variante B (Fortschritt als Ring um das Produkt, kein Gebäudebild, „?“-Schild oben links; als Alternative mit kleinem Gebäudebild). Erklärt, dass jedes Gerät seinen eigenen Spielstand hat (offene Frage 13). Belastungstest als reine Messung: Rechnen unkritisch, Zeichnen ist der Engpass (offene Frage 14). Vorschlag für die Reihenfolge der nächsten Versionen.
- Spiel unverändert, nur die Versionsnummer steigt.
