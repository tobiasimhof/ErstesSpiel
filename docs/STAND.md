# Stand

> Zu Beginn jedes Chats lesen (zusammen mit `docs/SPIEL.md`). Wird bei jeder Version aktualisiert: Status, offene Fragen und die **letzten 3 Arbeitsschritte** (der neueste oben; der älteste fällt weg – vollständig steht jeder Schritt im Archiv).

| | |
|---|---|
| **Aktuelle Version** | v0.18.1 – Doku neu geordnet (nur Doku) |
| **Phase** | M2 – Produktionsketten (Kräuter-Kapitel ab Level 7) |
| **Spielen (live)** | https://tobiasimhof.github.io/ErstesSpiel/ |
| **Nächster Schritt** | Tobias spielt mit der neuen Bauleiste (v0.18.0) weiter, baut seine Fabrik aus und probiert dabei die Kräuterstube aus. Danach besprechen wir, was als Nächstes kommt. Level 9 (dritte Pflanze) hat Tobias erst einmal hinten angestellt. |

**Tobias' Fabrik:** Level 8, nach v0.17.0 komplett neu gebaut – eine eigene Straße je Zwischenprodukt, Lagerhäuser als Zwischenlager, zwei Erntebänke (Flachs und Ringelblume getrennt). Er spielt in Echtzeit auf dem Tablet und nutzt für Aufträge den Test-Knopf.

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

