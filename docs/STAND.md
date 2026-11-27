# Stand

> Zu Beginn jedes Chats lesen (zusammen mit `docs/SPIEL.md`). Kurz halten: Status, Tobias' Fabrik, nächste Schritte, offene Fragen als kurze Zeilen und die **letzten 3 Arbeitsschritte** (der neueste oben; der älteste fällt weg). Einzelheiten und Zitate stehen im Archiv (`docs/archiv/`, die alte Langfassung bis v0.36.2 in `STAND-LANGFASSUNG.md`).

| | |
|---|---|
| **Aktuelle Version** | v0.60.0 – Level 19 „Die Landvermessung“ (Instrumentenbau, sechs neue Produkte) |
| **Phase** | Design und Grafik vorerst abgeschlossen (Tobias, Chat 30); M2 – Produktionsketten: Level 1–18 im Spiel, das Tränke-Kapitel ist fertig |
| **Spielen (live)** | https://tobiasimhof.github.io/ErstesSpiel/ |
| **Nächster Schritt** | **Tobias testet Level 17 und 18** und beantwortet die Fragen zur **2. Fassung von Level 19** (v0.60.0, `PLAENE.md`: sechs neue Produkte, Instrumentenbau) und zum **neuen Baumenü** (v0.61.0, Möglichkeiten A–C). Ab Level 19 gilt: alles mit allem mischen, Abwechslung vor Gold (Chat 33). „Zauber des Magiers“ ab Level 20. |

**Tobias' Fabrik (3D) – Level 16, braut Heiltränke** (Chat 32, Bild: 22.768 Gold; unten links viel freie Fläche durch die neuen Streifen). Level 15 ging „etwas schnell“ – Auftragsmengen lassen sich später anpassen; „Ich finde die neuen Produkte gut, so entstehen wieder neue Straßen“. Die Fabrik steht bewusst still (kein Gold mehr verdienen, daher die roten Lichter), das Lager ist übervoll vom Strecke-Leeren. Die 2D-Welt ist seit v0.54.0 entfernt (Tobias: „das 3D game, das eigentliche Game“).

Frühere Stände der Fabrik (Level 8, 10, 11 mit Zitaten; zuletzt Level 13 aus Chat 27) in `docs/archiv/STAND-LANGFASSUNG.md`.

## Fahrplan

| | Meilenstein | Inhalt |
|---|---|---|
| M0, M1 | Planung, Fabrik-Grundgerüst | erledigt |
| **M2** | **Produktionsketten** | **jetzt:** Werkzeuge (1–6), Kräuter (7–12) und Tränke (13–18) fertig; ab Level 19 die alten Straßen verlängern |
| M3 | Wirtschaft & Fortschritt | Nachfrage und Trends, Laden-Ausbau mit Waren, evtl. Freischaltpunkte |
| M4 | Optik & Gefühl | vorerst abgeschlossen (Chat 30): 3D, Häuser, Waren, Oberfläche, Ladebildschirm, Schriftrolle, Einführung; offen: Klänge, Animationen, Rückseiten, Stadt |
| M5–M7 | Online, Clans & Handel, App | Spielerkonto, Schwarzmarkt, Clans, Android und iOS |

