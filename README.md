# ErstesSpiel

Erstes Spiel gecodet zusammen mit Claude.

Ein **Aufbau- und Fabrikspiel mit Wirtschaftssimulation im Mittelalter** (Arbeitstitel offen). Man baut auf einem kleinen Grundstück seine eigene Fabrik. Rohstoffe wie Holzstämme kauft man beim Händler, verarbeitet sie zu Holzblöcken und schickt diese über Förderbänder durch Werkstätten, wo immer komplexere Waren entstehen. Das ganze Grundstück ist der eigene Laden; die Waren verkauft man dort oder auf dem Schwarzmarkt. Mit dem Gold baut man den Laden aus, schaltet neue Produktionen frei und kauft mehr Fläche. Ziel ist ein Spiel für Handy und Tablet im Querformat, später mit Clans und einem gemeinsamen Markt aller Spieler.

| | |
|---|---|
| **Aktuelle Version** | v0.4.1 – Saubere Abzweigungen |
| **Phase** | M1 – Fabrik-Grundgerüst |
| **Spielen (live)** | https://tobiasimhof.github.io/ErstesSpiel/ |
| **Nächster Schritt** | Rückfragen zum neuen Produktionskonzept (Abschnitt 8) beantworten, dann Plan für v0.5.0 (Abschnitt 6) freigeben |

---

## Inhalt

