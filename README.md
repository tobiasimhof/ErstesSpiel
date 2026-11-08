# ErstesSpiel

Erstes Spiel gecodet zusammen mit Claude.

Ein **Aufbau- und Fabrikspiel mit Wirtschaftssimulation im Mittelalter** (Arbeitstitel offen). Man baut auf einem kleinen Grundstück seine eigene Fabrik. Rohstoffe wie Holzstämme kauft man beim Händler, verarbeitet sie zu Holzblöcken und schickt diese über Förderbänder durch Werkstätten, wo immer komplexere Waren entstehen. Das ganze Grundstück ist der eigene Laden; die Waren verkauft man dort oder auf dem Schwarzmarkt. Mit dem Gold baut man den Laden aus, schaltet neue Produktionen frei und kauft mehr Fläche. Ziel ist ein Spiel für Handy und Tablet im Querformat, später mit Clans und einem gemeinsamen Markt aller Spieler.

| | |
|---|---|
| **Aktuelle Version** | v0.15.1 – Plan für Level 7 „Die Heilstube“ (nur README) |
| **Phase** | M2 – Produktionsketten |
| **Spielen (live)** | https://tobiasimhof.github.io/ErstesSpiel/ |
| **Nächster Schritt** | Tobias liest den **Plan für v0.16.0 – Beet und Level 7 „Die Heilstube“** (Abschnitt 6) und gibt ihn frei oder ändert Zahlen und Namen. Danach programmiert Claude v0.16.0; Level 8–12 folgen häppchenweise (Abschnitt 4.4) |

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
- **Roter Faden (seit v0.13.0, Tobias):** Dein Laden liegt in einem kleinen Ort am Fluss, der wächst. Jedes Level ist ein Bauabschnitt des Ortes (Abschnitt 3.8), die Bewohner geben Aufträge. So ergibt jedes Produkt einen Sinn, und neue Maschinen und Waren passen später in die nächste Bauphase.
- **Kleine Waren (Tobias):** Alle Produkte sind auch im echten Leben klein (Schlüssel, Zirkel, Uhrwerk …), damit sie auf dem Band gut darstellbar sind – keine Türen, Truhen oder Tore. Jedes Produkt soll logisch aus seinen Zutaten entstehen.
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

- Das Grundstück besteht aus quadratischen Feldern (Raster). Man startet mit **22 × 14 Feldern** (seit v0.6.1, vorher 16 × 10). Ringsum liegt gesperrte Fläche (seit v0.10.2 Welt 38 × 30, vorher 40 × 26). **Seit v0.9.0 kauft man Fläche dazu:** An jeder Seite des Grundstücks steht ein Schild mit dem Preis; ein Streifen reicht über die ganze Seite. **Seit v0.10.2 (Tobias):** Jeder Streifen ist 4 Felder tief und kostet immer 500 Gold, schon ab Level 1; jede Seite lässt sich 2× erweitern. Ganz ausgebaut sind es 38 × 30 Felder für zusammen 4.000 Gold (Abschnitt 6, v0.10.2).
- **Der Laden ist das ganze Grundstück**, kein einzelnes Gebäude. Darauf stehen zu Beginn ein Holzfällerlager und (seit v0.7.0) ein Versandportal. Bis v0.8.0 stand dort auch ein Steinbruch; seit v0.9.0 baut man ihn ab Level 2 selbst.
- Gebäude belegen mehrere Felder und haben Ein- und Ausgänge. **Größen (Tobias, 06.11.2026):** Maschinen 2 × 2 (damit sie später zwei Eingänge für zwei verschiedene Rohstoffe haben können), alles andere kleiner: Förderbänder 1 × 1, Lagerhaus 2 × 1, Versandportal 1 × 1.
- **Förderbänder** verbinden die Gebäude und transportieren Waren Stück für Stück.
- **Aufteilen und Zusammenführen durch Ziehen**, ohne Verteiler-Gebäude: Zieht man von einem bestehenden Band aus, teilt es sich auf (bis zu 3 Richtungen pro Feld; mehrfach aufteilen ergibt 4 und mehr Strecken). Zieht man auf ein bestehendes Band, laufen beide zusammen. Abzweigungen verteilen die Waren abwechselnd.
- **Ein- und Ausgänge** sind als Pfeile am Gebäude zu sehen: blau = Eingang, orange = Ausgang.
- **Rohstoffe kauft man beim Händler**, z. B. einen Holzstamm. Den legt man in das Holzfällerlager, das daraus nach und nach Holzblöcke herstellt (Beispiel: 1 Holzstamm → 200 Holzblöcke in 15 Minuten). ~~Es passt immer nur ein Holzstamm hinein.~~ **Seit v0.14.0 (Tobias): Bis zu 3 Holzstämme passen hinein** (der Vorrat, 45 Minuten); sie werden nacheinander verarbeitet. **„⏫ Auffüllen“** im Infofenster füllt bis zum Rand: erst aus dem Laden-Lager, was fehlt, wird direkt beim Händler gekauft. Nachlegen bleibt Handarbeit. Am Gebäude zeigen drei Punkte, wie voll der Vorrat ist. Stein und Eisen laufen genauso: Felsbrocken kaufen → Steinbruch → 200 Steinblöcke.
- **Maschinen** verarbeiten nach Rezept. Man stellt ein, was sie herstellen (Modus A oder B), z. B. Sägewerk → Holzplatte oder Holzstab (5 Blöcke → 1 Teil). Der festgelegte Techbaum steht in Abschnitt 4.2. Später kann es auch Maschinen geben, die mehrere Rohstoffe verarbeiten.
- **Typischer Aufbau:** Ein Holzfällerlager wird auf 4 Strecken verteilt. Zwei davon gehen in Sägewerke (eins auf Winkel, eins auf Stäbe eingestellt), zwei laufen weiter für spätere Rezepte, die Holzblöcke direkt brauchen (z. B. zusammen mit Splitt).
- **Stau:** Ist ein Band voll (z. B. weil es im Nichts endet), bleibt alles stehen und davor wird nicht weiter produziert.
- **Lagerhäuser** sind die einzige Möglichkeit, Waren auf dem Grundstück zu lagern. Sie sind Zwischenstationen und eine Art Verteiler: 2 × 1 Felder, 3 Fächer zu je 50 Waren, **Eingang oben links, Ausgang unten rechts** – deshalb lagert man sinnvollerweise nur eine Sorte, z. B. 3 × 50 Holzblöcke. Was hineinläuft, läuft weiter, sobald am Ausgang Platz ist. Bleibt der Ausgang frei, sammelt das Lagerhaus bis zu 150 Stück; ein Abzweig davor schickt dann alles Weitere in die anderen Richtungen (z. B. ins Versandportal).
- **Versandportal:** 1 × 1 Feld mit **einem** Eingang (dreht mit). Waren, die hineinlaufen, landen direkt im Laden.
- **Lagerhaus als Gegenstück zum Versandportal (seit v0.12.0, Wunsch von Tobias):** Das Versandportal bringt Waren vom Band ins Laden-Lager, das Lagerhaus holt sie zurück aufs Band – **seit v0.14.0 nur noch von Hand** (Tobias: Sonst könnte man kurze Strecken bauen, alles ins Laden-Lager schicken und per Lagerhaus wieder herausholen). Ist es leer, befüllt man es neu. Im Infofenster des Lagerhauses:
  - **📥 Befüllen:** Ware aus dem Laden-Lager wählen und die Menge einstellen wie bei der Theke (0, −5, −1, +1, +5, Alle), bis zu 150 Stück. Beispiel: 120 Eisenbarren, die an der Theke nur 1.440 Gold bringen würden, laufen in eine Schmiede und werden zu 24 Eisenstangen (1.728 Gold oder Zutat für Kombi-Teile).
  - ~~**🔁 Nachschub:** Das Lagerhaus holt dauerhaft eine Ware aus dem Laden-Lager (mit einstellbarem Rest).~~ *v0.12.0 bis v0.13.0; seit v0.14.0 entfernt (Tobias).*
  - **↩ Ausräumen:** Alles aus dem Lagerhaus zurück ins Laden-Lager.
  - Rohstoffe (Holzstamm, Felsbrocken, Eisenerz) kommen nicht ins Lagerhaus; die legt man direkt in ihr Gebäude ein.
- **Bänder leeren (seit v0.12.0):** Band antippen → **„🧺 Strecke leeren“**: Alle Waren der zusammenhängenden Strecke (hell markiert; alle direkt verbundenen Bänder, auch über Abzweige und Zusammenführungen; an Gebäuden endet sie) kommen ins Laden-Lager, die Bänder bleiben liegen. Staut sich der Eingang einer Maschine (rotes Licht), steht im Infofenster **„🧺 Zulauf leeren“**: Bringt eine Zuleitung eine Ware, die die Maschine gar nicht braucht, wird nur diese geleert, sonst alle gestauten.
- **Kombi-Maschinen** (seit v0.10.0) haben zwei Eingänge und brauchen zwei verschiedene Zutaten, z. B. Zimmerei: 10 Holzstäbe + 5 Stein-Zahnräder → 1 Zahnradwelle. Jeder Eingang nimmt jede passende Zutat; am sichersten kommt jede Zutat über ihren eigenen Eingang. Fehlt eine Zutat, zeigt die Maschine ein kleines Bild davon; das Infofenster sagt, wie viel fehlt. Laufen beide Zutaten gemischt über ein Band und eine nimmt überhand, staut sich der Eingang (rotes Licht, „Eingang blockiert“).
- Eine Werkstatt kann mehrere Rezepte (Grundmaschinen zwei, Kombi-Maschinen drei). Man stellt ein, was sie gerade herstellt. Das Infofenster zeigt auch die Rezepte der anderen Einstellungen. Beim Umstellen bleiben alle Teile in der Maschine (seit v0.10.1) und werden wieder gebraucht, wenn man zurückstellt; mit „↩ Reste ins Laden-Lager“ holt man nicht gebrauchte Teile heraus.
- **Umbauen ist leicht und günstig** (verschieben, drehen, abreißen mit Rückerstattung), weil man sich ständig an den Markt anpasst. Das gilt für alle Gebäude, auch die Startgebäude, damit man den Schwerpunkt der Fabrik jederzeit neu setzen kann.
- **Bereiche umbauen (seit v0.11.0, Wunsch von Tobias):** Mit dem Werkzeug „✥ Verschieben“ in der Bauleiste markiert man einen Bereich (Rechteck ziehen oder ein Teil antippen). Alles darin – Bänder, Maschinen, Lager, Portale; auch Gebäude, die nur zum Teil im Rechteck liegen – lässt sich auf einmal verschieben, um 90° drehen oder abreißen. Innerhalb der Gruppe bleibt alles verbunden, Waren ziehen mit um, die Fabrik läuft sofort weiter. So setzt man z. B. eine ganze Eisen-Linie in eine andere Ecke, ohne ein Band neu zu legen.
- **Taste R (seit v0.11.0):** Mit angeschlossener Tastatur dreht R die Vorschau beim Bauen und Verschieben, sonst das angetippte Gebäude oder Band.
- **Bauen geht sofort**, sofern man die Waren dafür hat. Es gibt keine Bauzeiten.
- **Bauen kostet Waren statt Gold** (Tobias, v0.7.0): z. B. Förderband 1 Holzblock, Sägewerk 40 Holzblöcke. Die Waren kommen aus dem Laden-Lager. So muss man abwägen: verkaufen oder damit eine weitere Maschine bauen? Abreißen gibt die bezahlten Waren zurück; Verschieben und Drehen sind kostenlos. Tabelle in Abschnitt 4.2.

### 3.4 Wirtschaft

- **Zuerst feste Preise**, damit die Spielmechanik einfach bleibt. Weiterverarbeiten muss sich lohnen (Beispiel von Tobias): Kostet ein Holzstamm 50 Gold, bringen die 200 Holzblöcke daraus knapp über 50 Gold. Macht man daraus 40 Winkel (oder 20 Winkel und 20 Stäbe), bringt der Verkauf deutlich mehr. So kann man nach und nach die Produktion ausbauen.
- **Platzhalter-Preise im Spiel** (alles ×10, damit es nur ganze Goldbeträge gibt): Holzstamm/Felsbrocken 550 Gold (Kauf) → 200 Blöcke à 3 Gold = 600 Gold (+9 %) → 40 Teile à 18 Gold = 720 Gold (+31 %). Ein Test prüft, dass jede Stufe mehr bringt als die vorige.
- **Laden:** Der Knopf „Laden“ unten links öffnet den Laden mit den Reitern **Lager**, **Theken** und **Händler** (seit v0.7.0). Er hat ein eigenes **Lager** (gefüllt über das Versandportal) und **Verkaufstheken**. Die Theken bestückt man **von Hand** mit dem, was man verkaufen möchte, und stellt dabei genau ein, wie viele Stück darauf kommen (seit v0.10.0, z. B. nur 8). Bis Level 3 gibt es 2 Theken; ab Level 4 kommt mit jedem Aufstieg eine Theke dazu (Level 6: 5 Theken). Alle Theken wachsen mit (seit v0.10.1): kleine Theken mit 20 Plätzen bis Level 3, mittlere mit 25 auf Level 4, große mit 30 ab Level 5 – dann bleibt es erst einmal so. Das Laden-Lager fasst bis Level 3 500 Waren, ab Level 4 1.000. **Kunden kommen zufällig vorbei und kaufen zufällig viel**, z. B. der eine 2 Zahnräder und 1 Splitt, der nächste 3 Winkel – zu einem „normalen“ Preis. Später darf der Laden interaktiver werden; für den Anfang reicht die Übersicht.
- **Händler:** Hier kauft man Rohstoffe wie Holzstämme. **Verkaufen kann man nur über die Theken**, nicht an den Händler (Tobias, v0.7.0): Was man nicht mehr braucht, verkauft man über die Theken; vieles braucht man später noch, deshalb lohnt sich ein gemischtes Lager.
- **Nachfrage:** Wer viel von einer Ware verkauft, drückt ihren Preis. Mit der Zeit erholt er sich wieder. Dazu kommen Trends, z. B. „Die Stadt baut eine Mauer: Steinblöcke +50 % für 2 Tage“. Eine Tür bringt also mal mehr, mal weniger Gold, je nachdem, wie gefragt sie gerade ist. So entsteht das Wirtschaftsgefühl, und es lohnt sich, je nach Marktlage umzubauen.
- **Start:** 500 Gold Startkapital (seit v0.9.1, vorher kein Gold). Der erste Holzstamm ist gratis, dazu 20 Holzblöcke für die ersten Förderbänder zum Versandportal. Das Startkapital sorgt dafür, dass nach den ersten Gebäuden genug Gold für den zweiten Holzstamm da ist. Den ersten Felsbrocken gibt es beim Aufstieg auf Level 2, das erste Eisenerz bei Level 3 (seit v0.9.0).
- **Pleiteschutz:** Bei absoluter Pleite bekommt man einen Holzstamm geschenkt (Idee von Claude, von Tobias für gut befunden). „Pleite“ heißt: weniger Gold als ein Holzstamm kostet, kein Rohstoff im Lager oder in Arbeit, und alle Waren (Lager, Theken, Fabrik) zusammen sind weniger wert als ein Holzstamm.
- **Rohstoffe und Erträge:** Stein kostet so viel wie Holz und bringt ähnliche Erträge. Eisen kostet deutlich mehr, bringt aber auch mehr Gold. So verdient man mit jedem neuen Rohstoff mehr – und frühere Produkte verlieren ihren Wert nicht, weil sie für spätere Rezepte gebraucht werden.
- **Kaufen statt herstellen:** Jede Ware kann man auch kaufen, z. B. eine fertige Tür. Das ist teurer als selbst herstellen, spart aber Platz und Zeit.
- **Schwarzmarkt** (später, online, noch unsicher): Spieler bieten Waren zu eigenen Preisen an; der Online-Markt bestimmt die Preise. Idee von Tobias: Alle Läden sind verbunden – bieten alle Winkel an, sinkt der Preis für Winkel. Computer-Händler sorgen dafür, dass der Markt auch mit wenigen Spielern lebendig ist.

### 3.5 Fortschritt

- **Laden-Level**, ähnlich dem Rathaus in Clash of Clans: Jede Stufe schaltet neue Werkstätten, Rezepte, Lagerplatz und Fläche frei. Jede Stufe wird teurer. **Rohstoffe nach Level:** Holz ab Level 1, Stein ab Level 2, Eisen ab Level 3.
- **Erste einfache Level (v0.9.0 bis v0.12.0):** Level 1 startete nur mit Holz; wer 1 Holzplatte und 1 Holzstab hergestellt hatte, konnte kostenlos auf Level 2 aufsteigen usw. *Seit v0.13.0 ersetzt durch Aufträge (siehe unten).* **Zu Beginn jedes Levels gibt es einen Rohstoff gratis** (Tobias).
- **Level 4–6 (seit v0.10.0):** Jedes Level schaltet eine Kombi-Maschine und eine weitere Verkaufstheke frei: Level 4 Zimmerei, Level 5 Feinschmiede, Level 6 Schlosserei. Dazu wächst der Laden (seit v0.10.1): Level 4 bringt mittlere Theken (25) und 1.000 Plätze im Laden-Lager, Level 5 große Theken (30). (Die doppelt so tiefen Flächen-Streifen ab Level 4 aus v0.10.1 gelten seit v0.10.2 schon ab Level 1.) Geschenk ist jeweils 1 Eisenerz.
- **Einführung bis etwa Level 10 (Tobias):** Die ersten Level konzentrieren sich darauf, eine coole Produktionsstätte aufzubauen. Man kommt mit jedem Level ein Stück weiter und lernt nach und nach alles kennen; bis etwa Level 10 ist sozusagen das „Intro“ abgeschlossen.
- **Aufträge, Erfahrung und Gold (seit v0.13.0, Modell von Tobias):** Im Level-Fenster (oben auf „Laden-Level“ tippen) steht im Reiter „📜 Aufträge“ immer **genau ein Auftrag** eines Bewohners, z. B. „Müllerin Grete: Für das Mahlwerk brauche ich Räderwerke – 4 Räderwerke“. **„✓ Abgeben“** nimmt die Waren aus dem Laden-Lager und gibt **Erfahrung (XP)** und **Gold** – Gold genau so viel, wie die Waren an der Theke bringen (nicht mehr: Man macht die Aufträge wegen der Erfahrung, der Ladenverkauf bleibt im Vordergrund). Dann kommt der nächste Auftrag; **2–5 Aufträge je Level**, überspringen geht nicht. Die Erfahrung aller Aufträge eines Levels reicht genau für den Aufstieg; **aufsteigen kostet dann Gold** (Level 2: 100, Level 3: 250, Level 4: 500, Level 5: 1.000, Level 6: 2.000). Danach braucht man Bauteile für die neuen Maschinen. So bleibt alles schlüssig: Erfahrung schaltet frei, Gold kauft das Level, Waren bauen die Maschinen. Die Stückzahlen sind so gewählt, dass man ab Level 4 auf Masse gehen muss (z. B. 8 Räderwerke + 4 Zahnradwellen). Eine Erfahrungsleiste steht im Level-Fenster und klein im Knopf „Laden-Level“; ein ❗ dort heißt: Der Auftrag lässt sich abgeben. Tabelle aller Aufträge in Abschnitt 3.8.
- **Test-Knopf (seit v0.15.0, Wunsch von Tobias):** Unter dem Auftrag steht im Prototyp immer **„🧪 Test: Auftrag erledigen“**. Er wertet den Auftrag als erledigt und gibt die Erfahrung, nimmt aber keine Waren und gibt kein Gold – so lässt sich die Spielmechanik testen, ohne die Wirtschaft zu verfälschen. Aufsteigen kostet weiter Gold. Vor v1.0 fliegt der Knopf wieder raus (eine Zeile in `data/levels.js`: `QUEST_TEST_SKIP`).
- **Idee für später (Tobias, noch offen):** Mit Erfahrung Verbesserungen freischalten, z. B. schneller Holz verarbeiten oder schnellere Förderbänder (offene Frage 15).
- **Laden-Ausbau** geht sofort, kostet aber Gold **und** Waren, z. B. 200 Holzzahnräder + 200 Splitt + 500 Gold. So muss man ständig Neues produzieren, und das Produzieren ersetzt das Warten.
- **Fläche kaufen:** Das Grundstück wird stückweise mit Gold erweitert (seit v0.9.0 im Spiel). Seit v0.10.2 zum festen Preis (500 Gold für 4 Reihen, jede Seite 2×), damit man am Anfang gut skalieren kann und nicht am Platz scheitert (Tobias). Ob es später mehr Fläche gibt, z. B. mit Level oder Aufgaben, entscheiden wir mit den Aufgaben.
- **Freischaltpunkte (Idee, später entscheiden):** Jeder Laden-Aufstieg gibt Punkte, z. B. 10 Punkte für Level 2. Mit den Punkten schaltet man neue Werkstätten frei, etwa das Sägewerk, und kann sie danach sofort bauen.

### 3.6 Zeit

- Das Spiel läuft in Echtzeit. **Seit v0.14.0 produziert die Fabrik weiter, auch wenn das Spiel geschlossen oder die App im Hintergrund ist.**
- **Wie Clash of Clans, nur umgekehrt (Tobias):** Dort laufen die Sammler voll und man leert sie; bei uns läuft alles, bis es leer ist, und man füllt nach. Holz, Stein und Eisen legt man immer von Hand nach (bis zu 3 je Gebäude, „⏫ Auffüllen“), Lagerhäuser befüllt man von Hand; die Produktion selbst läuft automatisch weiter – vom Holzfäller über Bänder und Maschinen bis zur letzten Maschine, die nichts mehr zu tun hat.
- **Was weiterläuft:** Rohstoff-Gebäude, bis ihr Vorrat verarbeitet ist; Maschinen, bis ihnen Zutaten fehlen; Lagerhäuser, bis sie leer sind; das Versandportal, bis das Laden-Lager voll ist; Kunden kaufen an den Theken, bis sie leer sind. Ein zusätzliches Zeitlimit gibt es nicht.
- **Beim Zurückkommen** rechnet das Spiel die verpasste Zeit nach (genau wie im laufenden Spiel). Nach mehr als 1 Minute erscheint eine kurze Meldung, nach mehr als 10 Minuten das Fenster **„👋 Willkommen zurück!“**: wie lange man weg war, was Kunden gekauft haben, was ins Laden-Lager kam, welche Gebäude leer gelaufen sind, ob das Laden-Lager voll oder alle Theken leer sind.
- Leere Rohstoff-Gebäude, leere Theken und ein volles Laden-Lager sind der Anreiz, regelmäßig reinzuschauen.

### 3.7 Online-Teil (später)

- Spielerkonto, Spielstand auf einem Server.
- Globaler Schwarzmarkt mit Angeboten der Spieler.
- Clans: beitreten und untereinander handeln.
- Veröffentlichung als App (Android, iOS).
- **Geschäftsmodell:** Das Spiel ist kostenlos. Geld kommt später über einen Season Pass und Skins herein. „Pay2Win“ steht nicht im Fokus.

**Was das bedeutet:** Für den Online-Teil brauchen wir einen Server mit Datenbank. Das bringt mit sich: laufende Kosten, Datenschutz (DSGVO), Schutz vor Schummeln (der Server muss die Wirtschaft kontrollieren, nicht das Handy), Moderation von Clan-Chats und Gebühren für die App-Stores (derzeit Google einmalig 25 US-Dollar, Apple 99 US-Dollar pro Jahr). Deshalb bauen wir zuerst das Einzelspieler-Spiel und legen den Code so an, dass der Online-Teil später angedockt werden kann.

### 3.8 Der Ort und seine Bauabschnitte (seit v0.13.0)

Rahmen von Claude, von Tobias angenommen („gefällt mir sehr gut“). Namen der Bewohner hat Claude gewählt (Tobias: „erstmal nicht so wichtig“). Alle Mengen sind Platzhalter (Datentabelle `src/core/data/levels.js`). Erfahrung = 1 je 10 Gold Warenwert, Gold = Warenwert.

| Level | Bauabschnitt | Aufträge (der Reihe nach) | Erfahrung fürs nächste Level | Aufstieg kostet |
|---|---|---|---|---|
| 1 | Die ersten Hütten | Zimmermann Jakob: 5 Holzplatten (Hüttenwände) · Jakob: 10 Holzstäbe (Dach) · Bürgermeisterin Hilde: 20 Holzstäbe + 10 Holzplatten (Zaun um die Weide) | 81 | – (Start) |
| 2 | Wege und Brunnen | Steinmetzin Berta: 10 Steinplatten (Pflaster) · Berta: 10 Stein-Zahnräder (Brunnenwinde) · Hilde: 20 Steinplatten + 10 Holzstäbe (Brunnen mit Holzdach) | 90 | 100 Gold |
| 3 | Die Dorfschmiede | Schmied Konrad: 5 Eisenstangen (Werkzeug) · Konrad: 5 Eisenbleche (Beschläge) · Hilde: 10 Eisenstangen + 10 Holzplatten (Pflüge) | 162 | 250 Gold |
| 4 | Die Mühle am Fluss | Müllerin Grete: 2 Zahnradwellen · Grete: 4 Räderwerke (Mahlwerk) · Grete: 2 Verstärkte Holzplatten (Mühlentür) · Hilde: 8 Räderwerke + 4 Zahnradwellen (zweite Mühle) | 714 | 500 Gold |
| 5 | Der Markt | Händlerin Marta: 2 Scharniere (Klappen der Stände) · Marta: 2 Schlüssel (Kassen) · Baumeister Anton: 1 Zirkel (Marktplatz vermessen) · Marta: 3 Scharniere + 3 Schlüssel (Markttag) | 1.495 | 1.000 Gold |
| 6 | Das Stadttor | Torwächter Ulrich: 4 Gewichtsteine (Gegengewichte der Zugbrücke) · Ulrich: 2 Vorhängeschlösser (Tor) · Hilde: 2 Uhrwerke (Torturm) · Ulrich: 4 Vorhängeschlösser + 4 Gewichtsteine (Pforten der Stadtmauer) | 1.841 | 2.000 Gold |
| 7 *(geplant, v0.16.0)* | Die Heilstube | Heilerin Agnes: 5 Verbände · Agnes: 50 Flachsfasern (Wundpolster) · Torwächter Ulrich: 15 Verbände (Wachstube) · Hilde: 20 Verbände + 50 Flachsfasern (Markttag) | 850 (sammelt sich bis Level 8) | 3.000 Gold |

