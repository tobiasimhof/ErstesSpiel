# Stand

> Zu Beginn jedes Chats lesen (zusammen mit `docs/SPIEL.md`). Kurz halten: Status, Tobias' Fabrik, nächste Schritte, offene Fragen als kurze Zeilen und die **letzten 3 Arbeitsschritte** (der neueste oben; der älteste fällt weg). Einzelheiten und Zitate stehen im Archiv (`docs/archiv/`, die alte Langfassung bis v0.36.2 in `STAND-LANGFASSUNG.md`).

| | |
|---|---|
| **Aktuelle Version** | v0.39.0 – Belastungstest: im Testmodus ☰ → „🏭 Belastungstest (volle Fabrik)“ zeigt eine voll bebaute Fläche (46 × 38, 156 Gebäude) zum Ablesen der Bilder pro Sekunde; wird nie gespeichert |
| **Phase** | M2 – Produktionsketten (Level 1–13 im Spiel); Fokus jetzt auf dem 3D-Test |
| **Spielen (live)** | https://tobiasimhof.github.io/ErstesSpiel/ (3D-Test; die echte Fabrik: https://tobiasimhof.github.io/ErstesSpiel/?ansicht=2d) |
| **Nächster Schritt** | **Tobias misst auf dem Tablet:** ☰ → Testmodus an → ☰ → „🏭 Belastungstest“, heraus- und heranzoomen, oben die Bilder pro Sekunde ablesen, „↩ Beenden“. Danach: 3D schneller und lesbarer (je nach Ergebnis), dann Weiche, dann Bereich kopieren. Erst nach Tobias' OK programmieren. |

**Tobias' 3D-Test – Level 7, bald 8** (Chat 25): Hier spielt und testet Tobias jetzt alles neu. Die Einzelteile der Schlosserei sind schon automatisiert, Level 9 kommt deshalb zügig; bis Level 13 „wird es noch etwas dauern“. „Aktuell habe ich noch keine Probleme, weil die Bänder noch einen sehr "einseitigen" Weg haben und ich die Produktion nur umstellen muss statt ganze Produktionsstätten zu verschieben.“ Gleich aussehende Häuser stören ihn nicht: „Die Logik ist mir erstmal wichtiger.“

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

- **Reihenfolge (Tobias, Chat 25: „diese Reihenfolge passt mir“; Analyse in `PLAENE.md`):** Belastungstest (v0.39.0, im Spiel) → 3D schneller und lesbarer (gemessen: volle Fläche 3.700–6.200 Zeichenaufrufe je Bild, Tablet flüssig grob 1.000–2.000) → Weiche → Bereich kopieren. **Level 14 hinten angestellt** (Tobias: auch wegen des Token-Verbrauchs, bis Level 13 dauert es noch). Kleine Gewinne: Erinnerung zum Sichern, Rechenwerkzeug für die Zahlen.
1. **Tränke-Kapitel:** Level 14 der Mörser (Zimmerei, 1 Steinplatte + 3 Holzstäbe), Level 15 eine neue Maschine, die Kräuter, Kohle und Sand zu Staub zerkleinert, später Tinktur und erster Zaubertrank (`docs/inhalte/AUSBLICK.md`). Leitlinie: alte Maschinen bekommen neue Funktionen, neue nur, wo es Sinn ergibt.
2. **3D-Grafik** (später, die Logik geht vor): eigene Häuser ab Level 2, Mix aus Modern und Mittelalter als eigener Stil (ohne Greifarm), eine Stadt um die Fabrik, die mit dem Level wächst (Idee).
3. **Nach hinten verschoben** (Chat 19): Was Tester brauchen (kurze Einführung, M4), **Bereich kopieren** (Tobias: „sehr wichtig“), **Weiche** (Tobias: „sehr sinnvoll“).
4. **Später:** Verbesserungen mit Erfahrung, gründliche Durchsicht des Codes.

Abgelehnt: „Umlagern“, „Alle auffüllen“, Fabrik-Übersicht pro Minute, Ring pro Stück bei Rohstoff-Gebäuden.

## Offene Fragen

Kurzfassung; die ausführlichen Fassungen mit Zitaten bis v0.36.2 stehen in `docs/archiv/STAND-LANGFASSUNG.md`.

