# Stand

> Zu Beginn jedes Chats lesen (zusammen mit `docs/SPIEL.md`). Wird bei jeder Version aktualisiert: Status, offene Fragen und die **letzten 3 Arbeitsschritte** (der neueste oben; der älteste fällt weg – vollständig steht jeder Schritt im Archiv).

| | |
|---|---|
| **Aktuelle Version** | v0.18.5 – Plan: übersichtliches Infofenster (nur Doku) |
| **Phase** | M2 – Produktionsketten (Kräuter-Kapitel ab Level 7) |
| **Spielen (live)** | https://tobiasimhof.github.io/ErstesSpiel/ |
| **Nächster Schritt** | v0.19.0 „Übersichtliches Infofenster und Reiter ‚Erde‘“ (Plan in `docs/archiv/PLAENE.md`, Vorschaubilder im Chat gezeigt). Claude programmiert, sobald Tobias den Entwurf freigibt. |

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

**Mögliche nächste Schritte** (Tobias wählt): Übersichtliches Infofenster (offene Frage 1, gewählt), Level 9 mit der dritten Pflanze (hinten angestellt), Weiche mit Filter (Frage 5), Verbesserungen mit Erfahrung (Frage 7).

## Offene Fragen

1. **Infofenster (v0.19.0, geplant):** Passt der Entwurf (oben „Stellt gerade her“ mit Bildern, darunter „Umstellen auf“, Knöpfe kleiner)? Die Bauleiste bleibt ohne Warenbilder, der Reiter „Kräuter“ heißt „Erde“. Später vielleicht: Maschinen zeigen auf der Karte, was sie herstellen.
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

### v0.18.5 – Plan: übersichtliches Infofenster (09.11.2026, nur Doku)

- **Tobias:** Variante B, aber in der Bauleiste nur Symbol, Name und Kosten – keine Waren. „Pflanzenkunde“ zu lang, „Pflanzen“ klingt komisch → Reiter „Erde“. Stattdessen das Infofenster beim Antippen übersichtlicher: oben, was gerade hergestellt wird und was man dafür braucht, darunter, was die anderen Einstellungen kosten – „dann prägt man sich das auch besser ein“. „Ansonsten hast du mein Go.“
- **Claude:** Vorschaubilder fürs neue Infofenster (Feinschmiede, Holzfällerlager; Tablet und Handy); Plan für v0.19.0 in `docs/archiv/PLAENE.md`. Weil der Entwurf neu ist, wartet Claude nach der obersten Regel auf Tobias' OK.
- Spiel unverändert, nur die Versionsnummer steigt.

### v0.18.4 – Plan: Warenbilder in der Bauleiste (09.11.2026, nur Doku)

- **Tobias:** „Gerne Punkt 1“; der Reiter „Kräuter“ darf „Pflanzen“ oder „Pflanzenkunde“ heißen. Frage: Wie kann man die Gebäude darstellen – einfach das Warenbild vom Band, nur etwas größer?
- **Claude:** Ja, genau so machen es Fabrikspiele – eine Ware sieht überall gleich aus. Vorschaubilder für Tablet und Handy: Variante B (Waren in eigener Zeile, empfohlen), C (Waren als Hauptbild); A passt nicht. Gebäude-Emojis bleiben vorerst, eigene Gebäudebilder in M4. Plan in `docs/archiv/PLAENE.md`. Tobias' Wahl steht aus.
- Spiel unverändert, nur die Versionsnummer steigt.

### v0.18.3 – Balance bleibt, oberste Regel (09.11.2026, nur Doku)

- **Tobias wählt Option A:** „Alles ist gut so, wie es aktuell ist.“ Mehr Eisen bauen ist klar, aber nicht alles auf einmal, weil das Gold fehlt – „das Balancing zwischen Gold verdienen und Rohstoffe nachkaufen [finde ich] sehr gut“. Der Theken-Verkauf gefällt ihm: „Wer mehr verdienen will, muss teurere Sachen anbieten.“ Massenproduktion steht im Vordergrund; so entstehen mehrere Spielstile.
- **Neue oberste Regel in `CLAUDE.md`:** Claude programmiert nie ohne Tobias' Erlaubnis, sondern stellt immer erst vor, was programmiert werden soll; dann setzen sie es gemeinsam um.
- Offene Frage 3 (Balance) erledigt und als Entscheidung ins Archiv; die übrigen Fragen sind neu nummeriert. Spiel unverändert, nur die Versionsnummer steigt.
