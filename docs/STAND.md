# Stand

> Zu Beginn jedes Chats lesen (zusammen mit `docs/SPIEL.md`). Kurz halten: Status, Tobias' Fabrik, nächste Schritte, offene Fragen als kurze Zeilen und die **letzten 3 Arbeitsschritte** (der neueste oben; der älteste fällt weg). Einzelheiten und Zitate stehen im Archiv (`docs/archiv/`, die alte Langfassung bis v0.36.2 in `STAND-LANGFASSUNG.md`).

| | |
|---|---|
| **Aktuelle Version** | v0.54.2 – Tobias' Antworten zum Entwurf Level 15 (nur Doku; Spiel wie v0.54.0) |
| **Phase** | Design und Grafik vorerst abgeschlossen (Tobias, Chat 30); M2 – Produktionsketten: Level 1–14 im Spiel, 15–18 als Gerüst |
| **Spielen (live)** | https://tobiasimhof.github.io/ErstesSpiel/ |
| **Nächster Schritt** | **v0.55.0 – Level 15 „Der alte Magier“** (angenommen mit Änderungen, Chat 31; Entwurf und Antworten in `PLAENE.md` oben): Zauberkessel mit Feuerfach, Traumtrank aus 1 Tinktur + 5 Kamillenblüten, Mörser aus 5 Holzstäben, Aufträge, Aufstieg 15.000, 4. Flächenstreifen für 10.000; Herauszoomen nur, wenn es einfach geht. |

**Tobias' Fabrik (3D) – Level 14, alle Aufträge erledigt** (Chat 31, Bild: 36.904 Gold, Laden-Lager 1.109 / 1.100 nach 1 von 10 Ausbauten, viele rote Lichter) – danach gibt es keinen Inhalt mehr. Die 2D-Welt ist seit v0.54.0 entfernt (Tobias: „das 3D game, das eigentliche Game“). Level 13 (Chat 27; 26.095 Gold, 60 Bilder/s bei voller Fabrik): Platz „zu ca. 70% sinnvoll gefüllt“, größere Straßen werden schwierig; das Gold häuft sich mit Waren, die er noch nicht weiterverarbeiten kann. Gebremst haben ihn in den Kräuter-Leveln fehlende Teile für Gebäude. Baustoffe laufen alle automatisch; viele Zahnradwellen für Erntebänke und Webstuben zu brauchen, „passt mir das GLeichgewicht bis hier hin sehr gut“. Kräuter (Chat 27): „mit mehreren Erntebänken gelöst, die an der Seite immer ihre Ware mit einschieben“; Heilverbände und Wundverbände brauchen zwei Kräuterstuben – „das finde ich eigentlich recht gut“. „Aktuell habe ich noch keine Probleme, weil die Bänder noch einen sehr "einseitigen" Weg haben und ich die Produktion nur umstellen muss statt ganze Produktionsstätten zu verschieben.“

Frühere Stände der 2D-Fabrik (Level 8, 10, 11 mit Zitaten; zuletzt Level 13) in `docs/archiv/STAND-LANGFASSUNG.md`.

## Fahrplan

| | Meilenstein | Inhalt |
|---|---|---|
| M0, M1 | Planung, Fabrik-Grundgerüst | erledigt |
| **M2** | **Produktionsketten** | **jetzt:** Werkzeuge (1–6) und Kräuter (7–12) fertig, Tränke ab Level 13 |
| M3 | Wirtschaft & Fortschritt | Nachfrage und Trends, Laden-Ausbau mit Waren, evtl. Freischaltpunkte |
| M4 | Optik & Gefühl | vorerst abgeschlossen (Chat 30): 3D, Häuser, Waren, Oberfläche, Ladebildschirm, Schriftrolle, Einführung; offen: Klänge, Animationen, Rückseiten, Stadt |
| M5–M7 | Online, Clans & Handel, App | Spielerkonto, Schwarzmarkt, Clans, Android und iOS |

