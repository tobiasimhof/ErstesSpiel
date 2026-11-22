# Stand

> Zu Beginn jedes Chats lesen (zusammen mit `docs/SPIEL.md`). Kurz halten: Status, Tobias' Fabrik, nächste Schritte, offene Fragen als kurze Zeilen und die **letzten 3 Arbeitsschritte** (der neueste oben; der älteste fällt weg). Einzelheiten und Zitate stehen im Archiv (`docs/archiv/`, die alte Langfassung bis v0.36.2 in `STAND-LANGFASSUNG.md`).

| | |
|---|---|
| **Aktuelle Version** | v0.42.0 – eigene Häuser für Level 2–6 (Steinbruch, Steinmetz, Schmelzhütte, Zimmerei, Feinschmiede, Schlosserei; was sich bewegt, tut das nur beim Arbeiten); Flächenpreise je Seite 170 → 500 → 2.000 |
| **Phase** | M2 – Produktionsketten (Level 1–13 im Spiel); Fokus jetzt auf dem 3D-Test |
| **Spielen (live)** | https://tobiasimhof.github.io/ErstesSpiel/ (3D-Test; die echte Fabrik: https://tobiasimhof.github.io/ErstesSpiel/?ansicht=2d) |
| **Nächster Schritt** | **Tobias testet** die neuen Häuser in seiner Fabrik. Danach **v0.43.0 eigene Häuser, Teil 2** (Level 7–12: Erntebank, Webstube, Kräuterstube, Schreibstube, Uhrmacherei, Apotheke) nach dem Entwurf in `PLAENE.md`. |

**Tobias' 3D-Test – Level 10** (Chat 26; Level 7 in Chat 25): Hier spielt und testet Tobias jetzt alles neu. Weiterplanen (Level 14) erst, wenn er Level 13 erreicht hat: „dann kann ich das ganze Gefühl mitnehmen“. Die Einzelteile der Schlosserei sind schon automatisiert, Level 9 kommt deshalb zügig; bis Level 13 „wird es noch etwas dauern“. „Aktuell habe ich noch keine Probleme, weil die Bänder noch einen sehr "einseitigen" Weg haben und ich die Produktion nur umstellen muss statt ganze Produktionsstätten zu verschieben.“ Gleich aussehende Häuser stören ihn nicht: „Die Logik ist mir erstmal wichtiger.“

**Echte Fabrik (2D) – Level 13, hinten angestellt** (Chat 25). Frühere Stände (Level 8, 10, 11 mit Zitaten) in `docs/archiv/STAND-LANGFASSUNG.md`.

## Fahrplan

| | Meilenstein | Inhalt |
|---|---|---|
| M0, M1 | Planung, Fabrik-Grundgerüst | erledigt |
| **M2** | **Produktionsketten** | **jetzt:** Werkzeuge (1–6) und Kräuter (7–12) fertig, Tränke ab Level 13 |
| M3 | Wirtschaft & Fortschritt | Nachfrage und Trends, Laden-Ausbau mit Waren, evtl. Freischaltpunkte |
| M4 | Optik & Gefühl | 3D-Grafik (vorgezogen, im 3D-Test), Animationen, Sound (später), Einführung für neue Spieler |
| M5–M7 | Online, Clans & Handel, App | Spielerkonto, Schwarzmarkt, Clans, Android und iOS |

