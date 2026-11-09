# Spielkonzept mit Verlauf

> **Archiv.** Wörtlich übernommen aus der README bis v0.18.0 (Abschnitte 3 „Spielkonzept“, 4 „Waren & Rezepte“ und 8 „Offene Fragen“). Hier wird nur gesucht, nicht zu Beginn eines Chats gelesen. Verweise wie „Abschnitt 4.2“ oder „offene Frage 12“ beziehen sich auf die alte README: Abschnitte 3, 4 und 8 stehen in `KONZEPT-VERLAUF.md`, 6 in `PLAENE.md`, 7 in `ENTSCHEIDUNGEN.md`, 9 in `VERSIONEN.md`, 10 in `GESPRAECHE.md`. Den aktuellen Stand beschreiben `docs/SPIEL.md` und `docs/STAND.md`.

Hier steht, wie das Konzept entstanden ist – mit allen „seit v0.x / bis v0.y“-Hinweisen, Tobias' ursprünglichem Techbaum (4.1) und den älteren Ideen. Wie das Spiel heute ist, steht kurz in `docs/SPIEL.md`.

## Einleitung, Zusammenarbeitsregeln und Arbeitsablauf (Wortlaut bis v0.18.0)

*Seit v0.18.1 stehen Regeln und Ablauf in `CLAUDE.md`; Punkt 4 und 5 der Regeln gelten jetzt für `docs/STAND.md`, `docs/SPIEL.md` und das Archiv statt für die README.*

Ein **Aufbau- und Fabrikspiel mit Wirtschaftssimulation im Mittelalter** (Arbeitstitel offen). Man baut auf einem kleinen Grundstück seine eigene Fabrik. Rohstoffe wie Holzstämme kauft man beim Händler, verarbeitet sie zu Holzblöcken und schickt diese über Förderbänder durch Werkstätten, wo immer komplexere Waren entstehen. Das ganze Grundstück ist der eigene Laden; die Waren verkauft man dort oder auf dem Schwarzmarkt. Mit dem Gold baut man den Laden aus, schaltet neue Produktionen frei und kauft mehr Fläche. Ziel ist ein Spiel für Handy und Tablet im Querformat, später mit Clans und einem gemeinsamen Markt aller Spieler.

### 1. Zusammenarbeitsregeln

Festgelegt am 05.11.2026.

1. **Jeder Arbeitsschritt ist eine eigene Version.** So halten wir Fehler klein und können bei einem großen Bug auf eine ältere Version zurückgehen.
2. **Wir mergen immer direkt und gehen live.** Claude programmiert, Tobias schaut sich das Ergebnis an und gibt Anweisungen. Tobias schreibt keine einzige Zeile Code.
3. **Hauptgerät ist das Galaxy Tab S9** (mobil). Der PC kommt gelegentlich dazu, später eventuell mit Godot oder einer anderen Software.
4. **Diese README ist das Gedächtnis des Projekts.** Zu Beginn jedes neuen Chats liest Claude diese Datei und weiß damit, woran wir arbeiten.
5. **Zu jeder Version steht hier, was wir uns vorgenommen haben, welche Fragen wir uns gestellt haben und was wir geändert haben.**
6. **Erst planen, dann programmieren.** Bevor Code geschrieben wird, gehen wir das Vorhaben theoretisch durch.

---

