# Gesprächsprotokoll

> **Archiv.** Wörtlich übernommen aus der README bis v0.18.0 (Abschnitt 10). Hier wird nur gesucht, nicht zu Beginn eines Chats gelesen. Verweise wie „Abschnitt 4.2“ oder „offene Frage 12“ beziehen sich auf die alte README: Abschnitte 3, 4 und 8 stehen in `KONZEPT-VERLAUF.md`, 6 in `PLAENE.md`, 7 in `ENTSCHEIDUNGEN.md`, 9 in `VERSIONEN.md`, 10 in `GESPRAECHE.md`. Den aktuellen Stand beschreiben `docs/SPIEL.md` und `docs/STAND.md`.

Neuester Chat oben. Was Tobias gesagt hat, was Claude vorgeschlagen hat, was umgesetzt wurde.

### 23.11.2026 – Chat 28: Oberfläche mit Kenneys UI-Paketen – Probefenster, Entwurf für den Rest (v0.46.2 bis v0.47.1)

**Tobias:** „Bringe dich auf den aktuellsten Stand.“

**Claude** hat `STAND.md`, `SPIEL.md` und die Vorbereitung in `PLAENE.md` gelesen und direkt erklärt, wie wir es mit Kenneys UI-Paketen machen: Pakete (kenney.nl ist aus der Arbeitsumgebung nicht erreichbar, deshalb über eine Websuche geprüft) – UI Pack Adventure als Hauptpaket, Fantasy UI Borders für Rahmen, das allgemeine UI Pack als Ersatzteillager; Hochladen über einen Link auf den Arbeitsbranch; dann Musterbild, Probe an einem Fenster (v0.47.0), der Rest in v0.48.0. Fragen: Wo war die Auswahl der Kräuter schwer zu erkennen? Stil? Erst ein Fenster als Probe?

**Tobias:** „Wenn ich auswählen muss, welche Kräuter ich nutzen möchte, damit daraus Blüten entstehen. Aktuell gibt es nur 4 Buttons bei dem ich auswählen kann, welche Kräuter und diese Kräuter sehen alle gleich aus unterscheiden sich nur in der Farbe, das finde ich sehr unübersichtlich. Außerdem die Bilder in den Kräuterbeeten kann man jetzt auch nicht wirklich gut erkenne, deswegen denke ich es wäre besser die Kräuter anders darzustellen, damit man da einen klaren Unterschied erkennen kann. Mir passt es, dass du erst ein probefenster baust. Ich möchte noch kein fertiges perfektes UI design, sondern eher was schlichtes, damit man einfach eine besseres Bild von dem Spiel bekommt als diese KI-HTML darstellung, weil wir über diesen level mit den assets ja schon hinaus sind. Ich hab dir noch Audio für UI hinzugefügt und noch ein weiteres Pack, weil ich das ausversehen verwechselt habe.“

**Claude** hat den Upload entpackt (UI Pack Adventure, Fantasy UI Borders, UI Pack, Pixel Adventure – verwechselt, UI Audio mit 50 Klängen), Bildschirmfotos von Erntebank, Beet und Beeten gemacht (die vier Pflanzen sind dieselbe Zeichnung in anderer Farbe, 20 Pixel ohne Namen; die Samen derselbe Beutel; das Beet in 3D ein leerer Kasten) und ein Musterbild geschickt: das Fenster der Erntebank in A (Holzrahmen schlicht) und B (mit Eisenbeschlägen), neue Kräuterbilder (Flachs: Halme mit blauen Blüten; Ringelblume: große orange Blüte; Schafgarbe: weißer Schirm aus Pünktchen; Kamille: Gänseblümchen mit gelbem Knopf; Samen: Tüte mit dem Bild der Pflanze). Entwurf v0.47.0 in `PLAENE.md`. Fragen: A oder B? Kräuterbilder? Beete mit wachsenden Pflanzen? Klänge jetzt oder später?

**Umgesetzt:** v0.46.2 (nur Doku). Wartet auf Tobias' Antworten.

**Tobias:** „Mir gefällt B besser und die neuen Kräuterbilder sind auch sehr gut. Die Idee, dass man die Kräuter auch aufwachsen sieht, finde ich auch super. Die Sounds machen wir erst bei dem Menu, dass wir auch einen Menüpunkt mit Audio haben, um das ganze zu steuern, aber der Stil des UI's gefällt mir“

**Claude** hat v0.47.0 umgesetzt: die vier Kräuter mit eigener Form in allen Warenbildern (wie im Musterbild), Samen als Tüte in ihrer Farbe mit dem Bild der Pflanze; die Erntebank-Knöpfe mit großem Bild und Namen; im 3D-Test wachsen 3 × 3 Pflanzen im Beet in vier Stufen (Keimling, klein, Knospen ab 60 %, reif blühend); das Infofenster mit Kenneys Holzrahmen B, Holzknöpfen (grün aus dem roten Knopf umgefärbt), verzierten Kästen und runden Vorrat-Fächern. Klänge kommen mit dem Menü (v0.48.0).

**Umgesetzt:** v0.47.0.

**Tobias:** „Perfek, das hat funktioniert. Lass uns weitermachen“

**Claude** hat den Entwurf für die nächsten Schritte geschrieben (`PLAENE.md`): v0.48.0 – die großen Fenster (Laden, Level, Befüllen, Willkommen zurück) und Rückfragen im Stil B, Reiter klar markiert (gewählter Reiter dunkles Holz), das Menü ☰ als Holztafel mit neuem Eintrag „🔊 Audio“ (Klänge an/aus, Lautstärke; gespeichert auf dem Gerät, nicht im Spielstand), Klänge aus Kenneys UI Audio (Klicken beim Antippen, ein anderes Geräusch beim Reiterwechsel); v0.49.0 – Bauleiste, Leiste oben, Knöpfe unten, ⟲ ⟳ und die Schilder „＋ Preis“. Fragen: zwei Schritte so? Klänge beim Start an oder aus, Regler oder nur an/aus? Welche Klänge (Tobias kann sie im Paket anhören)? Später Fabrik-Geräusche?

**Umgesetzt:** v0.47.1 (nur Doku). Wartet auf Tobias' Antworten.

### 23.11.2026 – Chat 27: eigene Häuser getestet, Kräuterstube passt, Analyse Teil 2, Grobplan Tränke-Kapitel in zwei Fassungen, Rechenwerkzeug, Level 14, Waren auf dem Band, nächste große Schritte (v0.43.1 bis v0.46.1)

**Tobias:** „Hey, bringe dich auf den aktuellen Stand der Dinge und berichte mir was die nächsten Schritte sind. Bis v43 sieht alles sehr gut aus und die einzelnen Gebäude wirken auch unterschiedlich genug, sodass man sie erkennt. Da wir die "karte" frei bewegen können, kann ich mir jedes Haus auch von hinten ansehen. Wenn ich z.b. einmal rechts und einmal links baue, dann ist die Produktion auf der anderen Seite immer von hinten zu sehen und da sieht man z.b. keine Unterschiede, aber das ist nur eine kleine Anmerkung für später. Ansonsten sieht es sehr gut aus“

**Claude** hat `STAND.md` und `SPIEL.md` gelesen, die Rückmeldung als v0.43.1 festgehalten (nur Doku) und berichtet: Die vereinbarten Schritte aus Chat 26 sind alle erledigt (Belastungstest, 3D schneller, Bereich kopieren, eigene Häuser für alle Gebäude). Als Nächstes spielt Tobias den 3D-Test weiter bis Level 13; dann planen wir gemeinsam Level 14 (Mörser) und das Tränke-Kapitel. Die Rückseiten der Häuser stehen als Punkt für später unter „Nächste Schritte“.

**Umgesetzt:** v0.43.1 (nur Doku).

**Tobias:** „Die Kräuterstube mit 2 Eingängen finde ich auch gut. Man muss die Produktion anders bauen, als bei den "Baustoffen", weil man z.b. zuerst Heilverbände braucht bevor man Wundverbände herstellen kann und dafür brauch man 2x das gleiche Gebäude, aber das finde ich eigentlich recht gut. Ich hab das mit mehreren Erntebänken gelöst, die an der Seite immer ihre Ware mit einschieben. So ist die Produktion mehr davon abhängig, wie viel man eingepflanzt hat etc. Für mich klingt es so, als würden wir nur darauf warten, dass ich wieder auf Level 13 komme, damit wir weiter entwickeln können, weil der Grundrahmen soweit passt ? Kannst du aus sicht eines Spieleentwicklers mal schauen, was am sinnvollsten für die nächsten Schritte ist ? Was könnten wir noch machen bevor wir uns weiter an den Techbaum machen oder sagst du, das Spiel läuft, der Techbaum ist der nächste sinnige Schritt auch wenn ich noch nicht da bin ?“

**Claude** (Analyse als Spielentwickler, Teil 2, in `PLAENE.md`): Ja, der Grundrahmen trägt; der wichtigste Hebel ist jetzt Inhalt, und warten lohnt sich nicht: Ein Kapitel zu planen dauert mehrere Chats, ein Level umzusetzen nur eine Version, und das Gefühl von Level 13 betrifft vor allem die Zahlen, nicht das Gerüst (Level 13 kennt Tobias zudem aus der echten Fabrik). Vorschlag: (1) Grobplan Tränke-Kapitel Level 14–18 ohne Zahlen, jetzt; (2) Rechenwerkzeug für die Zahlen (Rohstoffe, Maschinenzeit, Gold je Level, ändert nichts am Spiel); (3) Level 14, fertig bevor Tobias Level 13 abschließt, Zahlen nach seinem Gefühl; (4) Rückseiten zwischendurch, wenn er mag. Beobachtung: Eine Straße stellt etwa 13 Stück pro Minute her, alle 6 Theken verkaufen etwa 7 – Massenproduktion lohnt sich dort, wo Waren verbraucht werden; die Tränke-Rezepte sollten viel von den früheren Waren schlucken. Fragen: Reihenfolge? Bilder im Kopf für die Tränke? Rückseiten zwischendurch oder später?

**Umgesetzt:** v0.43.2 (nur Doku). Wartet auf Tobias' Antworten.

**Tobias** (mit einem Bild seiner Fabrik auf Level 12, 60 Bilder/s): „Okay, lass uns damit anfangen. Ich bin leider die letzten 2 Stunden total im Game versackt und bin jetzt auf level 12 und mache gerade die Kamillenaufträge, damit ich so schnell wie möglich auf Level 13 komme. Das ist aktuell meine Produktion. Von den Baustoffen stelle ich eigentlich alles automatisiert her, was man herstellen kann. Aktuell versuche ich mich noch durch das Pflanzenthema zu jonglieren. Schwierig ist hier, dass man viele Einzelteile wie z.b. Zahnradwelle, damit man genug erntebänken, webstuben etc bauen kann, um da weiter voran zu kommen, von daher passt mir das GLeichgewicht bis hier hin sehr gut“

**Claude** hat Tobias' frühere Ideen im Archiv nachgelesen und den Grobplan geschrieben (`PLAENE.md`): 14 Die Trankküche (Zimmerei: Mörser; Apotheke: Tinktur, Traumtrank), 15 Der Alchemist (neue Stampfmühle: Blütenstaub, Kohlestaub; Heiltrank; Tinte in der Schreibstube), 16 Die Sternwarte (Linse im Steinmetz, Lupe, Fernrohr), 17 Der Zaubergarten (Farn, Farnwedel, Farnstaub), 18 Die Zauberei (Glasstaub; Lebens-, Mana-, Alterstrank). Nur eine neue Maschine, sonst neue Einstellungen; Zahlen erst mit Rechenwerkzeug und Level 13. Fragen: Gerüst? Traumtrank schon auf 14? Name Stampfmühle, Glas statt Sand? Zaubertränke in Apotheke oder Zauberkessel (Empfehlung)? Farn, Alterstrank?

**Umgesetzt:** v0.43.3 (nur Doku). Wartet auf Tobias' Antworten.

**Tobias:** „Das Gerüst passt für mich. Bei den Namen müssen wir nochmal schauen, dass wir evtl. etwas geschmeidigeres finden als die enden "Staub". Den Traumtrank würde ich erst auf Level 15 kommen lassen dann kann man geschichtlich die Trinktur nutzen, damit sich ein alter magier oder ähnliches ansiedelt, der mit der Tixtur und alten Geheimnissen, diese Tränke herstellen kann. Ich finde gut, dass wir bei den maschinen mehr mit stein arbeiten, weil wir da noch nicht so viele maschinen haben. Ich würde evtl. irgendwas in richtung fementieren gehen, weil wir die einzelnen blüten trocknen müssen damit daraus wirklich "staub" wird. Ich finde die Reihenfolge gut, aber ich frage mich, ob man bei den ganzen neuen Sachen nicht evtl. zu viel umbauen muss, aber Level 14 finde ich schon mal sehr passend. Verarbeite die Informationen erstmal und schlage mir evtl einen neuen TechBaum mit ähnlicher Struktur vor. Zauberkessel finde ich eine gute Maschine für die Tränke. Da könnte man auch daran denken, dass man den Feuerkessel mit Holzkohle beheizen muss statt mit holzstämmen und dadurch könnte der ofen auch einen Eingang bekommen für Holzkohle und zwei für die Rohstoffe oder so ähnlich hatte ich gedacht. Farn finde ich gut, weil dann können wir die Pflanze weiter benutzen“

