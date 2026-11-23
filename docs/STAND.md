# Stand

> Zu Beginn jedes Chats lesen (zusammen mit `docs/SPIEL.md`). Kurz halten: Status, Tobias' Fabrik, nächste Schritte, offene Fragen als kurze Zeilen und die **letzten 3 Arbeitsschritte** (der neueste oben; der älteste fällt weg). Einzelheiten und Zitate stehen im Archiv (`docs/archiv/`, die alte Langfassung bis v0.36.2 in `STAND-LANGFASSUNG.md`).

| | |
|---|---|
| **Aktuelle Version** | v0.44.1 – Entwurf Level 14 „Die Tinktur“ (nur Doku; im Spiel seit v0.44.0 das Rechenwerkzeug) |
| **Phase** | M2 – Produktionsketten (Level 1–13 im Spiel); Fokus jetzt auf dem 3D-Test |
| **Spielen (live)** | https://tobiasimhof.github.io/ErstesSpiel/ (3D-Test; die echte Fabrik: https://tobiasimhof.github.io/ErstesSpiel/?ansicht=2d) |
| **Nächster Schritt** | **Tobias' OK zu Level 14 „Die Tinktur“** (Entwurf v0.45.0 in `PLAENE.md`, 4 Fragen), dann umsetzen. Danach Level 15 mit neuer Fläche als großer Ausgabe für Gold. |

**Tobias' 3D-Test – Level 13 abgeschlossen** (Chat 27; 26.095 Gold, 60 Bilder/s bei voller Fabrik). Platz „zu ca. 70% sinnvoll gefüllt“, größere Straßen werden schwierig; das Gold häuft sich mit Waren, die er noch nicht weiterverarbeiten kann. Gebremst haben ihn in den Kräuter-Leveln fehlende Teile für Gebäude. Baustoffe laufen alle automatisch; viele Zahnradwellen für Erntebänke und Webstuben zu brauchen, „passt mir das GLeichgewicht bis hier hin sehr gut“. Kräuter (Chat 27): „mit mehreren Erntebänken gelöst, die an der Seite immer ihre Ware mit einschieben“; Heilverbände und Wundverbände brauchen zwei Kräuterstuben – „das finde ich eigentlich recht gut“. „Aktuell habe ich noch keine Probleme, weil die Bänder noch einen sehr "einseitigen" Weg haben und ich die Produktion nur umstellen muss statt ganze Produktionsstätten zu verschieben.“

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

- **Reihenfolge (Tobias, Chat 25: „diese Reihenfolge passt mir“; Analyse in `PLAENE.md`):** Belastungstest (v0.39.0) → 3D schneller und lesbarer (v0.40.0: volle Fläche 730 statt 6.200 Zeichenaufrufe je Bild, Tablet 60–80 Bilder/s) → ~~Weiche~~ (zurückgestellt, Chat 26) → Bereich kopieren (v0.41.0) – alles erledigt. Eigene Häuser (v0.42.0, v0.43.0) – fertig. **Jetzt (Chat 27, Tobias: „Okay, lass uns damit anfangen“):** Grobplan Level 14–18 (angenommen) → Rechenwerkzeug (v0.44.0, fertig) → Level 14 mit Zahlen nach Tobias' Gefühl von Level 13.
1. **Tränke-Kapitel** (angenommen, Chat 27; Tabelle in `docs/inhalte/AUSBLICK.md`): 14 Die Tinktur (Mörser, Tinktur), 15 Der alte Magier (Zauberkessel, Traumtrank), 16 Die Kräutermühle (Heilpuder, Heiltrank), 17 Die Sternwarte (Linse, Fernrohr, Sternensand), 18 Die Zauberei (Farn, Lebens- und Manatrank). Kein bestehendes Rezept ändert sich; Feuer im Kessel von Hand (A); mehr Fläche ab Level 15. Gemahlenes Glas: **Kristallsand** (Tobias), im Steinmetz. Leitlinie: alte Maschinen bekommen neue Funktionen, neue nur, wo es Sinn ergibt.
2. **3D-Grafik:** eigene Häuser für alle Gebäude (fertig, Möglichkeit B: Mittelalter mit ein paar Technik-Teilen; Tobias, Chat 27: „sieht sehr gut aus“). **Für später – Rückseiten** (Tobias, Chat 27, „nur eine kleine Anmerkung für später“): Erkennungszeichen und bewegte Teile sitzen vorn; baut man links und rechts einer Straße, sieht man eine Seite immer von hinten, „und da sieht man z.b. keine Unterschiede“. Eine Stadt um die Fabrik, die mit dem Level wächst (Idee).
3. **Nach hinten verschoben:** Was Tester brauchen (kurze Einführung, M4) – erst, wenn Tobias das Spiel anderen zeigen möchte (Chat 26); **Weiche** (Chat 26: eigene Straßen sind besser, siehe offene Frage 4).
4. **Später:** Verbesserungen mit Erfahrung, gründliche Durchsicht des Codes.