### 2. Arbeitsablauf pro Version

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
- **Beet (seit v0.16.0, Tobias):** 2 × 2, ohne Anschluss ans Band. Man **sät** einen Samen (aus dem Laden-Lager; liegt keiner da, kauft „🌱 Säen“ ihn direkt beim Händler), die Pflanze wächst sichtbar in Stufen (**30 Minuten** für Flachs), dann erscheint 🌾 und man **erntet** sie – sie kommt ins Laden-Lager. Säen und Ernten sind zwei getrennte Schritte. 1 Samen = 1 Pflanze. Im Beet wächst jede Pflanze (seit v0.17.0 auch Ringelblumen; je Samen ein Knopf „🌱 Säen“). Die geerntete Pflanze legt man wie einen Holzstamm in die **Erntebank** (bis v0.16 „Flachsbreche“; seit v0.17.0 ein Gerät für alle Pflanzen, Tobias): 1 Flachspflanze → 50 Flachsfasern, 1 Ringelblume → 50 getrocknete Ringelblüten, je 10 Minuten; Vorrat 3, auch gemischt – die Pflanzen werden der Reihe nach verarbeitet, je Pflanze gibt es einen Knopf „➕ einlegen“, „⏫ Auffüllen“ füllt mit der Pflanze, die gerade läuft. Die **Webstube** macht aus je 5 Fasern 1 Verband, die **Kräuterstube** (2 Eingänge) Heilverbände und Kräuterkompressen.
- **Bauen geht sofort**, sofern man die Waren dafür hat. Es gibt keine Bauzeiten.
- **Bauleiste mit Reitern (seit v0.18.0, Tobias):** „🔨 Bauen“ öffnet die Bauleiste. **Links stehen immer** Förderband, Lagerhaus, Versandportal (kurz „Portal“), Verschieben und Abreißen. **Rechts** stehen die Gebäude des gewählten **Reiters**; die Reiter ragen oben aus der Leiste: **Holz** (Holzfällerlager, Sägewerk, Zimmerei), **Stein** (Steinbruch, Steinmetz), **Eisen** (Schmelzhütte, Schmiede, Feinschmiede, Schlosserei), **Kräuter** (Beet, Erntebank, Webstube, Kräuterstube). Die Kombi-Maschinen stehen bei dem Stoff, zu dem sie vom Namen her passen. Gesperrte Gebäude stehen im Reiter hinten mit 🔒; ist in einem Reiter noch alles gesperrt, trägt auch der Reiter ein 🔒. Der zuletzt geöffnete Reiter bleibt gemerkt. **Ganz unten bauen:** Die Karte lässt sich so weit nach oben schieben, dass auch die unterste Reihe über der Bauleiste samt Reitern liegt – vorher hielt sie am Rand an, und die unterste Fläche lag hinter der Leiste. Meldungen erscheinen über der Leiste.
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
- **Level 7 „Die Heilstube“ (seit v0.16.0):** Das Kräuter-Kapitel beginnt wieder einfach – Beet, Erntebank (damals Flachsbreche), Webstube, Leinsamen beim Händler; Aufstieg 3.000 Gold, Geschenk 1 Leinsamen, der Laden bleibt wie auf Level 6.
- **Level 8 „Der Kräutergarten“ (seit v0.17.0):** Ringelblumen im selben Beet, die Erntebank für alle Pflanzen, die Kräuterstube mit 2 Eingängen; Ringelblumensamen beim Händler; Aufstieg 4.000 Gold, Geschenk 1 Ringelblumensamen, der Laden bleibt gleich. Plan für Level 9–12 in Abschnitt 4.4.
- **Idee für später (Tobias, noch offen):** Mit Erfahrung Verbesserungen freischalten, z. B. schneller Holz verarbeiten oder schnellere Förderbänder (offene Frage 15).
- **Laden-Ausbau** geht sofort, kostet aber Gold **und** Waren, z. B. 200 Holzzahnräder + 200 Splitt + 500 Gold. So muss man ständig Neues produzieren, und das Produzieren ersetzt das Warten.
- **Fläche kaufen:** Das Grundstück wird stückweise mit Gold erweitert (seit v0.9.0 im Spiel). Seit v0.10.2 zum festen Preis (500 Gold für 4 Reihen, jede Seite 2×), damit man am Anfang gut skalieren kann und nicht am Platz scheitert (Tobias). Ob es später mehr Fläche gibt, z. B. mit Level oder Aufgaben, entscheiden wir mit den Aufgaben.
- **Freischaltpunkte (Idee, später entscheiden):** Jeder Laden-Aufstieg gibt Punkte, z. B. 10 Punkte für Level 2. Mit den Punkten schaltet man neue Werkstätten frei, etwa das Sägewerk, und kann sie danach sofort bauen.

