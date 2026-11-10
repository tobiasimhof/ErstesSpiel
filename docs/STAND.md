# Stand

> Zu Beginn jedes Chats lesen (zusammen mit `docs/SPIEL.md`). Wird bei jeder Version aktualisiert: Status, offene Fragen und die **letzten 3 Arbeitsschritte** (der neueste oben; der älteste fällt weg – vollständig steht jeder Schritt im Archiv).

| | |
|---|---|
| **Aktuelle Version** | v0.20.1 – Plan: Maschinen zeigen, was sie herstellen (nur Doku) |
| **Phase** | M2 – Produktionsketten (Kräuter-Kapitel ab Level 7) |
| **Spielen (live)** | https://tobiasimhof.github.io/ErstesSpiel/ |
| **Nächster Schritt** | Tobias wählt für „Maschinen zeigen, was sie herstellen“ Variante A (Schild in der Ecke) oder B (Produkt in der Mitte, Claudes Empfehlung) und beantwortet die Fragen dazu (offene Frage 1; Entwurf v0.21.0 in `docs/archiv/PLAENE.md`). Claude programmiert erst nach seinem OK. |

**Tobias' Fabrik** (Screenshot vom 09.11.2026, ca. 1 Stunde in Echtzeit gespielt, 6.036 Gold): Level 8. Links zwei gleiche Holz-Stein-Straßen (je 3 Holzfällerlager → Sägewerk, 3 Steinbrüche → Steinmetz, Zimmerei, Lagerhäuser als Zwischenlager). Oben 2 Holzfällerlager → Sägewerk, 5 Schmelzhütten → 5 Schmieden, 3 Steinbrüche → Steinmetz; darunter Zimmerei, 2 Feinschmieden und 1 Schlosserei (nur Vorhängeschlösser), jede Ausgabe endet in einem Lagerhaus. Unten 3 Beete, 2 Erntebänke, Webstube und Kräuterstube. Zimmerei und eine Feinschmiede warten auf Eisenstangen. Er spielt auf dem Tablet und nutzt für Aufträge den Test-Knopf. **Versandportale baut er nicht mehr** (er stellt nur noch teure Einzelteile her); läuft in einer der gespiegelten Straßen ein Lagerhaus voll (z. B. Zahnräder, weil die Holzstäbe nicht hinterherkommen), räumt er es aus und befüllt damit das Lagerhaus der anderen Straße (Chat 15).

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

**Mögliche nächste Schritte** (Tobias wählt; Claudes Vorschläge aus Chat 15, ausführlich in `docs/archiv/PLAENE.md`): zuerst Maschinen zeigen, was sie herstellen (Frage 1). Danach empfohlen: „Umlagern“ von Lagerhaus zu Lagerhaus, eine Fabrik-Übersicht (je Ware: hergestellt und verbraucht pro Minute), Spielstand sichern und auf ein anderes Gerät mitnehmen. Weitere: „Alle auffüllen“ (Frage 13), Bereich kopieren, Weiche mit Filter (Frage 5), erste Wirtschaft aus M3 (Nachfrage des Tages oder Sonderaufträge), Verbesserungen mit Erfahrung (Frage 7), Belastungstest mit großer Fabrik und Durchsicht des Codes, Level 9 (hinten angestellt).

## Offene Fragen

