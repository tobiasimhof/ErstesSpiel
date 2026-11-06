# ErstesSpiel

Erstes Spiel gecodet zusammen mit Claude.

Ein **Aufbau- und Fabrikspiel mit Wirtschaftssimulation im Mittelalter** (Arbeitstitel offen). Man baut auf einem kleinen Grundstück seine eigene Fabrik. Rohstoffe wie Holzstämme kauft man beim Händler, verarbeitet sie zu Holzblöcken und schickt diese über Förderbänder durch Werkstätten, wo immer komplexere Waren entstehen. Das ganze Grundstück ist der eigene Laden; die Waren verkauft man dort oder auf dem Schwarzmarkt. Mit dem Gold baut man den Laden aus, schaltet neue Produktionen frei und kauft mehr Fläche. Ziel ist ein Spiel für Handy und Tablet im Querformat, später mit Clans und einem gemeinsamen Markt aller Spieler.

| | |
|---|---|
| **Aktuelle Version** | v0.8.0 – Eisenstange statt Eisennägel |
| **Phase** | M1 – Fabrik-Grundgerüst |
| **Spielen (live)** | https://tobiasimhof.github.io/ErstesSpiel/ |
| **Nächster Schritt** | Neuer Chat: Tobias spielt kurz v0.8.0 (Eisenstangen; zum Beurteilen des Verkaufstempos den Testmodus ausschalten – er beschleunigt auch die Kunden ×10). Danach stellt Claude den **Plan für v0.9.0 – Techbaum, Teil 2** vor (Entwurf der Rezepte mit Eisenstange in Abschnitt 4.2, Stichpunkte in Abschnitt 6 unter „Ausblick v0.9.0“), Tobias gibt ihn frei, dann wird programmiert |

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
- `C` steigt bei einer reinen Fehlerkorrektur oder einem reinen README-Update ohne Änderung am Spiel (z. B. `v0.3.0` → `v0.3.1`).
- `v1.0.0` = erste vollständige, rund spielbare Version.

**Schrittgröße:** lieber kleine Schritte. Viele Kleinigkeiten dürfen in einem größeren Schritt zusammengefasst werden.

**Zurückgehen:** Jede Version ist ein eigener Merge auf `main`, erkennbar an der Versionsnummer im Titel. Läuft nach einem Merge etwas schief, stellt Claude den Stand einer älteren Version wieder her. Der Live-Link zeigt dann wieder die alte Version.

---

## 3. Spielkonzept

### 3.1 Vision

- **Schwerpunkt: die optimale Fabrik bauen.** Die Wirtschaft gibt vor, *was* sich gerade zu bauen lohnt: Was wird gebraucht, zu welchem Preis, und womit verdiene ich genug, um weiter zu wachsen?
- **Leitidee (Tobias):** Das Spiel lebt von der optimalen Produktionsstätte. Am Anfang braucht man vieles aus Holz, also lohnen sich Sägewerke. Später braucht man nur noch einzelne Holzteile und dafür mehr von anderem, also baut man die Holzproduktion zurück und anderes aus. So bleibt das Spiel bis in hohe Level spannend.
- **Setting:** Mittelalter. Werkzeuge und Waren bleiben einfach. Es gibt drei Grundstoffe, die nach und nach dazukommen: **Holz** (Level 1), **Stein** (Level 2) und **Eisen** (Level 3).
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

- Das Grundstück besteht aus quadratischen Feldern (Raster). Man startet mit **22 × 14 Feldern** (seit v0.6.1, vorher 16 × 10) und kauft später Fläche dazu, immer teurer. Ringsum liegt gesperrte Fläche (Welt 40 × 26), die man später kaufen kann.
- **Der Laden ist das ganze Grundstück**, kein einzelnes Gebäude. Darauf stehen zu Beginn ein Holzfällerlager, ein Steinbruch und (seit v0.7.0) ein Versandportal.
- Gebäude belegen mehrere Felder und haben Ein- und Ausgänge. **Größen (Tobias, 06.11.2026):** Maschinen 2 × 2 (damit sie später zwei Eingänge für zwei verschiedene Rohstoffe haben können), alles andere kleiner: Förderbänder 1 × 1, Lagerhaus 2 × 1, Versandportal 1 × 1.
- **Förderbänder** verbinden die Gebäude und transportieren Waren Stück für Stück.
- **Aufteilen und Zusammenführen durch Ziehen**, ohne Verteiler-Gebäude: Zieht man von einem bestehenden Band aus, teilt es sich auf (bis zu 3 Richtungen pro Feld; mehrfach aufteilen ergibt 4 und mehr Strecken). Zieht man auf ein bestehendes Band, laufen beide zusammen. Abzweigungen verteilen die Waren abwechselnd.
- **Ein- und Ausgänge** sind als Pfeile am Gebäude zu sehen: blau = Eingang, orange = Ausgang.
- **Rohstoffe kauft man beim Händler**, z. B. einen Holzstamm. Den legt man in das Holzfällerlager, das daraus nach und nach Holzblöcke herstellt (Beispiel: 1 Holzstamm → 200 Holzblöcke in 15 Minuten). **Es passt immer nur ein Holzstamm hinein.** Stein läuft genauso: Felsbrocken kaufen → Steinbruch → 200 Steinblöcke.
- **Maschinen** verarbeiten nach Rezept. Man stellt ein, was sie herstellen (Modus A oder B), z. B. Sägewerk → Holzplatte oder Holzstab (5 Blöcke → 1 Teil). Der festgelegte Techbaum steht in Abschnitt 4.2. Später kann es auch Maschinen geben, die mehrere Rohstoffe verarbeiten.
- **Typischer Aufbau:** Ein Holzfällerlager wird auf 4 Strecken verteilt. Zwei davon gehen in Sägewerke (eins auf Winkel, eins auf Stäbe eingestellt), zwei laufen weiter für spätere Rezepte, die Holzblöcke direkt brauchen (z. B. zusammen mit Splitt).
- **Stau:** Ist ein Band voll (z. B. weil es im Nichts endet), bleibt alles stehen und davor wird nicht weiter produziert.
- **Lagerhäuser** sind die einzige Möglichkeit, Waren zu lagern. Sie sind Zwischenstationen und eine Art Verteiler: 2 × 1 Felder, 3 Fächer zu je 50 Waren, **Eingang oben links, Ausgang unten rechts** – deshalb lagert man sinnvollerweise nur eine Sorte, z. B. 3 × 50 Holzblöcke. Was hineinläuft, läuft weiter, sobald am Ausgang Platz ist.
- **Versandportal:** 1 × 1 Feld mit **einem** Eingang (dreht mit). Waren, die hineinlaufen, landen direkt im Laden.
- **Kombinations-Maschinen** (Techbaum) brauchen zwei verschiedene Zutaten, z. B. Mühlenbauer: 1 Stein-Zahnrad + 1 Eisenstange → Mechanischer Schalter (Entwurf, seit v0.8.0 mit Eisenstange statt Nägeln).
- Eine Werkstatt kann mehrere Rezepte. Man stellt ein, was sie gerade herstellt.
- **Umbauen ist leicht und günstig** (verschieben, drehen, abreißen mit Rückerstattung), weil man sich ständig an den Markt anpasst. Das gilt für alle Gebäude, auch die Startgebäude, damit man den Schwerpunkt der Fabrik jederzeit neu setzen kann.
- **Bauen geht sofort**, sofern man die Waren dafür hat. Es gibt keine Bauzeiten.
- **Bauen kostet Waren statt Gold** (Tobias, v0.7.0): z. B. Förderband 1 Holzblock, Sägewerk 40 Holzblöcke. Die Waren kommen aus dem Laden-Lager. So muss man abwägen: verkaufen oder damit eine weitere Maschine bauen? Abreißen gibt die bezahlten Waren zurück; Verschieben und Drehen sind kostenlos. Tabelle in Abschnitt 4.2.

### 3.4 Wirtschaft

- **Zuerst feste Preise**, damit die Spielmechanik einfach bleibt. Weiterverarbeiten muss sich lohnen (Beispiel von Tobias): Kostet ein Holzstamm 50 Gold, bringen die 200 Holzblöcke daraus knapp über 50 Gold. Macht man daraus 40 Winkel (oder 20 Winkel und 20 Stäbe), bringt der Verkauf deutlich mehr. So kann man nach und nach die Produktion ausbauen.
- **Platzhalter-Preise im Spiel** (alles ×10, damit es nur ganze Goldbeträge gibt): Holzstamm/Felsbrocken 550 Gold (Kauf) → 200 Blöcke à 3 Gold = 600 Gold (+9 %) → 40 Teile à 18 Gold = 720 Gold (+31 %). Ein Test prüft, dass jede Stufe mehr bringt als die vorige.
- **Laden:** Der Knopf „Laden“ unten links öffnet den Laden mit den Reitern **Lager**, **Theken** und **Händler** (seit v0.7.0). Er hat ein eigenes **Lager** (gefüllt über das Versandportal) und **Verkaufstheken**. Die Theken bestückt man **von Hand** mit dem, was man verkaufen möchte; je nach Level bzw. Größe einer Theke passen darauf z. B. 20 Winkel. **Kunden kommen zufällig vorbei und kaufen zufällig viel**, z. B. der eine 2 Zahnräder und 1 Splitt, der nächste 3 Winkel – zu einem „normalen“ Preis. Später darf der Laden interaktiver werden; für den Anfang reicht die Übersicht.
- **Händler:** Hier kauft man Rohstoffe wie Holzstämme. **Verkaufen kann man nur über die Theken**, nicht an den Händler (Tobias, v0.7.0): Was man nicht mehr braucht, verkauft man über die Theken; vieles braucht man später noch, deshalb lohnt sich ein gemischtes Lager.
- **Nachfrage:** Wer viel von einer Ware verkauft, drückt ihren Preis. Mit der Zeit erholt er sich wieder. Dazu kommen Trends, z. B. „Die Stadt baut eine Mauer: Steinblöcke +50 % für 2 Tage“. Eine Tür bringt also mal mehr, mal weniger Gold, je nachdem, wie gefragt sie gerade ist. So entsteht das Wirtschaftsgefühl, und es lohnt sich, je nach Marktlage umzubauen.
- **Start:** Kein Startgold. Der erste Holzstamm und der erste Felsbrocken sind gratis, dazu 20 Holzblöcke für die ersten Förderbänder zum Versandportal.
- **Pleiteschutz:** Bei absoluter Pleite bekommt man einen Holzstamm geschenkt (Idee von Claude, von Tobias für gut befunden). „Pleite“ heißt: weniger Gold als ein Holzstamm kostet, kein Rohstoff im Lager oder in Arbeit, und alle Waren (Lager, Theken, Fabrik) zusammen sind weniger wert als ein Holzstamm.
- **Rohstoffe und Erträge:** Stein kostet so viel wie Holz und bringt ähnliche Erträge. Eisen kostet deutlich mehr, bringt aber auch mehr Gold. So verdient man mit jedem neuen Rohstoff mehr – und frühere Produkte verlieren ihren Wert nicht, weil sie für spätere Rezepte gebraucht werden.
- **Kaufen statt herstellen:** Jede Ware kann man auch kaufen, z. B. eine fertige Tür. Das ist teurer als selbst herstellen, spart aber Platz und Zeit.
- **Schwarzmarkt** (später, online, noch unsicher): Spieler bieten Waren zu eigenen Preisen an; der Online-Markt bestimmt die Preise. Idee von Tobias: Alle Läden sind verbunden – bieten alle Winkel an, sinkt der Preis für Winkel. Computer-Händler sorgen dafür, dass der Markt auch mit wenigen Spielern lebendig ist.