1. [Zusammenarbeitsregeln](#1-zusammenarbeitsregeln)
2. [Arbeitsablauf pro Version](#2-arbeitsablauf-pro-version)
3. [Spielkonzept](#3-spielkonzept)
4. [Waren & Rezepte (Entwurf)](#4-waren--rezepte-entwurf)
5. [Technik](#5-technik)
6. [Fahrplan](#6-fahrplan)
7. [Entscheidungen](#7-entscheidungen)
8. [Offene Fragen](#8-offene-fragen)
9. [Versionshistorie](#9-versionshistorie)
10. [Gesprächsprotokoll](#10-gesprächsprotokoll)

---

## 1. Zusammenarbeitsregeln

Festgelegt am 05.11.2026.

1. **Jeder Arbeitsschritt ist eine eigene Version.** So halten wir Fehler klein und können bei einem großen Bug auf eine ältere Version zurückgehen.
2. **Wir mergen immer direkt und gehen live.** Claude programmiert, Tobias schaut sich das Ergebnis an und gibt Anweisungen. Tobias schreibt keine einzige Zeile Code.
3. **Hauptgerät ist das Galaxy Tab S9** (mobil). Der PC kommt gelegentlich dazu, später eventuell mit Godot oder einer anderen Software.
4. **Diese README ist das Gedächtnis des Projekts.** Zu Beginn jedes neuen Chats liest Claude diese Datei und weiß damit, woran wir arbeiten.
5. **Zu jeder Version steht hier, was wir uns vorgenommen haben, welche Fragen wir uns gestellt haben und was wir geändert haben.**
6. **Erst planen, dann programmieren.** Bevor Code geschrieben wird, gehen wir das Vorhaben theoretisch durch.

---

## 2. Arbeitsablauf pro Version

1. **Planen:** Ziel, Fragen und Entwurf besprechen (Regel 6).
2. **Umsetzen:** Claude programmiert auf einem Arbeitsbranch.
3. **Prüfen:** Claude testet die Version vor dem Merge selbst: automatische Tests der Spielregeln und ein Durchlauf im Browser in Tablet- und Handygröße (Querformat).
4. **Dokumentieren:** Claude aktualisiert diese README (Status-Tabelle, Versionshistorie, Gesprächsprotokoll, Entscheidungen, offene Fragen).
5. **Mergen:** Pull Request nach `main`, direkt gemergt. Die Versionsnummer steht im Titel des Pull Requests und des Merge-Commits, z. B. `v0.3.0: …`.
6. **Live:** Das Spiel liegt unter **einem einzigen Link** (GitHub Pages) und ist nach jedem Merge automatisch aktuell. Die Versionsnummer wird im Spiel angezeigt.
7. **Testen:** Tobias spielt auf dem Tablet und gibt Feedback. Daraus entsteht der nächste Schritt.

**Versionsnummern:** `vA.B.C`

- Solange `A = 0` ist, sind wir in der Entwicklung.
- `B` steigt bei jedem neuen Arbeitsschritt (z. B. `v0.2.0` → `v0.3.0`).
- `C` steigt bei einer reinen Fehlerkorrektur (z. B. `v0.3.0` → `v0.3.1`).
- `v1.0.0` = erste vollständige, rund spielbare Version.

**Schrittgröße:** lieber kleine Schritte. Viele Kleinigkeiten dürfen in einem größeren Schritt zusammengefasst werden.

**Zurückgehen:** Jede Version ist ein eigener Merge auf `main`, erkennbar an der Versionsnummer im Titel. Läuft nach einem Merge etwas schief, stellt Claude den Stand einer älteren Version wieder her. Der Live-Link zeigt dann wieder die alte Version.

---

## 3. Spielkonzept

### 3.1 Vision

- **Schwerpunkt: die optimale Fabrik bauen.** Die Wirtschaft gibt vor, *was* sich gerade zu bauen lohnt: Was wird gebraucht, zu welchem Preis, und womit verdiene ich genug, um weiter zu wachsen?
- **Setting:** Mittelalter. Werkzeuge und Waren bleiben einfach. Es gibt zwei Grundstoffe: **Holz** und **Stein**.
- **Plattform:** Handy und Tablet, **nur Querformat**. Zuerst als Browser-Spiel, später als App.
- **Sprache:** vorerst nur Deutsch.
- **Vorbilder** (nur einzelne Mechaniken, kein Nachbau; eigene Welt, eigene Namen, eigene Rezepte, eigene Grafik):
  - *Alchemy Factory:* eine kleine eigene Fabrik mit Förderbändern; ein Rohstoff verzweigt sich in viele Zwischenprodukte.
  - *Clash of Clans:* Das Level des Hauptgebäudes schaltet Neues frei, man schaut täglich rein, es gibt Clans.
  - *Hay Day:* Spieler verkaufen an Spieler, Preise schwanken durch Angebot und Nachfrage.

### 3.2 Kernschleife

Rohstoffe gewinnen → über Förderbänder verarbeiten → im Laden oder auf dem Schwarzmarkt verkaufen → mit Gold ausbauen (Laden-Level, neue Werkstätten, mehr Fläche) → größere und lukrativere Ketten → …

**Tagesrhythmus:** Man schaut regelmäßig rein, holt Waren ab, verkauft, prüft die Marktlage, baut die Fabrik um und erweitert sie.

### 3.3 Fabrik

- Das Grundstück besteht aus quadratischen Feldern (Raster). Man startet klein und kauft Fläche dazu, immer teurer.
- **Der Laden ist das ganze Grundstück**, kein einzelnes Gebäude. Darauf stehen zu Beginn ein Holzfällerlager und ein Steinbruch.
- Gebäude belegen mehrere Felder und haben Ein- und Ausgänge.
- **Förderbänder** verbinden die Gebäude und transportieren Waren Stück für Stück.
- **Aufteilen und Zusammenführen durch Ziehen**, ohne Verteiler-Gebäude: Zieht man von einem bestehenden Band aus, teilt es sich auf (bis zu 3 Richtungen pro Feld; mehrfach aufteilen ergibt 4 und mehr Strecken). Zieht man auf ein bestehendes Band, laufen beide zusammen. Abzweigungen verteilen die Waren abwechselnd.
- **Ein- und Ausgänge** sind als Pfeile am Gebäude zu sehen: blau = Eingang, orange = Ausgang.
- **Rohstoffe kauft man beim Händler**, z. B. einen Holzstamm. Den legt man in das Holzfällerlager, das daraus nach und nach Holzblöcke herstellt (Beispiel: 1 Holzstamm → 200 Holzblöcke in 15 Minuten).
- **Werkstätten** verarbeiten nach Rezept, z. B. Sägewerk: 1 Holzblock → 1 Winkel oder 1 Stab (5 Sekunden). Man stellt ein, was es herstellt.
- **Typischer Aufbau:** Ein Holzfällerlager wird auf 4 Strecken verteilt. Zwei davon gehen in Sägewerke (eins auf Winkel, eins auf Stäbe eingestellt), zwei laufen weiter für spätere Rezepte, die Holzblöcke direkt brauchen (z. B. zusammen mit Splitt).
- **Stau:** Ist ein Band voll (z. B. weil es im Nichts endet), bleibt alles stehen und davor wird nicht weiter produziert.
- **Lagerhäuser** sind die einzige Möglichkeit, Waren zu lagern. Sie sind Zwischenstationen: Man kann z. B. 200 Stäbe zwischenlagern, die Waren können aber auch weiterlaufen.
- **Versandportal:** Waren, die hineinlaufen, landen direkt im Laden.
- **Montage-Werkstätten** brauchen mehrere Zutaten, z. B. Schreinerei: 4 Holzwinkel + 5 Bretter + 10 Steinnägel → Tür.
- Eine Werkstatt kann mehrere Rezepte. Man stellt ein, was sie gerade herstellt.
- **Umbauen ist leicht und günstig** (verschieben, drehen, abreißen mit Rückerstattung), weil man sich ständig an den Markt anpasst. Das gilt für alle Gebäude, auch die Startgebäude, damit man den Schwerpunkt der Fabrik jederzeit neu setzen kann.
- **Bauen geht sofort**, sofern man das Gold und die Waren dafür hat. Es gibt keine Bauzeiten.

### 3.4 Wirtschaft

- Jede Ware hat einen **Grundwert**. Verarbeitete Waren sind mehr wert als ihre Zutaten zusammen, Weiterverarbeiten lohnt sich also.
- **Laden:** Der Knopf „Laden“ unten links öffnet den Laden. Er hat ein eigenes **Lager** (gefüllt über das Versandportal) und **Verkaufstheken**. Je nach Level bzw. Größe einer Theke passen darauf z. B. 20 Winkel. Von den Theken kaufen Computer-Kunden (NPCs) zu einem „normalen“ Preis.
- **Händler:** Hier kauft man Rohstoffe wie Holzstämme.
- **Nachfrage:** Wer viel von einer Ware verkauft, drückt ihren Preis. Mit der Zeit erholt er sich wieder. Dazu kommen Trends, z. B. „Die Stadt baut eine Mauer: Steinblöcke +50 % für 2 Tage“. Eine Tür bringt also mal mehr, mal weniger Gold, je nachdem, wie gefragt sie gerade ist. So entsteht das Wirtschaftsgefühl, und es lohnt sich, je nach Marktlage umzubauen.
- **Spottpreis:** Einfache Waren wie Holzblöcke werden immer angekauft, wenn auch billig. Weil Rohstoffe jetzt Gold kosten, braucht es zusätzlich einen Schutz vor dem Pleitegehen (offene Frage).
- **Kaufen statt herstellen:** Jede Ware kann man auch kaufen, z. B. eine fertige Tür. Das ist teurer als selbst herstellen, spart aber Platz und Zeit.
- **Schwarzmarkt** (später, online, noch unsicher): Spieler bieten Waren zu eigenen Preisen an; der Online-Markt bestimmt die Preise. Idee von Tobias: Alle Läden sind verbunden – bieten alle Winkel an, sinkt der Preis für Winkel. Computer-Händler sorgen dafür, dass der Markt auch mit wenigen Spielern lebendig ist.

### 3.5 Fortschritt

- **Laden-Level**, ähnlich dem Rathaus in Clash of Clans: Jede Stufe schaltet neue Werkstätten, Rezepte, Lagerplatz und Fläche frei. Jede Stufe wird teurer.
- **Laden-Ausbau** geht sofort, kostet aber Gold **und** Waren, z. B. 200 Holzzahnräder + 200 Splitt + 500 Gold. So muss man ständig Neues produzieren, und das Produzieren ersetzt das Warten.
- **Fläche kaufen:** Das Grundstück wird stückweise erweitert, immer teurer und begrenzt durch das Laden-Level.
- **Freischaltpunkte (Idee, später entscheiden):** Jeder Laden-Aufstieg gibt Punkte, z. B. 10 Punkte für Level 2. Mit den Punkten schaltet man neue Werkstätten frei, etwa das Sägewerk, und kann sie danach sofort bauen.

### 3.6 Zeit

- Das Spiel läuft in Echtzeit. Die Fabrik produziert weiter, auch wenn das Spiel geschlossen ist.
- Die Produktion läuft, bis ein Lager voll ist oder einer Werkstatt die Zutaten ausgehen. Ein zusätzliches Zeitlimit gibt es nicht.
- Volle Lager sind der Anreiz, regelmäßig reinzuschauen.
- Holzfällerlager und Steinbruch brauchen gekaufte Rohstoffe (Holzstamm, vermutlich Felsbrocken); die frühere Annahme „liefern unbegrenzt“ ist damit hinfällig.

### 3.7 Online-Teil (später)

- Spielerkonto, Spielstand auf einem Server.
- Globaler Schwarzmarkt mit Angeboten der Spieler.
- Clans: beitreten und untereinander handeln.
- Veröffentlichung als App (Android, iOS).
- **Geschäftsmodell:** Das Spiel ist kostenlos. Geld kommt später über einen Season Pass und Skins herein. „Pay2Win“ steht nicht im Fokus.

**Was das bedeutet:** Für den Online-Teil brauchen wir einen Server mit Datenbank. Das bringt mit sich: laufende Kosten, Datenschutz (DSGVO), Schutz vor Schummeln (der Server muss die Wirtschaft kontrollieren, nicht das Handy), Moderation von Clan-Chats und Gebühren für die App-Stores (derzeit Google einmalig 25 US-Dollar, Apple 99 US-Dollar pro Jahr). Deshalb bauen wir zuerst das Einzelspieler-Spiel und legen den Code so an, dass der Online-Teil später angedockt werden kann.

---

## 4. Waren & Rezepte (Entwurf)

Unser eigener Rezeptbaum. Alle Mengen sind Platzhalter und werden beim Balancing angepasst.

**Prinzip (von Tobias, Chat 2 aktualisiert):** Rohstoffe werden gekauft (z. B. Holzstamm). Daraus entstehen Grundformen wie Holzblöcke. Aus Holzblöcken werden Einzelteile wie Winkel und Stäbe, für Stein genauso. Aus den Einzelteilen (und Grundformen) baut man fertige Waren.

Spalte „Stand“: **Tobias** = so gewünscht, **Vorschlag** = Claudes Vorschlag (noch offen), **Entwurf 1** = aus dem ersten Entwurf, muss noch an das neue Prinzip angepasst werden.

| Stufe | Ware | Woher | Rezept (Mengen und Zeiten sind Platzhalter) | Stand |
|---|---|---|---|---|
| 0 | Holzstamm | Händler | kaufen | Tobias |
| 0 | Felsbrocken | Händler | kaufen | Vorschlag |
| 1 | Holzblock | Holzfällerlager | 1 Holzstamm → 200 Holzblöcke in 15 Minuten | Tobias |
| 1 | Steinblock | Steinbruch | 1 Felsbrocken → 200 Steinblöcke in 15 Minuten | Vorschlag |
| 2 | Holzwinkel | Sägewerk, Einstellung „Winkel“ | 1 Holzblock → 1 Holzwinkel (5 Sekunden) | Tobias |
| 2 | Holzstab | Sägewerk, Einstellung „Stäbe“ | 1 Holzblock → 1 Holzstab (5 Sekunden) | Tobias |
| 2 | Brett | Sägewerk, Einstellung „Bretter“ | 1 Holzblock → 1 Brett (5 Sekunden) | Vorschlag |
| 2 | Splitt | Steinmetz, Einstellung „Splitt“ | 1 Steinblock → 4 Splitt | Vorschlag |
| 2 | Steinplatte | Steinmetz, Einstellung „Platten“ | 1 Steinblock → 1 Steinplatte | Vorschlag |
| 2 | Steinsäule | Steinmetz, Einstellung „Säulen“ | 1 Steinblock → 1 Steinsäule | Vorschlag |
| 3 | Steinnägel | Nagelschleiferei | 1 Splitt → 4 Steinnägel | Entwurf 1 |
| 3 | Holzzahnrad | Schnitzerei | 2 Holzstäbe → 1 Holzzahnrad | Entwurf 1 |
| 4 | Tür | Schreinerei | 4 Holzwinkel + 5 Bretter + 10 Steinnägel | Entwurf 1 |
| 4 | Kiste | Schreinerei | 6 Bretter + 8 Steinnägel | Entwurf 1 |
| 4 | Leiter | Schreinerei | 8 Holzstäbe + 6 Steinnägel | Entwurf 1 |
| 4 | Mahlwerk | Mühlenbauer | 1 Steinblock + 2 Holzzahnräder | Entwurf 1 |
| 4 | Brunnen | Bauhütte | 6 Steinplatten + 2 Steinsäulen + 1 Holzzahnrad | Entwurf 1 |
| ? | (neu) | ? | Holzblöcke + Splitt → etwas Neues | Idee von Tobias |

**Erster Ausschnitt für den Prototyp (v0.5.0):** Holzstamm, Holzblock, Holzwinkel, Holzstab.

**Ideen für später:** weitere Rohstoffe wie Eisenerz (Schmelze, Schmiede, echte Nägel, Werkzeuge), Lehm (Ziegel), Hanf (Seile), Sand (Glas); größere Waren wie Fässer, Karren, Fenster.

---

## 5. Technik

- **Browser-Spiel** (HTML, JavaScript, Canvas). Es läuft auf Handy, Tablet und PC, ohne Installation.
- **Live über GitHub Pages:** ein einziger Link, nach jedem Merge aktuell.
- **Spielregeln getrennt von der Darstellung.** Die Simulation (Produktion, Förderbänder, Preise) kennt keine Grafik. Vorteile:
  - Die Regeln lassen sich automatisch testen.
  - Der gleiche Code kann später auf einem Server laufen (Online-Teil).
  - Die Grafik lässt sich austauschen, z. B. später eine Schrägansicht wie in Clash of Clans.
- **Inhalte als Datentabellen:** Waren, Rezepte, Gebäude und Preise stehen in Tabellen. Neue Inhalte sind neue Zeilen.
- **Simulation in festen Takten.** Verpasste Zeit wird beim Öffnen im Schnelldurchlauf nachgerechnet (Offline-Produktion).
- **Spielstand** wird im Browser gespeichert, später auf dem Server.
- **Später als App:** Das Web-Spiel wird in eine App verpackt (z. B. mit Capacitor), oder wir steigen auf eine Engine um. Entscheidung in M7.
- **Kein Build-Schritt:** Der Browser lädt die Dateien direkt. GitHub Pages veröffentlicht `main` aus dem Hauptordner (`/ (root)`), die Datei `.nojekyll` schaltet die Umwandlung durch GitHub ab.
- **Zwischenspeicher:** GitHub Pages lässt Browser Dateien bis zu 10 Minuten zwischenspeichern. Nach einem Merge dauert es 1–2 Minuten, bis die neue Version online ist. Zeigt das Spiel oben noch die alte Versionsnummer, kurz warten und neu laden.

### 5.1 Projektstruktur

| Pfad | Inhalt |
|---|---|
| `index.html` | Startseite des Spiels (Gerüst der Oberfläche) |
| `manifest.webmanifest` | Angaben für „Zum Startbildschirm hinzufügen“ (Name, Symbol, Vollbild, Querformat) |
| `src/version.js` | Versionsnummer, wird im Spiel angezeigt |
| `src/main.js` | Verbindet Spielregeln, Kamera, Eingabe und Anzeige |
| `src/core/` | Spielregeln und Spielzustand, ohne Grafik |
| `src/core/data/buildings.js` | Datentabelle der Gebäude (Größe, Ein- und Ausgänge, Texte) und Reihenfolge im Baumenü |
| `src/core/state.js` | Spielzustand anlegen, Abfragen auf dem Raster |
| `src/core/dirs.js` | Himmelsrichtungen (oben, rechts, unten, links) |
| `src/core/geometry.js` | Größe, Drehung, Felder sowie Ein- und Ausgänge von Gebäuden |
| `src/core/buildings.js` | Gebäude bauen, verschieben, drehen, abreißen, freie Stelle suchen |
| `src/core/belts.js` | Förderbänder legen, aufteilen, zusammenführen, drehen, abreißen |
| `src/core/save.js` | Spielstand in Text umwandeln und prüfen |
| `src/view/camera.js` | Kamera: verschieben, zoomen, Bildschirm ↔ Welt umrechnen |
| `src/view/input.js` | Touch, Maus und Mausrad (Antippen, Ziehen, zwei Finger) |
| `src/view/controller.js` | Modi (Ansehen, Bauleiste, Platzieren, Förderband, Abreißen) und was Gesten darin tun |
| `src/view/renderer.js` | Zeichnet Spielfeld, Bänder, Gebäude, Vorschau |
| `src/view/hud.js` | Obere Leiste und Menü ☰ |
| `src/view/panels.js` | Infofenster, Laden-Fenster, Rückfragen, Meldungen |
| `src/view/buildbar.js` | Untere Leisten: Laden/Bauen, Bauleiste, Werkzeugleiste |
| `src/view/press.js` | Knöpfe reagieren aufs Loslassen des Fingers (siehe Entscheidungen) |
| `src/view/storage.js` | Speichern und Laden im Browser |
| `src/style.css` | Aussehen der Oberfläche |
| `assets/icons/` | App-Symbole (erzeugt mit `tools/make-icons.py`) |
| `tests/*.test.js` | Automatische Tests: Spielregeln, Gebäude, Förderbänder, Speichern, Kamera, Versionsnummer |
| `tests/browser/smoke.cjs` | Browser-Test in Tablet- und Handygröße: spielt Bauen, Bänder, Abreißen, Speichern und Neues Spiel per Touch durch |

**Prüfen vor jedem Merge:** `npm test` (Spielregeln) und `npm run test:browser` (Browser-Test).

---

## 6. Fahrplan

### Meilensteine

| | Meilenstein | Inhalt |
|---|---|---|
| M0 | Planung | Regeln, Konzept, Fahrplan (läuft) |
| M1 | Fabrik-Grundgerüst | Spielfeld, Gebäude bauen, Förderbänder, erste Kette Holz → Bretter → Laden → Gold, Speichern, Offline-Produktion |
| M2 | Produktionsketten | Stein-Kette, Einzelteile, Montage mit mehreren Zutaten (Tür), Kaufen statt Herstellen |
| M3 | Wirtschaft & Fortschritt | Nachfrage und Trends, Laden-Level (Ausbau mit Gold und Waren), Fläche kaufen, evtl. Freischaltpunkte |
| M4 | Optik & Gefühl | Grafiken, Animationen, Sound, Einführung für neue Spieler |
| M5 | Online | Spielerkonto, Spielstand auf dem Server, globaler Schwarzmarkt |
| M6 | Clans & Handel | Clans beitreten, Handel zwischen Spielern |
| M7 | App | Veröffentlichung für Android und iOS |

### Nächste Versionen (M1)

| Version | Inhalt | Stand |
|---|---|---|
| v0.3.0 | **Spielfeld:** Raster, Startgebäude, verschieben und zoomen per Touch, erster Live-Gang | ✅ fertig |
| v0.4.0 | **Bauen & Speichern:** Laden als ganze Fläche, Bauleiste, Gebäude und Förderbänder bauen, verschieben, drehen, abreißen; Bänder aufteilen und zusammenführen; Spielstand bleibt erhalten | ✅ fertig |
| v0.4.1 | **Saubere Abzweigungen:** Pfeile an Abzweigungen aufgeräumt, keine Fugen mehr zwischen Bandfeldern | ✅ fertig |
| v0.5.0 | **Produktion:** Holzstamm einlegen, Holzfällerlager macht Holzblöcke, Waren laufen über die Bänder, Sägewerk macht Winkel oder Stäbe, Lagerhaus, Versandportal, Laden-Lager | Plan wartet auf Rückfragen |
| v0.6.0 | **Handel:** Händler (Holzstämme kaufen), Verkaufstheken im Laden, NPC-Kunden, Gold; Bauen kostet Gold; Preise nach Nachfrage. Erster vollständiger Kreislauf | |
| v0.7.0 | **Offline:** Fabrik läuft weiter, wenn das Spiel geschlossen ist, bis Bänder voll sind oder Rohstoffe fehlen | |

### v0.4.0 – Bauen & Speichern (fertig)

**Neu im Spiel:**
- Der Laden ist das ganze Grundstück (Schild „Dein Laden · Level 1“ oben links). Start mit Holzfällerlager und Steinbruch.
- Unten links **„⚖️ Laden“**: Fenster mit Level, Fläche, Anzahl der Gebäude und Bänder und dem (noch leeren) Inventar.
- Unten rechts **„🔨 Bauen“**: Bauleiste mit Holzfällerlager, Steinbruch, Sägewerk (2 × 1), Förderband und Abreißen.
- **Gebäude platzieren:** Vorschau erscheint an einer freien Stelle, grün = passt, rot = geht nicht. Mit dem Finger schieben oder auf ein Feld tippen, dann ↻ Drehen, ✕ Abbrechen oder ✓ Bauen.
- **Förderbänder:** mit einem Finger ziehen; Kurven entstehen automatisch; zurückziehen nimmt Stücke wieder weg; von einem Band aus ziehen teilt auf; auf ein Band ziehen führt zusammen; in ein Gebäude ziehen verbindet; Antippen dreht.
- **Abreißen:** über Bänder wischen; Gebäude antippen (mit Rückfrage).
- **Gebäude und Bänder antippen:** Infofenster mit ↔ Verschieben, ↻ Drehen und 🗑 Abreißen.
- **Pfeile** an jedem Gebäude: blau = Eingang, orange = Ausgang. Sie drehen mit.
- **Speichern:** automatisch im Browser nach jeder Änderung und beim Verlassen. Menü ☰ → „Neues Spiel“ (mit Rückfrage) startet von vorn.
- Zwei Finger verschieben und zoomen in jedem Modus; am PC verschieben rechte oder mittlere Maustaste immer die Karte.

**Was Tobias testet:** Bauen, Bänder ziehen, aufteilen und zusammenführen, Gebäude verschieben, drehen, abreißen, Seite neu laden (alles noch da?), „Neues Spiel“. Fühlt sich das Ziehen der Bänder natürlich an?

### Plan für v0.5.0 – Produktion (wartet auf Rückfragen)

- **Waren-Tabelle:** Holzstamm, Holzblock, Holzwinkel, Holzstab (je nach Antwort auch Brett). Symbole vorläufig.
- **Startvorrat:** 3 Holzstämme im Laden-Lager, bis es in v0.6.0 den Händler gibt.
- **Holzstamm einlegen:** Holzfällerlager antippen → „Holzstamm einlegen“. Es stellt daraus 200 Holzblöcke her (Platzhalter: 15 Minuten, also etwa alle 4,5 Sekunden einer) und gibt sie am orangen Pfeil aufs Band.
- **Sägewerk:** Im Infofenster einstellen, ob es Winkel oder Stäbe herstellt (5 Sekunden pro Holzblock).
- **Förderbänder** transportieren die Waren sichtbar Feld für Feld. Abzweigungen verteilen abwechselnd, Zusammenführungen nehmen abwechselnd auf. **Ist ein Band voll, steht alles davor still.**
- **Lagerhaus** (neues Gebäude): Eingang und Ausgang, fasst z. B. 200 Waren, gibt sie weiter, sobald der Ausgang frei ist. Einzige Möglichkeit, Waren zu lagern.
- **Versandportal** (neues Gebäude): Waren, die hineinlaufen, landen im Laden-Lager.
- **Laden-Fenster** zeigt das Laden-Lager mit Mengen (Verkaufstheken folgen in v0.6.0).
- **Infofenster** zeigt, was ein Gebäude gerade tut (arbeitet, wartet auf Holzblöcke, Band voll) und wie viel noch übrig ist.
- **Testmodus:** Schalter im Menü ☰, der die Zeit z. B. 10-mal schneller laufen lässt, damit man nicht 15 Minuten auf einen Holzstamm warten muss.
- Waren auf Bändern, in Gebäuden und Lagern werden mitgespeichert.

---

## 7. Entscheidungen

| Datum | Entscheidung | Begründung |
|---|---|---|
| 05.11.2026 | Zusammenarbeitsregeln 1–6 (Abschnitt 1) | Von Tobias festgelegt. |
| 05.11.2026 | Zusätzlich gibt es eine `CLAUDE.md` | Claude lädt diese Datei in jedem neuen Chat automatisch. Sie verweist auf die README, damit Regel 4 zuverlässig greift. |
| 05.11.2026 | Versionsnummer im Titel jedes Pull Requests und Merge-Commits statt Git-Tags | Claudes Arbeitsumgebung darf nur auf den Arbeitsbranch pushen, Tags werden abgelehnt. Ein Merge-Commit mit Versionsnummer reicht, um auf eine alte Version zurückzugehen (Regel 1). Optional kann Tobias auf GitHub unter „Releases“ zusätzlich Tags anlegen. |
| 05.11.2026 | Zuerst Logik und Spielprinzip, Grafik später | Von Tobias gewünscht. Für den Anfang reichen Platzhalter. |
| 05.11.2026 | Schwerpunkt ist das Bauen der Fabrik; die Wirtschaft bestimmt, was sich lohnt | Antwort von Tobias auf Frage 2. |
| 05.11.2026 | Mittelalter mit den Grundstoffen Holz und Stein | Hält Werkzeuge und Waren einfach (Frage 4). |
| 05.11.2026 | Start mit Laden, Holzfällerlager und Steinbruch | Frage 5. |
| 05.11.2026 | Verkauf im Laden und (später) auf dem Schwarzmarkt; Holz und Stein immer zum Spottpreis verkäuflich | Fragen 6 und 9. Spieler können nicht pleitegehen. |
| 05.11.2026 | Fortschritt über Laden-Level und Fläche kaufen, wie in Clash of Clans | Fragen 6 und 9. |
| 05.11.2026 | Echtzeit, Fabrik läuft offline weiter | Fragen 8 und 10: tägliches Reinschauen. |
| 05.11.2026 | Zuerst als Browser-Spiel (Web) | Frage 11. Erweiterung später. |
| 05.11.2026 | Handy und Tablet, nur Querformat | Frage 12. |
| 05.11.2026 | Vorerst nur Deutsch | Frage 13. |
| 05.11.2026 | Ein einziger Live-Link; bei Problemen zurück zur alten Version | Frage 14. |
| 05.11.2026 | Kleine Schritte; viele Kleinigkeiten dürfen zusammen in einen größeren Schritt | Frage 15. |
| 05.11.2026 | Erst Einzelspieler, Online-Teil (Schwarzmarkt, Clans, Handel) ab M5 | Online braucht einen Server mit Kosten, Datenschutz und Schummelschutz. Das Spiel muss zuerst allein Spaß machen. |
| 05.11.2026 | Eigener Rezeptbaum, eigene Namen und Grafik | Andere Spiele dienen nur als Vorbild für Mechaniken. |
| 05.11.2026 | Spielregeln strikt getrennt von der Darstellung, Inhalte als Datentabellen | Testbar, später auf dem Server nutzbar, Grafik austauschbar. |
| 05.11.2026 | Online-Teil ganz am Ende; zuerst ein funktionierendes Spielsystem | Von Tobias bestätigt. |
| 05.11.2026 | Prototyp in Draufsicht, Schrägansicht später | Frage 1: am Anfang lieber alles einfacher. |
| 05.11.2026 | Verkauf zuerst per Knopfdruck aus dem Laden-Lager | Frage 2. Auto-Verkauf kann später kommen. |
| 05.11.2026 | Keine Bauzeiten: Bauen geht sofort, wenn Gold und Waren reichen | Frage 3. |
| 05.11.2026 | Laden-Ausbau kostet Gold und Waren (z. B. 200 Holzzahnräder + 200 Splitt + 500 Gold) | Fragen 3 und 4: Produzieren ersetzt das Warten. |
| 05.11.2026 | Produktion läuft, bis Lager voll sind oder Zutaten fehlen; kein Zeitlimit | Frage 6. |
| 05.11.2026 | Rezept-Prinzip: Holz/Stein → Grundformen (Bretter, Holzblöcke, Steinblöcke) → Einzelteile (Winkel, Stäbe …) → Waren | Frage 7. |
| 05.11.2026 | Kostenlos; später Season Pass und Skins, kein Pay2Win-Fokus | Frage 8. |
| 05.11.2026 | Freischaltpunkte pro Laden-Level und Arbeitstitel später entscheiden | Fragen 5 und 9: erst ein Prototyp. |
| 05.11.2026 | Browser-Spiel ohne Build-Schritt; GitHub Pages aus `main` / `(root)` | Einfach und robust; Tobias hat Pages eingeschaltet. |
| 05.11.2026 | Platzhalter-Grafik: farbige Blöcke mit Emojis; Laden-Symbol ⚖️ (Händlerwaage) | Das 🏪-Emoji zeigt einen modernen „24“-Laden und passt nicht ins Mittelalter. |
| 05.11.2026 | Der Laden ist kein Gebäude, sondern das ganze Grundstück; Knopf „Laden“ unten links zeigt das Inventar aller Lager und dient später zum Verkaufen | Von Tobias gewünscht (Chat 2). |
| 05.11.2026 | Knopf „Bauen“ unten rechts öffnet die Bauleiste | Von Tobias gewünscht (Chat 2). |
| 05.11.2026 | Alle Gebäude, auch die Startgebäude, lassen sich verschieben, drehen und abreißen | Man soll den Schwerpunkt der Fabrik jederzeit neu setzen können (Chat 2). |
| 05.11.2026 | Förderbänder teilen sich auf und führen zusammen durch einfaches Ziehen, ohne Verteiler-Gebäude; Abzweigungen verteilen abwechselnd | Von Tobias gewünscht (Chat 2): aus 1 Strecke werden durch Ziehen 4. |
| 05.11.2026 | Ein- und Ausgänge als Pfeile: blau = Eingang, orange = Ausgang | Von Tobias bestätigt. |
| 05.11.2026 | Speichern schon ab v0.4.0 (automatisch im Browser), „Neues Spiel“ im Menü ☰ | Von Tobias bestätigt; sonst wäre Gebautes nach dem Neuladen weg. |
| 05.11.2026 | Sägewerk ist 2 × 1 Felder (Eingang links, Ausgang rechts) | Kompakt und gut für gerade Produktionslinien. |
| 05.11.2026 | Bauen ist bis v0.6.0 kostenlos | Gold gibt es erst mit dem Verkaufen. |
| 05.11.2026 | Knöpfe reagieren aufs Loslassen des Fingers statt auf „click“ | Chrome verschluckt den Klick, wenn man direkt nach einer schnellen Wischbewegung tippt (beim Browser-Test gefunden). |
| 05.11.2026 | Rohstoffe werden beim Händler gekauft (z. B. Holzstamm); das Holzfällerlager macht aus 1 Holzstamm 200 Holzblöcke (Platzhalter: 15 Minuten) | Von Tobias (Chat 2, Teil 2). Ersetzt die Annahme „Holz und Stein unbegrenzt“. |
| 05.11.2026 | Sägewerk: 1 Holzblock → 1 Winkel oder 1 Stab (Platzhalter: 5 Sekunden), einstellbar | Von Tobias (Chat 2, Teil 2). |
| 05.11.2026 | Waren lagern nur in Lagerhäusern; Lagerhäuser sind Zwischenstationen, durch die Waren weiterlaufen können | Von Tobias (Chat 2, Teil 2). Ersetzt Claudes Vorschlag „jedes Gebäude hat ein eigenes Lager“. |
| 05.11.2026 | Ein Versandportal schickt Waren in den Laden; der Laden hat ein Lager und Verkaufstheken (Menge je nach Theken-Level, z. B. 20 Winkel); Verkauf an NPCs zum normalen Preis | Von Tobias (Chat 2, Teil 2). |
| 05.11.2026 | Ist ein Band voll, steht alles davor still (kein Überlauf, keine Verluste) | Von Tobias (Chat 2, Teil 2). |
| 05.11.2026 | An Abzweigungen steht nur der Pfeil, der geradeaus weiterläuft; Bänder werden in drei Durchgängen gezeichnet | Tobias fand die Abzweigungen in v0.4.0 „unsauber“. |

---

## 8. Offene Fragen

Stand 05.11.2026. Zu jeder Frage steht Claudes Vorschlag dabei.

1. **Bretter:** Werden sie für die Tür weiter gebraucht? Vorschlag: als dritte Einstellung im Sägewerk (1 Holzblock → 1 Brett).
2. **Stein:** analog zu Holz? Vorschlag: Felsbrocken beim Händler kaufen → Steinbruch → 200 Steinblöcke in 15 Minuten; Steinmetz macht aus Steinblöcken Splitt, Steinplatten oder Steinsäulen.
3. **Holzfällerlager:** Wie viele Holzstämme kann man auf einmal einlegen? Vorschlag: bis zu 3, die nacheinander verarbeitet werden.
4. **Lagerhaus:** gemischte Waren oder nur eine Sorte pro Lagerhaus? Vorschlag: gemischt, Waren gehen in der Reihenfolge weiter, in der sie angekommen sind.
5. **Pleiteschutz:** Rohstoffe kosten jetzt Gold. Was, wenn man kein Gold und nichts zu verkaufen hat? Vorschlag: Dann schenkt der Händler einen Holzstamm.
6. **Verkaufstheken:** Preis automatisch = aktueller Marktpreis, oder selbst festlegen? Vorschlag: im Laden automatisch; eigene Preise erst auf dem Schwarzmarkt.
7. **Schwarzmarkt & verbundene Läden:** in M5 entscheiden. Claudes Gedanke: Die NPC-Preise im Laden werden später global (verkaufen alle Spieler Winkel, sinkt der Winkelpreis); der Schwarzmarkt ist Handel direkt zwischen Spielern zu eigenen Preisen.
8. **Plan für v0.5.0** (Abschnitt 6) freigeben, inklusive Testmodus?
9. **Freischaltpunkte** pro Laden-Level: Details in M3 entscheiden.
10. **Arbeitstitel:** ergibt sich im Laufe der Entwicklung.

---

## 9. Versionshistorie

### v0.4.1 – Saubere Abzweigungen (05.11.2026)

**Vorgenommen:**
- Den „unsauberen“ Look an Band-Abzweigungen beheben, den Tobias auf dem Tablet gefunden hat.
- Tobias' neues Produktionskonzept festhalten und den Plan für v0.5.0 daran anpassen.

**Fragen, die wir uns gestellt haben:**
- Warum sahen die Abzweigungen unsauber aus? → Pro Abzweig-Feld standen zwei Pfeile gedrängt in einer Ecke, einer davon genau auf der Kante zum Abzweig. Außerdem schimmerten an den Feldgrenzen feine Linien durch.
- Wie zeigt man die Richtung an Abzweigungen, ohne zu überladen? → Nur der Pfeil geradeaus steht in der Mitte; die Abzweige zeigen ihre Richtung mit dem nächsten Bandfeld.

**Gemacht:**
- Bänder werden in drei Durchgängen gezeichnet (Ränder, Laufflächen, Pfeile) und überlappen minimal: keine Fugen mehr.
- Neue Pfeil-Regel für Abzweigungen; Abzweige, die direkt in ein Gebäude führen, bekommen einen kleinen Pfeil an der Mündung; Verteiler ohne Pfeil bekommen einen Punkt.
- README: neues Produktionskonzept (Händler, Holzstamm → Holzblöcke, Sägewerk mit Einstellung, Lagerhaus, Versandportal, Verkaufstheken), Rezepttabelle mit Spalte „Stand“, neuer Plan für v0.5.0, neue offene Fragen.
- Alle 44 Tests und der Browser-Test bestanden.

### v0.4.0 – Bauen & Speichern (05.11.2026)

**Vorgenommen:**
- Gebäude und Förderbänder bauen, verschieben, drehen und abreißen.
- Den Laden zur ganzen Fläche machen, mit Knöpfen „Laden“ und „Bauen“ unten.
- Förderbänder durch Ziehen aufteilen und zusammenführen.
- Spielstand speichern.

**Fragen, die wir uns gestellt haben:**
- Wie zieht man Förderbänder mit dem Finger, ohne dass die Karte mitwandert? → Ein Finger legt Bänder, zwei Finger bewegen die Karte.
- Wie teilt man eine Strecke ohne Verteiler? → Von einem bestehenden Band aus ziehen fügt einen Ausgang hinzu.
- Was passiert, wenn der Finger beim Ziehen kurz auf gesperrte Fläche rutscht? → Die Strecke pausiert und geht weiter, sobald der Finger zurück ist.
- Wie schützen wir Spielstände vor Beschädigung? → Jeder Spielstand wird beim Laden geprüft; ist er kaputt, startet ein neues Spiel mit Hinweis.

**Gemacht:**
- Laden-Gebäude entfernt; das Grundstück trägt das Schild „Dein Laden“. Laden-Fenster mit Inventar-Platzhalter.
- Bauleiste, Vorschau beim Platzieren (grün/rot), Werkzeugleiste mit Drehen, Abbrechen, Bauen/Fertig.
- Förderbänder mit Kurven, Aufteilen, Zusammenführen, Anschluss an Gebäude, Drehen, Wisch-Abriss.
- Ein- und Ausgangspfeile an Gebäuden, Sägewerk als drittes Gebäude.
- Infofenster mit Aktionen, Rückfragen beim Abreißen und bei „Neues Spiel“, kurze Meldungen.
- Automatisches Speichern im Browser mit Prüfung beim Laden.
- 44 automatische Tests und ein Browser-Test, der alles per Touch auf Tablet- und Handygröße durchspielt – alle bestanden.
- Beim Browser-Test gefunden und behoben: Nach schnellem Wischen verschluckte Chrome den nächsten Knopfdruck; Namen verdeckten Pfeile und Symbole; der Auswahlrahmen lief durch den Namen.

### v0.3.0 – Spielfeld (05.11.2026)

**Vorgenommen:**
- Der erste Spielcode: ein Spielfeld, das man auf Tablet und Handy im Querformat bedienen kann.
- Das Spiel zum ersten Mal live schalten.

**Fragen, die wir uns gestellt haben:**
- Wie fühlt sich Verschieben und Zoomen per Touch an?
- Wie stellen wir sicher, dass man immer sieht, welche Version live ist?
- Wie testet Claude ohne eigenes Tablet?

**Gemacht:**
- Spielfeld mit Grundstück (16 × 10) und gesperrter Fläche, drei Startgebäude, Infofenster, obere Leiste mit Versionsnummer, Dreh-Hinweis im Hochformat, Vollbild-Knopf, App-Symbol.
- Code aufgeteilt in Spielregeln (`src/core/`) und Darstellung (`src/view/`), Gebäude als Datentabelle.
- 18 automatische Tests (Spielregeln, Kamera, Versionsnummer) und ein Browser-Test in Tablet-, Handy- und Hochformat-Größe, alle bestanden.
- Beim Browser-Test gefunden und behoben: Emojis wurden blass gezeichnet; auf dem Handy verdeckte der Name das Symbol.

### v0.2.0 – Spielkonzept & Fahrplan (05.11.2026)

**Vorgenommen:**
- Tobias' Antworten auf die 15 Rückfragen festhalten.
- Daraus ein Spielkonzept, einen ersten Rezeptbaum und einen Fahrplan ableiten.
- Den ersten Programmierschritt (v0.3.0) planen.

**Fragen, die wir uns gestellt haben:**
- Wie passen Fabrikspiel, Wirtschaftssimulation und Clash-of-Clans-Universum zusammen?
- Was davon geht ohne Server, was braucht einen?
- Wie entsteht der Anreiz, die Fabrik ständig umzubauen?
- Wie sieht der kleinste spielbare Kreislauf aus?

**Gemacht:**
- README neu gegliedert: Spielkonzept, Waren & Rezepte, Technik und Fahrplan sind neue Abschnitte; die alten „Bausteine“ sind im Spielkonzept und Fahrplan aufgegangen.
- Entscheidungen aus den Antworten eingetragen, neue offene Fragen gesammelt.
- Plan für v0.3.0 (Spielfeld) zur Freigabe beschrieben.
- Noch kein Spielcode (Regel 6).

### v0.1.1 – Korrektur Versionierung (05.11.2026)

**Vorgenommen:**
- Nach dem Merge von v0.1.0 einen Versions-Tag setzen.

**Fragen, die wir uns gestellt haben:**
- Was tun, wenn das Setzen von Tags nicht funktioniert?

**Gemacht:**
- Festgestellt: Claudes Arbeitsumgebung darf keine Tags pushen (die Verbindung wird jedes Mal abgelehnt).
- Versionierung umgestellt: Die Versionsnummer steht jetzt im Titel jedes Pull Requests und Merge-Commits. README und `CLAUDE.md` entsprechend korrigiert.

### v0.1.0 – Projektstart (05.11.2026)

**Vorgenommen:**
- Grundregeln der Zusammenarbeit festhalten.
- Prüfen, ob GitHub funktioniert.
- Projekt in Bausteine zerlegen und Rückfragen sammeln.
- Klären, woher wir Assets bekommen.

**Fragen, die wir uns gestellt haben:**
- Wie stellen wir sicher, dass jeder neue Chat weiß, woran wir arbeiten?
- Wie können wir bei Fehlern auf alte Versionen zurückgehen?
- Woher kommen Grafiken, damit das Spiel später anschaulich wird?

**Gemacht:**
- README zum Projektgedächtnis ausgebaut (Regeln, Ablauf, Bausteine, Entscheidungen, offene Fragen, Historie, Protokoll).
- `CLAUDE.md` angelegt, die Claude in jedem neuen Chat automatisch auf die README verweist.
- Ablauf Branch → Pull Request → Merge einmal komplett durchgespielt.
- Noch kein Spielcode (Regel 6).

---

## 10. Gesprächsprotokoll

### 05.11.2026 – Chat 2, Teil 2: Feedback zu v0.4.0 & neues Produktionskonzept

**Feedback von Tobias:** Alles getestet, es läuft sehr gut. Kleiner grafischer Fehler: Getrennte Förderbänder sehen an den Abzweigungen „unsauber“ aus (Screenshot mit blau markierter Spalte von Abzweigen).

**Neues Produktionskonzept von Tobias:**
- Holz und Steine muss man kaufen, z. B. beim Händler. Ein gekaufter Holzstamm wird auf den Holzfäller gelegt, der daraus z. B. in 15 Minuten 200 Holzblöcke herstellt.
- Die Holzblöcke werden im Sägewerk zu Winkeln oder Stäben weiterverarbeitet, z. B. 5 Sekunden pro Holzblock. Das Sägewerk stellt man so ein, dass es nur Winkel oder nur Stäbe herstellt.
- Beispiel: Einen Holzfäller auf 4 Strecken verteilen → 4× Holzblöcke. Davon je eine Strecke in die Produktion von Winkeln und von Stäben, zwei Strecken laufen weiter, weil ein späteres Rezept z. B. Holzblöcke und Splitt braucht.
- Es soll nur Lagerhäuser als Zwischenstation geben, z. B. „hier 200 Stäbe zwischenlagern“; die Waren können aber auch weiterlaufen. Nur in diesen Lagern kann man Ware lagern.
- Wie kommt die Ware von der Produktion in den Laden? Idee: ein „Versandportal“, das die Ware direkt in den Laden schickt. Im Laden gibt es ein Lager mit Verkaufstheken; je nach Level bzw. Größe einer Theke kann man dort z. B. 20 Winkel platzieren und verkaufen – zu einem „normalen“ Preis an NPCs.
- Zusätzlich die Ware am Schwarzmarkt anbieten, sodass der Online-Markt die Preise bestimmt – noch unsicher, ob und wie das Sinn ergibt. Weitere Idee: Alle Läden sind verbunden; wenn alle Winkel anbieten, sinkt der Preis für Winkel.
- Endet eine Strecke z. B. an einem Förderband, bleibt alles stehen und es wird nicht weiter produziert, weil das Band voll ist.

**Umgesetzt:** v0.4.1 (Abzweigungen), siehe Versionshistorie. Das neue Konzept steht in den Abschnitten 3, 4 und 6; die offenen Punkte in Abschnitt 8.

### 05.11.2026 – Chat 2: Feedback zu v0.3.0 & v0.4.0

**Feedback von Tobias:**
- v0.3.0 funktioniert und läuft auf dem Tablet.
- Speichern gerne schon jetzt einbauen.
- Alles soll sich drehen und verschieben lassen, aber auch löschen, damit man den Fokus auf eine neue Fabrik legen kann.
- Der Laden soll kein Gebäude sein, sondern die komplette Fläche, auf der gebaut werden kann. Unten gibt es einen Knopf „Laden“: Dort sieht man sein ganzes Inventar, also alles, was man in seinen „Lagern“ hergestellt hat, und kann es zum Verkauf anbieten.
- Außerdem einen Knopf „Bauen“ für Sägewerk, Förderbänder usw.
- Förderbänder: mehrere Strecken zusammenlegen können, ohne Verteiler; 1 Strecke durch einfaches Ziehen in 4 aufteilen.
- Die Pfeile für Ein- und Ausgänge sind gut.
- Freigabe für v0.4.0.

**Umgesetzt:** v0.4.0 (siehe Versionshistorie).

**Claudes Hinweise:**
- Ein Band-Feld kann in bis zu 3 Richtungen abzweigen (eine Seite ist der Zulauf). Für 4 Strecken zweigt man zweimal ab, z. B. erst in 2 und jede davon noch einmal.
- Wie die „Lager“ genau funktionieren, entscheidet sich mit v0.5.0 (offene Frage 2).

### 05.11.2026 – Chat 1, Teil 3: Feinschliff des Konzepts & v0.3.0

**Antworten von Tobias:**
- Online-Teil ganz am Ende; zuerst ein funktionierendes Spielsystem. Claudes Ideen dürfen ergänzt werden, Tobias liefert den groben Rahmen.
- Die Fabrik läuft, bis die Lager voll sind oder keine Rohstoffe mehr da sind, um die Produktion voranzutreiben.
- Preise sollen je nach Bedarf schwanken (eine Tür bringt mal mehr, mal weniger), damit das Wirtschaftsgefühl entsteht.
- Rezeptentwurf passt. Grundzutaten sind Holz und Stein, daraus kleinere Dinge wie Holzblöcke und Steinblöcke, daraus Winkel und Stäbe; für Stein analog.
- GitHub Pages ist auf `main` / `(root)` umgestellt.
- Frage 1 (Draufsicht): ja, am Anfang lieber alles einfacher.
- Frage 2 (Verkauf per Knopfdruck): ja, für den Anfang.
- Frage 3 (Bauzeiten): Nach einem Aufstieg kann man alles sofort bauen, wenn Gold und Rohstoffe reichen. Der Laden-Ausbau geht auch sofort, hängt aber an Produktionen, z. B. 200 Zahnräder, 200 Splitt und 500 Gold. So muss man ständig Neues produzieren und „wartet“ dadurch.
- Frage 4: mit Frage 3 beantwortet.
- Frage 5 (Forschung): später. Idee: Jeder Laden-Aufstieg gibt Punkte (z. B. 10 für Level 2), mit denen man neue Dinge freischaltet, etwa das Sägewerk.
- Frage 6 (Offline): läuft, bis Ware leer oder Lager voll.
- Frage 7 (Rezepte): sehr gut.
- Frage 8 (Geschäftsmodell): alles kostenlos; später Geld über Season Pass oder Skins; Pay2Win nicht im Fokus.
- Frage 9 (Arbeitstitel): noch keiner, kommt im Laufe der Entwicklung.

**Umgesetzt:** v0.3.0 (Spielfeld), siehe Versionshistorie. Claude hat die Antwort als Freigabe für den Plan von v0.3.0 gewertet.

**Hinweis:** Die Live-Seite (github.io) ist aus Claudes Arbeitsumgebung nicht erreichbar. Claude prüft deshalb vor dem Merge mit einem eigenen Browser-Test und danach den Veröffentlichungs-Status auf GitHub.

### 05.11.2026 – Chat 1, Teil 2: Antworten & Spielkonzept

**Vorbild:** Das Spiel war *Alchemy Factory*. Gefallen hat Tobias vor allem:
- Alles ist sehr klein, man baut seine eigene kleine Fabrik.
- Ein Rohstoff verzweigt sich: Holz wird zerkleinert, daraus entstehen zwei, drei andere Dinge, die wiederum durch weitere Geräte laufen. So lässt sich immer weiter skalieren.

**Recherche:** Claude hat sich Alchemy Factory im Netz angesehen. Das Grundprinzip bestätigt sich: mittelalterliche Automatisierung, Förderbänder verbinden alles, Werkstätten wie Sägen und Mühlen werden erforscht, insgesamt rund 150 Waren. Detailseiten (Fan-Wiki, Artikel) sind aus Claudes Umgebung gesperrt. Wir entwerfen ohnehin einen eigenen Rezeptbaum.

**Große Vision:** ein Mobile-Spiel im Stil von Clash of Clans: Clans beitreten, mit anderen Spielern handeln. Je mehr Spieler mitspielen, desto lebendiger und schwankender wird der Markt, ähnlich wie bei Hay Day. Hauptfaktor bleibt: eigene Fabrik bauen und Waren verkaufen oder weiterverarbeiten.

**Antworten auf die Rückfragen:**
- **2 Schwerpunkt:** das Bauen. Leitfragen: Wie ist die Wirtschaftslage? Was wird zu welchem Preis gebraucht? Was baue ich, um genug Geld zum Wachsen zu verdienen?
- **3 Ansicht:** im Stil von Clash of Clans (siehe offene Frage 1).
- **4 Setting:** Mittelalter, damit Werkzeuge und Waren einfach bleiben, z. B. mit zwei Grundbausteinen Holz und Stein.
- **5 Rohstoffe:** Start mit Hauptgebäude (Verkaufsladen), Holzfällerlager und Steinbruch. Dann z. B. ein Sägewerk für Bretter, aus Brettern erste Einzelteile wie Winkel und Zahnräder; für Stein analog. Jedes Erzeugnis lässt sich im Laden verkaufen. Mit Gold erweitert man den Laden und schaltet neue Produktionen und Rohstoffe frei. Manche Waren kann man kaufen oder selbst herstellen, z. B. eine Tür aus 4 Winkeln, 5 Brettern und 10 Steinnägeln, die über Förderbänder in die Schreinerei laufen.
- **6 Verkauf:** im Laden oder auf dem Schwarzmarkt, der von allen Spielern beeinflusst wird. Gold braucht man zum Leveln, Freischalten und um mehr Platz zu kaufen.
- **7 Forschung:** Idee: Forschungspunkte schalten Produktionen frei, Gold kauft Rohstoffe. Noch nicht sicher.
- **8 Zeit:** Echtzeit, Fokus auf der Produktion. Man muss immer wieder umbauen, je nachdem was der Markt braucht und was am meisten Geld bringt.
- **9 Ziel:** wie in Clash of Clans: Jedes Laden-Level schaltet Neues frei, höhere Level kosten mehr. Pleite gehen soll nicht möglich sein, weil man Holz und Stein immer zum Spottpreis verkaufen kann.
- **10 Spielrunde:** Fokus auf der optimalen Fabrik. Immer mehr Platz kaufen, um größer und mächtiger zu werden. Täglich reinschauen: Rohstoffe abholen, Sachen bauen, prüfen, was sich umzubauen lohnt.
- **11 Technik:** mit Web starten, später erweitern.
- **12 Bildschirm:** Handy und Tablet, nur Querformat wie Clash of Clans.
- **13 Sprache:** erstmal nur Deutsch.
- **14 Versionen:** Schema passt. Nur ein einziger spielbarer Link; Neues wird direkt dort getestet, bei Problemen geht es zurück zur alten Version.
- **15 Schrittgröße:** lieber klein; viele Kleinigkeiten dürfen in einen größeren Schritt.

**Claudes Einordnung:** Fabrikspiel, Wirtschaft und Clan-Universum passen zusammen, sind aber drei große Blöcke. Der Online-Teil braucht einen Server (Kosten, Datenschutz, Schummelschutz, Moderation). Reihenfolge deshalb: zuerst eine Fabrik, die allein Spaß macht, mit Computer-Händlern und schwankender Nachfrage. Danach den Online-Markt und die Clans andocken. Computer-Händler braucht es auch im Online-Spiel, damit der Markt bei wenigen Spielern nicht leer ist.

### 05.11.2026 – Chat 1: Kickoff

**Idee:** Tobias hat ein Spiel über einen Alchemisten-Laden gesehen. Gefallen hat vor allem:
- Viele Grundstoffe herstellen, um daraus viele andere Dinge zu bauen.
- Der Wirtschaftsaspekt: Man muss wirtschaften, um Neues freizuschalten und Materialien zu kaufen.

Wir bauen ein eigenes Spiel mit ähnlichem Prinzip, keinen Nachbau.

**Regeln:** siehe Abschnitt 1.

**GitHub-Check:**
- Repo `tobiasimhof/ErstesSpiel` ist erreichbar und öffentlich, Claude hat Schreibrechte.
- Weil das Repo öffentlich ist, kann das Spiel kostenlos über GitHub Pages live gehen.
- Branch pushen, Pull Request erstellen und mergen funktioniert.
- Versions-Tags kann Claude nicht pushen. Deshalb steht die Versionsnummer im Titel jedes Merges (siehe Entscheidungen).

**Frage zu Assets:** Gibt es über GitHub eine Asset-Datenbank?
- GitHub selbst hat keine Asset-Datenbank, aber Assets können direkt im Repo liegen.
- Gute kostenlose Quellen:
  - **Kenney.nl**: tausende Grafiken, UI-Elemente und Sounds, Lizenz CC0 (keine Namensnennung nötig).
  - **game-icons.net**: über 4000 Icons (Tränke, Kräuter, Kristalle, Kolben …), Lizenz CC BY 3.0 (Namensnennung nötig). Claude kann sie auch über npm laden (`@iconify-json/game-icons`).
  - **OpenGameArt.org** und **itch.io**: viele freie Pakete, Lizenz je Paket prüfen.
  - **Emojis** als Platzhalter: sofort verfügbar, kein Aufwand.
- Hinweis: Kenney.nl, game-icons.net, OpenGameArt.org und itch.io sind aus Claudes Arbeitsumgebung aktuell gesperrt. Entweder Tobias schaltet die Domains in den Umgebungseinstellungen frei, oder Tobias lädt ein Paket herunter und gibt es Claude.
- Vorschlag: im Prototyp Emojis und einfache Formen. Sobald die Optik wichtig wird, einen einheitlichen Stil wählen und alle Lizenzen in einer `CREDITS.md` festhalten.
