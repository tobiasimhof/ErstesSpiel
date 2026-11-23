# Stand

> Zu Beginn jedes Chats lesen (zusammen mit `docs/SPIEL.md`). Kurz halten: Status, Tobias' Fabrik, nächste Schritte, offene Fragen als kurze Zeilen und die **letzten 3 Arbeitsschritte** (der neueste oben; der älteste fällt weg). Einzelheiten und Zitate stehen im Archiv (`docs/archiv/`, die alte Langfassung bis v0.36.2 in `STAND-LANGFASSUNG.md`).

| | |
|---|---|
| **Aktuelle Version** | v0.43.4 – Grobplan Tränke-Kapitel, 2. Fassung: alter Magier mit Zauberkessel ab Level 15 (nur Doku; im Spiel hat seit v0.43.0 jedes Gebäude ein eigenes Haus) |
| **Phase** | M2 – Produktionsketten (Level 1–13 im Spiel); Fokus jetzt auf dem 3D-Test |
| **Spielen (live)** | https://tobiasimhof.github.io/ErstesSpiel/ (3D-Test; die echte Fabrik: https://tobiasimhof.github.io/ErstesSpiel/?ansicht=2d) |
| **Nächster Schritt** | **Tobias antwortet auf die 2. Fassung des Grobplans** (`PLAENE.md`, 4 Fragen, u. a. Feuer im Zauberkessel von Hand oder über einen dritten Eingang). Danach Rechenwerkzeug für die Zahlen, dann Level 14 mit Zahlen nach seinem Gefühl von Level 13. |

**Tobias' 3D-Test – Level 12** (Chat 27, Kamillen-Aufträge; 60 Bilder/s bei voller Fabrik): Hier spielt und testet Tobias jetzt alles neu. Baustoffe laufen alle automatisch; viele Zahnradwellen für Erntebänke und Webstuben zu brauchen, „passt mir das GLeichgewicht bis hier hin sehr gut“. Kräuter (Chat 27): „mit mehreren Erntebänken gelöst, die an der Seite immer ihre Ware mit einschieben“; Heilverbände und Wundverbände brauchen zwei Kräuterstuben – „das finde ich eigentlich recht gut“. „Aktuell habe ich noch keine Probleme, weil die Bänder noch einen sehr "einseitigen" Weg haben und ich die Produktion nur umstellen muss statt ganze Produktionsstätten zu verschieben.“ Gleich aussehende Häuser stören ihn nicht: „Die Logik ist mir erstmal wichtiger.“

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

- **Reihenfolge (Tobias, Chat 25: „diese Reihenfolge passt mir“; Analyse in `PLAENE.md`):** Belastungstest (v0.39.0) → 3D schneller und lesbarer (v0.40.0: volle Fläche 730 statt 6.200 Zeichenaufrufe je Bild, Tablet 60–80 Bilder/s) → ~~Weiche~~ (zurückgestellt, Chat 26) → Bereich kopieren (v0.41.0) – alles erledigt. Eigene Häuser (v0.42.0, v0.43.0) – fertig. **Jetzt (Chat 27, Tobias: „Okay, lass uns damit anfangen“):** Grobplan Level 14–18 (Gerüst passt, 2. Fassung wartet auf Antworten) → Rechenwerkzeug → Level 14 mit Zahlen nach Tobias' Gefühl von Level 13.
1. **Tränke-Kapitel** (Grobplan, 2. Fassung in `PLAENE.md`): 14 Die Tinktur (Mörser, Tinktur), 15 Der alte Magier (Zauberkessel, Traumtrank), 16 Die Kräutermühle (Heilpuder, Heiltrank), 17 Die Sternwarte (Linse, Fernrohr, Sternensand), 18 Die Zauberei (Farn, Lebens- und Manatrank). Kein bestehendes Rezept ändert sich. Leitlinie: alte Maschinen bekommen neue Funktionen, neue nur, wo es Sinn ergibt.
2. **3D-Grafik:** eigene Häuser für alle Gebäude (fertig, Möglichkeit B: Mittelalter mit ein paar Technik-Teilen; Tobias, Chat 27: „sieht sehr gut aus“). **Für später – Rückseiten** (Tobias, Chat 27, „nur eine kleine Anmerkung für später“): Erkennungszeichen und bewegte Teile sitzen vorn; baut man links und rechts einer Straße, sieht man eine Seite immer von hinten, „und da sieht man z.b. keine Unterschiede“. Eine Stadt um die Fabrik, die mit dem Level wächst (Idee).
3. **Nach hinten verschoben:** Was Tester brauchen (kurze Einführung, M4) – erst, wenn Tobias das Spiel anderen zeigen möchte (Chat 26); **Weiche** (Chat 26: eigene Straßen sind besser, siehe offene Frage 4).
4. **Später:** Verbesserungen mit Erfahrung, gründliche Durchsicht des Codes.

Abgelehnt: „Umlagern“, „Alle auffüllen“, Fabrik-Übersicht pro Minute, Ring pro Stück bei Rohstoff-Gebäuden, Erinnerung zum Sichern (Chat 26: Tobias wechselt das Gerät nicht).

## Offene Fragen

Kurzfassung; die ausführlichen Fassungen mit Zitaten bis v0.36.2 stehen in `docs/archiv/STAND-LANGFASSUNG.md`.