### 3.5 Fortschritt

- **Laden-Level**, ähnlich dem Rathaus in Clash of Clans: Jede Stufe schaltet neue Werkstätten, Rezepte, Lagerplatz und Fläche frei. Jede Stufe wird teurer. **Rohstoffe nach Level:** Holz ab Level 1, Stein ab Level 2, Eisen ab Level 3.
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

### 4.1 Techbaum von Tobias (Entwurf vom 06.11.2026)

Abgeschrieben aus Tobias' Tabelle. Jede Maschine hat zwei Modi (A und B), zwischen denen man umschaltet.

**Grundmaschinen** (eine Zutat):

| Grundstoff | Maschine | Modus A (Fläche) | Modus B (spezifisches Teil) |
|---|---|---|---|
| Holzstamm | Holz-Werkbank | Holzplatte | Holzstab |
| Steinfels | Steinmetz-Station | Steinplatte | Stein-Zahnrad |
| Eisenerz | Schmiedeofen | Mini-Eisenplatte | Eisennägel |

**Kombinations-Maschinen** (zwei verschiedene Zutaten):

| Maschine | Modus A | Modus B |
|---|---|---|
| Kombi-Werkbank (Holz + Eisen) | Verstärkte Holzplatte (1 Holzplatte + 2 Eisennägel) | frei für spätere Rezepte |
| Mechanik-Station (Stein + Holz / Eisen) | Mechanischer Schalter (1 Stein-Zahnrad + 2 Eisennägel) | Handkurbel (1 Holzstab + 1 Stein-Zahnrad) |
| Fein-Montage (Stein + Holz / Eisen) | Mörser & Stößel (1 Steinplatte + 1 Holzstab) | Scharnier (1 Mini-Eisenplatte + 2 Eisennägel) |

**Weiterverarbeitung** (aus Kombi-Teilen):

| Maschine | Modus A | Modus B |
|---|---|---|
| Präzisions-Schmiede | Kugellager (1 Scharnier + 2 Eisennägel) | Eisenfeder (1 Mini-Eisenplatte + 2 Eisennägel) |
| Getriebe- & Ketten-Werkstatt | Steinkette (2 Stein-Zahnräder + 2 Eisennägel) | Regler (1 Mechanischer Schalter + 1 Handkurbel) |
| Sicherheits-Montage | Mini-Schloss (1 Scharnier + 1 Mechanischer Schalter) | frei für spätere Rezepte |

**Seit v0.8.0:** Eisennägel gibt es nicht mehr; die Schmiede macht stattdessen Eisenstangen (5 Eisenbarren → 1). In den Rezepten oben wird „2 Eisennägel“ zu „1 Eisenstange“ (Entwurf in 4.2).

Die Maschinennamen in dieser Tabelle waren nur zur Orientierung gedacht; die endgültigen Namen hat Claude ausgesucht (Abschnitt 4.2). Die Tabelle „Entwurf 1“ (Tür, Kiste, Leiter, Mahlwerk, Brunnen …) ist damit überholt.

### 4.2 Festgelegter Techbaum (Stand 06.11.2026)

Von Tobias bestätigt (Chat 3, Teil 2). Mengen, Zeiten und Preise hat Claude vorgeschlagen; Tobias hat sie mit dem Plan für v0.6.0 zum Ausprobieren freigegeben (Chat 4): „erstmal so umsetzen und dann schauen, wie es wirkt“. Alle Goldbeträge ×10.

**Kette je Rohstoff:** Rohstoff kaufen → Block-Gebäude (1 Rohstoff → 200 Blöcke in 15 Minuten) → Grundmaschine (5 Blöcke → 1 Teil). Diese Block-Stufe bleibt für alle drei Rohstoffe (Tobias: „weiterhin wichtig und richtig“).

**Gebäude** (Maschinen 2 × 2, alles andere kleiner):

| Gebäude | Größe | Aufgabe | Freigeschaltet ab |
|---|---|---|---|
| Holzfällerlager | 2 × 2 | 1 Holzstamm → 200 Holzblöcke | Level 1 |
| Steinbruch | 2 × 2 | 1 Felsbrocken → 200 Steinblöcke | Level 2 |
| Schmelzhütte (neu) | 2 × 2 | 1 Eisenerz → 200 Eisenbarren | Level 3 |
| Sägewerk | 2 × 2 (bisher 2 × 1) | A: Holzplatte · B: Holzstab | Level 1 |
| Steinmetz | 2 × 2 (bisher 2 × 1) | A: Steinplatte · B: Stein-Zahnrad | Level 2 |
| Schmiede (neu) | 2 × 2 | A: Mini-Eisenplatte · B: Eisenstange (bis v0.7.1: Eisennägel) | Level 3 |
| Mühlenbauer (Kombi) | 2 × 2 | A: Mechanischer Schalter · B: Handkurbel | Level 2 (Schalter braucht eine Eisenstange, also praktisch ab Level 3) |
| Zimmerei (Kombi) | 2 × 2 | A: Verstärkte Holzplatte · B: frei | Level 3 |
| Feinwerkstatt (Kombi) | 2 × 2 | A: Mörser & Stößel · B: Scharnier | Level 3 |
| Feinschmiede | 2 × 2 | A: Kugellager · B: Eisenfeder | Level 4 |
| Getriebebauer | 2 × 2 | A: Steinkette · B: Regler | Level 4 |
| Schlosserei | 2 × 2 | A: Mini-Schloss · B: frei | Level 4 |
| Lagerhaus | 2 × 1 | Zwischenlager, 3 × 50 | Level 1 |
| Versandportal | 1 × 1 | schickt Waren ins Laden-Lager | Level 1 |
| Förderband | 1 × 1 | transportiert | Level 1 |

Namen aus Tobias' Tabelle → Spiel: Holz-Werkbank → Sägewerk, Steinmetz-Station → Steinmetz, Schmiedeofen → Schmiede, Steinfels → Felsbrocken, Kombi-Werkbank → Zimmerei, Mechanik-Station → Mühlenbauer, Fein-Montage → Feinwerkstatt, Präzisions-Schmiede → Feinschmiede, Getriebe- & Ketten-Werkstatt → Getriebebauer, Sicherheits-Montage → Schlosserei. Die Warennamen bleiben wie in Tobias' Tabelle. Alle Namen lassen sich jederzeit ändern.

**Anschlüsse der 2 × 2-Maschinen** (Grundmaschinen seit v0.6.0 im Spiel): Grundmaschinen: Eingang links oben, Ausgang rechts oben (gerade Linie; bestehende Bänder am Sägewerk bleiben angeschlossen). Kombi- und Weiterverarbeitungs-Maschinen: zwei Eingänge links oben und links unten (jeder nimmt jede passende Zutat), Ausgang rechts oben. Block-Gebäude unverändert (Ausgang rechts oben).

**Rezepte und Preise** (Holz, Stein und Eisen bis zu den Grundmaschinen im Spiel, Eisenstange seit v0.8.0; alles ab „Handkurbel“ ist ein **Entwurf für v0.9.0**, noch nicht freigegeben): Regel: Blöcke bringen knapp mehr als der Rohstoff kostet (+9 %), jedes weitere Teil rund 20 % mehr als seine Zutaten zusammen. So macht man beim Verkaufen in der Anfangsphase nie Minus. Stein kostet und bringt so viel wie Holz; Eisen kostet viermal so viel und bringt entsprechend mehr.

| Ware | Herstellung | Zeit | Wert (Gold) |
|---|---|---|---|
| Holzstamm | beim Händler kaufen | – | 550 (Kauf) |
| Felsbrocken | beim Händler kaufen | – | 550 (Kauf) |
| Eisenerz | beim Händler kaufen | – | 2.200 (Kauf) |
| Holzblock / Steinblock | Holzfällerlager / Steinbruch | 4,5 s je Block | 3 (200 Stück = 600) |
| Eisenbarren | Schmelzhütte | 4,5 s je Barren | 12 (200 Stück = 2.400) |
| Holzplatte / Holzstab | Sägewerk: 5 Holzblöcke → 1 | 5 s | 18 (40 Stück = 720) |
| Steinplatte / Stein-Zahnrad | Steinmetz: 5 Steinblöcke → 1 | 5 s | 18 |
| Mini-Eisenplatte | Schmiede: 5 Eisenbarren → 1 | 5 s | 72 (40 Stück = 2.880) |
| Eisenstange (seit v0.8.0) | Schmiede: 5 Eisenbarren → 1 | 5 s | 72 (40 Stück = 2.880) |
| Handkurbel | Mühlenbauer: 1 Holzstab + 1 Stein-Zahnrad | 10 s | 43 (Zutaten 36) |
| Mechanischer Schalter | Mühlenbauer: 1 Stein-Zahnrad + 1 Eisenstange | 10 s | 108 (Zutaten 90) |
| Verstärkte Holzplatte | Zimmerei: 1 Holzplatte + 1 Eisenstange | 10 s | 108 (Zutaten 90) |
| Mörser & Stößel | Feinwerkstatt: 1 Steinplatte + 1 Holzstab | 10 s | 43 (Zutaten 36) |
| Scharnier | Feinwerkstatt: 1 Mini-Eisenplatte + 1 Eisenstange | 10 s | 173 (Zutaten 144) |
| Kugellager | Feinschmiede: 1 Scharnier + 1 Eisenstange | 15 s | 294 (Zutaten 245) |
| Eisenfeder | Feinschmiede: 1 Eisenstange (nur eine Zutat – im Plan klären) | 15 s | 86 (Zutaten 72) |
| Steinkette | Getriebebauer: 2 Stein-Zahnräder + 1 Eisenstange | 15 s | 130 (Zutaten 108) |
| Regler | Getriebebauer: 1 Mechanischer Schalter + 1 Handkurbel | 15 s | 181 (Zutaten 151) |
| Mini-Schloss | Schlosserei: 1 Scharnier + 1 Mechanischer Schalter | 15 s | 337 (Zutaten 281) |

