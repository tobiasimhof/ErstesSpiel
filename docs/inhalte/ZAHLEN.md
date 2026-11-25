# Zahlen

> **Automatisch erzeugt** mit `node tools/zahlen.mjs` aus den Datentabellen (`src/core/data/`) – nicht von Hand ändern. Ein Test prüft, dass diese Seite zu den Tabellen passt. Gehört zu `docs/inhalte/`; nur lesen, wenn wir Zahlen festlegen (neue Level, Preise, Mengen, Baukosten).

**So wird gerechnet:** alles je Stück und ohne Wege auf den Bändern. *Rohstoffe darin:* rückwärts bis zu dem, was man beim Händler kauft (Samen für Pflanzen). *Maschinenzeit:* alle Sekunden, die Rohstoff-Gebäude und Maschinen arbeiten (die Zeit im Beet zählt nicht, sie steht unter *Pflanzen*: je 30 Minuten). *Engpass:* Steht für jeden Schritt genau ein Gebäude bereit (eine Straße, je Pflanze ein Beet), bestimmt der langsamste Schritt das Tempo – mehr Gebäude für diesen Schritt machen die Straße schneller. *Theken:* Jeder Kunde kauft 1 Stück.

## Je Level: die Aufträge

| Level | Aufträge: Waren | Gold beim Abgeben | Erfahrung | Rohstoffe darin | Rohstoffe kosten | Pflanzen | Maschinenzeit | Engpass (eine Straße) | Sprung zum Level davor |
|---|---|---|---|---|---|---|---|---|---|
| 1 Die ersten Hütten | 15 Holzplatten + 30 Holzstäbe | 270 | 81 | 1,1 Holzstämme | 206 | – | 21 min | 17 min (Holzfällerlager: Holzstamm) | – |
| 2 Wege und Brunnen | 30 Steinplatten + 10 Stein-Zahnräder + 10 Holzstäbe | 300 | 90 | 0,25 Holzstämme, 1 Felsbrocken | 229 | – | 23 min | 15 min (Steinbruch: Felsbrocken) | Gold ×1,1, Zeit ×1,1 |
| 3 Die Dorfschmiede | 15 Eisenstangen + 5 Eisenbleche + 10 Holzplatten | 540 | 162 | 0,25 Holzstämme, 0,5 Eisenerz | 412 | – | 14 min | 7,5 min (Schmelzhütte: Eisenerz) | Gold ×1,8, Zeit ×0,6 |
| 4 Die Mühle am Fluss | 6 Zahnradwellen + 12 Räderwerke + 2 Verstärkte Holzplatten | 2.376 | 714 | 3,5 Holzstämme, 3,8 Felsbrocken, 0,25 Eisenerz | 1.510 | – | 2,4 h | 56 min (Steinbruch: Felsbrocken) | Gold ×4,4, Zeit ×10,5 |
| 5 Der Markt | 5 Scharniere + 5 Schlüssel + 1 Zirkel | 4.982 | 1.495 | 4,3 Eisenerz | 3.111 | – | 1,4 h | 1,1 h (Schmelzhütte: Eisenerz) | Gold ×2,1, Zeit ×0,6 |
| 6 Das Stadttor | 8 Gewichtsteine + 6 Vorhängeschlösser + 2 Uhrwerke | 6.134 | 1.840 | 1,5 Holzstämme, 4,3 Felsbrocken, 3,3 Eisenerz | 3.431 | – | 3 h | 1,1 h (Steinbruch: Felsbrocken) | Gold ×1,2, Zeit ×2,2 |
| 7 Die Heilstube | 40 Verbände + 100 Flachsfasern | 2.720 | 816 | 6 Leinsamen | 1.920 | 6 | 1,1 h | 3 h (Beet: Flachspflanze) | Gold ×0,4, Zeit ×0,4 |
| 8 Der Kräutergarten | 50 Ringelblüten + 15 Heilverbände + 5 Kräuterkompressen + 20 Verbände | 4.350 | 1.305 | 4,5 Leinsamen, 3 Ringelblumensamen | 2.940 | 7,5 | 1,5 h | 2,3 h (Beet: Flachspflanze) | Gold ×1,6, Zeit ×1,3 |
| 9 Die Schreibstube | 50 Holzkohle + 7 Zeichenbretter + 2 Reißzeuge + 10 Heilverbände | 5.521 | 1.657 | 2,5 Holzstämme, 1,9 Eisenerz, 2,4 Leinsamen, 1 Ringelblumensamen | 3.089 | 3,4 | 2,1 h | 1,2 h (Beet: Flachspflanze) | Gold ×1,3, Zeit ×1,4 |
| 10 Das Spital | 50 Schafgarbenblüten + 13 Wundverbände + 2 Vorhängeschlösser + 10 Kräuterkompressen | 7.052 | 2.116 | 0,25 Holzstämme, 0,5 Felsbrocken, 0,75 Eisenerz, 3,3 Leinsamen, 2,3 Ringelblumensamen, 2,3 Schafgarbensamen | 4.410 | 7,9 | 2,1 h | 1,7 h (Beet: Flachspflanze) | Gold ×1,3, Zeit ×1 |
| 11 Die Uhrmacherei | 4 Räderuhren + 2 Kastenschlösser + 1 Sternenuhr + 10 Wundverbände | 8.497 | 2.550 | 2,1 Holzstämme, 3,4 Felsbrocken, 2,5 Eisenerz, 1 Leinsamen, 1 Ringelblumensamen, 1 Schafgarbensamen | 4.317 | 3 | 3,4 h | 51 min (Steinbruch: Felsbrocken) | Gold ×1,2, Zeit ×1,7 |
| 12 Die Apotheke | 50 Kamillenblüten + 10 Kräutermischungen + 5 Kamillenkissen + 4 Heilpäckchen + 2 Reißbretter | 9.072 | 2.722 | 0,7 Holzstämme, 1,3 Eisenerz, 2,6 Leinsamen, 0,8 Ringelblumensamen, 1,4 Schafgarbensamen, 2,5 Kamillensamen | 5.274 | 7,3 | 2,1 h | 1,3 h (Beet: Flachspflanze) | Gold ×1,1, Zeit ×0,6 |
| 13 Die Glashütte | 150 Glas + 45 Fläschchen + 2 Sternenuhren + 15 Kräutermischungen | 10.490 | 3.147 | 0,75 Holzstämme, 0,75 Felsbrocken, 1 Eisenerz, 1,5 Schafgarbensamen, 1,5 Kamillensamen, 3,8 Sand | 7.367 | 3 | 2,8 h | 56 min (Ofen: Sand) | Gold ×1,2, Zeit ×1,3 |
| 14 Die Tinktur | 35 Mörser + 25 Tinkturen + 10 Räderwerke + 8 Wundverbände | 13.251 | 3.976 | 5,6 Holzstämme, 3,4 Felsbrocken, 0,8 Leinsamen, 0,8 Ringelblumensamen, 3,3 Schafgarbensamen, 2,5 Kamillensamen, 1,3 Sand | 7.931 | 7,4 | 5,1 h | 1,7 h (Beet: Schafgarbe) | Gold ×1,3, Zeit ×1,9 |
| 15 Der alte Magier | 300 Holzkohle + 18 Traumtränke + 10 Kamillenkissen + 10 Tinkturen | 16.066 | 4.820 | 3 Holzstämme, 2 Leinsamen, 2,8 Schafgarbensamen, 5,6 Kamillensamen, 1,4 Sand | 9.225 | 10,4 | 3,8 h | 2,8 h (Beet: Kamille) | Gold ×1,2, Zeit ×0,7 |

