# Stand

> Zu Beginn jedes Chats lesen (zusammen mit `docs/SPIEL.md`). Wird bei jeder Version aktualisiert: Status, offene Fragen und die **letzten 3 Arbeitsschritte** (der neueste oben; der älteste fällt weg – vollständig steht jeder Schritt im Archiv).

| | |
|---|---|
| **Aktuelle Version** | v0.19.0 – Übersichtliches Infofenster und Reiter „Erde“ |
| **Phase** | M2 – Produktionsketten (Kräuter-Kapitel ab Level 7) |
| **Spielen (live)** | https://tobiasimhof.github.io/ErstesSpiel/ |
| **Nächster Schritt** | Tobias spielt mit dem neuen Infofenster weiter (Eisen ausbauen, Kräuterstube ausprobieren) und gibt Feedback. Danach wählen wir gemeinsam den nächsten Schritt; Claude stellt ihn vor und programmiert erst nach Tobias' OK. |

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

**Mögliche nächste Schritte** (Tobias wählt): Maschinen zeigen auf der Karte, was sie herstellen (Frage 1), Level 9 mit der dritten Pflanze (hinten angestellt), Weiche mit Filter (Frage 5), Verbesserungen mit Erfahrung (Frage 7).

## Offene Fragen

1. **Infofenster (seit v0.19.0):** Wie spielt es sich? Idee für danach: Maschinen zeigen auf der Karte klein, was sie gerade herstellen (z. B. welche Schmiede Bleche, welche Stangen macht). Beet, Lagerhaus und Versandportal zeigen noch Textzeilen – auch mit Bildern?
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

### v0.19.0 – Übersichtliches Infofenster und Reiter „Erde“ (09.11.2026)

- **Warum (Tobias, Chat 14):** Beim Antippen eines Gebäudes sah er „nur eine Menge an Informationen“. Oben soll stehen, was gerade hergestellt wird und was dafür fehlt, darunter, was die anderen Einstellungen kosten – „dann prägt man sich das auch besser ein“. Keine Warenbilder in der Bauleiste; „Pflanzenkunde“ zu lang, „Pflanzen“ klingt komisch → „Erde“.
- **Umgesetzt:** Status unter dem Namen; grüner Kasten „Stellt gerade her“ mit den Warenbildern vom Band (hat / braucht, fehlend rot) → Ergebnis; „Umstellen auf“ mit jedem anderen Rezept als Knopf (ersetzt Rezept-Knöpfe und Textliste); Rohstoff-Gebäude mit Vorrat als Bildern, „Auffüllen“ groß, „Einlegen“ und „Kaufen“ klein; Verschieben, Drehen, Abreißen klein in einer Zeile; kurzer Tipp statt langer Beschreibung; Reiter „Erde“. Lange Namen brechen um.
- **Tobias** (zum Entwurf): „Sieht sehr übersichtlich aus und ansprechend.“ Sein Urteil im Spiel steht aus.

### v0.18.5 – Plan: übersichtliches Infofenster (09.11.2026, nur Doku)

- **Tobias:** Variante B, aber in der Bauleiste nur Symbol, Name und Kosten – keine Waren. „Pflanzenkunde“ zu lang, „Pflanzen“ klingt komisch → Reiter „Erde“. Stattdessen das Infofenster beim Antippen übersichtlicher: oben, was gerade hergestellt wird und was man dafür braucht, darunter, was die anderen Einstellungen kosten – „dann prägt man sich das auch besser ein“. „Ansonsten hast du mein Go.“
- **Claude:** Vorschaubilder fürs neue Infofenster (Feinschmiede, Holzfällerlager; Tablet und Handy); Plan für v0.19.0 in `docs/archiv/PLAENE.md`. Weil der Entwurf neu ist, wartet Claude nach der obersten Regel auf Tobias' OK.
- Spiel unverändert, nur die Versionsnummer steigt.

### v0.18.4 – Plan: Warenbilder in der Bauleiste (09.11.2026, nur Doku)

- **Tobias:** „Gerne Punkt 1“; der Reiter „Kräuter“ darf „Pflanzen“ oder „Pflanzenkunde“ heißen. Frage: Wie kann man die Gebäude darstellen – einfach das Warenbild vom Band, nur etwas größer?
- **Claude:** Ja, genau so machen es Fabrikspiele – eine Ware sieht überall gleich aus. Vorschaubilder für Tablet und Handy: Variante B (Waren in eigener Zeile, empfohlen), C (Waren als Hauptbild); A passt nicht. Gebäude-Emojis bleiben vorerst, eigene Gebäudebilder in M4. Plan in `docs/archiv/PLAENE.md`. Tobias' Wahl steht aus.
- Spiel unverändert, nur die Versionsnummer steigt.
