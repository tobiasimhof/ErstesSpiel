# Stand

> Zu Beginn jedes Chats lesen (zusammen mit `docs/SPIEL.md`). Wird bei jeder Version aktualisiert: Status, offene Fragen und die **letzten 3 Arbeitsschritte** (der neueste oben; der älteste fällt weg – vollständig steht jeder Schritt im Archiv).

| | |
|---|---|
| **Aktuelle Version** | v0.21.4 – Frage zum Gold-Gleichgewicht (nur Doku) |
| **Phase** | M2 – Produktionsketten (Kräuter-Kapitel ab Level 7) |
| **Spielen (live)** | https://tobiasimhof.github.io/ErstesSpiel/ |
| **Nächster Schritt** | Tobias beantwortet die Fragen zum Gold-Gleichgewicht (offene Frage 14) und die 4 Fragen zum Entwurf v0.22.0 „Spielstand sichern und laden“ (offene Frage 1) und gibt sein OK. Claude programmiert erst nach seinem OK. |

**Tobias' Fabrik** (Screenshots vom 11.11.2026): Level 8, ganze Fläche gekauft (38 × 30), **43.870 Gold**, Laden-Lager 1.004 / 1.000, Waren im Wert von **166.579 Gold** (u. a. 61 Zahnradwellen, 69 Räderwerke, 70 Verstärkte Holzplatten, 38 Gewichtsteine). Er spielt seit einigen Versionen auf Level 8 weiter, ohne Aufträge, um zu testen, ob eine Fabrik, die **jede Ware mindestens einmal** herstellt, auf die Fläche passt: Sie passt (alles außer der Pflanzenreihe in voller Größe), rechts und unten in der Mitte ist noch Platz frei. Etwa 8 Holzfällerlager, 9 Steinbrüche, 7 Schmelzhütten, 6 Schmieden, 3 Sägewerke, 3 Steinmetze, 3 Zimmereien, 3 Feinschmieden (Scharnier, Schlüssel, Zirkel), 3 Schlossereien, 5 Beete, 2 Erntebänke, Webstube, Kräuterstube; jede Ausgabe endet in einem Lagerhaus. **Versandportale baut er nicht** – volle Lagerhäuser räumt er von Hand aus oder füllt damit das Lagerhaus einer anderen Straße. Er spielt auf dem Tablet und nutzt für Aufträge den Test-Knopf.

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