### 3.6 Zeit

- Das Spiel läuft in Echtzeit. **Seit v0.14.0 produziert die Fabrik weiter, auch wenn das Spiel geschlossen oder die App im Hintergrund ist.**
- **Wie Clash of Clans, nur umgekehrt (Tobias):** Dort laufen die Sammler voll und man leert sie; bei uns läuft alles, bis es leer ist, und man füllt nach. Holz, Stein und Eisen legt man immer von Hand nach (bis zu 3 je Gebäude, „⏫ Auffüllen“), Lagerhäuser befüllt man von Hand, Beete sät und erntet man von Hand (seit v0.16.0: sie wachsen im Hintergrund weiter, die reife Pflanze wartet aufs Ernten, „Willkommen zurück“ nennt reife Beete); die Produktion selbst läuft automatisch weiter – vom Holzfäller über Bänder und Maschinen bis zur letzten Maschine, die nichts mehr zu tun hat.
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
| 7 | Die Heilstube | Heilerin Agnes: 5 Verbände · Agnes: 50 Flachsfasern (Wundpolster) · Torwächter Ulrich: 15 Verbände (Wachstube) · Hilde: 20 Verbände + 50 Flachsfasern (Markttag) | 850 (sammelt sich bis Level 8) | 3.000 Gold |
| 8 | Der Kräutergarten | Agnes: 50 Ringelblüten · Agnes: 5 Heilverbände · Torwächter Ulrich: 5 Kräuterkompressen (Prellungen nach dem Turnier) · Hilde: 10 Heilverbände + 20 Verbände (Spital) | 1.332 (sammelt sich bis Level 9) | 4.000 Gold |

Der Reiter „🏘️ Ort & Level“ im Level-Fenster zeigt alle Bauabschnitte mit dem, was sie freischalten. Level 7 ist seit v0.16.0 im Spiel, Level 8 seit v0.17.0; Level 9–12 folgen häppchenweise (Abschnitt 4.4).

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
| Beet (seit v0.16.0) | 2 × 2, kein Band | 1 Leinsamen → 1 Flachspflanze in 30 Minuten; säen und ernten von Hand | Level 7 |
| Erntebank (seit v0.16.0, bis v0.16 „Flachsbreche“) | 2 × 2 | 1 Flachspflanze → 50 Flachsfasern, seit v0.17.0 auch 1 Ringelblume → 50 Ringelblüten, je 10 Minuten; Vorrat 3, auch gemischt | Level 7 |
| Webstube (seit v0.16.0) | 2 × 2 | Verband (5 Flachsfasern → 1) | Level 7 |
| Kräuterstube (Kombi, seit v0.17.0) | 2 × 2, 2 Eingänge | Heilverband · Kräuterkompresse | Level 8 |
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
| Leinsamen (seit v0.16.0) | beim Händler kaufen | – | 1.000 (Kauf) |
| Flachspflanze | Beet: 1 Leinsamen | 30 min | – (nicht verkäuflich, wird eingelegt) |
| Flachsfaser | Erntebank: 1 Flachspflanze → 50 | 12 s je Faser | 25 (50 Stück = 1.250) |
| Verband | Webstube: 5 Flachsfasern → 1 | 10 s | 150 (10 Stück = 1.500) |
| Ringelblumensamen (seit v0.17.0) | beim Händler kaufen | – | 1.500 (Kauf) |
| Ringelblume | Beet: 1 Ringelblumensamen | 30 min | – (nicht verkäuflich, wird eingelegt) |
| Ringelblüte (getrocknet) | Erntebank: 1 Ringelblume → 50 | 12 s je Blüte | 36 (50 Stück = 1.800) |
| Heilverband | Kräuterstube: 1 Verband + 5 Ringelblüten | 20 s | 396 (Zutaten 330) |
| Kräuterkompresse | Kräuterstube: 10 Flachsfasern + 5 Ringelblüten | 20 s | 516 (Zutaten 430) |

