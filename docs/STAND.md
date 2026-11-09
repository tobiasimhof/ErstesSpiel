# Stand

> Zu Beginn jedes Chats lesen (zusammen mit `docs/SPIEL.md`). Wird bei jeder Version aktualisiert: Status, offene Fragen und die **letzten 3 Arbeitsschritte** (der neueste oben; der älteste fällt weg – vollständig steht jeder Schritt im Archiv).

| | |
|---|---|
| **Aktuelle Version** | v0.18.3 – Balance bleibt, oberste Regel (nur Doku) |
| **Phase** | M2 – Produktionsketten (Kräuter-Kapitel ab Level 7) |
| **Spielen (live)** | https://tobiasimhof.github.io/ErstesSpiel/ |
| **Nächster Schritt** | Tobias spielt weiter (Eisen ausbauen, Kräuterstube ausprobieren); die Balance bleibt, wie sie ist. Den nächsten Bau-Schritt wählt Tobias aus den möglichen nächsten Schritten (unter dem Fahrplan); Claude stellt ihn vor und programmiert erst nach Tobias' OK. |

**Tobias' Fabrik** (Screenshot vom 09.11.2026, ca. 1 Stunde in Echtzeit gespielt, 6.036 Gold): Level 8. Links zwei gleiche Holz-Stein-Straßen (je 3 Holzfällerlager → Sägewerk, 3 Steinbrüche → Steinmetz, Zimmerei, Lagerhäuser als Zwischenlager). Oben 2 Holzfällerlager → Sägewerk, 5 Schmelzhütten → 5 Schmieden, 3 Steinbrüche → Steinmetz; darunter Zimmerei, 2 Feinschmieden und 1 Schlosserei (nur Vorhängeschlösser), jede Ausgabe endet in einem Lagerhaus. Unten 3 Beete, 2 Erntebänke, Webstube und Kräuterstube. Zimmerei und eine Feinschmiede warten auf Eisenstangen. Er spielt auf dem Tablet und nutzt für Aufträge den Test-Knopf.

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

**Mögliche nächste Schritte** (Tobias wählt): Warenbilder in der Bauleiste (offene Frage 1), Level 9 mit der dritten Pflanze (hinten angestellt), Weiche mit Filter (Frage 5), Verbesserungen mit Erfahrung (Frage 7).

## Offene Fragen

