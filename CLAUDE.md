# Hinweise für Claude

## Zu Beginn jedes Chats

1. Lies **`docs/STAND.md`** (wo wir stehen, nächster Schritt, offene Fragen, die letzten 3 Arbeitsschritte) und **`docs/SPIEL.md`** (das Spiel, wie es heute ist). Das reicht, um loszulegen.
2. `docs/TECHNIK.md` erst lesen, wenn programmiert wird.
3. `docs/archiv/` nie komplett lesen, sondern **gezielt durchsuchen** (z. B. `grep`), wenn es um Früheres geht – warum etwas so entschieden wurde, was Tobias genau gesagt hat, wie ein alter Plan aussah.

## Zusammenarbeit (Regeln von Tobias, 05.11.2026)

- Kommuniziere auf Deutsch. Tobias programmiert nicht selbst und schreibt keine Zeile Code: Ergebnisse verständlich erklären, ohne Programmierkenntnisse vorauszusetzen.
- **Erst planen, dann programmieren:** Vor jedem Code den Plan besprechen und Tobias' Zustimmung abwarten.
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
   - `SCREENSHOT_DIR=<Scratchpad>/shots npm run test:browser`, danach die Screenshots ansehen.
4. **Dokumentieren** (siehe unten).
5. **Mergen:** Pull Request nach `main`, direkt mergen. Die Versionsnummer steht im Titel von Pull Request und Merge-Commit, z. B. `v0.19.0: …` (Tags lassen sich aus der Arbeitsumgebung nicht pushen).
6. **Live:** Die Live-Seite (github.io) ist aus der Arbeitsumgebung nicht erreichbar; nach dem Merge den Pages-Status über GitHub Actions („pages build and deployment“) prüfen.
7. **Testen:** Tobias spielt und gibt Feedback; daraus entsteht der nächste Schritt.

**Versionsnummern `vA.B.C`:** `A = 0` während der Entwicklung (`v1.0.0` = erste rund spielbare Version). `B` steigt bei jedem neuen Arbeitsschritt, `C` bei einer reinen Fehlerkorrektur oder einer reinen Doku-Version ohne Änderung am Spiel. Neue Version setzen: `node tools/set-version.mjs A.B.C` (setzt `src/version.js`, alle `?v=` und die Import-Map in `index.html`) und die Status-Tabelle in `docs/STAND.md` anpassen (ein Test prüft beides).

## Doku pflegen (bei jeder Version)

- **`docs/STAND.md`:** Status-Tabelle (Version, nächster Schritt), Tobias' Fabrik, offene Fragen (Erledigtes raus, als Entscheidung ins Archiv). Den neuen Arbeitsschritt **oben** unter „Die letzten 3 Arbeitsschritte“ eintragen (kurz: warum, was umgesetzt, Tobias' Rückmeldung, was offen ist); **nur 3 bleiben stehen**, der älteste fällt weg.
- **`docs/SPIEL.md`:** Ändert sich das Spiel, den betroffenen Text **ersetzen** (nur der aktuelle Stand, kein „seit v0.x“-Verlauf). Tabellen (Level, Gebäude, Waren) aktuell halten.
- **`docs/TECHNIK.md`:** neue Dateien in die Projektstruktur, neue Test-Inhalte.
- **Archiv (`docs/archiv/`):**
  - `VERSIONEN.md` – neuer Eintrag **oben**: vorgenommen, Fragen, gemacht, geprüft.
  - `GESPRAECHE.md` – **oben**: was Tobias gesagt hat (möglichst mit seinen Worten), Claudes Vorschläge, Antworten, was umgesetzt wurde.
  - `ENTSCHEIDUNGEN.md` – **unten** in der Tabelle: Datum, Entscheidung, Begründung (von wem).
  - `PLAENE.md` – der ausführliche Plan der Version, über dem neuesten Plan.
- **Nichts darf verloren gehen:** Besteht ein Chat nur aus Feedback, Rückfragen oder Planung, sofort als eigene kleine Doku-Version (`C` + 1) festhalten (Chat 12 ging so verloren).
- `STAND.md` und `SPIEL.md` kurz halten – sie werden in jedem Chat gelesen. Ausführliches gehört ins Archiv.

## Technische Regeln

- Spielregeln (Simulation, `src/core/`) strikt getrennt von der Darstellung (`src/view/`) halten; Waren, Rezepte, Gebäude, Preise, Zeiten und Mengen stehen nur in den Datentabellen (`src/core/data/`). Die Simulation läuft in festen Takten (`src/core/sim.js`).
- Nach dem Anlegen einer neuen Programmdatei `node tools/set-version.mjs` aufrufen – sonst lädt der Browser alte und neue Dateien gemischt (ein Test prüft das).
- Knöpfe immer mit `onPress` aus `src/view/press.js` verbinden, nicht mit `click` (Chrome verschluckt Klicks direkt nach schnellem Wischen).
- Browser-Tests nicht von echter Zeit abhängig machen: `window.__game.simulate(sekunden)` nutzen. Die Fabrik läuft im Browser ständig weiter – Prüfungen müssen das aushalten. Gebäude in der Bauleiste im Browser-Test über `tapBuild(page, typ)` antippen (öffnet den passenden Reiter).
- Bei automatischen Textersetzungen (z. B. mit Python) nur genau ein Vorkommen ersetzen und das vorher prüfen; ein mehrfaches Ersetzen hat schon einmal das CSS beschädigt.
- Spielstand-Format (`src/core/save.js`): Bei Änderungen `SAVE_VERSION` erhöhen und alte Spielstände umwandeln, damit Tobias' Fabrik nicht verloren geht.
