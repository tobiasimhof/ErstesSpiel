# Das Spiel

> Beschreibt, wie das Spiel **jetzt** ist (Stand v0.26.0). Bei jeder Änderung wird der Text hier **ersetzt**, nicht ergänzt; wie es dazu kam, steht im Archiv (`docs/archiv/`). Alle Zahlen sind Platzhalter – maßgeblich sind die Datentabellen in `src/core/data/`.

## 1. Idee

- **Aufbau- und Fabrikspiel mit Wirtschaftssimulation im Mittelalter** (Arbeitstitel offen). Man baut auf einem Grundstück eine Fabrik: Rohstoffe kaufen, über Förderbänder durch Werkstätten zu immer komplexeren Waren verarbeiten, im eigenen Laden verkaufen und mit dem Gold ausbauen.
- **Schwerpunkt: die optimale Fabrik bauen.** Die Wirtschaft gibt vor, was sich gerade lohnt. Leitidee (Tobias): Was gebraucht wird, ändert sich mit dem Level – man baut eine Produktion zurück und eine andere aus. Umbauen, Abreißen und Neubauen sind ein wesentlicher Teil des Spiels.
- **Makro-Spiel:** Man muss früh planen – genug Grundrohstoffe, ein Grundvorrat an Baumaterial, eigene Straßen je Zwischenprodukt, Lagerhäuser als Zwischenlager. Werden zwei Bänder mit verschiedenen Waren zusammengeführt, ist nicht mehr steuerbar, was an der Maschine ankommt.
- **Gold ist bewusst knapp** (Tobias): Man kann nicht alles auf einmal bauen und auffüllen; das Gleichgewicht zwischen Gold verdienen und Rohstoffe nachkaufen gehört zum Spiel. Wer mehr verdienen will, muss teurere Waren anbieten. So gibt es mehrere Spielstile – z. B. auf Masse gehen oder sich auf teure Waren konzentrieren. **Der Schwerpunkt liegt auf der Massenproduktion** (Tobias, Chat 17): Prozesse optimieren und automatisieren, immer längere Straßen bauen, um Werkzeuge herzustellen und zu verkaufen; Gold gehört zum Spiel, steht aber nicht im Mittelpunkt.
- **Roter Faden:** Der Laden liegt in einem kleinen Ort am Fluss, der wächst. Jedes Level ist ein Bauabschnitt, die Bewohner geben Aufträge.
- **Kapitel:** Werkzeuge (Level 1–6: Holz, Stein, Eisen) und Kräuter (ab Level 7: Flachs, Ringelblume); ab Level 9 wachsen die Werkzeuge weiter (Holzkohle, Schreibstube), später kommen Tränke dazu. Die Level wechseln sich ab (Werkzeuge 9 und 11, Kräuter 10 und 12), die Aufträge verlangen Waren aus beiden Bereichen. Jedes Kapitel fängt einfach an und steigert sich; später greifen die Kapitel ineinander.
- **Kleine Waren:** Alles auf dem Band ist auch im echten Leben klein (keine Türen, Truhen, Tore). Jedes Produkt entsteht logisch aus seinen Zutaten – aus zwei Produkten das nächstmögliche, sinnvolle.
- **Plattform:** Browser-Spiel für Tablet und Handy, **nur Querformat**, alles per Touch. Hauptgerät ist Tobias' Galaxy Tab S9, oft mit angeschlossener Tastatur. Später als App. Vorerst nur Deutsch. Draufsicht mit Platzhalter-Grafik (farbige Blöcke, Emojis, gezeichnete Warenbilder).
- **Vorbilder nur für Mechaniken** – eigene Namen, Rezepte und Grafik: Alchemy Factory (kleine Fabrik mit Bändern), Clash of Clans (Hauptgebäude-Level, regelmäßig reinschauen, Clans), Hay Day (Handel zwischen Spielern).
- **Geschäftsmodell (später):** kostenlos; Season Pass und Skins, kein Pay2Win.

## 2. Kernschleife und Zeit

Rohstoff kaufen → ins Gebäude legen → über Bänder und Maschinen verarbeiten → Versandportal → Laden-Lager → Theken → Kunden zahlen Gold → neue Rohstoffe, Fläche, Aufstieg. Waren sind zugleich Baumaterial: verkaufen oder damit bauen?