## Aufstieg und Theken

*Davon geht in den Aufstieg:* welcher Teil des Golds aus den Aufträgen des Levels für den nächsten Aufstieg gebraucht wird (unter 100 % bezahlen die Aufträge ihn allein). *Theken verkaufen höchstens:* so viel Gold pro Stunde bringen 2 bzw. alle möglichen Theken, wenn sie nur die wertvollste Ware verkaufen und sie nie ausgeht. *Eine Straße:* so viele Stück schafft je ein Gebäude pro Schritt in einer Stunde.

| Level | Aufstieg danach | Aufträge bringen | davon geht in den Aufstieg | Kunden je Theke und Stunde | wertvollste Ware | Theken verkaufen davon höchstens (2 / alle) | eine Straße dieser Ware schafft |
|---|---|---|---|---|---|---|---|
| 1 | 30 | 270 | 11 % | 240 | Holzplatte (6) | 2.880 / 7.200 Gold/h (5 Theken) | 160 Stück/h = 960 Gold/h |
| 2 | 80 | 300 | 27 % | 240 | Holzplatte (6) | 2.880 / 7.200 Gold/h (5 Theken) | 160 Stück/h = 960 Gold/h |
| 3 | 170 | 540 | 31 % | 240 | Eisenblech (24) | 11.520 / 28.800 Gold/h (5 Theken) | 160 Stück/h = 3.840 Gold/h |
| 4 | 330 | 2.376 | 14 % | 103 | Verstärkte Holzplatte (216) | 44.434 / 111.086 Gold/h (5 Theken) | 16 Stück/h = 3.456 Gold/h |
| 5 | 670 | 4.982 | 13 % | 103 | Zirkel (662) | 136.183 / 340.457 Gold/h (5 Theken) | 8 Stück/h = 5.296 Gold/h |
| 6 | 1.000 | 6.134 | 16 % | 103 | Zirkel (662) | 136.183 / 340.457 Gold/h (5 Theken) | 8 Stück/h = 5.296 Gold/h |
| 7 | 1.330 | 2.720 | 49 % | 69 | Zirkel (662) | 90.789 / 226.971 Gold/h (5 Theken) | 8 Stück/h = 5.296 Gold/h |
| 8 | 1.670 | 4.350 | 38 % | 69 | Zirkel (662) | 90.789 / 226.971 Gold/h (5 Theken) | 8 Stück/h = 5.296 Gold/h |
| 9 | 2.000 | 5.521 | 36 % | 69 | Reißzeug (818) | 112.183 / 280.457 Gold/h (5 Theken) | 8 Stück/h = 6.544 Gold/h |
| 10 | 5.000 | 7.052 | 71 % | 69 | Reißzeug (818) | 112.183 / 280.457 Gold/h (5 Theken) | 8 Stück/h = 6.544 Gold/h |
| 11 | 7.500 | 8.497 | 88 % | 69 | Kastenschloss (1.296) | 177.737 / 444.343 Gold/h (5 Theken) | 5,3 Stück/h = 6.912 Gold/h |
| 12 | 10.000 | 9.072 | 110 % | 69 | Reißbrett (1.408) | 193.097 / 482.743 Gold/h (5 Theken) | 6,4 Stück/h = 9.011 Gold/h |
| 13 | 12.500 | 10.490 | 119 % | 69 | Reißbrett (1.408) | 193.097 / 579.291 Gold/h (6 Theken) | 6,4 Stück/h = 9.011 Gold/h |
| 14 | 15.000 | 13.251 | 113 % | 69 | Reißbrett (1.408) | 193.097 / 579.291 Gold/h (6 Theken) | 6,4 Stück/h = 9.011 Gold/h |
| 15 | – (letztes Level) | 16.066 | – | 69 | Reißbrett (1.408) | 193.097 / 579.291 Gold/h (6 Theken) | 6,4 Stück/h = 9.011 Gold/h |

