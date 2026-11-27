# Gebäude

> Gehört zu `docs/SPIEL.md`. Nur lesen, wenn wir an Inhalten arbeiten (neues Level, Preise, Baukosten, Rezepte). Alle Zahlen sind Platzhalter – maßgeblich sind die Datentabellen in `src/core/data/`. Bei jeder Änderung den Text **ersetzen**, nicht ergänzen.

| Gebäude | Reiter | Größe | Was es tut | ab Level | Baukosten |
|---|---|---|---|---|---|
| 🪓 Holzfällerlager | Holz | 2 × 2 | 1 Holzstamm → 200 Holzblöcke (15 min), Vorrat 3 | 1 | 10 Holzplatten + 10 Holzstäbe |
| 🪚 Sägewerk | Holz | 2 × 2 | „Platten“ oder „Stäbe“: 5 Holzblöcke → 1 Holzplatte bzw. Holzstab | 1 | 40 Holzblöcke |
| 🛠️ Zimmerei | Holz | 2 × 2, 2 Eingänge | Zahnradwelle · Räderwerk · Verstärkte Holzplatte · „Mörser“ (erst ab Level 14 wählbar) | 4 | 20 Holzplatten + 10 Eisenstangen |
| ⛏️ Steinbruch | Stein | 2 × 2 | 1 Felsbrocken → 200 Steinblöcke (15 min), Vorrat 3 | 2 | 10 Holzplatten + 5 Holzstäbe |
| ⚒️ Steinmetz | Stein | 2 × 2 | „Platten“ oder „Zahnräder“: 5 Steinblöcke → 1; ab Level 17 „Linsen“ (10 Glas → 1, 30 s) und „Kristallsand“ (5 Glas → 1, 10 s) | 2 | 30 Steinblöcke + 5 Holzstäbe |
| 🔮 Zauberkessel | Stein | 2 × 2, 2 Eingänge, **Feuerfach** | „Traumtränke“: 1 Tinktur + 5 Kamillenblüten → 1 (60 s); „Heiltränke“ (erst ab Level 16): 1 Tinktur + 2 Heilpuder → 1 (60 s); „Lebenstränke“ (ab Level 18): 1 Heiltrank + 5 Farnwedel → 1 (90 s); „Manatränke“ (ab Level 18): 1 Traumtrank + 2 Kristallsand → 1 (90 s); das Feuer verbrennt 5 Holzkohle je Trank – das Fach fasst 100, nachlegen von Hand mit „🔥 Auffüllen“ aus dem Laden-Lager; ohne Feuer wartet der Kessel („Feuer aus“) | 15 | 30 Steinplatten + 10 Eisenbleche (gemauerter Herd, Kessel aus Eisenblech) |
| 🌼 Kräutermühle | Stein | 2 × 2 | „Heilpuder“: 5 Ringelblüten → 1 (15 s) | 16 | 10 Mörser + 4 Räderwerke (Mahlschalen und Antrieb; 862 Gold Warenwert) |
| 🔥 Schmelzhütte | Eisen | 2 × 2 | 1 Eisenerz → 200 Eisenbarren (15 min), Vorrat 3 | 3 | 20 Steinplatten + 10 Holzplatten |
| 🔨 Schmiede | Eisen | 2 × 2 | „Bleche“ oder „Stangen“: 5 Eisenbarren → 1; „Fläschchen“: 5 Glas → 1 (erst ab Level 13 wählbar) | 3 | 10 Steinplatten + 30 Eisenbarren |
| ⚙️ Feinschmiede | Eisen | 2 × 2, 2 Eingänge | Scharnier · Schlüssel · Zirkel | 5 | 10 Eisenbleche + 2 Räderwerke |
| 🔐 Schlosserei | Eisen | 2 × 2, 2 Eingänge | Gewichtstein · Uhrwerk · Vorhängeschloss | 6 | 1 Scharnier + 2 Verstärkte Holzplatten |
| 🌱 Beet | Erde | 2 × 2, kein Band | 1 Samen → 1 Pflanze (30 min), säen und ernten von Hand; in 3D wachsen 3 × 3 Pflanzen sichtbar | 7 | 10 Holzplatten + 10 Steinplatten |
| 🪢 Erntebank | Erde | 2 × 2 | 1 Pflanze → 50 Flachsfasern, Ringelblüten, Schafgarbenblüten, Kamillenblüten bzw. Farnwedel (10 min), Vorrat 3, auch gemischt | 7 | 10 Holzplatten + 2 Zahnradwellen |
| 🧵 Webstube | Erde | 2 × 2 | 5 Flachsfasern → 1 Verband | 7 | 20 Holzstäbe + 2 Räderwerke |
| 🌿 Kräuterstube | Erde | 2 × 2, 2 Eingänge | „Heilverbände“ · „Kompressen“ · „Wundverbände“ (erst ab Level 10 wählbar) | 8 | 10 Holzplatten + 5 Eisenbleche + 2 Zahnradwellen |
| ♨️ Ofen (früher Kohlenmeiler) | Holz | 2 × 2 | 1 Holzstamm → 100 Holzkohle, ab Level 13 auch 1 Sand → 100 Glas (je 15 min), Vorrat 3, auch gemischt | 9 | 20 Steinplatten + 2 Verstärkte Holzplatten |
| 📐 Schreibstube | Werkstatt | 2 × 2, 2 Eingänge | „Zeichenbretter“ · „Reißzeuge“ · „Reißbretter“ (erst ab Level 12 wählbar) | 9 | 1 Verstärkte Holzplatte + 1 Zirkel |
| 🕰️ Uhrmacherei | Werkstatt | 2 × 2, 2 Eingänge | „Räderuhren“ · „Kastenschlösser“ · „Sternenuhren“ · ab Level 17 „Fernrohre“ (2 Linsen + 10 Eisenbleche, 60 s) | 11 | 1 Zirkel + 1 Uhrwerk |
| ⚗️ Apotheke | Werkstatt | 2 × 2, 2 Eingänge | „Kräutermischungen“ · „Kamillenkissen“ · „Heilpäckchen“ · „Tinkturen“ (erst ab Level 14 wählbar) | 12 | 1 Verstärkte Holzplatte + 1 Gewichtstein (Regal und Apothekerwaage) |
| 📦 Lagerhaus | immer sichtbar | 2 × 1 | Zwischenlager 3 × 50, von Hand befüllen | 1 | 8 Holzplatten |
| 🌀 Versandportal | immer sichtbar | 1 × 1 | schickt Waren ins Laden-Lager | 1 | 10 Holzblöcke |
| ➡️ Förderband | immer sichtbar | 1 × 1 | transportiert | 1 | 1 Holzblock je Feld |

**Regeln für Baukosten:** Das Sägewerk kostet nur Holzblöcke (erste Maschine ohne Platten). Jedes Gebäude kostet Waren früherer Stufen, damit sie ihren Wert behalten. Kein Gebäude kostet mehr, als ein Rohstoff seines Levels als Teile einbringt (Holz und Stein 240 Gold, ab Eisen 960; Kräuter-Gebäude höchstens 480, so viel wie ein Leinsamen als Verbände). Kräuter-Gebäude kosten nur Werkzeug-Waren (Tobias: aus Verbänden wird keine Maschine). Ein Test prüft die Grenze.

Intern heißen die Erntebank `flachsbreche` und der Ofen `kohlenmeiler` (alte Namen, damit Spielstände passen).