- **Echtzeit.** Die Fabrik läuft auch bei geschlossenem Spiel weiter, **bis etwas leer ist**: Rohstoff-Gebäude, bis ihr Vorrat verarbeitet ist; Maschinen, bis Zutaten fehlen; Lagerhäuser, bis sie leer sind; das Versandportal, bis das Laden-Lager voll ist; Kunden, bis die Theken leer sind; Beete wachsen, bis sie reif sind. Nachlegen ist immer Handarbeit („wie Clash of Clans, nur umgekehrt“, Tobias).
- **Zurückkommen:** Die verpasste Zeit wird nachgerechnet. Nach mehr als 1 Minute kurze Meldung, nach mehr als 10 Minuten das Fenster „👋 Willkommen zurück!“ (wie lange weg, Verkäufe, was ins Laden-Lager kam, was leer gelaufen ist, reife Beete, Laden-Lager voll, Theken leer).
- **Menü ☰:** Spielstand sichern und laden, Testmodus (Zeit ×10, ein Testpaket mit Waren und oben die Anzeige „🎞️ … Bilder/s“, wie flüssig das Spiel läuft), Neues Spiel. Oben: Gold, Knopf „Laden-Level“, Vollbild, Versionsnummer.
- **Spielstand sichern und laden:** „💾 Spielstand sichern“ legt eine kleine Datei an („Fabrik Level 8 - 11.11.2026 21-45.txt“) – in „Downloads“ oder über „📤 Teilen …“ (WhatsApp, E-Mail, Drive), wo das Gerät es kann. „📂 Spielstand laden“: Datei wählen → Vorschau (Level, Gold, Gebäude, wann gesichert) → „Laden“ (oder „💾 Jetzigen erst sichern“). Danach holt die Fabrik die Zeit seit dem Sichern nach, wie beim Zurückkommen („📂 Spielstand geladen – Seit dem Sichern sind … vergangen“). Falsche Dateien werden abgelehnt, das Spiel bleibt dann, wie es ist. „🔄 Neues Spiel“ bietet zuerst „💾 Erst sichern“ an. So können Tester auch auf Tobias' Tablet spielen: sichern → neues Spiel → Tester spielt → laden.

## 3. Die Fabrik

**Grundstück:** Raster aus Feldern, Start 22 × 14. An jeder Seite steht ein Schild: Ein Streifen Fläche (4 Reihen über die ganze Seite) kostet 170 Gold, jede Seite lässt sich 2× erweitern → höchstens 38 × 30 Felder (zusammen 1.360 Gold). Zum Start stehen ein Holzfällerlager und ein Versandportal darauf.

**Förderbänder** (1 × 1, 1 Holzblock je Feld) transportieren Waren Stück für Stück.
- **Aufteilen:** von einem bestehenden Band aus ziehen (bis zu 3 Richtungen je Feld; Abzweige verteilen abwechselnd). **Zusammenführen:** auf ein bestehendes Band ziehen.
- **Stau:** Ist ein Band voll, steht alles davor still – nichts geht verloren.
- **Leeren:** Band antippen → „🧺 Strecke leeren“ (alle Waren der zusammenhängenden Strecke ins Laden-Lager, die Bänder bleiben). Maschine mit gestautem Eingang (rotes Licht) → „🧺 Zulauf leeren“ (leert die Zuleitung mit der falschen Ware, sonst alle gestauten).

**Anschlüsse und Licht:** Pfeile am Gebäude – blau = Eingang, orange = Ausgang. Maschinen (2 × 2): Eingang links oben, Ausgang rechts oben. Kombi-Maschinen: zwei Eingänge links oben und links unten, jeder nimmt jede passende Zutat (am sichersten jede Zutat über ihren eigenen Eingang). Statuslicht: grün = arbeitet, gelb = wartet, rot = blockiert.

**Auf der Karte** zeigt jede Maschine groß auf einer hellen Scheibe, was sie herstellt (das Warenbild vom Band); ein gelber Ring um die Scheibe zeigt, wie weit das laufende Stück ist. Rohstoff-Gebäude zeigen ihre Ware (leer = blass, die Erntebank die Ware der laufenden Pflanze); ihr Ring ist **grün** und zeigt, wie viel vom laufenden Rohstoff noch übrig ist – er wird deshalb nur langsam kürzer (ein Holzstamm reicht 15 Minuten), so sieht man, wann das Gebäude leer ist. Gelb = Fertigung (Maschine), grün = bis der Rohstoff leer ist. Oben rechts das Statuslicht, oben links die Punkte für den Rohstoff-Vorrat oder – wenn eine Kombi-Maschine wartet – ein gelbes Schild „?“ mit den fehlenden Zutaten; unten der Name. Lagerhäuser zeigen die Waren ihrer Fächer (leer: 📦), Beet und Versandportal ihr eigenes Bild. Jeder Reiter hat seine Farbe: Holz braun, Stein steingrau, Eisen stahlblau, Erde grün, Werkstatt ziegelrot; Lagerhaus sandfarben, Versandportal lila. Ein Gebäudebild gibt es auf der Karte nicht mehr (eigene Gebäudegrafik kommt später, M4).