## Wofür man Gold ausgibt

Neben Rohstoffen und Aufstiegen (Preise aus `data/shop.js` und `data/land.js`):

| Wofür | ab Level | Preise | zusammen |
|---|---|---|---|
| Theken 3–6 | 1, 13 | 15.000 / 35.000 / 70.000 / 150.000 | 270.000 |
| Laden-Lager vergrößern (10 × 100 Plätze) | 7 | 5.000 bis 27.500 | 162.500 |
| Fläche (je Seite 2 Streifen, 4 Seiten) | 1 | 170 / 500 je Streifen | 2.680 |
| mehr Fläche (je Seite 1 Streifen) | 10 | 2.000 je Streifen | 8.000 |
| mehr Fläche (je Seite 1 Streifen) | 15 | 10.000 je Streifen | 40.000 |

## Neue Gebäude je Level

| Level | Gebäude | Baukosten | Wert der Waren | Rohstoffe darin |
|---|---|---|---|---|
| 1 | Holzfällerlager | 10 Holzplatten + 10 Holzstäbe | 120 | 0,5 Holzstämme (92 Gold) |
| 1 | Sägewerk | 40 Holzblöcke | 40 | 0,2 Holzstämme (37 Gold) |
| 1 | Lagerhaus | 8 Holzplatten | 48 | 0,2 Holzstämme (37 Gold) |
| 1 | Versandportal | 10 Holzblöcke | 10 | 0,05 Holzstämme (9 Gold) |
| 2 | Steinbruch | 10 Holzplatten + 5 Holzstäbe | 90 | 0,38 Holzstämme (69 Gold) |
| 2 | Steinmetz | 30 Steinblöcke + 5 Holzstäbe | 60 | 0,13 Holzstämme, 0,15 Felsbrocken (50 Gold) |
| 3 | Schmelzhütte | 20 Steinplatten + 10 Holzplatten | 180 | 0,25 Holzstämme, 0,5 Felsbrocken (137 Gold) |
| 3 | Schmiede | 10 Steinplatten + 30 Eisenbarren | 180 | 0,25 Felsbrocken, 0,15 Eisenerz (156 Gold) |
| 4 | Zimmerei | 20 Holzplatten + 10 Eisenstangen | 360 | 0,5 Holzstämme, 0,25 Eisenerz (275 Gold) |
| 5 | Feinschmiede | 10 Eisenbleche + 2 Räderwerke | 456 | 0,25 Holzstämme, 0,5 Felsbrocken, 0,25 Eisenerz (320 Gold) |
| 6 | Schlosserei | 1 Scharnier + 2 Verstärkte Holzplatten | 864 | 0,5 Holzstämme, 0,63 Eisenerz (549 Gold) |
| 7 | Beet | 10 Holzplatten + 10 Steinplatten | 120 | 0,25 Holzstämme, 0,25 Felsbrocken (92 Gold) |
| 7 | Erntebank | 10 Holzplatten + 2 Zahnradwellen | 276 | 0,75 Holzstämme, 0,25 Felsbrocken (183 Gold) |
| 7 | Webstube | 20 Holzstäbe + 2 Räderwerke | 336 | 0,75 Holzstämme, 0,5 Felsbrocken (229 Gold) |
| 8 | Kräuterstube | 10 Holzplatten + 5 Eisenbleche + 2 Zahnradwellen | 396 | 0,75 Holzstämme, 0,25 Felsbrocken, 0,13 Eisenerz (275 Gold) |
| 9 | Ofen | 20 Steinplatten + 2 Verstärkte Holzplatten | 552 | 0,5 Holzstämme, 0,5 Felsbrocken, 0,25 Eisenerz (366 Gold) |
| 9 | Schreibstube | 1 Verstärkte Holzplatte + 1 Zirkel | 878 | 0,25 Holzstämme, 0,63 Eisenerz (503 Gold) |
| 11 | Uhrmacherei | 1 Zirkel + 1 Uhrwerk | 921 | 0,38 Holzstämme, 0,38 Felsbrocken, 0,5 Eisenerz (503 Gold) |
| 12 | Apotheke | 1 Verstärkte Holzplatte + 1 Gewichtstein | 432 | 0,25 Holzstämme, 0,25 Felsbrocken, 0,25 Eisenerz (275 Gold) |
| 15 | Zauberkessel | 30 Steinplatten + 10 Eisenbleche | 420 | 0,75 Felsbrocken, 0,25 Eisenerz (320 Gold) |