**Nächste Schritte** (jeder erst nach Tobias' OK):

- **Reihenfolge (Tobias, Chat 25: „diese Reihenfolge passt mir“; Analyse in `PLAENE.md`):** Belastungstest (v0.39.0) → 3D schneller und lesbarer (v0.40.0: volle Fläche 730 statt 6.200 Zeichenaufrufe je Bild, Tablet 60–80 Bilder/s) → ~~Weiche~~ (zurückgestellt, Chat 26) → Bereich kopieren (v0.41.0) – alles erledigt. **Jetzt (Tobias, Chat 26):** eigene Häuser (v0.42.0 Level 2–6 mit den Flächenpreisen – fertig, v0.43.0 Level 7–12). **Level 14** erst planen, wenn Tobias Level 13 erreicht hat. Kleiner Gewinn für später: Rechenwerkzeug für die Zahlen.
1. **Tränke-Kapitel:** Level 14 der Mörser (Zimmerei, 1 Steinplatte + 3 Holzstäbe), Level 15 eine neue Maschine, die Kräuter, Kohle und Sand zu Staub zerkleinert, später Tinktur und erster Zaubertrank (`docs/inhalte/AUSBLICK.md`). Leitlinie: alte Maschinen bekommen neue Funktionen, neue nur, wo es Sinn ergibt.
2. **3D-Grafik:** eigene Häuser für alle Gebäude (Level 2–6 fertig, 7–12 als Nächstes; Möglichkeit B: Mittelalter mit ein paar Technik-Teilen), eine Stadt um die Fabrik, die mit dem Level wächst (Idee).
3. **Nach hinten verschoben:** Was Tester brauchen (kurze Einführung, M4) – erst, wenn Tobias das Spiel anderen zeigen möchte (Chat 26); **Weiche** (Chat 26: eigene Straßen sind besser, siehe offene Frage 5).
4. **Später:** Verbesserungen mit Erfahrung, gründliche Durchsicht des Codes.

Abgelehnt: „Umlagern“, „Alle auffüllen“, Fabrik-Übersicht pro Minute, Ring pro Stück bei Rohstoff-Gebäuden, Erinnerung zum Sichern (Chat 26: Tobias wechselt das Gerät nicht).

## Offene Fragen

Kurzfassung; die ausführlichen Fassungen mit Zitaten bis v0.36.2 stehen in `docs/archiv/STAND-LANGFASSUNG.md`.

1. **Gold-Gleichgewicht:** umsetzen und testen, nicht zu viel regulieren (Tobias, Chat 18). Stellschrauben: Theken-Tempo je Level und Preise (`data/shop.js`). Zuletzt (Chat 25): Der schnelle Start mit 500 Gold „fühlt sich sehr gut an“.
2. **Kräuterstube mit 2 Eingängen:** Tobias' Urteil steht noch aus.
3. **Platzhalter-Zahlen** (Aufstiegspreise, Auftragsmengen, Baukosten; Fläche je Seite seit v0.42.0 170 → 500 → 2.000): beim Spielen feinjustieren.
4. **Preise Level 13** (Sand 1.100, Glas 12, Fläschchen 72): Tobias probiert sie aus.
5. **Weiche – zurückgestellt** (Tobias, Chat 26): Eigene Straßen kommen sich nicht in die Quere; ein gemischtes Band staut bei ungleichem Verhältnis, bei gleichem nimmt die Maschine beide Waren schon an einem Eingang. Wieder aufgreifen nur, wenn ein echtes Problem sie braucht.
6. **Eiserner Bestand** im Laden-Lager, den die Theken nicht anrühren – nur, wenn Tobias das möchte.
7. **Verbesserungen mit Erfahrung** (später): schneller verarbeiten, schnellere Bänder, mehr Kundschaft; `xpTotal` zählt schon mit.
8. **Laden-Lager über der Grenze:** Abreißen und Ausräumen dürfen es überfüllen – für Tobias in Ordnung, beobachten.
9. **Claudes Lesarten** zu Level 9–13 (Mengen, Zeiten, Baukosten), die Tobias jederzeit ändern kann – Liste in der Langfassung.
10. **Einstieg:** am Anfang vor allem die Massenproduktion ausbauen – später austesten.
11. **Pleiteschutz:** Ein Rohstoff ohne passendes Gebäude verhindert das Geschenk – beobachten.
12. **Vor v1.0:** Test-Knopf entfernen (`QUEST_TEST_SKIP = false`). Später: Schwarzmarkt, verbundene Läden, Arbeitstitel.
13. **Anderen das Spiel zeigen:** geht seit v0.22.0 (eigene Geräte oder sichern → neues Spiel → laden); offen: eine kurze Einführung?
14. **Techbaum:** Werkzeuge, Kräuter und Tränke wachsen parallel; höchstens 2 Eingänge je Maschine; jedes Produkt entsteht logisch aus seinen Zutaten.
15. **Grafik:** entschieden – frei drehbar, Mittelalter, Spiel-Farben, eigene Häuser je Gebäude; von weitem nur Statuslichter (Vorschlag A, Chat 25). Mix aus Modern und Mittelalter: entschieden – Möglichkeit B, Mittelalter mit ein paar Technik-Teilen (Zahnräder in Messing und Stahl, später Glasrohre), sparsam, ohne Greifarm (Chat 26).

## Die letzten 3 Arbeitsschritte

### v0.42.0 – eigene Häuser für Level 2–6, Flächenpreise (22.11.2026)

- **Warum (Tobias, Chat 26):** „B passt für mich sehr gut. Die Reihenfolge passt auch mit den level 2-6, dann sehe ich auch direkt eine optische Veränderung bei meiner Hauptproduktionsstätte“; die dritte Fläche bleibt bei 2.000 („Da hab ich mich verschrieben“).
- **Umgesetzt:** Steinbruch (Grube, Kran schwenkt), Steinmetz (Rundbogen, Werkbank, Staub), Schmelzhütte (Steinturm, Glut, Rauch), Zimmerei (Holzschuppen, Sägeblatt dreht), Feinschmiede (Spitzdach, Messing-Zahnrad dreht), Schlosserei (breites Tor, Glut, Rauch, Eisengitter) – 13 neue Kenney-Modelle aus Tobias' Upload (Chat 23). Flächenpreise je Seite 170 → 500 → 2.000. Belastungstest weiter unter 1.000 Zeichenaufrufen.
- **Offen:** Tobias' Test.

### v0.41.2 – Entwurf eigene Häuser und Flächenpreise (22.11.2026, nur Doku)

- **Tobias (Chat 26):** Level 10 erreicht; Sichern „nicht so wichtig“; Level 14 erst ab Level 13; Einführung erst, wenn er das Spiel anderen zeigt; zweiter Flächenstreifen 500 statt 170 („170 af 500 auf 2500“); am meisten reizen ihn „die individuellen Häuser … man [kann] besser erkennen, welches Gebäude was gerade macht“.
- **Claudes Entwurf** in `PLAENE.md`: alle drei Kenney-Pakete liegen vollständig in der Versionsgeschichte; je Gebäude Bauart, Dachform, Erkennungszeichen und ein Teil, das sich beim Arbeiten bewegt; A rein Mittelalter oder B mit Zahnrädern und Glasrohren. Wartet auf Tobias' Antworten.

### v0.41.1 – Kopieren getestet, Plan für die nächsten Schritte (22.11.2026, nur Doku)

- **Tobias (Chat 26):** Kopieren und Bauleiste passen; „Lass uns jetzt die nächsten Schritte planen“.
- **Claudes Plan** in `PLAENE.md`: Erinnerung zum Sichern (v0.42.0), Level 14/15 planen ab etwa Level 11, Einführung für neue Spieler; später Rechenwerkzeug, eigene Häuser, Wirtschaft, 2D entfernen. Wartet auf Tobias' Antworten.