**Rohstoff-Gebäude** (Holzfällerlager, Steinbruch, Schmelzhütte, Kohlenmeiler, Erntebank): Rohstoff einlegen → 200 Blöcke bzw. Barren in 15 Minuten (Kohlenmeiler: 1 Holzstamm → 100 Holzkohle in 15 Minuten; Erntebank: 1 Pflanze → 50 Fasern bzw. Blüten in 10 Minuten). **Vorrat bis 3**, der Reihe nach verarbeitet; drei Punkte am Gebäude zeigen ihn. „⏫ Auffüllen“ füllt bis zum Rand: erst aus dem Laden-Lager, was fehlt, kauft es beim Händler (Erntebank nur aus dem Laden-Lager). Die **Erntebank** nimmt jede Pflanze, auch gemischt; je Pflanze ein Knopf „➕ … einlegen“, Auffüllen nimmt die Pflanze, die gerade läuft. Tobias baut lieber zwei Erntebänke und legt getrennt ein, damit die Straßen steuerbar bleiben.

**Maschinen** verarbeiten nach Rezept (Grundmaschinen 2 Einstellungen, Kombi-Maschinen 2–3, Webstube 1). Beim Umstellen bleiben alle Teile in der Maschine; „↩ Reste ins Laden-Lager“ holt ungebrauchte heraus.

**Infofenster** (Gebäude antippen): oben Name und Statuslicht mit kurzem Text. Bei Maschinen ein grüner Kasten **„Stellt gerade her“** mit den Warenbildern vom Band – jede Zutat mit „hat / braucht“ (fehlend rot, vollständig grün mit Haken) → Ergebnis, darunter was noch fehlt, Zeit je Stück und Wert. Darunter **„Umstellen auf“**: jede andere Einstellung als Knopf mit ihrem Rezept in Bildern und ihrem Wert; Antippen stellt um. Bei Rohstoff-Gebäuden zeigt der Kasten Rohstoff → Waren (Zeit, leer in etwa …), darunter den Vorrat als Bilder (leere Plätze blass) und was im Laden-Lager liegt; „⏫ Auffüllen“ groß, „➕ 1 einlegen“ und „🧺 Kaufen“ kleiner. Beim **Beet** zeigt der Kasten Samen → Pflanze („Wächst hier“, „Wächst gerade“ mit Balken und „reif in etwa …“, „Reif zum Ernten“), darunter die Samen im Laden-Lager. Beim **Lagerhaus** steht jedes der 3 Fächer als Zeile mit Warenbild, Menge („42 / 50“) und Füllbalken (volles Fach orange), oben die Summe („91 / 150“). Beim **Versandportal** stehen die zuletzt angekommenen Waren (bis 3) → Laden-Lager mit Füllstand (roter Balken und Hinweis, wenn es voll ist) und wie viele Waren es bisher verschickt hat. Unten bei allen Gebäuden klein „↔ Verschieben“, „↻ Drehen“, „🗑 Abreißen“ und ein kurzer Tipp.

**Beet** (2 × 2, kein Band): „Säen“ (je Samensorte ein großer Knopf mit dem Bild des Samens; der Samen kommt aus dem Laden-Lager, sonst kauft der Knopf einen beim Händler) → die Pflanze wächst sichtbar **30 Minuten** → 🌾 reif → „🌾 Ernten“ legt sie ins Laden-Lager. Säen und Ernten sind getrennte Schritte, 1 Samen = 1 Pflanze. Ernten geht nicht bei vollem Laden-Lager. Wird ein Beet reif, erscheint eine Meldung. Abreißen: Samen und reife Pflanze kommen zurück, eine halb gewachsene geht verloren (mit Rückfrage).

**Lagerhaus** (2 × 1): das Zwischenlager in der Fabrik. Eingang oben links, Ausgang unten rechts, 3 Fächer × 50 (je Fach eine Ware). Puffer – was hineinläuft, läuft weiter, sobald am Ausgang Platz ist; Fach 1 geht zuerst hinaus. Infofenster: „📥 Befüllen“ aus dem Laden-Lager (Ware wählen, Menge wie an der Theke, bis 150) und „↩ Ausräumen ins Laden-Lager“. Nur von Hand, kein automatischer Nachschub. Rohstoffe kommen nicht hinein. Was im Lagerhaus liegt, zählt nicht zum Laden-Lager, und Ausräumen darf das Laden-Lager überfüllen – Lagerhäuser sind also auch ein Zusatzlager. Tobias lagert so um: Läuft ein Lagerhaus voll, räumt er es aus und befüllt damit das Lagerhaus einer anderen Straße.