**Mögliche nächste Schritte** (nach Tobias' Feedback gemeinsam entscheiden): Feinschliff der Bauleiste (offene Frage 1), Level 9 mit der dritten Pflanze (hinten angestellt), Balance der Rohstoffe (Frage 3), Weiche mit Filter (Frage 6).

## Offene Fragen

1. **Bauleiste (seit v0.18.0 mit Reitern):** Tobias: „Die Übersicht gefällt mir viel besser.“ Sein ursprünglicher Punkt war auch, dass man nicht direkt sieht, was welche Maschine macht – sollen die Gebäude in der Bauleiste zusätzlich ihre Waren als kleine Bilder zeigen (z. B. Sägewerk → Holzplatte, Holzstab)? Reiter „Kräuter“ oder lieber „Pflanzen“?
2. **Kräuterstube mit 2 Eingängen** ist im echten Spiel noch nicht getestet.
3. **Balance und Rohstoffe:** Tobias hatte nach Level 8 zu wenig Grundrohstoffe für alle Maschinen und hat neu gebaut (Learning: eigene Straße je Zwischenprodukt). Stellschrauben: Rezeptmengen (10 + 5), Dauer eines Rohstoffs (15 min), Vorrat (3), Fläche, Preise. Kunden kaufen Kombi-Teile genauso oft wie einfache – eine Theke mit Vorhängeschlössern bringt sehr viel Gold.
4. **Platzhalter-Zahlen:** Aufstiegspreise, Auftragsmengen, Baukosten. Kostet der Laden-Ausbau später zusätzlich Waren? Begrenzt das Level die kaufbare Fläche?
5. **Weltgröße:** Reichen 38 × 30 Felder für die Masse der höheren Level, oder gibt es später mehr Fläche (`perSide` in `data/land.js`)?
6. **Weiche mit Filter** (Claudes Idee): ein Band-Feld, das eine Ware abzweigt und den Rest geradeaus schickt. Tobias' Problem mit gemischten Bändern spricht dafür – will er das, und wann?
7. **Eiserner Bestand:** Ein Mindestbestand im Laden-Lager, den die Theken nicht anrühren? Nur, wenn Tobias das möchte.
8. **Verbesserungen mit Erfahrung** (Tobias' Idee, noch offen): z. B. schneller verarbeiten, schnellere Bänder, größerer Rohstoff-Vorrat. Das Spiel zählt alle Erfahrung mit (`xpTotal`, auch die vom Test-Knopf).
9. **Laden-Lager über der Grenze:** Abreißen gibt Waren auch über die Grenze zurück (Tobias hatte 1.500 bei 1.000 Plätzen); bis wieder Platz ist, nimmt das Versandportal nichts an. Für Tobias in Ordnung – beobachten.
10. **Claudes Lesarten**, die Tobias jederzeit ändern kann (je eine Zahl in `data/shop.js`): Laden-Lager 1.000 erst ab Level 4; mittlere Theken ab Level 4, große ab Level 5.
11. **Einstieg:** Tobias' Idee, am Anfang vor allem die Massenproduktion auszubauen – später austesten.
12. **Pleiteschutz:** Ein Rohstoff ohne passendes Gebäude verhindert das Geschenk – bewusst so gelassen, beobachten.
13. **Vor v1.0:** Test-Knopf entfernen (`QUEST_TEST_SKIP = false`). Später: Schwarzmarkt und verbundene Läden (M5), Arbeitstitel.

## Die letzten 3 Arbeitsschritte

### v0.18.1 – Doku neu geordnet (09.11.2026, nur Doku)

- **Tobias:** Die README ist sehr lang und verbraucht zu Beginn jedes Chats viel Kontext. Wunsch: eine Datei, in der jeder Arbeitsschritt dokumentiert wird, eine Historie, eine Datei für die letzten Arbeitsschritte und eine grobe Zusammenfassung des Spiels – erst das Repo klären, dann weiter am Spiel. „Das Spielprinzip ist ja klar und wir müssen die Basis eigentlich nur erweitern.“
- **Umgesetzt** (Claudes Vorschlag, Tobias: „Ja, setze es bitte genauso um“): `README.md` ist nur noch eine kurze Startseite. Neu: `docs/STAND.md` (diese Datei), `docs/SPIEL.md` (das Spiel, wie es heute ist), `docs/TECHNIK.md`, und im Archiv `docs/archiv/` wörtlich die alten Abschnitte: `PLAENE.md`, `ENTSCHEIDUNGEN.md`, `VERSIONEN.md`, `GESPRAECHE.md` sowie `KONZEPT-VERLAUF.md` (Konzept mit Verlauf, Tobias' ursprünglicher Techbaum, alte offene Fragen). Regeln und Arbeitsablauf stehen jetzt in `CLAUDE.md`. Zu Beginn eines Chats liest Claude nur noch `CLAUDE.md`, `STAND.md` und `SPIEL.md` (etwa 33 KB statt 280 KB, rund ein Achtel).
- Spiel unverändert, nur die Versionsnummer steigt.

### v0.18.0 – Bauleiste mit Reitern (09.11.2026)

- **Warum (Tobias, Test von v0.17.0):** Mit vielen Maschinen wurde die Bauleiste unübersichtlich; beim Bauen ganz unten lag die Fläche hinter der Leiste.
- **Umgesetzt:** Reiter Holz, Stein, Eisen, Kräuter (Zimmerei bei Holz, Feinschmiede und Schlosserei bei Eisen); Förderband, Lagerhaus, Portal, Verschieben, Abreißen immer links; gesperrte Reiter mit 🔒; Reiter bleibt gemerkt; die Karte lässt sich unten über die Leiste schieben; Meldungen über der Leiste. Die Leiste ist nicht höher geworden.
- **Tobias:** „Ja, perfekt. So langsam nimmt das Spiel Form an. Die Übersicht gefällt mir viel besser.“
- Offen: Warenbilder je Gebäude (Frage 1).

### v0.17.0 – Ringelblume und Level 8 „Der Kräutergarten“ (09.11.2026)

- **Umgesetzt:** Ringelblume im selben Beet, die Flachsbreche heißt Erntebank und verarbeitet alle Pflanzen (auch gemischt), Kräuterstube mit 2 Eingängen (Heilverband, Kräuterkompresse), Level 8 mit 4 Aufträgen, Spielstand Version 14.
- **Tobias' Test (Chat 12, im Chat 13 wiederholt):** Das meiste funktioniert. Die Ringelblume ist gut zu sehen. Er hat die ganze Fabrik neu gebaut, weil er zu wenig Grundrohstoffe für alle Maschinen hatte – jetzt eine Straße je Zwischenprodukt und Lagerhäuser als Zwischenlager; zusammengeführte Bänder mit zwei Waren sind nicht steuerbar. Zwei Erntebänke statt gemischtem Vorrat. Kräuterstube noch nicht getestet. Die dritte Pflanze stellt er hinten an.