**Eisenstange statt Eisennägel (v0.8.0):** Bis v0.7.1 machte die Schmiede aus 5 Barren 5 Nägel zu je 14 Gold. Tobias fiel beim Spielen auf, dass dadurch extrem viele Nägel entstehen (100–140 im Lager, von allem anderen etwa 20), und an der Theke brachten 20 Nägel nur 280 Gold. Jetzt läuft die Schmiede wie Sägewerk und Steinmetz: 5 : 1. Im Entwurf oben ersetzt „1 Eisenstange“ die bisherigen „2 Eisennägel“ (die Werte sind nach der +20-%-Regel neu gerechnet). Damit braucht jedes Eisen-Kombiteil 5 statt 2 Barren – Eisen wird gefragter. Nägel können später als eigene Stufe zurückkommen (z. B. 1 Eisenstange → mehrere Nägel).

**Freischalten nach Laden-Level** (von Tobias bestätigt): Level 1 Holz, Level 2 Stein (+ Mühlenbauer für die Handkurbel), Level 3 Eisen (+ Zimmerei, Feinwerkstatt), Level 4 Feinschmiede, Getriebebauer, Schlosserei. Den ersten Rohstoff jeder Sorte gibt es gratis: den ersten Holzstamm zum Spielstart, den ersten Felsbrocken beim Erreichen von Level 2, das erste Eisenerz bei Level 3. Bis es Laden-Level gibt (v0.10.0), ist alles sofort baubar.

**Baukosten** (seit v0.7.0, Platzhalter; Tobias: „erstmal spielen und schauen, ob es nicht zu lange dauert“):

| Gebäude | Kosten | entspricht etwa |
|---|---|---|
| Förderband (je Feld) | 1 Holzblock | 3 Gold |
| Versandportal | 10 Holzblöcke | 30 Gold |
| Sägewerk | 40 Holzblöcke | 120 Gold |
| Lagerhaus | 8 Holzplatten | 144 Gold |
| Holzfällerlager | 10 Holzplatten + 10 Holzstäbe | 360 Gold |
| Steinbruch | 10 Holzplatten + 5 Holzstäbe | 270 Gold |
| Steinmetz | 30 Steinblöcke + 5 Holzstäbe | 180 Gold |
| Schmelzhütte | 20 Steinplatten + 10 Holzplatten | 540 Gold |
| Schmiede | 10 Steinplatten + 30 Eisenbarren | 540 Gold |

Das Sägewerk kostet nur Holzblöcke, damit die erste Maschine ohne Platten baubar ist. Für Stein braucht man Holzteile, für Eisen Steinteile – so behalten frühere Waren ihren Wert. Kein Gebäude kostet mehr, als ein Holzstamm einbringt (ein Test prüft das).

**Holzwinkel und Splitt** fliegen raus (vielleicht kommen sie später wieder). Vorhandene im Spielstand werden umgewandelt: Holzwinkel → Holzplatte, Splitt → Stein-Zahnrad.

### 4.3 Im Spiel (Stand v0.8.0)

| Stufe | Ware | Woher | Rezept |
|---|---|---|---|
| 0 | Holzstamm, Felsbrocken, Eisenerz | Händler (550 / 550 / 2.200 Gold); 1 Holzstamm und 1 Felsbrocken gratis zum Start | – |
| 1 | Holzblock / Steinblock / Eisenbarren | Holzfällerlager / Steinbruch / Schmelzhütte | 1 Rohstoff → 200 Stück in 15 Minuten |
| 2 | Holzplatte / Holzstab | Sägewerk, Einstellung „Platten“ / „Stäbe“ | 5 Holzblöcke → 1 Teil (5 Sekunden) |
| 2 | Steinplatte / Stein-Zahnrad | Steinmetz, Einstellung „Platten“ / „Zahnräder“ | 5 Steinblöcke → 1 Teil (5 Sekunden) |
| 2 | Mini-Eisenplatte / Eisenstange | Schmiede, Einstellung „Platten“ / „Stangen“ | 5 Eisenbarren → 1 Teil (5 Sekunden) |

Die Kombinations-Maschinen und die Weiterverarbeitung (Abschnitt 4.2) kommen mit v0.9.0.

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
- **Zwischenspeicher:** GitHub Pages lässt Browser Dateien bis zu 10 Minuten zwischenspeichern. Nach einem Merge dauert es einige Minuten, bis die neue Version online ist. Zeigt das Spiel oben noch die alte Versionsnummer, kurz warten und neu laden.
- **Versionsnummer an jeder Datei (seit v0.7.1):** Eine Import-Map in `index.html` hängt an jede Programmdatei `?v=<Version>`. So lädt der Browser nach einem Update alle Dateien neu und mischt nie alte mit neuen (das hatte v0.7.0 am Start gehindert). `node tools/set-version.mjs A.B.C` schreibt die Map; ein Test prüft, dass keine Datei fehlt.
- **Startet das Spiel nicht,** erscheint eine Meldung mit dem Fehlertext statt eines schwarzen Bildschirms.

### 5.1 Projektstruktur

| Pfad | Inhalt |
|---|---|
| `index.html` | Startseite des Spiels (Gerüst der Oberfläche) |
| `manifest.webmanifest` | Angaben für „Zum Startbildschirm hinzufügen“ (Name, Symbol, Vollbild, Querformat) |
| `src/version.js` | Versionsnummer, wird im Spiel angezeigt |
| `src/main.js` | Verbindet Spielregeln, Kamera, Eingabe und Anzeige |
| `src/core/` | Spielregeln und Spielzustand, ohne Grafik |
| `src/core/data/buildings.js` | Datentabelle der Gebäude (Größe, Ein- und Ausgänge, Texte, Produktion) und Reihenfolge im Baumenü |
| `src/core/data/items.js` | Datentabelle der Waren (Name, Preise, Aussehen) |
| `src/core/data/recipes.js` | Datentabelle der Rezepte (Zutaten, Ergebnis, Zeit) |
| `src/core/data/shop.js` | Laden: Lagergröße und Theken je Level, Kunden-Takt, Startvorrat, Testpaket |
| `src/core/state.js` | Spielzustand anlegen, Abfragen auf dem Raster |
| `src/core/dirs.js` | Himmelsrichtungen (oben, rechts, unten, links) |
| `src/core/geometry.js` | Größe, Drehung, Felder sowie Ein- und Ausgänge von Gebäuden |
| `src/core/buildings.js` | Gebäude bauen, verschieben, drehen, abreißen, freie Stelle suchen |
| `src/core/belts.js` | Förderbänder legen, aufteilen, zusammenführen, drehen, abreißen |
| `src/core/production.js` | Was Gebäude tun: einlegen, herstellen, zwischenlagern, versenden, Status |
| `src/core/sim.js` | Simulation in festen Takten: Waren auf Bändern, Stau, Aufteilen, Zusammenführen |
| `src/core/shop.js` | Laden-Lager, Baukosten bezahlen und zurückgeben |
| `src/core/market.js` | Handel: Händler, Theken, Kunden (mit eigenem Zufall im Spielstand), Pleiteschutz, Testpaket |
| `src/core/save.js` | Spielstand in Text umwandeln, prüfen und alte Spielstände umwandeln |
| `src/view/camera.js` | Kamera: verschieben, zoomen, Bildschirm ↔ Welt umrechnen |
| `src/view/input.js` | Touch, Maus und Mausrad (Antippen, Ziehen, zwei Finger) |
| `src/view/controller.js` | Modi (Ansehen, Bauleiste, Platzieren, Förderband, Abreißen) und was Gesten darin tun |
| `src/view/renderer.js` | Zeichnet Spielfeld, Bänder, Waren, Gebäude mit Statuslicht, Vorschau |
| `src/view/itemArt.js` | Aussehen der Waren (auf dem Band und in Listen) |
| `src/view/hud.js` | Obere Leiste und Menü ☰ |
| `src/view/panels.js` | Infofenster, großes Fenster, Rückfragen, Meldungen |
| `src/view/shop.js` | Laden-Fenster mit den Reitern Lager, Theken, Händler |
| `src/view/format.js` | Texte für Zahlen, Waren und Kosten |
| `src/view/buildbar.js` | Untere Leisten: Laden/Bauen, Bauleiste, Werkzeugleiste |
| `src/view/press.js` | Knöpfe reagieren aufs Loslassen des Fingers (siehe Entscheidungen) |
| `src/view/storage.js` | Speichern und Laden im Browser |
| `src/style.css` | Aussehen der Oberfläche |
| `assets/icons/` | App-Symbole (erzeugt mit `tools/make-icons.py`) |
| `tools/set-version.mjs` | Setzt die Versionsnummer in `src/version.js` und `index.html` (inkl. Import-Map) |
| `tests/*.test.js` | Automatische Tests: Spielregeln, Gebäude, Förderbänder, Handel, Speichern, Kamera, Versionsnummer |
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

### Nächste Versionen (Reihenfolge von Tobias bestätigt)