**Versandportal** (1 × 1, ein Eingang, dreht mit): der Ausgang der Fabrik – schickt alles von selbst ins Laden-Lager, ohne Mengengrenze, auch im Hintergrund; nimmt nichts an, solange das Laden-Lager voll ist. Das Gegenstück zum Lagerhaus (Portal: Band → Laden-Lager; Lagerhaus: Laden-Lager → Band).

**Bauen und Umbauen**
- **Bauen geht sofort** und kostet **Waren** aus dem Laden-Lager (Tabelle in Abschnitt 6), kein Gold. Abreißen gibt die bezahlten Waren zurück – auch über die Grenze des Laden-Lagers (die Startgebäude geben nichts zurück). Verschieben und Drehen kosten nichts.
- **Bauleiste** („🔨 Bauen“ unten rechts): links immer Förderband, Lagerhaus, Portal (Versandportal), Verschieben, Abreißen; rechts die Gebäude des gewählten **Reiters Holz, Stein, Eisen, Erde oder Werkstatt** (Erde: die Gebäude des Kräuter-Kapitels; Werkstatt: die Werkzeug-Maschinen ab Level 9) (die Reiter ragen oben aus der Leiste). Höchstens 4 Gebäude je Reiter, damit sie auch auf dem Handy nebeneinander passen. Gesperrte Gebäude stehen hinten mit „🔒 Level …“, ein ganz gesperrter Reiter zeigt ein 🔒 statt seines Warenbilds. Was die Waren nicht hergeben, ist ausgegraut und sagt beim Antippen, was fehlt. Der zuletzt geöffnete Reiter bleibt gemerkt. Die Karte lässt sich unten so weit schieben, dass die unterste Reihe über der Leiste liegt.
- **Platzieren:** Vorschau (grün/rot) mit dem Finger schieben, „↻ Drehen“, „✓ Bauen“. **Taste R** dreht die Vorschau, sonst das angetippte Gebäude oder Band.
- **„✥ Verschieben“:** Bereich markieren (Rechteck ziehen oder ein Teil antippen; halb erfasste Gebäude gehören dazu) → alles auf einmal verschieben, um 90° drehen oder abreißen. In der Gruppe bleibt alles verbunden, Waren ziehen mit. Ein Finger markiert, zwei Finger bewegen die Karte.
- **„🧹 Abreißen“:** antippen oder mit dem Finger über viele Bänder wischen.

## 4. Wirtschaft

- **Feste Preise** in einem Maßstab, der zum Mittelalter passt (Tobias): Ein Holzblock kostet 1 Gold, ein Zirkel 662. Regel: Blöcke bringen etwa 9 % mehr, als der Rohstoff kostet; jede weitere Stufe rund 20 % mehr als ihre Zutaten – so macht man beim Verkaufen nie Minus. Holz und Stein kosten und bringen gleich viel, Eisen viermal so viel. Ein Test prüft die Stufen.
- **Laden** (Knopf „⚖️ Laden“ unten links) mit den Reitern **Lager, Theken, Händler**:
  - **Laden-Lager:** 500 Plätze bis Level 3, 1.000 ab Level 4. Gefüllt über Versandportale, Ernten und Abreißen.
  - **Theken** bestückt man von Hand mit genau eingestellter Menge (0, −5, −1, +1, +5, Alle). Jede Theke fasst Level 1–3 20 Stück, Level 4 25, ab Level 5 30.
  - **Theken kaufen:** Jeder Laden hat 2 Theken; Aufstiege bringen keine dazu. Weitere kauft man im Reiter „Theken“ nur mit Gold, ohne Mindest-Level und nach einer Rückfrage: Theke 3 15.000, Theke 4 35.000, Theke 5 70.000 Gold. Eine 6. Theke kommt viel später (Preis offen). Die Ansicht zeigt immer 6 Plätze: die gekauften Theken, die nächste zum Kaufen (reicht das Gold nicht: „Dir fehlen noch …“), die späteren ausgegraut, die 6. mit „🔒 Kommt später im Spiel“.
  - **Kunden:** Jede Theke hat ihre eigenen Kunden. Jeder kauft 1 Stück zum festen Wert (teure Teile genauso oft wie einfache). Je Theke kommt auf Level 1–3 alle 15–25 Sekunden einer (3 Stück pro Minute), auf Level 4–6 alle 25–45 Sekunden (etwa 1,7), ab Level 7 alle 45–60 Sekunden (etwa 1,1) – so verkauft der Laden am Anfang schnell, später langsamer. Eine leere Theke verkauft nichts; jede gekaufte Theke legt ihren Anteil drauf (Level 8 mit 4 Theken: etwa 274 Stück pro Stunde). Mehr Gold bringen also mehr Theken oder teurere Waren. Jede Theke zeigt, wann ihr nächster Kunde kommt; „Letzte Verkäufe“ zeigt die letzten 5 mit ihrer Theke.
  - **Händler:** nur Rohstoffe und Samen kaufen. Verkauft wird nur über die Theken.