## Je Ware

*Aufschlag:* wie viel mehr die Ware bringt, als ihre Rohstoffe beim Händler kosten.

| Ware | ab Level | Wert | Rohstoffe darin | Rohstoffe kosten | Aufschlag | Maschinenzeit je Stück | Engpass je Stück | eine Straße: Gold/h |
|---|---|---|---|---|---|---|---|---|
| Holzblock | 1 | 1 | 0,01 Holzstämme | 0,92 | +9 % | 4,5 s | 4,5 s | 800 |
| Holzplatte | 1 | 6 | 0,03 Holzstämme | 4,6 | +31 % | 27,5 s | 22,5 s | 960 |
| Holzstab | 1 | 6 | 0,03 Holzstämme | 4,6 | +31 % | 27,5 s | 22,5 s | 960 |
| Steinblock | 2 | 1 | 0,01 Felsbrocken | 0,92 | +9 % | 4,5 s | 4,5 s | 800 |
| Steinplatte | 2 | 6 | 0,03 Felsbrocken | 4,6 | +31 % | 27,5 s | 22,5 s | 960 |
| Stein-Zahnrad | 2 | 6 | 0,03 Felsbrocken | 4,6 | +31 % | 27,5 s | 22,5 s | 960 |
| Eisenbarren | 3 | 4 | 0,01 Eisenerz | 3,7 | +9 % | 4,5 s | 4,5 s | 3.200 |
| Eisenblech | 3 | 24 | 0,03 Eisenerz | 18,3 | +31 % | 27,5 s | 22,5 s | 3.840 |
| Eisenstange | 3 | 24 | 0,03 Eisenerz | 18,3 | +31 % | 27,5 s | 22,5 s | 3.840 |
| Zahnradwelle | 4 | 108 | 0,25 Holzstämme, 0,13 Felsbrocken | 68,6 | +57 % | 432,5 s | 225 s | 1.728 |
| Räderwerk | 4 | 108 | 0,13 Holzstämme, 0,25 Felsbrocken | 68,6 | +57 % | 432,5 s | 225 s | 1.728 |
| Verstärkte Holzplatte | 4 | 216 | 0,25 Holzstämme, 0,13 Eisenerz | 137 | +57 % | 432,5 s | 225 s | 3.456 |
| Scharnier | 5 | 432 | 0,38 Eisenerz | 275 | +57 % | 432,5 s | 337,5 s | 4.608 |
| Schlüssel | 5 | 432 | 0,38 Eisenerz | 275 | +57 % | 432,5 s | 337,5 s | 4.608 |
| Zirkel | 5 | 662 | 0,5 Eisenerz | 366 | +81 % | 600 s | 450 s | 5.296 |
| Gewichtstein | 6 | 216 | 0,25 Felsbrocken, 0,13 Eisenerz | 137 | +57 % | 432,5 s | 225 s | 3.456 |
| Uhrwerk | 6 | 259 | 0,38 Holzstämme, 0,38 Felsbrocken | 137 | +89 % | 895 s | 337,5 s | 2.763 |
| Vorhängeschloss | 6 | 648 | 0,13 Holzstämme, 0,25 Felsbrocken, 0,38 Eisenerz | 343 | +89 % | 895 s | 337,5 s | 6.912 |
| Flachsfaser | 7 | 8 | 0,02 Leinsamen | 6,4 | +25 % | 12 s | 36 s | 800 |
| Verband | 7 | 48 | 0,1 Leinsamen | 32 | +50 % | 70 s | 180 s | 960 |
| Ringelblüte | 8 | 12 | 0,02 Ringelblumensamen | 10 | +20 % | 12 s | 36 s | 1.200 |
| Heilverband | 8 | 130 | 0,1 Leinsamen, 0,1 Ringelblumensamen | 82 | +59 % | 150 s | 180 s | 2.600 |
| Kräuterkompresse | 8 | 168 | 0,2 Leinsamen, 0,1 Ringelblumensamen | 114 | +47 % | 200 s | 360 s | 1.680 |
| Holzkohle | 9 | 2 | 0,01 Holzstämme | 1,8 | +9 % | 9 s | 9 s | 800 |
| Zeichenbrett | 9 | 355 | 0,25 Holzstämme, 0,13 Eisenerz, 0,2 Leinsamen | 201 | +76 % | 572,5 s | 360 s | 3.550 |
| Reißzeug | 9 | 818 | 0,1 Holzstämme, 0,5 Eisenerz | 384 | +113 % | 720 s | 450 s | 6.544 |
| Schafgarbenblüte | 10 | 16 | 0,02 Schafgarbensamen | 13,2 | +21 % | 12 s | 36 s | 1.600 |
| Wundverband | 10 | 252 | 0,1 Leinsamen, 0,1 Ringelblumensamen, 0,1 Schafgarbensamen | 148 | +70 % | 230 s | 180 s | 5.040 |
| Räderuhr | 11 | 570 | 0,38 Holzstämme, 0,63 Felsbrocken, 0,13 Eisenerz | 275 | +108 % | 1.387,5 s | 562,5 s | 3.648 |
| Sternenuhr | 11 | 1.105 | 0,38 Holzstämme, 0,38 Felsbrocken, 0,5 Eisenerz | 503 | +120 % | 1.555 s | 450 s | 8.840 |
| Kastenschloss | 11 | 1.296 | 0,13 Holzstämme, 0,25 Felsbrocken, 0,75 Eisenerz | 618 | +110 % | 1.387,5 s | 675 s | 6.912 |
| Kamillenblüte | 12 | 20 | 0,02 Kamillensamen | 16,6 | +20 % | 12 s | 36 s | 2.000 |
| Kräutermischung | 12 | 216 | 0,1 Schafgarbensamen, 0,1 Kamillensamen | 149 | +45 % | 140 s | 180 s | 4.320 |
| Kamillenkissen | 12 | 216 | 0,2 Leinsamen, 0,1 Kamillensamen | 147 | +47 % | 200 s | 360 s | 2.160 |
| Heilpäckchen | 12 | 504 | 0,3 Leinsamen, 0,2 Ringelblumensamen, 0,1 Schafgarbensamen | 262 | +92 % | 460 s | 540 s | 3.360 |
| Reißbrett | 12 | 1.408 | 0,35 Holzstämme, 0,63 Eisenerz, 0,2 Leinsamen | 586 | +140 % | 1.352,5 s | 562,5 s | 9.011 |
| Glas | 13 | 12 | 0,01 Sand | 11 | +9 % | 9 s | 9 s | 4.800 |
| Fläschchen | 13 | 72 | 0,05 Sand | 55 | +31 % | 75 s | 45 s | 5.760 |
| Mörser | 14 | 43 | 0,13 Holzstämme, 0,03 Felsbrocken | 27,5 | +57 % | 175 s | 112,5 s | 1.376 |
| Tinktur | 14 | 346 | 0,1 Schafgarbensamen, 0,1 Kamillensamen, 0,05 Sand | 204 | +70 % | 245 s | 180 s | 6.920 |
| Traumtrank | 15 | 547 | 0,1 Schafgarbensamen, 0,2 Kamillensamen, 0,05 Sand | 287 | +91 % | 365 s | 360 s | 5.470 |