**Eisenstange statt Eisennägel (v0.8.0):** Bis v0.7.1 machte die Schmiede aus 5 Barren 5 Nägel zu je 14 Gold. Tobias fiel beim Spielen auf, dass dadurch extrem viele Nägel entstehen (100–140 im Lager, von allem anderen etwa 20), und an der Theke brachten 20 Nägel nur 280 Gold. Jetzt läuft die Schmiede wie Sägewerk und Steinmetz: 5 : 1. Nägel können später als eigene Stufe zurückkommen (z. B. 1 Eisenstange → mehrere Nägel).

**Steinkette (seit v0.13.0 Gewichtstein) aus Steinplatten (v0.10.0):** Sonst bräuchte kein Kombi-Rezept die Steinplatte. So wird jedes der 6 Grundteile gebraucht; Eisen etwas mehr als Holz und Stein, weil es auch mehr bringt.

**Freischalten nach Laden-Level** (von Tobias bestätigt): Level 1 Holz, Level 2 Stein, Level 3 Eisen, Level 4 Zimmerei, Level 5 Feinschmiede, Level 6 Schlosserei (seit v0.10.0 je Level eine Kombi-Maschine). Seit v0.13.0 braucht der Aufstieg Erfahrung aus Aufträgen und kostet Gold (Abschnitt 3.5 und 3.8). Den ersten Rohstoff jeder Sorte gibt es gratis: den ersten Holzstamm zum Spielstart, den ersten Felsbrocken beim Erreichen von Level 2, das erste Eisenerz bei Level 3; ab Level 4 gibt es bei jedem Aufstieg 1 Eisenerz (einen vierten Rohstoff gibt es nicht). Seit v0.16.0: Level 7 Beet, Erntebank (damals Flachsbreche), Webstube und Leinsamen beim Händler; Geschenk 1 Leinsamen. Seit v0.17.0: Level 8 Kräuterstube und Ringelblumensamen; Geschenk 1 Ringelblumensamen.

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
| Beet (v0.16.0) | 10 Holzplatten + 10 Steinplatten | 360 Gold |
| Erntebank (v0.16.0, damals Flachsbreche) | 10 Holzplatten + 2 Zahnradwellen | 828 Gold |
| Webstube (v0.16.0) | 20 Holzstäbe + 2 Räderwerke | 1.008 Gold |
| Kräuterstube (v0.17.0) | 10 Holzplatten + 5 Eisenbleche + 2 Zahnradwellen | 1.188 Gold |

Das Sägewerk kostet nur Holzblöcke, damit die erste Maschine ohne Platten baubar ist. Für Stein braucht man Holzteile, für Eisen Steinteile, für die Kombi-Maschinen Teile aus den vorigen – so behalten frühere Waren ihren Wert. Kein Gebäude kostet mehr, als ein Rohstoff seines Levels als Teile einbringt (Holz und Stein 720 Gold, Eisen und ab Level 4: 2.880 Gold; ein Test prüft das). Eine Level-4-bis-6-Maschine kostet also höchstens etwa eine Runde Eisen. Die Gebäude von Level 7 kosten höchstens, was ein Leinsamen einbringt (1.500 Gold).

**Holzwinkel und Splitt** fliegen raus (vielleicht kommen sie später wieder). Vorhandene im Spielstand werden umgewandelt: Holzwinkel → Holzplatte, Splitt → Stein-Zahnrad.