**Claude** (2. Fassung in `PLAENE.md`): 14 Die Tinktur (Mörser, Tinktur), 15 Der alte Magier (Zauberkessel, Traumtrank), 16 Die Kräutermühle (Heilpuder, Heiltrank), 17 Die Sternwarte (Linse, Fernrohr, Sternensand), 18 Die Zauberei (Farn → Farnwedel, Lebens- und Manatrank); 11 statt 16 neue Waren, beide neuen Maschinen im Reiter „Stein“. Zu „zu viel umbauen“: kein bestehendes Rezept ändert sich, je Level höchstens 1 neue Maschine und 2–3 Waren aus Zutaten, die man schon herstellt. Trocknen: macht die Erntebank schon; Fermentieren wäre eine zusätzliche Stufe – Vorschlag: weglassen. Feuer im Kessel: Ein Holzkohle-Eingang wäre der dritte (Tobias' Regel: höchstens 2) – A Feuerfach von Hand (Empfehlung) oder B dritter Eingang nur für Holzkohle; der Ofen bleibt, sonst müssten alle Glas-Straßen umgebaut werden. Fragen: 2. Fassung? A oder B? Namen? Fermentieren weglassen?

**Umgesetzt:** v0.43.4 (nur Doku). Wartet auf Tobias' Antworten.

**Tobias:** „Ich finde neuer Platz könnte schon mit Level 15 kommen, weil sich das Gold allmählich anhäuft mit den Produkten, die wir aktuell nicht weiterverarbeiten können. Ich bin aktuell Level 13 und an dem letzten Auftrag dran, aber keine hektik bzgl. programmieren. Mir gefällt der neue Plan viel besser können wir auch gerne so umsetzen. Mühle macht auch Glas sternensand gefällt mir noch nicht so hundertprozentig. Was ist mit Mühle gemeint ? Die Holzkohle Idee mit A finde ich sehr gut. So kann man einfach aus dem Warenlager rausnehmen. Die Namen gefallen mir auch deutlich besser. Wir lassen fermentieren weg.“

**Claude:** „Mühle“ war kurz für die Kräutermühle aus Level 16, die auf Level 17 auch Glas mahlen sollte – das passt nicht ganz; Vorschlag: Das Glas mahlt der Steinmetz (er schleift auch die Linse), Namen z. B. Sternenglanz, Glitzersand, Kristallsand – Entscheidung bei Level 17. Mehr Fläche kommt mit Level 15 (Preis bei der Planung von Level 15; vorher mit dem Belastungstest prüfen, dass die größere Fläche flüssig bleibt). Techbaum in `AUSBLICK.md` übernommen. Entwurf v0.44.0 Rechenwerkzeug (`PLAENE.md`): `tools/zahlen.mjs` schreibt `docs/inhalte/ZAHLEN.md` – je Level Warenwert, Erfahrung, Rohstoffe, Arbeitszeit, Baukosten, Aufstieg in Theken-Stunden, Sprung zum Vorlevel; am Spiel ändert sich nichts. Fragen: OK? Reicht die Seite in der Doku?

**Umgesetzt:** v0.43.5 (nur Doku). Wartet auf Tobias' OK.

**Tobias:** „Da würde mir Kristallsand tatsächlich am besten gefallen. Ja, das Rechenwerkzeug hat mir noch gefehlt, damit wir alles im GLeichgewicht behalten können. Du kannst mir gern die wichtigsten Stellem im Chat zusammenfassen, wenn ich etwas genauer wissen will, werde ich nachfragen.“

**Umgesetzt:** v0.44.0 – Rechenwerkzeug (`tools/zahlen.mjs` → `docs/inhalte/ZAHLEN.md`). **Claude** hat die wichtigsten Stellen zusammengefasst (`PLAENE.md`): Die Aufträge bezahlen den Aufstieg fast allein; nach etwa 443.000 Gold (Theken, Lager, Fläche) gibt es nichts mehr zu kaufen, deshalb häuft sich das Gold; ab Level 9 steigt es gleichmäßig um ×1,1–1,3 je Level; Engpass sind Beete bzw. Rohstoff-Gebäude; lange Ketten lohnen, die Glas-Kette erst mit den Tränken. Als Nächstes: Level 14 im Detail planen. Frage: Soll Level 14 schon eine neue Ausgabe für Gold bringen?

**Tobias** (mit einem Bild seiner Fabrik, Level 13 abgeschlossen, 26.095 Gold): „Das würde ich Tatsächlich mit Level 15 machen, wenn die Flächen dazu kommen, weil der Platz bei mir zu ca. 70% sinnvoll gefühlt ist. Größere Straßen zu bauen wird deshalb langsam schwierig und level 13 habe ich jetzt auch beendet. In vergangen Level wurde der Aufstieg dadurch gebremst, dass ich nicht einzelne rohstoffe hatte um gebäude zu bauen, deshalb war ich sehr lange bei den kräuter level beschäftigt. Plane gerne alles und stell es mir dann vor“

**Claude** (Entwurf v0.45.0 in `PLAENE.md`, mit dem Rechenwerkzeug an einer Kopie gerechnet): Level 14 „Die Tinktur“ – Zimmerei: Mörser (1 Steinplatte + 3 Holzstäbe, 10 s, 29 Gold); Apotheke: Tinktur (1 Fläschchen + 1 Kräutermischung, 30 s, 346 Gold); Aufträge: Klara 15 Mörser, Klara 10 Tinkturen, Grete 20 Mörser + 10 Räderwerke (sie will Kräuter mit Wasserkraft mahlen – die Kräutermühle auf Level 16), Agnes 15 Tinkturen + 8 Wundverbände; zusammen 12.761 Gold (×1,2), 7,4 Pflanzen, Maschinenzeit 4,6 h; Aufstieg 12.500 Gold, die große Ausgabe kommt mit Level 15. Level 14 braucht kein neues Gebäude. Fragen: Rezepte und Zeiten? Aufträge? Aufstieg? Aussehen?

**Umgesetzt:** v0.44.1 (nur Doku). Wartet auf Tobias' OK.

**Tobias:** „Ja, die Rezepte passen so und der aufstieg + aufträge auch.  Aussehen passt auch. Bisher arbeiten wir überwiegend mit kreisen, rechtecken auf den Bändern. Die Produkte haben bisher noch kein spezifisches aussehen, aber das könnten wir mit unseren kenny teilen evtl auch noch ändern in einem nächsten schritt“

**Umgesetzt:** v0.45.0 – Level 14 „Die Tinktur“ wie im Entwurf: Mörser in der Zimmerei, Tinktur in der Apotheke (je mit eigenem Warenbild), vier Aufträge, Aufstieg 12.500 Gold. Die Idee, die Waren auf den Bändern mit Kenneys Teilen zu gestalten, steht als möglicher nächster Schritt in `STAND.md` und `AUSBLICK.md`.

**Tobias:** „Alles klar ich teste es direkt. Kannst du in der zwischenzeit mal die Kenny assets anschauen und parallel dazu anschauen wie es mit unseren Produkten und einzelteilen aussieht ? Evtl. können wir als v46 diese änderung in angriff nehmen, damit man auch besser unterscheiden kann, was auf dem band liegt“

**Claude** hat Tobias' Kenney-Upload aus der Versionsgeschichte entpackt und die Waren gezählt: 40 Waren können auf ein Band, 31 davon sind im 3D-Test Kugeln in ihrer Farbe (sechs fast weiß, sieben grau). Kenneys Pakete sind Bauteile für Gebäude – als Ware passen nur Zahnräder, Bretter, Stangen und Felsen. Entwurf v0.46.0 (`PLAENE.md`): eigene kleine 3D-Formen im Kenney-Stil für alle 31 Waren, nach Familien mit Erkennungszeichen (Verbände als Rollen mit farbigen Streifen, Blütenhäufchen, Zahnräder, Schlösser …), genauso schnell wie heute. Probebild mit 10 Waren geschickt. Fragen: Richtung? Größe? Alle auf einmal oder in zwei Schritten?

**Umgesetzt:** v0.45.1 (nur Doku). Wartet auf Tobias' Antworten.

**Tobias:** „Die Probebilder haben mir sehr gut gefallen. Die sollen so groß bleiben wie sie sind, beim rauszoomen erkennt man sie sowieso nicht mehr, weshalb es mir nur ein die Ansicht geht, wenn man quasi so halb reinzoomt um einen genauerer überblick zu bekommen. Alles gerne auf einmal“

**Umgesetzt:** v0.46.0 – alle 31 Kugel-Waren mit eigener Form in der Größe des Probebilds, das Stein-Zahnrad mit Zähnen; Claude hat Tobias vor dem Merge das Bild aus dem 3D-Test und die Übersicht aller 40 Waren geschickt. – **Tobias:** „Ja passt so“ → live.

**Tobias:** „Ja, das sieht sehr gut aus. Das Einzige was mir optisch jetzt noch fehlt ist ein passendes Overlay bzw. ein UI, weil wenn ich z.b. die Kräuter auswählen will, fällt es mir schwer zu erkennen, welche kräuter ich gerade ausgewählt habe, deswegen würde ich im nächsten schritt evtl ein gutes oder mehrere Kenny UI herunterladen, die du wieder benutzen kannst, um das Game auch in diesem Schritt auf die nächste Stufe zu führen. Meine zwei nächsten großen Schritten wären ein gutes UI erstellen für das Game und der zweite schritt das Spiel auf die ebene führen mit Anfangsscreen, Namen eingeben und das es kurz die Spielregeln erklärt, aber das würde ich in einem neuen Chat machen, deswegen dokumentiere meine Schritte nur, sodass ich im nächsten Chat schreiben muss "bring dich auf den aktuellen stand" und dann sagst du mir direkt wie wir das mit den kenny UI's machen“

**Claude** hat die Rückmeldung als v0.46.1 festgehalten (nur Doku): Reihenfolge (1) Oberfläche mit Kenneys UI-Paketen, (2) Startbildschirm, Name, kurze Spielregeln, danach Level 15; Vorbereitung für den nächsten Chat in `PLAENE.md` (welche Pakete, Hochladen wie in Chat 23, was sich an Fenstern, Knöpfen und Reitern ändert, Ausgewähltes klar markieren, erste Fragen).

**Umgesetzt:** v0.46.1 (nur Doku). Weiter im nächsten Chat.

### 22.11.2026 – Chat 26: v0.40.0 gemessen, Weiche zurückgestellt, Bereich kopieren, eigene Häuser (v0.40.1 bis v0.43.0)

**Tobias:** „Infomiere dich über den aktuellen Stand. Hier ist mein Feedback zu dem letzten Update v40: Beim heraus und hereinzoomen hab ich jeweils zwischen 60 und 80 Fps. Was sind nun die nächsten Schritte ?“

**Claude:** Die 3D-Ansicht reicht damit (vorher herausgezoomt 40–50). Nach der vereinbarten Reihenfolge kommt die Weiche, dann „Bereich kopieren“. Entwurf v0.41.0 „Weiche“ (in `PLAENE.md`): Vorschlag A (Claudes Empfehlung) – ein Band lässt sich auf eine Ware einstellen und nimmt nur noch sie an; am Abzweig läuft die eingestellte Ware nur dorthin, alles andere in die übrigen Richtungen. Vorschlag B – eigenes Gebäude mit Ware je Ausgang. Regeln: Ware ohne passenden Ausgang bleibt stehen (Stau, „Strecke leeren“), ist das eingestellte Band voll, wartet die Ware, eine Ware je Weiche. Fragen: A oder B? Passen die Regeln? Wie fühlt sich das Verschieben großer Bereiche jetzt an?

**Umgesetzt:** v0.40.1 (nur Doku). Wartet auf Tobias' Antworten.

**Tobias:** „Das Verschieben fühlt sich jetzt auch sehr flüssig an. Die regeln passen so aber ich bin mit beiden Vorschlägen nicht ganz zufrieden. Bisher kann man alles mit eigenen Straßen transportieren und man kommt sich in der Produktion aktuell nicht in die Quere und es hat den Vorteil, dass sich die Weiche nicht staut, weil manchmal brauchen wir 5 teile davon und 10 teile davon und dann würde sich das ganze wohl stauen, deswegen bräuchten wir eher eine Lösung, die dieses Problem umgeht. Eine Weiche macht nur Sinn, wenn man jedes Teil zum gleichen Verhältnis braucht, wie Räderwerke und Zahnradwellen, dann könnte man das zusammenführen das Band aber müsste es wieder trennen, damit es getrennt rein läuft bzw. es können auch beide Teile in den gleichen Eingang, deswegen sehe ich aktuell noch nicht den Vorteil einer Weiche“

**Claude:** Tobias hat recht – im Code bestätigt: Eine Maschine mit zwei Zutaten nimmt jede Zutat an jedem Eingang an; bei gleichem Verhältnis geht ein gemischtes Band schon heute ohne Weiche, bei ungleichem staut es sich mit oder ohne. Vorschlag: Weiche zurückstellen, als Nächstes „Bereich kopieren“ (Entwurf v0.41.0 in `PLAENE.md`): markieren, „📋 Kopieren“, Kopie am Finger ziehen und drehen, „✓ Hier bauen“, danach gleich noch einmal setzen (Stempel) bis „✕ Fertig“; Gebäude mit Einstellung und Bänder kommen mit, Inhalte nicht; Kosten wie beim Bauen, bei zu wenig Waren wird nichts gebaut. Fragen: OK so? Passen „alles oder nichts“ und der Stempel?

**Umgesetzt:** v0.40.2 (nur Doku). Wartet auf Tobias' OK.

**Tobias:** „Ja, das passt so für mich und du kannst das umsetzen. Ja, alles oder nichts ist sehr gut und dann eine kurze Meldung was fehlt, damit man sich darauf auch konzentrieren kann. Ich hab noch eine kleine Anmerkung: Immer wenn ich das Baumenü offen habe, muss ich es mit X schließen. Ich hätte das gerne, dass es so ist, wie bei dem Lager, wenn ich auf die Fläche klicke, dass dann nur die Fläche zu sehen ist und das Baumenü, dann wieder minimiert. Ich muss das Baumenü immer mit X entfernen und das ist schon sehr nervig“

**Claude** (Rückfrage zur Bauleiste): Kurzes Antippen der Karte schließt die Bauleiste, ein angetipptes Gebäude oder Band zeigt dabei sein Infofenster; Wischen verschiebt die Karte weiter, ohne sie zu schließen; nach „✓ Bauen“ bleibt sie offen. Gleich mit in v0.41.0? – **Tobias:** „Ja, mit in v0.41.0“.

**Umgesetzt:** v0.41.0 – Bereich kopieren wie im Entwurf (Stempel, alles oder nichts mit Meldung, was fehlt), dazu schließt Antippen der Karte die Bauleiste. Als Nächstes testet Tobias.

**Tobias:** „Ja, sie steht an einer sinnvollen Stelle. Der Stempel hilft auch und das schließen der Bauleiste fühlt sich ebenfalls gut an. Lass uns jetzt die nächsten Schritte planen“

**Claude:** Die vereinbarte Reihenfolge ist erledigt. Vorschlag (in `PLAENE.md`): v0.42.0 Erinnerung zum Sichern (nach jedem Aufstieg „💾 Jetzt sichern“, im Menü „Zuletzt gesichert: …“); Level 14 und 15 planen, sobald Tobias etwa Level 11 erreicht; kurze Einführung, sobald er den 3D-Test anderen zeigen will; später Rechenwerkzeug, eigene Häuser, Verbesserungen mit Erfahrung, Wirtschaft, 2D entfernen, Code-Durchsicht. Fragen: Reihenfolge? Erinnerung nur nach Aufstieg oder auch beim Öffnen? Welches Level? Stört gerade etwas?

**Umgesetzt:** v0.41.1 (nur Doku). Wartet auf Tobias' Antworten.

**Tobias:** „Mir ist gerade eingefallen, dass die zweite Fläche zum Kaufen auch 170 Gold kostet, das könnten wir auf 500 ändern, damit wir eine schöne Steigerung von 170 af 500 auf 2500 erreichen können. Ich hab mittlerweile auch Level 10 erreicht. Ich würde auch gerne erst bis Level 13 kommen, bevor wir weiterplanen, weil dann kann ich das ganze Gefühl mitnehmen. Sichern finde ich ehrlich gesagt nicht so wichtig. Ich wechsel mein Gerät nicht und lösche in diesem Browser keine Cookies oder Daten, weil der auch für die Uni ist. Kurze Einführung finde ich cool, aber würde ich erst machen, wenn ich das Spiel tatsächlich anderen Leuten zeigen möchte. Was mich bei den ganzen Punkten am meisten angesprochen hat, war tatsächlich die individuellen Häuser. Dadurch bekommt das Game nochmal mehr Aussehen und man besser erkennen, welches Gebäude was gerade macht.  Wie stellst du dir das vor und welche Möglichkeiten haben wir mit unseren Assets ?“

**Claude** hat Tobias' Upload der drei Kenney-Pakete aus Chat 23 in der Versionsgeschichte gefunden (alles da, nichts neu herunterladen), Kenneys Übersichtsbilder geschickt und den Entwurf geschrieben (`PLAENE.md`): je Gebäude Bauart, Dachform, Erkennungszeichen und ein Teil, das sich beim Arbeiten bewegt oder leuchtet (Tabelle für 12 Gebäude); A rein Mittelalter oder B (Empfehlung) mit ein paar Technik-Teilen (Zahnräder, Glasrohre); Flächenpreise 170 → 500 → 2.500; v0.42.0 Level 2–6 mit den Flächenpreisen, v0.43.0 Level 7–12. Fragen: A oder B? Ideen je Gebäude? Flächenpreise richtig verstanden? Reihenfolge?

**Umgesetzt:** v0.41.2 (nur Doku). Wartet auf Tobias' Antworten.

**Tobias:** „Da hab ich mich verschrieben. Die Preise sollen bei der dritten Fläche bei 2000 bleiben. B passt für mich sehr gut. Die Reihenfolge passt auch mit den level 2-6, dann sehe ich auch direkt eine optische Veränderung bei meiner Hauptproduktionsstätte“

**Umgesetzt:** v0.42.0 – eigene Häuser für Steinbruch, Steinmetz, Schmelzhütte, Zimmerei, Feinschmiede und Schlosserei (Möglichkeit B), Flächenpreise je Seite 170 → 500 → 2.000. Claude hat Tobias vor dem Merge Nahaufnahmen der sechs Häuser geschickt. – **Tobias:** „ok“ → live.

**Tobias** (nach dem Test von v0.42.0): „Ja, man erkennt alles und es sieht sehr gut aus für den ersten Entwurf. BLeibt auch flüssig auf dem Tablet. Mach gerne weiter“

**Umgesetzt:** v0.43.0 – eigene Häuser für Erntebank, Webstube, Kräuterstube, Schreibstube, Uhrmacherei und Apotheke; Nahaufnahmen vor dem Merge. – **Tobias:** „ok“ → live.

### 22.11.2026 – Chat 25: schnellerer Start getestet, neue Ordnung, Start im 3D-Test, Analyse, Belastungstest, 3D schneller (v0.36.1 bis v0.40.0)

**Tobias:** „Hey, ich habe an meinem Pc den neuen Start getestet und bisher fühlt er sich sehr gut an. Die neuen 500 Startgold fallen nicht so schwer ins Gewicht und erleichtern die ersten Level erheblich. Lies dir den aktuellen Stand durch und berichte mir bei welchem Schritt wir gerade sind.“

**Claude** hat `STAND.md` und `SPIEL.md` gelesen, Tobias' Rückmeldung als v0.36.1 festgehalten (nur Doku) und berichtet: Der schnellere Start (v0.36.0) war der letzte Schritt; als Nächstes entscheidet Tobias zwischen weiteren eigenen Häusern für die Gebäude ab Level 2 im 3D-Test, 3D für die echte Fabrik oder Level 14 (Mörser).

**Umgesetzt:** v0.36.1 (nur Doku).

**Tobias:** „Prinzipiell spiele ich aktuell viel in der 3D Welt um alles nochmal neu zu testen, deswegen würde ich gerne meinen Spielstand, den ich auf Level 13 habe gerne "hinten anstellen" und mich auf die 3D welt konzentrieren, weil ich dadurch das Spielerlebnis viel besser nachvollziehen kann. Mich stört es aktuell nicht, dass die Häuser noch alle "gleich" aussehen, weil es mir mehr um das Spielerlebnis geht, als um das äußere Design. Die Logik ist mir erstmal wichtiger. Bei dem 3D stand bin ich auf lvl 7 und bald 8. Aktuell habe ich noch keine Probleme, weil die Bänder noch einen sehr "einseitigen" Weg haben und ich die Produktion nur umstellen muss statt ganze Produktionsstätten zu verschieben. Eventuell können wir im repo auch die Dateien so ordnen, dass wir die wichtigsten Sachen in einen neuen Abschnitt reinholen für Logik + Grafik, damit wir die Ordner vom KB - MB verhältnis klein halten können und du nicht so viel lesen musst. Daher würde ich als ersten Schritt eine neue Ordnerstruktur wollen, damit wir einfacher und schneller arbeiten können und im nächsten Schritt will ich dass du in die Rolle eines Spielentwicklers schlüpfst und analysierst, was die sinnvollsten nächsten Schritte wären und mir diese vorschlägst.“

**Claude** hat gemessen, was es liest: zu Beginn jedes Chats etwa 62 KB Doku (`CLAUDE.md`, `STAND.md`, `SPIEL.md`), beim Programmieren dazu `TECHNIK.md` (37 KB) und die betroffenen Dateien; die großen Ordner (three.js 2,3 MB, Kenneys Modelle 0,9 MB) liest es nie, das Archiv nur per Suche. Vorschlag v0.37.0 „Neue Ordnung“ (Entwurf in `PLAENE.md`): Doku schlanker (`STAND.md` und `SPIEL.md` kürzer, die großen Tabellen nach `docs/inhalte/`, `TECHNIK.md` kurz), Code in Bereiche (`src/core` Logik, `src/ui` Oberfläche für 2D und 3D, `src/view3d` 3D-Grafik, `src/view2d` 2D-Grafik hinten angestellt), Browser-Test aufgeteilt; am Spiel ändert sich nichts. Fragen: Link direkt im 3D-Test öffnen? Grafik-Probe entfernen? Danach die Analyse als Spielentwickler.

**Umgesetzt:** v0.36.2 (nur Doku: Tobias' Wunsch und der Entwurf festgehalten). Wartet auf Tobias' OK.

**Tobias:** „Finde deine Ideen sehr gut. Frage 1: Ja, jetzt das 3D Spiel fokussieren, weil die Kenny dateien alle funktionen und das Spiel spielbar aussieht und funktioniert. Frage 2: Ja können wir gernen entfernen und auf das Hauptspiel auf lvl 7 konzentrieren“

**Umgesetzt:** v0.37.0 – neue Ordnung wie im Entwurf, dazu die Grafik-Probe entfernt (mit dem Modern-Stil, den nur sie hatte, und den Modellen, die nur sie brauchte). Als Nächstes v0.38.0: Der Link öffnet direkt den 3D-Test.

**Umgesetzt:** v0.38.0 – der Link öffnet den 3D-Test; die echte Fabrik über ☰ → „🗺️ Zur echten Fabrik (2D)“ (`?ansicht=2d`), zurück mit „🧊 Zurück zum 3D-Test“. Als Nächstes: Claudes Analyse als Spielentwickler.

**Tobias:** „Ja, du kannst loslegen.“

**Claude** hat als Spielentwickler analysiert (ausführlich in `PLAENE.md`, „Analyse als Spielentwickler“) und dafür gemessen, wie viele Zeichenaufrufe die 3D-Ansicht braucht: Startfabrik etwa 260 je Bild, eine voll bebaute Fläche (156 Gebäude, 312 Bänder) etwa 3.700 bis 6.200 – ein Tablet schafft flüssig grob 1.000–2.000. Vorschlag der Reihenfolge: v0.39.0 Belastungstest-Knopf (Tobias misst auf dem Tablet), dann 3D schneller und Schilder von weitem schlichter, dann Weiche, Bereich kopieren, Level 14 und 15 parallel planen; kleine Gewinne: Erinnerung zum Sichern, Rechenwerkzeug für die Zahlen. Fragen: Passt die Reihenfolge? Wann ungefähr Level 13 im 3D-Test?

**Umgesetzt:** v0.38.1 (nur Doku). Wartet auf Tobias' Entscheidung.

**Tobias:** „Ja, diese Reihenfolge passt mir. Lass uns erst sehen, wie der Belastungstest ist, weil ich bald auf level 8 bin und dann geht es eigentlich zückig weiter auf lvl 9 weil ich bisher alle einzelteile der schlosserei schon automatisiert habe. Level 14 können wir erstmal hinten anstellen, da ich auch auf den token verbrauch achten muss und dadurch immer wieder kleine Spielpausen für mich entstehen. Ich denke, es wird noch etwas dauern, bis ich auf level 13 bin“

**Umgesetzt:** v0.39.0 – Belastungstest wie in der Analyse beschrieben (im Testmodus ☰ → „🏭 Belastungstest (volle Fabrik)“, wird nie gespeichert). Als Nächstes misst Tobias auf dem Tablet.

**Tobias:** „Herausgezoomt waren es 40-50 FPS und es war leicht ruckelig. Beim verschieben ist mir schon aufgefallen, dass wenn ich größere Produktionen verschieben will, dass es leicht ruckelig ist. Wenn ich ganz nah hineinzoome habe ich so 70 FPS und alles fühlt sich sehr flüssig an.“

**Claude:** Entwurf v0.40.0 „3D schneller und lesbarer“ (in `PLAENE.md`): gleiche Teile in einem Rutsch, sparsamere Schatten, Vorschau beim Verschieben nur einmal bauen, Schilder von weitem schlicht (A: nur Statuslicht, B: kleiner). Wartet auf Tobias' OK.

**Umgesetzt:** v0.39.1 (nur Doku).

**Tobias:** „Sehr gut herausgefunden. Ich würde mich vor Vorschlag a aussprechen. Mir ist auch aufgefallen, dass wenn ich über Bäume baue, die Bäume nicht verschwinden, sondern dann einfach aus dem Haus z.b. herausragen. Gerne ok“

**Umgesetzt:** v0.40.0 – wie im Entwurf, mit Vorschlag A (von weitem nur Statuslichter) und den Bäumen nur außerhalb der Welt. Gemessen: volle Fläche herausgezoomt 6.200 → 730 Zeichenaufrufe je Bild. Auf dem Handy schaltet „von weitem“ später um (sonst zeigte schon die Startansicht nur Lichter). Als Nächstes misst Tobias; danach die Weiche.

### 21.11.2026 – Chat 24 (Fortsetzung): Tobias testet den 3D-Test (nach v0.34.0)

**Tobias** (mit zwei Screenshots: das Tor nah, seine 3D-Fabrik auf Level 4): „Alles läuft sehr flüssig. Eine FPS Anzeige konnte ich nicht entdecken. Mit zwei fingern drehen läuft auch. Ich finde das richtige Feld, allerdings ist das versandportal falsch ausgerichtet. Man muss die Ware seitlich rein befördern, damit die ware im lager ankommt. Ich habe mal weiter gespielt und bin mittlerweile in level 4 angekommen. Die sucht hat mich direkt wieder gefesselt. Mir ist aufgefallen, dass man am Anfang sehr lange warten muss bis man die einzelnen Aufträge erledigt hat und evtl. können wir den Prozess etwas beschleunigen mit mehr Startgold, damit man etwas zügiger am Anfang Rohstoffe kaufen kann, um Sachen zu verkaufen. Ich denke, wir sollten am Anfang die Verkaufszeit auch etwas erhöhen, weil der Verkauf mit den kleinen Beträgen doch sehr langsam abläuft. Ich dachte, dass wir alle 15 sekunden etwas verkaufen statt 25 sekunden. Was mir auch gefällt ist diese 3D welt. Später könnte man daran denken, dass man um die eigene Produktion eine Stadt baut, bei der man sieht, wie die Stadt von level zu level wächst, aber das sind Gedanken, die sehr weit in der Zukunft liegen. Teil 2 finde ich auch gut mit dem Bereich markieren und Fläche kaufen“

**Claude:** Das Tor ist um 90° falsch gedreht (Claudes Fehler: der Bogen zeigt zur Seite, der Eingang – der blaue Pfeil – liegt aber an der Wand); die Spielregeln sind richtig, nur das Modell muss gedreht werden. Die Bilder pro Sekunde zeigt das Spiel bisher nur im Testmodus. Vorschlag (noch nicht freigegeben): v0.34.1 Tor drehen; v0.35.0 schnellerer Start (mehr Startgold, Theken auf Level 1–3 alle 15 Sekunden, Bilder pro Sekunde im 3D-Test immer sichtbar); v0.36.0 3D-Test, Teil 2. Rückfrage: wie viel Startgold?

**Tobias:** „Im Testmodus habe ich 70-119 FPS, das konnte ich sehen. Frage 1: Ich dachte da an 500 Gold sozusagen als "Startkapital" - kann man später vermutlich auch geschichtlich ganz gut einbinden. Frage 2: Können wir Tor drehen und Bereich markieren, die Punkte als nächsten Schritt gemeinsam machen ? Dann kann ich wenn das fertig ist auch viel besser das Spiel weiter ausprobieren auf der 3D Version. Schneller Start können wir gerne danach machen.“

**Umgesetzt:** v0.35.0 – Tor richtig gedreht, Bereich markieren und verschieben sowie Fläche kaufen im 3D-Test. Als Nächstes v0.36.0: schnellerer Start (500 Gold Startkapital, Theken auf Level 1–3 alle 15 Sekunden, Bilder pro Sekunde im 3D-Test immer sichtbar).

**Claude** hat v0.35.0 vorgestellt und für v0.36.0 um ein OK gebeten (die 500 Gold gibt es nur bei einem neuen Spiel, Tobias' 3D-Fabrik auf Level 4 und die echte Fabrik merken nichts).

**Tobias:** „OK“

**Umgesetzt:** v0.36.0 – schnellerer Start.

### 21.11.2026 – Chat 24: 3D-Test, Teil 1 – Level 1 in 3D (v0.34.0)

**Tobias:** „Bringe dich auf den aktuellen Stand“

**Claude** hat `STAND.md`, `SPIEL.md`, den Abschnitt „Level 1 in der neuen Grafik“ in `PLAENE.md` und den Code gelesen und den Plan vorgestellt: **3D-Test in zwei Versionen** – v0.34.0 „Level 1 in 3D spielen“ (Menü ☰ → „🧊 3D-Test (Level 1)“, Mittelalter in Spiel-Farben, freie Kamera mit zwei Fingern drehen und zoomen, Knöpfe ⟲ ⟳, Tasten Q/E; Holzfällerlager, Sägewerk, Lagerhaus aus der Probe; Bänder aus Holz; über jedem Gebäude ein schwebendes Schild mit Warenbild, Statuslicht und Fortschrittsring; Anschlüsse als Pfeile am Boden; Bauen mit halbdurchsichtiger Vorschau grün/rot, Bänder ziehen, Abreißen; Infofenster, Laden, Aufträge wie heute; Effekte Wasserrad, Hüpfen, Schatten; Verschieben, Bereich markieren und Fläche kaufen noch ausgegraut) und v0.35.0 (Verschieben, Bereich markieren, Fläche kaufen und Tobias' Wünsche aus dem Test). Spielregeln und Spielstand-Format bleiben, das 2D-Spiel bleibt Standard. Kenneys drei Pakete liegen noch vollständig im Verlauf des Projekts – nichts muss neu hochgeladen werden. Fragen: 1. eigener Test-Spielstand ab Level 1 (A) oder Schalter für die echte Fabrik (B)? 2. Versandportal: Torbogen mit Wirbel, Turm mit Fahne, Verladestelle mit Karren oder eigene Idee? 3. Passt die Aufteilung?

**Tobias:** „Frage 1: Da entscheide ich mich für A. Ich will es erstmal testen, bevor wir die ganze Spielwelt in die "Neue Grafik" holen. Frage 2: Ich würde das Versandportal erstmal rausnehmen. Wir haben mit dem Zwischenlager die Option Waren von der Produktion in das aktive Verkaufslager zu schicken. Ich würde mir erstmal anschauen, was du zauberst und danach können wir noch das Feintuning machen.“

**Claude** hat auf einen Haken hingewiesen: Ohne Versandportal bleibt der Start stecken (Holzblöcke kommen nur übers Portal ins Laden-Lager; das Sägewerk kostet 40 Holzblöcke, das Lagerhaus 8 Holzplatten – deshalb steht das Portal seit v0.7.0 schon beim Start da). Vorschlag: Im 3D-Test steht beim Start ein **Lagerhaus statt des Versandportals**; Waren kommen über „↩ Ausräumen ins Laden-Lager“ in den Laden; das Portal fehlt in der Bauleiste des 3D-Tests; das 2D-Spiel behält seine Portale. Rückfrage, ob das so passt.

**Tobias:** „Alles klar, hatte ich vergessen. Dann lass uns das Versandportal einfach sehr schlicht halten mit deinem ersten Vorschlag dass es mehr ein Torbogen ist mit einem kleinem mythischen Schauer“

**Claude** baut v0.34.0 nach dem Entwurf in `PLAENE.md` (Versandportal als schlichter Torbogen mit leichtem Schimmer, das Portal bleibt im 3D-Test). Als Torbogen dient Kenneys kleines Burgtor aus dem Castle Kit (lag noch im Verlauf des Projekts), in warmem Steingrau mit violettem Schimmer.

**Umgesetzt:** v0.34.0 – Menü ☰ → „🧊 3D-Test (Level 1)“. Als Nächstes testet Tobias; danach Teil 2 (v0.35.0).

### 21.11.2026 – Chat 23 (Fortsetzung): Grafik-Probe, Teil 2 getestet (v0.33.1)

**Tobias:** „ICh würde gerne in einem neuen Chat weitermachen, deswegen würde ich dir jetzt mein Feedback geben und danach in einem neuen Chat weitermachen. Ich habe auf dem Tablet konstant 60 fps. Mir gefällt das frei drehbare besser, weil man dadurch vermutlich besser bauen und auch sieht, wenn man ein zulauf verstopft ist. Mir gefällt Mitteralter besser. Finde die Idee mit den Häusern auch sehr gut, dass wir die Häuser einfach spezifisch gestalten, sodass man weiß, was ein Sägewerk ist und was nicht. Das Versandportal sieht noch etwas komisch aus. Mir gefällt die SPielfarbe besser, weil es mehr harmoniert. Mir gefällt allerdings auch der Mix aus Modern und Mittelalter. Evtl. könnte man die modernen Gebäude noch etwas mitteraltermäßiger gestalten ohne Greifarm. Ich würde gerne in den nächsten Schritten ein wenig mit der Grafik weitermachen, um das Spiel evtl. Testweise auf dieses Niveau zu heben, sodass man evtl. das erste Level in dieser neuen Grafik spielen kann. Wie gesagt, ich würde danach in einem neuen Chat weitermachen wollen“

**Claude** hat das Feedback als v0.33.1 festgehalten (nur Doku): Entscheidungen in `ENTSCHEIDUNGEN.md`, offene Frage 15 in `STAND.md`, und als nächsten Schritt „Level 1 in der neuen Grafik“ mit Claudes ersten Gedanken in `PLAENE.md` – der Plan wird im neuen Chat vorgestellt, programmiert wird erst nach Tobias' OK.

**Umgesetzt:** v0.33.1 (nur Doku). Weiter im neuen Chat.

### 20.11.2026 – Chat 23: Kenney-Modelle in der Grafik-Probe (v0.33.0)

**Tobias:** „Bringe dich auf den aktuellen Stand der Dinge.“

**Claude** hat `STAND.md` und `SPIEL.md` gelesen und wie verabredet gefragt, ob wir mit den Kenney-Sachen weitermachen.

**Tobias:** „Ja, lass uns loslegen. Ich werde dir die Freigabe am PC geben“

**Claude** hat eine eigene Arbeitsumgebung „ErstesSpiel“ vorgeschlagen, die kenney.nl und www.kenney.nl erreicht – Tobias hat sie bestätigt, die Verbindung stand. kenney.nl selbst lässt aber keine automatischen Programme zu (Fehler 403); den Download über den Download-Knopf der Seite hat Claudes Arbeitsumgebung als Umgehen einer Sperre gestoppt. Claude hat das nicht weiter versucht und den verabredeten Ausweg vorgeschlagen: Tobias lädt die Pakete (Fantasy Town Kit, Castle Kit, Factory Kit – das frühere Conveyor Kit steckt im Factory Kit) selbst herunter und auf GitHub in den Arbeitsstand hoch.

**Tobias:** „Ich kann auf den Ordner Sleepy Pascal leider nicht zugreifen, weil Github sagt, 404 die Seite exisitiert nicht. Ich habe alle 3 Pakete heruntergeladen.“

**Claude:** Der Arbeitsstand war noch nicht auf GitHub – Claude hat ihn hochgeladen, danach ging der Link.

**Tobias:** „Hat funktioniert. Ich hab jetzt einen gelben Text mit "Claude/sleepy-pascal...." had recent pushes 5 seconds ago und dann kann ich in grün auswählen "Compare & Pull request". Soll ich das auswählen ?“ – **Claude:** Nein, den Pull Request macht Claude selbst, wenn eine Version fertig ist.

**Claude** hat die Pakete ausgepackt (alle CC0, Modelle meist 5–50 KB), zwei Übersichtsbilder mit der Auswahl je Gebäude geschickt und den Plan v0.33.0 vorgestellt (`PLAENE.md`) mit drei Fragen: 1. Farben – Kenneys eigene oder die des Spiels (Vorschlag: ein Schalter für beides)? 2. Bänder im Mittelalter aus dem Factory Kit in Holz umfärben? 3. Leuchtring als Versandportal behalten (über Steinbecken bzw. Metallsockel)?

**Tobias:** „1. Ja lass uns beides probieren, damit ich alles sehen kann. Wir sind aktuell ja in der Testphase. 2. Ja bin ich mit einverstanden. 3. Ja, bin ich auch mit einverstanden. Lass uns direkt damit anfangen“

**Umgesetzt:** v0.33.0 – Grafik-Probe, Teil 2 mit Kenneys Modellen und dem Schalter „Farben: Kenney ↔ Spiel“.

### 20.11.2026 – Chat 22 (Fortsetzung 4): Grafik-Probe getestet (v0.32.1)

**Tobias:** „Ich war eben noch am Tablet und da stand, dass ich die Freigabe nur am PC machen kann, deswegen sitze ich jetzt am PC, aber ich habs gerade auf dem Tablet getestet und dort habe ich 60-90 fps. Speicher gerne alles im repo und dann würde ich danach einen neuen Chat anfangen. Ich würde gerne, dass ich dir schreibe "Bringe dich auf den aktuellen stand" und dann fragst du mich, ob wir mit den Kennysachen nochmal starten wollen, dann würde ich dir die Freigabe geben, weil ich am PC bin. Falls das immer noch nicht funktionieren sollte, dann würde ich dir die Dateien einfach auf github hochladen“

**Claude** hat alles als v0.32.1 festgehalten: das Ergebnis (60–90 Bilder/s auf dem Tablet) und genau den gewünschten Ablauf für den nächsten Chat (in `STAND.md` unter „Nächster Schritt“ und in `PLAENE.md`, „Grafik-Probe, Teil 2“).

**Umgesetzt:** v0.32.1 (nur Doku). Weiter im neuen Chat.

### 20.11.2026 – Chat 22 (Fortsetzung 3): Grafik-Probe, Teil 1 (v0.32.0)

**Tobias:** „Passt alles so, du darfst loslegen.“

**Claude** hat für kenney.nl eine eigene Umgebung „ErstesSpiel“ vorgeschlagen (Bestätigungsfenster) – das wurde abgelehnt. Auf npm gab es keine offiziellen Kenney-Pakete. Deshalb hat Claude die Grafik-Probe ohne Kenney-Modelle gebaut (Gebäude als Platzhalter aus einfachen Formen), sonst wie geplant: three.js im Projekt, eigene Seite mit Menü-Eintrag, Holz- und Glas-Straße nach den echten Spielregeln, Schalter für Kamera, Stil, Effekte, Tag/Abend, Bilder pro Sekunde. Fragen an Tobias: wie die Kenney-Modelle ins Projekt kommen sollen (selbst freigeben, hochladen oder erst mit Platzhaltern weiter) und welche Pakete.

**Umgesetzt:** v0.32.0.

### 20.11.2026 – Chat 22 (Fortsetzung 2): Grafik-Probe geplant (v0.31.1)

**Tobias** (zu Claudes 4 Grafik-Fragen): „Ich würde gerne eine kleine Grafik-Probe jetzt machen, damit ich weiß in welche Richtung das Spiel gehen kann und welche Richtung mir am besten gefällt. 2. Da weiß ich ehrlich gesagt nicht, was einfacher ist und leichter umzusetzen. In erster linie geht es mir darum, dass ich einfach mal sehen kann, was alles möglich ist. Immerhin "entwickle" ich das Spiel alleine mit dir und hab kein Team hinter mir. Ich sehe bei Youtube wie Gamer neue Spiele ausprobieren und alles so im "schäle die kartoffel", "Finde die Nadel im Heuhaufen", "Säubere den Mond vom Staub" extrem gut ankommt und ehrlich gesagt auch nicht so aussieht, als hätte das ein Entwickler team entworfen sondern wäre überwiegend AI codet. Trotzdem haben diese Spiele eine gute Gamemechanik und alles fühlt sich flüssig an, deswegen würde ich gerne sehe, was möglich ist und in welche Richtung wir gehen. ICh weiß ehrlich gesagt nicht, wie der Markt ist, aber gefühlt entwickeln alle aktuell Games für Steam etc und Mobile Games kommen kaum noch gute nach. Es gibt seit jahren die gleichen Mobile games. 3. Stil sollte im Mittelalter spielen, aber wenn es nur Assets gibt, die moderner sind, dann können wir das auch gerne erstmal modern halten. Jenachdem was die Assets bieten. 4. Das können wir erstmal nach hinten stellen, aber ich wollte so langsam alle "Punkte" mal anfassen“

**Claude** hat geprüft, was die Arbeitsumgebung herunterladen kann (three.js über npm geht, kenney.nl ist gesperrt), und den Plan für die Grafik-Probe geschrieben (`PLAENE.md`, „Entwurf v0.32.0“): eigene Seite mit Menü-Eintrag, kleine Holz- und Glas-Straße nach den echten Spielregeln, Schalter für Kamera (schräg wie Clash of Clans ↔ frei), Stil (Mittelalter ↔ modern), Effekte und Tag/Abend, Bilder pro Sekunde. Antwort zu „was ist einfacher?“: 3D mit fertigen Modellen; der Clash-of-Clans-Look ist dort nur eine Kamera-Einstellung, deshalb zeigt die Probe beides. 4 Fragen an Tobias.

**Umgesetzt:** v0.31.1 (nur Doku).

### 20.11.2026 – Chat 22 (Fortsetzung): Level 13 „Die Glashütte“ (v0.31.0), Frage nach 3D-Grafik

**Tobias** (zum Entwurf Level 13): „Klingt alles sehr gut nur ich würde gerne die Zeit für die Fläschen von 10s auf 30s erhöhen. Ich finde der Ofen könnte bereits ab Spielbeginn Ofen heißen. Natürlich wird er erst ab lvl 9 eingeführt, aber das sollte der neue Name sein. Ich denke die Preise passen so. Ich werde das ganze ausprobieren und spielen und dann werde ich sehen inwiefern wi noch feintunen müssen. Die Aufträge passen auch so. Sorry, da hab ich mich wohl verschrieben. Ich meinte Steinplatte + 3 holzstäbe, damit der Möser aus Stein ist und der Stab aus Holz. Von mir aus, kannst du das gerne so umsetzen. Ich hab noch eine Frage, die du gerne nachdem du alles codiert hast beantworten kannst. Mittlerweile nimmt das Spiel schon etwas Form an und wir haben bald unsere Level und unsere "Grundstruktur". Darauf können wir natürlich aufbauen und das Spiel beliebig erweitern bzw. die Aufträge "schwieriger" machen, sodass es länger dauert ein Level zu erreichen. Aktuell spiele ich im Browser ohne Musik und alles noch 2D gehalten. Natürlich verstehe ich, dass das Ganze fürs entwickeln so viel einfacher ist, weil wir nur die Logik testen. Ich würde aber gerne mich so langsam von diesem 2D Design trennen und das ganze mehr in die "Clash of Clans"-Richtung bringen. Wir hatten schon mal über kostenlose Assets und alles weitere gesprochen. Können wir nachdem wir das codiert haben uns darüber unterhalten wie wir rein theoretisch dieses 2D-Browser-Game in eine 2D/3D Spielewelt übersetzen können ? Ich habe bei Kenny beispielsweise schon ein kostenloses Factory Asset gesehen“

**Claude** hat v0.31.0 gebaut: Der Kohlenmeiler heißt in allen Leveln „Ofen“ und brennt ab Level 13 auch Sand (1.100 Gold beim Händler) zu 100 Glas; die Schmiede macht ab Level 13 aus 5 Glas ein Fläschchen (30 s); Aufstieg 10.000 Gold, 4 Aufträge; die 6. Theke lässt sich ab Level 13 für 150.000 Gold kaufen. Der Mörser (1 Steinplatte + 3 Holzstäbe) ist für Level 14 festgehalten. Danach die Grafik-Frage beantwortet (`PLAENE.md`, „Überlegung: Weg vom 2D-Design“): Spielregeln und Darstellung sind getrennt, nur der Zeichner wird ausgetauscht; Clash of Clans hat eine feste Schrägansicht; Wege A (Bilder in Schrägansicht), B (echtes 3D mit three.js und Kenney-Modellen), C (Engine-Wechsel, nicht jetzt); Empfehlung B, zuerst eine Grafik-Probe als eigene Seite; Kenney-Pakete sind CC0, Factory/Conveyor Kit modern, Castle/Fantasy Town Kit mittelalterlich. 4 Fragen an Tobias.

**Umgesetzt:** v0.31.0.

### 19.11.2026 – Chat 22: Antworten zum Tränke-Kapitel, Entwurf Level 13 (v0.30.3)

**Tobias:** „Hey, lies dir den aktuellen Stand der Dinge durch. Wir hatten uns mit den nächsten level beschäftigt und ich sollte dir auf deine Frage antworten.“

**Claude** hat die 6 Fragen aus dem Plan v0.30.2 noch einmal gestellt, je mit einem Vorschlag: Ofen mit Sand → 100 Glas, Glas nur dort; Fläschchen in der Schmiede; Mörser als Ware in der Zimmerei (der Steinmetz hat nur 1 Eingang); Tinktur und erster Zaubertrank in der Apotheke, dafür mehr als 3 Einstellungen; vorerst kein Reiter „Tränke“; Aufstieg 10.000 Gold.

**Tobias:** „Bisher dient der Kohlenmeier nur der Verbrennung. Ich würde ihn gerne in Ofen unbennenen und Glas gibt es nur dort, also aus Sand wird dort Glas. 2. Gerne in der Schmiede, dann machen wir aus 5x Glas ein Fläschen. 3. So ähnlich habe ich mir das auch vorgestellt. Aus einer Steinplatte und einem Holzstab machen wir den Mörser. Ich würde den Möser aber gerne etwas mehr regulieren, indem wir kein Verhältnis von 1:1 nehmen, sondern evtl. eine Holzplatte und 3 Holzstäbe. Auf Level 15 kann man dann mit 10 Mörsern und 10 Räderwerke ( oder was am meisten sinn macht ) eine Maschine bauen mit der man dann alles zerkleinern kann zu Staub. So erschaffen wir nur neue Maschinen bei denen es Sinn macht, weil man in einer Zimmerei z.b. nicht wirklich aus Blüten, Blütenstaub macht. Ich finde es sehr wichtig, dass das Ganze auch Sinn ergibt. 4. Ja, die Logik dahinter finde ich passend, aber wie genau wir das machen schauen wir nochmal, wenn wir bei diesem level angekommen sind, weil ich dann auch schauen muss, wie sieht es mit den Produktionsstraßen aus, wie viel Platz brauchen wir und was macht am meisten Sinn, das ganze anzubinden, bzw. wie. 5. Tränke braucht noch kein eigener Reiter, weil ich das Spiel erstmal selbst bis dahin spielen will, umzusehen wie alles läuft. 6. Ja, das passt alles so. Mittlerweile macht man auch nicht mehr das große Geld, weil es länger dauert bis ein gewissen Produkt fertig ist, von daher können wir erstmal so im Flow bleiben.“

**Claude** hat die Antworten als v0.30.3 festgehalten (Entscheidungen, Leitlinie „neue Maschinen nur, wo es Sinn ergibt“ in `SPIEL.md`) und den Entwurf für Level 13 „Die Glashütte“ geschrieben (`PLAENE.md`): Ofen mit Sand (1.100) → 100 Glas (je 12) in 15 Minuten, Schmiede ab Level 13 „Fläschchen“ (5 Glas → 1, 10 s, 72), Aufstieg 10.000 Gold, 6. Theke ab Level 13 für 150.000, 4 Aufträge (3.147 Erfahrung). 4 Fragen an Tobias, darunter: Holz- oder Steinplatte für den Mörser?

**Umgesetzt:** v0.30.3 (nur Doku).

### 19.11.2026 – Chat 21 (Fortsetzung 4): Tränke-Kapitel – alte Maschinen statt neuer (v0.30.2)

**Tobias** (zum Entwurf v0.30.1): „Das Grundkonzept spricht mich schon an, aber ich möchte auch nicht, dass wir bei jedem Level eine neue Maschine entwickeln. Wir haben z.b. den Kohlenmeiler, den wir in Ofen unbennen könnten und dann können wir damit auch Sand zu Glas brennen. Ich möchte eher, dass man bei höheren Level neue Funktionen der Maschinen freischalten kann, sodass man eine lange Zeit bei dem Kohlenmeiler nur Holz zu Kohle machen kann, aber mit level 13 dann auch Sand zu Glas. So sparen wir auch im Reiter Platz für neue Maschinen. Man könnte dann in der Feinschmiede neben Eisenblech und Stangen auch Glas herstellen aus Sand, so bekommen alte Maschinen auch einen neuen Nutzen für fortgeschrittene Level. In der Schmiede dann beispielsweise aus Glas dann Fläschen. Das ist eher die Vorgehensweise, die ich mir vorstelle. Dann könnte man auf Level 14 versuchen dass wir den Mörser herstellen als Produkt, sodass wir auf Level 15 mit dem Mörser dann eine neue Maschine bauen können, damit wir die Kräuter, Kohle und Sand zu Staub verarbeiten können, um mit dem Staub dann widerrum neue Produkte zu haben und daraus dann auch neue Dinge herzustellen. Aus Fläschen + Kräutermischung kann man dann irgendwie die erste ‚Grundzutat‘ herstellen mit der man dann im nächsten Schritt diese Grundzutat + Kamilienblüten oder so den ersten Zaubertrank herstellen kann, aber ich möchte nicht, dass wir nach level 20 dann plötzlich 500 verschiedene Maschinen haben. Ich würde die alten Maschinen eher mit neuen Funktionen austatten, dann können wir den Namen der Maschinen auch viel allgemeiner halten. Die Idee, dass wir aus dem Glas noch eine Linse herstellen und daraus eine Lupe und/oder Fernrohr finde ich gut. Ich würde nach deiner Antwort gerne im neuen Chat weitermachen, deswegen halte alles wichtige fest, gib mir eine kurze einschätzung, damit ich dir im neuen Chat darauf antworten kann“

**Claude** hat alles als v0.30.2 festgehalten (neue Leitlinie in `SPIEL.md`, Entscheidungen, überarbeiteter Plan mit Einschätzung und 6 Fragen in `PLAENE.md`) und kurz eingeschätzt: passt gut (Einstellungen ab einem Level und Rohstoff-Gebäude mit mehreren Rohstoffen gibt es schon); Kohlenmeiler als „Ofen“ nimmt ab Level 13 einen Sack Sand → Glas; Hinweis, dass Eisenbleche und -stangen aus der Schmiede kommen (die Feinschmiede macht Scharnier, Schlüssel, Zirkel) – Fläschchen also in der Schmiede oder in der Feinschmiede mit Holzstab als Stopfen; Mörser als Ware (Level 14) und Maschine (Level 15); Grundzutat „Tinktur“ und erster Zaubertrank in der Apotheke; der Reiter „Tränke“ wird vielleicht erst später gebraucht.

**Umgesetzt:** v0.30.2 (nur Doku). Weiter im nächsten Chat.

### 19.11.2026 – Chat 21 (Fortsetzung 3): Lager getestet, Entwurf Tränke-Kapitel (v0.30.1)

**Tobias:** „Schreib mir den Entwurf für das Tränke-Kapitel ab Level 13. Das größere Lager ist getestet und funktioniert.“

**Claude** hat die Rückmeldung als v0.30.1 festgehalten und den Entwurf geschrieben (`PLAENE.md`): Gesamtbild Level 13–18 (13 Die Glashütte, 14 Die Trankküche, 15 Der Alchemist, 16 Die Sternwarte, 17 Der Zaubergarten, 18 Die Zauberei) aus Tobias' früheren Ideen (Sand → Glas → Kolben, Tränke aus Kolben und Kräutern, Alchemist mit Mörser um Level 15, Lebens-, Mana-, Alterstrank). Level 13 im Detail: Flusssand → Sandwäsche → Quarzsand, Glashütte (Quarzsand + Holzkohle → Glas), Glasbläserei (Glas → Fläschchen), Aufstieg 10.000 Gold, 6. Theke ab Level 13 für 150.000, 4 Aufträge (Glasmacherin Frieda, Klara, Anton; 3.093 Erfahrung). Sandwäsche und Glashütte im Reiter „Stein“, die Tränke-Maschinen im neuen Reiter „Tränke“; auf dem Handy bei 6 Reitern nur der Name des geöffneten. 5 Fragen an Tobias.

**Umgesetzt:** v0.30.1 (nur Doku).

### 19.11.2026 – Chat 21 (Fortsetzung 2): Laden-Lager vergrößern (v0.30.0)

**Tobias** (Antworten auf den Entwurf v0.30.0): „Der Preis von 5000 Gold passt und die weitere Entwicklung von 2500 sind auch passend. Ich denke 10 Ausbauten, sodass das Lager sich verdoppelt reicht erstmal im ersten Schritt. Ich denke, wir könnten das ab Level 7 beginnen, wenn wir auch mit Kräutern anfangen.“

**Claude** hat v0.30.0 gebaut: Im Laden, Reiter „Lager“, oben ein Kasten mit der Größe des Laden-Lagers und ab Level 7 dem Knopf „📦 Vergrößern · 5.000 🪙“ (+100 Plätze, jeder weitere Ausbau 2.500 mehr, 10-mal bis 2.000 Plätze), mit Rückfrage und „Dir fehlen noch …“. Neues Spielstand-Format 18; Tobias' Fabrik beginnt mit 0 Ausbauten, sonst bleibt alles gleich.

**Umgesetzt:** v0.30.0 (siehe Versionshistorie).

**Aus `STAND.md` hierher verschoben (damit `STAND.md` kurz bleibt), wörtlich:**

> **Tobias' Fabrik – vorher** (Screenshots vom 11.11.2026, Gold und Werte vor v0.23.0 – seitdem durch 3): Level 8, ganze Fläche gekauft (38 × 30), **43.870 Gold** (heute 14.623), Laden-Lager 1.004 / 1.000, Waren im Wert von **166.579 Gold** (heute etwa 55.500) (u. a. 61 Zahnradwellen, 69 Räderwerke, 70 Verstärkte Holzplatten, 38 Gewichtsteine). Er spielt seit einigen Versionen auf Level 8 weiter, ohne Aufträge, um zu testen, ob eine Fabrik, die **jede Ware mindestens einmal** herstellt, auf die Fläche passt: Sie passt (alles außer der Pflanzenreihe in voller Größe), rechts und unten in der Mitte ist noch Platz frei – „Der Platz reicht mir.“ Alle Rohstoff-Gebäude hat er 5- bis 6-mal aufgefüllt (etwa 4 bis 4,5 Stunden Produktion). Etwa 8 Holzfällerlager, 9 Steinbrüche, 7 Schmelzhütten, 6 Schmieden, 3 Sägewerke, 3 Steinmetze, 3 Zimmereien, 3 Feinschmieden (Scharnier, Schlüssel, Zirkel), 3 Schlossereien, 5 Beete, 2 Erntebänke, Webstube, Kräuterstube; jede Ausgabe endet in einem Lagerhaus. **Versandportale baut er nicht** – volle Lagerhäuser räumt er von Hand aus oder füllt damit das Lagerhaus einer anderen Straße. Er spielt auf dem Tablet und nutzt für Aufträge den Test-Knopf. Chat 18: Er hat eine Straße umgebaut – seine Scharniere kommen nicht mehr auf die Theke, sondern gehen in Zirkel und Vorhängeschlösser. Seit v0.24.0 hat er 2 Theken (vorher 5); was auf den Theken 3 bis 5 stand, liegt im Laden-Lager. Den Test von v0.23.0 fand er gut („hat sich gut angefühlt“, Chat 19). Mit v0.24.0 hat er sofort Theke 3 und 4 gekauft und alles aufgefüllt – danach blieben etwa 6.000 Gold, Theke 5 ist „noch in weiter Ferne“. Er macht jetzt nebenbei die Aufträge, um „realistischer“ auf Level 9 zu kommen. v0.25.0 (schnellere Kunden) fand er gut: „so macht man nicht zu schnell zu viel Geld, sondern das Ganze wird eher etwas gedrosselter.“

### 18.11.2026 – Chat 21 (Fortsetzung): Level 12 „Die Apotheke“ (v0.29.0)

**Tobias** (Antworten auf den Entwurf v0.29.0): „Ja, wir können das gerne unter den Reiter Werkstatt machen, weil die Tränke einen eigenen Reiter bekommen. Das Tempo des Geld verdienens fühlt sich eigentlich gut an. Wir müssen nur das Gleichgewicht finden zwischen Gold verdienen und Gold ausgeben für bestimmte Dinge. Aktuell kämpfe ich auch sehr mit meinem Lager, weil das immer auf 950+ Artikel ist. Ich denke, da könnte man auch einbauen, dass man sein Lager z.b. um 100 vergrößert für einen bestimmten Preis, sodass man sein Gold auch für das Lager ausgeben kann. Ich bin gerade dabei die neuen Verbände herzustellen, damit ich den letzten Auftrag abschließen kann. Aufstieg zu Level 12 können wir gerne mit 7500 Gold bemessen, weil man sehr viel Gold verdient. Ich würde die sechste Theke erst mit Beginn der Tränke freischalten lassen, also dass wir auf Level 13 dann auch die 6. Theke freischalten können für einen Preis von 150.000 Gold. Das mit dem Reißbrett können wir gerne erstmal versuchen um zu sehen, wie es wirkt. Ich möchte, dass wir im späteren Spielverlauf mit diesen Sachen quasi eine Grundlage schaffen und dann später können wir verschiedene Dinge kombinieren, um daraus viele Dinge herzustellen. Wie gesagt, der Fokus soll auf dem optimieren dieser Produktionsstraßen liegen. Man soll immer gucken wie man was jetzt mit dem verbindet, damit man maximal effizient arbeitet. Von mir aus kannst du nach meinem Feedback alles so umsetzen“

**Claude** hat v0.29.0 gebaut: Level 12 wie im Entwurf, Apotheke im Reiter „Werkstatt“, Aufstieg 7.500 Gold, Reißbrett mit 60 s; dazu schmalere Reiter auf schmalen Handys (aus dem Entwurf). Die 6. Theke (Level 13, 150.000 Gold) kommt mit Level 13. Das größere Laden-Lager ist ein eigener Schritt: Entwurf v0.30.0 in `PLAENE.md` (+100 Plätze ab 5.000 Gold, jeder weitere Ausbau 2.500 mehr, 10-mal bis 2.000 Plätze, ab Level 4) mit 3 Fragen an Tobias.

**Umgesetzt:** v0.29.0 (siehe Versionshistorie).

### 17.11.2026 – Chat 21: Rückmeldung zu Level 11, Plan für Level 12 (v0.28.1)

**Tobias:** „Lies dir den aktuellen Stand der Dinge durch und sage mir was die nächsten Schritte sind. Level 11 hat funktioniert und ich konnte alle Gebäude bauen. Die Aufträge laufen auch. Ich konnte noch keinen Sternenuhr herstellen, weil ich den Zirkel mit dem anderen Gebäude noch nicht verbunden habe, damit diese Produktion läuft. Der Platz ist zu ca. 60 aufgebraucht und Kräuter habe ich bisher noch nicht gebaut. Die Kräuterstraße wollte ich mir in den nächsten Tagen anschauen. Gold habe ich auch wieder ca. 60.000 verdient, wodurch ich bald die nächste Theke kaufen könnte.“

**Claude** hat die Rückmeldung als v0.28.1 festgehalten und die nächsten Schritte genannt: Level 11 fertig spielen (für die eine Sternenuhr reicht ein Lagerhaus mit Zirkeln am zweiten Eingang der Uhrmacherei; Agnes' letzter Auftrag braucht 10 Wundverbände, also die Kräuterstraße), die Kräuterstraße bauen, Theke 5 kaufen, danach Level 12. Entwurf v0.29.0 in `PLAENE.md`: Kamille, Apotheke (Kräutermischung, Kamillenkissen, Heilpäckchen), Reißbrett in der Schreibstube (60 s), Aufstieg 7.500 Gold, 4 Aufträge (Apothekerin Klara, Agnes, Anton). Beim Nachmessen aufgefallen: Ein 6. Reiter passt auf dem Handy nicht mehr, und auf schmalen Handys ragt „Werkstatt“ schon heute über den Rand. 4 Fragen an Tobias (Reiter der Apotheke, Aufstiegspreis und Gold-Tempo, 6. Theke, Inhalt).

**Umgesetzt:** v0.28.1 (nur Doku).

### 14.11.2026 – Chat 20 (Fortsetzung 3): Level 11 „Die Uhrmacherei“ (v0.28.0)

**Tobias** (Antworten auf den Entwurf v0.28.0): „Eisenerzgeschenke brauchen wir keine mehr. Das sollte mit Level 10 enden, dass wir Geschenke bekommen. 1. Ja, mach das in den Reiter. 2. Ja, die Baukosten passen, aber ich würde das ganze etwas mit der Zeit skalieren, weil man mit diesen Produkten auch gutes Geld verdienen kann. Evtl. die Zeit auf 1 min. pro Stück nach oben. Aufstieg können wir jetzt etwas anziehen und bei 5000 Gold starten, damit wir auch etwas mit dem Cash Flow arbeiten können.“

**Claude** hat v0.28.0 gebaut: Uhrmacherei im Reiter „Werkstatt“ (1 Zirkel + 1 Uhrwerk), Räderuhr, Kastenschloss und Sternenuhr je 60 s, Level 11 für 5.000 Gold ohne Geschenk, Aufträge wie im Entwurf.

**Umgesetzt:** v0.28.0 (siehe Versionshistorie).

### 14.11.2026 – Chat 20 (Fortsetzung 2): Rückmeldung zu Level 10, Plan für Level 11 (v0.27.1)

**Tobias** (mit Screenshot: Level 10, 18.111 Gold, 46 × 38): „Das ist das Ergebnis. Sieht sehr gut aus und fühlt sich auch gut an. Die Kräutermissionen hab ich bisher mal geskippt, weil ich die Kräuterfarm nochmal separat kleiner, praktischer bauen will. Ich würde in dieser Session gerne noch das nächste Level fertig machen, damit ich meine Produktion auch noch an die neuen Teile anschließen kann, um zu sehen, wie es mit dem Platz ist. Die Kräutersachen nehmen aktuell noch nicht so viel Platz vom Gesamtprozess ein, da kann man immer wieder eine Linie dazwischen klatschen, damit die Produktion weiterläuft.“

**Claude** hat die Rückmeldung als v0.27.1 festgehalten und den Entwurf v0.28.0 geschrieben (`PLAENE.md`): Uhrmacherei im Reiter „Werkstatt“ mit Räderuhr (Uhrwerk + Gewichtstein), Kastenschloss (Vorhängeschloss + Schlüssel) und Sternenuhr (Uhrwerk + Zirkel), Baukosten 1 Zirkel + 1 Uhrwerk, Aufstieg 2.330 Gold, 1 Eisenerz, 4 Aufträge (Hilde, Marta, Anton, Agnes). 3 Fragen an Tobias.

**Umgesetzt:** v0.27.1 (nur Doku).

### 14.11.2026 – Chat 20 (Fortsetzung): Level 10 und mehr Fläche (v0.27.0)

**Tobias** (Antworten auf die 4 Fragen zum Entwurf v0.27.0): „Ein Streifen gerne 2000 Gold, weil man hier als Spieler schon sehr reich sein kann. Ich würde mir die Fläche mal anschauen und danach feinjustieren. 2. Ja weiter rauszoomen soll gehen. Manchmal stört es, wenn man hereinzoomt und dann ist das Fenster z. B. rechts oben in der Ecke und man kann nur schwer das nächste Gebäude anklicken. 3. Ja, darfst du. 4. Ja, gerne beides zusammen.“

**Claude** hat nachgefragt, was am Hereinzoomen stört (Infofenster verdeckt Gebäude am Rand – oder nur ein zu kleiner Ausschnitt – oder beides). **Tobias:** „Infofenster verdeckt“ (mit der vorgeschlagenen Lösung: die Karte dort etwas über den Rand schieben können).

**Claude** hat v0.27.0 gebaut: Level 10 wie im Entwurf, neue Streifen für 2.000 Gold (die ersten beiden bleiben bei 170), herauszoomen, bis die ganze Welt ins Bild passt, Karte rechts unter dem Infofenster hervorschieben. Selbst festgelegt (vor dem Merge genannt, jederzeit änderbar): Wundverband erst ab Level 10 wählbar, nach dem Aufstieg zeigt die Karte die ganze Welt, Zoom höchstens bis 0,12.

**Umgesetzt:** v0.27.0 (siehe Versionshistorie).

### 14.11.2026 – Chat 20: Rückmeldung zu Level 9, mehr Fläche ab Level 10 (v0.26.1)

**Tobias** (mit Screenshot seiner Fabrik: Level 9, 24.140 Gold, Fläche fast voll): „Hey, informiere dich über den aktuellen Stand der Dinge. Du hast gerade Level 9 fertig gemacht und ich sollte dir mein Feedback dazu geben. Ich finde es ist sehr gut gelungen mit dem neuen Reiter und den Techbaum, den du entworfen hast, fande ich auch sehr gut. Ich hab dir ein Screenshot gemacht von der aktuellen Produktion. Ich hab bei Level 9 die erste Mission fertig und mache gerade die 3 Bretter fertig. Aktuell wird es mit dem Platz ein wenig eng, deswegen würde ich vorschlagen, dass man auf Level 10 zusätzlich auch noch neuen Platz kaufen kann.“

**Claude** hat die Rückmeldung als v0.26.1 festgehalten und den Entwurf v0.27.0 geschrieben (`PLAENE.md`): ab Level 10 je Seite ein 3. Streifen Fläche (bis 46 × 38, je 1.000 Gold), weiter herauszoomen, damit die ganze Fläche aufs Tablet passt; Level 10 „Das Spital“ wie im Entwurf (Schafgarbe, Wundverband), Aufstieg 2.000 Gold, 4 Aufträge (Agnes: 50 Schafgarbenblüten, 5 Wundverbände; Hilde: 2 Vorhängeschlösser für die Arzneien; Ulrich: 8 Wundverbände + 10 Kräuterkompressen). 4 Fragen an Tobias.

**Umgesetzt:** v0.26.1 (nur Doku).

### 14.11.2026 – Chat 19 (Fortsetzung 4): Level 9 „Die Schreibstube“ (v0.26.0)

**Tobias:** „Ja, das hört sich alles sehr gut an und macht auch Sinn. Ich finde die Vorgehensweise sehr gut und können wir auch gerne so umsetzen. So gibt es weiterhin genug Abwechslung. v25 mit den schnelleren Kunden war auch gut, so macht man nicht zu schnell zu viel Geld, sondern das Ganze wird eher etwas gedrosselter. Wenn du willst, kannst du direkt anfangen mit Level 9.“

**Claude** hat Level 9 gebaut wie im Entwurf und dabei festgelegt (vor dem Merge genannt, jederzeit änderbar): eigener Reiter „Werkstatt“ für die Schreibstube (je Reiter passen nur 4 Gebäude aufs Handy), gesperrte Reiter zeigen das Schloss statt des Warenbilds, 1 Holzstamm als Geschenk, Aufstieg 1.670 Gold, 4 Aufträge (Konrad: 50 Holzkohle; Anton: 3 Zeichenbretter, 2 Reißzeuge; Hilde: 4 Zeichenbretter + 10 Heilverbände), Baukosten aus Werkzeug-Waren.

**Umgesetzt:** v0.26.0 (siehe Versionshistorie).

### 13.11.2026 – Chat 19 (Fortsetzung 3): Entwurf Level 9–12 (v0.25.1)

**Claude** hatte gefragt: Soll jedes Level etwas aus mehreren Bereichen bringen oder sollen sie sich abwechseln? Und für das Zeichenbrett (3 Zutaten) eine Maschine mit 3 Eingängen oder ein Zwischenprodukt?

**Tobias:** „Ich finde, das muss man immer so ein bisschen individuell machen. Ich wollte erstmal die ganzen Sachen sozusagen einführen, indem ich zuerst die Werkzeuge einführe, dann die Kräuter und danach die Tränke, dass man alles so ein bisschen versteht, wie das alles zusammenhängt. Aber ich wollte jetzt nicht, dass mit den Werkzeugen jetzt nichts mehr passiert von Level 7 bis 12. Das wäre ja irgendwo ein bisschen langweilig für die ganzen Fabriken. Deswegen wollte ich das alles so ein bisschen verbinden, aber man könnte ja beispielsweise auch Fasern und die Verstärkte Holzplatte schon mal zu irgendwas machen, worauf man zeichnen kann, und bloß den Zirkel dann irgendwie zu einem mathematischen Produkt oder für die Wissenschaft, dass man irgendwie die ganzen Produkte so miteinander verbinden kann, dass daraus neue logische Produkte entstehen. Und das mit den 2 Eingängen will ich beibehalten. Deswegen muss man immer gucken, dass man irgendwie die Werkzeuge so kombiniert, dass da ein logisches Produkt bei rauskommt. Und du kannst mir gerne mal irgendwie einen Entwurf schreiben für die Level 9 bis 12, damit wir noch 1, 2 Kräuter etablieren können, damit wir aus diesen Kräutern auch verschiedene Tränke machen können. Und ich finde es ganz gut, wenn wir vielleicht noch so was wie einen Schmelzofen oder so was einführen könnten, damit wir aus Baumstämmen auch Holzkohle machen können. Und aus Holzkohle kann man dann auch noch weitere Produkte machen. Nur so als kleine Randidee.“

**Claude** hat den Entwurf Level 9–12 geschrieben (`PLAENE.md`): 9 Die Schreibstube – Kohlenmeiler (Holzstamm → Holzkohle; Köhler machten Holzkohle im Meiler, nicht im Schmelzofen), Schreibstube mit Zeichenbrett (Verstärkte Holzplatte + Flachsfasern) und Reißzeug (Zirkel + Holzkohle); 10 Das Spital – Schafgarbe, Wundverband; 11 Die Uhrmacherei – Räderuhr, Kastenschloss, Sternenuhr; 12 Die Apotheke – Kamille, Kräutermischung (Grundlage der Tränke), Kamillenkissen, Heilpäckchen, dazu das Reißbrett. Ausblick ab 13: Glas aus Sand und Holzkohle, Kolben, Tränke. 5 Fragen an Tobias.

**Umgesetzt:** v0.25.1 (nur Doku).

### 13.11.2026 – Chat 19 (Fortsetzung 2): Kunden-Tempo umgesetzt, Bild vom Techbaum (v0.25.0)

**Tobias:** „Ja, darfst du gerne so umsetzen. Nicht direkt. Ich meinte damit, dass man sich ab Level 7 auf die Kräuter konzentriert und dann die ganzen Werkzeuge nicht mehr weiterverarbeiten kann. Wenn man schnell durch die Kräuterlevel kommt, dann kann man so ein wenig Gold generieren. Wir hatten vor, die Werkzeuge mit den Kräutern zu kombinieren, aber da wollten wir dann nach den Kräutern neue Rohstoffe einführen, wie Glas etc., damit wir Kolben herstellen können, um mit Kräutern und den Werkzeugen dann Tränke herzustellen, aber Zirkel + Kräuter ergibt für mich noch keine sinnvolle Weiterverarbeitung, deswegen stelle ich mir die Frage, wie wir die Zirkel weiter verarbeiten können oder wie wir die Produktion der Werkzeuge noch weiter anpassen können, damit der Techbaum sinnvoll weitergeführt werden kann. Außerdem haben wir noch Verstärkte Holzplatten und Schlüssel, die noch keinen weiteren Nutzen haben. Da könnte man Schlüssel und Vorhängeschloss in einer weiteren Maschine verarbeiten, genauso wie Verstärkte Holzplatte, Zirkel und Fasern für ein Zeichenbrett oder Ähnliches. Das stell ich mir eher vor, dass sowas parallel läuft, während wir Kräuter einführen und die Tränke, sodass diese 3 Kategorien (Werkzeuge, Kräuter und Tränke) parallel auch weiter wachsen (weil aus Werkzeugen und Kräutern entstehen im Endeffekt die Tränke).“

**Claude** hat v0.25.0 wie im Entwurf gebaut und Tobias' Bild vom Techbaum festgehalten (offene Frage 14, `SPIEL.md` Ausblick, `PLAENE.md`): Das Werkzeug-Kapitel wächst selbst weiter, parallel zu Kräutern und Tränken; Werkzeug-Waren ohne Weiterverarbeitung sind Zirkel, Schlüssel, Verstärkte Holzplatte, Vorhängeschloss, Gewichtstein und Uhrwerk. Claudes erste Lesart („Kräuter-Rezepte mit Zirkeln“) war nicht gemeint. Als Nächstes: Tobias testet, dann den Techbaum gemeinsam planen.

**Umgesetzt:** v0.25.0 (siehe Versionshistorie).

### 13.11.2026 – Chat 19 (Fortsetzung): Kunden schneller, danach der Techbaum (v0.24.1)

**Tobias** (nach dem Test von v0.24.0): „Ich finde, die Zeiten könnte man etwas angleichen: Level 4–6 auf 25–45 Sekunden und ab Level 7 auf 45–60 Sekunden. Man stellt jetzt deutlich mehr Ware her, als man verkauft, deswegen sollten wir dieses Verhältnis auch ein wenig anpassen. Ich bin der Meinung, wenn man nun im Techbaum weiter die Kräuter macht, dann produziert man überproportional viele Zirkel etc., deswegen würde ich da nochmal drauf schauen. Was Tester brauchen, Bereiche kopieren und Weiche, die eine Spur trennt, können wir noch etwas weiter nach hinten verschieben. Ich konnte mit dem ganzen Geld, das ich hatte, Theke 3 und 4 kaufen, alles auffüllen und habe noch 6.000 Gold. Theke 5 ist daher noch in weiter Ferne, und ich wollte nebenbei die Missionen machen, damit ich ‚realistischer‘ auf Level 9 kommen kann. Ich möchte damit erreichen, dass ich meine Erzeugnisse, die ich aktuell nicht weiter verarbeiten kann, schneller verkaufen kann, damit das Lager nicht zu voll wird. Die Kräutersachen laufen eigentlich relativ gut und schnell, wodurch ich nicht glaube, dass man lange auf den Kräuterleveln bleiben wird, daher sollten wir uns dann auch weiter mit dem Techbaum beschäftigen für Level 9, 10 etc.“

**Claude** hat die Rückmeldung als v0.24.1 festgehalten und v0.25.0 „Kunden-Tempo angleichen“ entworfen (Tabelle in `PLAENE.md`): ab Level 7 je Theke etwa 1,1 statt 0,75 Stück pro Minute, Tobias' 4 Theken etwa 274 statt 180 Stück pro Stunde – ungefähr so viel, wie seine Fabrik voll ausgelastet herstellt (grob 240 fertige Teile pro Stunde, Schätzung aus Chat 17). Lesart zu den Zirkeln: Ab Level 7 verlangt nichts mehr Werkzeug-Waren, die Straßen laufen aber weiter; Ideen für Level 9 und weiter: Kräuter-Rezepte mit Werkzeug-Zutaten, Aufträge mit Werkzeug-Waren, Gebäude, die teure Werkzeug-Waren kosten. Neue Reihenfolge: v0.25.0, dann Techbaum ab Level 9; Tester, Bereich kopieren und Weiche später. Fragen: OK für v0.25.0 (Level 1–3 bleibt), Lesart zu den Zirkeln.

**Umgesetzt:** v0.24.1 (nur Doku).

### 13.11.2026 – Chat 19: Theken kaufen, langsamer verkaufen (v0.24.0)

**Tobias:** „Hey, informiere dich über den aktuellen Stand und was die geplanten nächsten Schritte waren.“

**Claude** hat den Stand zusammengefasst (v0.23.0 live, Tobias testet; als Nächstes v0.24.0 „Theken kaufen, langsamer verkaufen“, freigegeben in Chat 17; danach Tester, Bereich kopieren, Weiche) und gefragt, wie der Test war und ob v0.24.0 starten soll.

**Tobias:** „Test v23 war gut, hat sich gut angefühlt. Wir können mit v24 anfangen, aber lass uns die Thekenpreise noch etwas mehr runden. Die dritte für 15.000, die vierte für 35.000 und die fünfte für 70.000. Wir brauchen im späteren Spielverlauf noch eine sechste, damit die Thekenansicht auch voll ist, aber da können wir den Preis noch offen lassen, weil das vermutlich erst viel später im Spielverlauf kommt.“

**Claude** hat v0.24.0 gebaut und dabei drei Kleinigkeiten selbst festgelegt (vor dem Merge genannt, jederzeit änderbar): Jeder Kunde kauft 1 Stück, je Theke kommt Level 1–3 alle 15–25 Sekunden einer, ab Level 4 alle 30–50, ab Level 7 alle 60–100; die Theken-Ansicht zeigt immer 6 Plätze (die 6. als „🔒 Kommt später im Spiel“); vor dem Kauf kommt eine Rückfrage.

**Umgesetzt:** v0.24.0 (siehe Versionshistorie).

### 12.11.2026 – Chat 18 (Fortsetzung): Erst die Preise, dann die Theken (v0.23.0)

**Tobias:** „Mir ist aufgefallen, dass ich viel Gold verdienen kann, wenn ich z. B. keine Zirkel herstelle, sondern nur Scharniere (und diese Produktionsstufe) verkaufe. Dann mach ich ordentlich viel Gold. Ich hab die Straßen jetzt an die Schlosserei angebunden und merke, dass diese Gewinne wegfallen, wenn ich mich auf Zirkel und Vorhängeschlösser konzentriere. Auf der einen Seite sind mir die Beträge zu hoch, dass man mit einem Zirkel 2.000 Gold verdienen kann, auf der anderen Seite hab ich Angst, dass es Produkte gibt, mit denen man zu schnell zu viel Gold macht, und das würde ich gerne irgendwie regulieren. Die Idee, alles durch 3 zu teilen, finde ich sehr sinnvoll, weil alle Beträge dadurch kleiner werden. Das kannst du gerne schon mal machen. Ich würde gerne zuerst die Preise teilen und danach die Theken machen. Wir hatten im letzten Chat auch dokumentiert, dass man Level 1–3 mehr Verkäufe pro Minute hat als auf Level 7, um den ganzen Cash-Flow auch etwas zu steuern. Ich hab jetzt ein wenig die Angst, dass wir zu viel regulieren, aber fang gerne mal an und dann testen wir das einfach.“

**Claude** hat v0.23.0 „Preise durch 3“ gebaut (wie im Entwurf; Eisenerz 732, damit Eisen genau viermal so viel kostet wie Holz; Hinweis beim Öffnen) – die Theken werden v0.24.0. Zu Tobias' Beobachtung: Je Rohstoff bringt die längere Straße mehr (1 Eisenerz = 2⅔ Scharniere für 1.152 Gold oder 2 Zirkel für 1.324; ein Vorhängeschloss bringt 20 % mehr als Scharnier und Räderwerk einzeln). Je Minute kann es weniger sein, weil Zirkel und Vorhängeschloss je 30 Sekunden brauchen, die neue Straße erst anlaufen muss und die Räderwerke ins Schloss gehen statt auf die Theke. Heute verkaufen die Theken etwa 6 Stück pro Minute, egal wie teuer – mit v0.24.0 zählen sie Stück, je Level langsamer (das hat Tobias richtig erinnert); dann bringen teure Waren aus langen Straßen deutlich mehr als viele billige. Das ist die Bremse gegen „zu schnell zu viel Gold“: Mehr als Theken-Stück × Preis geht nicht. Gegen „zu viel regulieren“: erst testen, die Tempo-Stufen und Theken-Preise sind einzelne Zahlen in `data/shop.js`.

**Umgesetzt:** v0.23.0 (siehe Versionshistorie).

### 12.11.2026 – Chat 18: Preise durch 3 (v0.22.3)

**Tobias:** „Informiere dich über den aktuellen Stand der Dinge. Aktuell haben [wir] über das Balancing von Gold verdienen gesprochen. Ich hab jetzt nochmal ein wenig weitergespielt und eine Produktion weiter angepasst, sodass ich meine Scharniere nicht mehr über die Theke verkaufen kann, sondern diese brauche, um Zirkel und Vorhängeschlösser herzustellen. Ich glaube, wir müssen gar nicht so sehr an diesen Stellschrauben drehen. Mir ist nur aufgefallen, wenn man sich z. B. auf die Produktion von goldstarken Produkten konzentriert, dass man dort viel Gold verdienen kann, aber man muss trotzdem andere Dinge herstellen, um im Level aufzusteigen. Lies dir gerne mal alles durch, um auf den aktuellsten Stand der Dinge zu sein. Ich glaube, wenn wir alles durch 3 teilen, haben wir a) nicht so hohe Beträge, z. B. ein Zirkel knapp 2.000 Gold, und b) können wir den ‚Abverkauf‘ weiterhin über die Theken steuern.“

**Claude** hat „alles durch 3“ mit den Datentabellen durchgerechnet (Entwurf v0.24.0 in `PLAENE.md`): Weil alles aus Blöcken zu 3 Gold entsteht, geht die Werkzeug-Kette fast glatt auf (Holzblock 1, Holzplatte 6, Zahnradwelle 108, Scharnier 432, Zirkel 662, Vorhängeschloss 648); bei den Kräutern Leinsamen 320 statt 333, damit eine Faser 8 Gold kostet (Tobias' Verhältnis bleibt). Mit umgerechnet: Startgold, Fläche, Aufstiege, Theken-Preise, Testpaket, Gold im Spielstand; die Erfahrung bleibt gleich (3 je 10 Gold statt 1). Lesart: +20 % je Stufe bleibt – das Gleichgewicht ändert sich nicht, nur die Zahlen; gebremst wird über die Theken. Zur Beobachtung: Die Aufträge verlangen bestimmte Waren und bremsen so „nur teure Waren“ – mit dem Test-Knopf fällt das weg. Vorschlag: erst v0.23.0 (freigegeben), direkt danach v0.24.0. Fragen: Lesart, Rundung, Leinsamen 320, Reihenfolge und OK.

**Umgesetzt:** v0.22.3 (nur Doku).

### 12.11.2026 – Chat 17 (Fortsetzung): Rohstoffpreise und Rezepte (v0.22.1, v0.22.2)

**Tobias:** „Hat funktioniert. Bevor wir damit weitermachen, hatte ich vor dem Schlafen noch eine Idee. Wir könnten das ja auch regulieren, indem wir die Rohstoffpreise geringer machen und für die Produktion von bestimmten Stoffen weniger Teile nehmen. So könnten wir doch geringere Preise erzielen und langsamer skalieren? Aktuell machen wir bei jedem Produktionsschritt immer das Dreifache mehr? Ich möchte eigentlich nur erreichen, dass man auf höheren Leveln nicht unbedingt Gold drucken kann, aber auch nicht verarmt. Kannst du mir das mal durchrechnen? Nimm als Vergleich unseren aktuellen Spielstand. Da hattest du bereits ausgerechnet, wie viel Gold wir in der Stunde produzieren, und wie wäre es, wenn wir das Ganze mit dieser Variante mal gegenrechnen würden?“

**Claude** hat erklärt, dass jeder Schritt +20 % auf die Zutaten bringt (nicht das Dreifache; die großen Zahlen kommen von der Menge), und mit Tobias' Fabrik fünf Varianten gerechnet (Tabelle in `PLAENE.md`): heute bis 70.900 Gold Gewinn pro Stunde, mit v0.23.0 53.600; Rohstoffe halb so teuer halbiert alles, auch die Kosten (26.800); weniger Teile wirkt nur über die Theken-Grenze (31.900) und braucht weniger Masse; beides zusammen 15.900; kleinerer Aufschlag ab Level 4 36.800. Empfehlung: erst v0.23.0 wie freigegeben spielen, danach bei Bedarf den kleineren Aufschlag ab Level 4; Rohstoffpreise und Rezepte so lassen.

**Umgesetzt:** v0.22.1 (nur Doku).

**Tobias:** „Okay, perfekt. Schreib das so rein. Ich würde dann gleich in einem neuen Chat starten. Dann lass uns bei der Grundidee bleiben mit den Theken und das darüber regulieren. In einem anderen Schritt könnte man sich Gedanken darüber machen, dass man keine 20 % Aufschlag nimmt, sondern weniger. Ich finde es nur etwas viel Gold, wenn man für einen Holzblock 12 Gold zahlt und einen Zirkel knapp 2.000 Gold. Ich fand das Verhältnis etwas zu hoch. Für mich wäre es ansehnlicher, wenn ich für einen Holzblock z. B. 1 Gold bezahle und für den Zirkel dann mehrere hundert Gold, weil wir im Mittelalter sind. Ich fand 2.000 Gold für den Zirkel nur etwas viel, weil wenn wir weitermachen in der Produktion, bringen die nächsten Produkte dann 5.000 Gold oder so was.“

**Claude** hat festgehalten: v0.23.0 kommt im neuen Chat wie freigegeben; „Preise überarbeiten“ (kleinerer Aufschlag, mittelalterliche Preisskala) wird ein eigener Schritt danach. Hinweis: Ein Holzblock kostet 3 Gold (12 Gold ist der Eisenbarren). Rechnung: Holzblock 1 Gold heißt alle Preise durch 3 (Zirkel 662); mit +10 % ab Level 4 Zirkel 567; ein nächstes Produkt aus Zirkel + Vorhängeschloss läge bei 1.223 statt 4.717. Beim Umstellen müssten Gold, Aufstiege, Fläche und Theken mit umgerechnet werden.

**Umgesetzt:** v0.22.2 (nur Doku).

### 11.11.2026 – Chat 17: Gold-Gleichgewicht, Spielstand sichern (v0.21.4 bis v0.22.0)

**Tobias** (mit drei Screenshots: seine Fabrik, das Laden-Lager): „Informiere dich über den aktuellen Spielstand. Ich bin auf Level 8 und hab aufgrund der Entwicklung erstmal weiter auf Level 8 gespielt ohne die Missionen zu machen, weil ich testen wollte, wie es mit dem Platz aussieht, wenn ich meine Fabrik so baue, dass ich jedes Teil mindestens 1x irgendwie herstellen kann, damit ich es auch verkaufen kann bzw. ich es nutzen kann, um die Missionen abzuschließen. Da ich die ganzen Missionen nie gemacht habe, habe ich natürlich keinen Vergleich bzgl. Balancing von Gold. Ich hab jetzt einige Versionen auf Level 8 gespielt und wollte dir mal zeigen, was ich alles habe, damit du das einordnen kannst. Ich hab einmal die komplette Fabrik (ich hab alles gebaut bis auf die komplette Reihe der Pflanzen, also keine richtige Produktion angefangen, sondern nur einmal gebaut) und hab jede Menge im Inventar (glaube einen Wert von 160.000 Gold). Meine Frage lautet: Ist das so in Ordnung, dass man quasi längere Zeit auf einem Level verbringt, um damit ‚unendlich Gold‘ zu generieren, oder wie können wir das steuern? Natürlich verstehe ich, dass man alles bauen muss, damit man die Missionen abschließen kann und man als Spieler eher damit beschäftigt ist, die Missionen zu machen, aber viel Gold bedeutet viele Möglichkeiten.“

**Claude** hat aus den Datentabellen nachgerechnet und eingeordnet (ausführlich in `PLAENE.md`, „Überlegung: Gold-Gleichgewicht“): Auf einem Level zu bleiben ist an sich in Ordnung, lohnt sich heute aber ohne Grenze. Gold fließt nur in Rohstoffe (die mit Gewinn zurückkommen), Aufstiege und Fläche (zusammen bisher 14.850 Gold, einmalig) – Tobias' Gold allein ist das Dreifache. Seine Fabrik verdient grob 30.000 bis 50.000 Gold pro Stunde, wenn alles läuft. Die Theken bremsen teure Waren nicht (mit Zirkeln bis 12.000 Gold pro Minute); alle heutigen Bremsen begrenzen nur, wie lange die Fabrik ohne einen läuft. Level 7/8 bringen beim Gold weniger als die besten Waren von Level 5/6. Fünf Möglichkeiten: A Aufstiege teurer, B Nachfrage (gleiche Ware wird billiger), C Kasse mit Obergrenze, D mehr, wofür man Gold ausgibt, E laufende Kosten (nicht empfohlen). Empfehlung: Farmen erlauben, aber Weiterspielen soll sich mehr lohnen – D + A zuerst, B als Bremse in M3. Nichts davon ist vor den ersten Testern nötig. Fragen an Tobias: Soll Gold durchgehend knapp bleiben? Welche Bremse? Wie viele Stunden auf Level 8? Reicht der Platz?

**Umgesetzt:** v0.21.4 (nur Doku).

**Tobias:** „Der Platz reicht mir. Ich hab bestimmt die ganzen Fabriken 5–6x aufgefüllt. Die läuft ja auch ohne mich weiter. Ich finde, Gold sollte Teil des Spiels sein, aber der Hauptfokus sollte auf der Massenproduktion sein, sodass man immer längere Straßen bauen kann, um Werkzeuge herzustellen und diese dann zu verkaufen. Ich finde das Optimieren und Automatisieren von Prozessen bei diesen Spielen am besten, deswegen sollte darauf auch der Fokus liegen. Von allen Ideen, die du genannt hast, finde ich D am besten. So kann man z. B. die Vergrößerung der Ladentheke teuer machen, damit man erst auf Level 8 es überhaupt schafft, die dritte freizuschalten. Ich hatte auch daran gedacht, dass wir die Ladentheke ‚langsamer‘ machen können. Wenn man auf mehr Produkten sitzen bleibt, ist man auch gezwungen, die Produkte in längere Produktionsstraßen einzusetzen. Die Geschwindigkeit des Verkaufs haben wir ganz am Anfang gemacht, um Gold zu generieren, deswegen liegt dort noch kein Feintuning drin.“

**Claude** hat die Entscheidungen festgehalten (Platz reicht, Schwerpunkt Massenproduktion, Möglichkeit D, Theken langsamer) und den Entwurf v0.23.0 „Theken kaufen, langsamer verkaufen“ vorgestellt (siehe `PLAENE.md`). Kern: Heute ändert die Zahl der Theken nicht, wie viel verkauft wird – eine teure Theke muss deshalb eigene Kunden bringen. Vorschlag: jede Theke im Schnitt 1 Stück pro Minute (2 Theken = ein Drittel von heute), Start mit 2 Theken, weitere kaufen (Platzhalter 40.000 / 100.000 / 200.000 Gold, die dritte so um Level 8 bezahlbar), Aufstiege bringen keine Theken mehr. Folgen: billige Waren lohnen kaum, Tobias' Fabrik (voll ausgelastet grob 240 fertige Teile pro Stunde) stößt mit 2 Theken an die Grenze, der Anfang wird langsamer (ein Holzstamm in 20 statt 7 Minuten verkauft), Aufträge werden wichtiger. Fragen an Tobias: Tempo, Preise (nur Gold oder auch Waren oder Mindest-Level), seine 5 Theken behalten oder zurück auf 2, Reihenfolge (Empfehlung: erst v0.22.0, damit er vorher sichern kann) und sein OK.

**Umgesetzt:** v0.21.5 (nur Doku).

**Tobias:** „Das Tempo passt so für mich, aber wir könnten es ja nochmal drosseln, dass wir sagen von Level 1–3 sind es 6 die Minute, ab Level 4 sind es nur noch 3 die Minute und ab Level 7 sind es nur noch 1–2 die Minute, damit reguliert sich der Verkauf ohnehin und der Anfang wird nicht so ‚zäh‘. Finde die Idee, dass Theken Gold kosten sollen, sinnvoller. Ja, ändere das bei mir auch direkt auf 2 Theken, damit ich ein besseres Gefühl dafür bekommen kann. Immerhin muss ich genug Gold verdienen, dass ich meine Fabriken mit Rohstoffen befüllen kann. Aktuell geht das, und mir bleibt noch jede Menge Gold übrig.“

**Claude** hat die Entscheidungen festgehalten und den Entwurf v0.23.0 angepasst (siehe `PLAENE.md`). Rückfrage zur Lesart: Gelten die Zahlen für die 2 Start-Theken zusammen (je Theke 3 / 1,5 / 0,75 pro Minute), und jede gekaufte Theke legt ihren Anteil drauf? Sonst brächte eine gekaufte Theke keinen zusätzlichen Verkauf. „1–2“ = 1,5 im Schnitt? Kein Mindest-Level? Dazu die Folgen für Tobias' Fabrik: Auf Level 8 mit 2 Theken verkauft er 90 Stück pro Stunde; sein Laden-Lager ist im Schnitt 166 Gold je Stück wert (so verkauft etwa 15.000 Gold pro Stunde), eine volle Füllung seiner Fabrik kostet etwa 74.000 Gold – er muss also vor allem teure Teile verkaufen oder Theken dazukaufen. Weil Tobias zu v0.22.0 noch nicht geantwortet hat, hat Claude zu den 4 Fragen Vorschläge gemacht (Teilen-Menü, sonst „Downloads“; Testmodus und Test-Knopf bleiben sichtbar; die Fabrik läuft nach dem Laden nach) und um ein OK für beide Schritte gebeten – erst v0.22.0, damit Tobias seine Fabrik sichern kann, bevor sie auf 2 Theken zurückgeht.

**Umgesetzt:** v0.21.6 (nur Doku).

**Tobias:** „Ja, die Lesart stimmt. Jede Theke verkauft, damit der Zukauf von Theken sich auch lohnt. Später kann man bei den Upgrades auch die Theke upgraden, damit man 10 % mehr Kundschaft oder so was bekommt. Wir können das gerne so machen in der Reihenfolge. Ich versteh das mit dem Sichern noch nicht so ganz. Das bedeutet, ich speichere, und wenn ich lade, rechnet das Spiel, wie viel Zeit vergangen ist, und rechnet das dann auf die gespeicherte Datei, die ich hochlade? Du kannst gerne damit anfangen.“

**Claude** hat v0.22.0 gebaut (Claudes Vorschläge zu den 4 Fragen, Tobias hat keine Einwände genannt) und die Frage beantwortet: Ja – die Datei ist ein Schnappschuss der Fabrik mit Uhrzeit. Beim Laden nimmt das Spiel diesen Schnappschuss und rechnet die Zeit seit dem Sichern nach, als wäre das Spiel so lange zu gewesen (bis etwas leer ist); was in der Zwischenzeit im jetzigen Spiel passiert ist, wird ersetzt. Die Datei endet auf `.txt`, weil Chrome auf Android `.json` nicht teilt. Theken-Upgrade (+10 % Kundschaft) bei den Verbesserungen vermerkt (offene Frage 7). v0.23.0 kommt, sobald Tobias seine Fabrik gesichert hat.

**Umgesetzt:** v0.22.0 (siehe Versionshistorie).

### 11.11.2026 – Chat 16: Antworten auf die Fragen aus Chat 15 (v0.20.3)

**Tobias** hat die Fragen vom Ende von Chat 15 wiederholt und beantwortet:
- „Passt Variante B so, ohne Gebäudebild oder mit kleinem? Wenn ja, ist das dein OK für v0.21.0?“ – ohne Antwort.
- „Sollen die beiden Punkte aus dem Belastungstest in v0.21.0 mit hinein?“ – „Passt.“
- „Ruckelt das Spiel bei dir auf dem Tablet manchmal, vor allem herausgezoomt?“ – „Nein.“
- „Spielen deine Tester auf eigenen Geräten oder auf deinem Tablet? Sollen sie bei Level 1 anfangen oder deine Fabrik laden können? Brauchen sie eine kurze Einführung? Die gibt es bisher nicht.“ – „Das können wir im Hinterkopf behalten, aber ich möchte frühestens nächste Woche jemandem das Spiel zeigen.“

**Claude** hat die Antworten festgehalten: Nur zeichnen, was im Bild ist, und „Bilder pro Sekunde“ im Testmodus kommen mit in v0.21.0; da das Tablet nicht ruckelt, ist das Vorsorge für größere Fabriken, kein dringender Fehler. Die Tester-Fragen bleiben bis zum Schritt „Spielstand sichern und was Tester brauchen“ offen, der ohnehin nach v0.21.0 kommt. Weil die erste Frage unbeantwortet ist, hat Claude nach der obersten Regel nicht angefangen zu programmieren, sondern nachgefragt: ohne oder mit kleinem Gebäudebild, auch Rohstoff-Gebäude, OK für v0.21.0?

**Umgesetzt:** v0.20.3 (nur Doku).

**Tobias:** „Das Gebäudebild ist noch nicht so aussagekräftig, und später werden aus diesen Bildern ja echte 2D- bzw. 3D-Grafiken ähnlich wie bei Clash of Clans. Von daher können wir das gerne ohne Gebäudebild machen. Alternativ kann man die Farbe evtl. ändern: die Holzgebäude in einem Braun, die Steingebäude in einer Steinfarbe und Eisen und Kräuter eben auch in einer spezifischen Farbe, so haben wir immerhin eine kleine Trennung. Rohstoffgebäude können wir auch miteinbetten. Ist eine gute Idee. Ja, du hast mein Okay.“

**Claude** hat v0.21.0 gebaut und Tobias' Farb-Idee mit hineingenommen (sie ersetzt das Gebäudebild als Unterscheidung): Holz braun, Stein steingrau, Eisen stahlblau, Erde grün; Lagerhaus sandfarben (vorher braun wie Holz), Versandportal bleibt lila. Beim Messen fiel auf, dass die neue Scheibe mit dem Warenbild mehr Rechenarbeit kostet als das alte Emoji; deshalb werden die Warenbilder jetzt zwischengespeichert und der Boden in einem Rutsch gezeichnet. Ergebnis (Testrechner ohne Grafikchip, 130 Gebäude, 360 Bänder): Rechenarbeit fürs Zeichnen nah dran etwa halbiert, ganz herausgezoomt fast halbiert, bei mittlerem Zoom etwa gleich. Wie es auf dem Tablet läuft, zeigt die neue Anzeige im Testmodus.

**Umgesetzt:** v0.21.0 (siehe Versionshistorie).

**Tobias:** „Das Gebäudebild vermisse ich nicht. Farben passen alle so und ist mir ehrlich gesagt gar nicht aktiv aufgefallen, deswegen ist die Farbe so gut. Ich sehe leider keine Bilder/s. Das Einzige, was mir aufgefallen ist, dass die Rohstoffgebäude nach einiger Zeit, bzw. der gelbe Kreis der Gebäude, einfach stehen bleibt und nicht mehr weiterläuft. Es wirkt so, als würde die Maschine zum Stillstand kommen.“

**Claude** hat nachgerechnet (Holzfällerlager und Erntebank mit Versandportal am Ausgang, Simulation): Die Gebäude arbeiten weiter. Der Ring zeigt aber, wie viel vom laufenden Rohstoff übrig ist – beim Holzfällerlager nimmt er je Block um 1/200 ab, also 1,8° alle 4,5 Sekunden (nach 2 Minuten 313° statt 360°); bei der Erntebank 7,2° alle 12 Sekunden. Neben den Maschinen, deren Ring sich alle 5 bis 20 Sekunden ganz füllt, sieht das aus wie Stillstand. Vorschlag für v0.21.2: Der Ring der Rohstoff-Gebäude zeigt jedes einzelne Stück (füllt sich in 4,5 bzw. 12 Sekunden, wie bei den Maschinen; ist der Ausgang voll, bleibt er voll und das Licht ist rot); wie viel vom laufenden Rohstoff übrig ist, zeigt der erste Vorrat-Punkt als kleines Tortenstück, das sich in 15 bzw. 10 Minuten leert (genauer im Infofenster: „leer in etwa …“). Zu „Bilder/s“: Die Anzeige erscheint nur im Testmodus (☰ → „⏩ Testmodus“, dann oben „⏩ ×10“ und „🎞️ … Bilder/s“); im Browser-Test auf Tablet und Handy war sie zu sehen. Rückfrage, ob der Testmodus an war und ob die Anzeige auch ohne Testmodus einschaltbar sein soll.

**Umgesetzt:** v0.21.1 (nur Doku).

**Tobias:** „Okay, das wusste ich nicht. Ist tatsächlich besser so, dann weiß man ca., wann das Rohstoffgebäude leer ist. Können wir gerne so lassen. Hab den Testmodus angemacht, und die Anzeige ist zwischen 60–90 Bilder/s immer geswitcht.“

**Claude** hat festgehalten: Der Ring bleibt, v0.21.2 wird nicht programmiert. 60 bis 90 Bilder pro Sekunde heißt: flüssig; dass die Zahl springt, ist normal (das Tablet stellt die Bildwiederholung je nach Bedarf zwischen 60 und 120 um, um Strom zu sparen). Als Nächstes hat Claude den Entwurf für v0.22.0 „Spielstand sichern und laden“ vorgestellt (siehe `PLAENE.md`) – mit dem Gedanken, dass Tester damit auch auf Tobias' Tablet spielen können, ohne einen zweiten Spielstand: sichern → neues Spiel → Tester spielt → laden.

**Umgesetzt:** v0.21.2 (nur Doku).

**Tobias:** „Bevor wir weitermachen, schreib die nächsten Schritte erstmal auf. Ich dachte auch daran, dass wir den Kreis der Rohstoffgebäude einfach in einer anderen Farbe machen. Dann machen wir Kreislauf zur Fertigung gelb und Kreislauf, bis etwas leer ist, evtl. grün, damit man das auch klarer erkennen kann. Das kannst du gerne jetzt schon codieren, ich würde danach in einem neuen Chat weitermachen.“

**Claude** hat die nächsten Schritte als nummerierte Liste oben in `docs/STAND.md` geschrieben (v0.22.0 Spielstand sichern und laden mit den 4 offenen Fragen, was Tester brauchen, Bereich kopieren, Weiche, später) und den Ring der Rohstoff-Gebäude grün gemacht – als v0.21.3 (Feinschliff nach Tobias' Test), damit „Spielstand sichern“ v0.22.0 bleibt. Die Vorrat-Punkte bleiben gelb.

**Umgesetzt:** v0.21.3 (siehe Versionshistorie). Weiter geht es in einem neuen Chat.

### 10.11.2026 – Chat 15: Braucht es das Versandportal noch? (v0.19.0)

**Tobias:** „Hi, informiere dich über den aktuellen Stand der Dinge. Im letzten Chat haben wir v19 auf GitHub veröffentlicht. Beet, Lagerhaus und Versandportal haben wir noch nicht umgestellt. Ich habe mich gefragt, ob das Versandportal noch Sinn macht, wenn wir die gleiche Funktion mit dem Lagerhaus haben. Das Versandportal schickt die Ware direkt ins Laden-Lager. Lass uns erst die nächsten Schritte theoretisch durchgehen.“

**Claude** hat beide Gebäude verglichen (Zahlen aus den Datentabellen und dem Code):
- **Versandportal:** 1 × 1, 10 Holzblöcke; schickt jedes Stück sofort und ohne Mengengrenze ins Laden-Lager, auch im Hintergrund, bis das Laden-Lager voll ist. Die Ware steht sofort für Theken, Aufträge und Bauen bereit.
- **Lagerhaus:** 2 × 1, 8 Holzplatten; 3 Fächer × 50 (höchstens 3 Waren), gibt am Ausgang weiter; Befüllen aus dem Laden-Lager, Ausräumen von Hand ins Laden-Lager (darf es überfüllen). Was darin liegt, zählt nicht zum Laden-Lager.
- Die Überschneidung ist nur das Ausräumen. Beispiel: Eine Straße mit 3 aufgefüllten Holzfällerlagern und Sägewerk macht in 45 Minuten 360 Platten oder Stäbe (etwa 8 pro Minute). Ein Lagerhaus am Ende ist nach etwa 19 Minuten voll, dann steht die Straße, bis man ausräumt; mit Versandportal läuft sie die ganzen 45 Minuten.
- Die beiden sind Gegenstücke: Portal = Band → Laden-Lager (automatisch), Lagerhaus = Laden-Lager → Band (von Hand) und Puffer zwischen zwei Straßen.
- Varianten: **A** beide behalten, Rollen klar trennen und im Infofenster zeigen (Empfehlung); **B** zusammenlegen – Lagerhaus mit Schalter „📤 Ins Laden-Lager schicken“, Portal fällt weg (Nachteile: 2 × 1 statt 1 × 1 bei knappem Platz, teurer, vorhandene Portale müssten umgewandelt werden und das größere Lagerhaus passt nicht immer auf ihr Feld, ein Gebäude mit zwei Betriebsarten ist schwerer zu durchschauen); **C** Portal weglassen, nur Ausräumen (nicht empfohlen: die Fabrik liefe im Hintergrund nur noch, bis die Lagerhäuser voll sind, und Level 1 hätte keinen automatischen Weg in den Laden).
- Nebenbei: Lagerhäuser am Ende der Straßen sind ein Zusatzlager neben dem Laden-Lager (10 Lagerhäuser = 1.500 Plätze). Empfehlung: erst einmal so lassen und beobachten (wie beim Abreißen über die Grenze).
- Entwurf v0.20.0: Beet, Lagerhaus und Versandportal bekommen das Infofenster im neuen Stil (Bilder statt Textzeilen), mit Vorschaubildern vorab. Danach: Maschinen zeigen auf der Karte, was sie herstellen; dann Weiche mit Filter, Verbesserungen mit Erfahrung, Level 9.
- Fragen an Tobias: A, B oder C? Wie nutzt er Portal und Lagerhaus heute (baut er noch Portale oder räumt er die Lagerhäuser am Ende von Hand aus – und warum)? Zusatzlager so lassen? Passt die Reihenfolge?

**Umgesetzt:** v0.19.1 (nur Doku).

**Tobias:** „Okay, perfekt. Ich baue aktuell keine Versandportale, deswegen hab ich mich gefragt, ob das noch sinnvoll ist. Von mir aus lassen wir gerne A. Ich benutze es aktuell so, dass ich z. B. Zahnräder, die in einem Lager voll laufen, weil die Holzstäbe der anderen Straße nicht hinterherkommen, in das andere Zwischenlager packe, weil ich die Produktion einmal gespiegelt gebaut habe mit einem anderen Produkt (einmal sind es zu wenig Zahnräder, einmal zu wenig Holzstäbe). Dann räume ich die Zahnräder vom Lagerhaus raus, sie sind kurz im Laden-Lager, und packe sie in das andere Lagerhaus wieder rein, damit die Produktion weitergehen kann. Das war genau der Sinn der Lager, dass man dort Sachen lagern kann, die man für spätere Produktionen braucht. Aber aktuell nutze ich das Portal gar nicht mehr, weil ich nur noch teurere Einzelteile produziere und keine 500 Stäbe, die ich ins Laden-Lager schicken muss. Frage 3: Hab ich dir, glaube ich, gerade beantwortet. 4. Ja, codiere erst die neuen Infofenster für die Sachen, die noch nicht gemacht sind, wie wir das bei der letzten Version gemacht haben.“

**Claude** hat das als OK für v0.20.0 genommen (Variante A, Lagerhäuser bleiben Zusatzlager, Ausräumen ohne Grenze) und die drei Infofenster im Stil von v0.19.0 gebaut, ohne vorherige Vorschaubilder – Tobias hat sie im Chat als Screenshots aus dem Browser-Test bekommen. Idee für später (noch nicht besprochen): ein Knopf „Umlagern“, der direkt von einem Lagerhaus ins andere packt.

**Umgesetzt:** v0.20.0 (siehe Versionshistorie).

**Tobias:** „Die neuen Vorschaubilder sehen gut aus. Jetzt ist alles übersichtlich dargestellt. Aktuell werden die produzierten Rohstoffe oder Produkte sehr klein auf den Maschinen dargestellt, sodass man erahnen kann, was gerade produziert wird. Mach mir gerne einen Vorschlag, wie du das ändern wollen würdest.“ Er nutzt seit heute ein neueres Claude-Modell und möchte deshalb noch weitere Vorschläge, was die nächsten Schritte sein könnten.

**Claude** hat nachgeschaut, was die Karte heute zeigt: Gebäudebild (Emoji), Name, Statuslicht, Fortschrittsleiste, Punkte für den Rohstoff-Vorrat – und nur bei Kombi-Maschinen, die warten, ein kleines dunkles Schild mit der **fehlenden** Zutat. Was eine Maschine herstellt, steht nirgends; zwei Schmieden (Bleche, Stangen) sehen gleich aus. Vorschaubilder (Tablet, nah und weit herausgezoomt; aus einer Kopie des Spiels, nicht im Projekt gespeichert):
- **Variante A – Schild in der Ecke:** Das Gebäudebild bleibt groß, das Produkt steht als rundes helles Schild unten rechts.
- **Variante B – Produkt in der Mitte (Empfehlung):** Das Produkt steht groß auf einer hellen Scheibe in der Mitte, das Gebäudebild klein unten rechts; Farbe und Name bleiben. Herausgezoomt bleibt es lesbar. Wartet eine Kombi-Maschine, steht unten ein gelbes Schild „? + fehlende Zutat“ (statt des dunklen Schildes oben).
- In beiden Varianten: Rohstoff-Gebäude zeigen, was herauskommt (leer = blass; die Erntebank das, was gerade läuft), das Lagerhaus zeigt die Waren seiner Fächer (bis 3) statt des Pakets. Beet und Versandportal bleiben. Nur Darstellung, Spielregeln und Spielstand bleiben gleich.
- Fragen: A oder B? Auch Rohstoff-Gebäude? Passt das gelbe „?“-Schild?

Weitere Vorschläge für die nächsten Schritte (Claude): „Umlagern“ von Lagerhaus zu Lagerhaus; Fabrik-Übersicht (je Ware hergestellt und verbraucht pro Minute, zeigt Engpässe); Spielstand sichern und auf ein anderes Gerät mitnehmen; „Alle auffüllen“ mit Gesamtpreis (Frage, ob das zu „Nachlegen ist Handarbeit“ passt); Bereich kopieren; Weiche mit Filter; erste Wirtschaft aus M3 (Nachfrage des Tages oder Sonderaufträge); Verbesserungen mit Erfahrung; Belastungstest mit großer Fabrik und Durchsicht des Codes; Level 9. Empfohlene Reihenfolge nach v0.21.0: Umlagern, Fabrik-Übersicht, Spielstand sichern.

**Umgesetzt:** v0.20.1 (nur Doku).

**Tobias:** „Ich würde mich für Variante B entscheiden, aber finde das nicht so 100 % hübsch. Finde, das wirkt etwas gequetscht. Ich würde von allen Punkten eher den dritten Punkt nehmen, weil ich diesen Zustand gerne schon anderen Menschen zeigen wollen würde, damit diese das Spiel auch testen können, ohne dass mein Spielstand verloren geht. Ich hoffe, ich verstehe den dritten Punkt richtig. Finde den ersten Punkt nicht gut, weil dadurch das händische Arbeiten verloren geht. Wie viel die Minute hergestellt wird, finde ich auch nicht gut bzw. zur jetzigen Phase des Spiels. Alle auffüllen finde ich nicht gut. Bereich kopieren und das Ganze nochmal bauen finde ich sehr wichtig, und daran hatte ich heute Morgen auch gedacht. Eine Weiche, die z. B. eine Spur in 2 Spuren trennt, sodass man sagen kann, hier laufen nur Stäbe und hier nur Bleche, finde ich auch sehr sinnvoll, damit die Produktionsstraßen länger werden. Verbesserung mit Erfahrungen würde ich erst später einführen wollen. Den Belastungstest finde ich auch sinnvoll, dass wir den [mit dem neuen Modell] durchführen.“

**Claude** hat Variante B überarbeitet und neue Vorschaubilder gezeigt (wieder aus einer Kopie des Spiels): Der Fortschritt läuft als gelber Ring um das Produkt statt als Leiste oben, das Gebäudebild fällt weg (Farbe und Name bleiben), die Punkte für den Vorrat rücken in die Zeile des Statuslichts, das gelbe „?“-Schild steht oben links. Als Alternative dieselbe Fassung mit kleinem Gebäudebild unten links. Zum dritten Punkt: Jedes Gerät hat seinen eigenen Spielstand im Browser – wer den Link auf dem eigenen Gerät öffnet, beginnt bei Level 1 und berührt Tobias' Fabrik nicht; nur wenn andere auf seinem Tablet spielen, spielen sie in seinem Spielstand. Rückfragen: eigene Geräte oder sein Tablet? Bei Level 1 anfangen oder seine Fabrik laden? Kurze Einführung für Tester?

**Belastungstest** (reine Messung in einer Kopie, nichts am Spiel geändert; Testrechner ohne Grafikchip): zwei voll bebaute Fabriken auf 38 × 30 Feldern – 180 Gebäude und 120 Bänder bzw. 30 Gebäude und 1.065 Bänder.
- Rechnen: 0,2 Millisekunden je Takt, also etwa 2 Millisekunden je Sekunde Spiel; im Testmodus (×10) etwa 22. Unkritisch.
- Abwesenheit nachrechnen: 8 Stunden in 0,02 bis 1,3 Sekunden, wenn die Fabrik bald steht; läuft alles 45 Minuten durch, hochgerechnet etwa 6 Sekunden (auf dem Tablet eher 10 bis 20).
- Spielstand: 31 bis 49 KB, Speichern unter 1 Millisekunde, Laden 1 bis 2.
- Zeichnen: leere Fläche 6 Millisekunden je Bild, kleine Fabrik (20 Gebäude) 8 bis 10, volle Fabrik 18 bis 21 – für flüssige 60 Bilder pro Sekunde dürfen es höchstens 16,7 sein. Bei Zoom 1 kostet es fast so viel wie ganz herausgezoomt: Das Spiel zeichnet auch, was nicht im Bild ist. Ein Gebäude kostet etwa 0,085, ein Band 0,011 Millisekunden.
- Keine Fehler in der Konsole. Vorschlag: mit v0.21.0 nur noch zeichnen, was im Bild ist, und im Testmodus „Bilder pro Sekunde“ anzeigen, damit Tobias auf dem Tablet selbst messen kann.

Claudes Vorschlag für die Reihenfolge: v0.21.0 Maschinen zeigen, was sie herstellen (mit den beiden Punkten aus dem Belastungstest), dann Spielstand sichern und was Tester brauchen, Bereich kopieren, Weiche.

**Umgesetzt:** v0.20.2 (nur Doku). Tobias' OK für v0.21.0 steht aus.

### 09.11.2026 – Chat 14: Feedback nach einer Stunde Spielen (v0.18.1)

**Tobias** (mit Screenshot seiner Fabrik auf Level 8, 6.036 Gold): „Ich hab jetzt ca. eine Stunde lang im normalen Spieltempo gespielt, und konnte langsam immer stetiger wachsen. Ich bin immer am Ball geblieben, weil ich meine ganzen Fabriken voll machen wollte mit Rohstoffen, was jetzt auch ganz gut geklappt hat, nur die Eisenvorräte könnten noch besser sein. Immer wenn ich Rohstoffe voll machen wollte, bin ich quasi pleite gegangen und musste erst warten, bis ich genug Ware produziert hatte, um diese zu verkaufen. Aktuell hab ich zwar 6000 Gold, aber müsste noch Eisen dazu kaufen und wäre wieder bei fast 0. Ich finde, es macht Spaß, und man kann sich so langsam an die Kräutersachen machen. Außerdem muss ich noch mehr Eisenproduktionen bauen, weil ich bei der Schlosserei aktuell nur ein Produkt herstelle, weshalb man nicht reich wird, aber man kommt langsam voran.“

**Auf dem Screenshot:** links zwei gleiche Holz-Stein-Straßen (je 3 Holzfällerlager, 3 Steinbrüche, Sägewerk, Steinmetz, Zimmerei, Lagerhäuser); oben 2 Holzfällerlager, 5 Schmelzhütten mit 5 Schmieden, 3 Steinbrüche, darunter Zimmerei, 2 Feinschmieden, 1 Schlosserei; unten 3 Beete, 2 Erntebänke, Webstube, Kräuterstube. Zimmerei und eine Feinschmiede warten auf Eisenstangen.

**Claude** hat nachgerechnet (Zahlen aus den Datentabellen):
- Eine Schmelzhütte voll aufzufüllen kostet 3 × 2.200 = 6.600 Gold, Tobias' 5 Hütten 33.000 Gold – und nach 45 Minuten wieder. Holz und Stein kosten je Gebäude nur 1.650.
- Eine Schmelzhütte liefert etwa 13 Barren pro Minute (2–3 Bleche oder Stangen). Eine Feinschmiede braucht bei voller Arbeit für Scharniere 45 Bleche und Stangen pro Minute – das Eisen von etwa 17 Schmelzhütten. Ebenso verbraucht eine Zimmerei so viel wie etwa 17 Holz- und Steingebäude liefern, eine Grundmaschine so viel wie 4–5 Rohstoff-Gebäude. Deshalb warten Tobias' Kombi-Maschinen; „mehr Eisen bauen“ ist der richtige Schluss.
- Kunden kommen etwa alle 20 Sekunden und kaufen im Schnitt 2 Stück, also etwa 6 Stück pro Minute (360 pro Stunde) – egal wie viele Theken. Jedes Stück nimmt der Kunde von einer zufälligen gefüllten Theke. Aus 1 Eisenerz werden 40 Bleche und Stangen (2.880 Gold), die allein 7 Minuten aller Kunden bräuchten; als Vorhängeschlösser werden daraus 2⅔ Stück (5.184 Gold). Tipp: die teuersten Waren auf die Theken; Bleche und Stangen weiterverarbeiten statt verkaufen.
- Tipp: Das Uhrwerk (Zahnradwelle + Räderwerk) braucht gar kein Eisen und bringt im Verhältnis zu den Rohstoffen genauso viel wie das Vorhängeschloss (etwa das 1,9-Fache) – eine zweite Schlosserei für Uhrwerke ließe sich aus den Holz-Stein-Straßen versorgen, mit Rohstoffen für 550 statt 2.200 Gold.
- Vorschlag für den nächsten Schritt: erst einmal nichts an der Balance ändern (es macht Spaß, man kommt voran, und der Wunsch, alles voll zu machen, hält am Ball) und die Kräuter ausprobieren. Alternativ: Eisen-Balance anpassen (z. B. mehr Kunden mit jedem Level, Eisenpreis, Vorrat) oder eine Planungshilfe im Infofenster („braucht bei voller Arbeit so viel wie 17 Schmelzhütten“).

**Umgesetzt:** v0.18.2 (nur Doku).

**Tobias:** „Notier bitte noch in den obersten Regeln in der Datei, die du immer als Erstes liest, dass du nicht ohne meine Erlaubnis anfängst zu codieren, sondern mir immer vorstellst, was du codieren möchtest, und dann setzen wir das gemeinsam um. Ich entscheide mich für Option A. Alles ist gut so, wie es aktuell ist, und dass man mehr Eisen braucht und dafür mehr Eisen bauen muss, ist mir klar – nur man kann das nicht alles auf einmal bauen, weil man das Gold nicht dazu hat. Deswegen finde ich das Balancing zwischen Gold verdienen und Rohstoffe nachkaufen sehr gut. Der Verkauf der Theke gefällt mir ebenfalls. Wer mehr verdienen will, muss teurere Sachen anbieten, was genau mein Ziel ist. Die Massenproduktion steht wie gesagt im Vordergrund, aber die kann ich noch nicht umsetzen, weil Gold fehlt, aber prinzipiell könnte man sich darauf konzentrieren. So entstehen eben mehr Spielstile, das Spiel zu spielen, was ich gut finde. Was hatten wir als nächsten Schritt geplant?“

**Umgesetzt:** v0.18.3 (nur Doku): oberste Regel ganz oben in `CLAUDE.md` (mit der Ausnahme für reine Doku-Versionen), Entscheidungen festgehalten, offene Frage 3 erledigt.

**Claude** hat die möglichen nächsten Schritte aus `docs/STAND.md` aufgezählt (Warenbilder in der Bauleiste, Level 9, Weiche mit Filter, Verbesserungen mit Erfahrung) und Tobias wählen lassen; Empfehlung: Warenbilder in der Bauleiste.

**Tobias:** „Gerne Punkt 1, und du kannst Kräuter auch in Pflanzen oder Pflanzenkunde umbenennen. Welche Möglichkeiten hast du, die Gebäude (also die Icons) darzustellen? Was hergestellt wird – kann man einfach das Symbol nehmen, welches auf dem Band liegen würde, nur minimal größer, oder wie würdest du das aus Sicht eines Spieleentwicklers machen?“

**Claude** hat Vorschaubilder (Tablet und Handy) mit drei Varianten gebaut und erklärt: Das Warenbild vom Band zu nehmen, ist genau richtig – eine Ware sieht überall gleich aus (Band, Laden, Aufträge, Bauleiste). Variante A (Waren neben dem Gebäudebild) passt bei drei Waren nicht in den Knopf; B (eigene Zeile unter dem Namen, Leiste etwas höher) empfohlen; C (Waren groß, Gebäude klein in der Ecke, Leiste gleich hoch). Gebäudebilder: Emojis (heute, sehen auf jedem Gerät anders aus, manche ähneln sich), selbst gezeichnet wie die Waren, oder gemalte Grafik-Dateien – Empfehlung: Emojis vorerst behalten, eigene Gebäudebilder in M4. Reiter: „Pflanzen“ empfohlen. Idee für danach: Maschinen zeigen auf der Karte, was sie gerade herstellen.

**Umgesetzt:** v0.18.4 (nur Doku): Plan für v0.19.0 in `PLAENE.md`.

**Tobias:** „Ich bin tatsächlich für Variante B, wenn ich das richtig gesehen habe. Symbol, wie es heißt und was es kostet. Was es herstellt, würde ich da nicht drauf machen. Ich finde Pflanzenkunde zu lang, und Pflanzen hört sich auch komisch an. Wir sind bei Rohstoffen, deswegen könnte man diesen Bereich evtl. einfach ‚Erde‘ nennen. Ich würde evtl., wenn man das Gebäude anklickt, das nochmal übersichtlicher darstellen wollen, dann prägt man sich das auch besser ein. Aktuell klick ich auf das Gebäude und sehe nur eine Menge an Informationen. Ich würde gerne ganz oben stehen haben, was man aktuell produziert und was man dafür braucht, und unten drunter dann nochmal, was die anderen Dinge kosten würden. So haben wir das aktuell auch schon, aber ich finde es sehr unübersichtlich. Evtl. können wir das klarer und übersichtlicher darstellen. Ansonsten hast du mein Go.“

**Claude** hat nachgefragt, ob die Bauleiste damit wie heute bleibt (Variante B hatte die Warenzeile), und Vorschaubilder fürs neue Infofenster gezeigt (Feinschmiede und Holzfällerlager, heute und neu, Tablet und Handy): oben ein grüner Kasten „Stellt gerade her“ mit Zutaten als Bildern (hat / braucht) → Ergebnis, darunter „Umstellen auf“ mit jedem anderen Rezept als Knopf, Verschieben/Drehen/Abreißen klein in einer Zeile, ein kurzer Tipp statt des langen Textes. Weil der Entwurf neu ist, wartet Claude nach der obersten Regel auf Tobias' OK.

**Umgesetzt:** v0.18.5 (nur Doku): Plan für v0.19.0 „Übersichtliches Infofenster und Reiter ‚Erde‘“ in `PLAENE.md`.

**Tobias:** „Finde das passt so. Sieht sehr übersichtlich aus und ansprechend. Go für v19.“

**Umgesetzt:** v0.19.0 (siehe Versionshistorie). Beim Prüfen fielen zwei Kleinigkeiten auf und wurden behoben: „Kräuterkompresse“ ragte auf dem Handy aus dem grünen Kasten (lange Namen brechen jetzt um), „10 / 10 ✓“ wurde auf dem Tablet knapp abgeschnitten.

### 09.11.2026 – Chat 12 und 13: Test von v0.17.0, Plan und Umsetzung v0.18.0 (Bauleiste mit Reitern)

*Chat 12 wurde nicht in der README festgehalten; Tobias hat sein Feedback und Claudes Rückfragen in Chat 13 wiederholt.*

**Tobias (Test von v0.17.0):** Das meiste hat funktioniert. Er konnte nicht alles testen, weil er die komplette Fabrik neu gebaut hat – er hatte zu wenig Grundrohstoffe und konnte nicht alle Maschinen versorgen; ein wichtiges Learning. Er arbeitet jetzt viel mehr mit Lagerhäusern, um Zwischenprodukte zu lagern und Wege zu sparen: Sobald er zwei Bänder mit zwei verschiedenen Produkten zusammenführt, hat er keine Kontrolle mehr, was am Ende bei der Maschine ankommt. Deshalb baut er für jedes Zwischenprodukt eine eigene Produktionsstraße, um genug davon in seine Zwischenlager zu packen und damit neue Straßen zu errichten. Die gelbe Ringelblume ist gut zu erkennen. Weil die Erntebank wie das Holzfällerlager funktioniert, baut er lieber zwei Erntebänke und legt alles getrennt ein, um die Straßen besser zu steuern. Der Aufbau der Kräuterstube mit zwei Eingängen ergibt Sinn, ist aber noch nicht getestet. Man investiert viel Zeit, um die Straßen optimal zu bauen; das ständige Neubauen und Optimieren funktioniert sehr gut. Nach dem Abreißen hatte er 1.500 Waren im Lager, konnte das durch Neubauen aber direkt wieder unter 1.000 bringen. Beim Neubauen wurde das Baumenü mit vielen Maschinen unübersichtlich, weil man nicht direkt sieht, was welche Maschine macht – vielleicht lässt es sich übersichtlicher gestalten. Die dritte Pflanze stellt er erst einmal hinten an.

**Claude (Chat 12)** hat Rückfragen gestellt: Reiter nach Straße (Holz, Stein, Eisen, Kombi, Kräuter, Lager) oder nach Stufe? Werkzeuge immer sichtbar links oder als eigener Reiter? Fehlt in der Bauleiste sonst noch etwas?

**Tobias (Chat 13):** Reiter: Man tippt auf „Bauen“, dann öffnen sich Reiter wie Holz, Stein und Eisen (und jetzt die Pflanzen) mit allen spezifischen Gebäuden wie Holzfällerlager und Sägewerk. Daneben stehen die Sachen, die man öfter braucht: Förderband, Lager, Abreißen, Verschieben. Außerdem: Wenn das Baumenü offen ist und er ganz unten bauen will, sieht er die Fläche nicht mehr – das Menü müsste sich zuklappen lassen oder aus der Baufläche raus. Die Frage nach den Werkzeugen war damit beantwortet; sonst fehlt ihm nichts.

**Claude** hat den Plan für v0.18.0 mit zwei Vorschaubildern (Tablet und Handy) vorgestellt: vier Reiter (Holz, Stein, Eisen, Kräuter; Zimmerei bei Holz, Feinschmiede und Schlosserei bei Eisen), links immer Förderband, Lagerhaus, Versandportal, Verschieben, Abreißen; die Karte lässt sich über die Leiste schieben; die Leiste wird nicht höher; Meldungen über der Leiste.

**Tobias:** „Ja, die Einteilung passt so und du kannst gerne loslegen.“

**Umgesetzt:** v0.18.0 (siehe Versionshistorie). Als Nächstes testet Tobias die Bauleiste und baut seine Fabrik weiter.

**Tobias:** „Ja, perfekt. So langsam nimmt das Spiel Form an. Die Übersicht gefällt mir viel besser.“ Die README ist sehr lang und braucht immer viel Kontextfenster. Eine separate Datei, auf die wir uns immer beziehen, in der jeder Arbeitsschritt dokumentiert wird, damit nichts verloren geht und Claude immer den Kontext kennt – eventuell eine Historie, eine Datei für die letzten Arbeitsschritte und eine grobe Zusammenfassung des Spiels. Er ist kein Spielentwickler und weiß nicht, wie man eine übersichtliche Ordnerstruktur anlegt, damit die Arbeit flüssiger läuft und nicht bei jedem neuen Chat 20 % des Kontextfensters verbraucht sind. Erst das Repo klären, dann weiter am Spiel.

**Claude** hat vorgeschlagen: `README.md` als kurze Startseite, `CLAUDE.md` mit den Regeln, `docs/STAND.md` (Version, nächster Schritt, offene Fragen, letzte 3 Arbeitsschritte), `docs/SPIEL.md` (das Spiel, wie es heute ist), `docs/TECHNIK.md`, und ein Archiv mit Entscheidungen, Versionen, Gesprächen und Plänen, das nur gezielt durchsucht wird. Zu Beginn eines Chats nur noch etwa ein Achtel der bisherigen Menge. Reine Feedback-Chats werden sofort als eigene kleine Version festgehalten, damit nichts mehr verloren geht wie in Chat 12.

**Tobias:** „Ja, setze es bitte genauso um, damit wir in jedem neuen Chat direkt arbeiten können und du die wichtigsten Informationen kennst. Das Spielprinzip ist ja klar und wir müssen die Basis eigentlich nur erweitern.“

**Umgesetzt:** v0.18.1 (nur Doku). Zusätzlich zu den vier angekündigten Archiv-Dateien bewahrt `KONZEPT-VERLAUF.md` die alten Abschnitte 3, 4 und 8 wörtlich auf (Konzept mit Verlauf, Tobias' ursprünglicher Techbaum, alte offene Fragen).

### 08.11.2026 – Chat 11: Test von v0.14.0, Test-Knopf, Vorgehen beim Kräuter-Kapitel

**Tobias:** Das Spiel über Nacht geschlossen und am Morgen wieder reingeschaut – alles hat funktioniert, die Fabrik läuft weiter. 3 Rohstoffe reichen. Die neuen Warenbilder erkennt Tobias und findet sie gut. Die Aufträge macht Tobias gerade nicht aktiv, weil die Spielmechanik wichtiger ist. Wunsch: für die Testversion des Prototyps ein Knopf, der den Auftrag automatisch abschließt. Dann gemeinsam das weitere Vorgehen planen.

**Claude** hat vorgeschlagen: Knopf „🧪 Test: Auftrag erledigen“ im Level-Fenster – Erfahrung ja, keine Waren, kein Gold, Aufsteigen kostet weiter Gold; Frage, ob immer oder nur im Testmodus sichtbar. Für das Kräuter-Kapitel: erst das Gesamtbild auf dem Papier, dann häppchenweise umsetzen (v0.16.0 Beet und Level 7 …). Fragen zum Beet (wie der Holzfäller oder echtes Warten?), ein Beet für alle Pflanzen, Preise (wie Holz oder wie Eisen) und eine Skizze für Level 7 (Leinsamen → Beet → Flachsfasern → Webstube mit Verbänden).

**Tobias:** Der Knopf soll immer zu sehen sein. Häppchenweise, wie vorgeschlagen. Das Beet kauft man wie eine Maschine, platziert es und pflanzt den Samen; ein Samen ergibt eine Pflanze, die man etwas größer darstellen kann. Nach einer Zeit ist aus dem Samen eine Pflanze geworden, die man erntet. Dann macht eine Maschine aus der Pflanze Fasern, und im nächsten Schritt gibt es wieder eine Maschine mit 2 Eingängen für Faser + Kräuter. Aus einer Pflanze z. B. 50 Fasern, daraus 10 Verbände. Das Beet soll (noch) keinen Anschluss ans Band haben; darin wächst alles, unabhängig vom Typ. Preise in der mittleren Kategorie – die mittleren Werkstattwaren bringen 72 bis 300 Gold –, z. B. 1 Verband 150 Gold, 1 Samen 1.000 Gold, also 1.500 Gold je Samen; Feintuning später. Die Basis soll günstig bleiben, mit Ringelblumen kann es anziehen (teurer, bringt mehr). Sonst wie Level 1 aufbauen, um klein anzufangen. Weil ein Samen etwa 50 % Rendite bringt, soll es etwa 30 Minuten dauern, bis die Pflanze ausgewachsen ist – so lässt sich der Geldfluss steuern.

**Umgesetzt:** v0.15.0 (siehe Versionshistorie). Tobias' Antworten zum Kräuter-Kapitel stehen in Abschnitt 4.4.

**Claude** hat danach einen Entwurf für Level 7 vorgestellt (Leinsamen → Beet → Flachspflanze → Flachsbreche → 50 Fasern → Webstube → 10 Verbände; Werte 1.000 → 1.250 → 1.500; 3 Beete je Flachsbreche) und gefragt: Pflanze einlegen wie einen Holzstamm? Ernten und neu säen in einem Tipp? Beet 2 × 2? Kommt die Maschine mit 2 Eingängen erst auf Level 8?

**Tobias:** Einlegen: ja. Ernten und Säen sollen zwei getrennte Schritte sein, damit man zweimal alles durchgehen muss. Beet 2 × 2: ja. Level 8: genau richtig verstanden. Schrittweise immer mehr dazu: auf Level 7 erst die Verbände als Grundlage, auf Level 8 kommt etwas dazu, auf Level 9 der nächste Schritt mit einer neuen Pflanze – bis Level 10 hat man Fasern + 3 verschiedene Pflanzen (wie Holz, Eisen und Stein), auf Level 11–12 kann man diese weiter kombinieren. So ähnlich war es schon festgelegt.

**Umgesetzt:** v0.15.1 (nur README): Plan für v0.16.0 – Beet und Level 7 „Die Heilstube“ (Abschnitt 6).

**Tobias:** „Passt so, leg los mit v0.16.0.“

**Umgesetzt:** v0.16.0 (siehe Versionshistorie).

**Tobias (Test von v0.16.0):** Man sieht gut, wie das Beet wächst. Ernten und Säen fühlen sich gut an; Material gab es erst für ein Beet, deshalb lief der Testmodus, damit es schneller wächst. Aus Fasern ließen sich Verbände herstellen. Die Aufträge passen. Der Vorplan war gut, damit wir es gut umsetzen können. Jetzt Level 8 planen.

**Claude** hat einen Entwurf für Level 8 „Der Kräutergarten“ vorgestellt: Ringelblumensamen (1.500 Gold) → Beet → Ringelblume → Trockenboden → 50 Ringelblüten → Kräuterstube (2 Eingänge) mit Heilverband und Kräuterkompresse; Aufstieg 4.000 Gold, 4 Aufträge; Kräuterstube aus 10 Verbänden + 2 Zahnradwellen.

**Tobias:** Für die Pflanzen soll es die gleiche Maschine geben wie für Flachs, damit aus der Ringelblume 50 getrocknete Ringelblüten werden – bei den Pflanzen etwas einfacher halten. Die Rechnung ist sehr gut: dauert lange, bringt aber gutes Geld. Die verschiedenen Blumen (Kräuter) dienen später als Grundlage für einen Mörser, z. B. für Ringelblumenstaub. Die Aufträge passen. Die Gebäude sollen überwiegend aus Werkzeug-Waren hergestellt werden – es ergibt keinen Sinn, dass aus 10 Verbänden und 2 Zahnradwellen eine Maschine wird. Kräuterkompresse gut, aber wofür war sie gedacht? Alles im gleichen Takt; Preise und Namen passen.

**Claude:** Die Kompresse ist für Prellungen und Schwellungen (der Verband für Wunden), später Zutat für Größeres. Vorschlag: die Flachsbreche in „Erntebank“ umbenennen, weil sie jetzt alle Pflanzen verarbeitet.

**Umgesetzt:** v0.16.1 (nur README): Plan für v0.17.0 – Ringelblume und Level 8 „Der Kräutergarten“ (Abschnitt 6).

**Tobias (09.11.2026):** „Ja, das passt so, und die Erntebank darf auch so bleiben. Meiner Meinung nach der bessere Name.“

**Umgesetzt:** v0.17.0 (siehe Versionshistorie). Als Nächstes testet Tobias Level 8; danach planen wir Level 9.

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
