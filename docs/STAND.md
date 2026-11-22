# Stand

> Zu Beginn jedes Chats lesen (zusammen mit `docs/SPIEL.md`). Kurz halten: Status, Tobias' Fabrik, nächste Schritte, offene Fragen als kurze Zeilen und die **letzten 3 Arbeitsschritte** (der neueste oben; der älteste fällt weg). Einzelheiten und Zitate stehen im Archiv (`docs/archiv/`, die alte Langfassung bis v0.36.2 in `STAND-LANGFASSUNG.md`).

| | |
|---|---|
| **Aktuelle Version** | v0.40.2 – Weiche zurückgestellt (Tobias: eigene Straßen stauen nicht), Verschieben flüssig, Entwurf „Bereich kopieren“ (nur Doku) |
| **Phase** | M2 – Produktionsketten (Level 1–13 im Spiel); Fokus jetzt auf dem 3D-Test |
| **Spielen (live)** | https://tobiasimhof.github.io/ErstesSpiel/ (3D-Test; die echte Fabrik: https://tobiasimhof.github.io/ErstesSpiel/?ansicht=2d) |
| **Nächster Schritt** | **v0.41.0 „Bereich kopieren“** – Entwurf in `docs/archiv/PLAENE.md` (markieren, „📋 Kopieren“, setzen wie ein Stempel; Inhalte bleiben leer; bei zu wenig Waren wird nichts gebaut), wartet auf Tobias' OK. |

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

- **Reihenfolge (Tobias, Chat 25: „diese Reihenfolge passt mir“; Analyse in `PLAENE.md`):** Belastungstest (v0.39.0) → 3D schneller und lesbarer (v0.40.0: volle Fläche 730 statt 6.200 Zeichenaufrufe je Bild, Tablet 60–80 Bilder/s) → ~~Weiche~~ (zurückgestellt, Chat 26) → **Bereich kopieren** (Entwurf v0.41.0). **Level 14 hinten angestellt** (Tobias: auch wegen des Token-Verbrauchs, bis Level 13 dauert es noch). Kleine Gewinne: Erinnerung zum Sichern, Rechenwerkzeug für die Zahlen.
1. **Tränke-Kapitel:** Level 14 der Mörser (Zimmerei, 1 Steinplatte + 3 Holzstäbe), Level 15 eine neue Maschine, die Kräuter, Kohle und Sand zu Staub zerkleinert, später Tinktur und erster Zaubertrank (`docs/inhalte/AUSBLICK.md`). Leitlinie: alte Maschinen bekommen neue Funktionen, neue nur, wo es Sinn ergibt.
2. **3D-Grafik** (später, die Logik geht vor): eigene Häuser ab Level 2, Mix aus Modern und Mittelalter als eigener Stil (ohne Greifarm), eine Stadt um die Fabrik, die mit dem Level wächst (Idee).
3. **Nach hinten verschoben:** Was Tester brauchen (kurze Einführung, M4; Chat 19); **Weiche** (Chat 26: eigene Straßen sind besser, siehe offene Frage 5).
4. **Später:** Verbesserungen mit Erfahrung, gründliche Durchsicht des Codes.

Abgelehnt: „Umlagern“, „Alle auffüllen“, Fabrik-Übersicht pro Minute, Ring pro Stück bei Rohstoff-Gebäuden.

## Offene Fragen

Kurzfassung; die ausführlichen Fassungen mit Zitaten bis v0.36.2 stehen in `docs/archiv/STAND-LANGFASSUNG.md`.

1. **Gold-Gleichgewicht:** umsetzen und testen, nicht zu viel regulieren (Tobias, Chat 18). Stellschrauben: Theken-Tempo je Level und Preise (`data/shop.js`). Zuletzt (Chat 25): Der schnelle Start mit 500 Gold „fühlt sich sehr gut an“.
2. **Kräuterstube mit 2 Eingängen:** Tobias' Urteil steht noch aus.
3. **Platzhalter-Zahlen** (Aufstiegspreise, Auftragsmengen, Baukosten, Fläche ab Level 10 für 2.000 je Streifen): beim Spielen feinjustieren.
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
15. **Grafik:** entschieden – frei drehbar, Mittelalter, Spiel-Farben, eigene Häuser je Gebäude; von weitem nur Statuslichter (Vorschlag A, Chat 25). Offen: Mix aus Modern und Mittelalter als eigener Stil.

## Die letzten 3 Arbeitsschritte

### v0.40.2 – Weiche zurückgestellt, Entwurf Bereich kopieren (22.11.2026, nur Doku)

- **Tobias (Chat 26):** „Das Verschieben fühlt sich jetzt auch sehr flüssig an.“ Zur Weiche: „Bisher kann man alles mit eigenen Straßen transportieren … manchmal brauchen wir 5 teile davon und 10 teile davon und dann würde sich das ganze wohl stauen … deswegen sehe ich aktuell noch nicht den Vorteil einer Weiche“.
- **Claudes Entwurf v0.41.0 „Bereich kopieren“** in `PLAENE.md`: markieren → „📋 Kopieren“ → setzen, gleich noch einmal (Stempel) bis „✕ Fertig“; Gebäude mit Einstellung und Bänder kommen mit, Inhalte nicht; bei zu wenig Waren wird nichts gebaut. Wartet auf Tobias' OK.

### v0.40.1 – 3D gemessen, Entwurf Weiche (22.11.2026, nur Doku)

- **Tobias (Chat 26, Tablet):** „Beim heraus und hereinzoomen hab ich jeweils zwischen 60 und 80 Fps.“ – „Was sind nun die nächsten Schritte ?“
- **Claudes Entwurf „Weiche“:** A – ein Band auf eine Ware einstellen, B – eigenes Gebäude. Tobias: beide nicht überzeugend, Weiche zurückgestellt (v0.40.2).

### v0.40.0 – 3D schneller und lesbarer (22.11.2026)

- **Warum (Tobias, Chat 25):** Belastungstest herausgezoomt 40–50 Bilder/s, „leicht ruckelig“, größere Bereiche verschieben ruckelt; zum Plan: „Ich würde mich vor Vorschlag a aussprechen.“ – „Gerne ok“. Dazu: „wenn ich über Bäume baue, die Bäume nicht verschwinden, sondern dann einfach aus dem Haus z.b. herausragen.“
- **Umgesetzt:** Häuser, Pfeile, Bänder, Zaun und Bäume werden zu wenigen Teilen zusammengefügt, Waren und die Funken im Tor als ein Teil je Sorte; Waren werfen keinen Schatten. Von weitem (Tablet ab Abstand 32) nur Statuslichter, beim Heranzoomen wieder die Schilder. Beim Verschieben wird die Vorschau nur einmal gebaut, grün ↔ rot wechselt nur die Farbe, die Felder sind je ein Teil. Bäume und Felsen stehen nur noch außerhalb der Welt. Gemessen (volle Fläche): herausgezoomt 6.200 → 730, nah 3.700 → etwa 450 Zeichenaufrufe je Bild; am Aussehen sonst nichts geändert.
- **Tobias' Messung:** heraus- und hineingezoomt 60–80 Bilder/s (v0.40.1); Verschieben „sehr flüssig“ (v0.40.2).
