# Stand

> Zu Beginn jedes Chats lesen (zusammen mit `docs/SPIEL.md`). Kurz halten: Status, Tobias' Fabrik, nächste Schritte, offene Fragen als kurze Zeilen und die **letzten 3 Arbeitsschritte** (der neueste oben; der älteste fällt weg). Einzelheiten und Zitate stehen im Archiv (`docs/archiv/`, die alte Langfassung bis v0.36.2 in `STAND-LANGFASSUNG.md`).

| | |
|---|---|
| **Aktuelle Version** | v0.38.0 – der Link öffnet direkt den 3D-Test; die echte Fabrik (2D) über ☰ → „🗺️ Zur echten Fabrik (2D)“ bzw. `?ansicht=2d` |
| **Phase** | M2 – Produktionsketten (Level 1–13 im Spiel); Fokus jetzt auf dem 3D-Test |
| **Spielen (live)** | https://tobiasimhof.github.io/ErstesSpiel/ (3D-Test; die echte Fabrik: https://tobiasimhof.github.io/ErstesSpiel/?ansicht=2d) |
| **Nächster Schritt** | **Claudes Analyse als Spielentwickler** (Tobias, Chat 25): Was sind die sinnvollsten nächsten Schritte? Claude schlägt sie vor (als Doku-Version), Tobias entscheidet – erst danach programmieren. |

**Tobias' 3D-Test – Level 7, bald 8** (Chat 25): Hier spielt und testet Tobias jetzt alles neu. „Aktuell habe ich noch keine Probleme, weil die Bänder noch einen sehr "einseitigen" Weg haben und ich die Produktion nur umstellen muss statt ganze Produktionsstätten zu verschieben.“ Gleich aussehende Häuser stören ihn nicht: „Die Logik ist mir erstmal wichtiger.“

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

- **Jetzt (Chat 25):** Claudes Analyse als Spielentwickler – danach ordnen wir die Liste neu.
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

### v0.38.0 – Start im 3D-Test (22.11.2026)

- **Warum (Tobias, Chat 25):** „Ja, jetzt das 3D Spiel fokussieren, weil die Kenny dateien alle funktionen und das Spiel spielbar aussieht und funktioniert.“
- **Umgesetzt:** Der Link (und das Symbol auf dem Startbildschirm) öffnet den 3D-Test mit seinem Spielstand. Die echte Fabrik: ☰ → „🗺️ Zur echten Fabrik (2D)“ oder `?ansicht=2d`; von dort zurück mit „🧊 Zurück zum 3D-Test“. Beide Spielstände bleiben, wie sie sind.
- **Offen:** Tobias' Eindruck; danach die Analyse als Spielentwickler.

### v0.37.0 – neue Ordnung (22.11.2026)

- **Warum (Tobias, Chat 25):** „damit wir einfacher und schneller arbeiten können“ und „du nicht so viel lesen musst“; zu den Fragen: „Ja, jetzt das 3D Spiel fokussieren“ und Grafik-Probe „können wir gernen entfernen und auf das Hauptspiel auf lvl 7 konzentrieren“.
- **Umgesetzt:** `STAND.md` und `SPIEL.md` kurz, die Einzelheiten in `docs/inhalte/` (LEVEL, GEBAEUDE, WAREN, BEDIENUNG, AUSBLICK), `TECHNIK.md` kurz, die alten Langfassungen im Archiv. Code: `src/ui/` (Oberfläche für 2D und 3D), `src/view3d/` (3D mit Kenneys Modellen), `src/view2d/` (2D, hinten angestellt). Browser-Test in `helpers.cjs`, `spiel2d.cjs`, `spiel3d.cjs`. Grafik-Probe samt Modern-Stil und ungebrauchten Modellen entfernt. Am Spiel sonst nichts geändert.
- **Offen:** v0.38.0 (Start im 3D-Test, gleich danach umgesetzt).

### v0.36.1 und v0.36.2 – Chat 25: Start getestet, neue Ordnung geplant (22.11.2026, nur Doku)

- **Tobias (am PC):** Der neue Start „fühlt er sich sehr gut an. Die neuen 500 Startgold fallen nicht so schwer ins Gewicht und erleichtern die ersten Level erheblich.“
- **Tobias:** Er spielt jetzt im 3D-Test (Level 7, bald 8) und stellt die echte Fabrik (Level 13) „hinten an“; die Logik ist ihm wichtiger als das Aussehen der Häuser. Wunsch: zuerst eine neue Ordnerstruktur, „damit wir einfacher und schneller arbeiten können“, dann analysiert Claude als Spielentwickler die nächsten Schritte.
- **Claudes Entwurf v0.37.0** in `PLAENE.md`; wartet auf Tobias' OK. Spiel unverändert, nur die Versionsnummer steigt.