- **Start:** 170 Gold, 1 Holzstamm, 20 Holzblöcke.
- **Pleiteschutz:** Wer weniger Gold hat, als ein Holzstamm kostet, keinen Rohstoff im Lager oder in Arbeit hat und dessen Waren zusammen weniger wert sind als ein Holzstamm, bekommt einen Holzstamm geschenkt.

## 5. Fortschritt: Laden-Level und Aufträge

- **Level-Fenster** (oben auf „Laden-Level“ tippen) mit den Reitern „📜 Aufträge“ und „🏘️ Ort & Level“. Es gibt immer **genau einen Auftrag** eines Bewohners; „✓ Abgeben“ nimmt die Waren aus dem Laden-Lager und gibt **Erfahrung** (3 je 10 Gold Warenwert) und **Gold** (so viel, wie die Waren an der Theke bringen). 2–5 Aufträge je Level, nicht überspringbar. Die Erfahrung aller Aufträge eines Levels reicht genau für den Aufstieg; **der Aufstieg kostet Gold**. Erfahrung schaltet frei, Gold kauft das Level, Waren bauen die Maschinen. Am Knopf zeigt ❗ einen abgebbaren Auftrag, ⬆ einen möglichen Aufstieg.
- **„🧪 Test: Auftrag erledigen“** (im Prototyp immer sichtbar, lila gestrichelt): gibt die Erfahrung, nimmt keine Waren, gibt kein Gold. Vor v1.0 entfernen (`QUEST_TEST_SKIP` in `data/levels.js`).
- Beim Aufstieg gibt es einen Rohstoff gratis.

| Level | Bauabschnitt | Neu | Aufträge (der Reihe nach) | Erfahrung | Aufstieg kostet | Geschenk |
|---|---|---|---|---|---|---|
| 1 | Die ersten Hütten | Holzfällerlager, Sägewerk, Lagerhaus, Versandportal, Förderband; Holzstamm | Zimmermann Jakob: 5 Holzplatten · Jakob: 10 Holzstäbe · Bürgermeisterin Hilde: 20 Holzstäbe + 10 Holzplatten | 81 | – (Start) | 1 Holzstamm (Start) |
| 2 | Wege und Brunnen | Steinbruch, Steinmetz; Felsbrocken | Steinmetzin Berta: 10 Steinplatten · Berta: 10 Stein-Zahnräder · Hilde: 20 Steinplatten + 10 Holzstäbe | 90 | 30 | 1 Felsbrocken |
| 3 | Die Dorfschmiede | Schmelzhütte, Schmiede; Eisenerz | Schmied Konrad: 5 Eisenstangen · Konrad: 5 Eisenbleche · Hilde: 10 Eisenstangen + 10 Holzplatten | 162 | 80 | 1 Eisenerz |
| 4 | Die Mühle am Fluss | Zimmerei | Müllerin Grete: 2 Zahnradwellen · Grete: 4 Räderwerke · Grete: 2 Verstärkte Holzplatten · Hilde: 8 Räderwerke + 4 Zahnradwellen | 714 | 170 | 1 Eisenerz |
| 5 | Der Markt | Feinschmiede | Händlerin Marta: 2 Scharniere · Marta: 2 Schlüssel · Baumeister Anton: 1 Zirkel · Marta: 3 Scharniere + 3 Schlüssel | 1.495 | 330 | 1 Eisenerz |
| 6 | Das Stadttor | Schlosserei | Torwächter Ulrich: 4 Gewichtsteine · Ulrich: 2 Vorhängeschlösser · Hilde: 2 Uhrwerke · Ulrich: 4 Vorhängeschlösser + 4 Gewichtsteine | 1.840 | 670 | 1 Eisenerz |
| 7 | Die Heilstube | Beet, Erntebank, Webstube; Leinsamen | Heilerin Agnes: 5 Verbände · Agnes: 50 Flachsfasern · Ulrich: 15 Verbände · Hilde: 20 Verbände + 50 Flachsfasern | 816 | 1.000 | 1 Leinsamen |
| 8 | Der Kräutergarten | Kräuterstube; Ringelblumensamen | Agnes: 50 Ringelblüten · Agnes: 5 Heilverbände · Ulrich: 5 Kräuterkompressen · Hilde: 10 Heilverbände + 20 Verbände | 1.305 | 1.330 | 1 Ringelblumensamen |
| 9 | Die Schreibstube | Kohlenmeiler, Schreibstube (Reiter „Werkstatt“) | Schmied Konrad: 50 Holzkohle · Baumeister Anton: 3 Zeichenbretter · Anton: 2 Reißzeuge · Hilde: 4 Zeichenbretter + 10 Heilverbände | 1.657 (sammelt sich, bis es Level 10 gibt) | 1.670 | 1 Holzstamm |