Der Reiter „🏘️ Ort & Level“ im Level-Fenster zeigt alle Bauabschnitte mit dem, was sie freischalten. Level 7 ist geplant (v0.16.0, Abschnitt 6); Level 8–12 folgen häppchenweise (Abschnitt 4.4).

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

**Seit v0.10.0 (Tobias):** Statt 6 Kombinations- und Weiterverarbeitungs-Maschinen gibt es nur **3 Maschinen mit je 3 Einstellungen** (Zimmerei, Feinschmiede, Schlosserei) – sonst werden es zu viele Maschinen und zu viel Unordnung. Mörser & Stößel sowie die freien Einstellungen fallen weg; jedes der 9 Produkte hat ein eigenes Rezept (Abschnitt 4.2).

### 4.2 Festgelegter Techbaum (Stand 06.11.2026)

Von Tobias bestätigt (Chat 3, Teil 2). Mengen, Zeiten und Preise hat Claude vorgeschlagen; Tobias hat sie mit dem Plan für v0.6.0 zum Ausprobieren freigegeben (Chat 4): „erstmal so umsetzen und dann schauen, wie es wirkt“. Alle Goldbeträge ×10.

**Kette je Rohstoff:** Rohstoff kaufen → Block-Gebäude (1 Rohstoff → 200 Blöcke in 15 Minuten) → Grundmaschine (5 Blöcke → 1 Teil). Diese Block-Stufe bleibt für alle drei Rohstoffe (Tobias: „weiterhin wichtig und richtig“).

**Gebäude** (Maschinen 2 × 2, alles andere kleiner):

| Gebäude | Größe | Aufgabe | Freigeschaltet ab |
|---|---|---|---|
| Holzfällerlager | 2 × 2 | 1 Holzstamm → 200 Holzblöcke; seit v0.14.0 bis zu 3 Holzstämme als Vorrat | Level 1 |
| Steinbruch | 2 × 2 | 1 Felsbrocken → 200 Steinblöcke; seit v0.14.0 bis zu 3 als Vorrat | Level 2 |
| Schmelzhütte (neu) | 2 × 2 | 1 Eisenerz → 200 Eisenbarren; seit v0.14.0 bis zu 3 als Vorrat | Level 3 |
| Sägewerk | 2 × 2 (bisher 2 × 1) | A: Holzplatte · B: Holzstab | Level 1 |
| Steinmetz | 2 × 2 (bisher 2 × 1) | A: Steinplatte · B: Stein-Zahnrad | Level 2 |
| Schmiede (neu) | 2 × 2 | A: Eisenblech (bis v0.12: Mini-Eisenplatte) · B: Eisenstange (bis v0.7.1: Eisennägel) | Level 3 |
| Zimmerei (Kombi, seit v0.10.0) | 2 × 2 | Zahnradwelle · Räderwerk · Verstärkte Holzplatte | Level 4 |
| Feinschmiede (Kombi, seit v0.10.0) | 2 × 2 | Scharnier · Schlüssel · Zirkel | Level 5 |
| Schlosserei (Kombi, seit v0.10.0) | 2 × 2 | Gewichtstein · Uhrwerk · Vorhängeschloss | Level 6 |
| Lagerhaus | 2 × 1 | Zwischenlager, 3 × 50; seit v0.12.0 von Hand aus dem Laden-Lager befüllen (Nachschub nur bis v0.13.0) | Level 1 |
| Versandportal | 1 × 1 | schickt Waren ins Laden-Lager | Level 1 |
| Förderband | 1 × 1 | transportiert | Level 1 |

Namen aus Tobias' Tabelle → Spiel: Holz-Werkbank → Sägewerk, Steinmetz-Station → Steinmetz, Schmiedeofen → Schmiede, Steinfels → Felsbrocken. Seit v0.10.0 gibt es nur noch 3 Kombi-Maschinen: Zimmerei, Feinschmiede, Schlosserei (Mühlenbauer, Feinwerkstatt und Getriebebauer fallen weg). Die Warennamen bleiben wie in Tobias' Tabelle. Alle Namen lassen sich jederzeit ändern.

**Anschlüsse der 2 × 2-Maschinen:** Grundmaschinen (seit v0.6.0): Eingang links oben, Ausgang rechts oben (gerade Linie; bestehende Bänder am Sägewerk bleiben angeschlossen). Kombi-Maschinen (seit v0.10.0): zwei Eingänge links oben und links unten (jeder nimmt jede passende Zutat), Ausgang rechts oben. Block-Gebäude unverändert (Ausgang rechts oben).

**Neue Namen (seit v0.13.0, Tobias):** Jedes Produkt heißt so, wie es logisch aus seinen Zutaten entsteht, und bleibt klein. Rezepte, Mengen und Werte sind unverändert; bestehende Spielstände werden umbenannt.

| Bis v0.12 | Seit v0.13.0 | Warum es passt |
|---|---|---|
| Mini-Eisenplatte | Eisenblech | gewalztes Blech aus Eisenbarren |
| Handkurbel | Zahnradwelle | Zahnräder auf einer Holzachse |
| Mechanischer Schalter | Räderwerk | viele ineinandergreifende Räder |
| Eisenfeder | Schlüssel | Schaft aus der Eisenstange, Bart aus dem Blech |
| Kugellager | Zirkel | zwei Schenkel (Stangen) an einem Gelenk (Scharnier) |
| Steinkette | Gewichtstein | Stein mit Eisenhaken (für Waage, Uhr, Zugbrücke) |
| Regler | Uhrwerk | Wellen und Räder ergeben ein Uhrwerk |
| Mini-Schloss | Vorhängeschloss | Bügel am Gelenk und Schließwerk aus Rädern |

Verstärkte Holzplatte und Scharnier heißen weiter so.

**Rezepte und Preise** (alle im Spiel; Eisenstange seit v0.8.0, die Kombi-Teile ab „Zahnradwelle“ seit v0.10.0, Namen seit v0.13.0): Regel: Blöcke bringen knapp mehr als der Rohstoff kostet (+9 %), jedes weitere Teil rund 20 % mehr als seine Zutaten zusammen. So macht man beim Verkaufen in der Anfangsphase nie Minus. Stein kostet und bringt so viel wie Holz; Eisen kostet viermal so viel und bringt entsprechend mehr. **Kombi-Teile (Tobias):** Jedes Produkt hat ein eigenes Rezept; aus Grundteilen meist 10 + 5 Stück, damit alle Rohstoffe etwa gleich viel gebraucht werden. Aus einem Holzstamm und einem Felsbrocken werden so etwa 5 Zahnradwellen oder Räderwerke – wer viel herstellen will, braucht mehr Rohstoff-Linien.

| Ware | Herstellung | Zeit | Wert (Gold) |
|---|---|---|---|
| Holzstamm | beim Händler kaufen | – | 550 (Kauf) |
| Felsbrocken | beim Händler kaufen | – | 550 (Kauf) |
| Eisenerz | beim Händler kaufen | – | 2.200 (Kauf) |
| Holzblock / Steinblock | Holzfällerlager / Steinbruch | 4,5 s je Block | 3 (200 Stück = 600) |
| Eisenbarren | Schmelzhütte | 4,5 s je Barren | 12 (200 Stück = 2.400) |
| Holzplatte / Holzstab | Sägewerk: 5 Holzblöcke → 1 | 5 s | 18 (40 Stück = 720) |
| Steinplatte / Stein-Zahnrad | Steinmetz: 5 Steinblöcke → 1 | 5 s | 18 |
| Eisenblech | Schmiede: 5 Eisenbarren → 1 | 5 s | 72 (40 Stück = 2.880) |
| Eisenstange (seit v0.8.0) | Schmiede: 5 Eisenbarren → 1 | 5 s | 72 (40 Stück = 2.880) |
| Zahnradwelle | Zimmerei: 10 Holzstäbe + 5 Stein-Zahnräder | 20 s | 324 (Zutaten 270) |
| Räderwerk | Zimmerei: 10 Stein-Zahnräder + 5 Holzstäbe | 20 s | 324 (Zutaten 270) |
| Verstärkte Holzplatte | Zimmerei: 10 Holzplatten + 5 Eisenstangen | 20 s | 648 (Zutaten 540) |
| Scharnier | Feinschmiede: 10 Eisenbleche + 5 Eisenstangen | 20 s | 1.296 (Zutaten 1.080) |
| Schlüssel | Feinschmiede: 10 Eisenstangen + 5 Eisenbleche | 20 s | 1.296 (Zutaten 1.080) |
| Zirkel | Feinschmiede: 1 Scharnier + 5 Eisenstangen | 30 s | 1.987 (Zutaten 1.656) |
| Gewichtstein | Schlosserei: 10 Steinplatten + 5 Eisenstangen | 20 s | 648 (Zutaten 540) |
| Uhrwerk | Schlosserei: 1 Zahnradwelle + 1 Räderwerk | 30 s | 778 (Zutaten 648) |
| Vorhängeschloss | Schlosserei: 1 Scharnier + 1 Räderwerk | 30 s | 1.944 (Zutaten 1.620) |

**Eisenstange statt Eisennägel (v0.8.0):** Bis v0.7.1 machte die Schmiede aus 5 Barren 5 Nägel zu je 14 Gold. Tobias fiel beim Spielen auf, dass dadurch extrem viele Nägel entstehen (100–140 im Lager, von allem anderen etwa 20), und an der Theke brachten 20 Nägel nur 280 Gold. Jetzt läuft die Schmiede wie Sägewerk und Steinmetz: 5 : 1. Nägel können später als eigene Stufe zurückkommen (z. B. 1 Eisenstange → mehrere Nägel).

**Steinkette (seit v0.13.0 Gewichtstein) aus Steinplatten (v0.10.0):** Sonst bräuchte kein Kombi-Rezept die Steinplatte. So wird jedes der 6 Grundteile gebraucht; Eisen etwas mehr als Holz und Stein, weil es auch mehr bringt.

**Freischalten nach Laden-Level** (von Tobias bestätigt): Level 1 Holz, Level 2 Stein, Level 3 Eisen, Level 4 Zimmerei, Level 5 Feinschmiede, Level 6 Schlosserei (seit v0.10.0 je Level eine Kombi-Maschine). Seit v0.13.0 braucht der Aufstieg Erfahrung aus Aufträgen und kostet Gold (Abschnitt 3.5 und 3.8). Den ersten Rohstoff jeder Sorte gibt es gratis: den ersten Holzstamm zum Spielstart, den ersten Felsbrocken beim Erreichen von Level 2, das erste Eisenerz bei Level 3; ab Level 4 gibt es bei jedem Aufstieg 1 Eisenerz (einen vierten Rohstoff gibt es nicht).

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
| Zimmerei (v0.10.0) | 20 Holzplatten + 10 Eisenstangen | 1.080 Gold |
| Feinschmiede (v0.10.0) | 10 Eisenbleche + 2 Räderwerke | 1.368 Gold |
| Schlosserei (v0.10.0) | 1 Scharnier + 2 Verstärkte Holzplatten | 2.592 Gold |

Das Sägewerk kostet nur Holzblöcke, damit die erste Maschine ohne Platten baubar ist. Für Stein braucht man Holzteile, für Eisen Steinteile, für die Kombi-Maschinen Teile aus den vorigen – so behalten frühere Waren ihren Wert. Kein Gebäude kostet mehr, als ein Rohstoff seines Levels als Teile einbringt (Holz und Stein 720 Gold, Eisen und ab Level 4: 2.880 Gold; ein Test prüft das). Eine Level-4-bis-6-Maschine kostet also höchstens etwa eine Runde Eisen.

**Holzwinkel und Splitt** fliegen raus (vielleicht kommen sie später wieder). Vorhandene im Spielstand werden umgewandelt: Holzwinkel → Holzplatte, Splitt → Stein-Zahnrad.

### 4.3 Im Spiel (Stand v0.14.0)

| Stufe | Ware | Woher | Rezept |
|---|---|---|---|
| 0 | Holzstamm (ab Level 1), Felsbrocken (ab Level 2), Eisenerz (ab Level 3) | Händler (550 / 550 / 2.200 Gold); 1 Holzstamm gratis zum Start, je 1 Felsbrocken bzw. Eisenerz gratis beim Aufstieg | – |
| 1 | Holzblock / Steinblock / Eisenbarren | Holzfällerlager / Steinbruch / Schmelzhütte (je bis zu 3 Rohstoffe als Vorrat) | 1 Rohstoff → 200 Stück in 15 Minuten |
| 2 | Holzplatte / Holzstab | Sägewerk, Einstellung „Platten“ / „Stäbe“ | 5 Holzblöcke → 1 Teil (5 Sekunden) |
| 2 | Steinplatte / Stein-Zahnrad | Steinmetz, Einstellung „Platten“ / „Zahnräder“ | 5 Steinblöcke → 1 Teil (5 Sekunden) |
| 2 | Eisenblech / Eisenstange | Schmiede, Einstellung „Bleche“ / „Stangen“ | 5 Eisenbarren → 1 Teil (5 Sekunden) |
| 3 | Zahnradwelle / Räderwerk / Verstärkte Holzplatte | Zimmerei (ab Level 4), Einstellungen „Wellen“, „Räderwerke“, „Verst. Platten“ | aus je 10 + 5 Grundteilen (20 Sekunden) |
| 3 | Scharnier / Schlüssel | Feinschmiede (ab Level 5) | aus je 10 + 5 Eisen-Teilen (20 Sekunden) |
| 3 | Gewichtstein | Schlosserei (ab Level 6), Einstellung „Gewichte“ | 10 Steinplatten + 5 Eisenstangen (20 Sekunden) |
| 4 | Zirkel | Feinschmiede | 1 Scharnier + 5 Eisenstangen (30 Sekunden) |
| 4 | Uhrwerk / Vorhängeschloss | Schlosserei | 1 Zahnradwelle bzw. 1 Scharnier + 1 Räderwerk (30 Sekunden) |

Genaue Rezepte und Werte: Abschnitt 4.2.

**Ideen für später:** weitere Rohstoffe wie Lehm (Ziegel), Hanf (Seile), Sand (Glas). *Größere Waren wie Fässer, Karren, Fenster passen nicht mehr (Tobias, v0.13.0: nur kleine Waren, die auf dem Band darstellbar sind).*

### 4.4 Der weitere Techbaum: das Kräuter-Kapitel (Tobias, Chat 9 bis Chat 11 – Richtung steht, Details noch offen)

**Tobias' Plan (Chat 10):** Die Level 1–6 waren ein Kapitel voller Werkzeuge. Ab Level 7 beginnt ein **zweites Kapitel mit neuer Thematik – Kräuter und Heilkunde** – und fängt wieder einfach an: Man stellt wieder ganz einfach etwas her (Flachs → Verbände) und steigert sich in der Schwierigkeit, bis man auf Level 10 (dem „Level 4“ der Kräuter) wieder mehr in die Produktion investieren muss. Auf Level 11 oder 12 schließt das Kräuter-Kapitel ab. Dann gibt es **zwei große Techbäume: Werkzeuge und Kräuter**. Ab Level 13 kommen neue Produkte, z. B. **Sand**: daraus Glas, aber über die Kräuter-Maschinen auch Sandstaub für die Zauberei – die Kapitel greifen ineinander.

