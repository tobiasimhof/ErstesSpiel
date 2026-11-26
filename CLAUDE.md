# Hinweise für Claude

## Oberste Regel (Tobias, 09.11.2026)

**Nie ohne Tobias' Erlaubnis anfangen zu programmieren.** Claude stellt immer zuerst vor, was programmiert werden soll (Ziel, was sich im Spiel ändert, offene Fragen), wartet auf Tobias' ausdrückliches OK und setzt es dann gemeinsam mit ihm um. Das gilt für jede Änderung am Spiel – Code, Datentabellen, Tests. Ausgenommen sind nur reine Doku-Versionen, die Feedback oder Entscheidungen festhalten (Regel „Nichts darf verloren gehen“).

## Zu Beginn jedes Chats

1. Lies **`docs/STAND.md`** (wo wir stehen, nächster Schritt, offene Fragen, die letzten 3 Arbeitsschritte) und **`docs/SPIEL.md`** (das Spiel kurz, wie es heute ist). Das reicht, um loszulegen.
2. `docs/TECHNIK.md` erst lesen, wenn programmiert wird.
3. `docs/inhalte/` nur lesen, was gebraucht wird: `LEVEL.md`, `GEBAEUDE.md`, `WAREN.md` (neue Level, Preise, Baukosten, Rezepte), `BEDIENUNG.md` (Fenster, Bauleiste, Karte), `AUSBLICK.md` (Techbaum, Ideen), `ZAHLEN.md` (Rechenwerkzeug: Rohstoffe, Zeit und Gold je Level und Ware – automatisch erzeugt, neu schreiben mit `node tools/zahlen.mjs`).
4. `docs/archiv/` nie komplett lesen, sondern **gezielt durchsuchen** (z. B. `grep`), wenn es um Früheres geht – warum etwas so entschieden wurde, was Tobias genau gesagt hat, wie ein alter Plan aussah.

## Zusammenarbeit (Regeln von Tobias, 05.11.2026)

- Kommuniziere auf Deutsch. Tobias programmiert nicht selbst und schreibt keine Zeile Code: Ergebnisse verständlich erklären, ohne Programmierkenntnisse vorauszusetzen.
- **Erst planen, dann programmieren:** Vor jedem Code den Plan besprechen und Tobias' Zustimmung abwarten (siehe oberste Regel).
- **Jeder Arbeitsschritt ist eine eigene Version**, damit Fehler klein bleiben und man auf eine ältere Version zurückgehen kann. Viele Kleinigkeiten dürfen in einen größeren Schritt; lieber kleine Schritte.
- **Wir mergen immer direkt und gehen live** (ein einziger Link, GitHub Pages aus `main`).
- **Zurückgehen:** Jede Version ist ein eigener Merge auf `main`, erkennbar an der Versionsnummer im Titel. Läuft nach einem Merge etwas schief, stellt Claude den Stand einer älteren Version wieder her; der Live-Link zeigt dann wieder die alte Version.
- Hauptgerät ist das Galaxy Tab S9 (oft mit Tastatur): Alles muss per Touch im Browser funktionieren. Das Spiel läuft nur im Querformat, auf Tablet und Handy.
- Andere Spiele (Alchemy Factory, Clash of Clans, Hay Day) dienen nur als Vorbild für Mechaniken: eigene Namen, eigene Rezepte, eigene Grafik.

## Arbeitsablauf je Version

1. **Planen:** Ziel, Fragen und Entwurf besprechen; Zustimmung abwarten.
2. **Umsetzen** auf dem Arbeitsbranch.
3. **Prüfen** vor jedem Merge mit Spielcode – automatische Tests und ein Durchlauf im Browser (Playwright) in Tablet- und Handygröße im Querformat:
   - `npm test`
   - `SCREENSHOT_DIR=<Scratchpad>/shots npm run test:browser`, danach die Screenshots ansehen. Seit v0.56.2 laufen die Teile gleichzeitig (`tests/browser/parallel.cjs`, etwa 22 statt 66 Minuten): im Hintergrund mit genug Zeit starten (z. B. 2 Stunden) und die Doku schreiben, während er läuft. Nach einer Korrektur nur den betroffenen Teil wiederholen (`ONLY=… DEVICE=… node tests/browser/smoke.cjs`).
   - **Vor dem ersten Lauf** alle Prüfstellen suchen, die die Änderung betrifft (z. B. `grep` nach alten Texten und Zahlen in `tests/`) – sonst läuft der lange Test zweimal (Tobias, Chat 32: „schneller live“).