„Erfahrung“ = was die Aufträge des Levels zusammen geben (genau so viel braucht der nächste Aufstieg). Ab Level 4 sind die Stückzahlen so gewählt, dass man auf Masse gehen muss; das Kräuter-Kapitel (Level 7) fängt wieder einfach an.

## 6. Gebäude

| Gebäude | Reiter | Größe | Was es tut | ab Level | Baukosten |
|---|---|---|---|---|---|
| 🪓 Holzfällerlager | Holz | 2 × 2 | 1 Holzstamm → 200 Holzblöcke (15 min), Vorrat 3 | 1 | 10 Holzplatten + 10 Holzstäbe |
| 🪚 Sägewerk | Holz | 2 × 2 | „Platten“ oder „Stäbe“: 5 Holzblöcke → 1 Holzplatte bzw. Holzstab | 1 | 40 Holzblöcke |
| 🛠️ Zimmerei | Holz | 2 × 2, 2 Eingänge | Zahnradwelle · Räderwerk · Verstärkte Holzplatte | 4 | 20 Holzplatten + 10 Eisenstangen |
| ⛏️ Steinbruch | Stein | 2 × 2 | 1 Felsbrocken → 200 Steinblöcke (15 min), Vorrat 3 | 2 | 10 Holzplatten + 5 Holzstäbe |
| ⚒️ Steinmetz | Stein | 2 × 2 | „Platten“ oder „Zahnräder“: 5 Steinblöcke → 1 | 2 | 30 Steinblöcke + 5 Holzstäbe |
| 🔥 Schmelzhütte | Eisen | 2 × 2 | 1 Eisenerz → 200 Eisenbarren (15 min), Vorrat 3 | 3 | 20 Steinplatten + 10 Holzplatten |
| 🔨 Schmiede | Eisen | 2 × 2 | „Bleche“ oder „Stangen“: 5 Eisenbarren → 1 | 3 | 10 Steinplatten + 30 Eisenbarren |
| ⚙️ Feinschmiede | Eisen | 2 × 2, 2 Eingänge | Scharnier · Schlüssel · Zirkel | 5 | 10 Eisenbleche + 2 Räderwerke |
| 🔐 Schlosserei | Eisen | 2 × 2, 2 Eingänge | Gewichtstein · Uhrwerk · Vorhängeschloss | 6 | 1 Scharnier + 2 Verstärkte Holzplatten |
| 🌱 Beet | Erde | 2 × 2, kein Band | 1 Samen → 1 Pflanze (30 min), säen und ernten von Hand | 7 | 10 Holzplatten + 10 Steinplatten |
| 🪢 Erntebank | Erde | 2 × 2 | 1 Pflanze → 50 Flachsfasern bzw. Ringelblüten (10 min), Vorrat 3, auch gemischt | 7 | 10 Holzplatten + 2 Zahnradwellen |
| 🧵 Webstube | Erde | 2 × 2 | 5 Flachsfasern → 1 Verband | 7 | 20 Holzstäbe + 2 Räderwerke |
| 🌿 Kräuterstube | Erde | 2 × 2, 2 Eingänge | „Heilverbände“ · „Kompressen“ | 8 | 10 Holzplatten + 5 Eisenbleche + 2 Zahnradwellen |
| ♨️ Kohlenmeiler | Holz | 2 × 2 | 1 Holzstamm → 100 Holzkohle (15 min), Vorrat 3 | 9 | 20 Steinplatten + 2 Verstärkte Holzplatten |
| 📐 Schreibstube | Werkstatt | 2 × 2, 2 Eingänge | „Zeichenbretter“ · „Reißzeuge“ | 9 | 1 Verstärkte Holzplatte + 1 Zirkel |
| 📦 Lagerhaus | immer sichtbar | 2 × 1 | Zwischenlager 3 × 50, von Hand befüllen | 1 | 8 Holzplatten |
| 🌀 Versandportal | immer sichtbar | 1 × 1 | schickt Waren ins Laden-Lager | 1 | 10 Holzblöcke |
| ➡️ Förderband | immer sichtbar | 1 × 1 | transportiert | 1 | 1 Holzblock je Feld |

**Regeln für Baukosten:** Das Sägewerk kostet nur Holzblöcke (erste Maschine ohne Platten). Jedes Gebäude kostet Waren früherer Stufen, damit sie ihren Wert behalten. Kein Gebäude kostet mehr, als ein Rohstoff seines Levels als Teile einbringt (Holz und Stein 240 Gold, ab Eisen 960; Kräuter-Gebäude höchstens 480, so viel wie ein Leinsamen als Verbände). Kräuter-Gebäude kosten nur Werkzeug-Waren (Tobias: aus Verbänden wird keine Maschine). Ein Test prüft die Grenze.