| Version | Inhalt | Stand |
|---|---|---|
| v0.3.0 | **Spielfeld:** Raster, Startgebäude, verschieben und zoomen per Touch, erster Live-Gang | ✅ fertig |
| v0.4.0 / v0.4.1 | **Bauen & Speichern:** Bauleiste, Gebäude und Förderbänder bauen, verschieben, drehen, abreißen; Bänder aufteilen und zusammenführen; Spielstand bleibt erhalten; saubere Abzweigungen | ✅ fertig |
| v0.5.0 | **Produktion:** Rohstoff einlegen, Blöcke, Waren auf Bändern, Stau, Werkstätten mit Einstellung, Lagerhaus, Versandportal, Laden-Lager, Testmodus | ✅ fertig |
| v0.5.1 | **Kompakter:** Lagerhaus 2 × 1 (oben links rein, unten rechts raus), Versandportal 1 × 1 mit einem Eingang | ✅ fertig |
| v0.5.2 | **Techbaum festgelegt:** Antworten von Tobias, Namen, Größen, Preistabelle und Plan für v0.6.0 in der README (Spiel unverändert) | ✅ fertig |
| v0.6.0 | **Techbaum, Teil 1:** Grundmaschinen 2 × 2 mit neuen Modi (Sägewerk, Steinmetz, Schmiede), Eisen-Kette mit Schmelzhütte, Preistabelle | ✅ fertig |
| v0.6.1 | **Größeres Grundstück:** 22 × 14 statt 16 × 10 Felder, wächst nach rechts und unten | ✅ fertig |
| v0.7.0 | **Handel:** Händler (Rohstoffe kaufen), Laden mit von Hand bestückten Verkaufstheken, zufällige Kunden mit zufälligen Einkäufen, Gold; Bauen kostet Waren; Start ohne Gold mit Gratis-Holzstamm; Pleiteschutz | ✅ fertig |
| v0.7.1 | **Fehlerkorrektur:** Spiel startete nach dem Update nicht (alte und neue Dateien gemischt); Meldung statt schwarzem Bildschirm | ✅ fertig |
| v0.8.0 | **Eisenstange:** Schmiede macht Eisenstangen (5 : 1) statt Eisennägel (5 : 5); vorhandene Nägel werden umgewandelt | ✅ fertig |
| v0.9.0 | **Techbaum, Teil 2:** Kombinations-Maschinen mit zwei Zutaten und die Weiterverarbeitung (Kugellager, Regler, Mini-Schloss …) | als Nächstes planen |
| v0.10.0 | **Laden-Level:** Freischalten nach Level (Holz → Stein → Eisen), Laden-Ausbau mit Gold und Waren | |
| v0.11.0 | **Offline:** Fabrik läuft weiter, wenn das Spiel geschlossen ist | |

### Ausblick v0.9.0 – Techbaum, Teil 2 (Plan noch nicht besprochen)

Was bereits feststeht (Abschnitte 4.2 und 7) und in den Plan gehört:
- **6 neue Maschinen**, alle 2 × 2, je zwei Einstellungen: Mühlenbauer, Zimmerei, Feinwerkstatt (Kombi aus Grundteilen) sowie Feinschmiede, Getriebebauer, Schlosserei (Weiterverarbeitung).
- **Anschlüsse:** zwei Eingänge links oben und links unten (jeder nimmt jede passende Zutat), Ausgang rechts oben.
- **Rezepte und Werte:** Entwurf in Abschnitt 4.2 – seit v0.8.0 mit „1 Eisenstange“ statt „2 Eisennägel“; die Werte sind nach der +20-%-Regel neu gerechnet und müssen noch freigegeben werden.
- **Offene Punkte für den Plan:** Baukosten der 6 Maschinen in Waren (Tabelle wie in 4.2 fortsetzen); Eisenfeder hat im Entwurf nur eine Zutat (1 Eisenstange) – so lassen oder eine zweite Zutat?; die beiden freien Einstellungen (Zimmerei B, Schlosserei B); wie eine Werkstatt anzeigt, welche Zutat ihr noch fehlt; ob Kunden die teuren Teile genauso oft kaufen wie einfache.

### v0.8.0 – Eisenstange statt Eisennägel (fertig)

- **Schmiede:** Einstellung „Stangen“ statt „Nägel“ – 5 Eisenbarren → 1 Eisenstange in 5 Sekunden, Wert 72 Gold. Alle drei Grundmaschinen laufen jetzt gleich (5 : 1).
- **Eisenstange** sieht grau und kantig aus, mit hellem Glanzstreifen (der Holzstab ist rund und braun).
- **Bestehende Spielstände** (Spielstand-Version 5 → 6): Je 5 Eisennägel werden zu 1 Eisenstange, aufgerundet – im Laden-Lager, auf den Theken, in Lagerhäusern und in der Schmiede. Nägel, die gerade auf Bändern liegen, werden zusammengezählt und kommen als Stangen ins Laden-Lager. Eine Schmiede auf „Nägel“ steht danach auf „Stangen“. Beim Öffnen sagt eine Meldung, wie viele Nägel umgewandelt wurden (bei Tobias etwa 140 Nägel → 28 Stangen).
- Nägel-Verkäufe verschwinden aus „Letzte Verkäufe“.

### v0.7.1 – Startfehler behoben (fertig)

- **Fehler:** Nach dem Update auf v0.7.0 blieb das Spiel schwarz, oben stand nur „v“. Der Browser hatte die neue Startdatei geladen, die übrigen Dateien aber noch aus seinem Zwischenspeicher (v0.6.1) genommen; die passten nicht zusammen. Der Spielstand war nie in Gefahr.
- **Behoben:** Jede Programmdatei trägt jetzt die Versionsnummer (Import-Map), damit der Browser nach jedem Update alle Dateien neu holt.
- **Neu:** Startet das Spiel trotzdem einmal nicht, erscheint eine Meldung mit Fehlertext und „Neu laden“-Knopf.

### v0.7.0 – Handel (fertig)

**Neu im Spiel:**
- **Laden-Fenster mit drei Reitern:** 📦 Lager, 🛒 Theken, 🧺 Händler.
- **Händler:** Holzstamm und Felsbrocken je 550 Gold, Eisenerz 2.200 Gold. Gekauftes landet im Laden-Lager. Holzstamm, Felsbrocken und Eisenerz lassen sich auch direkt im Infofenster des Gebäudes kaufen.
- **2 Verkaufstheken** mit je einer Sorte, bis 20 Stück. „Ware wählen“ stellt eine Ware auf die Theke und füllt sie gleich auf; dazu +1, +5, „Auffüllen“ und „↩ Abräumen“ (zurück ins Lager).
- **Kunden** kommen alle 10–30 Sekunden und kaufen 1–3 Stück zum festen Wert. Oben erscheint kurz „+Gold“; im Reiter Theken stehen die letzten 5 Verkäufe und wann der nächste Kunde kommt.
- **Bauen kostet Waren** aus dem Laden-Lager (Tabelle in Abschnitt 4.2). Die Bauleiste zeigt die Kosten als kleine Warenbilder; was nicht reicht, ist ausgegraut und sagt beim Antippen, was fehlt. Förderbänder kosten 1 Holzblock je neues Feld; reichen die Holzblöcke nicht, endet die Strecke früher. Abreißen gibt bezahlte Waren zurück.
- **Neues Spiel:** 0 Gold, 1 Holzstamm, 1 Felsbrocken, 20 Holzblöcke; ein Versandportal steht schon zwischen Holzfällerlager und Steinbruch.
- **Pleiteschutz:** geschenkter Holzstamm mit Meldung.
- **Testmodus:** zusätzlicher Menüpunkt „🎁 Testpaket“ (1.000 Gold + je 50 von jeder Ware). Achtung: Das füllt das Laden-Lager stark (9 Waren × 50 = 450 Plätze).
- **Bestehende Spielstände** (Version 4 → 5): Fabrik, Gold und Lager bleiben; Theken und Kunden kommen dazu. Was schon stand, wurde nicht nachträglich berechnet – dafür gibt es beim Abreißen auch keine Baukosten zurück (gilt auch für die Startgebäude).

**Was Tobias testet:** Mit einem neuen Spiel (☰ → Neues Spiel) oder der bestehenden Fabrik: Waren auf die Theken stellen, Kunden kaufen lassen, beim Händler Rohstoffe kaufen, mit Waren bauen. Fühlt sich das Verkaufstempo richtig an? Dauert es zu lange, bis man sich ein Gebäude leisten kann? Sind die Baukosten stimmig?

### v0.6.1 – Größeres Grundstück (fertig)

- **Grundstück 22 × 14 Felder** statt 16 × 10. Es wächst nach rechts und unten; Gebäude und Bänder bleiben, wo sie sind. Die Welt drumherum wächst von 32 × 20 auf 40 × 26, damit später noch Fläche zum Kaufen bleibt.
- **Bestehende Spielstände** (Spielstand-Version 3 → 4) bekommen die größere Fläche beim nächsten Öffnen automatisch.
- Anlass: Tobias' Fabrik nach dem Test von v0.6.0 – für eine zweite Eisen-Linie fehlte der Platz.
- Dies ist eine Zwischenlösung bis „Fläche kaufen“ (Abschnitt 3.5); 22 × 14 ist dann die Startgröße.

### v0.6.0 – Techbaum, Teil 1 (fertig)

**Neu im Spiel:**
- **Waren nach Techbaum** (Abschnitt 4.2): Holzplatte, Holzstab, Steinplatte, Stein-Zahnrad, Eisenerz, Eisenbarren, Mini-Eisenplatte, Eisennägel – jede mit eigener Form auf dem Band und Wert aus der Preistabelle. Holzwinkel und Splitt gibt es nicht mehr.
- **Sägewerk und Steinmetz sind 2 × 2.** Sägewerk: Platten oder Stäbe, Steinmetz: Platten oder Zahnräder. Eingang links oben, Ausgang rechts oben.
- **Eisen-Kette:** Schmelzhütte 🔥 (1 Eisenerz → 200 Eisenbarren in 15 Minuten) und Schmiede 🔨 (5 Barren → 1 Mini-Eisenplatte oder 5 Eisennägel), beide 2 × 2.
- **Startvorrat:** zusätzlich 2 Eisenerz im Laden-Lager, bis es in v0.7.0 den Händler gibt.
- **Bestehende Spielstände** (Spielstand-Version 2 → 3): Sägewerk und Steinmetz wachsen auf der Seite gegenüber den Pfeilen (ungedreht nach unten), die Anschlüsse bleiben an ihrem Platz. Ist dort kein Platz, rücken sie an die nächste freie Stelle (Hinweis beim Öffnen, dann neu anschließen); geht auch das nicht, werden sie abgerissen und ihr Inhalt kommt ins Laden-Lager. Holzwinkel werden zu Holzplatten, Splitt zu Stein-Zahnrädern – im Lager, auf Bändern, in Gebäuden und bei den Einstellungen. Dazu gibt es 2 Eisenerz.
- Die Bauleiste hat jetzt 8 Gebäude; auf dem Handy lässt sie sich zur Seite wischen.