### 4.3 Im Spiel (Stand v0.17.0)

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
| *Kräuter* 0 | Leinsamen (ab Level 7) | Händler (1.000 Gold); 1 gratis beim Aufstieg auf Level 7 | – |
| *Kräuter* 1 | Flachspflanze | Beet (säen, ernten) | 1 Leinsamen → 1 Pflanze in 30 Minuten |
| *Kräuter* 2 | Flachsfaser | Erntebank (bis zu 3 Pflanzen als Vorrat) | 1 Flachspflanze → 50 Fasern in 10 Minuten |
| *Kräuter* 3 | Verband | Webstube | 5 Flachsfasern → 1 Verband (10 Sekunden) |
| *Kräuter* 0 | Ringelblumensamen (ab Level 8) | Händler (1.500 Gold); 1 gratis beim Aufstieg auf Level 8 | – |
| *Kräuter* 1 | Ringelblume | Beet (säen, ernten) | 1 Ringelblumensamen → 1 Pflanze in 30 Minuten |
| *Kräuter* 2 | Ringelblüte (getrocknet) | Erntebank | 1 Ringelblume → 50 Blüten in 10 Minuten |
| *Kräuter* 3 | Heilverband / Kräuterkompresse | Kräuterstube (ab Level 8), Einstellungen „Heilverbände“ / „Kompressen“ | 1 Verband bzw. 10 Flachsfasern + 5 Ringelblüten (20 Sekunden) |

Genaue Rezepte und Werte: Abschnitt 4.2.

**Ideen für später:** weitere Rohstoffe wie Lehm (Ziegel), Hanf (Seile), Sand (Glas). *Größere Waren wie Fässer, Karren, Fenster passen nicht mehr (Tobias, v0.13.0: nur kleine Waren, die auf dem Band darstellbar sind).*

### 4.4 Der weitere Techbaum: das Kräuter-Kapitel (Tobias, Chat 9 bis Chat 11 – Richtung steht, Details noch offen)

**Tobias' Plan (Chat 10):** Die Level 1–6 waren ein Kapitel voller Werkzeuge. Ab Level 7 beginnt ein **zweites Kapitel mit neuer Thematik – Kräuter und Heilkunde** – und fängt wieder einfach an: Man stellt wieder ganz einfach etwas her (Flachs → Verbände) und steigert sich in der Schwierigkeit, bis man auf Level 10 (dem „Level 4“ der Kräuter) wieder mehr in die Produktion investieren muss. Auf Level 11 oder 12 schließt das Kräuter-Kapitel ab. Dann gibt es **zwei große Techbäume: Werkzeuge und Kräuter**. Ab Level 13 kommen neue Produkte, z. B. **Sand**: daraus Glas, aber über die Kräuter-Maschinen auch Sandstaub für die Zauberei – die Kapitel greifen ineinander.