| Level | Inhalt (Tobias) | Stand |
|---|---|---|
| 7 | **Flachs** (Tobias' Wahl nach Claudes Vorschlag, statt Farn oder Hanf) → **Fasern** → **Verbände** – wieder ganz einfach, als Grundlage (wie Level 1 mit Holz): Beet, Flachsbreche, Webstube | Plan steht (v0.16.0, Abschnitt 6), wartet auf Freigabe |
| 8 | **Ringelblume** als zweite Pflanze im selben Beet; die erste Maschine mit 2 Eingängen (Faser bzw. Verband + Kraut) → erster **Heilverband** (wie Level 2) | planen nach v0.16.0 |
| 9 | eine **dritte Pflanze** (Claudes Idee: Schafgarbe, das Wundkraut des Mittelalters) und der nächste Schritt, z. B. eine zweite Verbands-Version (wie Level 3) | später |
| 10 | Jetzt hat man **Fasern + 3 Pflanzen** – wie Holz, Stein und Eisen im Werkzeug-Kapitel. Wie Level 4: mehr investieren, auf Masse gehen | später |
| 11–12 | die Pflanzen **weiter kombinieren** (wie Level 5–6), Abschluss des Kräuter-Kapitels | später |
| 13+ | neues Kapitel, z. B. Sand → Glas, mit den Kräuter-Maschinen Sandstaub für die Zauberei | später |
| ~15 | **Alchemist** und Zaubertränke (Mörser → Pulver → Tränke) – Tobias möchte damit noch warten | später |

- **Ein allgemeines Beet (Tobias):** Es gibt nicht für jede Pflanze ein eigenes Gebäude, sondern ein Beet, in dem man alles anpflanzen kann (Samen einlegen = nachlegen, wie bei Holz, Stein und Eisen).
- **Warum Flachs (Claude):** Farn hat keine brauchbaren Fasern; Hanf eher grobe für Seile und Säcke. Aus Flachs wird Leinen – Leinenbinden waren im Mittelalter die Verbände. Tobias: „Flachs“.
- **Ringelblume** als altes Wundkraut für die Heilung (Claudes Vorschlag, Tobias: „gute Ergänzung“).
- **Farn als Zauberkraut für später** (Claudes Idee: Nach altem Volksglauben macht Farnsamen in der Johannisnacht unsichtbar) – noch offen.
- **Wie wir vorgehen (Tobias):** erst das Spiel im Hintergrund (v0.14.0), dann besprechen wir gemeinsam die Vorgehensweise mit Level und Techbaum, damit später alles Sinn ergibt.

**Vorgehen und Antworten von Tobias (Chat 11, 08.11.2026):**

- **Häppchenweise:** Erst das Gesamtbild auf dem Papier (v0.15.1, nur README), dann umsetzen: v0.16.0 Beet und Level 7, danach Level 8–9 (Heilverbände) und Level 10–12 (Claudes Vorschlag, Tobias: „Können wir gerne so umsetzen. Immer häppchenweise.“).
- **Das Beet:** Man kauft (baut) es wie eine Maschine, platziert es und pflanzt einen Samen. **1 Samen = 1 Pflanze**; die Pflanze wird etwas „größer“ dargestellt. Nach einer Wachszeit ist sie ausgewachsen und wird **geerntet**.
- **Wachszeit etwa 30 Minuten**, damit sich der Geldfluss steuern lässt (ein Samen bringt rund 50 % Gewinn).
- **Das Beet hat (noch) keinen Anschluss ans Band.**
- **Im Beet wächst alles**, egal welche Pflanze.
- **Kette (Level 7 wie Level 1, klein anfangen):** Eine Maschine macht aus der Pflanze Fasern, z. B. **1 Pflanze → 50 Fasern**, daraus **10 Verbände**. Später kommt eine Maschine mit 2 Eingängen für Faser + Kräuter.
- **Preise in der mittleren Kategorie** (die Werkstattwaren bringen bisher 72 bis gut 300 Gold): z. B. **1 Verband 150 Gold, 1 Samen 1.000 Gold** – aus einem Samen werden so 1.500 Gold. Feintuning später. **Die Basis (Flachs) bleibt günstig**; mit den Ringelblumen zieht es an: teurer, bringt aber auch mehr.

**Chat 11, Teil 2 (Antworten auf Claudes Fragen zu Level 7):**

- **Die geerntete Pflanze legt man ein wie einen Holzstamm** (das Beet hat kein Band): Beet → Laden-Lager → Flachsbreche.
- **Ernten und Säen sind zwei getrennte Schritte** – Tobias: „damit man 2× alles durchgehen muss“.
- **Das Beet ist 2 × 2** groß, damit die Pflanze gut zu sehen ist.
- **Die Maschine mit 2 Eingängen (Faser + Kraut) kommt erst auf Level 8** mit der Ringelblume. Auf Level 7 macht die Webstube nur Verbände.
- **Gesamtbild (Tobias):** Schritt für Schritt immer mehr dazu, wie im Werkzeug-Kapitel: Level 7 die Verbände als Grundlage, auf Level 8 kommt etwas dazu, auf Level 9 der nächste Schritt mit einer neuen Pflanze – so hat man bis Level 10 Fasern + 3 verschiedene Pflanzen (wie Holz, Stein und Eisen), und auf Level 11–12 kombiniert man sie weiter (Tabelle oben).

**Ältere Ideen (Chat 9):**

- **Kräuter anbauen:** Kräuter anpflanzen; nach einer bestimmten Zeit wächst die fertige Pflanze, die man ernten kann.
- **Mörser:** Pflanzen durch einen Mörser schicken (Kräutermixtur).
- **Verbände:** Aus Farn oder Hanf werden Verbände; Verband + Kräutermixtur = Heilender Verband.
- **Tränke:** Kräuter mit Kohle und anderen Dingen mischen – erste Produkte in Richtung Lebenstrank, Manatrank, Alterstrank und Ähnliches.
- **Leitlinien (Tobias):** nur kleine Waren; aus zwei Produkten entsteht immer das nächstmögliche, sinnvolle Produkt; die neuen Level erzählen die Geschichte des Ortes weiter (z. B. eine Heilerin oder Kräuterkundige als neue Bewohnerin – Claudes Idee).

---

## 5. Technik

- **Browser-Spiel** (HTML, JavaScript, Canvas). Es läuft auf Handy, Tablet und PC, ohne Installation.
- **Live über GitHub Pages:** ein einziger Link, nach jedem Merge aktuell.
- **Spielregeln getrennt von der Darstellung.** Die Simulation (Produktion, Förderbänder, Preise) kennt keine Grafik. Vorteile:
  - Die Regeln lassen sich automatisch testen.
  - Der gleiche Code kann später auf einem Server laufen (Online-Teil).
  - Die Grafik lässt sich austauschen, z. B. später eine Schrägansicht wie in Clash of Clans.
- **Inhalte als Datentabellen:** Waren, Rezepte, Gebäude und Preise stehen in Tabellen. Neue Inhalte sind neue Zeilen.
- **Simulation in festen Takten.** Verpasste Zeit wird beim Öffnen (und beim Zurückkommen aus dem Hintergrund) nachgerechnet (seit v0.14.0): Die Fabrik rechnet Takt für Takt wie im laufenden Spiel, bis sie stillsteht; danach kaufen nur noch die Kunden ein, das geht im Schnelldurchlauf. Gerechnet wird in Portionen, damit der Bildschirm nicht einfriert; dauert es länger, erscheint „⏩ Die Fabrik holt die Zeit nach …“ mit Fortschritt. Während des Nachrechnens wird nicht gespeichert. Gemessen: eine Fabrik mit 9 Holz-Linien braucht für 8 Stunden Abwesenheit gut 1 Sekunde (auf dem Tablet etwas mehr).
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
| `src/core/data/levels.js` | Laden-Level: Bauabschnitt des Ortes, Geschichte, Aufträge der Bewohner, Preis des Aufstiegs, Gratis-Rohstoff; Belohnungs-Regel der Aufträge; Test-Knopf an/aus (`QUEST_TEST_SKIP`, v0.15.0) (was ein Level freischaltet, steht als `level` bei Gebäuden und Rohstoffen) |
| `src/core/data/land.js` | Fläche kaufen: Streifentiefe, Käufe je Seite, Preis je Streifen |
| `src/core/data/offline.js` | Spiel im Hintergrund (v0.14.0): ab wann nachgerechnet wird, Grenzen, ab wann Meldung bzw. Fenster „Willkommen zurück“ |
| `src/core/state.js` | Spielzustand anlegen, Größe von Grundstück und Welt, Abfragen auf dem Raster |
| `src/core/dirs.js` | Himmelsrichtungen (oben, rechts, unten, links) |
| `src/core/geometry.js` | Größe, Drehung, Felder sowie Ein- und Ausgänge von Gebäuden |
| `src/core/buildings.js` | Gebäude bauen, verschieben, drehen, abreißen, freie Stelle suchen |
| `src/core/belts.js` | Förderbänder legen, aufteilen, zusammenführen, drehen, abreißen; Strecke finden und leeren, Zulauf leeren (v0.12.0) |
| `src/core/area.js` | Bereich markieren und alles darin verschieben, drehen oder abreißen (v0.11.0) |
| `src/core/production.js` | Was Gebäude tun: einlegen, herstellen, zwischenlagern, versenden, Status |
| `src/core/warehouse.js` | Lagerhaus und Laden-Lager (v0.12.0): befüllen, ausräumen (Nachschub seit v0.14.0 entfernt) |
| `src/core/offline.js` | Spiel im Hintergrund (v0.14.0): verpasste Zeit nachrechnen (in Portionen, Stillstand erkennen, dann nur Kunden), Bericht „Willkommen zurück“ |
| `src/core/sim.js` | Simulation in festen Takten: Waren auf Bändern, Stau, Aufteilen, Zusammenführen |
| `src/core/shop.js` | Laden-Lager, Baukosten bezahlen und zurückgeben |
| `src/core/market.js` | Handel: Händler, Theken, Kunden (mit eigenem Zufall im Spielstand), Pleiteschutz, Testpaket, „Auffüllen“ der Rohstoff-Gebäude (v0.14.0) |
| `src/core/levels.js` | Laden-Level: was freigeschaltet ist, hergestellte Waren zählen, aufsteigen (Erfahrung und Gold) |
| `src/core/quests.js` | Aufträge der Bewohner (v0.13.0): aktueller Auftrag, Belohnung, abgeben, Erfahrung je Level; Test-Knopf „Auftrag erledigen“ (v0.15.0) |
| `src/core/land.js` | Fläche kaufen: Streifen und Preis je Seite, wie oft noch, Kauf, welche Seite ein Feld der gesperrten Fläche ist |
| `src/core/save.js` | Spielstand in Text umwandeln, prüfen und alte Spielstände umwandeln |
| `src/view/camera.js` | Kamera: verschieben, zoomen, Bildschirm ↔ Welt umrechnen |
| `src/view/input.js` | Touch, Maus und Mausrad (Antippen, Ziehen, zwei Finger) |
| `src/view/controller.js` | Modi (Ansehen, Bauleiste, Platzieren, Förderband, Abreißen, Bereich markieren und verschieben) und was Gesten und die Taste R darin tun |
| `src/view/renderer.js` | Zeichnet Spielfeld, Bänder, Waren, Gebäude mit Statuslicht, Vorschau |
| `src/view/itemArt.js` | Aussehen der Waren (auf dem Band und in Listen); kleine Warenbilder lassen sich neu zeichnen |
| `src/view/hud.js` | Obere Leiste (Gold, Knopf „Laden-Level“ mit kleiner Erfahrungsleiste, ⬆ und ❗) und Menü ☰ |
| `src/view/panels.js` | Infofenster, großes Fenster, Rückfragen, Meldungen |
| `src/view/shop.js` | Laden-Fenster mit den Reitern Lager, Theken, Händler |
| `src/view/warehouse.js` | Lagerhaus-Fenster (v0.12.0): Ware wählen, dann Menge (Befüllen) |
| `src/view/offline.js` | Spiel im Hintergrund (v0.14.0): Hinweis „Die Fabrik holt die Zeit nach …“ und Fenster „Willkommen zurück“ |
| `src/view/levels.js` | Level-Fenster mit den Reitern „📜 Aufträge“ (Geschichte, Erfahrungsleiste, Auftrag mit „Abgeben“ und Test-Knopf, Aufstieg) und „🏘️ Ort & Level“ (alle Bauabschnitte) |
| `src/view/format.js` | Texte für Zahlen, Waren und Kosten |
| `src/view/buildbar.js` | Untere Leisten: Laden/Bauen, Bauleiste, Werkzeugleiste |
| `src/view/press.js` | Knöpfe reagieren aufs Loslassen des Fingers (siehe Entscheidungen) |
| `src/view/storage.js` | Speichern und Laden im Browser |
| `src/style.css` | Aussehen der Oberfläche |
| `assets/icons/` | App-Symbole (erzeugt mit `tools/make-icons.py`) |
| `tools/set-version.mjs` | Setzt die Versionsnummer in `src/version.js` und `index.html` (inkl. Import-Map) |
| `tests/*.test.js` | Automatische Tests: Spielregeln, Gebäude, Förderbänder, Handel, Level, Fläche, Speichern, Kamera, Versionsnummer, Kombi-Maschinen und Theken (`combo.test.js`), Bereiche verschieben (`area.test.js`), Lagerhaus befüllen und Bänder leeren (`warehouse.test.js`), Aufträge, neue Warennamen und Test-Knopf (`quests.test.js`), Spiel im Hintergrund, Rohstoff-Vorrat und Auffüllen (`offline.test.js`) |
| `tests/browser/smoke.cjs` | Browser-Test in Tablet- und Handygröße: spielt Bauen, Bänder, Fläche kaufen (bis eine Seite fertig ist), Abreißen, Bereich markieren/verschieben/drehen (auch mit Taste R)/abreißen, Speichern, Neues Spiel, Theken mit Mengenwahl, Aufträge abgeben und Aufsteigen bis Level 6 (mit Reiter „Ort & Level“), Test-Knopf „Auftrag erledigen“ (Stadttor-Aufträge ohne Waren und Gold), die Eisen-Kette, die Zimmerei, Strecke und Zulauf leeren, Lagerhaus befüllen und ausräumen (kein Nachschub), Auffüllen des Holzfällerlagers sowie das Spiel im Hintergrund (20 Minuten weg in der App, 2 Stunden mit geschlossenem Spiel → Fenster „Willkommen zurück“) per Touch durch; prüft, dass die Warenbilder der Bauleiste nach dem Wegwerfen wieder erscheinen |

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
| v0.9.0 | **Fläche kaufen & erste Level:** Grundstück streifenweise mit Gold vergrößern; Level 1 Holz → 2 Stein → 3 Eisen mit einfachen Zielen und Gratis-Rohstoff | ✅ fertig |
| v0.9.1 | **Startkapital:** 500 Gold zum Start, bestehende Spielstände bekommen sie einmalig nachgezahlt | ✅ fertig |
| v0.9.2 | **Test-Feedback (nur README):** Tobias' Test von v0.9.1 festgehalten, Plan für v0.10.0 vorbereitet | ✅ fertig |
| v0.10.0 | **Techbaum, Teil 2:** 3 Kombi-Maschinen mit je 2 Eingängen und 3 Einstellungen (9 neue Waren), Level 4–6, je Level eine Verkaufstheke mehr, Menge auf der Theke einstellbar | ✅ fertig |
| v0.10.1 | **Feinschliff nach Tobias' Test:** alle Theken wachsen mit (20 → 25 → 30), Laden-Lager 1.000 ab Level 4, Flächen-Streifen 4 tief ab Level 4, Teile bleiben beim Umstellen in der Maschine, Rezepte aller Einstellungen im Infofenster | ✅ fertig |
| v0.10.2 | **Fläche & Warenbilder:** jeder Flächenkauf 500 Gold für 4 Reihen (schon ab Level 1), jede Seite 2×; Warenbilder in der Bauleiste bleiben nach dem Minimieren sichtbar | ✅ fertig |
| v0.11.0 | **Umbauen:** Bereich markieren und alles darin auf einmal verschieben, drehen oder abreißen; Taste R dreht | ✅ fertig |
| v0.11.1 | **Test-Feedback (nur README):** Tobias' Test von v0.11.0 festgehalten, „Strecke leeren“ vorgemerkt | ✅ fertig |
| v0.12.0 | **Nachschub & Bänder leeren:** Lagerhaus als Gegenstück zum Versandportal (befüllen, Nachschub mit Rest, ausräumen), „Strecke leeren“ und „Zulauf leeren“ | ✅ fertig |
| v0.13.0 | **Aufträge & neue Namen:** Aufträge der Bewohner im Level-Fenster mit Erfahrung (XP) und Gold, Aufstieg mit Gold bezahlen, Bauabschnitte des Ortes, 8 Waren mit neuen Namen und Bildern | ✅ fertig |
| v0.14.0 | **Spiel im Hintergrund:** Fabrik läuft weiter, bis etwas leer ist; „Willkommen zurück“; Rohstoff-Vorrat (3) mit „Auffüllen“; Lagerhaus nur noch von Hand befüllen | ✅ fertig |
| v0.15.0 | **Test-Knopf:** „🧪 Test: Auftrag erledigen“ im Level-Fenster – Erfahrung ohne Waren und ohne Gold, solange das Spiel ein Prototyp ist | ✅ fertig |
| v0.15.1 | **Kräuter-Kapitel auf dem Papier (nur README):** Gesamtbild Level 7–12, Level 7 im Detail (Beet, Maschinen, Waren, Preise, Zeiten, Bewohnerin, Aufträge) | ✅ fertig |
| v0.16.0 | **Beet und Level 7 „Die Heilstube“:** säen, 30 Minuten wachsen, ernten; Flachsbreche (1 Pflanze → 50 Fasern), Webstube (5 Fasern → 1 Verband); Heilerin Agnes mit 4 Aufträgen | Plan steht (unten), wartet auf Tobias' Freigabe |
| v0.17.0 ff. | **Level 8–12:** Ringelblume und Heilverbände (Maschine mit 2 Eingängen), zweites Kraut, Masse, Abschluss des Kapitels (Abschnitt 4.4) | häppchenweise |

### Bänder leeren (vorgemerkt in v0.11.1, umgesetzt in v0.12.0)

Claudes Plan aus Chat 8, Teil 3; Tobias: „Die Option von Band leeren finde ich eigentlich eine gute Idee. Die können wir erstmal so festhalten.“ Umgesetzt zusammen mit dem Feedback nach Level 6 (v0.12.0).

- **Problem:** Landen falsche Waren auf einer Strecke (z. B. Holzplatten auf der Strecke, die nur Holzstäbe zur Zimmerei bringen soll), nimmt die Maschine sie nicht an und alles staut sich. Bisher hilft nur Abreißen und neu Bauen.
- **Am Band:** Band antippen → im Infofenster **„🧺 Strecke leeren“**. Alle Waren auf der zusammenhängenden Strecke (alle direkt verbundenen Bänder, auch über Abzweige und Zusammenführungen; an einer Maschine endet die Strecke) kommen ins Laden-Lager.
- **An der Maschine:** Zeigt sie rotes Licht („Eingang blockiert“), steht im Infofenster **„🧺 Zulauf leeren“** – leert die Strecke, die in diese Maschine führt.
- Nichts geht verloren (auch die richtigen Waren kommen ins Laden-Lager), die Bänder bleiben liegen, die Produktion läuft sofort weiter. Kommen weiter falsche Waren nach, muss man die Zuleitung umlegen.
- Spielstand-Format bleibt gleich.

**Idee für später (offen):** eine **Weiche mit Filter** – ein Band-Feld, das eine bestimmte Ware (z. B. nur Holzplatten) in eine Richtung schickt und alles andere geradeaus. Damit ließen sich gemischte Bänder automatisch sortieren. Ein eigener, größerer Schritt; Tobias hat sich dazu noch nicht geäußert (offene Frage 12).

### v0.16.0 – Beet und Level 7 „Die Heilstube“ (Plan, wartet auf Tobias' Freigabe)

Aufgebaut wie Level 1 – erst klein anfangen (Tobias, Chat 11). Tobias' Vorgaben stehen in Abschnitt 4.4; Namen, Zeiten, Baukosten und Aufträge sind Claudes Vorschlag. Alle Zahlen sind Platzhalter in den Datentabellen.

**Die Kette:**

| Schritt | Gebäude | Was passiert | Wert |
|---|---|---|---|
| 1 | Händler | **Leinsamen** kaufen (1 Säckchen = 1 Samen) | 1.000 Gold (Kauf) |
| 2 | 🌱 **Beet** (2 × 2, kein Band) | **Säen** → die Pflanze wächst **30 Minuten** → **Ernten**: 1 Flachspflanze kommt ins Laden-Lager. Säen und Ernten sind zwei getrennte Tipps. | – |
| 3 | 🪢 **Flachsbreche** (2 × 2, wie der Holzfäller) | Flachspflanze **einlegen** (Vorrat 3, „⏫ Auffüllen“ aus dem Laden-Lager) → **50 Flachsfasern** in 10 Minuten (alle 12 Sekunden eine) am orangen Pfeil aufs Band | 25 Gold je Faser (50 = 1.250) |
| 4 | 🧵 **Webstube** (2 × 2, wie das Sägewerk) | **5 Flachsfasern → 1 Verband** in 10 Sekunden; vorerst nur diese eine Einstellung | 150 Gold je Verband (10 = 1.500) |

- **Jede Stufe bringt mehr:** Samen 1.000 → 50 Fasern 1.250 (+25 %) → 10 Verbände 1.500 (+20 %).
- **Die Flachspflanze ist wie ein Rohstoff:** Man legt sie ein; aufs Band, ins Lagerhaus oder auf die Theke kommt sie nicht. Kaufen kann man sie nicht – nur anbauen.
- **Rhythmus:** 3 Beete versorgen genau eine Flachsbreche (3 Pflanzen × 10 Minuten = eine Wachszeit). Eine Webstube schafft die Fasern von bis zu 6 Flachsbrechen.
- **Geldfluss:** Eine Linie (3 Beete, 1 Flachsbreche, 1 Webstube) macht alle 30 Minuten 30 Verbände = 4.500 Gold aus 3.000 Gold Samen, also rund 1.500 Gold Gewinn – etwa so viel wie eine Eisen-Linie in derselben Zeit.

**Das Beet im Spiel:**
- **Leer:** Infofenster mit „🌱 Säen: Leinsamen“. Der Samen kommt aus dem Laden-Lager; liegt keiner da, kauft der Knopf einen für 1.000 Gold (er sagt vorher, was er tut).
- **Wächst:** Die Pflanze wächst sichtbar in Stufen (Keimling → kleine Pflanze → große Pflanze → blühender, reifer Flachs), dazu eine Fortschrittsleiste; das Infofenster sagt z. B. „Reif in etwa 12:30 min“. Licht grün.
- **Reif:** Am Beet erscheint 🌾, Licht gelb (wartet). „🌾 Ernten“ legt die Flachspflanze ins Laden-Lager; danach ist das Beet leer und man sät neu.
- **Im Hintergrund** wächst das Beet weiter; die reife Pflanze wartet, bis man sie erntet. „Willkommen zurück“ nennt reife Beete („Reif zum Ernten: 3× Beet“). Im Testmodus wächst es 10-mal schneller.
- **Später** wächst im selben Beet jede Pflanze (ab Level 8 Ringelblumen); dann wählt man beim Säen den Samen.

**Bauabschnitt Level 7 „Die Heilstube“:** *„Vor dem neuen Stadttor rasten Reisende, Händler und Wachen – und manche kommen verletzt an. Heilerin Agnes zieht in den Ort und richtet eine Heilstube ein. Was sie braucht, wächst auf dem Feld: Flachs.“*

| | |
|---|---|
| Aufstieg auf Level 7 | 3.000 Gold; die Erfahrung kommt aus den 4 Aufträgen vom Stadttor (1.841) |
| Neu | 🌱 Beet, 🪢 Flachsbreche, 🧵 Webstube · Leinsamen beim Händler |
| Gratis | 1 Leinsamen |
| Laden | bleibt wie auf Level 6 (5 große Theken, 1.000 Plätze) |

**Aufträge** (Erfahrung für Level 8 zusammen 850):

| # | Bewohner | Wofür | Waren | Erfahrung |
|---|---|---|---|---|
| 1 | Heilerin Agnes | „Ich richte am Stadttor eine Heilstube ein. Für den Anfang brauche ich saubere Verbände.“ | 5 Verbände | 75 |
| 2 | Heilerin Agnes | „Aus Flachsfasern zupfe ich weiche Polster für die Wunden.“ | 50 Flachsfasern | 125 |
| 3 | Torwächter Ulrich | „Meine Wachen holen sich beim Üben Schrammen. Die Wachstube soll einen eigenen Vorrat haben.“ | 15 Verbände | 225 |
| 4 | Bürgermeisterin Hilde | „Zum Markttag kommen viele Reisende. Agnes braucht einen großen Vorrat.“ | 20 Verbände + 50 Flachsfasern | 425 |

Zusammen 40 Verbände und 100 Flachsfasern, also 6 Pflanzen. Weniger Erfahrung als auf Level 6 (1.841), weil das Kapitel wieder einfach anfängt. Level 8 gibt es dann noch nicht; die Erfahrung sammelt sich bis dahin.

**Baukosten** (aus Waren von Level 1–6, damit sie ihren Wert behalten; keins kostet mehr, als ein Samen einbringt – 1.500 Gold):

| Gebäude | Kosten | entspricht etwa |
|---|---|---|
| 🌱 Beet | 10 Holzplatten + 10 Steinplatten | 360 Gold |
| 🪢 Flachsbreche | 10 Holzplatten + 2 Zahnradwellen | 828 Gold |
| 🧵 Webstube | 20 Holzstäbe + 2 Räderwerke | 1.008 Gold |

Die erste Linie (3 Beete, Flachsbreche, Webstube) kostet rund 2.900 Gold an Waren, dazu 3 Leinsamen.

**Bilder:** Säckchen Leinsamen, Flachspflanze mit blauen Blüten, Flachsfaser (helles Faserbündel), Verband (weiße Leinenrolle).

**Spielstand:** Version 12 → 13; bestehende Fabriken bleiben unverändert, die neuen Gebäude kommen einfach dazu.

**Prüfen:** Spielregeln (säen, 30 Minuten wachsen – auch im Hintergrund –, ernten, einlegen, 1 Pflanze → 50 Fasern → 10 Verbände, Werte je Stufe, Baukosten-Grenze, Aufträge, Aufstieg auf Level 7, Spielstand) und Browser-Test in Tablet- und Handygröße (Beet per Touch bauen, säen, Zeit vorspulen, ernten, einlegen, Verbände kommen im Laden-Lager an).

### v0.15.0 – Test-Knopf „Auftrag erledigen“ (fertig)

Tobias' Test von v0.14.0 und der Wunsch nach dem Knopf stehen in Abschnitt 10 (Chat 11).

**Neu im Spiel:**
- Im Level-Fenster (oben auf „Laden-Level“ tippen), Reiter „📜 Aufträge“, steht unter dem Auftrag in einem gestrichelten, lila Kasten **„🧪 Test: Auftrag erledigen“** – immer, auch ohne Testmodus (Tobias spielt in Echtzeit).
- Ein Tipp wertet den aktuellen Auftrag als erledigt: Es gibt **die Erfahrung** des Auftrags, aber **keine Waren** werden genommen und es gibt **kein Gold** (Gold ohne Waren würde die Wirtschaft verfälschen, die Tobias testet). Der nächste Auftrag rückt nach; oben steht „🧪 Auftrag als erledigt gewertet (Test): +259 Erfahrung, kein Gold.“
- **Aufsteigen bleibt, wie es ist:** Es kostet weiter Gold.
- Ist kein Auftrag mehr offen, verschwindet der Knopf.
- **Spielstand:** Format unverändert, keine Umwandlung nötig.

**Für Tobias' Fabrik (Level 6):** Der Knopf erledigt die 4 Aufträge vom Stadttor (zusammen 1.841 Erfahrung); die Erfahrung sammelt sich, bis es Level 7 gibt. Richtig nützlich wird er mit dem Kräuter-Kapitel und bei einem neuen Spiel.

**Was Tobias testet:**
- Level-Fenster öffnen, „🧪 Test: Auftrag erledigen“ tippen: Steigt die Erfahrung, bleiben Gold und Laden-Lager gleich?
- Ist der Knopf deutlich genug vom echten „✓ Abgeben“ zu unterscheiden?

### v0.14.0 – Fabrik läuft im Hintergrund weiter & Rohstoff-Vorrat (fertig)

Tobias' Feedback zu v0.13.0 und die Planung stehen in Abschnitt 10 (Chat 10).

**Neu im Spiel:**
- **Die Fabrik läuft weiter, wenn das Spiel zu ist** (oder die App im Hintergrund, z. B. während Tobias mit Claude schreibt) – bis etwas leer ist: Rohstoffe verarbeitet, Zutaten aufgebraucht, Lagerhäuser leer, Theken leer verkauft oder das Laden-Lager voll. Beim Zurückkommen wird die Zeit nachgerechnet, genau wie im laufenden Spiel.
- **„👋 Willkommen zurück!“** nach mehr als 10 Minuten: wie lange man weg war, was Kunden gekauft haben (mit Gold), was ins Laden-Lager kam, welche Gebäude leer gelaufen sind („Leer gelaufen: 3× Holzfällerlager“), ob das Laden-Lager voll ist, ob alle Theken leer sind und ob die Fabrik noch arbeitet. Zwischen 1 und 10 Minuten nur eine kurze Meldung. Dauert das Nachrechnen länger, erscheint „⏩ Die Fabrik holt die Zeit nach …“ mit Fortschrittsleiste.
- **Rohstoff-Vorrat:** In Holzfällerlager, Steinbruch und Schmelzhütte passen jetzt **bis zu 3 Rohstoffe** (je 15 Minuten, zusammen 45 Minuten). Sie werden nacheinander verarbeitet. Am Gebäude zeigen **drei Punkte** unter der Fortschrittsleiste, wie voll der Vorrat ist. Das Infofenster zeigt „Vorrat: 2 / 3 Holzstämme“ und „Leer in etwa 37:39 min“.
- **„⏫ Auffüllen“** (Infofenster eines Rohstoff-Gebäudes) füllt den Vorrat bis zum Rand: erst aus dem Laden-Lager, was fehlt, kauft es direkt beim Händler (braucht keinen Platz im Laden-Lager). Der Knopf sagt vorher, was er tut, z. B. „⏫ Auffüllen: 2 Holzstämme · kauft 1 für 550 🪙“. Reicht das Gold nicht für alle, kauft er so viele wie möglich. Dazu weiter „➕ 1 Holzstamm einlegen“ und „🧺 Holzstamm kaufen“.
- **Lagerhaus nur noch von Hand befüllen:** Den Knopf „🔁 Nachschub“ gibt es nicht mehr. „📥 Befüllen“ und „↩ Ausräumen“ bleiben; ist das Lagerhaus leer, befüllt man es neu. Auf dem Band arbeitet es weiter als Zwischenstation.
- **Spielstand** (Version 11 → 12): Rohstoff-Gebäude bekommen einen leeren Vorrat; Lagerhäuser verlieren ihren Nachschub, ihr Inhalt bleibt (hatte eins Nachschub, sagt eine Meldung Bescheid). Beim Öffnen erscheint eine kurze Meldung zu den Neuerungen.

**Für Tobias' Fabrik:** Beim ersten Öffnen nach dem Update wird die Zeit seit dem letzten Spielen nachgerechnet – vermutlich lief nur der letzte Rohstoff noch zu Ende. Ab dann gilt: vor dem Schließen alle Rohstoff-Gebäude mit „⏫ Auffüllen“ füllen und die Theken bestücken; dann läuft der Laden 45 Minuten und länger weiter (die Maschinen danach noch, bis ihre Zutaten aufgebraucht sind).

**Was Tobias testet:**
- Alle Rohstoff-Gebäude mit „⏫ Auffüllen“ füllen, Theken bestücken, das Spiel schließen und nach einer Weile (z. B. 1–2 Stunden) wieder öffnen: Stimmt das Fenster „Willkommen zurück“? Fühlt sich der Rhythmus richtig an (rein, nachlegen, wieder raus)?
- Kurz zu Claude wechseln und zurück: Läuft die Fabrik weiter, erscheint eine kurze Meldung?
- Sind 3 Rohstoffe als Vorrat ein gutes Maß?
- Lagerhaus: Befüllen und Ausräumen wie gewohnt; kein Nachschub mehr.
- Erkennt man die neuen Warenbilder auf dem Band? (aus v0.13.0 noch offen)
- Feedback bitte in einen neuen Chat; danach besprechen wir die Vorgehensweise mit Level und Techbaum (Abschnitt 4.4).

### v0.13.0 – Aufträge aus dem Ort & neue Warennamen (fertig)

Tobias' Feedback nach v0.12.0 und die Planung stehen in Abschnitt 10 (Chat 9, Teil 2). Das Gesamtbild (Ort, Bauabschnitte, alle Aufträge) steht in Abschnitt 3.8, die neuen Namen in Abschnitt 4.2.

**Neu im Spiel:**
- **Aufträge im Level-Fenster** (oben auf „Laden-Level“ tippen), Reiter **„📜 Aufträge“**:
  - oben die Geschichte des Bauabschnitts, z. B. „Das Korn muss gemahlen werden …“,
  - eine **Erfahrungsleiste** („Erfahrung für Level 5: 320 / 714“),
  - **genau ein Auftrag**: Bewohner, wofür er die Waren braucht, die Waren mit „im Laden-Lager 2 / 4“, die Belohnung („+130 Erfahrung · +1.296 🪙“) und **„✓ Abgeben“**. Die Waren kommen aus dem Laden-Lager (nicht von den Theken). Danach rückt der nächste Auftrag nach („Auftrag 2 von 4“).
  - darunter das **nächste Level** mit dem, was es freischaltet, dem Gratis-Rohstoff und dem Knopf **„⬆ Aufsteigen auf Level 5 · 1.000 🪙“**. Er geht erst, wenn die Erfahrung voll ist und das Gold reicht; darunter steht, was noch fehlt.
- Reiter **„🏘️ Ort & Level“**: alle Bauabschnitte des Ortes (✅ erreicht, ▶ jetzt, 🔒 kommt) mit dem, was sie freischalten.
- **Obere Leiste:** Im Knopf „Laden-Level“ eine kleine Erfahrungsleiste; **❗** heißt „Auftrag lässt sich abgeben“, **⬆** „Aufsteigen möglich“. Dazu je einmal eine kurze Meldung.
- **Die alten Level-Ziele** („1 Holzplatte und 1 Holzstab hergestellt“) gibt es nicht mehr; Aufsteigen kostet jetzt Gold (Level 2: 100 … Level 6: 2.000).
- **Neue Namen und Bilder** für 8 Waren (Rezepte und Werte unverändert): Eisenblech, Zahnradwelle, Räderwerk, Schlüssel, Zirkel, Gewichtstein, Uhrwerk, Vorhängeschloss. Die Einstellungen der Maschinen heißen jetzt „Bleche“, „Wellen“, „Räderwerke“, „Schlüssel“, „Zirkel“, „Gewichte“, „Uhrwerke“, „Schlösser“.
- **Spielstand** (Version 10 → 11): Alle Waren werden überall umbenannt (Laden-Lager, Theken, Bänder, Maschinen samt Einstellung, Lagerhäuser samt Nachschub, Baukosten, Zähler, letzte Verkäufe). Das Level bleibt; die Aufträge des aktuellen Levels beginnen von vorn, die Erfahrung bei 0. Beim Öffnen erscheint eine kurze Meldung.

**Für Tobias' Fabrik (Level 6):** Es erscheinen die Aufträge vom Stadttor – Torwächter Ulrich will zuerst 4 Gewichtsteine (Schlosserei, Einstellung „Gewichte“: 10 Steinplatten + 5 Eisenstangen je Stück). Level 7 gibt es noch nicht; die Erfahrung sammelt sich bis dahin, das Gold gibt es sofort.

**Was Tobias testet:**
- Level-Fenster öffnen: Sind Geschichte, Erfahrungsleiste und Auftrag verständlich? Passt es, dass immer nur ein Auftrag dasteht?
- Die Aufträge vom Stadttor abgeben: Sind die Stückzahlen ein gutes Gleichgewicht (man muss etwas arbeiten, aber nicht ewig)?
- Die neuen Namen und Bilder: Ergeben die Produkte jetzt mehr Sinn? Erkennt man sie auf dem Band?
- Optional mit einem neuen Spiel (☰ → Neues Spiel; die jetzige Fabrik geht dabei verloren): Fühlt sich der Weg von Level 1 bis 4 mit Aufträgen und Aufstiegskosten gut an?
- Feedback bitte in einen neuen Chat; danach planen wir den weiteren Techbaum (Abschnitt 4.4).

### v0.12.0 – Nachschub aus dem Laden-Lager & Bänder leeren (fertig)

*Seit v0.14.0 gibt es den Nachschub nicht mehr (Tobias); Befüllen, Ausräumen und Bänder leeren bleiben.*

Tobias' Feedback nach Level 6 steht in Abschnitt 10 (Chat 9). Die Aufgaben rücken auf v0.13.0, das Weiterlaufen bei geschlossenem Spiel auf v0.14.0.

**Neu im Spiel:**
- **Lagerhaus = Gegenstück zum Versandportal.** Lagerhaus antippen; im Infofenster stehen drei neue Knöpfe:
  - **📥 Befüllen:** Ware aus dem Laden-Lager wählen (Rohstoffe stehen nicht zur Wahl), dann die Menge wie bei der Theke (0, −5, −1, +1, +5, „Alle“), höchstens so viel, wie ins Lagerhaus passt (3 × 50). Die Waren laufen sofort am orangen Pfeil aufs Band.
  - **🔁 Nachschub:** Ware wählen, dann einstellen, wie viele davon **immer im Laden-Lager bleiben** (0, −5, −1, +1, +5, +20; z. B. 20 Holzplatten zum Bauen). Das Lagerhaus holt die Ware dann dauerhaft nach, solange im Laden-Lager mehr als dieser Rest liegt. Es hält dabei nur bis zu 10 Stück bereit; der Rest bleibt sichtbar im Laden-Lager (zum Bauen, Verkaufen oder für ein zweites Lagerhaus). Am Spielfeld: blauer Kreispfeil mit dem Bild der Ware. Licht grün = holt, gelb = wartet (nichts mehr über dem Rest im Laden-Lager). Danach heißt der Knopf „✕ Nachschub aus“.
  - **↩ Ausräumen:** alles aus dem Lagerhaus ins Laden-Lager, der Nachschub geht dabei aus.
- **🧺 Strecke leeren:** Band antippen – die ganze zusammenhängende Strecke wird hell markiert, das Infofenster zeigt, was darauf liegt. Der Knopf bringt alle Waren der Strecke ins Laden-Lager; die Bänder bleiben liegen.
- **🧺 Zulauf leeren:** erscheint im Infofenster einer Maschine mit rotem Licht („Eingang blockiert“). Bringt eine Zuleitung eine Ware, die die Maschine gar nicht braucht (z. B. Holzplatten auf der Stäbe-Strecke zur Zimmerei), wird nur diese Strecke geleert; die anderen warten ja nur auf ihre Zutat. Sonst (gemischtes Band, eine Zutat nimmt überhand) werden alle gestauten Zuleitungen geleert. Kommt weiter Falsches nach, muss man die Zuleitung umlegen.
- Nichts geht verloren: Wie beim Abreißen darf das Laden-Lager dabei übervoll werden.
- **Spielstand** (Version 9 → 10): Lagerhäuser bekommen „kein Nachschub“ und laufen weiter wie bisher. Beim Öffnen erscheint eine kurze Meldung zu den neuen Knöpfen.

**Tipp für Tobias' Lage (Holz oben, Eisen unten):** Für Verstärkte Holzplatten braucht es keine neue Holz-Linie mehr: Holzplatten und Eisenstangen per Versandportal ins Laden-Lager schicken und an einer freien Stelle zwei Lagerhäuser mit Nachschub (Holzplatten mit Rest 20, Eisenstangen) über kurze Bänder an die beiden Eingänge einer Zimmerei anschließen.

**Zur Balance:** Versandportal an einer Stelle, Lagerhaus mit Nachschub an einer anderen – so wandern Waren quer übers Grundstück, ohne Band. Das macht Umbauen leichter; es entsteht aber nichts dazu, die Rohstoffe bleiben die Grenze. Erst einmal ohne Bremse; wird es zu leicht, lässt sich der Nachschub verlangsamen (eine Zahl in der Datentabelle).

**Was Tobias testet:**
- Die 120 Eisenbarren: Lagerhaus vor eine Schmiede (Ausgang unten rechts aufs Band zur Schmiede), „📥 Befüllen“, Eisenbarren, „Alle“. Kommen die Eisenstangen an?
- Nachschub mit Rest: z. B. Holzplatten für eine Zimmerei, Rest 20. Bleiben immer genug Holzplatten zum Bauen?
- Band antippen und „Strecke leeren“; an einer Zimmerei mit rotem Licht „Zulauf leeren“.
- Wird das Spiel durch den Nachschub zu leicht, oder fühlt es sich gut an? Feedback bitte in einen neuen Chat; danach Plan für v0.13.0 (Aufgaben).

### v0.11.1 – Test-Feedback (fertig, nur README)

- Tobias' Test von v0.11.0 festgehalten (Abschnitt 10, Chat 8, Teil 3): Verschieben, Markieren und Drehen mit R klappen hervorragend; Umbauen ist ein wesentlicher Teil des Spiels; nach 2–3 Stunden Echtzeit das erste Scharnier (Level 5).
- „Strecke leeren“ vorgemerkt (siehe oben). Spiel unverändert; nur die Versionsnummer im Spiel steigt auf v0.11.1.

### v0.11.0 – Umbauen: Bereiche verschieben (fertig)

Tobias' Test von v0.10.2 und sein Wunsch stehen in Abschnitt 10 (Chat 8, Teil 2). Die Aufgaben rücken auf v0.12.0, das Weiterlaufen bei geschlossenem Spiel auf v0.13.0.

**Neu im Spiel:**
- **Werkzeug „✥ Verschieben“** in der Bauleiste (zwischen Förderband und Abreißen).
- **Markieren:** Mit einem Finger ein Rechteck ziehen. Alles darin leuchtet gelb – Bänder, Maschinen, Lager, Portale. Gebäude gehören dazu, sobald ein Feld von ihnen im Rechteck liegt. Antippen markiert nur dieses eine Teil (z. B. ein einzelnes Band); ein neues Rechteck ersetzt die Markierung. Zwei Finger bewegen und zoomen die Karte. Unten steht, was markiert ist, z. B. „Markiert: 1 Gebäude und 6 Bänder“.
- **Verschieben:** „✥ Verschieben“ antippen; die Gruppe hängt dann am Finger (oder man tippt an die neue Stelle). Gestrichelter Rahmen grün = passt, rot = ein Feld ist belegt oder gehört nicht zum Grundstück (rote Felder zeigen, wo). Die alte Stelle bleibt blass sichtbar. „↻ Drehen“ (oder Taste R) dreht die ganze Gruppe um 90° um ihre Mitte. „✓ Hierhin“ setzt sie ab, „✕ Abbrechen“ geht zurück zum Markieren.
- **Was mitkommt:** Innerhalb der Gruppe bleibt alles verbunden, auch nach dem Drehen. Waren auf den Bändern, Teile in den Maschinen und ein angefangener Rohstoff ziehen mit um; die Fabrik läuft sofort weiter. Verschieben kostet nichts. Bänder außerhalb, die hinein- oder herausführen, bleiben, wo sie sind (dort neu anschließen); wie beim Abreißen verliert ein Abzweig außerhalb seinen Ausgang ins nun leere Feld.
- **Bereich abreißen:** „🧹 Abreißen“ reißt alles Markierte auf einmal ab, nach einer Rückfrage (mit Hinweis, falls ein angefangener Rohstoff verloren geht). Waren und bezahlte Baukosten kommen ins Laden-Lager.
- Nach dem Verschieben bleibt die Gruppe markiert, damit man sie gleich noch einmal versetzen kann; „✓ Fertig“ führt zurück zur Bauleiste.
- **Taste R:** Mit Tastatur (Tobias spielt mit Tastatur am Tablet) dreht R die Vorschau beim Bauen und beim Verschieben eines Bereichs, sonst das angetippte Gebäude oder Band. Strg+R lädt weiterhin neu.
- **Tipp (schon vorher im Spiel):** Mit „🧹 Abreißen“ in der Bauleiste wischt man mit dem Finger über viele Bänder auf einmal.
- **Spielstand:** Format unverändert, keine Umwandlung nötig.

**Was Tobias testet:**
- Eine ganze Linie (z. B. die Eisen-Produktion) markieren, an eine andere Stelle ziehen, mit R drehen und absetzen. Läuft sie danach wie vorher weiter?
- Einzelne Bänder durch Antippen markieren und verschieben; einen Bereich auf einmal abreißen.
- Taste R beim Bauen einer Maschine und bei einer angetippten Maschine.
- Ist das Markieren mit dem Finger angenehm (ein Finger markiert, zwei Finger bewegen die Karte)? Feedback bitte in einen neuen Chat; danach Plan für v0.12.0 (Aufgaben).

### v0.10.2 – Fläche für 500 Gold & Warenbilder in der Bauleiste (fertig)

Tobias' Feedback zu v0.10.1 steht in Abschnitt 10 (Chat 8).

**Fläche kaufen:**
- **Jeder Kauf kostet 500 Gold** und wird nicht teurer, egal wie oft man schon gekauft hat.
- **Jeder Kauf bringt 4 Reihen**, schon ab Level 1 (bisher 2 Reihen bis Level 3). Links oder rechts sind das am Anfang 4 × 14 = 56 Felder, oben oder unten 4 × 22 = 88 Felder.
- **Jede Seite lässt sich 2× erweitern.** Die Welt ist jetzt genau so groß, dass auf jeder Seite 2 Streifen Platz haben: 38 × 30 Felder statt 40 × 26 (oben kamen 3 Reihen dazu, unten 1; rechts fallen 2 Spalten weg, die man nie kaufen konnte). Ist eine Seite fertig, verschwindet ihr Schild.
- **Ganz ausgebaut:** 38 × 30 = 1.140 Felder statt 22 × 14 = 308 zum Start (fast viermal so viel) für zusammen 8 × 500 = 4.000 Gold. Bisher hätte allein der 8. Kauf gut 1.000 Gold gekostet.
- Das Infofenster sagt, wie oft es an dieser Seite noch geht („An dieser Seite geht das noch 2×“ bzw. „Das ist der letzte Kauf an dieser Seite“).
- **Bestehende Spielstände** (Spielstand-Version 8 → 9): Gebäude, Bänder und gekaufte Fläche bleiben, wo sie sind; Gekauftes zählt mit. Jede Seite kann bis zu 8 Reihen über das Startgrundstück hinauswachsen. Ein übrig gebliebener Rest-Streifen kostet anteilig weniger: z. B. wer rechts schon 2 Spalten hat, bekommt noch einmal 4 Spalten für 500 Gold und dann 2 Spalten für 250 Gold. Reicht eine Seite schon weiter (früher ging es rechts bis 10 Spalten), bleibt das so. Beim Öffnen erscheint eine kurze Meldung.

**Warenbilder in der Bauleiste:**
- **Fehler:** Nach dem Minimieren der App standen unter den Gebäuden nur noch die Zahlen (z. B. „20“ und „5“) ohne die kleinen Warenbilder.
- **Ursache:** Die Bilder wurden nur einmal beim Start gezeichnet. Ist die App im Hintergrund, darf der Browser solche Zeichnungen wegwerfen, um Speicher zu sparen. Laden- und Level-Fenster zeichnen ihre Bilder bei jedem Öffnen neu, deshalb fiel es nur in der Bauleiste auf.
- **Behoben:** Die Bilder werden bei jedem Öffnen der Bauleiste neu gezeichnet, ebenso alle Warenbilder, sobald man ins Spiel zurückkommt.

**Was Tobias testet:**
- Beim Öffnen: Erscheint die Meldung, und ist die Fabrik mit der gekauften Fläche unverändert da? Welche Preise stehen auf den Schildern (500 oder ein günstigerer Rest-Streifen)?
- Fläche kaufen: Fühlen sich 500 Gold für 4 Reihen gut an? Hilft es, früh auf Masse zu gehen?
- App minimieren (z. B. um Claude zu öffnen), zurückkommen und die Bauleiste öffnen: Sind die Warenbilder noch da?
- Feedback bitte in einen neuen Chat; danach Plan für v0.11.0 (Aufgaben).

### v0.10.1 – Feinschliff nach Tobias' Test (fertig)

Tobias' Test von v0.10.0 steht in Abschnitt 10 (Chat 7, Teil 2).

- **Theken wachsen alle mit** (statt nur der neuen): kleine Theken mit 20 Plätzen bis Level 3, mittlere mit 25 auf Level 4, große mit 30 ab Level 5; danach bleibt es erst einmal so. Anzahl wie bisher: 2 Theken bis Level 3, dann je Level eine mehr (Level 6: 5 Theken). Lag auf einer Theke mehr, als jetzt passt (in v0.10.0 fasste Theke 5 noch 35), kommt der Rest beim Öffnen ins Laden-Lager, mit Meldung.
- **Laden-Lager ab Level 4: 1.000 Plätze** (bis Level 3 weiter 500), weil man ab Level 4 auf Masse produziert und schon 50 von jeder Ware das alte Lager füllen würden.
- **Fläche kaufen ab Level 4: Streifen 4 Felder tief** statt 2 (am Rand der Welt notfalls weniger). *Seit v0.10.2 schon ab Level 1, für immer 500 Gold.* Der Preis je Feld bleibt (10 Gold, jeder Kauf +20 %); ein Streifen kostet also etwa doppelt so viel, bringt aber doppelt so viel Platz. Beispiel: erster Kauf rechts 4 × 14 = 56 Felder für 560 Gold.
- **Umstellen ohne Verlust:** Bisher kamen beim Umstellen die Teile, die die neue Einstellung nicht braucht, ins Laden-Lager (mit kurzer Meldung) – in der Maschine sah es aus, als wären sie verschwunden. Jetzt bleiben alle Teile in der Maschine und werden wieder gebraucht, sobald man zurückstellt. Das Infofenster zeigt „Liegt noch in der Maschine: …“ und einen Knopf „↩ Reste ins Laden-Lager“.
- **Rezepte ansehen ohne Umstellen:** Das Infofenster zeigt unter „Andere Einstellungen“ die Zutaten und den Wert der übrigen Einstellungen.
- Das Level-Fenster nennt den Laden-Ausbau mit, z. B. „🛒 Theke 3 · mittlere Theken (25 Plätze) · 📦 Laden-Lager 1.000 Plätze“.

**Was Tobias testet:**
- Theken im Laden: Auf Level 4 haben alle Theken 25 Plätze, ab Level 5 30. Passt die Einteilung klein/mittel/groß?
- Zimmerei antippen und die Rezepte der anderen Einstellungen ansehen; umstellen und zurückstellen – die Teile bleiben in der Maschine.
- Fläche kaufen auf Level 4 oder höher: Reichen 4 Reihen pro Kauf, passt der Preis?
- Laden-Lager mit 1.000 Plätzen bei Massenproduktion.
- Allgemein: Wie fühlt sich das Tempo ab Level 4 an (mehr Holzfäller und Steinbrüche, um die Zimmerei zu versorgen)? Feedback bitte in einen neuen Chat.

### v0.10.0 – Techbaum, Teil 2 (fertig)

**Neu im Spiel:**
- **3 Kombi-Maschinen** (2 × 2, zwei Eingänge links, Ausgang rechts oben), je **3 Einstellungen** im Infofenster:

| Maschine | ab Level | Einstellungen | Baukosten |
|---|---|---|---|
| 🛠️ Zimmerei | 4 | Handkurbeln · Schalter · Verst. Platten | 20 Holzplatten + 10 Eisenstangen |
| ⚙️ Feinschmiede | 5 | Scharniere · Federn · Kugellager | 10 Mini-Eisenplatten + 2 Mechanische Schalter |
| 🔐 Schlosserei | 6 | Steinketten · Regler · Schlösser | 1 Scharnier + 2 Verstärkte Holzplatten |

- **9 neue Waren** mit eigenem Bild und eigenem Rezept (Tabelle in Abschnitt 4.2), z. B. Handkurbel = 10 Holzstäbe + 5 Stein-Zahnräder (324 Gold), Mini-Schloss = 1 Scharnier + 1 Mechanischer Schalter (1.944 Gold).
- **Was fehlt, sieht man sofort:** Wartet eine Kombi-Maschine auf eine Zutat, zeigt sie oben eine kleine Sprechblase mit dem Bild der fehlenden Ware. Im Infofenster steht jede Zutat mit Häkchen und „fehlt noch …“. Staut sich ein Eingang (z. B. gemischtes Band, auf dem eine Zutat überhandnimmt, oder eine Ware, die hier nicht gebraucht wird), leuchtet das Licht rot: „Eingang blockiert …“. Das gilt auch für Sägewerk, Steinmetz und Schmiede.
- **Umstellen:** Zutaten, die die neue Einstellung nicht braucht, kommen ins Laden-Lager (mit Meldung). *Seit v0.10.1 bleiben sie in der Maschine.*
- **Level 4–6:** Ziel sind jeweils die Produkte der zuletzt freigeschalteten Maschine (Level 4: 1 Mini-Eisenplatte + 1 Eisenstange, Level 5: 1 Handkurbel + 1 Mechanischer Schalter, Level 6: 1 Scharnier + 1 Eisenfeder). Geschenk: je 1 Eisenerz.
- **Mehr Verkaufstheken:** Mit Level 4, 5 und 6 kommt je eine Theke dazu, jede 5 Plätze größer: Theke 3 = 25, Theke 4 = 30, Theke 5 = 35 Plätze. Das Level-Fenster kündigt die neue Theke an. *Seit v0.10.1 wachsen alle Theken mit (20 → 25 → 30).*
- **Menge auf der Theke einstellen:** Nach „Ware wählen“ (und über den neuen Knopf „🔢 Menge“) stellt man mit 0, −5, −1, +1, +5 und „Alle“ genau ein, wie viele Stück auf die Theke kommen; darunter steht der Wert. Zu viel kommt zurück ins Laden-Lager. „Menge“ ersetzt die Knöpfe +1 und +5.
- **Testpaket:** Kombi-Teile gibt es darin nur je 5 Stück (sonst wäre das Laden-Lager sofort voll).
- **Bestehende Spielstände** bleiben unverändert (Format gleich, keine Umwandlung nötig). Tobias' Fabrik steht auf Level 3; das Ziel für Level 4 (1 Mini-Eisenplatte + 1 Eisenstange, gezählt seit v0.9.0) ist vermutlich schon erreicht.

**Was Tobias testet:**
- Auf Level 4 aufsteigen (oben auf „Laden-Level“ tippen), die dritte Theke ansehen und eine **Zimmerei** bauen.
- Zwei Bänder an die Zimmerei führen: oben Holzstäbe, unten Stein-Zahnräder → Handkurbeln. Dann umstellen auf Schalter. Sieht man gut, welche Zutat fehlt?
- Mit „Menge“ eine bestimmte Anzahl auf die Theke stellen.
- Weiter bis Level 6: Feinschmiede und Schlosserei. Passen Baukosten, Mengen (10 + 5) und Werte? Dauert es zu lange oder geht es zu schnell?

### v0.9.2 – Test-Feedback (fertig, nur README)

- Tobias' Test von v0.9.1 mit dem nachgezahlten Startkapital festgehalten (Abschnitt 10, Chat 6, Teil 3) und als Maßstab in den Ausblick auf v0.10.0 übernommen. Spiel unverändert; nur die Versionsnummer steigt auf v0.9.2.

### v0.9.1 – Startkapital (fertig)

- **Neues Spiel mit 500 Gold.** Grund (Tobias' Test in Echtzeit): Der erste Holzstamm bringt 200 Holzblöcke (+ 20 vom Start). Nach 2 Sägewerken (80 Blöcke) und Bändern (etwa 25) bleiben rund 115 Blöcke, also etwa 23 Teile für rund 400 Gold – der nächste Holzstamm kostet aber 550. Mit Startkapital: 372 + 500 = 872 Gold, nach dem zweiten Stamm bleiben 322; der zweite Stamm bringt ohne neue Baukosten rund 720 Gold, ab dann trägt sich die Produktion.
- **Bestehende Spielstände** (Spielstand-Version 7 → 8) bekommen die 500 Gold einmalig nachgezahlt, mit Meldung. Level, Lager und Zähler bleiben.
- **Pleiteschutz bleibt unverändert** (Tobias). Bekannte Lücke: Ein Rohstoff im Lager verhindert das Geschenk, auch wenn kein Gebäude dasteht, das ihn verarbeiten kann (z. B. der Gratis-Felsbrocken ohne Steinbruch). Mit dem Startkapital tritt das kaum noch auf.
- **Tipp:** Ab Level 2 lohnt es sich, 10 Holzplatten und 5 Holzstäbe für den Steinbruch zurückzulegen, statt alles zu verkaufen.

### v0.9.0 – Fläche kaufen & erste Level (fertig)

**Fläche kaufen:**
- An jeder Seite des Grundstücks steht auf der gesperrten Fläche ein Schild mit dem Preis, z. B. „＋ 280 🪙“ (gelb = genug Gold, blass = zu wenig). Antippen der gesperrten Fläche neben dem Grundstück zeigt den Streifen hell und ein Fenster „Fläche kaufen“ mit Größe, Preis und Knopf „Kaufen“. Ecken lassen sich nicht direkt kaufen; sie kommen mit, wenn man an zwei Seiten gekauft hat.
- Ein Streifen ist **2 Felder tief** und reicht über die ganze Seite (am Rand der Welt notfalls 1 Feld). Gebäude und Bänder bleiben, wo sie sind.
- **Preis (Platzhalter):** 10 Gold je Feld, jeder Kauf macht jedes Feld 20 % teurer (auf 10 Gold gerundet). Beispiele: erster Streifen rechts oder links 2 × 14 = 28 Felder für 280 Gold, oben oder unten 2 × 22 = 44 Felder für 440 Gold; der zweite Kauf kostet 12 Gold je Feld, der fünfte etwa 21, der zehnte etwa 52.
- Bis zum Rand der Welt (40 × 26 Felder) sind es 16 Käufe – gut dreimal so viel Fläche wie zum Start.
- Beim Öffnen wird das ganze Grundstück gezeigt, mit etwas Rand, damit die Schilder oben und unten sichtbar sind.

**Erste Level:**

| Level | Neu freigeschaltet | Gratis beim Aufstieg | Aufsteigen, sobald hergestellt |
|---|---|---|---|
| 1 · Holz | Holzfällerlager, Sägewerk, Lagerhaus, Versandportal, Förderband; Holzstamm beim Händler | Start: 1 Holzstamm, 20 Holzblöcke | – |
| 2 · Stein | Steinbruch, Steinmetz; Felsbrocken beim Händler | 1 Felsbrocken | 1 Holzplatte + 1 Holzstab |
| 3 · Eisen | Schmelzhütte, Schmiede; Eisenerz beim Händler | 1 Eisenerz | 1 Steinplatte + 1 Stein-Zahnrad |

- **Neues Spiel:** nur Holzfällerlager und Versandportal, 1 Holzstamm und 20 Holzblöcke (seit v0.9.1 dazu 500 Gold). Den Steinbruch baut man ab Level 2 selbst (10 Holzplatten + 5 Holzstäbe).
- **Level-Fenster:** Oben auf „Laden-Level“ tippen. Es zeigt, was freigeschaltet ist, das nächste Ziel mit Häkchen und den Knopf „⬆ Aufsteigen“. Ist das Ziel erreicht, erscheint oben ein ⬆ und eine kurze Meldung. Nach dem Aufstieg gratuliert das Fenster und nennt das Geschenk.
- **Gesperrtes ist sichtbar:** In der Bauleiste stehen gesperrte Gebäude ausgegraut mit „🔒 Level 2“ hinter Förderband und Abreißen; antippen sagt, ab welchem Level. Beim Händler steht „🔒 ab Level 2“.
- **Das Spiel zählt mit, was hergestellt wird** (Blöcke, Platten, Stäbe …) – die Grundlage für die späteren Aufgaben.
- Das **Testpaket** gibt nur Waren, die schon freigeschaltet sind.
- **Bestehende Spielstände** (Spielstand-Version 6 → 7): Die Fabrik bekommt Level 3, nichts wird gesperrt; Gold, Lager und Gebäude bleiben. Eine Meldung weist auf das Flächenkaufen hin. Der Zähler für Hergestelltes beginnt bei null.

**Was Tobias testet:**
- Mit der bestehenden Fabrik: Fläche kaufen und die freien Felder für Umbauten nutzen (z. B. Bänder zusammenlegen). Achtung: Gebäude, die vor v0.7.0 gebaut wurden, geben beim Abreißen keine Baukosten zurück (sie waren gratis) – Verschieben ist kostenlos.
- Mit einem neuen Spiel (☰ → Neues Spiel, die jetzige Fabrik geht dabei verloren): den Weg Holz → Stein → Eisen über die Level. Passen Ziele, Gratis-Rohstoffe und Flächenpreise? Fühlt sich der Einstieg mit nur einem Holzstamm gut an?

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
| 06.11.2026 | Theken werden weiter von Hand bestückt, auch im Testmodus kein automatisches Nachfüllen | Tobias (Chat 6): So behält man die Übersicht und verkauft nicht versehentlich alles. |
| 06.11.2026 | Blöcke zum Bauen: Es bleibt dabei, man plant eine eigene Strecke für Blöcke ein (kein Kauf von Blöcken beim Händler) | Tobias (Chat 6): Abreißen gibt die Baukosten 1 : 1 zurück; die Produktion immer auf das zu verlagern, was gerade gebraucht wird, gehört zum Spielprinzip. |
| 06.11.2026 | Neue Reihenfolge: v0.9.0 Fläche kaufen & erste Level, v0.10.0 Techbaum Teil 2, v0.11.0 Aufgaben, v0.12.0 Offline | Tobias (Chat 6): Nicht die Zeit, sondern der Platz ist das Problem – für die 6 neuen Maschinen fehlt sonst die Fläche. Level schon jetzt, damit die Logik früh rund spielbar ist. |
| 06.11.2026 | Fläche kaufen: Streifen 2 Felder tief an einer frei wählbaren Seite, mit Gold, 10 Gold je Feld, jeder Kauf +20 % je Feld, bis zum Rand der Welt | Claudes Vorschlag, von Tobias freigegeben. Gold bekommt damit ein Ziel neben den Rohstoffen. |
| 06.11.2026 | Erste Level bewusst einfach: Level 2 nach 1 Holzplatte + 1 Holzstab, Level 3 nach 1 Steinplatte + 1 Stein-Zahnrad; Aufsteigen per Knopf, vorerst kostenlos | Tobias (Chat 6): So gibt es schon in der Anfangsphase einen runden Prototyp. |
| 06.11.2026 | Zu Beginn jedes Levels gibt es einen Rohstoff gratis (Level 1 Holzstamm, Level 2 Felsbrocken, Level 3 Eisenerz) | Tobias (Chat 6). |
| 06.11.2026 | Später: Aufgaben bringen Erfahrung (XP) und Gold; mit genug XP schaltet man das nächste Level frei und bezahlt den Aufstieg mit Gold; Stränge produzieren, verkaufen, für Aufgaben herstellen | Modell von Tobias (Chat 6), kommt mit v0.11.0. |
| 06.11.2026 | Neues Spiel startet nur mit Holzfällerlager und Versandportal; den Steinbruch baut man ab Level 2 selbst | Claudes Plan, von Tobias freigegeben: „Level 1 startet man nur mit Holz.“ |
| 06.11.2026 | Bestehende Spielstände bekommen Level 3 | Claudes Wahl: Tobias' Fabrik hat schon Stein und Eisen, es soll nichts gesperrt werden. |
| 06.11.2026 | Fläche kauft man über ein Fenster mit Knopf (erst Fläche antippen, dann „Kaufen“) statt mit einem Tipp | Claudes Wahl: Zwei Schritte verhindern versehentliche Käufe; das Fenster zeigt Größe und Preis. |
| 06.11.2026 | Gesperrte Gebäude stehen in der Bauleiste hinten, mit Schloss und Level; das Testpaket gibt nur freigeschaltete Waren | Claudes Wahl: Was man bauen kann, steht vorn; man sieht trotzdem, was als Nächstes kommt. |
| 06.11.2026 | 500 Gold Startkapital; bestehende Spielstände bekommen es einmalig nachgezahlt | Tobias (Chat 6, Teil 2): In Echtzeit reichte das Gold nach den ersten Gebäuden nicht für den zweiten Holzstamm. Ersetzt „kein Startgold“ vom 06.11.2026. |
| 06.11.2026 | Pleiteschutz bleibt, wie er ist (ein Rohstoff im Lager zählt, auch ohne passendes Gebäude) | Tobias (Chat 6, Teil 2): Mit dem Startkapital ist das Problem gelöst. |
| 06.11.2026 | Etwas Grinden ist gewollt: Man arbeitet ein paar Runden mit Holz und Stein, um sich Eisen und Neues zu erarbeiten | Tobias (Chat 6, Teil 3): „Genauso hab ich es mir auch vorgestellt.“ Maßstab für die Baukosten in v0.10.0. |
| 06.11.2026 | Flächenpreise bleiben so | Tobias (Chat 6, Teil 3): noch nicht genutzt, aber eine gute Erweiterung und erschwinglich; notfalls arbeitet man 1–2 Runden mehr mit Rohstoffen. |
| 06.11.2026 | 500 Gold Startkapital reichen | Tobias (Chat 6, Teil 3): Mit dem Startkapital kam er über Holz und Stein bis zu Eisen. |
| 06.11.2026 | Nur 3 Kombi-Maschinen mit je 2 Eingängen, 1 Ausgang und 3 Einstellungen: Zimmerei (Handkurbel, Mechanischer Schalter, Verstärkte Holzplatte), Feinschmiede (Scharnier, Eisenfeder, Kugellager), Schlosserei (Steinkette, Regler, Mini-Schloss). Mühlenbauer, Feinwerkstatt, Getriebebauer, Mörser & Stößel und die freien Einstellungen fallen weg | Tobias (Chat 7): Sonst werden es zu viele Maschinen und zu viel Unordnung. Ersetzt die Aufteilung auf 6 Maschinen vom 06.11.2026. |
| 06.11.2026 | Jedes Produkt hat ein eigenes Rezept; aus Grundteilen meist 10 + 5 Stück (z. B. Handkurbel 10 Holzstäbe + 5 Zahnräder, Schalter 10 Zahnräder + 5 Holzstäbe) | Tobias (Chat 7): So werden alle Rohstoffe etwa gleich viel beansprucht, und die Produkte lassen sich unterschiedlich skalieren. |
| 06.11.2026 | Steinkette aus 10 Steinplatten + 5 Eisenstangen; übrige Rezepte und Werte nach Claudes Vorschlag (+20 % auf die Zutaten) | Claudes Vorschlag: Sonst bräuchte kein Rezept die Steinplatte. Tobias: „Wir probieren die Werte gerne so aus.“ |
| 06.11.2026 | Level 4 Zimmerei, Level 5 Feinschmiede, Level 6 Schlosserei; Ziel: die Produkte der zuletzt freigeschalteten Maschine einmal herstellen; Geschenk je 1 Eisenerz | Claudes Vorschlag, von Tobias angenommen: So kommt man am Anfang immer ein Stück weiter und lernt alles kennen. Ersetzt „Level 4 Weiterverarbeitung“ vom 06.11.2026. |
| 06.11.2026 | Bis etwa Level 10 dauert die Einführung („Intro“); die ersten Level konzentrieren sich auf das Aufbauen einer coolen Produktionsstätte | Tobias (Chat 7). |
| 06.11.2026 | Ab Level 4 bei jedem Aufstieg eine Verkaufstheke mehr (Level 6: 5 Theken); jede neue Theke 5 Plätze größer als die vorige (20, 20, 25, 30, 35) | Tobias (Chat 7): Die Produkte werden wertvoller. Claudes Lesart: Die ersten beiden Theken bleiben bei 20 (offene Frage 9). |
| 06.11.2026 | Menge auf der Theke genau einstellbar (z. B. nur 8 Stück); Knopf „🔢 Menge“ ersetzt +1 und +5 | Tobias (Chat 7). Die Knöpfe 0, −5, −1, +1, +5 und „Alle“ sind Claudes Wahl. |
| 06.11.2026 | Fehlende Zutat: kleines Bild an der Maschine, im Infofenster jede Zutat mit Vorrat; Kunden kaufen teure Teile genauso oft wie einfache | Claudes Vorschlag, von Tobias angenommen. |
| 06.11.2026 | Beim Umstellen kommen nicht gebrauchte Zutaten ins Laden-Lager; ein gestauter Eingang zeigt rotes Licht („Eingang blockiert“) | Claudes Wahl: Sonst lägen Waren unsichtbar in der Maschine fest bzw. man sähe den Stau nicht. |
| 06.11.2026 | Kein Gebäude kostet mehr, als ein Rohstoff seines Levels als Teile einbringt (ab Level 4: ein Eisenerz, 2.880 Gold) | Claudes Wahl; ersetzt „höchstens ein Holzstamm“, damit die Kombi-Maschinen etwas kosten dürfen. |
| 06.11.2026 | Fenster (Laden, Level) 600 statt 520 Pixel breit | Claudes Wahl: Mit 5 Theken wurden die Knöpfe auf dem Tablet zu eng. |
| 07.11.2026 | Alle Theken wachsen mit dem Level: kleine Theken 20 (bis Level 3), mittlere 25 (Level 4), große 30 (ab Level 5), dann erst einmal fest | Tobias (Chat 7, Teil 2): Die Waren wachsen stetig mit. Ersetzt „jede neue Theke 5 Plätze größer“ vom 06.11.2026. Zuordnung zu den Leveln: Claudes Lesart. |
| 07.11.2026 | Laden-Lager 1.000 Plätze ab Level 4 (bis Level 3 weiter 500) | Tobias (Chat 7, Teil 2): Bei Massenproduktion würden schon 50 von jeder Ware das Lager füllen. „Ab Level 4“ ist Claudes Lesart. |
| 07.11.2026 | Flächen-Streifen ab Level 4 doppelt so tief (4 statt 2 Felder), Preis je Feld unverändert | Tobias (Chat 7, Teil 2): Ab Level 4 muss man die Produktion deutlich steigern; 2 Reihen pro Kauf sind zu wenig. Die genaue Tiefe ist Claudes Vorschlag. |
| 07.11.2026 | Beim Umstellen bleiben alle Teile in der Maschine; Knopf „↩ Reste ins Laden-Lager“; Infofenster zeigt die Rezepte aller Einstellungen | Tobias (Chat 7, Teil 2): Beim Umstellen „verschwanden“ die Teile (sie lagen im Laden-Lager). Ersetzt „nicht gebrauchte Zutaten ins Laden-Lager“ vom 06.11.2026. |
| 07.11.2026 | Fläche kaufen zum festen Preis: jeder Streifen 500 Gold und 4 Reihen tief, schon ab Level 1; jede Seite lässt sich 2× erweitern (ganz ausgebaut 38 × 30 Felder für 4.000 Gold) | Tobias (Chat 8): Wer Spaß am Spiel hat und seine Fabrik skalieren möchte, soll nicht am Platz scheitern; die Einstiegshürden sollen so gering wie möglich sein. Besonders ab Level 4 und 5 muss man auf Masse gehen. 4 Reihen hat Tobias bestätigt. Ersetzt „10 Gold je Feld, jeder Kauf +20 %“ vom 06.11.2026 und „ab Level 4 doppelt so tief“ vom 07.11.2026. |
| 07.11.2026 | Die Welt ist genau so groß, wie man Fläche kaufen kann (38 × 30), und hat eine eigene Ecke: Sie beginnt oben bei Reihe −3 | Claudes Wahl: So hat jede Seite Platz für 2 Streifen, und Gebäude und Bänder bestehender Fabriken behalten ihre Felder (nichts muss verschoben werden). |
| 07.11.2026 | Bestehende Spielstände: Gekaufte Fläche zählt mit (jede Seite bis 8 Reihen über das Startgrundstück hinaus); ein Rest-Streifen kostet anteilig weniger (z. B. 2 Reihen 250 Gold); was schon weiter reicht, bleibt | Claudes Plan, von Tobias freigegeben. |
| 07.11.2026 | Warenbilder werden beim Öffnen der Bauleiste und beim Zurückkehren ins Spiel neu gezeichnet | Tobias (Chat 8): Die Bilder waren erst weg, nachdem er die App minimiert hatte, um Claude zu öffnen. Der Browser darf solche Zeichnungen im Hintergrund wegwerfen. |
| 07.11.2026 | Werkzeug „Verschieben“: Bereich markieren (Rechteck oder Antippen) und alles darin auf einmal verschieben, um 90° drehen oder abreißen; Gebäude, die nur zum Teil im Rechteck liegen, gehören dazu | Tobias (Chat 8, Teil 2): Bänder einzeln abreißen und neu legen dauert zu lange; er möchte z. B. die ganze Eisen-Produktion als Ganzes in eine Ecke verschieben. Halb markierte Teile und Drehen der Gruppe hat er bestätigt. |
| 07.11.2026 | Ein Finger markiert, zwei Finger bewegen die Karte; nach dem Verschieben bleibt die Gruppe markiert | Claudes Wahl: wie beim Förderband-Werkzeug; so lässt sich eine Gruppe mehrmals nachjustieren. |
| 07.11.2026 | Bänder außerhalb der Gruppe bleiben beim Verschieben, wo sie sind; ein Abzweig ins nun leere Feld verliert diesen Ausgang (wie beim Abreißen) | Claudes Wahl: Man schließt an der neuen Stelle selbst wieder an. |
| 07.11.2026 | Taste R dreht (Vorschau beim Bauen und Verschieben, sonst das angetippte Gebäude oder Band) | Tobias (Chat 8, Teil 2): Er spielt mit angeschlossener Tastatur am Tablet. |
| 07.11.2026 | Bereich verschieben wird v0.11.0; Aufgaben rücken auf v0.12.0, Offline auf v0.13.0 | Tobias: „Wir können das auch gerne v11 nennen.“ |
| 07.11.2026 | Umbauen, Abreißen und Neubauen sind ein wesentlicher Bestandteil des Spiels | Tobias (Chat 8, Teil 3): Er spielt in Echtzeit und baut ständig um – mal fehlen Blöcke, mal Platten für neue Gebäude; man konzentriert sich erst auf eine Produktion, um dann andere anzugehen. |
| 07.11.2026 | „Strecke leeren“ (am Band) und „Zulauf leeren“ (an blockierten Maschinen) vorgemerkt, noch nicht umgesetzt | Claudes Vorschlag; Tobias findet die Idee gut, möchte sie aber zusammen mit weiterem Feedback umsetzen. |
| 07.11.2026 | Pause: Erst bis Level 6 spielen und Feedback sammeln, dann den nächsten Schritt programmieren | Tobias (Chat 8, Teil 3): „damit wir nicht nur für eine Kleinigkeit codieren“. |
| 07.11.2026 | *(Nachschub seit v0.14.0 entfernt, siehe unten)* Das Lagerhaus wird das Gegenstück zum Versandportal: aus dem Laden-Lager befüllen (Menge wie bei der Theke), dauerhaft Nachschub holen, ausräumen | Tobias (Chat 9): 120 Eisenbarren im Laden-Lager für 12 Gold das Stück zu verkaufen ist schade, wenn man sie in die Produktion einschleusen könnte; er schlug selbst vor, dafür das Zwischenlager zu nutzen. Kein neues Gebäude. |
| 07.11.2026 | Nachschub mit einstellbarem Rest, der immer im Laden-Lager bleibt | Claudes Vorschlag, von Tobias angenommen: Sonst zieht der Nachschub das Baumaterial ab – genau das Problem mit dem „eisernen Bestand“ (offene Frage 13). |
| 07.11.2026 | Nachschub hält nur bis zu 10 Stück im Lagerhaus bereit (Datentabelle `supplyBuffer`); Befüllen geht bis 150 | Claudes Wahl: Der Vorrat bleibt sichtbar im Laden-Lager, man kann weiter damit bauen und verkaufen, und mehrere Lagerhäuser teilen sich eine Ware. |
| 07.11.2026 | Nachschub erst einmal ungebremst (so schnell, wie das Band abnimmt) | Claudes Vorschlag; Tobias: „Wir müssen das mal probieren und spielen, damit ich sehe, wie das läuft.“ Wird es zu leicht, lässt er sich verlangsamen. |
| 07.11.2026 | „Ausräumen“ schaltet den Nachschub aus; Rohstoffe kommen nicht ins Lagerhaus | Claudes Wahl: Sonst wäre das Lagerhaus sofort wieder voll; Rohstoffe legt man direkt in ihr Gebäude ein. |
| 07.11.2026 | „Strecke leeren“ und „Zulauf leeren“ umgesetzt; „Zulauf leeren“ leert nur Zuleitungen mit einer Ware, die die Maschine gar nicht braucht (gibt es keine, alle gestauten) | Vorgemerkt in v0.11.1. Die genaue Regel ist Claudes Wahl: Die richtige Zuleitung wartet nur auf ihre Zutat und soll nicht mitgeleert werden. |
| 07.11.2026 | Nachschub & Bänder leeren werden v0.12.0; Aufgaben rücken auf v0.13.0, Offline auf v0.14.0 | Tobias: „Ja, der Plan passt so.“ |
| 07.11.2026 | Roter Faden: Der Laden liegt in einem wachsenden Ort am Fluss; jedes Level ist ein Bauabschnitt, die Bewohner geben Aufträge | Tobias (Chat 9, Teil 2): Die einzelnen Produkte ergaben Sinn, gingen in der Masse aber unter; alles soll in der Gesamtheit Sinn ergeben, damit sich die Geschichte mit weiteren Maschinen und Produkten weiterspinnen lässt. Rahmen von Claude, Tobias: „gefällt mir sehr gut“. |
| 07.11.2026 | 8 Waren bekommen Namen, die logisch zu ihren Zutaten passen (Eisenblech, Zahnradwelle, Räderwerk, Schlüssel, Zirkel, Gewichtstein, Uhrwerk, Vorhängeschloss); Rezepte, Mengen und Werte bleiben | Tobias: Aus zwei Produkten soll das nächstmögliche, sinnvolle Produkt entstehen. Tabelle von Claude, Tobias: „passt so und gefällt mir“. Gleiche Rezepte halten die Balance und Tobias' Fabrik läuft weiter. |
| 07.11.2026 | Nur kleine Waren, keine Fertigwaren wie Türen oder Truhen | Tobias: Große Dinge sind auf dem Band nicht darstellbar; bei uns ist alles winzig. |
| 07.11.2026 | Aufträge stehen im Level-Fenster (eigener Reiter) mit Erfahrungsleiste – nicht im Laden-Fenster | Tobias: Die Erfahrung wird für das Level gebraucht, deshalb gehören die Aufträge zum Laden-Level. |
| 07.11.2026 | Waren werden abgegeben (aus dem Laden-Lager entfernt) | Tobias: „Ich finde, man sollte die Sachen abgeben.“ |
| 07.11.2026 | Immer nur ein Auftrag, 2–5 je Level, nicht überspringbar; keine weiteren Bestellungen | Tobias: Man braucht die Erfahrung zum Leveln; der Ladenverkauf soll im Vordergrund stehen, nicht irgendwelche Anfragen. |
| 07.11.2026 | Belohnung je nach Waren: Gold = Thekenwert der Waren (nicht mehr), Erfahrung = 1 je 10 Gold Warenwert | Tobias: Mehr Gold soll es nicht geben, weil die Erfahrung im Vordergrund steht (Ersatz für die früheren Ziele). Die Rechenregel ist Claudes Wahl. |
| 07.11.2026 | Die Erfahrung aller Aufträge eines Levels reicht genau für den Aufstieg; der Aufstieg kostet Gold (100, 250, 500, 1.000, 2.000) | Modell von Tobias: Erfahrung schaltet frei, Gold kauft das Level, Bauteile bauen die Maschinen. Preise sind Claudes Platzhalter. |
| 07.11.2026 | Stückzahlen der Aufträge so, dass man ab Level 4 auf Masse gehen muss (z. B. 8 Räderwerke + 4 Zahnradwellen) | Tobias: Man soll für die Stückzahl schon ein wenig arbeiten müssen. Zahlen sind Platzhalter. |
| 07.11.2026 | Bestehende Spielstände behalten ihr Level; die Aufträge des aktuellen Levels beginnen von vorn | Claudes Wahl: Tobias' Fabrik (Level 6) bekommt die Aufträge vom Stadttor; nichts wird zurückgestuft. |
| 07.11.2026 | Bewohner-Namen wählt Claude | Tobias: „Namen kannst du gerne aussuchen, das ist erstmal nicht so wichtig.“ |
| 07.11.2026 | Nach den Aufträgen kommt der weitere Techbaum (Kräuter, Mörser, Verbände, Tränke) | Tobias: „Lass uns zuerst die Aufgaben machen, damit diese sinnig sind, und dann planen wir den weiteren Techbaum.“ |
| 07.11.2026 | Stückzahlen der Aufträge bleiben so | Tobias (Test von v0.13.0): Der erste Auftrag ist eine machbare Menge, das Spiel soll auch fordern. |
| 07.11.2026 | Die Fabrik läuft im Hintergrund weiter, bis etwas leer ist; Rohstoffe (und später Samen) legt man immer von Hand nach | Tobias: wie Clash of Clans, nur umgekehrt – „Alles läuft, bis es leer ist, und manuell wieder nachfüllen.“ Man soll sich immer wieder einloggen müssen, die Produktion läuft automatisch. Das Weiterlaufen stand seit dem 05.11.2026 im Konzept. |
| 07.11.2026 | Bis zu 3 Rohstoffe je Rohstoff-Gebäude (statt einem); Knopf „Auffüllen“ (erst Laden-Lager, dann kaufen) | Claude: Ein Rohstoff reicht nur 15 Minuten – mehr Holzfäller machen die Fabrik schneller, aber nicht länger. Claudes Vorschlag waren 4, Tobias: „3 statt 4“. Auffüllen: Claudes Vorschlag, Tobias: „ein guter Knopf“. |
| 07.11.2026 | Kunden kaufen im Hintergrund weiter, bis die Theken leer sind | Tobias: „ja, dürfen sie, bis alles leer ist“. |
| 07.11.2026 | Lagerhaus nur noch von Hand befüllen; Nachschub entfällt, Ausräumen bleibt | Tobias: Sonst könnte man kurze Produktionsstraßen bauen, alles ins Laden-Lager schicken und über das Lagerhaus wieder heraus. Er hatte den Nachschub nie benutzt. Ausräumen bleibt (Claudes Vorschlag, Tobias einverstanden). |
| 07.11.2026 | Beim Zurückkommen: nach über 1 Minute eine kurze Meldung, nach über 10 Minuten das Fenster „Willkommen zurück“; nachgerechnet wird in normaler Geschwindigkeit (auch im Testmodus) | Claudes Wahl: Tobias wechselt oft kurz zu Claude – ein Fenster jedes Mal wäre lästig. Grenzen stehen in `data/offline.js`. |
| 07.11.2026 | Kräuter-Kapitel ab Level 7: wieder einfach beginnen (Flachs → Fasern → Verbände), bis Level 10 steigern, Level 11/12 abschließen; ein allgemeines Beet für alle Pflanzen; Alchemist erst um Level 15; ab Level 13 neue Rohstoffe wie Sand | Tobias' Plan (Abschnitt 4.4): zwei große Techbäume (Werkzeuge und Kräuter), die später ineinandergreifen. |
| 07.11.2026 | Flachs statt Farn oder Hanf | Claudes Begründung (Leinenbinden waren die Verbände des Mittelalters, Farn hat keine Fasern), Tobias: „Flachs“. |
| 07.11.2026 | Reihenfolge: erst das Spiel im Hintergrund (v0.14.0), dann gemeinsam die Vorgehensweise mit Level und Techbaum besprechen | Tobias, damit später alles Sinn ergibt. |
| 08.11.2026 | Spiel im Hintergrund und Vorrat von 3 Rohstoffen bleiben so | Tobias (Test von v0.14.0): Spiel über Nacht geschlossen, am Morgen hat alles funktioniert, die Fabrik läuft weiter; 3 Rohstoffe reichen. |
| 08.11.2026 | Test-Knopf „🧪 Test: Auftrag erledigen“: gibt die Erfahrung, nimmt keine Waren, gibt kein Gold; Aufsteigen kostet weiter Gold | Tobias (Chat 11): Die Aufträge macht Tobias gerade nicht aktiv; im Vordergrund steht die Spielmechanik. Ohne Gold und Waren, damit die Wirtschaft unverfälscht bleibt: Claudes Vorschlag, Tobias einverstanden. |
| 08.11.2026 | Der Test-Knopf ist im Prototyp immer zu sehen (nicht nur im Testmodus); vor v1.0 wird er entfernt (`QUEST_TEST_SKIP`) | Tobias: „Immer zu sehen, genau wie du vorschlägst.“ Der Testmodus würde die Zeit ×10 beschleunigen, Tobias spielt aber in Echtzeit. |
| 08.11.2026 | Kräuter-Kapitel häppchenweise: erst das Gesamtbild auf dem Papier (v0.15.1), dann v0.16.0 Beet und Level 7, danach Level 8–9 und 10–12 | Claudes Vorschlag, Tobias: „Immer häppchenweise.“ |
| 08.11.2026 | Beet: baut man wie eine Maschine; 1 Samen = 1 Pflanze (größer dargestellt), wächst etwa 30 Minuten, dann ernten; kein Anschluss ans Band (vorerst); im Beet wächst jede Pflanze | Tobias (Chat 11). Die 30 Minuten bremsen den Geldfluss, weil ein Samen rund 50 % Gewinn bringt. Ersetzt Claudes Vorschlag „wie der Holzfäller, 200 Stück in 15 Minuten“. |
| 08.11.2026 | Flachs-Kette: 1 Pflanze → 50 Fasern → 10 Verbände; später eine Maschine mit 2 Eingängen für Faser + Kräuter | Tobias (Chat 11): Level 7 wie Level 1 aufbauen, klein anfangen. |
| 08.11.2026 | Kräuter-Preise in der mittleren Kategorie: etwa Samen 1.000 Gold, Verband 150 Gold (1.500 Gold je Samen); Basis günstig, Ringelblume teurer und lohnender | Tobias (Chat 11); Feintuning später. Ersetzt Claudes Vorschläge „wie Holz“ bzw. „wie Eisen“. |
| 08.11.2026 | Die geerntete Pflanze kommt ins Laden-Lager und wird wie ein Holzstamm in die Flachsbreche eingelegt | Claudes Vorschlag, Tobias: „Ja“. Das Beet hat kein Band. |
| 08.11.2026 | Ernten und Säen sind zwei getrennte Schritte | Tobias (Chat 11, Teil 2): „damit man 2× alles durchgehen muss“. Ersetzt Claudes Vorschlag „Ernten & neu säen“ in einem Tipp. |
| 08.11.2026 | Beet 2 × 2 | Claudes Empfehlung, Tobias: „Ja, 2x2“. So ist die Pflanze gut zu sehen. |
| 08.11.2026 | Level 7: nur Verbände als Grundlage; Level 8 Ringelblume und die erste Maschine mit 2 Eingängen; Level 9 eine dritte Pflanze; bis Level 10 Fasern + 3 Pflanzen (wie Holz, Stein, Eisen); Level 11–12 weiter kombinieren | Tobias (Chat 11, Teil 2): schrittweise immer mehr dazu, wie im Werkzeug-Kapitel. |
| 08.11.2026 | Plan für Level 7 (v0.16.0): Flachsbreche 1 Pflanze → 50 Fasern in 10 Minuten (Vorrat 3), Webstube 5 Fasern → 1 Verband in 10 s, Flachsfaser 25 Gold, Baukosten aus Waren von Level 1–6, Heilerin Agnes mit 4 Aufträgen (850 Erfahrung), Aufstieg 3.000 Gold, Laden bleibt wie auf Level 6 | Claudes Entwurf nach Tobias' Vorgaben; wartet auf Tobias' Freigabe. |

---

## 8. Offene Fragen

Stand 08.11.2026 (nach v0.15.0).

1. **Nächster Schritt:** Tobias gibt den Plan für v0.16.0 frei (Beet und Level 7, Abschnitt 6) oder ändert Zahlen und Namen. v0.14.0 ist getestet (Spiel im Hintergrund klappt, 3 Rohstoffe reichen, die neuen Warenbilder erkennt Tobias und sie gefallen); das Lagerhaus ohne Nachschub hat Tobias nicht erwähnt. Weiter offen: Passen Baukosten, Mengen (10 + 5) und Werte der Kombi-Teile? Kunden kaufen sie genauso oft wie einfache Teile – dadurch bringt eine Theke mit Vorhängeschlössern sehr viel Gold.
2. **Handel im echten Tempo:** geklärt – Tobias' Zeiten (bis Eisen etwa 45 Minuten, zweite Runde Eisen nach etwa 60 Minuten) sind in echter Zeit gemessen; nur die Eisen-Runden hat er im Testmodus beschleunigt. Früher: 2 Theken fühlen sich gut an; im Schnellmodus kommt man mit dem Nachfüllen nicht hinterher (Kunden ×10).
3. **Laden-Lager:** seit v0.10.1 500 Plätze bis Level 3, 1.000 ab Level 4 (Tobias). Claudes Lesart: erst ab Level 4, weil es dort eng wird. Soll es schon ab Level 1 1.000 sein, ist das eine Zahl in der Datentabelle.
4. **Aufträge (seit v0.13.0 im Spiel):** geklärt – Waren werden abgegeben, ein Auftrag nach dem anderen, Gold = Thekenwert, Erfahrung reicht genau fürs Level, Aufstieg kostet Gold. Stückzahlen passen (Tobias, v0.13.0: „machbare Menge, das Spiel soll auch fordern“). Noch offen: Passen die Aufstiegspreise (Platzhalter)? Level 7 bis 12 kommen mit dem Kräuter-Kapitel (Abschnitt 4.4). Kostet der Laden-Ausbau später zusätzlich Waren (Abschnitt 3.5)? Begrenzt das Level die kaufbare Fläche? Tobias' Erkenntnis bleibt wichtig: Man muss die Mitte finden zwischen Verkaufen (Gold für Rohstoffe) und Weiterverarbeiten.
5. **Einstieg:** Tobias' Idee, am Anfang vor allem die Massenproduktion auszubauen, damit man schnell genug Ware von allem hat – später austesten. Die 500 Gold Startkapital reichen für den Weg zu Stein und Eisen (Test von v0.9.1).
6. **Pleiteschutz:** Ein Rohstoff ohne passendes Gebäude (z. B. Felsbrocken ohne Steinbruch) verhindert das Geschenk. Vorerst bewusst so gelassen; beobachten.
7. **Schwarzmarkt & verbundene Läden:** in M5 entscheiden.
8. **Arbeitstitel:** ergibt sich im Laufe der Entwicklung.
9. **Theken-Größen:** geklärt (v0.10.1) – alle Theken wachsen mit: klein 20 (bis Level 3), mittel 25 (Level 4), groß 30 (ab Level 5). Claudes Lesart der Level-Zuordnung; falls mittel erst ab Level 5 und groß ab Level 6 gemeint war, ist das eine Zeile in der Datentabelle.
10. **Tempo ab Level 4 (Feinschliff):** Bei Tobias dauerte es etwa 5 Minuten, bis ein Stein-Zahnrad in der Zimmerei ankam. Das ist gewollt: Am Anfang geht es schnell, danach muss man auf Masse gehen (mehr Holzfäller und Steinbrüche), um die Kombi-Maschinen zu versorgen. Beobachten, ob die Balance stimmt – Stellschrauben sind die Mengen in den Rezepten (10 + 5), die Dauer eines Rohstoffs (15 Minuten) und die Fläche (seit v0.10.2 fester Preis, 500 Gold je Streifen). Stand v0.11.0 (Tobias, Echtzeit): nach über einer Stunde noch nicht Level 6, nach 2–3 Stunden das erste Scharnier; der Flow fühlt sich gut an (schnell drin, ständig Rohstoffe nachlegen und produzieren).
11. **Größe der Welt:** Seit v0.10.2 kann das Grundstück bis 38 × 30 Felder wachsen (jede Seite 2×). Reicht das für die Massenproduktion der höheren Level, oder gibt es später mehr Fläche, z. B. weitere Käufe je Seite mit dem Level oder über Aufgaben? Das ist dann nur eine Zahl in der Datentabelle (`perSide`).
12. **Weiche mit Filter (Idee von Claude):** Ein Band-Feld, das eine bestimmte Ware abzweigt und den Rest geradeaus schickt, um gemischte Bänder zu sortieren. Will Tobias das, und wenn ja, wann? Seit v0.12.0 helfen „Strecke leeren“ und „Zulauf leeren“ bei falschen Waren.
13. **„Eiserner Bestand“:** Tobias' Erkenntnis: Am Anfang verkauft man alles, weil man Gold braucht, und später fehlen Baumaterialien (Blöcke, Platten), weil sie in die Produktion gehen. Wer strukturiert spielt und immer einen Grundvorrat im Laden-Lager behält, kommt nicht in Not. Nach Level 6 (Chat 9): Wer am Anfang nicht auf das „Makro“ achtet, muss am Ende z. B. eine eigene Holz-Linie nur für Baumaterial nachbauen. Erste Hilfe in v0.12.0 war der Rest beim Nachschub; den Nachschub gibt es seit v0.14.0 nicht mehr. Denkbar wäre später noch ein Mindestbestand, den die Theken nicht anrühren – nur, wenn Tobias das möchte.
14. **Nachschub bremsen?** geklärt – den Nachschub gibt es seit v0.14.0 nicht mehr (Tobias: Er hebelt die Bänder aus). Lagerhäuser befüllt man von Hand.
15. **Verbesserungen mit Erfahrung (Idee von Tobias):** Mit XP z. B. schneller Holz verarbeiten oder schnellere Förderbänder freischalten. Tobias ist sich noch nicht sicher, in welche Richtung; vorerst dient die Erfahrung nur dem Aufstieg. Das Spiel zählt schon alle Erfahrung mit (`xpTotal`), damit das später möglich ist.
16. **Reihenfolge nach v0.13.0:** geklärt – erst das Spiel im Hintergrund (v0.14.0), dann besprechen wir gemeinsam die Vorgehensweise mit Level und Techbaum.
17. **Rohstoff-Vorrat (seit v0.14.0):** 3 Rohstoffe je Gebäude (45 Minuten) – Tobias: „3 als Rohstoff reichen“. Soll der Vorrat später wachsen, z. B. mit dem Level oder als Verbesserung mit Erfahrung (Frage 15)? Das ist eine Zahl in der Datentabelle (`capacity`).
18. **Kräuter-Kapitel (Abschnitt 4.4):** Geklärt (Chat 11): 1 Samen = 1 Pflanze, etwa 30 Minuten Wachszeit, ernten, kein Band am Beet, jede Pflanze im selben Beet, 1 Pflanze → 50 Fasern → 10 Verbände, Preise etwa 1.000 (Samen) und 150 (Verband). Geklärt (Chat 11, Teil 2): Pflanze einlegen wie einen Holzstamm, Ernten und Säen getrennt, Beet 2 × 2, die Maschine mit 2 Eingängen erst auf Level 8. Der Plan für Level 7 steht als Entwurf (Abschnitt 6, v0.16.0) und wartet auf Freigabe. Später: Level 8 (wie die Ringelblume verarbeitet wird, welche Maschine mit 2 Eingängen, Rezept des Heilverbands, wählt man beim Säen den Samen per Liste?), Level 9 (dritte Pflanze, Claudes Idee: Schafgarbe), Level 10–12.
19. **Test-Knopf (seit v0.15.0):** Vor v1.0 entfernen (`QUEST_TEST_SKIP = false` in `data/levels.js`). Zählt die übersprungene Erfahrung auch für spätere Verbesserungen mit Erfahrung (Frage 15)? Im Moment ja (`xpTotal`).

---

## 9. Versionshistorie

### v0.15.1 – Plan für Level 7 „Die Heilstube“ (08.11.2026, nur README)

**Vorgenommen:**
- Das Kräuter-Kapitel auf dem Papier planen, bevor Code entsteht: Gesamtbild Level 7–12 und Level 7 im Detail.

**Fragen, die wir uns gestellt haben:**
- Wie kommt die Pflanze ohne Band in die Faser-Maschine? → Ernten legt sie ins Laden-Lager, von dort legt man sie ein wie einen Holzstamm (Tobias: „Ja“).
- Ernten und Säen in einem Tipp? → Nein, zwei Schritte (Tobias).
- Wie viele Beete braucht eine Flachsbreche? → 3: Mit 10 Minuten je Pflanze und Vorrat 3 läuft die Flachsbreche genau eine Wachszeit (30 Minuten).
- Passen die Preise zu den Regeln? → Ja: jede Stufe bringt mehr (1.000 → 1.250 → 1.500), und kein neues Gebäude kostet mehr, als ein Samen einbringt.
- Wie geht es nach Level 7 weiter? → Schritt für Schritt wie im Werkzeug-Kapitel: Level 8 Ringelblume und die erste Maschine mit 2 Eingängen, Level 9 eine dritte Pflanze, bis Level 10 Fasern + 3 Pflanzen, Level 11–12 weiter kombinieren (Tobias).

**Gemacht:**
- README: Plan für v0.16.0 (Abschnitt 6), Gesamtbild und Antworten in Abschnitt 4.4, Level 7 in Abschnitt 3.8, Status, Fahrplan, Entscheidungen, offene Fragen, Gesprächsprotokoll. Spiel unverändert; nur die Versionsnummer im Spiel steigt auf v0.15.1.

### v0.15.0 – Test-Knopf „Auftrag erledigen“ (08.11.2026)

**Vorgenommen:**
- Tobias' Wunsch nach dem Test von v0.14.0: ein Knopf für den Prototyp, der einen Auftrag automatisch abschließt – die Aufträge macht Tobias gerade nicht aktiv, weil die Spielmechanik im Vordergrund steht.

**Fragen, die wir uns gestellt haben:**
- Was gibt der Knopf? → Nur die Erfahrung. Keine Waren weg, kein Gold – sonst wäre es Gratis-Gold, das die Wirtschaft verfälscht. Aufsteigen kostet weiter Gold.
- Wann ist er zu sehen? → Immer, solange das Spiel ein Prototyp ist (Tobias); im Testmodus liefe die Zeit ×10, Tobias spielt aber in Echtzeit.
- Was bringt er auf Level 6? → Die Erfahrung der Stadttor-Aufträge sammelt sich bis Level 7; richtig nützlich wird er mit dem Kräuter-Kapitel und bei einem neuen Spiel.
- Muss der Spielstand umgewandelt werden? → Nein.

**Gemacht:**
- Datentabelle `data/levels.js`: `QUEST_TEST_SKIP = true`. Spielregeln in `quests.js`: `canSkipQuest`, `skipQuest` (Erfahrung und `xpTotal`, nächster Auftrag, keine Waren, kein Gold).
- Level-Fenster: lila, gestrichelter Kasten mit „🧪 Test: Auftrag erledigen“ und der Erfahrung, die er bringt; Bestätigung „Auftrag als erledigt gewertet (Test)“ und kurze Meldung.
- 211 automatische Tests (neu in `quests.test.js`: Knopf eingeschaltet, Erfahrung ohne Waren und Gold, geht auch ohne die Waren und danach normal weiter, alle Aufträge jedes Levels ergeben genau die Erfahrung und Aufsteigen braucht weiter Gold, höchstes Level sammelt Erfahrung, Spielstand-Format unverändert) und der Browser-Test (neu: Knopf ohne Testmodus sichtbar, auf Level 6 per Touch: +259 Erfahrung, kein Gold, keine Waren, alle 4 Stadttor-Aufträge, danach kein Knopf mehr) in Tablet- und Handygröße – alle bestanden.

### v0.14.0 – Fabrik läuft im Hintergrund weiter & Rohstoff-Vorrat (07.11.2026)

**Vorgenommen:**
- Tobias' Wunsch (Chat 10): Das Spiel läuft im Hintergrund weiter, aber man muss selbst nachlegen – wie Clash of Clans, nur umgekehrt. Dazu mehrere Rohstoffe je Gebäude, ein Knopf „Auffüllen“ und das Lagerhaus nur noch zum Befüllen.

**Fragen, die wir uns gestellt haben:**
- Wie lange läuft eine Fabrik ohne Spieler? → Mit einem Rohstoff nur 15 Minuten, egal wie viele Holzfäller (sie arbeiten gleichzeitig). Deshalb ein Vorrat: 3 Rohstoffe (Tobias), also 45 Minuten, und die Maschinen danach, bis ihre Zutaten aufgebraucht sind.
- Dürfen Kunden im Hintergrund kaufen? → Ja, bis die Theken leer sind (Tobias).
- Was bleibt vom Lagerhaus? → Befüllen und Ausräumen; der Nachschub fällt weg, weil er die Bänder aushebelt (Tobias).
- Wie rechnet man Stunden nach, ohne dass das Tablet hängt? → Die Fabrik Takt für Takt, bis sie stillsteht (geprüft alle 10 Sekunden Spielzeit); danach nur noch die Kunden im Schnelldurchlauf. In Portionen, mit Hinweis und Fortschrittsleiste. Laufen Waren endlos im Kreis, rechnet die Fabrik höchstens 4 Stunden nach.
- Was passiert mit der Uhr? → Gerechnet wird ab dem letzten Speichern (alle 10 Sekunden und beim Verlassen). Während des Nachrechnens wird nicht gespeichert; eine zurückgestellte Uhr ändert nichts.

**Gemacht:**
- Datentabellen: Vorrat `capacity: 3` bei Holzfällerlager, Steinbruch und Schmelzhütte; neue Tabelle `data/offline.js`; Lagerhaus ohne `supplyBuffer`; neue Gebäudetexte.
- Spielregeln: Vorrat (`queued`) in `production.js` (nacheinander verarbeiten, beim Abreißen kommen wartende Rohstoffe zurück), „Auffüllen“ in `market.js`, Nachschub aus `warehouse.js` entfernt, neues `src/core/offline.js` (Nachrechnen in Portionen, Stillstand erkennen, Bericht).
- Oberfläche: Knöpfe „⏫ Auffüllen“ und „➕ 1 Holzstamm einlegen“, Vorrat und „Leer in etwa …“ im Infofenster, drei Punkte am Gebäude; Lagerhaus-Fenster nur noch zum Befüllen; Hinweis „Die Fabrik holt die Zeit nach …“ und Fenster „Willkommen zurück“ (`src/view/offline.js`); `main.js` erkennt Pausen (App im Hintergrund, Standby) und rechnet nach.
- Spielstand-Version 12 mit Umwandlung von Version 11 (leerer Vorrat, Nachschub weg, Meldung).
- 206 automatische Tests (neu in `offline.test.js`: Vorrat aus der Datentabelle, 3 Holzstämme → 600 Blöcke, Abreißen mit Vorrat, Speichern und ungültiger Vorrat, Umwandlung von Version 11, Auffüllen aus dem Laden-Lager und per Kauf, Gold- und Level-Grenzen, Nachrechnen ergibt genau dasselbe wie das laufende Spiel, Stillstand und Schnelldurchlauf, Kunden bis die Theken leer sind, volles Laden-Lager, endloser Kreis, in Stücken nachrechnen, keine oder negative Zeit; in `warehouse.test.js`: leeres Lagerhaus bleibt leer, Umwandlung des Nachschubs) und der Browser-Test (neu: Auffüllen mit Kauf, Vorrat 3 / 3, Lagerhaus ohne Nachschub, 20 Minuten weg in der App, 2 Stunden mit geschlossenem Spiel) in Tablet- und Handygröße – alle bestanden.
- Beim Testen gefunden und behoben: Der Browser-Test zählte beim Lagerhaus auch Eisenbarren einer anderen Linie mit und schlug deshalb manchmal fehl.

### v0.13.0 – Aufträge aus dem Ort & neue Warennamen (07.11.2026)

**Vorgenommen:**
- Tobias' Wunsch nach v0.12.0: Das Spiel soll in der Gesamtheit mehr Sinn ergeben. Ein roter Faden (wachsender Ort, Bewohner, Bauabschnitte), Produktnamen, die zu ihren Zutaten passen, und Aufträge mit Erfahrung als Weg zum nächsten Level (Modell von Tobias).

**Fragen, die wir uns gestellt haben:**
- Ist es logisch, was aus zwei Produkten entsteht? → Nicht immer (z. B. Kugellager aus einem Scharnier). Lösung: Namen ändern, Rezepte behalten – so bleibt die Balance, und Tobias' Fabrik läuft weiter.
- Wo stehen die Aufträge? → Im Level-Fenster, weil die Erfahrung fürs Level gebraucht wird (Tobias).
- Wie viele gleichzeitig, und gibt es weitere Bestellungen? → Immer genau einer, 2–5 je Level, keine weiteren Anfragen – der Ladenverkauf bleibt im Vordergrund (Tobias).
- Wie viel Gold? → So viel wie an der Theke, nicht mehr; die Erfahrung steht im Vordergrund (Tobias).
- Wie passen Erfahrung und Aufstieg zusammen? → Die Aufträge eines Levels bringen genau die nötige Erfahrung; der Aufstieg kostet dann Gold.
- Was passiert mit Tobias' Fabrik auf Level 6? → Sie behält ihr Level und bekommt die Aufträge vom Stadttor; die Erfahrung sammelt sich bis Level 7.

**Gemacht:**
- Datentabellen: neue Namen, Bilder und Einstellungs-Namen für 8 Waren; `data/levels.js` mit Bauabschnitten, Geschichte, 21 Aufträgen, Aufstiegspreisen und Belohnungs-Regel.
- Neue Spielregeln `src/core/quests.js` (aktueller Auftrag, Belohnung, abgeben, Erfahrung je Level); `src/core/levels.js`: Aufsteigen mit Erfahrung und Gold, Grund, warum es noch nicht geht.
- Level-Fenster neu mit den Reitern „📜 Aufträge“ und „🏘️ Ort & Level“; Erfahrungsleiste und ❗ im Knopf „Laden-Level“; Meldungen, wenn ein Auftrag bereit ist oder man aufsteigen kann.
- Neue Warenbilder: Zahnradwelle, Räderwerk, Schlüssel, Zirkel, Gewichtstein, Uhrwerk.
- Spielstand-Version 11 mit Umwandlung von Version 10 (Namen überall, Aufträge von vorn) und Meldung beim Öffnen.
- 195 automatische Tests (neu in `quests.test.js`: neue Namen mit gleichen Rezepten und Werten, Belohnung, Erfahrung eines Levels reicht genau, Abgeben aus dem Laden-Lager, Theken zählen nicht, letzter Auftrag, höchstes Level, Speichern, Umwandlung von Version 10 mit alten Namen an allen Stellen, ungültige Aufträge; in `levels.test.js`: jedes Level mit 2–5 Aufträgen aus herstellbaren Waren, jedes Kombi-Produkt kommt in einem Auftrag vor, Aufstieg erst mit Erfahrung, dann mit Gold, neues Spiel mit echter Produktion bis Eisen) und der Browser-Test (neu: ❗ erscheint, Auftrag per Touch abgeben, Erfahrungsleiste, Aufstieg kostet 100 Gold, Reiter „Ort & Level“, Aufträge vom Stadttor auf Level 6) in Tablet- und Handygröße – alle bestanden.
- Beim Testen gefunden und behoben: Auf dem höchsten Level war die Erfahrungsleiste voll, obwohl „0“ dastand; sie zeigt jetzt den Fortschritt im Bauabschnitt.

### v0.12.0 – Nachschub aus dem Laden-Lager & Bänder leeren (07.11.2026)

**Vorgenommen:**
- Tobias' Wunsch nach Level 6: Waren aus dem Laden-Lager zurück auf ein Band bringen – ein Gegenstück zum Versandportal, am besten über das Zwischenlager (Lagerhaus). Dazu die in v0.11.1 vorgemerkten Knöpfe „Strecke leeren“ und „Zulauf leeren“.

**Fragen, die wir uns gestellt haben:**
- Neues Gebäude oder das Lagerhaus? → Das Lagerhaus (Tobias' Idee): Es kann ohnehin lagern und ausgeben und bekommt so eine klare Aufgabe.
- Einmal befüllen oder dauerhaft nachholen? → Beides: „Befüllen“ für einen Vorrat (z. B. 120 Eisenbarren), „Nachschub“ als echtes Gegenstück zum Versandportal.
- Wie verhindert man, dass der Nachschub das Baumaterial leer zieht? → Ein einstellbarer Rest bleibt immer im Laden-Lager.
- Wie viel holt der Nachschub auf einmal? → Nur bis zu 10 Stück; der Rest bleibt im Laden-Lager sichtbar und nutzbar, mehrere Lagerhäuser teilen sich eine Ware.
- Welche Zuleitung leert „Zulauf leeren“? → Die mit der falschen Ware; die richtige wartet nur auf ihre Zutat.
- Muss Tobias' Spielstand umgewandelt werden? → Ja, kurz: Lagerhäuser bekommen „kein Nachschub“ (Version 10); sonst bleibt alles, wie es ist.

**Gemacht:**
- Neue Spielregeln `src/core/warehouse.js` (befüllen, Nachschub mit Rest, ausräumen), Nachschub im Takt der Simulation und im Statuslicht; Datentabelle `supplyBuffer: 10` beim Lagerhaus.
- `src/core/belts.js`: zusammenhängende Strecke finden, Strecke leeren, gestaute Zuleitungen einer Maschine erkennen und leeren.
- Neues Fenster `src/view/warehouse.js` (Ware wählen, Menge bzw. Rest), Knöpfe in den Infofenstern von Lagerhaus, Band und Maschinen, Kreispfeil mit Warenbild am Lagerhaus, hell markierte Strecke beim angetippten Band.
- Spielstand-Version 10 mit Umwandlung von Version 9 und Meldung beim Öffnen.
- 184 automatische Tests (neu in `warehouse.test.js`: Befüllen auf 3 Fächer, Grenzen durch Laden-Lager und Platz, keine Rohstoffe, 120 Eisenbarren → 24 Eisenstangen, Nachschub hält 10 bereit, Nachschub durch die Fabrik und weiter, sobald Neues ins Laden-Lager kommt, Rest bleibt liegen, zwei Lagerhäuser teilen sich eine Ware, Ausräumen schaltet ab, Abreißen, Speichern, Umwandlung von Version 9, ungültiger Nachschub, Strecke über Abzweig und Zusammenführung, Band daneben bleibt, Strecke endet am Gebäude, Zulauf leeren nur bei falscher Ware, gemischtes Band, ohne Stau nichts) und der Browser-Test (neu: Zuleitung per Touch, Strecke antippen und leeren, Zulauf leeren an der Zimmerei, Lagerhaus mit Band zum Versandportal per Touch bauen, Befüllen mit Mengenwahl, 120 Eisenbarren laufen über das Band zurück ins Laden-Lager, Nachschub mit Rest 20, „Nachschub aus“, Ausräumen) in Tablet- und Handygröße – alle bestanden.
- Beim Testen gefunden und behoben: Eine ältere Prüfung im Browser-Test („Alle“ auf die Theke) schwankte, wenn genau dann ein Kunde kaufte; sie rechnet seine Einkäufe jetzt mit (wie schon die Prüfung mit 8 Stück).

### v0.11.1 – Test-Feedback (07.11.2026, nur README)

**Vorgenommen:**
- Tobias' Feedback zu v0.11.0 festhalten und die Idee „Bänder leeren“ vormerken, damit der nächste Chat direkt daran anknüpfen kann.

**Fragen, die wir uns gestellt haben:**
- Wie werden falsche Waren auf einer Strecke los, ohne die Bänder abzureißen? → Knopf „🧺 Strecke leeren“ am Band und „🧺 Zulauf leeren“ an blockierten Maschinen; die Waren kommen ins Laden-Lager (vorgemerkt).
- Liegt das Problem am Spiel oder an der Spielweise? → Beides ein wenig: Tobias merkt selbst, dass ein „eiserner Bestand“ an Baumaterialien hilft; der Knopf bleibt trotzdem eine gute Erleichterung.
- Jetzt programmieren? → Nein (Tobias): erst bis Level 6 spielen und Feedback sammeln.

**Gemacht:**
- README: Status, Fahrplan, Abschnitt „Vorgemerkt: Bänder leeren“, Entscheidungen, offene Fragen, Gesprächsprotokoll. Spiel unverändert; nur die Versionsnummer im Spiel steigt auf v0.11.1.

### v0.11.0 – Umbauen: Bereiche verschieben (07.11.2026)

**Vorgenommen:**
- Tobias' Wunsch nach dem Test von v0.10.2: Umbauen ist umständlich, weil man jedes Band einzeln abreißen und neu legen muss. Teile sollen sich verschieben lassen, und ein markierter Bereich – z. B. die ganze Eisen-Produktion – soll sich als Ganzes versetzen lassen. Dazu die Taste R zum Drehen.

**Fragen, die wir uns gestellt haben:**
- Wie markiert man mit dem Finger, ohne dass die Karte mitwandert? → Wie beim Förderband: Ein Finger zieht das Rechteck, zwei Finger bewegen die Karte.
- Was gehört zur Markierung? → Alles im Rechteck, auch Gebäude, die nur zum Teil darin liegen (Tobias); das gelbe Leuchten zeigt genau, was dabei ist.
- Bleibt die Linie beim Drehen verbunden? → Ja: Bänder drehen ihre Richtungen mit, Gebäude ihre Ein- und Ausgänge; auch Waren auf den Bändern drehen mit. Ein Test lässt eine gedrehte Linie in allen drei Drehungen bis ins Versandportal laufen.
- Was ist mit Bändern, die von außen hineinführen? → Sie bleiben stehen; an der neuen Stelle schließt man neu an.

**Gemacht:**
- Neue Spielregeln `src/core/area.js`: markieren, Vorschau mit belegten Feldern, verschieben mit Drehung, abreißen mit Rückerstattung.
- Bauleiste mit dem Werkzeug „✥ Verschieben“, Werkzeugleiste mit „🧹 Abreißen“ und „✥ Verschieben“, gelbe Markierung, gestrichelter Rahmen beim Ziehen, Vorschau der Gruppe mit grünen und roten Feldern, Taste R.
- 163 automatische Tests (neu in `area.test.js`: Markieren mit halb erfassten Gebäuden, Linie verschieben mit Waren und angefangenem Holzstamm, gedreht verschieben um 90°/180°/270° mit laufender Produktion bis ins Laden-Lager, Ware dreht mit, belegte Felder und Grundstücksrand, Abzweig ins Leere, Bereich abreißen mit Rückerstattung, Speichern nach dem Verschieben) und der Browser-Test (neu: Rechteck per Touch ziehen, Gruppe mit Taste R drehen und mit dem Finger verschieben, Zuleitung zeigt danach in den Eingang, Bereich abreißen mit Rückfrage, Taste R dreht ein angetipptes Gebäude) in Tablet- und Handygröße – alle bestanden.
- Beim Testen gefunden und behoben: Eine Prüfung im Browser-Test (Theke mit genau 8 Holzblöcken) schwankte, wenn genau in diesem Moment ein Kunde kaufte; sie rechnet seine Einkäufe jetzt mit.

### v0.10.2 – Fläche für 500 Gold & Warenbilder in der Bauleiste (07.11.2026)

**Vorgenommen:**
- Tobias' Rückmeldungen zu v0.10.1: Die Fläche ist noch immer ein entscheidender Faktor – jeder Kauf soll 500 Gold kosten, ohne teurer zu werden, und jede Seite soll sich 2× erweitern lassen. Außerdem fehlten in der Bauleiste die Warenbilder.

**Fragen, die wir uns gestellt haben:**
- Wie tief ist ein Streifen? → 4 Reihen, schon ab Level 1 (Tobias: „4 Reihen reichen“).
- Wie hat jede Seite Platz für 2 Käufe? Oben waren bisher nur 5 Reihen frei, rechts 10. → Die Welt ist jetzt genau 8 Felder um das Startgrundstück herum groß (38 × 30). Damit Gebäude ihre Felder behalten, beginnt sie oben bei Reihe −3 statt 0.
- Was passiert mit schon gekaufter Fläche? → Sie bleibt und zählt mit; übrig gebliebene Rest-Streifen kosten anteilig weniger.
- Warum fehlten die Bilder? → Sie wurden nur beim Start gezeichnet; nach dem Minimieren darf der Browser sie wegwerfen. Tobias bestätigte: Die Bilder waren erst nach dem Minimieren weg.

**Gemacht:**
- Datentabelle `land.js`: Streifentiefe 4, 2 Käufe je Seite, 500 Gold je Streifen. Welt mit eigener Ecke (`state.js`), Spielregeln für Preis und „wie oft noch“ (`land.js`), Zeichnen und Kamera mit der neuen Welt.
- Spielstand-Version 9 mit Umwandlung von Version 8 (Welt passend zur gekauften Fläche), Meldung beim Öffnen.
- Warenbilder: merken sich, was sie zeigen, und werden beim Öffnen der Bauleiste sowie beim Zurückkehren ins Spiel neu gezeichnet.
- Nachgestellt: ein Spielstand aus v0.10.1 auf Level 4 mit gekaufter Fläche (oben bis an den alten Rand, rechts 6 Spalten) öffnet sich mit Meldung, Fabrik und Fläche unverändert; die Schilder zeigen oben 380 Gold (3 Reihen) und rechts 250 Gold (2 Spalten).
- 155 automatische Tests (neu u. a.: 500 Gold bei jedem Kauf, 4 Reihen auf jedem Level, jede Seite genau 2×, alles gekauft = 38 × 30 für 4.000 Gold, Bauen oberhalb von Reihe 0, Rest-Streifen anteilig, Umwandlung von Version 8 auch mit Fläche über die neue Welt hinaus) und der Browser-Test (neu: Angebot 4 Spalten für 500 Gold schon auf Level 1, rechts 2× kaufen bis zum Rand, Warenbilder der Bauleiste erscheinen nach dem Wegwerfen beim Öffnen und beim Zurückkehren wieder) in Tablet- und Handygröße – alle bestanden.

### v0.10.1 – Feinschliff nach Tobias' Test (07.11.2026)

**Vorgenommen:**
- Tobias' Rückmeldungen zu v0.10.0 umsetzen: Theken, Laden-Lager, Fläche, Umstellen von Maschinen.

**Fragen, die wir uns gestellt haben:**
- Wohin waren die Teile beim Umstellen „verschwunden“? → Ins Laden-Lager (es gab nur eine kurze Meldung). Verloren ging nichts, aber es war verwirrend. Jetzt bleiben sie in der Maschine.
- Wie sieht man die Rezepte der anderen Einstellungen, ohne umzustellen? → Im Infofenster unter „Andere Einstellungen“.
- Wann werden die Theken größer? → Alle gemeinsam: 20 bis Level 3, 25 auf Level 4, 30 ab Level 5.
- Was passiert mit Theken, auf denen mehr liegt, als jetzt passt? → Der Rest kommt beim Öffnen ins Laden-Lager, mit Meldung.
- Wie viel mehr Fläche? → Ab Level 4 doppelt so tiefe Streifen bei gleichem Preis je Feld.

**Gemacht:**
- Datentabellen: Theken-Größe je Level, Laden-Lager 1.000 ab Level 4, Streifentiefe je Level.
- Spielregeln: Teile bleiben beim Umstellen in der Maschine, „Reste ins Laden-Lager“, Theken beim Laden anpassen.
- Anzeige: Infofenster mit den Rezepten aller Einstellungen und dem, was noch in der Maschine liegt; Level-Fenster nennt größere Theken und Laden-Lager.
- 150 automatische Tests (neu u. a.: Theken 20/25/30 bis Level 6, Laden-Lager 500/1.000, Streifen 4 tief ab Level 4 und am Rand der Welt kürzer, Teile bleiben beim Umstellen und mitten im Durchgang, Reste-Knopf, Spielstand mit 35 Stück auf einer Theke) und der Browser-Test (neu: andere Einstellungen im Infofenster, Umstellen und Zurückstellen ohne Verlust, Reste-Knopf, fünf Theken mit je 30 Plätzen, Laden-Lager 1.000, Fläche 4 Spalten auf Level 6) in Tablet- und Handygröße – alle bestanden.

### v0.10.0 – Techbaum, Teil 2 (06.11.2026)

**Vorgenommen:**
- Die nächste Stufe des Techbaums mit Maschinen, die zwei verschiedene Zutaten verarbeiten – nach Tobias' Wunsch nur 3 Maschinen mit je 3 Produkten statt 6 Maschinen.
- Level 4 bis 6, mit jedem Level eine Verkaufstheke mehr; die Menge auf der Theke soll sich genau einstellen lassen.

**Fragen, die wir uns gestellt haben:**
- Wie viele Maschinen? → 3 (Tobias), sonst wird es unübersichtlich; dafür 3 Einstellungen je Maschine.
- Wie werden alle Rohstoffe gleich gebraucht? → Eigene Rezepte mit 10 + 5 Grundteilen (Tobias); die Steinkette nimmt Steinplatten, damit jedes Grundteil vorkommt.
- Was passiert, wenn beide Zutaten über ein Band kommen? → Es klappt, solange das Verhältnis passt; nimmt eine Zutat überhand, staut sich der Eingang. Die Maschine zeigt das rot an („Eingang blockiert“); am sichersten bekommt jede Zutat ihren eigenen Eingang.
- Woran sieht man, was fehlt? → Bild der fehlenden Zutat an der Maschine, im Infofenster jede Zutat mit Häkchen und „fehlt noch …“.
- Was ist das Geschenk ab Level 4, wenn es keinen vierten Rohstoff gibt? → 1 Eisenerz.
- Muss Tobias' Spielstand umgewandelt werden? → Nein, das Format bleibt gleich; neue Theken kommen beim Aufstieg (und beim Laden, falls welche fehlen) dazu.

**Gemacht:**
- Datentabellen: 9 Waren, 9 Rezepte, 3 Gebäude, Level 4–6, Theken je Level und Plätze je Theke; Testpaket mit je 5 Kombi-Teilen.
- Spielregeln: Theken beim Aufstieg, Menge auf der Theke einstellen, Zutaten der Werkstatt mit Vorrat, Stau am Eingang erkennen, nicht gebrauchte Zutaten beim Umstellen zurück ins Laden-Lager.
- Anzeige: neue Warenbilder (Kurbel, Schalter, beschlagene Platte, Scharnier, Feder, Kugellager, Kette, Regler, Schloss), Sprechblase mit fehlender Zutat, Infofenster mit Zutatenliste und drei Einstellungen, Mengenwahl für die Theken, Level-Fenster nennt neue Theken, breitere Fenster.
- 145 automatische Tests (neu u. a. in `combo.test.js`: beide Eingänge, vertauschte Eingänge, Mini-Schloss, Regler, Kugellager, fehlende Zutat ohne Stau, Stau auf gemischtem Band, falsche Ware, Umstellen, Theken bis Level 6 mit 20/20/25/30/35 Plätzen, genau 8 Stück auf die Theke, Spielstand mit fehlender Theke) und der Browser-Test (neu: Menge 8 einstellen, „Alle“, Aufstieg bis Level 6, Zimmerei per Touch bauen, Infofenster mit fehlender Zutat, Umstellen, 5 Theken) in Tablet- und Handygröße – alle bestanden.
- Beim Testen gefunden und behoben: Die Sprechblase rutschte bei größerer Darstellung auf den Namen; auf dem Tablet brachen „Ware wählen“ und „Abräumen“ um und „Alle (20)“ rutschte in eine eigene Zeile. Außerdem eine Prüfung im Browser-Test, die schwankte, wenn genau beim Kauf ein Kunde bezahlte.

### v0.9.2 – Test-Feedback (06.11.2026, nur README)

**Vorgenommen:**
- Tobias' Feedback zum Test von v0.9.1 festhalten, damit der neue Chat direkt mit dem Plan für v0.10.0 starten kann.

**Fragen, die wir uns gestellt haben:**
- Ist das Grinden zu viel? → Nein, Tobias hat es sich genau so vorgestellt.
- Passen die Flächenpreise? → Noch nicht genutzt, wirken aber erschwinglich.
- Was heißt das für v0.10.0? → Die neuen Maschinen sollen mit ein paar weiteren Runden Rohstoffe erreichbar sein.

**Gemacht:**
- README: Status, Fahrplan, Ausblick v0.10.0, Entscheidungen, offene Fragen, Gesprächsprotokoll. Spiel unverändert; nur die Versionsnummer im Spiel steigt auf v0.9.2.

### v0.9.1 – Startkapital (06.11.2026)

**Vorgenommen:**
- Tobias ist beim Test in Echtzeit nach dem ersten Holzstamm fast pleite gegangen (372 Gold, der nächste Stamm kostet 550). Vorschlag von Tobias: 500 Gold Startkapital.

**Fragen, die wir uns gestellt haben:**
- Liegt es an der Spielweise? → Nein: Der erste Holzstamm muss die ersten Gebäude mitbezahlen und bringt dann höchstens rund 400 Gold – nie genug für den zweiten.
- Muss Tobias neu anfangen? → Nein, bestehende Spielstände bekommen die 500 Gold einmalig nachgezahlt.
- Soll der Pleiteschutz einen Rohstoff ohne passendes Gebäude ignorieren? → Vorerst nicht (Tobias); mit Startkapital kaum noch nötig.

**Gemacht:**
- Startgold 500 in der Datentabelle, Spielstand-Version 8 mit Nachzahlung, Meldung beim Öffnen.
- Nachgestellt: Tobias' Testspiel (Level 2, 372 Gold, Felsbrocken) öffnet sich mit 872 Gold auf Level 2.
- 125 automatische Tests (neu: Startkapital reicht nach 2 Sägewerken für den zweiten Holzstamm, Nachzahlung nur einmal) und der Browser-Test – alle bestanden.

### v0.9.0 – Fläche kaufen & erste Level (06.11.2026)

**Vorgenommen:**
- Mehr Platz für neue Maschinen: Fläche kaufen vorziehen (Tobias: Der Platz ist das Problem, nicht die Zeit).
- Erste, bewusst einfache Level, damit der Weg Holz → Stein → Eisen schon jetzt rund spielbar ist.

**Fragen, die wir uns gestellt haben:**
- Wie wächst das Grundstück, ohne dass Gebäude verrutschen? → Es bleibt ein Rechteck und wächst in Streifen an einer Seite; alles behält seine Stelle.
- Wie verhindert man versehentliche Käufe? → Erst die Fläche antippen (Streifen wird hell, Fenster mit Preis), dann „Kaufen“.
- Woran sieht man, was ein Level bringt und was fehlt? → Level-Fenster mit Häkchen-Liste, ⬆ oben in der Leiste, gesperrte Gebäude mit Schloss in der Bauleiste und beim Händler.
- Was passiert mit Tobias' Fabrik? → Sie bekommt Level 3; nichts wird gesperrt.

**Gemacht:**
- Neue Datentabellen `levels.js` und `land.js`, Level bei Gebäuden und Rohstoffen, neue Spielregeln `src/core/levels.js` und `src/core/land.js`, Level-Fenster `src/view/levels.js`.
- Spielstand-Version 7 mit Umwandlung von Version 6 (Level 3, Zähler, gekaufte Fläche).
- Nachgestellt: Ein Spielstand wie Tobias' Fabrik aus v0.8.0 öffnet sich mit Level 3, Gold und Gebäuden; die Meldung zum Flächenkauf erscheint.
- 123 automatische Tests (neu u. a.: Streifen und Preise an allen Seiten, Rand der Welt, ganze Welt kaufen, Antippen der gesperrten Fläche, Sperren beim Bauen und beim Händler, Zählen hergestellter Waren, Aufstieg mit Geschenk, neues Spiel von Holz bis Eisen, Umwandlung von Version 6) und der Browser-Test (neu: Start nur mit Holz, gesperrte Gebäude und Rohstoffe, Fläche kaufen per Touch, Aufsteigen auf Level 2 und 3 im Level-Fenster) – alle bestanden.
- Beim Testen gefunden und behoben: Die Schilder über und unter dem Grundstück lagen beim Öffnen halb unter der oberen Leiste; der Rand beim Öffnen ist jetzt etwas größer.

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

### 08.11.2026 – Chat 11: Test von v0.14.0, Test-Knopf, Vorgehen beim Kräuter-Kapitel

**Tobias:** Das Spiel über Nacht geschlossen und am Morgen wieder reingeschaut – alles hat funktioniert, die Fabrik läuft weiter. 3 Rohstoffe reichen. Die neuen Warenbilder erkennt Tobias und findet sie gut. Die Aufträge macht Tobias gerade nicht aktiv, weil die Spielmechanik wichtiger ist. Wunsch: für die Testversion des Prototyps ein Knopf, der den Auftrag automatisch abschließt. Dann gemeinsam das weitere Vorgehen planen.

**Claude** hat vorgeschlagen: Knopf „🧪 Test: Auftrag erledigen“ im Level-Fenster – Erfahrung ja, keine Waren, kein Gold, Aufsteigen kostet weiter Gold; Frage, ob immer oder nur im Testmodus sichtbar. Für das Kräuter-Kapitel: erst das Gesamtbild auf dem Papier, dann häppchenweise umsetzen (v0.16.0 Beet und Level 7 …). Fragen zum Beet (wie der Holzfäller oder echtes Warten?), ein Beet für alle Pflanzen, Preise (wie Holz oder wie Eisen) und eine Skizze für Level 7 (Leinsamen → Beet → Flachsfasern → Webstube mit Verbänden).

**Tobias:** Der Knopf soll immer zu sehen sein. Häppchenweise, wie vorgeschlagen. Das Beet kauft man wie eine Maschine, platziert es und pflanzt den Samen; ein Samen ergibt eine Pflanze, die man etwas größer darstellen kann. Nach einer Zeit ist aus dem Samen eine Pflanze geworden, die man erntet. Dann macht eine Maschine aus der Pflanze Fasern, und im nächsten Schritt gibt es wieder eine Maschine mit 2 Eingängen für Faser + Kräuter. Aus einer Pflanze z. B. 50 Fasern, daraus 10 Verbände. Das Beet soll (noch) keinen Anschluss ans Band haben; darin wächst alles, unabhängig vom Typ. Preise in der mittleren Kategorie – die mittleren Werkstattwaren bringen 72 bis 300 Gold –, z. B. 1 Verband 150 Gold, 1 Samen 1.000 Gold, also 1.500 Gold je Samen; Feintuning später. Die Basis soll günstig bleiben, mit Ringelblumen kann es anziehen (teurer, bringt mehr). Sonst wie Level 1 aufbauen, um klein anzufangen. Weil ein Samen etwa 50 % Rendite bringt, soll es etwa 30 Minuten dauern, bis die Pflanze ausgewachsen ist – so lässt sich der Geldfluss steuern.

**Umgesetzt:** v0.15.0 (siehe Versionshistorie). Tobias' Antworten zum Kräuter-Kapitel stehen in Abschnitt 4.4.

**Claude** hat danach einen Entwurf für Level 7 vorgestellt (Leinsamen → Beet → Flachspflanze → Flachsbreche → 50 Fasern → Webstube → 10 Verbände; Werte 1.000 → 1.250 → 1.500; 3 Beete je Flachsbreche) und gefragt: Pflanze einlegen wie einen Holzstamm? Ernten und neu säen in einem Tipp? Beet 2 × 2? Kommt die Maschine mit 2 Eingängen erst auf Level 8?

**Tobias:** Einlegen: ja. Ernten und Säen sollen zwei getrennte Schritte sein, damit man zweimal alles durchgehen muss. Beet 2 × 2: ja. Level 8: genau richtig verstanden. Schrittweise immer mehr dazu: auf Level 7 erst die Verbände als Grundlage, auf Level 8 kommt etwas dazu, auf Level 9 der nächste Schritt mit einer neuen Pflanze – bis Level 10 hat man Fasern + 3 verschiedene Pflanzen (wie Holz, Eisen und Stein), auf Level 11–12 kann man diese weiter kombinieren. So ähnlich war es schon festgelegt.

**Umgesetzt:** v0.15.1 (nur README): Plan für v0.16.0 – Beet und Level 7 „Die Heilstube“ (Abschnitt 6), wartet auf Tobias' Freigabe.

### 07.11.2026 – Chat 10: Test von v0.13.0, Spiel im Hintergrund, Kräuter-Kapitel, Plan und Umsetzung v0.14.0

**Tobias:** Die Stückzahlen passen; er hat den ersten Auftrag gesehen, eine machbare Menge – das Spiel soll auch fordern. Die Produkte mit den neuen Namen ergeben mehr Sinn und passen zur Geschichte. Die Bilder auf dem Band hat er noch nicht ausprobiert, geht aber davon aus, dass sie passen. Zum Weiterlaufen: Das Spiel soll im Hintergrund weiterlaufen, aber man muss selbst nachlegen – Holz, Stein und Eisen immer von Hand. Hat man z. B. 10 Holzfäller, die so viel produzieren, dass die Maschinen mehrere Stunden laufen, soll das auch im Hintergrund passieren. Man soll sich immer wieder einloggen müssen, um nachzulegen; die Produktion läuft automatisch. Das Zwischenlager soll nur noch die Funktion „Befüllen“ haben, sonst könnte man kurze Produktionsstraßen bauen, alles ins Lager schicken und über das Lagerhaus wieder heraus. Wie bei Clash of Clans, nur andersherum: Alles läuft, bis es leer ist, dann manuell nachfüllen. Techbaum: eine neue „Art“ – Kräuter. Auf Level 7 Farn oder Hanf (was mehr Sinn ergibt), daraus Fasern und in einem zweiten Schritt Verbände; auf Level 8 und 9 weitere Kräuter für heilende Verbände; später mit dem Mörser Pulver und Zaubertränke – wir sind ja im Mittelalter-Fantasy-Magier-Genre.

**Claude** hat geantwortet: Ein Holzstamm reicht 15 Minuten; 10 Holzfäller arbeiten gleichzeitig und sind nach 15 Minuten alle leer – mehr Holzfäller machen die Fabrik schneller, nicht länger. Vorschlag: Vorrat von 4 Rohstoffen je Gebäude (1 Stunde), Knopf „Auffüllen“ (erst Laden-Lager, dann kaufen), alles läuft weiter bis es leer ist (auch Kunden bis die Theken leer sind), Fenster „Willkommen zurück“; Lagerhaus: Nachschub weg, Befüllen und Ausräumen bleiben. Techbaum: Flachs statt Farn oder Hanf (Leinenbinden waren die Verbände des Mittelalters), Farn später als Zauberkraut; grober Bogen bis Level 10 mit Kräuterbeet, Heilstube, Mörser und Alchemistenküche. Reihenfolge: erst der Hintergrund (v0.14.0), dann Level 7.

**Tobias:** Mehrere Holzstämme gut, aber 3 statt 4. Seine Rechnung war: Zwischenlager können volllaufen; wird später z. B. ein Schloss aus bestimmten Stoffen hergestellt, ist der Holzfäller nach 15 Minuten leer, aber die restliche Produktion läuft weiter, bis die letzte Maschine nicht mehr arbeitet (15 Minuten bis leer, dazu Zeit für den Transport und jede Weiterverarbeitung) – im Prinzip richtig verstanden. „Auffüllen“ ist ein guter Knopf. Nachschub hat er nie benutzt. Kunden dürfen kaufen, bis alles leer ist. Flachs. Statt einzelner Gebäude ein allgemeines Beet, in dem man alles anpflanzen kann. Ringelblume ist eine gute Ergänzung für die Heilung. Level 7 Verbände, Level 8 erster Heilverband, Level 9 zweite Verbandsversion; mit dem Alchemisten möchte er bis etwa Level 15 warten. Die Level 1–6 waren voller Werkzeuge; die nächsten Level fangen mit neuer Thematik wieder von vorn an – einfach Flachs und Verbände herstellen, dann steigt die Schwierigkeit, sodass man auf Level 10 (dem „Level 4“ der Werkzeuge) wieder mehr in die Produktion investieren muss, und auf Level 11 oder 12 schließt das Kräuter-Kapitel ab. Dann gibt es zwei große Techbäume, Werkzeuge und Kräuter, und ab Level 13 kommen neue Produkte wie Sand: daraus Glas, aber über die Kräuter-Maschinen auch Sandstaub für die Zauberei. Erst den Hintergrund umsetzen, dann die Vorgehensweise mit Level und Techbaum besprechen, damit später alles Sinn ergibt.

**Umgesetzt:** v0.14.0 (siehe Versionshistorie). Der nächste Chat beginnt mit Tobias' Test von v0.14.0; danach besprechen wir das Kräuter-Kapitel (Abschnitt 4.4).

### 07.11.2026 – Chat 9, Teil 2: Test von v0.12.0, Gesamtbild, Plan und Umsetzung v0.13.0

**Tobias:** v0.12.0 getestet und die Schlosserei gebaut. Wer bis Level 6 gekommen ist, hat das Grundprinzip des Spiels verstanden. Die einzelnen Komponenten und Produkte ergeben größtenteils Sinn, aber in der Hauptmasse geht alles irgendwie unter – am Ende stellen wir Ketten, Schlösser und Regler her. Alles soll in der Gesamtheit mehr Sinn ergeben, damit wir die Geschichte mit weiteren Maschinen und Produkten immer besser spinnen können. Als Nächstes stehen die Aufgaben auf dem Plan?

**Claude** hat einen roten Faden vorgeschlagen: wachsender Ort am Fluss, jedes Level ein Bauabschnitt (Hütten, Wege und Brunnen, Schmiede, Mühle, Markt, Stadttor), Aufträge der Bewohner statt nackter Ziele; später eventuell Fertigwaren.

**Tobias:** Der Rahmen gefällt ihm sehr gut. Die Sachen sollen abgegeben werden: ein eigener Reiter mit den Aufträgen, „Abgeben“ entfernt die Waren aus dem Lager, dafür gibt es XP und Gold. Keine Fertigwaren wie Türen oder Truhen, die sind auf dem Band nicht darstellbar – weiterhin kleine Produkte, die im echten Leben klein sind. Bei den Produkten ging es ihm um die Logik: Ist es logisch, dass zwei Verstärkte Platten und ein Scharnier eine Uhr ergeben? Aus zwei Produkten soll das nächstmögliche, sinnvolle Produkt entstehen. Idee für den weiteren Techbaum: Kräuter anpflanzen, die nach einer Zeit wachsen und geerntet werden; durch den Mörser; aus Farn oder Hanf Verbände, Verband + Kräutermixtur = Heilender Verband; Kräuter mit Kohle und anderem gemischt ergeben erste Tränke (Lebenstrank, Manatrank, Alterstrank …). Aber zuerst die Aufgaben, dann den Techbaum. Nächster Schritt: besprechen, wie wir die Aufgaben planen und die Artikel umbenennen.

**Claude** hat geantwortet: 1 Scharnier + 2 Verstärkte Holzplatten sind die Baukosten der Schlosserei, kein Rezept – aber einige Rezepte sind tatsächlich nicht logisch. Vorschlag Teil 1: Rezepte und Werte bleiben, nur Namen und Bilder ändern sich (Tabelle in Abschnitt 4.2). Teil 2: Reiter „Aufträge“ im Laden, bis zu 3 Aufträge, +50 % Gold, danach zufällige Bestellungen, Aufstieg mit Gold.

**Tobias:** Teil 1 passt und gefällt ihm. Teil 2 teilweise: Der Reiter gehört zum Laden-Level, weil die XP für das Level gebraucht werden – deshalb auch eine Level-Leiste, die zeigt, wie viel XP noch fehlen. Aufträge geben unterschiedlich viel XP und Gold, je nachdem, was gebraucht wird; mehr Gold soll es nicht geben, weil die XP im Vordergrund stehen (Ersatz für die Produkte, die man früher für ein Level herstellen musste). Immer nur ein Auftrag; ist er geschafft, kommt der nächste; 2–5 je Level; nicht ignorierbar. Die Produktion soll durch die Aufträge mehr in die Masse gehen – nicht 3 Räderwerke, sondern ein gutes Gleichgewicht, für das man arbeiten muss (z. B. 20 Räderwerke). Idee: mit XP Verbesserungen freischalten (schneller Holz verarbeiten, schnellere Förderbänder) – noch unsicher, vorerst nur Aufträge fürs Level. Die Level erzählen die Geschichte des Dorfes, die Aufträge verpacken sie. Nur diese Aufträge, keine weiteren Anfragen – der Ladenverkauf steht im Vordergrund. Aufsteigen: XP schaltet frei, Gold kauft das Level, Bauteile bauen die Maschinen. Namen darf Claude aussuchen. Alles in der README festhalten, damit er danach einen neuen Chat beginnen kann.

**Umgesetzt:** v0.13.0 (siehe Versionshistorie). Der nächste Chat beginnt mit Tobias' Test von v0.13.0; danach planen wir den weiteren Techbaum.

### 07.11.2026 – Chat 9: Feedback nach Level 6, Plan und Umsetzung v0.12.0

**Tobias:** Level 6 erreicht, die Schlosserei aber noch nicht gebaut. Ihm ist aufgefallen, dass man schon am Anfang auf das „Makro-Game“ achten muss – sonst muss man wie er am Ende noch einmal Holzfäller bauen, um eine eigene Strecke für Stäbe und Platten einzurichten und die Produktion erweitern zu können. Gefehlt hat ihm, Sachen aus dem Lager wieder zurück aufs Band zu nehmen: z. B. 120 Eisenbarren im Lager, die er zu schade findet, für 12 Gold zu verkaufen, wenn er sie in die Produktion einschleusen könnte. Idee: ein Gegenspieler zum Versandportal, der Sachen aus dem Lager auf ein Band schickt – eventuell das Zwischenlager, das man aus dem Lager befüllen kann. So dient es am Anfang als Station, die man befüllt, und lässt sich auch in den Kreislauf einbinden, um Sachen zwischenzulagern, die man viel baut (am Anfang z. B. viel Holz), damit nicht alles direkt im Versandportal landet. Sonst ist er mit der Art und Weise des Spiels sehr zufrieden.

**Claude** hat den Plan für v0.12.0 vorgestellt: Lagerhaus mit „📥 Befüllen“ (Menge wie bei der Theke), „🔁 Nachschub“ mit einstellbarem Rest im Laden-Lager („eiserner Bestand“) und „↩ Ausräumen“; Kreispfeil mit Warenbild am Lagerhaus; dazu „Strecke leeren“ und „Zulauf leeren“. Hinweis zur Balance: Versandportal plus Nachschub schickt Waren quer übers Grundstück – erst einmal ohne Bremse. Frage: Woran hing die Schlosserei?

**Tobias:** Der Plan passt so; man muss es spielen, um zu sehen, wie es läuft. Wer am Anfang mehr auf das Makro achtet und ordentlich arbeitet, kann darauf verzichten, aber es hilft, wenn man zu viel im Lager hat und gerade das Band voll bekommen will. Zur Schlosserei: Er musste Verstärkte Holzplatten bauen, aber seine Holzfarm liegt ganz oben und die Eisenfarm ganz unten. Er wollte die Produktion nicht stören und eine neue Kette für Verstärkte Holzplatten einrichten; dafür fehlten ihm die Materialien, weil er nicht genug „Materialdruck“ hatte, und dann auch das Gold für neue Rohstoffe – entweder produziert man Neues, oder man verkauft. Er muss die Mitte finden, damit zwischen Verkaufen und Produzieren immer noch ein Plus bleibt, um weiter Rohstoffe zu kaufen.

**Claudes Einordnung:** Genau dafür hilft der Nachschub: Holzplatten und Eisenstangen laufen über Versandportale ins Laden-Lager, und an einer freien Stelle holen zwei Lagerhäuser mit Nachschub sie an die Zimmerei – ohne neue Holz-Linie und ohne die beiden Farmen zu verbinden. Die Balance zwischen Verkaufen und Weiterverarbeiten nehmen wir in den Plan für die Aufgaben (v0.13.0) mit.

**Umgesetzt:** v0.12.0 (siehe Versionshistorie).

### 07.11.2026 – Chat 8, Teil 3: Test von v0.11.0 & Pause

**Tobias:** Es läuft sehr gut. Er spielt eigentlich nur in Echtzeit und muss ständig umbauen, weil ihm entweder Blöcke fehlen oder er Platten braucht, um neue Dinge zu errichten. Man muss sich zuerst auf eine Produktion konzentrieren, um dann andere angehen zu können – Umbauen, Abreißen und Neubauen sind dadurch ein wesentlicher Bestandteil des Spiels. Ein „Problem“: Schickt er beim Umbauen plötzlich Holzplatten direkt ins Lager, um Maschinen kaufen zu können, blockieren die Platten unter Umständen die Strecke für die Schalter, auf die eigentlich nur Stäbe gehören. Bisher hat er die Bänder abgerissen und neu gebaut, damit die Waren verschwinden. Verschieben und Markieren klappen hervorragend; man muss sich etwas an die Handhabung gewöhnen, aber das Grundprinzip passt. Drehen mit R klappt hervorragend. Nach über einer Stunde hatte er Level 6 noch nicht erreicht; nach 2–3 Stunden hat er gerade das erste Scharnier hergestellt. Der Flow ist sehr gut: Man kommt schnell rein, kann immer wieder produzieren und muss Holz, Stein und Eisen nachlegen, damit die Produktion weiterläuft – man spielt gut auf Fortschritt hin.

**Claude** hat vorgeschlagen: v0.11.1 mit „🧺 Strecke leeren“ am Band und „🧺 Zulauf leeren“ an blockierten Maschinen (Waren ins Laden-Lager, Bänder bleiben liegen); als Idee für später eine Weiche mit Filter.

**Tobias:** Eine gute erste Idee, aber eigentlich muss er mehr Bänder bauen, weil er vergisst, Baumaterialien extra zu sichern: Am Anfang verkauft man alles, weil man Geld braucht, später lagert man nichts mehr ein, weil man es für die Produktion braucht. Wer am Anfang strukturierter arbeitet und immer einen „eisernen Bestand“ im Lager hat, kommt nicht in Not. „Band leeren“ findet er trotzdem gut – erst einmal festhalten. Jetzt Pause: Er versucht, Level 6 zu erreichen, und gibt dann weiteres Feedback, „damit wir nicht nur für eine Kleinigkeit codieren“.

**Umgesetzt:** v0.11.1 (nur README). Der nächste Chat beginnt mit Tobias' Feedback nach Level 6.

### 07.11.2026 – Chat 8, Teil 2: Test von v0.10.2, Plan und Umsetzung v0.11.0

**Tobias:** Fabrik ist unverändert. Fläche kaufen fühlt sich richtig an, um alles besser auf Masse auszurichten. App minimieren und zurückkommen hat geklappt, alle Bilder sind noch da. Ein Anliegen noch: Das Umbauen ist umständlich geworden, weil er jedes Förderband einzeln antippen muss, um es abzureißen und neu zu bauen; genauso bei Maschinen und Portalen. Wunsch: jedes Teil auf der Fläche verschieben können und zusätzlich einen Bereich markieren, um ihn komplett zu verschieben – z. B. die Eisen-Produktion als gesamten „Prozess“ in die untere Ecke, statt jedes Band und jede Maschine einzeln.

**Claude** hat den Plan vorgestellt: Werkzeug „✥ Verschieben“ – Rechteck ziehen oder Teil antippen, dann die Gruppe verschieben (grün/rot), drehen oder abreißen; alles in der Gruppe bleibt verbunden und Waren ziehen mit um. Dazu der Tipp, dass man im Abreiß-Werkzeug schon über viele Bänder wischen kann. Fragen: Gehören halb markierte Maschinen dazu? Drehen der ganzen Gruppe gleich mit einbauen?

**Tobias:** Guter Tipp, das hatte er noch nicht gesehen. Genau so umsetzen, gerne als v0.11.0. Halb markierte Maschinen oder Teile sind ebenfalls markiert; Drehen der ganzen Gruppe gerne mit einbauen. Er spielt auf dem Galaxy Tab S9 fast immer mit angeschlossener Tastatur – deshalb soll man zusätzlich mit R drehen können, auch einzelne Gebäude und Maschinen.

**Umgesetzt:** v0.11.0 (siehe Versionshistorie).

### 07.11.2026 – Chat 8: Feedback zu v0.10.1, Plan und Umsetzung v0.10.2

**Tobias:** Die Änderungen sind sehr gut und machen jetzt viel mehr Sinn. Die Fläche ist aber immer noch ein entscheidender Faktor. Wunsch: Die Erweiterung kostet immer 500 Gold und steigt nicht, wenn man neue Fläche dazukauft, damit man am Anfang besser skalieren kann; jede Seite soll sich 2× für je 500 Gold vergrößern lassen. Besonders ab Level 4 und 5 muss man in die Massenproduktion gehen, um z. B. Schalter in guter Stückzahl herzustellen. Außerdem werden unten im Menü die Bilder der benötigten Waren nicht mehr angezeigt, dort steht z. B. nur noch „20“ und „5“. Die Aufgaben (v0.11.0) können warten; erst v0.10.2, damit das Spielgefühl noch besser wird.

**Claude** hat den Plan vorgestellt: jeder Kauf 500 Gold und 4 Reihen ab Level 1, Welt so groß, dass jede Seite genau 2 Käufe hat (38 × 30, fast viermal so viel wie zum Start, zusammen 4.000 Gold), gekaufte Fläche zählt mit, Rest-Streifen anteilig. Zu den Bildern: Vermutlich wirft der Browser die einmal beim Start gezeichneten Bilder weg, wenn die App im Hintergrund ist; Lösung: bei jedem Öffnen der Bauleiste und beim Zurückkehren neu zeichnen.

**Tobias:** 4 Reihen reichen. Wer Spaß am Spiel hat und seine Fabrik skalieren möchte, soll nicht am geringen Platz scheitern; die Einstiegshürden sollen so gering wie möglich sein. Die Bilder waren erst weg, nachdem er die App minimiert hatte, um Claude zu öffnen; davor waren sie immer da. „Passt!“

**Umgesetzt:** v0.10.2 (siehe Versionshistorie).

### 07.11.2026 – Chat 7, Teil 2: Test von v0.10.0

**Tobias:**
- **Theken:** Gemeint war, dass die Menge jeder Theke steigt – alle wachsen mit, weil die Ware stetig mitwächst. Idee: zuerst kleine Theken mit 20, dann mittlere mit 25 und große mit 30, dann bleibt es erst einmal fest.
- **Zimmerei:** gebaut und umgestellt, um zu sehen, welche Teile die anderen Produkte brauchen. Dabei sind alle Einzelteile in der Maschine „verschwunden“.
- **Fläche:** Für mehr Platz hat er Fläche gekauft, aber nur 2 Reihen für 430 Gold bekommen. Die Menge pro Kauf sollte größer werden, weil man ab Level 4 die Produktion deutlich steigern muss: mehr Holzfäller und Steinbrüche, um schneller an die Einzelteile zu kommen und die Zimmerei massenhaft zu versorgen. Im Moment dauert es etwa 5 Minuten, bis ein Stein-Zahnrad in der Zimmerei ankommt. Das ist das Feintuning, von dem er gesprochen hat: Am Anfang läuft es relativ schnell, danach wird es immer langwieriger, weil man hier und dort auf Masse gehen muss, um genug zu produzieren.
- **Laden-Lager:** Bei Massenproduktion wird es schnell voll – schon 50 von jedem Artikel auf Level 4 machen es eng. Wunsch: 1.000 Plätze.
- Die Punkte ändern und in der README festhalten; danach testet Tobias erneut und schreibt das Feedback in einen neuen Chat, bevor es mit v0.11.0 weitergeht.

**Claude:** Die Teile waren nicht verloren, sondern lagen im Laden-Lager (es gab nur eine kurze Meldung) – trotzdem verwirrend. Umgesetzt mit Claudes Lesart: Theken 20 → 25 (Level 4) → 30 (ab Level 5); Laden-Lager 1.000 ab Level 4; Flächen-Streifen ab Level 4 doppelt so tief bei gleichem Preis je Feld; Teile bleiben beim Umstellen in der Maschine, die Rezepte aller Einstellungen stehen im Infofenster.

**Umgesetzt:** v0.10.1 (siehe Versionshistorie).

### 06.11.2026 – Chat 7: Plan und Umsetzung v0.10.0 (Techbaum, Teil 2)

**Claude** hat die README gelesen und den Plan für v0.10.0 vorgestellt: 6 Maschinen (Mühlenbauer, Zimmerei, Feinwerkstatt, Feinschmiede, Getriebebauer, Schlosserei), Baukosten, Rezepttabelle, Level 4 mit Eisenerz als Geschenk, Anzeige fehlender Zutaten, Kunden kaufen teure Teile genauso oft.

**Tobias:** Die Zeiten aus dem letzten Test waren echte Zeit; nur die Eisen-Durchläufe hat er etwas schneller gemacht. Für die nächste Stufe nicht 6, sondern nur **3 Maschinen** mit 2 Eingängen und 1 Ausgang, umschaltbar wie die Maschinen davor – sonst zu viele Maschinen und zu viel Unordnung:
- Zimmerei: Handkurbel, Verstärkte Holzplatte, Schalter
- Feinschmiede: Scharnier, Kugellager, Eisenfeder
- Schlosserei: Steinkette, Schloss, Regler

Also 9 neue Produkte und 3 neue Maschinen, die Produkte lassen sich unterschiedlich skalieren; die übrigen fallen weg. Jedes Produkt braucht ein eigenes Rezept, z. B. Handkurbel 10 Holzstäbe + 5 Zahnräder und Schalter 10 Zahnräder + 5 Holzstäbe, damit alle Ressourcen etwa gleich viel beansprucht werden.

**Claude** hat den Plan überarbeitet: Rezepte im Muster 10 + 5 (Steinkette aus Steinplatten), Werte nach +20 %, Baukosten der 3 Maschinen, Level 4 Zimmerei, Level 5 Feinschmiede, Level 6 Schlosserei mit je 1 Eisenerz.

**Tobias:** Steinkette aus Steinplatten klingt schlüssig, die Level passen: So kommt man am Anfang immer ein Stück weiter und lernt alles kennen, bis man etwa bis Level 10 das „Intro“ abgeschlossen hat. Die Ansicht, welche Zutat fehlt und wie viel, ist gut. Dazu: Mit dem Aufstieg auf Level 4 eine Ladentheke mehr und bis Level 6 jedes Mal eine weitere – auf Level 6 also 5 Theken –, weil die Produkte wertvoller werden; das Volumen soll ab 20 für jede neue Theke um 5 steigen. Außerdem eine bestimmte Anzahl auf die Theke räumen können, z. B. nur 8. „Wir probieren die Werte gerne so aus.“

**Umgesetzt:** v0.10.0 (siehe Versionshistorie).

### 06.11.2026 – Chat 6, Teil 3: Test von v0.9.1

**Tobias** (zwei Screenshots: Fabrik auf Level 3 mit 936 Gold; Laden-Lager mit Waren im Wert von 6.081 Gold, u. a. 38 Holzplatten, 38 Holzstäbe, 36 Steinplatten, 27 Stein-Zahnräder, 24 Mini-Eisenplatten, 23 Eisenstangen): Mit dem alten Spielstand getestet. Etwa 45 Minuten gespielt, bis er Eisen herstellen konnte; dafür musste er ein paar Runden komplett Holz und Stein herstellen, um immer mehr Gold zu bekommen. Nach etwa 60 Minuten lief schon die zweite Runde Eisen, und er hat einiges an Gold verdient. Man muss ein wenig grinden, um voranzukommen – „genauso hab ich es mir auch vorgestellt“. Flächen hat er noch nicht gekauft, sieht sie aber als gute Erweiterung; preislich sollten sie erschwinglich sein, notfalls arbeitet man 1–2 Runden mehr mit Rohstoffen. Feedback in die README; danach neuer Chat für den Plan von v0.10.0.

**Fabrik auf dem Screenshot:** je eine Linie für Holz, Stein und Eisen – Rohstoff-Gebäude → Aufteilung auf 2 Maschinen (beide Einstellungen) → Bänder wieder zusammengeführt in 1 Versandportal; dazu ein Versandportal neben dem Holzfällerlager. Die rechte Hälfte des Grundstücks ist noch frei.

**Claudes Hinweis:** Auf den Screenshots ist der Testmodus (×10) an. Ob die Zeiten (45 und 60 Minuten) in Echtzeit gemessen sind, klären wir beim nächsten Test.

**Umgesetzt:** v0.9.2 (nur README). Der neue Chat beginnt mit dem Plan für v0.10.0 (Techbaum, Teil 2).

### 06.11.2026 – Chat 6, Teil 2: Test von v0.9.0 in Echtzeit & Startkapital

**Tobias:** In normaler Geschwindigkeit getestet und quasi pleite gegangen. Nur das Nötigste gebaut (2 Sägewerke, damit beides hergestellt werden kann), 372 Gold verdient – für einen neuen Holzstamm fehlen rund 200 Gold. Level 2 erreicht, aber noch nichts mit Stein gebaut, weil die „Produktionskosten“ ins Minus geführt haben. Vorschlag: 500 Gold Startkapital, damit nach dem Bauen genug Gold für einen zweiten Holzstamm bleibt.

**Claude:** Nachgerechnet – mit einem Holzstamm allein reicht es nie (rund 400 Gold nach den Baukosten). Plan v0.9.1: 500 Gold Startkapital, einmalige Nachzahlung für bestehende Spielstände, und eine Lücke im Pleiteschutz schließen (Felsbrocken ohne Steinbruch verhindert das Geschenk).

**Tobias:** Startkapital und Nachzahlung direkt umsetzen. Den Pleiteschutz lassen wir erstmal so, weil sich das Problem mit den 500 Gold eigentlich gelöst hat.

**Umgesetzt:** v0.9.1 (siehe Versionshistorie).

### 06.11.2026 – Chat 6: Test von v0.8.0, Plan und Umsetzung v0.9.0

**Tobias** (Screenshot der alten Fabrik: Schmelzhütte, 2 Schmieden, 2 Sägewerke, 2 Steinmetze, 9 Lagerhäuser, 8 Versandportale): v0.8.0 läuft, alles hat sich gut geändert. Er spielt erst alles mit hoher Geschwindigkeit durch, um die Logik bis weit in den Fortschritt zu prüfen, danach in Echtzeit. 2 Theken fühlen sich gut an; er hat mehr produziert als verkauft, weil die Theken im Schnellmodus oft leer standen – das Lager hat aber einen hohen Warenwert. Knifflig war, dass für neue Gebäude Blöcke fehlten, weil keine Strecke Blöcke in den Laden schickte. Mit rund 2.500 Gold konnte er Holz und Stein nachkaufen. Mit einer guten Balance der Maschinenkosten lohnt sich das Hinarbeiten auf Neues. Idee: am Anfang eher die Massenproduktion erhöhen. **Nicht die Zeit, sondern der Platz ist das Problem** – für weitere Maschinen wäre kein Platz.

**Claude:** Rund ein Drittel der Fläche ist noch frei (vor allem rechts), aber Lagerhäuser und Versandportale belegen 26 Felder; mehrere Bänder lassen sich in ein Portal zusammenführen. Vorschlag: Fläche kaufen vorziehen; Fragen zu Theken im Testmodus und zu Blöcken.

**Tobias' Antworten:**
- Theken bleiben manuell, damit er die Übersicht behält und nicht versehentlich alles verkauft.
- Erst Fläche, dann Techbaum. Dazu schon kleine Level: Level 1 nur Holz, Level 2 Stein, Level 3 Eisen. Langfristig mit Aufgaben (z. B. 50 Blöcke und 20 Holzplatten herstellen → 100 XP und 250 Gold); mit genug Erfahrung schaltet man das nächste Level frei und kauft den Aufstieg, z. B. für 100 Gold. So gibt es mehrere Handlungsstränge (produzieren, verkaufen, für Aufgaben herstellen). Für den Anfang ganz einfach: aufsteigen, sobald man z. B. 1 Holzplatte und 1 Holzstab hergestellt hat.
- Blöcke: bleibt so – Abreißen gibt die Baukosten 1 : 1 zurück, und die Produktion auf das zu verlagern, was gerade gebraucht wird, gehört zum Spielprinzip.
- Das Zusammenlegen der Bänder hatte er vergessen.

**Claude** hat den Plan für v0.9.0 vorgestellt (Abschnitt 6). **Tobias:** „Ja, leg los. Zu Beginn eines Levels sollte man immer 1× Rohstoff gratis bekommen.“

**Umgesetzt:** v0.9.0 (siehe Versionshistorie).

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