**Was Tobias testet:** Schmelzhütte bauen, Eisenerz einlegen, über die Schmiede Mini-Eisenplatten und Eisennägel herstellen; Sägewerk und Steinmetz umstellen; prüfen, ob die alte Fabrik richtig übernommen wurde; im Laden-Fenster die Werte ansehen. Wirken die Preise stimmig? Für schnelle Tests den Testmodus nutzen.

### v0.5.1 – Kompaktes Lagerhaus & Versandportal (fertig)

- **Lagerhaus:** 2 × 1 Felder statt 2 × 2. Eingang oben am linken Feld, Ausgang unten am rechten Feld; dreht mit.
- **Versandportal:** 1 × 1 Feld mit einem Eingang (links, dreht mit) statt 2 × 2 mit vier Eingängen.
- Bestehende Gebäude schrumpfen an Ort und Stelle. Beim Versandportal bleibt der linke Eingang an derselben Stelle; Bänder an den anderen Seiten und alle Bänder am Lagerhaus müssen neu angeschlossen werden. Der Inhalt des Lagerhauses bleibt erhalten.
- Das Statuslicht wird bei kleinen Gebäuden kleiner, damit es auf dem Handy das Symbol nicht verdeckt.

### v0.5.0 – Produktion (fertig)

**Neu im Spiel:**
- **Waren:** Holzstamm, Felsbrocken, Holzblock, Steinblock, Holzwinkel, Holzstab, Steinplatte, Splitt – als kleine Formen auf den Bändern zu sehen.
- **Startvorrat:** 3 Holzstämme und 3 Felsbrocken im Laden-Lager (bis es in v0.6.0 den Händler gibt). Bestehende Spielstände bekommen ihn beim ersten Öffnen dazu.
- **Rohstoff einlegen:** Holzfällerlager oder Steinbruch antippen → „Holzstamm einlegen“ bzw. „Felsbrocken einlegen“. Immer nur einer auf einmal. Daraus entstehen 200 Blöcke in 15 Minuten (alle 4,5 Sekunden einer).
- **Sägewerk** (Winkel oder Stäbe) und neu **Steinmetz** (Platten oder Splitt): im Infofenster umstellen, je 5 Blöcke → 1 Teil in 5 Sekunden.
- **Förderbänder transportieren** Feld für Feld (2 Felder pro Sekunde). Abzweigungen verteilen abwechselnd und überspringen volle Strecken, Zusammenführungen nehmen abwechselnd auf. **Ist ein Band voll, steht alles davor still.** Falsche Waren kommen nicht in eine Werkstatt – das Band staut sich.
- **Lagerhaus** (neu): 3 Fächer zu je 50 Waren, ein Eingang, ein Ausgang, gibt weiter, sobald Platz ist.
- **Versandportal** (neu): nimmt von allen vier Seiten an und schickt alles ins Laden-Lager.
- **Laden-Fenster:** Laden-Lager (500 Plätze) mit Mengen und Wert jeder Ware.
- **Statuslicht** an jedem Gebäude: grün = arbeitet, gelb = wartet, rot = Ausgang voll. Gelbe Leiste = Fortschritt.
- **Infofenster** zeigt laufend, was ein Gebäude tut, was am Eingang liegt, die Fächer des Lagerhauses und was versendet wurde.
- **Abreißen** gibt Waren aus Gebäuden und von Bändern ins Laden-Lager zurück; ein unberührter Rohstoff kommt zurück, ein angefangener geht verloren (das Spiel fragt vorher).
- **Testmodus** im Menü ☰: Zeit läuft 10-mal schneller (Anzeige „⏩ ×10“ oben).
- Alles wird mitgespeichert. Ist das Spiel im Hintergrund, ruht die Fabrik (Offline-Produktion folgt in v0.7.0).

**Was Tobias testet:** Rohstoff einlegen, Waren über Bänder ins Versandportal schicken, Sägewerk und Steinmetz umstellen, aufteilen (z. B. 1 Holzfäller auf 4 Strecken), Lagerhaus dazwischen, Stau provozieren, Laden-Fenster ansehen. Für schnelle Tests den Testmodus nutzen.

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
| 05.11.2026 | Verkauf im Laden und (später) auf dem Schwarzmarkt; ~~Holz und Stein immer zum Spottpreis verkäuflich~~ (am 06.11.2026 verworfen, siehe unten) | Fragen 6 und 9. Gegen Pleite hilft stattdessen der Pleiteschutz. |
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
| 05.11.2026 | Leitidee: Das Spiel lebt von der optimalen Produktionsstätte; welche Produktion sich lohnt, ändert sich mit dem Level | Von Tobias (Chat 2, Teil 3). |
| 05.11.2026 | Stein läuft wie Holz: Felsbrocken kaufen → Steinbruch → 200 Steinblöcke; Steinmetz macht wie das Sägewerk zwei Dinge (Platten oder Splitt) | Von Tobias (Chat 2, Teil 3). |
| 05.11.2026 | Im Holzfällerlager (und Steinbruch) liegt immer nur ein Rohstoff | Von Tobias (Chat 2, Teil 3). |
| 05.11.2026 | Lagerhaus: 3 Fächer zu je 50, ein Eingang, ein Ausgang; dient als Zwischenlager und Verteiler | Von Tobias (Chat 2, Teil 3). |
| 05.11.2026 | Zuerst feste Preise; jede Verarbeitungsstufe muss mehr bringen als die vorige | Von Tobias (Chat 2, Teil 3). |
| 05.11.2026 | Werkstätten: 5 Blöcke → 1 Teil | Aus Tobias' Rechenbeispiel (200 Holzblöcke → 40 Winkel); ersetzt die frühere Angabe „1 Holzblock → 1 Winkel“. |
| 05.11.2026 | Goldbeträge im Spiel ×10 (Holzstamm 550 statt 50), damit jede Ware einen ganzen Goldpreis hat | Claudes Vorschlag; Holzblöcke hätten sonst einen Preis von etwa 0,27 Gold. |
| 05.11.2026 | Tobias entwirft einen eigenen Techbaum | Damit nicht bei jedem Schritt neu überlegt werden muss, wie es weitergeht. |
| 05.11.2026 | Testmodus (Zeit ×10) im Menü | Damit man nicht 15 Minuten auf einen Holzstamm warten muss. |
| 05.11.2026 | Abgerissene Gebäude und Bänder geben ihre Waren ins Laden-Lager zurück | Claudes Vorschlag, damit Umbauen nichts kostet außer einem angefangenen Rohstoff. |
| 06.11.2026 | Werkstätten: 5 Blöcke → 1 Teil bestätigt | Tobias: So muss man mehr Holzfäller bauen, um mehr Blöcke pro Sekunde zu haben. „1 Holzblock = 1 Winkel“ war nur ein Beispiel. |
| 06.11.2026 | Goldbeträge ×10 bestätigt; 720 Gold für 40 Winkel passt vom Verhältnis | Von Tobias (Chat 3). |
| 06.11.2026 | Lagerhaus 2 × 1: Eingang oben links, Ausgang unten rechts | Von Tobias (Chat 3): 2 × 2 nahm zu viel Platz weg. |
| 06.11.2026 | Versandportal mit nur einem Eingang (1 × 1) | Tobias: Mehrere Eingänge waren auf dem kleinen Feld schwierig, einer oder höchstens zwei reichen. Größe 1 × 1 ist Claudes Wahl. |
| 06.11.2026 | Verkaufstheken werden von Hand bestückt; Kunden kommen zufällig und kaufen zufällige Mengen | Von Tobias (Chat 3): Man entscheidet selbst, was man verkauft. |
| 06.11.2026 | Kein Startgold; erster Holzstamm und erster Steinfels gratis; Pleiteschutz (geschenkter Holzstamm) | Von Tobias (Chat 3). |
| 06.11.2026 | Rohstoffe nach Level: Holz (1), Stein (2), Eisen (3); Stein kostet und bringt wie Holz, Eisen kostet und bringt deutlich mehr; Produkte behalten ihren Wert | Von Tobias (Chat 3). |
| 06.11.2026 | Tobias' Techbaum (Abschnitt 4.1) ersetzt den „Entwurf 1“ | Von Tobias (Chat 3). |
| 06.11.2026 | Block-Stufe bleibt für alle drei Rohstoffe (Rohstoff → 200 Blöcke → Grundmaschine, 5 Blöcke → 1 Teil) | Tobias: weiterhin wichtig und richtig (Chat 3, Teil 2, Frage 1). |
| 06.11.2026 | Schmelzhütte: 1 Eisenerz → 200 Eisenbarren, danach Schmiede | Claudes Vorschlag, von Tobias angenommen (Frage 2). |
| 06.11.2026 | Maschinennamen wählt Claude (Sägewerk, Steinmetz, Schmelzhütte, Schmiede, Mühlenbauer, Zimmerei, Feinwerkstatt, Feinschmiede, Getriebebauer, Schlosserei); Tobias' Namen waren zur Orientierung | Tobias (Frage 3). |
| 06.11.2026 | Holzwinkel und Splitt fallen weg (vielleicht später wieder); Maschinen, die mehrere Rohstoffe verarbeiten, sind später möglich | Tobias (Frage 3). |
| 06.11.2026 | Maschinen 2 × 2 (für später zwei Eingänge mit zwei Rohstoffen); alles andere kleiner: Förderbänder 1 × 1, Lagerhaus und sonstige Gebäude 2 × 1, Versandportal 1 × 1 | Tobias (Frage 4): besser zu positionieren. |
| 06.11.2026 | Eisenfeder = 3 Eisennägel (vorher dieselben Zutaten wie das Scharnier) | Claudes Vorschlag, von Tobias angenommen (Frage 5). |
| 06.11.2026 | Kombinations-Maschinen: 2 × 2, zwei Eingänge (jeder nimmt jede passende Zutat), ein Ausgang | Tobias (Frage 6). |
| 06.11.2026 | Logische Preistabelle: in der Anfangsphase nie Minus beim Verkaufen; spätere Preisänderungen prüfen wir dann | Tobias (Frage 7). Entwurf in Abschnitt 4.2. |
| 06.11.2026 | Freischalten: Level 1 Holz, Level 2 Stein (+ Mühlenbauer), Level 3 Eisen (+ Zimmerei, Feinwerkstatt), Level 4 Weiterverarbeitung | Claudes Vorschlag, von Tobias angenommen (Frage 8). |
| 06.11.2026 | Erster Rohstoff jeder Sorte gratis, sobald er freigeschaltet wird | Claudes Vorschlag, von Tobias angenommen (Frage 9). |
| 06.11.2026 | Verkaufstheken: zu Beginn 2 Theken, je eine Sorte, bis 20 Stück; alle 10–30 Sekunden ein Kunde, der 1–3 Waren kauft | Claudes Vorschlag, von Tobias angenommen (Frage 10). |
| 06.11.2026 | Reihenfolge: v0.6.0 Techbaum Teil 1 → v0.7.0 Handel → v0.8.0 Techbaum Teil 2 → v0.9.0 Laden-Level → v0.10.0 Offline | Tobias möchte im neuen Chat genau mit diesen Punkten starten. |
| 06.11.2026 | Reine README-Updates bekommen eine eigene C-Version (z. B. v0.5.2) | Regel 1: jeder Arbeitsschritt ist eine Version; das Spiel zeigt die Nummer mit an. |
| 06.11.2026 | Plan für v0.6.0 mit Preistabelle und Anschlüssen freigegeben, „erstmal so umsetzen und dann schauen, wie es wirkt“ | Tobias (Chat 4). Preise werden nach dem Test angepasst. |
| 06.11.2026 | Rezept-Knöpfe heißen kurz „Platten“, „Stäbe“, „Zahnräder“, „Nägel“ (seit v0.8.0 „Stangen“); Symbole: Schmelzhütte 🔥, Schmiede 🔨 | Claudes Wahl; jederzeit änderbar. |
| 06.11.2026 | Alte Sägewerke und Steinmetze wachsen so, dass ihre Anschlüsse an derselben Stelle bleiben | Bestehende Bänder bleiben angeschlossen; nur wenn kein Platz ist, wird versetzt. |
| 06.11.2026 | Grundstück 22 × 14 statt 16 × 10 (wächst nach rechts und unten), Welt 40 × 26; gilt auch für bestehende Spielstände | Tobias (Chat 4): Für eine zweite Eisen-Linie fehlte der Platz. Zwischenlösung bis „Fläche kaufen“. |
| 06.11.2026 | Bauen kostet Waren aus dem Laden-Lager statt Gold (z. B. Förderband 1 Holzblock, Sägewerk 40 Holzblöcke); Gold ist für Rohstoffe | Tobias (Chat 5): Man soll abwägen, ob man Waren verkauft oder damit eine Maschine baut. Mengen sind Platzhalter. |
| 06.11.2026 | Kein Notverkauf an den Händler; verkauft wird nur über die Theken | Tobias (Chat 5): Man soll das Lager selbst abverkaufen; viele Teile braucht man später noch. Ersetzt die Entscheidung vom 05.11.2026 „Holz und Stein immer zum Spottpreis verkäuflich“. |
| 06.11.2026 | Verkaufstempo bleibt erst einmal bei 2 Theken × 20 Stück und einem Kunden alle 10–30 s | Tobias (Chat 5): erst spielen und sehen, wie viel Gold man real erwirtschaftet. |
| 06.11.2026 | Neues Spiel: 0 Gold, 1 Holzstamm, 1 Felsbrocken, 20 Holzblöcke und ein Versandportal auf dem Grundstück | Ohne Portal und Holzblöcke für Bänder käme nie eine Ware in den Laden. |
| 06.11.2026 | Abreißen gibt nur zurück, was beim Bauen bezahlt wurde; Startgebäude und Gebäude von vor v0.7.0 geben nichts zurück | Claudes Wahl: Sonst könnte man Gratis-Gebäude abreißen und hätte Waren umsonst. |
| 06.11.2026 | „Ware wählen“ füllt die Theke gleich auf; Testpaket nur im Testmodus | Claudes Wahl, spart einen Tipp bzw. hält das normale Spiel sauber. |
| 06.11.2026 | Kunden-Zufall steckt im Spielstand | Damit sich Abläufe in Tests genau wiederholen lassen. |
| 06.11.2026 | Jede Programmdatei wird mit `?v=<Version>` geladen (Import-Map in `index.html`, geschrieben von `tools/set-version.mjs`) | v0.7.0 startete bei Tobias nicht, weil der Browser alte und neue Dateien mischte. Ohne Build-Schritt ist die Import-Map der einfachste sichere Weg. |
| 06.11.2026 | Meldung „Das Spiel konnte nicht starten“ mit Fehlertext | Statt eines schwarzen Bildschirms; Tobias kann den Fehler per Screenshot schicken. |
| 06.11.2026 | Eisenstange statt Eisennägel: Schmiede 5 Eisenbarren → 1 Eisenstange (Wert 72); Nägel fallen vorerst weg | Tobias (Chat 5, Teil 3): Es entstanden viel zu viele Nägel. Name „Eisenstange“ von Claude vorgeschlagen, von Tobias bestätigt. |
| 06.11.2026 | Alte Nägel: je 5 → 1 Eisenstange, aufgerundet; Nägel auf Bändern zusammengezählt ins Laden-Lager | Claudes Wahl: Der Wert bleibt etwa gleich (5 × 14 = 70 ≈ 72), niemand verliert etwas. |
| 06.11.2026 | Im Techbaum-Entwurf ersetzt „1 Eisenstange“ die bisherigen „2 Eisennägel“; Werte neu nach +20 % | Claudes Entwurf; wird mit dem Plan für v0.9.0 freigegeben. |
| 06.11.2026 | Eisenstange als eigener Schritt v0.8.0; Fahrplan rückt nach: v0.9.0 Techbaum Teil 2, v0.10.0 Laden-Level, v0.11.0 Offline | Tobias: „Das kann jetzt schon gerne rein, damit wir alles frisch haben.“ |