1. **Bauleiste (seit v0.18.0 mit Reitern):** Tobias: „Die Übersicht gefällt mir viel besser.“ Sein ursprünglicher Punkt war auch, dass man nicht direkt sieht, was welche Maschine macht – sollen die Gebäude in der Bauleiste zusätzlich ihre Waren als kleine Bilder zeigen (z. B. Sägewerk → Holzplatte, Holzstab)? Reiter „Kräuter“ oder lieber „Pflanzen“?
2. **Kräuterstube mit 2 Eingängen** ist gebaut und angeschlossen (v0.18.2), Tobias' Urteil steht noch aus.
3. **Platzhalter-Zahlen:** Aufstiegspreise, Auftragsmengen, Baukosten. Kostet der Laden-Ausbau später zusätzlich Waren? Begrenzt das Level die kaufbare Fläche?
4. **Weltgröße:** Reichen 38 × 30 Felder für die Masse der höheren Level, oder gibt es später mehr Fläche (`perSide` in `data/land.js`)?
5. **Weiche mit Filter** (Claudes Idee): ein Band-Feld, das eine Ware abzweigt und den Rest geradeaus schickt. Tobias' Problem mit gemischten Bändern spricht dafür – will er das, und wann?
6. **Eiserner Bestand:** Ein Mindestbestand im Laden-Lager, den die Theken nicht anrühren? Nur, wenn Tobias das möchte.
7. **Verbesserungen mit Erfahrung** (Tobias' Idee, noch offen): z. B. schneller verarbeiten, schnellere Bänder, größerer Rohstoff-Vorrat. Das Spiel zählt alle Erfahrung mit (`xpTotal`, auch die vom Test-Knopf).
8. **Laden-Lager über der Grenze:** Abreißen gibt Waren auch über die Grenze zurück (Tobias hatte 1.500 bei 1.000 Plätzen); bis wieder Platz ist, nimmt das Versandportal nichts an. Für Tobias in Ordnung – beobachten.
9. **Claudes Lesarten**, die Tobias jederzeit ändern kann (je eine Zahl in `data/shop.js`): Laden-Lager 1.000 erst ab Level 4; mittlere Theken ab Level 4, große ab Level 5.
10. **Einstieg:** Tobias' Idee, am Anfang vor allem die Massenproduktion auszubauen – später austesten.
11. **Pleiteschutz:** Ein Rohstoff ohne passendes Gebäude verhindert das Geschenk – bewusst so gelassen, beobachten.
12. **Vor v1.0:** Test-Knopf entfernen (`QUEST_TEST_SKIP = false`). Später: Schwarzmarkt und verbundene Läden (M5), Arbeitstitel.

## Die letzten 3 Arbeitsschritte

### v0.18.3 – Balance bleibt, oberste Regel (09.11.2026, nur Doku)

- **Tobias wählt Option A:** „Alles ist gut so, wie es aktuell ist.“ Mehr Eisen bauen ist klar, aber nicht alles auf einmal, weil das Gold fehlt – „das Balancing zwischen Gold verdienen und Rohstoffe nachkaufen [finde ich] sehr gut“. Der Theken-Verkauf gefällt ihm: „Wer mehr verdienen will, muss teurere Sachen anbieten.“ Massenproduktion steht im Vordergrund; so entstehen mehrere Spielstile.
- **Neue oberste Regel in `CLAUDE.md`:** Claude programmiert nie ohne Tobias' Erlaubnis, sondern stellt immer erst vor, was programmiert werden soll; dann setzen sie es gemeinsam um.
- Offene Frage 3 (Balance) erledigt und als Entscheidung ins Archiv; die übrigen Fragen sind neu nummeriert. Spiel unverändert, nur die Versionsnummer steigt.

### v0.18.2 – Feedback nach einer Stunde Spielen (09.11.2026, nur Doku)

- **Tobias:** Eine Stunde im normalen Tempo gespielt, „langsam immer stetiger wachsen“. Er blieb am Ball, weil er alle Fabriken mit Rohstoffen füllen wollte – das klappt jetzt gut, nur Eisen könnte besser sein. Beim Auffüllen ging er jedes Mal fast pleite und musste warten, bis genug verkauft war (jetzt 6.000 Gold, mit Eisen wieder fast 0). „Es macht Spaß“, die Kräuter kommen langsam dran. Er muss mehr Eisen bauen, weil die Schlosserei nur ein Produkt herstellt – „man wird nicht reich, aber man kommt langsam voran“.
- **Claude:** Rechnung zum Eisen und Tipps (im Gesprächsprotokoll); Vorschlag A: nichts ändern und die Kräuter ausprobieren (sonst B Eisen-Balance, C Planungshilfe). Tobias wählt A (v0.18.3).
- Spiel unverändert, nur die Versionsnummer steigt.

### v0.18.1 – Doku neu geordnet (09.11.2026, nur Doku)

- **Tobias:** Die README ist sehr lang und verbraucht zu Beginn jedes Chats viel Kontext. Wunsch: eine Datei, in der jeder Arbeitsschritt dokumentiert wird, eine Historie, eine Datei für die letzten Arbeitsschritte und eine grobe Zusammenfassung des Spiels – erst das Repo klären, dann weiter am Spiel. „Das Spielprinzip ist ja klar und wir müssen die Basis eigentlich nur erweitern.“
- **Umgesetzt** (Claudes Vorschlag, Tobias: „Ja, setze es bitte genauso um“): `README.md` ist nur noch eine kurze Startseite. Neu: `docs/STAND.md` (diese Datei), `docs/SPIEL.md` (das Spiel, wie es heute ist), `docs/TECHNIK.md`, und im Archiv `docs/archiv/` wörtlich die alten Abschnitte: `PLAENE.md`, `ENTSCHEIDUNGEN.md`, `VERSIONEN.md`, `GESPRAECHE.md` sowie `KONZEPT-VERLAUF.md` (Konzept mit Verlauf, Tobias' ursprünglicher Techbaum, alte offene Fragen). Regeln und Arbeitsablauf stehen jetzt in `CLAUDE.md`. Zu Beginn eines Chats liest Claude nur noch `CLAUDE.md`, `STAND.md` und `SPIEL.md` (etwa 33 KB statt 280 KB, rund ein Achtel).
- Spiel unverändert, nur die Versionsnummer steigt.