**Nächste Schritte** (der Reihe nach; Auswahl von Tobias in Chat 15, Reihenfolge von Claude vorgeschlagen; jeder Schritt erst nach Tobias' OK):

1. **v0.22.0 Spielstand sichern und laden** – Entwurf in `docs/archiv/PLAENE.md`. Zuerst beantwortet Tobias die 4 Fragen (offene Frage 1). Soll fertig sein, bevor Tobias das Spiel zeigt (frühestens ab 16.11.2026).
2. **Was Tester brauchen** – steckt größtenteils in v0.22.0 (Tester auf Tobias' Tablet: sichern → neues Spiel → Tester spielt → laden); Testmodus und Test-Knopf für Tester ausblenden? Eine kurze Einführung bleibt im Hinterkopf (M4) (offene Frage 13).
3. **Bereich kopieren** (Tobias: „sehr wichtig“) – einen markierten Bereich als Ganzes noch einmal bauen, wenn die Waren reichen (Tobias baut gleiche Straßen mehrfach). Plan noch zu machen.
4. **Weiche** (Tobias: „sehr sinnvoll“, offene Frage 5) – trennt eine Spur in zwei (hier nur Stäbe, dort nur Bleche). Plan noch zu machen.
5. **Gold-Gleichgewicht** (Tobias, Chat 17, offene Frage 14) – Claudes Einordnung und Möglichkeiten in `docs/archiv/PLAENE.md`; der Schritt wird nach Tobias' Antwort eingeordnet, spätestens vor Level 9 (das braucht ohnehin einen Aufstiegspreis).
6. **Später:** Verbesserungen mit Erfahrung (Frage 7), Level 9 (dritte Pflanze), gründliche Durchsicht des Codes.

Abgelehnt: „Umlagern“, „Alle auffüllen“, Fabrik-Übersicht pro Minute, Ring pro Stück bei Rohstoff-Gebäuden.

## Offene Fragen

1. **Spielstand sichern und laden** (Entwurf v0.22.0, ausführlich in `docs/archiv/PLAENE.md`): Im Menü ☰ „💾 Spielstand sichern“ (eine kleine Datei) und „📂 Spielstand laden“ (Vorschau mit Level, Gold, Gebäuden und Datum, dann Rückfrage); bei „Neues Spiel“ zuerst „Erst sichern?“. So können Tester auch auf Tobias' Tablet spielen: sichern → neues Spiel → Tester spielt → laden. Fragen an Tobias: Passt das? Datei in „Downloads“ oder über das Teilen-Menü (WhatsApp, E-Mail, Drive)? Sollen Tester Testmodus und Test-Knopf sehen? Läuft die Fabrik nach dem Laden ab dem Sicherungszeitpunkt nach (wie „Willkommen zurück“)?
2. **Kräuterstube mit 2 Eingängen** ist gebaut und angeschlossen (v0.18.2), Tobias' Urteil steht noch aus.
3. **Platzhalter-Zahlen:** Aufstiegspreise, Auftragsmengen, Baukosten. Kostet der Laden-Ausbau später zusätzlich Waren? Begrenzt das Level die kaufbare Fläche?
4. **Weltgröße:** Reichen 38 × 30 Felder für die Masse der höheren Level, oder gibt es später mehr Fläche (`perSide` in `data/land.js`)? Tobias' Test (Chat 17): Eine Fabrik, die jede Ware bis Level 8 mindestens einmal herstellt, passt hinein, rechts und unten in der Mitte ist noch Platz. Sein Urteil steht aus.
5. **Weiche** (von Tobias gewünscht, Chat 15): trennt eine Spur in zwei, „sodass man sagen kann, hier laufen nur Stäbe und hier nur Bleche“ – damit die Produktionsstraßen länger werden. Noch zu planen: eigenes Gebäude oder Band-Feld, wie man die Ware je Ausgang einstellt, was mit Waren passiert, die zu keinem Ausgang passen.
6. **Eiserner Bestand:** Ein Mindestbestand im Laden-Lager, den die Theken nicht anrühren? Nur, wenn Tobias das möchte.
7. **Verbesserungen mit Erfahrung** (Tobias' Idee; er will sie erst später einführen): z. B. schneller verarbeiten, schnellere Bänder, größerer Rohstoff-Vorrat. Das Spiel zählt alle Erfahrung mit (`xpTotal`, auch die vom Test-Knopf).
8. **Laden-Lager über der Grenze:** Abreißen und Ausräumen geben Waren auch über die Grenze zurück (Tobias hatte 1.500 bei 1.000 Plätzen); bis wieder Platz ist, nimmt das Versandportal nichts an. Lagerhäuser sind damit ein Zusatzlager (10 Lagerhäuser = 1.500 Plätze). Für Tobias in Ordnung – beobachten.
9. **Claudes Lesarten**, die Tobias jederzeit ändern kann (je eine Zahl in `data/shop.js`): Laden-Lager 1.000 erst ab Level 4; mittlere Theken ab Level 4, große ab Level 5.
10. **Einstieg:** Tobias' Idee, am Anfang vor allem die Massenproduktion auszubauen – später austesten.
11. **Pleiteschutz:** Ein Rohstoff ohne passendes Gebäude verhindert das Geschenk – bewusst so gelassen, beobachten.
12. **Vor v1.0:** Test-Knopf entfernen (`QUEST_TEST_SKIP = false`). Später: Schwarzmarkt und verbundene Läden (M5), Arbeitstitel.
13. **Anderen das Spiel zeigen** (Tobias, Chat 15): Er möchte den jetzigen Stand anderen zum Testen geben, ohne dass sein Spielstand verloren geht. Jedes Gerät hat seinen eigenen Spielstand – wer den Link auf seinem eigenen Gerät öffnet, beginnt ein neues Spiel und berührt Tobias' Fabrik nicht. Tobias (Chat 16): „Das können wir im Hinterkopf behalten, aber ich möchte frühestens nächste Woche jemandem das Spiel zeigen.“ Noch offen, rechtzeitig vor dem ersten Tester: eigene Geräte oder Tobias' Tablet (dann braucht es einen zweiten Spielstand)? Bei Level 1 anfangen oder Tobias' Fabrik laden? Kurze Einführung? „Spielstand sichern und mitnehmen“ bleibt als Sicherung sinnvoll.
14. **Gold-Gleichgewicht** (Tobias, Chat 17): Ist es in Ordnung, lange auf einem Level zu bleiben und so „unendlich Gold“ zu verdienen? Claudes Einordnung (ausführlich in `docs/archiv/PLAENE.md`): Heute lohnt sich das ohne Grenze. Gold fließt nur in Rohstoffe (kommen mit Gewinn zurück), Aufstiege und Fläche (zusammen bisher 14.850 Gold, einmalig); die Theken bremsen teure Waren nicht (Zirkel: bis 12.000 Gold pro Minute); alle Bremsen begrenzen nur, wie lange die Fabrik ohne einen läuft. Level 7/8 bringen beim Gold nicht mehr als Level 5/6. Möglichkeiten: A Aufstiege teurer, B Nachfrage (gleiche Ware wird billiger), C Kasse mit Obergrenze, D mehr, wofür man Gold ausgibt, E laufende Kosten (nicht empfohlen). Empfehlung: Farmen erlauben, Weiterspielen soll sich mehr lohnen – D + A zuerst, B als Bremse in M3. Fragen an Tobias: Soll Gold durchgehend knapp bleiben? Welche Bremse gefällt ihm? Wie viele Stunden hat er auf Level 8 gespielt? Reicht ihm der Platz?

## Die letzten 3 Arbeitsschritte

### v0.21.4 – Frage zum Gold-Gleichgewicht (11.11.2026, nur Doku)

- **Tobias (Chat 17):** Er spielt seit einigen Versionen auf Level 8 weiter, ohne Aufträge, und hat eine Fabrik gebaut, die jede Ware mindestens einmal herstellt (sie passt auf die Fläche); jetzt hat er 43.870 Gold und Waren für 166.579 Gold. „Ist das so in Ordnung, dass man quasi längere Zeit auf einem Level verbringt, um damit ‚unendlich Gold‘ zu generieren, oder wie können wir das steuern? … Viel Gold bedeutet viele Möglichkeiten.“
- **Claude:** nachgerechnet und eingeordnet, fünf Möglichkeiten mit Empfehlung (offene Frage 14, `docs/archiv/PLAENE.md`).
- Spiel unverändert, nur die Versionsnummer steigt.

### v0.21.3 – Grüner Ring für Rohstoff-Gebäude (11.11.2026)

- **Warum (Tobias, Chat 16):** Der Ring der Rohstoff-Gebäude zeigt, bis der Rohstoff leer ist, und bewegt sich langsam – neben den Maschinen sah das aus wie Stillstand. „Kreislauf zur Fertigung gelb und Kreislauf, bis etwas leer ist, evtl. grün, damit man das auch klarer erkennen kann.“
- **Umgesetzt:** Der Ring der Rohstoff-Gebäude ist grün, der der Maschinen bleibt gelb. Dazu die nächsten Schritte übersichtlich oben in dieser Datei (Tobias: „schreib die nächsten Schritte erstmal auf“).
- **Offen:** Tobias' Eindruck beim Spielen; weiter geht es in einem neuen Chat mit v0.22.0.

### v0.21.2 – Ring bleibt, Bilder pro Sekunde gemessen, Plan „Spielstand sichern“ (11.11.2026, nur Doku)

- **Tobias (Chat 16):** Der Ring der Rohstoff-Gebäude bleibt, wie er ist: „Ist tatsächlich besser so, dann weiß man ca., wann das Rohstoffgebäude leer ist.“ Mit Testmodus zeigt sein Tablet 60 bis 90 Bilder pro Sekunde – das Spiel läuft flüssig.
- **Claude:** Entscheidung und Messung festgehalten; Entwurf für v0.22.0 „Spielstand sichern und laden“ mit Fragen (offene Frage 1).
- Spiel unverändert, nur die Versionsnummer steigt.