---

## 8. Offene Fragen

Stand 06.11.2026.

1. **Plan für v0.9.0 (Techbaum, Teil 2)** im neuen Chat vorstellen und freigeben lassen; offene Punkte stehen in Abschnitt 6 unter „Ausblick v0.9.0“.
2. **Handel im echten Tempo:** Tobias hat v0.7.0 bisher im Testmodus gespielt (Kunden kommen dort 10-mal so oft). Wie fühlen sich Verkaufstempo (2 Theken × 20, ein Kunde alle 10–30 s), Goldertrag und Baukosten in normaler Zeit an? Danach Zahlen anpassen. Erster Eindruck: „Ware verkauft sich und ich nehme Geld ein.“
3. **Laden-Lager 500 Plätze:** Bleibt das so, oder wird es mit dem Laden-Level größer? Volle Lager stoppen die Versandportale.
4. **Laden-Level (v0.10.0):** Was kostet ein Aufstieg (Gold und Waren)? Gibt es zusätzlich Freischaltpunkte? Vorschlag kommt mit dem Plan für v0.10.0.
5. **Schwarzmarkt & verbundene Läden:** in M5 entscheiden.
6. **Arbeitstitel:** ergibt sich im Laufe der Entwicklung.

---

## 9. Versionshistorie

### v0.8.0 – Eisenstange statt Eisennägel (06.11.2026)

**Vorgenommen:**
- Tobias' Wunsch: weniger Nägel. Die Schmiede macht Eisenstangen im Verhältnis 5 : 1 wie die anderen Grundmaschinen.

**Fragen, die wir uns gestellt haben:**
- Wie heißt das neue Teil? → „Eisenstange“, passend zu Eisenerz und Eisenbarren (Tobias: „klingt sehr gut“).
- Was passiert mit vorhandenen Nägeln? → Je 5 werden zu 1 Stange (aufgerundet), überall, wo sie liegen; eine Meldung sagt, wie viele.
- Was heißt das für den Techbaum Teil 2? → „2 Eisennägel“ wird zu „1 Eisenstange“; Werte neu gerechnet als Entwurf (Abschnitt 4.2).

**Gemacht:**
- Datentabellen: Ware Eisenstange (eigene Form), Rezept „Stangen“; Eisennagel entfernt.
- Spielstand-Version 6 mit Umwandlung von Version 5 (Lager, Theken, Lagerhäuser, Bänder, Schmiede, Verkaufsliste).
- Nachgestellt: Update von v0.7.1 mit 140 Nägeln im Lager und 12 auf der Theke → 28 und 3 Eisenstangen, Meldung erscheint, kein Startfehler.
- 103 automatische Tests (neu: Schmiede 200 Barren → 40 Stangen, alle Grundmaschinen 5 : 1, Umwandlung von Version 5 mit Nägeln an allen Stellen) und der Browser-Test (Schmiede auf „Stangen“ umstellen) – alle bestanden.

### v0.7.1 – Startfehler behoben (06.11.2026)

**Vorgenommen:**
- Das Spiel startete bei Tobias nach dem Update auf v0.7.0 nicht mehr (schwarzer Bildschirm, oben nur „v“).

**Fragen, die wir uns gestellt haben:**
- Ist der Spielstand kaputt? → Nein: Ein Browser ohne Zwischenspeicher öffnet Tobias' Fabrik in v0.7.0 problemlos.
- Warum dann? → Der Browser lud nur die Startdatei neu (sie hatte als einzige eine Versionsnummer) und nahm die übrigen bis zu 10 Minuten aus dem Zwischenspeicher. Neue und alte Dateien passten nicht zusammen. Nachgestellt mit einem Testserver, der wie GitHub Pages zwischenspeichert.
- Wie verhindern wir das dauerhaft? → Versionsnummer an jeder Datei (Import-Map), ein Werkzeug, das sie schreibt, und ein Test, der prüft, dass keine Datei fehlt.

**Gemacht:**
- Import-Map in `index.html`, `tools/set-version.mjs`, Meldung bei Startfehlern.
- Nachgestellt und geprüft: Wechsel v0.6.1 → v0.7.1, v0.7.0 → v0.7.1 und v0.7.1 → eine gedachte v0.7.2 mit geänderter Datentabelle starten alle sauber; ein absichtlich eingebauter Fehler zeigt die Meldung.
- 101 automatische Tests (neu: Import-Map vollständig) und der Browser-Test (neu: alle Dateien mit Versionsnummer geladen, keine Startfehler-Meldung) – alle bestanden.

### v0.7.0 – Handel (06.11.2026)

**Vorgenommen:**
- Mit der Fabrik Gold verdienen: Händler, Verkaufstheken, Kunden; Bauen kostet Waren; Start ohne Gold; Pleiteschutz.