Abgelehnt: „Umlagern“, „Alle auffüllen“, Fabrik-Übersicht pro Minute, Ring pro Stück bei Rohstoff-Gebäuden, Erinnerung zum Sichern (Chat 26: Tobias wechselt das Gerät nicht).

## Offene Fragen

Kurzfassung; die ausführlichen Fassungen mit Zitaten bis v0.36.2 stehen in `docs/archiv/STAND-LANGFASSUNG.md`.

1. **Gold-Gleichgewicht:** umsetzen und testen, nicht zu viel regulieren (Tobias, Chat 18). Stellschrauben: Theken-Tempo je Level und Preise (`data/shop.js`). Zuletzt (Chat 25): Der schnelle Start mit 500 Gold „fühlt sich sehr gut an“. Rechenwerkzeug (v0.44.0): Die Aufträge bezahlen den Aufstieg fast allein, nach etwa 443.000 Gold gibt es nichts mehr zu kaufen – Level 14–18 brauchen neue Ausgaben.
2. **Platzhalter-Zahlen** (Aufstiegspreise, Auftragsmengen, Baukosten; Fläche je Seite seit v0.42.0 170 → 500 → 2.000): beim Spielen feinjustieren, mit `ZAHLEN.md` nachrechnen.
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

### v0.44.1 – Entwurf Level 14 „Die Tinktur“ (23.11.2026, nur Doku)

- **Tobias (Chat 27):** Level 13 beendet, Platz zu 70 % gefüllt; die neue Ausgabe für Gold erst mit Level 15 und der Fläche; „Plane gerne alles und stell es mir dann vor“.
- **Claudes Entwurf** (`PLAENE.md`): Mörser (Zimmerei, 1 Steinplatte + 3 Holzstäbe, 10 s, 29 Gold), Tinktur (Apotheke, 1 Fläschchen + 1 Kräutermischung, 30 s, 346 Gold); Aufträge von Klara, Grete und Agnes (12.761 Gold, ×1,2); Aufstieg 12.500. Wartet auf Tobias' OK.

### v0.44.0 – Rechenwerkzeug für die Zahlen (23.11.2026)

- **Warum (Tobias, Chat 27):** „das Rechenwerkzeug hat mir noch gefehlt, damit wir alles im GLeichgewicht behalten können“; gemahlenes Glas heißt **Kristallsand**.
- **Umgesetzt:** `node tools/zahlen.mjs` schreibt `docs/inhalte/ZAHLEN.md` – je Level Aufträge, Rohstoffe, Maschinenzeit, Engpass, Aufstieg, Theken, neue Gebäude; je Ware Wert, Aufschlag, Gold je Stunde; wofür man Gold ausgibt. Ein Test hält die Seite aktuell. Am Spiel ändert sich nichts.
- **Wichtigste Stellen:** Aufstieg kaum eine Hürde; nach etwa 443.000 Gold gibt es nichts mehr zu kaufen; ab Level 9 je Level ×1,1–1,3; Engpass Beete bzw. Rohstoff-Gebäude; lange Ketten lohnen (Einzelheiten in `PLAENE.md`).

### v0.43.5 – Techbaum angenommen, Entwurf Rechenwerkzeug (23.11.2026, nur Doku)

- **Tobias (Chat 27):** „Mir gefällt der neue Plan viel besser können wir auch gerne so umsetzen.“ Feuer A („einfach aus dem Warenlager rausnehmen“), Namen „deutlich besser“, ohne Fermentieren; neuer Platz schon ab Level 15; „Sternensand“ gefällt ihm noch nicht ganz.
- **Claude:** Techbaum in `AUSBLICK.md`; Glas mahlt besser der Steinmetz (Namen später); Entwurf Rechenwerkzeug v0.44.0 in `PLAENE.md`, wartet auf Tobias' OK.