1. **Gold-Gleichgewicht:** umsetzen und testen, nicht zu viel regulieren (Tobias, Chat 18). Stellschrauben: Theken-Tempo je Level und Preise (`data/shop.js`). Zuletzt (Chat 25): Der schnelle Start mit 500 Gold „fühlt sich sehr gut an“.
2. **Platzhalter-Zahlen** (Aufstiegspreise, Auftragsmengen, Baukosten; Fläche je Seite seit v0.42.0 170 → 500 → 2.000): beim Spielen feinjustieren.
3. **Preise Level 13** (Sand 1.100, Glas 12, Fläschchen 72): Tobias probiert sie aus.
4. **Weiche – zurückgestellt** (Tobias, Chat 26): Eigene Straßen kommen sich nicht in die Quere; ein gemischtes Band staut bei ungleichem Verhältnis, bei gleichem nimmt die Maschine beide Waren schon an einem Eingang. Wieder aufgreifen nur, wenn ein echtes Problem sie braucht.
5. **Eiserner Bestand** im Laden-Lager, den die Theken nicht anrühren – nur, wenn Tobias das möchte.
6. **Verbesserungen mit Erfahrung** (später): schneller verarbeiten, schnellere Bänder, mehr Kundschaft; `xpTotal` zählt schon mit.
7. **Laden-Lager über der Grenze:** Abreißen und Ausräumen dürfen es überfüllen – für Tobias in Ordnung, beobachten.
8. **Claudes Lesarten** zu Level 9–13 (Mengen, Zeiten, Baukosten), die Tobias jederzeit ändern kann – Liste in der Langfassung.
9. **Einstieg:** am Anfang vor allem die Massenproduktion ausbauen – später austesten.
10. **Pleiteschutz:** Ein Rohstoff ohne passendes Gebäude verhindert das Geschenk – beobachten.
11. **Vor v1.0:** Test-Knopf entfernen (`QUEST_TEST_SKIP = false`). Später: Schwarzmarkt, verbundene Läden, Arbeitstitel.
12. **Anderen das Spiel zeigen:** geht seit v0.22.0 (eigene Geräte oder sichern → neues Spiel → laden); offen: eine kurze Einführung?
13. **Techbaum:** Werkzeuge, Kräuter und Tränke wachsen parallel; höchstens 2 Eingänge je Maschine; jedes Produkt entsteht logisch aus seinen Zutaten.
14. **Grafik:** entschieden – frei drehbar, Mittelalter, Spiel-Farben, eigene Häuser je Gebäude; von weitem nur Statuslichter (Vorschlag A, Chat 25). Mix aus Modern und Mittelalter: entschieden – Möglichkeit B, Mittelalter mit ein paar Technik-Teilen (Zahnräder in Messing und Stahl, später Glasrohre), sparsam, ohne Greifarm (Chat 26). Offen für später: Rückseiten der Häuser unterscheidbar machen (Chat 27).

## Die letzten 3 Arbeitsschritte

### v0.43.4 – Grobplan, 2. Fassung (23.11.2026, nur Doku)

- **Tobias (Chat 27):** „Das Gerüst passt für mich.“ Traumtrank erst auf Level 15, wenn sich ein alter Magier ansiedelt; Zauberkessel, Farn und mehr Stein-Maschinen gut; geschmeidigere Namen als „-staub“; Sorge, „zu viel umbauen“ zu müssen; Kessel mit Holzkohle befeuern.
- **Claudes 2. Fassung** (`PLAENE.md`): 11 statt 16 neue Waren, Zauberkessel ab Level 15, Kräutermühle auf 16, beide im Reiter „Stein“; kein bestehendes Rezept ändert sich. Feuer im Kessel: A von Hand (Empfehlung, 2-Eingänge-Regel bleibt) oder B dritter Eingang. Wartet auf Tobias.

### v0.43.3 – Grobplan Tränke-Kapitel (23.11.2026, nur Doku)

- **Tobias (Chat 27):** „Okay, lass uns damit anfangen.“ Level 12 im 3D-Test, Gleichgewicht „passt mir … sehr gut“.
- **Claudes Grobplan** (`PLAENE.md`): Level 14–18 ohne Zahlen, nur eine neue Maschine (Stampfmühle), sonst neue Einstellungen alter Maschinen; vielleicht ein Zauberkessel für Level 18. 5 Fragen an Tobias.

### v0.43.2 – Kräuterstube passt, Analyse Teil 2 (23.11.2026, nur Doku)

- **Tobias (Chat 27):** Kräuterstube mit 2 Eingängen „finde ich auch gut“. „Für mich klingt es so, als würden wir nur darauf warten, dass ich wieder auf Level 13 komme … Was könnten wir noch machen bevor wir uns weiter an den Techbaum machen?“
- **Claudes Analyse** (`PLAENE.md`): Der Grundrahmen trägt, der wichtigste Hebel ist Inhalt. Nicht warten: Planen dauert länger als Umsetzen, und Level 13 bestimmt vor allem die Zahlen, nicht das Gerüst. Vorschlag: Grobplan Tränke-Kapitel → Rechenwerkzeug → Level 14; Rückseiten zwischendurch. Wartet auf Tobias' Antworten.