**Fragen, die wir uns gestellt haben:**
- Gold oder Waren als Baukosten? → Waren (Tobias), damit man zwischen Verkaufen und Bauen abwägt.
- Wie kommt man ohne Gold an die ersten Waren? → Versandportal steht schon, 20 Holzblöcke für die Bänder, das erste Sägewerk kostet nur Holzblöcke.
- Was bekommt man beim Abreißen zurück? → Genau das, was bezahlt wurde; Gratis-Gebäude geben nichts zurück.
- Wie bleiben Knöpfe im Laden-Fenster zuverlässig antippbar, obwohl es sich ständig aktualisiert? → Knöpfe werden nicht neu erzeugt, nur ihre Beschriftung geändert.

**Gemacht:**
- Neue Datei `src/core/market.js` (Händler, Theken, Kunden, Pleiteschutz, Testpaket), Baukosten in der Gebäude-Tabelle, neues Laden-Fenster `src/view/shop.js`.
- Spielstand-Version 5 mit Umwandlung von Version 4.
- 100 automatische Tests (neu u. a.: Händler, Theken, Kunden-Takt über eine Stunde, Baukosten und Rückgabe, gekürzte Bänder, Pleiteschutz, neues Spiel bis zum ersten Verkauf, Umwandlung von Version 4) und der Browser-Test (neu: Einstieg ohne Gold, Theke bestücken, Kunden kaufen, Händler, Testpaket) – alle bestanden.
- Beim Testen gefunden und behoben: Das „+Gold“ überdeckte das Laden-Level-Symbol; der Abräumen-Knopf war ohne Text unklar.

### v0.6.1 – Größeres Grundstück (06.11.2026)

**Vorgenommen:**
- Platz für eine zweite Eisen-Linie schaffen, ohne „Fläche kaufen“ vorzuziehen.

**Fragen, die wir uns gestellt haben:**
- In welche Richtung wächst das Grundstück? → Nach rechts und unten, damit bestehende Gebäude und Bänder unverändert bleiben.
- Passt auf dem Handy noch alles auf den Bildschirm? → Ja, beim Öffnen wird das ganze Grundstück gezeigt; Gebäude bleiben erkennbar (Browser-Test).

**Gemacht:**
- Grundstück 22 × 14, Welt 40 × 26, Spielstand-Version 4 mit Umwandlung.
- 69 automatische Tests (neu: Umwandlung von Version 3, Startgröße) und der Browser-Test in Tablet- und Handygröße – alle bestanden.

### v0.6.0 – Techbaum, Teil 1 (06.11.2026)

**Vorgenommen:**
- Den festgelegten Techbaum bis zu den Grundmaschinen einbauen: neue Waren, Maschinen 2 × 2, Eisen-Kette, Preistabelle.
- Bestehende Fabriken ohne Verlust übernehmen.

**Fragen, die wir uns gestellt haben:**
- Wie wächst ein gedrehtes 2 × 1-Sägewerk auf 2 × 2, ohne dass die Bänder abreißen? → Es wächst auf der Seite gegenüber den Pfeilen; die Anschlüsse bleiben, wo sie waren.
- Was, wenn dort ein anderes Gebäude oder Band steht? → Nächste freie Stelle; geht das nicht, abreißen mit Rückerstattung. Das Spiel sagt beim Öffnen Bescheid.
- Wie zeigt man „5 Barren → 5 Nägel“ richtig an? → Bei mehr als einem Stück steht die Mehrzahl.

**Gemacht:**
- Datentabellen: 12 Waren, 6 Rezepte, 8 Gebäude im Baumenü; neue Formen für Zahnrad, Barren, Mini-Platte, Nagel und Eisenerz.
- Spielstand-Version 3 mit Umwandlung von Version 1 und 2.
- 67 automatische Tests (neu: Eisen-Kette, Nägel, Preistabelle für alle Stufen, Datentabellen passen zusammen, Umwandlung alter Spielstände inkl. gedrehter, versetzter und abgerissener Maschinen) und der Browser-Test (neu: Schmelzhütte und Schmiede per Touch bauen, Eisenerz einlegen, auf Nägel umstellen) – alle bestanden.

### v0.5.2 – Techbaum festgelegt (06.11.2026, nur README)

**Vorgenommen:**
- Tobias' Antworten zum Techbaum festhalten, damit ein neuer Chat direkt mit v0.6.0 starten kann.

**Fragen, die wir uns gestellt haben:**
- Welche Namen bekommen die Maschinen? → Claude hat passende Namen gewählt (Abschnitt 4.2).
- Wie bleiben die Preise logisch, sodass man anfangs nie Minus macht? → Regel: Blöcke +9 %, jedes weitere Teil rund +20 % gegenüber seinen Zutaten; Eisennägel entstehen zu fünft aus 5 Barren.
- Was passiert mit bestehenden Sägewerken (2 × 1), wenn Maschinen 2 × 2 werden? → Sie wachsen, rücken oder werden mit Rückerstattung abgerissen (Plan für v0.6.0).

**Gemacht:**
- Festgelegter Techbaum mit Gebäuden, Größen, Freischaltungen, Rezepten und Preistabelle (Abschnitt 4.2), Plan für v0.6.0 (Abschnitt 6), Entscheidungen und offene Fragen aktualisiert.
- Spiel unverändert; nur die Versionsnummer im Spiel steigt auf v0.5.2.

### v0.5.1 – Kompaktes Lagerhaus & Versandportal (06.11.2026)

**Vorgenommen:**
- Tobias' Wünsche nach dem Test von v0.5.0: weniger Eingänge am Versandportal, kleineres Lagerhaus.
- Tobias' Techbaum festhalten und den Fahrplan danach ausrichten.

**Fragen, die wir uns gestellt haben:**
- Wo genau sitzen die Anschlüsse des 2 × 1 Lagerhauses? → Wie von Tobias beschrieben: oben links rein, unten rechts raus.
- Wie viele Eingänge braucht das Versandportal? → Einer reicht; mehrere Bänder lassen sich vorher zusammenführen.
- In welcher Reihenfolge kommen Techbaum und Handel? → Vorschlag: erst Techbaum, dann Handel (offene Frage 11).

**Gemacht:**
- Lagerhaus 2 × 1 mit neuen Anschlüssen, Versandportal 1 × 1 mit einem Eingang.
- Statuslicht passt sich der Gebäudegröße an.
- Techbaum in Abschnitt 4 abgeschrieben, Lesart und Rückfragen notiert, Fahrplan neu (v0.6.0 bis v0.10.0).
- 61 automatische Tests (neu: Anschlüsse von Lagerhaus und Versandportal) und der Browser-Test bestanden.

### v0.5.0 – Produktion (05.11.2026)

**Vorgenommen:**
- Die Fabrik zum Leben erwecken: Rohstoffe einlegen, Waren herstellen und über Bänder transportieren.
- Tobias' Vorgaben umsetzen: ein Rohstoff pro Holzfäller, Stein wie Holz, Werkstätten mit zwei Einstellungen, Lagerhaus mit 3 × 50, Versandportal, Stau bei vollem Band.

**Fragen, die wir uns gestellt haben:**
- Wie verteilen Abzweigungen fair, ohne dass eine volle Strecke alles blockiert? → Abwechselnd, volle Richtungen werden übersprungen.
- Wie kommen beim Zusammenführen alle Zuläufe dran, auch ein Gebäude neben einem vollen Band? → Bänder und Gebäude melden sich jeden Takt an, das Ziel nimmt reihum an.
- Wie testet man eine 15-Minuten-Produktion? → Testmodus (×10) für Tobias, Zeitraffer in den automatischen Tests.
- Wie bleiben bestehende Fabriken erhalten? → Spielstand-Format Version 2 mit Umwandlung von Version 1; beschädigte Spielstände werden vor dem Überschreiben gesichert.

**Gemacht:**
- Datentabellen für Waren, Rezepte, Laden; neue Gebäude Steinmetz, Lagerhaus, Versandportal.
- Simulation in festen Takten (`src/core/sim.js`) mit Stau, Aufteilen und Zusammenführen.
- Waren auf Bändern sichtbar, Statuslicht und Fortschrittsleiste an Gebäuden, Infofenster mit laufendem Status, Laden-Fenster mit Laden-Lager, Testmodus.
- Namen an Gebäuden suchen sich eine Stelle, an der sie keinen Pfeil verdecken.
- 59 automatische Tests (u. a. 200 Blöcke pro Stamm, 200 → 40 Winkel, Stau, faires Aufteilen und Zusammenführen, Lagerhaus 3 × 50, falsche Ware, Rückerstattung, Wirtschaftsrechnung, Umwandlung alter Spielstände) und der Browser-Test mit Produktionsablauf – alle bestanden, mehrfach wiederholt.
- Beim Testen gefunden und behoben: eine versehentlich doppelt ersetzte Stil-Regel, die alle Knopfreihen rechtsbündig machte; zwei Prüfungen im Browser-Test, die je nach Zeitpunkt schwankten.

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

### 06.11.2026 – Chat 5, Teil 3: v0.7.0 läuft, Freigabe Eisenstange

**Tobias** (Screenshots vom Tablet, noch v0.7.0 aus dem Zwischenspeicher, Testmodus an): v0.7.0 ist doch geladen. Ware verkauft sich und er nimmt Geld ein (gut 3.000 Gold). Alle Gratis-Rohstoffe sind verarbeitet; jetzt müsste er Gold in Holzstamm, Felsbrocken oder Eisenerz stecken, damit die Produktion weiterläuft. Im Lager liegen 140 Eisennägel. „Eisenstange klingt sehr gut. Das kann jetzt schon gerne rein, damit wir alles frisch haben.“ Alles in der README festhalten; danach geht es in einem neuen Chat weiter.

**Umgesetzt:** v0.8.0 (siehe Versionshistorie). Der Fahrplan rückt um eine Version nach. Der neue Chat beginnt mit dem Plan für v0.9.0 (Techbaum, Teil 2).

**Claudes Hinweis:** Der Testmodus beschleunigt auch die Kunden (×10). Um das Verkaufstempo zu beurteilen, ihn im Menü ☰ ausschalten.

### 06.11.2026 – Chat 5, Teil 2: Startfehler & zu viele Nägel

**Tobias** (Screenshots vom Tablet): Seit v0.7.0 öffnet sich das Spiel nicht mehr (schwarzer Bildschirm). In v0.6.1 hat er vorher alles einmal gebaut (Schmelzhütte, 2 Schmieden, 2 Sägewerke, 2 Steinmetze, Lagerhäuser als Verteiler, 6 Versandportale) und gemerkt, dass extrem viele Nägel entstehen (im Lager 100 Eisennägel, sonst je etwa 20 Teile). Vorschlag: aus den Nägeln erst einmal Metallstangen machen, ebenfalls im Verhältnis 5 : 1, damit das Gleichgewicht am Anfang passt.