Intern heißt die Erntebank `flachsbreche` (alter Name, damit Spielstände passen).

## 7. Waren und Rezepte

| Ware | Herstellung | Zeit | Wert (Gold) |
|---|---|---|---|
| Holzstamm | Händler (ab Level 1) | – | 183 (Kauf) |
| Felsbrocken | Händler (ab Level 2) | – | 183 (Kauf) |
| Eisenerz | Händler (ab Level 3) | – | 732 (Kauf) |
| Holzblock / Steinblock | Holzfällerlager / Steinbruch | 4,5 s je Stück | 1 |
| Eisenbarren | Schmelzhütte | 4,5 s je Stück | 4 |
| Holzplatte / Holzstab | Sägewerk: 5 Holzblöcke → 1 | 5 s | 6 |
| Steinplatte / Stein-Zahnrad | Steinmetz: 5 Steinblöcke → 1 | 5 s | 6 |
| Eisenblech / Eisenstange | Schmiede: 5 Eisenbarren → 1 | 5 s | 24 |
| Zahnradwelle | Zimmerei: 10 Holzstäbe + 5 Stein-Zahnräder | 20 s | 108 |
| Räderwerk | Zimmerei: 10 Stein-Zahnräder + 5 Holzstäbe | 20 s | 108 |
| Verstärkte Holzplatte | Zimmerei: 10 Holzplatten + 5 Eisenstangen | 20 s | 216 |
| Scharnier | Feinschmiede: 10 Eisenbleche + 5 Eisenstangen | 20 s | 432 |
| Schlüssel | Feinschmiede: 10 Eisenstangen + 5 Eisenbleche | 20 s | 432 |
| Zirkel | Feinschmiede: 1 Scharnier + 5 Eisenstangen | 30 s | 662 |
| Gewichtstein | Schlosserei: 10 Steinplatten + 5 Eisenstangen | 20 s | 216 |
| Uhrwerk | Schlosserei: 1 Zahnradwelle + 1 Räderwerk | 30 s | 259 |
| Vorhängeschloss | Schlosserei: 1 Scharnier + 1 Räderwerk | 30 s | 648 |
| Leinsamen | Händler (ab Level 7) | – | 320 (Kauf) |
| Flachspflanze | Beet: 1 Leinsamen | 30 min | – (nicht verkäuflich, wird eingelegt) |
| Flachsfaser | Erntebank: 1 Flachspflanze → 50 | 12 s je Stück | 8 |
| Verband | Webstube: 5 Flachsfasern → 1 | 10 s | 48 |
| Ringelblumensamen | Händler (ab Level 8) | – | 500 (Kauf) |
| Ringelblume | Beet: 1 Ringelblumensamen | 30 min | – (nicht verkäuflich, wird eingelegt) |
| Ringelblüte (getrocknet) | Erntebank: 1 Ringelblume → 50 | 12 s je Stück | 12 |
| Heilverband | Kräuterstube: 1 Verband + 5 Ringelblüten | 20 s | 130 |
| Kräuterkompresse | Kräuterstube: 10 Flachsfasern + 5 Ringelblüten | 20 s | 168 |
| Holzkohle | Kohlenmeiler: 1 Holzstamm → 100 | 9 s je Stück | 2 |
| Zeichenbrett | Schreibstube: 1 Verstärkte Holzplatte + 10 Flachsfasern (mit Leinen bespannt) | 20 s | 355 |
| Reißzeug | Schreibstube: 1 Zirkel + 10 Holzkohle (Zirkel und Zeichenkohle im Etui) | 30 s | 818 |

- Rohstoffe und Pflanzen kommen nicht aufs Band und nicht ins Lagerhaus; man legt sie direkt ins Gebäude. Pflanzen kann man nicht kaufen und nicht verkaufen.
- **Rechenbeispiele:** 1 Holzstamm (183) → 200 Holzblöcke (200) → 40 Teile (240); im Kohlenmeiler → 100 Holzkohle (200) → mit 10 Zirkeln 10 Reißzeuge (8.180). 1 Eisenerz (732) → 200 Eisenbarren (800) → 40 Teile (960). 1 Leinsamen (320) → 50 Fasern (400) → 10 Verbände (480). 1 Holzstamm + 1 Felsbrocken ergeben etwa 5 Zahnradwellen oder Räderwerke. 1 Beet Flachs + 1 Beet Ringelblumen = genau 10 Heilverbände; 10 Kräuterkompressen brauchen 2 Flachspflanzen und 1 Ringelblume. 3 Beete versorgen eine Erntebank (3 × 10 Minuten = eine Wachszeit).
- Verwendung: Jedes Grundteil wird von mindestens einem Kombi-Rezept gebraucht (die Steinplatte vom Gewichtstein); Eisen etwas mehr als Holz und Stein, weil es mehr bringt. Der Verband ist für Wunden, die Kräuterkompresse für Prellungen und Schwellungen.