**Nächste Schritte** (jeder erst nach Tobias' OK):

- **Erledigt seit Chat 25** (Einzelheiten in `PLAENE.md`): v0.39.0–v0.54.0 (Belastungstest, Level 14, Kenney-Oberfläche, Ladebildschirm, Schriftrolle, Einführung, Feinschliff, ein Spiel ohne 2D-Welt). **Jetzt:** Level 15–18 im Spiel (v0.55.0, v0.57.0, v0.58.0, v0.59.0), Browser-Test parallel (v0.56.2); Entwurf Level 19 (2. Fassung) und Baumenü (v0.59.2) warten auf Tobias.
1. **Tränke-Kapitel** (angenommen, Chat 27; seit v0.59.0 ganz im Spiel; Tabelle in `docs/inhalte/AUSBLICK.md`): 14 Die Tinktur (Mörser, Tinktur), 15 Der alte Magier (Zauberkessel, Traumtrank), 16 Die Kräutermühle (Heilpuder, Heiltrank), 17 Die Sternwarte (Linse, Fernrohr, Sternensand), 18 Die Zauberei (Farn, Lebens- und Manatrank). Feuer im Kessel von Hand (A); mehr Fläche ab Level 15; einzige Rezeptänderung: Mörser aus 5 Holzstäben (Tobias, Chat 31). Gemahlenes Glas: **Kristallsand** (Tobias), im Steinmetz. Leitlinie: alte Maschinen bekommen neue Funktionen, neue nur, wo es Sinn ergibt.
2. **3D-Grafik:** eigene Häuser für alle Gebäude (fertig, Möglichkeit B: Mittelalter mit ein paar Technik-Teilen; Tobias, Chat 27: „sieht sehr gut aus“). **Waren auf dem Band** (v0.46.0): eigene kleine 3D-Formen. **Für später – Rückseiten** (Tobias, Chat 27, „nur eine kleine Anmerkung für später“): Erkennungszeichen und bewegte Teile sitzen vorn; baut man links und rechts einer Straße, sieht man eine Seite immer von hinten, „und da sieht man z.b. keine Unterschiede“. Eine Stadt um die Fabrik, die mit dem Level wächst (Idee).
3. **Nach hinten verschoben:** **Weiche** (Chat 26: eigene Straßen sind besser, siehe offene Frage 4).
4. **Später:** Verbesserungen mit Erfahrung, gründliche Durchsicht des Codes.

Abgelehnt: „Umlagern“, „Alle auffüllen“, Fabrik-Übersicht pro Minute, Ring pro Stück bei Rohstoff-Gebäuden, Erinnerung zum Sichern (Chat 26: Tobias wechselt das Gerät nicht).

## Offene Fragen

Kurzfassung; die ausführlichen Fassungen mit Zitaten bis v0.36.2 stehen in `docs/archiv/STAND-LANGFASSUNG.md`.

1. **Gold-Gleichgewicht:** umsetzen und testen, nicht zu viel regulieren (Tobias, Chat 18). Stellschrauben: Theken-Tempo je Level und Preise (`data/shop.js`). Zuletzt (Chat 25): Der schnelle Start mit 500 Gold „fühlt sich sehr gut an“. Rechenwerkzeug (v0.44.0): Die Aufträge bezahlen den Aufstieg fast allein, nach etwa 443.000 Gold gibt es nichts mehr zu kaufen – Level 14–18 brauchen neue Ausgaben.
2. **Platzhalter-Zahlen** (Aufstiegspreise, Auftragsmengen, Baukosten; Fläche je Seite seit v0.42.0 170 → 500 → 2.000): beim Spielen feinjustieren, mit `ZAHLEN.md` nachrechnen.
3. **Preise Level 13** (Sand 1.100, Glas 12, Fläschchen 72): Tobias probiert sie aus.
4. **Weiche – zurückgestellt** (Tobias, Chat 26): Eigene Straßen kommen sich nicht in die Quere; ein gemischtes Band staut bei ungleichem Verhältnis, bei gleichem nimmt die Maschine beide Waren schon an einem Eingang. Wieder aufgreifen nur, wenn ein echtes Problem sie braucht.
5. **Eiserner Bestand** im Laden-Lager, den die Theken nicht anrühren – nur, wenn Tobias das möchte.
6. **Verbesserungen mit Erfahrung** (später): schneller verarbeiten, schnellere Bänder, mehr Kundschaft; `xpTotal` zählt schon mit (seit v0.56.0 nur im Hintergrund, nicht zu sehen).
7. **Laden-Lager über der Grenze:** entschieden – Abreißen, Ausräumen und „Strecke leeren“ dürfen es überfüllen (Tobias, Chat 32: „Strecke leeren kann so bleiben“).
8. **Claudes Lesarten** zu Level 9–13 (Mengen, Zeiten, Baukosten), die Tobias jederzeit ändern kann – Liste in der Langfassung.
9. **Einstieg:** am Anfang vor allem die Massenproduktion ausbauen – später austesten.
10. **Pleiteschutz:** Ein Rohstoff ohne passendes Gebäude verhindert das Geschenk – beobachten.
11. **Vor v1.0:** Test-Knopf entfernen (`QUEST_TEST_SKIP = false`). Später: Schwarzmarkt, verbundene Läden, Arbeitstitel.
12. **Anderen das Spiel zeigen:** geht seit v0.22.0 (eigene Geräte oder sichern → neues Spiel → laden; seit v0.50.0 mit eigenem Namen, seit v0.52.0 mit Hildes Einführung).
13. **Techbaum:** Werkzeuge, Kräuter und Tränke wachsen parallel; höchstens 2 Eingänge und **höchstens 4 Einstellungen je Maschine** (Tobias, Chat 32: „damit wir wissen, ab wann wir neue maschinen einführen müssen“); jedes Produkt entsteht logisch aus seinen Zutaten. Ab Level 19 alles mit allem mischen: mehr neue Produkte je Level, Abwechslung vor Gold (Chat 33).
14. **Grafik:** entschieden – frei drehbar, Mittelalter, Spiel-Farben, eigene Häuser je Gebäude; von weitem nur Statuslichter (Vorschlag A, Chat 25). Mix aus Modern und Mittelalter: entschieden – Möglichkeit B, Mittelalter mit ein paar Technik-Teilen (Zahnräder in Messing und Stahl, später Glasrohre), sparsam, ohne Greifarm (Chat 26). Offen für später: Rückseiten der Häuser unterscheidbar machen (Chat 27). Oberfläche: Kenneys UI Pack Adventure, Rahmen B mit Eisenbeschlägen, schlicht (Chat 28). Klänge: Das Paket gefällt Tobias nicht, er spielt mit Sound auf 0 (Chat 29) – andere Klänge oder Fabrik-Geräusche, später.
15. **Titel:** Richtung „Factory“; „Flussfactory“, „Zunft-Factory“, „Medieval Factory“ gefallen Tobias nicht – bis dahin Platzhalter „Factory“ auf dem Ladebildschirm.
16. **Herauszoomen in 3D:** seit v0.55.0 bis zum 1,85-Fachen der Welt – die größte Welt (54 × 46) passt aufs Tablet, auf dem Handy fast. Tobias prüft es.
17. **Neue Ausgaben fürs Gold:** „Zauber des Magiers“ (`AUSBLICK.md`) erst ab Level 20, „wenn wir mit allen grundlegenden Sachen fertig sind und wir auch lange Produktionsstraßen haben“ (Tobias, Chat 32).

## Die letzten 3 Arbeitsschritte

### v0.59.2 – Level 19, 2. Fassung, und Baumenü (27.11.2026, nur Doku)

- **Tobias (Chat 33):** „Mir geht es aktuell um die Varität“ – Gold je Stufe darf auch mal weniger sein; jetzt „alles mit allem mischen“, mehr neue Produkte je Level, manche an Straßen angebunden, manche aus Zwischenprodukten (neue Stätten). Baumenü: nur das Grundgerüst in der Leiste, die Reiter über einen eigenen Knopf.
- **Claude:** 2. Fassung in `PLAENE.md`: sechs neue Produkte (Astrolabium, Messtisch, Lupe im Instrumentenbau; Heilertasche, Schatztruhe, Laterne in Kräuterstube, Schlosserei, Feinschmiede), fünf Aufträge (33.501 Gold). Baumenü: A Werkzeuge + 3 zuletzt gebaute + „🏭 Gebäude“-Katalog (Empfehlung), B wischbar, C aufklappen. **Offen:** 4 Fragen.

### v0.59.1 – Entwurf Level 19 „Die Landvermessung“ (27.11.2026, nur Doku)

- **Tobias (Chat 33):** Entwurf Level 19 mit Blick auf Gleichgewicht, Straßen, Endprodukte, neue Produkte.
- **Claude:** 1. Fassung in `PLAENE.md` (Instrumentenbau mit Astrolabium und Messtisch, Heilertasche); überholt durch v0.59.2.

### v0.59.0 – Level 18 „Die Zauberei“ (27.11.2026)

- **Warum (Tobias, Chat 33):** Entwurf angenommen („Farn können wir gerne als 5. Pflanze einführen“, „Gerne A“, „Ja, können wir auch gerne so machen“).
- **Umgesetzt:** Farn als 5. Pflanze (Farnsporen 1.000, Beet, Erntebank → 50 Farnwedel à 24; eigene Wuchsform ohne Blüte), Zauberkessel braut Lebenstrank (1 Heiltrank + 5 Farnwedel, 876) und Manatrank (1 Traumtrank + 2 Kristallsand, 841), je 90 s – der Kessel ist voll; Ambrosius, Agnes, Ambrosius, Hildes Fest (27.891 Gold), Aufstieg 22.500. Format bleibt 21.
- **Offen:** Tobias' Test.