**Umgesetzt:** v0.7.1 (Startfehler, siehe Versionshistorie).

**Claudes Plan zu den Nägeln (in Teil 3 freigegeben, umgesetzt als v0.8.0):**
- Schmiede, Einstellung B: **Eisenstange** statt Eisennägel – 5 Eisenbarren → 1 Eisenstange in 5 Sekunden, Wert 72 Gold (wie die Mini-Eisenplatte). Damit laufen alle drei Grundmaschinen gleich: Platte oder ein spezielles Teil, je 5 : 1.
- Eisennägel fallen vorerst weg (wie damals Holzwinkel und Splitt). Vorhandene Nägel werden umgewandelt: je 5 Nägel → 1 Eisenstange (aufgerundet), auch auf Theken, in Lagerhäusern und Gebäuden; eine Schmiede auf „Nägel“ wird auf „Stangen“ umgestellt.
- Folge für den Techbaum Teil 2: Wo bisher „2 Eisennägel“ stehen, steht „1 Eisenstange“; die Werte der Kombi-Teile werden neu gerechnet (Plan für Teil 2). Nägel können später als eigene Stufe zurückkommen.

### 06.11.2026 – Chat 5: Plan und Umsetzung v0.7.0 (Handel)

**Tobias:** v0.6.1 lief sehr gut.

**Claude** hat den Plan für v0.7.0 vorgestellt (Laden mit Reitern, Händler, 2 Theken, Kunden, Baukosten in Gold, Pleiteschutz) und drei Fragen gestellt.

**Tobias' Antworten:**
1. Verkaufstempo erst einmal so lassen, um zu sehen, wie das Abverkaufen ist und wie viel Gold man beim Spielen real erwirtschaftet.
2. Kein Notverkauf zum Spottpreis – das war nur eine Online-Idee. Man soll das Lager über die Theken abverkaufen; manche Teile braucht man später noch, deshalb ist es gut, von allem etwas im Lager zu haben.
3. Baukosten nicht in Gold, sondern in Waren, z. B. ein Förderband kostet einen Holzblock, ein Sägewerk ein paar Holzplatten und Holzblöcke. So muss man abwägen: verkaufe ich meine Holzplatten oder baue ich dafür eine Maschine – ohne ins Minus zu rutschen.

**Claude** hat eine Kostentabelle in Waren vorgeschlagen (Abschnitt 4.2). **Tobias:** Passt so; erst einmal spielen und schauen, ob die Mechanik passt und es nicht zu lange dauert, neue Sachen zu bauen.

**Umgesetzt:** v0.7.0 (siehe Versionshistorie).

### 06.11.2026 – Chat 4, Teil 2: Test von v0.6.0 & größeres Grundstück

**Feedback von Tobias** (Screenshot vom Tablet): Alles sieht gut aus, die Ware kommt im Laden an. Tobias hat eine Fabrik mit 2 Sägewerken, 2 Steinmetzen, einer Schmiede, 3 Lagerhäusern als Verteiler und 5 Versandportalen gebaut. Für eine zweite Eisen-Linie fehlt aber der Platz.

**Claudes Vorschlag:** v0.6.1 – Grundstück 22 × 14 statt 16 × 10, wächst nach rechts und unten, auch für bestehende Spielstände; „Fläche kaufen“ bleibt für später.

**Tobias:** Passt so. Alles in der README festhalten, weil danach ein neuer Chat startet.

**Umgesetzt:** v0.6.1 (siehe Versionshistorie). Der neue Chat beginnt mit dem Plan für v0.7.0 (Handel).

### 06.11.2026 – Chat 4: Freigabe v0.6.0

**Claude** hat die README gelesen und den Plan für v0.6.0 samt Preistabelle vorgestellt.

**Tobias:** „Lass uns das erstmal so umsetzen und dann schauen wir, wie es wirkt.“

**Umgesetzt:** v0.6.0 (siehe Versionshistorie).

### 06.11.2026 – Chat 3, Teil 2: Antworten zum Techbaum

**Tobias' Antworten auf Claudes Rückfragen:**
1. Block-Stufe: Ja, die Vorgehensweise ist weiterhin wichtig und richtig.
2. Schmelzhütte für Eisen: guter Vorschlag, so nehmen.
3. „Holz-Werkbank“ war nur theoretisch, zur besseren Orientierung; Claude soll passende Namen für die Arbeitsschritte aussuchen. Später kann es auch Maschinen geben, die mehrere Rohstoffe verarbeiten. Winkel und Splitt fliegen raus und kommen evtl. später wieder.
4. Maschinen sollen 2 × 2 Plätze einnehmen, damit sie später 2 Eingänge für 2 verschiedene Rohstoffe haben können. Alles andere kleiner: Förderbänder 1 × 1, sonstige Gebäude wie das Zwischenlager 2 × 1, damit man sie besser positionieren kann.
5. Scharnier und Eisenfeder mit gleichen Zutaten: nicht aufgefallen, gerne ändern.
6. Kombinations-Maschinen (2 × 2, zwei Eingänge, ein Ausgang): ja, genau.
7. Preise: Es braucht eine sehr logische Tabelle, damit man beim Verkaufen in der Anfangsphase kein Minus macht. Ändern sich die Preise später, muss man schauen.
8. Freischalten nach Level: sehr gute Idee.
9. Erster Rohstoff jeder Sorte gratis beim Freischalten: sehr gute Idee.
10. Verkaufstheken und Kunden: gutes Prinzip.

**Wunsch:** Alles in die README schreiben; im neuen Chat liest Claude die README und startet genau mit diesen Punkten.

**Umgesetzt:** v0.5.2 (nur README): festgelegter Techbaum (4.2) mit Namen, Größen, Rezepten und Preistabelle, Plan für v0.6.0.

### 06.11.2026 – Chat 3: Test von v0.5.0 & Techbaum

**Feedback von Tobias:**
- Das Grundprinzip läuft gut.
- Versandportal: Auf dem kleinen Feld sind die vielen Eingänge schwierig; einer oder höchstens zwei reichen.
- Produktionsstätten wie das Sägewerk in 2 × 2 findet Tobias gut (im Spiel ist das Sägewerk 2 × 1, siehe offene Frage 4). Das Lagerhaus soll 2 × 1 werden, weil es sonst zu viel Platz wegnimmt: Bei einem 2 × 1-Rechteck soll es oben links hinein- und unten rechts herausgehen.
- 5 Blöcke für einen Winkel ist gut: So muss man mehr Holzfäller bauen, um mehr Blöcke pro Sekunde zu produzieren. „1 Holzblock = 1 Winkel“ war nur ein Beispiel; die neue Rechnung ist besser.
- Die Ware kommt über das Versandportal im Laden an, man sieht Wert und Lagerbestand. Der Laden darf später interaktiver werden; für den Anfang reicht die Übersicht.
- Laden-Idee: Man platziert die Waren, die man möchte, auf Verkaufstheken. Leute kommen zufällig vorbei und kaufen zufällig viel, z. B. 2 Zahnräder und 1 Splitt, der Nächste 3 Winkel. Die Theken werden von Hand bestückt, damit man selbst entscheidet, was verkauft wird.
- Kein Startgold: Der erste Holzstamm und der erste Felsblock sollen gratis sein, damit man direkt mit der Produktion starten kann. Die Idee, bei absoluter Pleite einen Holzstamm geschenkt zu bekommen, ist gut.
- Glatte Zahlen (×10) sind besser; 720 Gold für 40 Winkel passt vom Verhältnis.
- Fortschritt: Man fängt mit Holz an, Level 2 ist Stein, Level 3 könnte Eisen sein. Stein kostet genauso viel wie Holz und bringt ähnliche Erträge; Eisen kostet deutlich mehr, bringt aber auch mehr Gold. Mit jedem Rohstoff verdient man mehr, aber bestimmte Produkte verlieren ihren Wert nicht, weil sie später für weitere Prozesse gebraucht werden.
- **Techbaum:** Tobias hat einen ersten Techbaum als Tabelle geschickt (abgeschrieben in Abschnitt 4.1).

**Umgesetzt:** v0.5.1 (Lagerhaus 2 × 1, Versandportal mit einem Eingang). Der Techbaum wird erst nach den Rückfragen (Abschnitt 8) eingebaut.

### 05.11.2026 – Chat 2, Teil 3: Freigabe v0.5.0 & Feinschliff

**Tobias:**
- Das Produktionskonzept ist richtig verstanden, der Plan für v0.5.0 passt.
- Es braucht etwas Analoges zum Sägewerk für Steine, das aus Steinblöcken zwei Dinge herstellt (Platten und Splitt).
- Die Tür war nur ein Beispiel. Tobias entwickelt (heute Abend) einen eigenen Techbaum und schickt ihn, damit nicht bei jedem Schritt überlegt werden muss, wie es weitergeht.
- Stein läuft genau wie Holz: kaufen, aus einem Stein werden viele Steinblöcke usw.
- Ins Holzfällerlager passt nur ein Baumstamm.
- Das Spiel soll von der optimalen Produktionsstätte leben: Am Anfang braucht man viel aus Holz (Sägewerke lohnen sich), am Ende nur noch Einzelteile aus Holz und mehr anderes, dann lohnt es sich, die Holzproduktion zu verkleinern – so lebt das Spiel bis in hohe Level.
- Lagerhaus: z. B. 3 Fächer frei, aber nur ein Eingang und ein Ausgang, deshalb lagert man dort sinnvollerweise nur eine Sache, z. B. 3 × 50 Holzblöcke. Es dient als Zwischenlager und „Verteiler“.
- Mit festen Preisen anfangen, damit die Mechanik einfach bleibt; es muss sich aber lohnen: Holzstamm z. B. 50 Gold → 200 Holzblöcke verkauft knapp über 50 Gold → als 40 Winkel (oder 20 Winkel und 20 Stäbe) deutlich mehr, damit man die Produktion nach und nach erhöhen kann.

**Umgesetzt:** v0.5.0 (siehe Versionshistorie). Claude hat dabei das Verhältnis 5 : 1 aus dem Rechenbeispiel übernommen und die Goldbeträge ×10 gerechnet (offene Fragen 2 und 3).

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