1. **Maschinen zeigen, was sie herstellen** (Entwurf v0.21.0, Vorschaubilder in Chat 15): Variante A (Gebäudebild bleibt groß, Produkt als Schild unten rechts) oder B (Produkt groß in der Mitte, Gebäudebild klein unten rechts – Claudes Empfehlung, weil es herausgezoomt lesbar bleibt)? Sollen auch Rohstoff-Gebäude ihr Produkt zeigen (Claude: ja, einheitlich; leer = blass)? Passt das gelbe „?“-Schild für fehlende Zutaten? Die neuen Infofenster (v0.19.0 und v0.20.0) findet Tobias übersichtlich.
2. **Kräuterstube mit 2 Eingängen** ist gebaut und angeschlossen (v0.18.2), Tobias' Urteil steht noch aus.
3. **Platzhalter-Zahlen:** Aufstiegspreise, Auftragsmengen, Baukosten. Kostet der Laden-Ausbau später zusätzlich Waren? Begrenzt das Level die kaufbare Fläche?
4. **Weltgröße:** Reichen 38 × 30 Felder für die Masse der höheren Level, oder gibt es später mehr Fläche (`perSide` in `data/land.js`)?
5. **Weiche mit Filter** (Claudes Idee): ein Band-Feld, das eine Ware abzweigt und den Rest geradeaus schickt. Tobias' Problem mit gemischten Bändern spricht dafür – will er das, und wann?
6. **Eiserner Bestand:** Ein Mindestbestand im Laden-Lager, den die Theken nicht anrühren? Nur, wenn Tobias das möchte.
7. **Verbesserungen mit Erfahrung** (Tobias' Idee, noch offen): z. B. schneller verarbeiten, schnellere Bänder, größerer Rohstoff-Vorrat. Das Spiel zählt alle Erfahrung mit (`xpTotal`, auch die vom Test-Knopf).
8. **Laden-Lager über der Grenze:** Abreißen und Ausräumen geben Waren auch über die Grenze zurück (Tobias hatte 1.500 bei 1.000 Plätzen); bis wieder Platz ist, nimmt das Versandportal nichts an. Lagerhäuser sind damit ein Zusatzlager (10 Lagerhäuser = 1.500 Plätze). Für Tobias in Ordnung – beobachten.
9. **Claudes Lesarten**, die Tobias jederzeit ändern kann (je eine Zahl in `data/shop.js`): Laden-Lager 1.000 erst ab Level 4; mittlere Theken ab Level 4, große ab Level 5.
10. **Einstieg:** Tobias' Idee, am Anfang vor allem die Massenproduktion auszubauen – später austesten.
11. **Pleiteschutz:** Ein Rohstoff ohne passendes Gebäude verhindert das Geschenk – bewusst so gelassen, beobachten.
12. **Vor v1.0:** Test-Knopf entfernen (`QUEST_TEST_SKIP = false`). Später: Schwarzmarkt und verbundene Läden (M5), Arbeitstitel.
13. **„Alle auffüllen“** (Claudes Idee): ein Knopf, der alle Rohstoff-Gebäude auf einmal füllt und vorher den Gesamtpreis zeigt. Passt das zu Tobias' Grundsatz „Nachlegen ist Handarbeit“, oder gehört das Antippen jedes Gebäudes zum Spiel? Denkbar auch als Verbesserung, die man sich mit Erfahrung verdient (Frage 7).

## Die letzten 3 Arbeitsschritte

### v0.20.1 – Plan: Maschinen zeigen, was sie herstellen (10.11.2026, nur Doku)

- **Tobias (Chat 15):** Die neuen Infofenster sehen gut aus, „jetzt ist alles übersichtlich dargestellt“. Auf der Karte sind die Waren an den Maschinen aber sehr klein – man kann nur erahnen, was gerade produziert wird. Er möchte einen Vorschlag dafür und weitere Vorschläge für die nächsten Schritte.
- **Claude:** Heute zeigt das kleine Schild nur, was einer Kombi-Maschine **fehlt**; was sie herstellt, steht nirgends auf der Karte. Vorschaubilder für zwei Varianten (A: Schild in der Ecke, B: Produkt in der Mitte – empfohlen), dazu Lagerhäuser mit den Waren ihrer Fächer. Liste weiterer Schritte (siehe „Mögliche nächste Schritte“). Tobias' Wahl steht aus.
- Spiel unverändert, nur die Versionsnummer steigt.

### v0.20.0 – Infofenster für Beet, Lagerhaus und Versandportal (10.11.2026)

- **Warum (Tobias, Chat 15):** Die drei Gebäude zeigten noch Textzeilen. Das Versandportal bleibt (Variante A), auch wenn Tobias es gerade nicht nutzt; Lagerhäuser bleiben Zusatzlager. „Codiere erst die neuen Infofenster für die Sachen, die noch nicht gemacht sind, wie wir das bei der letzten Version gemacht haben.“
- **Umgesetzt:** Beet mit Kasten „Wächst hier / Wächst gerade / Reif zum Ernten“ (Samen → Pflanze, Balken, „reif in etwa …“) und Säen-Knöpfen mit dem Bild des Samens; Lagerhaus mit den 3 Fächern als Bildern, Menge und Füllbalken (volles Fach orange), „Befüllen“ groß, „Ausräumen ins Laden-Lager“ kleiner; Versandportal mit den zuletzt angekommenen Waren → Laden-Lager mit Füllbalken (rot, wenn voll). Kürzere Tipps, die die Rollen erklären (Portal = Ausgang der Fabrik, Lagerhaus = Zwischenlager). Spielstand-Format 15.
- **Tobias:** „Die neuen Vorschaubilder sehen gut aus. Jetzt ist alles übersichtlich dargestellt.“

### v0.19.1 – Gespräch: Braucht es das Versandportal noch? (10.11.2026, nur Doku)

- **Tobias (Chat 15):** Beet, Lagerhaus und Versandportal sind noch nicht aufs neue Infofenster umgestellt. Macht das Versandportal noch Sinn, wenn das Lagerhaus die gleiche Funktion hat? „Lass uns erst die nächsten Schritte theoretisch durchgehen.“
- **Claude:** Vergleich beider Gebäude: Das Portal ist der automatische Ausgang der Fabrik in den Laden, das Lagerhaus Puffer und Eingang aus dem Laden-Lager; ohne Portal stünde jede Straße nach 150 Stück still. Empfehlung: beide behalten (A), Alternativen B (zusammenlegen) und C (weglassen). Entwurf v0.20.0: Infofenster für Beet, Lagerhaus, Versandportal mit Bildern; danach Maschinen zeigen auf der Karte, was sie herstellen.
- **Tobias' Antwort:** Variante A; Lagerhäuser bleiben Zusatzlager; „Ja, codiere erst die neuen Infofenster“ → v0.20.0.
- Spiel unverändert, nur die Versionsnummer steigt.