4. **Dokumentieren** (siehe unten).
5. **Mergen:** Pull Request nach `main`, direkt mergen. Die Versionsnummer steht im Titel von Pull Request und Merge-Commit, z. B. `v0.19.0: …` (Tags lassen sich aus der Arbeitsumgebung nicht pushen).
6. **Live:** Die Live-Seite (github.io) ist aus der Arbeitsumgebung nicht erreichbar; nach dem Merge den Pages-Status über GitHub Actions („pages build and deployment“) prüfen.
7. **Testen:** Tobias spielt und gibt Feedback; daraus entsteht der nächste Schritt.

**Versionsnummern `vA.B.C`:** `A = 0` während der Entwicklung (`v1.0.0` = erste rund spielbare Version). `B` steigt bei jedem neuen Arbeitsschritt, `C` bei einer reinen Fehlerkorrektur oder einer reinen Doku-Version ohne Änderung am Spiel. Neue Version setzen: `node tools/set-version.mjs A.B.C` (setzt `src/version.js`, alle `?v=` und die Import-Map in `index.html`) und die Status-Tabelle in `docs/STAND.md` anpassen (ein Test prüft beides).

## Doku pflegen (bei jeder Version)

- **`docs/STAND.md`:** Status-Tabelle (Version, nächster Schritt), Tobias' Fabrik, offene Fragen (Erledigtes raus, als Entscheidung ins Archiv). Den neuen Arbeitsschritt **oben** unter „Die letzten 3 Arbeitsschritte“ eintragen (kurz: warum, was umgesetzt, Tobias' Rückmeldung, was offen ist); **nur 3 bleiben stehen**, der älteste fällt weg.
- **`docs/SPIEL.md`** (kurz) und **`docs/inhalte/`** (Einzelheiten, Tabellen für Level, Gebäude, Waren): Ändert sich das Spiel, den betroffenen Text **ersetzen** (nur der aktuelle Stand, kein „seit v0.x“-Verlauf).
- **`docs/TECHNIK.md`:** neue Dateien in die Projektstruktur (je Datei eine kurze Zeile), neue Tests kurz; Einzelheiten und Verlauf gehören nach `VERSIONEN.md`.
- **Archiv (`docs/archiv/`):**
  - `VERSIONEN.md` – neuer Eintrag **oben**: vorgenommen, Fragen, gemacht, geprüft.
  - `GESPRAECHE.md` – **oben**: was Tobias gesagt hat (möglichst mit seinen Worten), Claudes Vorschläge, Antworten, was umgesetzt wurde.
  - `ENTSCHEIDUNGEN.md` – **unten** in der Tabelle: Datum, Entscheidung, Begründung (von wem).
  - `PLAENE.md` – der ausführliche Plan der Version, über dem neuesten Plan.
- **Nichts darf verloren gehen:** Besteht ein Chat nur aus Feedback, Rückfragen oder Planung, sofort als eigene kleine Doku-Version (`C` + 1) festhalten (Chat 12 ging so verloren).
- `STAND.md`, `SPIEL.md` und `TECHNIK.md` kurz halten – sie werden in jedem Chat bzw. beim Programmieren gelesen (ein Test prüft die Größe). Ausführliches gehört nach `docs/inhalte/` oder ins Archiv.

## Technische Regeln

- Spielregeln (Simulation, `src/core/`) strikt getrennt von der Darstellung halten – Oberfläche in `src/ui/`, 3D-Grafik in `src/view3d/` (die 2D-Welt ist seit v0.54.0 entfernt); Waren, Rezepte, Gebäude, Preise, Zeiten und Mengen stehen nur in den Datentabellen (`src/core/data/`). Die Simulation läuft in festen Takten (`src/core/sim.js`).
- Nach dem Anlegen einer neuen Programmdatei `node tools/set-version.mjs` aufrufen – sonst lädt der Browser alte und neue Dateien gemischt (ein Test prüft das).
- Knöpfe immer mit `onPress` aus `src/ui/press.js` verbinden, nicht mit `click` (Chrome verschluckt Klicks direkt nach schnellem Wischen).
- Browser-Tests nicht von echter Zeit abhängig machen: `window.__game.simulate(sekunden)` nutzen. Die Fabrik läuft im Browser ständig weiter – Prüfungen müssen das aushalten. Gebäude in der Bauleiste im Browser-Test über `tapBuild(page, typ)` antippen (öffnet den passenden Reiter).
- Bei automatischen Textersetzungen (z. B. mit Python) nur genau ein Vorkommen ersetzen und das vorher prüfen; ein mehrfaches Ersetzen hat schon einmal das CSS beschädigt.
- Spielstand-Format (`src/core/save.js`): Bei Änderungen `SAVE_VERSION` erhöhen und alte Spielstände umwandeln, damit Tobias' Fabrik nicht verloren geht.
