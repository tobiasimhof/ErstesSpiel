# Waren und Rezepte

> Gehört zu `docs/SPIEL.md`. Nur lesen, wenn wir an Inhalten arbeiten (neues Level, Preise, Baukosten, Rezepte). Alle Zahlen sind Platzhalter – maßgeblich sind die Datentabellen in `src/core/data/`. Bei jeder Änderung den Text **ersetzen**, nicht ergänzen.

- **Feste Preise** in einem Maßstab, der zum Mittelalter passt (Tobias): Ein Holzblock kostet 1 Gold, ein Zirkel 662. Regel: Blöcke bringen etwa 9 % mehr, als der Rohstoff kostet; jede weitere Stufe rund 20 % mehr als ihre Zutaten – so macht man beim Verkaufen nie Minus. Holz und Stein kosten und bringen gleich viel, Eisen viermal so viel. Ein Test prüft die Stufen.

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
| Holzkohle | Ofen: 1 Holzstamm → 100 | 9 s je Stück | 2 |
| Zeichenbrett | Schreibstube: 1 Verstärkte Holzplatte + 10 Flachsfasern (mit Leinen bespannt) | 20 s | 355 |
| Reißzeug | Schreibstube: 1 Zirkel + 10 Holzkohle (Zirkel und Zeichenkohle im Etui) | 30 s | 818 |
| Schafgarbensamen | Händler (ab Level 10) | – | 660 (Kauf) |
| Schafgarbe | Beet: 1 Schafgarbensamen | 30 min | – (nicht verkäuflich, wird eingelegt) |
| Schafgarbenblüte | Erntebank: 1 Schafgarbe → 50 | 12 s je Stück | 16 |
| Wundverband | Kräuterstube: 1 Heilverband + 5 Schafgarbenblüten (stillt Blut) | 20 s | 252 |
| Räderuhr | Uhrmacherei: 1 Uhrwerk + 1 Gewichtstein (Uhr mit Gewichtsantrieb) | 60 s | 570 |
| Kastenschloss | Uhrmacherei: 1 Vorhängeschloss + 1 Schlüssel (Schloss mit passendem Schlüssel) | 60 s | 1.296 |
| Sternenuhr | Uhrmacherei: 1 Uhrwerk + 1 Zirkel (zeigt Sonne, Mond und Sterne) | 60 s | 1.105 |
| Kamillensamen | Händler (ab Level 12) | – | 830 (Kauf) |
| Kamille | Beet: 1 Kamillensamen | 30 min | – (nicht verkäuflich, wird eingelegt) |
| Kamillenblüte | Erntebank: 1 Kamille → 50 | 12 s je Stück | 20 |
| Kräutermischung | Apotheke: 5 Schafgarbenblüten + 5 Kamillenblüten (Grundlage für die Tränke) | 20 s | 216 |
| Kamillenkissen | Apotheke: 10 Flachsfasern + 5 Kamillenblüten (zum Schlafen) | 20 s | 216 |
| Heilpäckchen | Apotheke: 1 Wundverband + 1 Kräuterkompresse (für Reisende) | 30 s | 504 |
| Reißbrett | Schreibstube: 1 Zeichenbrett + 1 Reißzeug (das Arbeitsbrett des Baumeisters) | 60 s | 1.408 |
| Sand | Händler (ab Level 13), ein Sack feiner Flusssand | – | 1.100 (Kauf) |
| Glas | Ofen: 1 Sand → 100 (Glas gibt es nur dort) | 9 s je Stück | 12 |
| Fläschchen | Schmiede: 5 Glas → 1 (das Gefäß für die Tränke) | 30 s | 72 |
| Mörser | Zimmerei: 1 Steinplatte + 5 Holzstäbe (Schale aus Stein, Stößel aus Holz) | 10 s | 43 |
| Tinktur | Apotheke: 1 Fläschchen + 1 Kräutermischung (die Grundzutat aller Tränke) | 30 s | 346 |
| Traumtrank | Zauberkessel: 1 Tinktur + 5 Kamillenblüten, Feuer 5 Holzkohle (bauchiges Fläschchen mit lila Trank) | 60 s | 547 |

- Rohstoffe und Pflanzen kommen nicht aufs Band und nicht ins Lagerhaus; man legt sie direkt ins Gebäude. Pflanzen kann man nicht kaufen und nicht verkaufen.
- **Aussehen der Kräuter** (`bloom` in `data/items.js`): Flachs hohe Halme mit kleinen blauen Blüten, Ringelblume eine große orange Blüte mit braunem Knopf, Schafgarbe ein flacher weißer Schirm aus Pünktchen über gefiederten Blättern, Kamille Gänseblümchen mit dickem gelbem Knopf. Samen sind eine Tüte in ihrer Farbe mit dem Bild der Pflanze (`grows`).
- **Rechenbeispiele:** 1 Holzstamm (183) → 200 Holzblöcke (200) → 40 Teile (240); im Ofen → 100 Holzkohle (200) → mit 10 Zirkeln 10 Reißzeuge (8.180). 1 Sand (1.100) → im Ofen 100 Glas (1.200) → 20 Fläschchen (1.440); ein Ofen mit Sand reicht für 80 Fläschchen pro Stunde, eine Schmiede (30 s je Fläschchen) verarbeitet das Glas von 1,5 Öfen. 1 Eisenerz (732) → 200 Eisenbarren (800) → 40 Teile (960). 1 Leinsamen (320) → 50 Fasern (400) → 10 Verbände (480). 1 Holzstamm + 1 Felsbrocken ergeben etwa 5 Zahnradwellen oder Räderwerke. 1 Beet Flachs + 1 Beet Ringelblumen = genau 10 Heilverbände; 10 Kräuterkompressen brauchen 2 Flachspflanzen und 1 Ringelblume. 3 Beete versorgen eine Erntebank (3 × 10 Minuten = eine Wachszeit). 1 Leinsamen + 1 Ringelblumensamen + 1 Schafgarbensamen (1.480) → 10 Wundverbände (2.520). 1 Schafgarbensamen + 1 Kamillensamen (1.490) → genau 10 Kräutermischungen (2.160). Ein Ofen macht 400 Holzkohle pro Stunde – genug Feuer für 80 Traumtränke; ein Kessel braut 60 pro Stunde, wenn genug Tinktur und Kamille kommen.
- Verwendung: Jedes Grundteil wird von mindestens einem Kombi-Rezept gebraucht (die Steinplatte vom Gewichtstein); Eisen etwas mehr als Holz und Stein, weil es mehr bringt. Der Verband ist für Wunden, die Kräuterkompresse für Prellungen und Schwellungen, der Wundverband (mit Schafgarbe) stillt Blut; die Kamille beruhigt und hilft beim Schlafen.