| Level | Inhalt (Tobias) | Stand |
|---|---|---|
| 7 | **Flachs** (Tobias' Wahl nach Claudes Vorschlag, statt Farn oder Hanf) → **Fasern** → **Verbände** – wieder ganz einfach, als Grundlage (wie Level 1 mit Holz): Beet, Flachsbreche, Webstube | ✅ im Spiel (v0.16.0) |
| 8 | **Ringelblume** als zweite Pflanze im selben Beet; die erste Maschine mit 2 Eingängen (Kräuterstube: Verband bzw. Fasern + Ringelblüten) → **Heilverband** und **Kräuterkompresse** (wie Level 2); die Erntebank verarbeitet alle Pflanzen | ✅ im Spiel (v0.17.0) |
| 9 | eine **dritte Pflanze** (Claudes Idee: Schafgarbe, das Wundkraut des Mittelalters) und der nächste Schritt, z. B. eine zweite Verbands-Version (wie Level 3) | von Tobias erst einmal hinten angestellt (Chat 12) |
| 10 | Jetzt hat man **Fasern + 3 Pflanzen** – wie Holz, Stein und Eisen im Werkzeug-Kapitel. Wie Level 4: mehr investieren, auf Masse gehen | später |
| 11–12 | die Pflanzen **weiter kombinieren** (wie Level 5–6), Abschluss des Kräuter-Kapitels | später |
| 13+ | neues Kapitel, z. B. Sand → Glas, mit den Kräuter-Maschinen Sandstaub für die Zauberei | später |
| ~15 | **Alchemist** und Zaubertränke (Mörser → Pulver → Tränke) – Tobias möchte damit noch warten. Die getrockneten Blüten der Kräuter (ab Level 8) sind dann die Grundlage für den Mörser, z. B. Ringelblumenstaub (Tobias, Chat 11) | später |

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

**Chat 11, Teil 3 (Test von v0.16.0 und Antworten zu Level 8):**

- **Ein Gerät für alle Pflanzen (Tobias):** Die Flachsbreche verarbeitet auch die Ringelblume – 1 Pflanze → 50 getrocknete Ringelblüten, genau wie Flachs → 50 Fasern. „Bei den Pflanzen können wir es etwas einfacher halten.“ Weil sie dann für alle Pflanzen ist, schlug Claude den Namen **Erntebank** vor – Tobias: „Meiner Meinung nach der bessere Name.“
- **Die Rechnung passt (Tobias):** „Dauert lange, aber bringt auch gutes Geld.“ Alles im gleichen Takt (30 Minuten).
- **Gebäude überwiegend aus Werkzeug-Waren (Tobias):** Es ergibt keinen Sinn, dass aus Verbänden und Zahnradwellen eine Maschine wird. Baukosten der Kräuter-Gebäude kommen deshalb aus Holz, Stein und Eisen.
- **Kräuterkompresse:** Tobias findet sie gut. Wofür (Claudes Erklärung): Der Verband kommt auf Wunden, die Kompresse – ein Polster aus Fasern mit getrockneten Kräutern – auf Prellungen und Schwellungen. Später (Level 10–12) kann sie mit dem Heilverband zu etwas Größerem kombiniert werden.
- **Mörser später (Tobias):** Die verschiedenen Blüten dienen später als Grundlage für einen Mörser, z. B. für Ringelblumenstaub.
- Preise, Namen und Aufträge passen (Tobias).

**Chat 12 und 13 (Test von v0.17.0, 09.11.2026):**

- **Das meiste hat funktioniert.** Alles testen konnte Tobias nicht, weil er seine komplette Fabrik neu gebaut hat: Er hatte zu wenig Grundrohstoffe, um alle Maschinen zu versorgen – „ein wichtiges Learning“.
- **Die Ringelblume** ist im Beet gut zu erkennen.
- **Erntebank:** Weil sie wie das Holzfällerlager funktioniert, baut Tobias lieber **zwei Erntebänke** und legt Flachs und Ringelblumen getrennt ein, damit er die Straßen besser steuern kann (so war es im Plan auch gedacht).
- **Kräuterstube mit zwei Eingängen** ergibt Sinn, ist aber noch nicht getestet.
- **Die dritte Pflanze (Level 9) stellt Tobias erst einmal hinten an.**

**Ältere Ideen (Chat 9):**

- **Kräuter anbauen:** Kräuter anpflanzen; nach einer bestimmten Zeit wächst die fertige Pflanze, die man ernten kann.
- **Mörser:** Pflanzen durch einen Mörser schicken (Kräutermixtur).
- **Verbände:** Aus Farn oder Hanf werden Verbände; Verband + Kräutermixtur = Heilender Verband.
- **Tränke:** Kräuter mit Kohle und anderen Dingen mischen – erste Produkte in Richtung Lebenstrank, Manatrank, Alterstrank und Ähnliches.
- **Leitlinien (Tobias):** nur kleine Waren; aus zwei Produkten entsteht immer das nächstmögliche, sinnvolle Produkt; die neuen Level erzählen die Geschichte des Ortes weiter (z. B. eine Heilerin oder Kräuterkundige als neue Bewohnerin – Claudes Idee).

## 8. Offene Fragen

Stand 09.11.2026 (nach v0.18.0).

1. **Nächstes Feedback:** Tobias testet v0.18.0 (Bauleiste mit Reitern) und baut seine neue Fabrik weiter; dabei probiert er die Kräuterstube aus. v0.17.0 ist zum großen Teil getestet (das meiste funktioniert, die Ringelblume ist gut zu sehen, zwei Erntebänke statt gemischtem Vorrat). Level 9 hat Tobias hinten angestellt – was als Nächstes kommt, besprechen wir nach dem Test. **Tobias' Learning (Chat 12):** zu wenig Grundrohstoffe für alle Maschinen; er arbeitet jetzt mit einer eigenen Straße je Zwischenprodukt und Lagerhäusern als Zwischenlager, weil er bei zusammengeführten Bändern mit zwei Produkten keine Kontrolle mehr hat, was an der Maschine ankommt. Das ist gewollt (Makro-Spiel, offene Frage 13); die Weiche mit Filter (offene Frage 12) könnte später helfen. v0.16.0 ist getestet (Beet gut sichtbar, Ernten und Säen fühlen sich gut an, Fasern → Verbände klappt, Aufträge gut). v0.14.0 ist getestet (Spiel im Hintergrund klappt, 3 Rohstoffe reichen, die neuen Warenbilder erkennt Tobias und sie gefallen); das Lagerhaus ohne Nachschub hat Tobias nicht erwähnt. Weiter offen: Passen Baukosten, Mengen (10 + 5) und Werte der Kombi-Teile? Kunden kaufen sie genauso oft wie einfache Teile – dadurch bringt eine Theke mit Vorhängeschlössern sehr viel Gold.
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
18. **Kräuter-Kapitel (Abschnitt 4.4):** Geklärt (Chat 11): 1 Samen = 1 Pflanze, etwa 30 Minuten Wachszeit, ernten, kein Band am Beet, jede Pflanze im selben Beet, 1 Pflanze → 50 Fasern → 10 Verbände, Preise etwa 1.000 (Samen) und 150 (Verband). Geklärt (Chat 11, Teil 2): Pflanze einlegen wie einen Holzstamm, Ernten und Säen getrennt, Beet 2 × 2, die Maschine mit 2 Eingängen erst auf Level 8. Level 7 ist seit v0.16.0 im Spiel. Getestet (v0.16.0): passt. Level 8 geklärt (Chat 11, Teil 3; Plan in Abschnitt 6): Ringelblume in die gleiche Maschine wie Flachs, Kräuterstube mit Heilverband und Kräuterkompresse, gleicher Takt, Baukosten aus Werkzeug-Waren. Level 8 ist seit v0.17.0 im Spiel, die Flachsbreche heißt Erntebank (Tobias). Getestet (Chat 12): Ringelblume gut zu sehen; Tobias baut lieber zwei Erntebänke statt gemischt einzulegen. Offen: die zwei Eingänge der Kräuterstube (noch nicht getestet). Später – von Tobias hinten angestellt: Level 9 (dritte Pflanze, Claudes Idee: Schafgarbe), Level 10–12 (wofür die Kräuterkompresse dort gebraucht wird), Mörser (~Level 15).
19. **Test-Knopf (seit v0.15.0):** Vor v1.0 entfernen (`QUEST_TEST_SKIP = false` in `data/levels.js`). Zählt die übersprungene Erfahrung auch für spätere Verbesserungen mit Erfahrung (Frage 15)? Im Moment ja (`xpTotal`).
20. **Bauleiste (seit v0.18.0 mit Reitern):** Tobias' ursprünglicher Punkt war auch, dass man „nicht direkt checkt, was welche Maschinen machen“. Die Reiter ordnen die Gebäude nach Straße; reicht das, oder sollen die Gebäude in der Bauleiste zusätzlich ihre Waren als kleine Bilder zeigen (z. B. Sägewerk → Holzplatte, Holzstab)? Passt der Name „Kräuter“ (oder lieber „Pflanzen“)?
21. **Laden-Lager über der Grenze:** Abreißen gibt Waren auch über die Lagergrenze zurück (Tobias hatte 1.500 bei 1.000 Plätzen). Solange das Lager zu voll ist, nimmt das Versandportal nichts an. Für Tobias in Ordnung („durch neues Bauen direkt wieder unter 1.000“); beobachten.