**Nächste Schritte** (jeder erst nach Tobias' OK):

- **Erledigt seit Chat 25** (Einzelheiten in `PLAENE.md`): v0.39.0–v0.54.0 (Belastungstest, Level 14, Kenney-Oberfläche, Ladebildschirm, Schriftrolle, Einführung, Feinschliff, ein Spiel ohne 2D-Welt). **Jetzt:** Level 15.
1. **Tränke-Kapitel** (angenommen, Chat 27; Tabelle in `docs/inhalte/AUSBLICK.md`): 14 Die Tinktur (Mörser, Tinktur), 15 Der alte Magier (Zauberkessel, Traumtrank), 16 Die Kräutermühle (Heilpuder, Heiltrank), 17 Die Sternwarte (Linse, Fernrohr, Sternensand), 18 Die Zauberei (Farn, Lebens- und Manatrank). Feuer im Kessel von Hand (A); mehr Fläche ab Level 15; einzige Rezeptänderung: Mörser aus 5 Holzstäben (Tobias, Chat 31). Gemahlenes Glas: **Kristallsand** (Tobias), im Steinmetz. Leitlinie: alte Maschinen bekommen neue Funktionen, neue nur, wo es Sinn ergibt.
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
6. **Verbesserungen mit Erfahrung** (später): schneller verarbeiten, schnellere Bänder, mehr Kundschaft; `xpTotal` zählt schon mit.
7. **Laden-Lager über der Grenze:** Abreißen und Ausräumen dürfen es überfüllen – für Tobias in Ordnung, beobachten.
8. **Claudes Lesarten** zu Level 9–13 (Mengen, Zeiten, Baukosten), die Tobias jederzeit ändern kann – Liste in der Langfassung.
9. **Einstieg:** am Anfang vor allem die Massenproduktion ausbauen – später austesten.
10. **Pleiteschutz:** Ein Rohstoff ohne passendes Gebäude verhindert das Geschenk – beobachten.
11. **Vor v1.0:** Test-Knopf entfernen (`QUEST_TEST_SKIP = false`). Später: Schwarzmarkt, verbundene Läden, Arbeitstitel.
12. **Anderen das Spiel zeigen:** geht seit v0.22.0 (eigene Geräte oder sichern → neues Spiel → laden; seit v0.50.0 mit eigenem Namen, seit v0.52.0 mit Hildes Einführung).
13. **Techbaum:** Werkzeuge, Kräuter und Tränke wachsen parallel; höchstens 2 Eingänge je Maschine; jedes Produkt entsteht logisch aus seinen Zutaten.
14. **Grafik:** entschieden – frei drehbar, Mittelalter, Spiel-Farben, eigene Häuser je Gebäude; von weitem nur Statuslichter (Vorschlag A, Chat 25). Mix aus Modern und Mittelalter: entschieden – Möglichkeit B, Mittelalter mit ein paar Technik-Teilen (Zahnräder in Messing und Stahl, später Glasrohre), sparsam, ohne Greifarm (Chat 26). Offen für später: Rückseiten der Häuser unterscheidbar machen (Chat 27). Oberfläche: Kenneys UI Pack Adventure, Rahmen B mit Eisenbeschlägen, schlicht (Chat 28). Klänge: Das Paket gefällt Tobias nicht, er spielt mit Sound auf 0 (Chat 29) – andere Klänge oder Fabrik-Geräusche, später.
15. **Titel:** Richtung „Factory“; „Flussfactory“, „Zunft-Factory“, „Medieval Factory“ gefallen Tobias nicht – bis dahin Platzhalter „Factory“ auf dem Ladebildschirm.
16. **Herauszoomen in 3D** (v0.54.0): Die größte Welt passt ganz herausgezoomt nicht ganz aufs Tablet. Tobias: Die ganze Welt soll draufpassen, „steht aber jetzt nicht an oberster Stelle“ – mit v0.55.0, wenn es einfach geht.
17. **Neue Ausgaben fürs Gold:** „Zauber des Magiers“ festgehalten (`AUSBLICK.md`), später genauer durchdenken (Tobias, Chat 31).
18. **Dunkle Fenster auf Tobias' Tablet** (Bild, Chat 31): Fenster und Leisten erscheinen dunkel statt hell – vermutlich der Dunkelmodus des Browsers. Immer hell anzeigen? – Tobias fragen. Dazu: Laden-Lager übervoll, viele rote Lichter (blockiert) – Hinweis an Tobias.

## Die letzten 3 Arbeitsschritte

### v0.54.2 – Tobias' Antworten zum Entwurf Level 15 (25.11.2026, nur Doku)

- **Tobias:** Kessel und Feuerfach passen, Namen passen, 4. Streifen für 10.000 „ist super“; Traumtrank aus 1 Tinktur + 5 Blüten, Mörser aus 5 Holzstäben („damit wir irgendwo dieses Gleichgewicht behalten“); ganze Welt aufs Tablet „nicht an oberster Stelle“; Zauber fürs Gold festhalten. Bild: Level 14, 36.904 Gold.
- **Claude:** neu gerechnet (Traumtrank 547, Mörser 43, Aufträge Level 15: 16.066 Gold) in `PLAENE.md`; Zauber in `AUSBLICK.md`; Hinweise: dunkle Fenster, Laden-Lager voll. **Offen:** Umsetzung v0.55.0.

### v0.54.1 – Entwurf Level 15 „Der alte Magier“ (25.11.2026, nur Doku)

- **Tobias:** Herauszoomen „bisher okay“, mit Level 15 wieder prüfen; „deswegen können wir gerne mit level 15 anfangen“.
- **Claude:** Entwurf v0.55.0 in `PLAENE.md` mit Zahlen aus dem Rechenwerkzeug: Zauberkessel (Reiter Stein, Feuerfach 100 Holzkohle, 5 je Trank), Traumtrank (Tinktur + 3 Kamillenblüten, 499 Gold), Magier Ambrosius und Wirt Hannes, 4 Aufträge (15.202 Gold), Aufstieg 15.000, 4. Flächenstreifen für 10.000 (bis 54 × 46), Herauszoomen; Idee „Zauber des Magiers“ als neue Ausgabe fürs Gold. **Offen:** 5 Fragen.