1. **Gold-Gleichgewicht:** umsetzen und testen, nicht zu viel regulieren (Tobias, Chat 18). Stellschrauben: Theken-Tempo je Level und Preise (`data/shop.js`). Zuletzt (Chat 25): Der schnelle Start mit 500 Gold „fühlt sich sehr gut an“.
2. **Kräuterstube mit 2 Eingängen:** Tobias' Urteil steht noch aus.
3. **Platzhalter-Zahlen** (Aufstiegspreise, Auftragsmengen, Baukosten, Fläche ab Level 10 für 2.000 je Streifen): beim Spielen feinjustieren.
4. **Preise Level 13** (Sand 1.100, Glas 12, Fläschchen 72): Tobias probiert sie aus.
5. **Weiche:** eigenes Gebäude oder Band-Feld? Wie stellt man die Ware je Ausgang ein? Was passiert mit Waren, die zu keinem Ausgang passen?
6. **Eiserner Bestand** im Laden-Lager, den die Theken nicht anrühren – nur, wenn Tobias das möchte.
7. **Verbesserungen mit Erfahrung** (später): schneller verarbeiten, schnellere Bänder, mehr Kundschaft; `xpTotal` zählt schon mit.
8. **Laden-Lager über der Grenze:** Abreißen und Ausräumen dürfen es überfüllen – für Tobias in Ordnung, beobachten.
9. **Claudes Lesarten** zu Level 9–13 (Mengen, Zeiten, Baukosten), die Tobias jederzeit ändern kann – Liste in der Langfassung.
10. **Einstieg:** am Anfang vor allem die Massenproduktion ausbauen – später austesten.
11. **Pleiteschutz:** Ein Rohstoff ohne passendes Gebäude verhindert das Geschenk – beobachten.
12. **Vor v1.0:** Test-Knopf entfernen (`QUEST_TEST_SKIP = false`). Später: Schwarzmarkt, verbundene Läden, Arbeitstitel.
13. **Anderen das Spiel zeigen:** geht seit v0.22.0 (eigene Geräte oder sichern → neues Spiel → laden); offen: eine kurze Einführung?
14. **Techbaum:** Werkzeuge, Kräuter und Tränke wachsen parallel; höchstens 2 Eingänge je Maschine; jedes Produkt entsteht logisch aus seinen Zutaten.
15. **Grafik:** entschieden – frei drehbar, Mittelalter, Spiel-Farben, eigene Häuser je Gebäude. Offen: Mix aus Modern und Mittelalter als eigener Stil.

## Die letzten 3 Arbeitsschritte

### v0.39.0 – Belastungstest (22.11.2026)

- **Warum (Tobias, Chat 25):** „Ja, diese Reihenfolge passt mir. Lass uns erst sehen, wie der Belastungstest ist“ – Level 8 und 9 kommen bald.
- **Umgesetzt:** Im Testmodus des 3D-Spiels ☰ → „🏭 Belastungstest (volle Fabrik)“: speichert erst das eigene Spiel, zeigt dann eine voll bebaute Fläche (Level 13, 46 × 38, 52 Straßen mit Holz, Stein, Eisen und Glas, 156 Gebäude, 312 Bänder) mit Hinweis und „↩ Beenden“. Sie wird nie gespeichert (eigener Speicherplatz, kein Speichern) – das eigene 3D-Spiel bleibt, wie es war.
- **Offen:** Tobias' Messung auf dem Tablet.

### v0.38.1 – Analyse als Spielentwickler (22.11.2026, nur Doku)

- **Tobias (Chat 25):** „Ja, du kannst loslegen.“
- **Claudes Analyse** (`PLAENE.md`): gemessen – die 3D-Ansicht braucht bei voll bebauter Fläche 3.700–6.200 Zeichenaufrufe je Bild (Startfabrik 260); ohne Abhilfe ruckelt der 3D-Test ab etwa Level 9–10. Dazu: Schilder verdecken große Fabriken, die Weiche fehlt für gemischte Bänder, Bereich kopieren für Massenproduktion, nach Level 13 kommt noch nichts. Vorschlag: Belastungstest → 3D schneller → Weiche → Bereich kopieren, Level 14/15 parallel.
- **Offen:** Tobias' Entscheidung zur Reihenfolge; wann ungefähr Level 13 im 3D-Test?