## 8. Ausblick

**Techbaum ab dem Kräuter-Kapitel (Tobias' Plan; Level 9–12 nach Claudes Entwurf, Chat 19):**

| Level | Inhalt | Stand |
|---|---|---|
| 7 | Flachs → Fasern → Verbände (wie Level 1) | im Spiel |
| 8 | Ringelblume, Kräuterstube mit 2 Eingängen (wie Level 2) | im Spiel |
| 9 | Die Schreibstube (Werkzeuge): Kohlenmeiler (Holzstamm → Holzkohle), Schreibstube: Zeichenbrett (Verstärkte Holzplatte + Flachsfasern), Reißzeug (Zirkel + Holzkohle) | im Spiel |
| 10 | Das Spital (Kräuter): Schafgarbe als 3. Pflanze, Wundverband (Heilverband + Schafgarbenblüten); dazu mehr Fläche (Tobias' Wunsch: je Seite ein 3. Streifen, bis 46 × 38) | Entwurf v0.27.0 (`docs/archiv/PLAENE.md`) – als Nächstes, wartet auf Tobias' OK |
| 11 | Die Uhrmacherei (Werkzeuge): Räderuhr (Uhrwerk + Gewichtstein), Kastenschloss (Vorhängeschloss + Schlüssel), Sternenuhr (Uhrwerk + Zirkel) | Entwurf |
| 12 | Die Apotheke (Abschluss der Kräuter): Kamille als 4. Pflanze, Kräutermischung, Kamillenkissen, Heilpäckchen (Wundverband + Kräuterkompresse); Reißbrett (Zeichenbrett + Reißzeug) | Entwurf |
| ab 13 | Tränke: Sand + Holzkohle → Glas → Kolben, Tränke aus Kolben und Kräutermischungen; über die Kräuter-Maschinen auch Sandstaub für die Zauberei; Holzkohle + Eisen → Stahl (Idee) | später |
| ~15 | Alchemist, Mörser (getrocknete Blüten → Staub, z. B. Ringelblumenstaub), Zaubertränke (Lebens-, Mana-, Alterstrank …); Farn als Zauberkraut (Idee) | später |

**Drei Bereiche wachsen parallel** (Tobias, Chat 19): Werkzeuge, Kräuter und Tränke. Aus Werkzeugen und Kräutern entstehen am Ende die Tränke – dafür braucht es neue Rohstoffe wie Glas (Kolben). Zirkel und Kräuter direkt zu kombinieren ergibt keinen Sinn; deshalb wächst auch das Werkzeug-Kapitel weiter. Seit Level 9 weiterverarbeitet: Zirkel (Reißzeug) und Verstärkte Holzplatte (Zeichenbrett). Noch ohne Weiterverarbeitung: Schlüssel, Vorhängeschloss, Gewichtstein, Uhrwerk – im Entwurf mit Level 11 (Uhrmacherei: Räderuhr, Kastenschloss, Sternenuhr).

**Leitlinien für neue Inhalte:** Jedes Kapitel fängt einfach an; neue Pflanzen wachsen im selben Beet und laufen durch dieselbe Erntebank; Gebäude kosten Werkzeug-Waren; jede Stufe bringt rund 20 % mehr; jedes neue Level erzählt die Geschichte des Ortes weiter (neue Bewohner, neuer Bauabschnitt); nur kleine Waren; häppchenweise planen und umsetzen.

**Ideen für später (noch nicht entschieden):** Nachfrage drückt Preise, Trends („Die Stadt baut eine Mauer: Steinblöcke +50 %“); Kaufen statt Herstellen (teurer); Laden-Ausbau mit Gold **und** Waren; Weiche mit Filter für gemischte Bänder; Verbesserungen mit Erfahrung (schneller verarbeiten, schnellere Bänder); Mindestbestand im Laden-Lager; weitere Rohstoffe (Lehm → Ziegel, Hanf → Seile, Sand → Glas); Nägel als eigene Stufe.

**Online (ab Meilenstein M5):** Spielerkonto, Spielstand auf dem Server, globaler Schwarzmarkt (alle Läden verbunden, Angebot drückt Preise, Computer-Händler halten ihn lebendig), Clans mit Handel, App für Android und iOS. Braucht einen Server mit laufenden Kosten, Datenschutz (DSGVO), Schutz vor Schummeln (der Server kontrolliert die Wirtschaft), Moderation und Store-Gebühren – deshalb erst das Einzelspieler-Spiel.
