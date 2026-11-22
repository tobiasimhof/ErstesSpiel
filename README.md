# ErstesSpiel

Erstes Spiel gecodet zusammen mit Claude.

Ein **Aufbau- und Fabrikspiel mit Wirtschaftssimulation im Mittelalter** (Arbeitstitel offen). Man baut auf einem kleinen Grundstück seine eigene Fabrik: Rohstoffe wie Holzstämme kauft man beim Händler, verarbeitet sie über Förderbänder in Werkstätten zu immer komplexeren Waren und verkauft sie im eigenen Laden. Mit dem Gold kauft man neue Rohstoffe und mehr Fläche und steigt im Level auf; die Bewohner des wachsenden Ortes geben dafür Aufträge. Gespielt wird im Browser auf Tablet und Handy im Querformat.

**Spielen:** https://tobiasimhof.github.io/ErstesSpiel/ (3D-Test: https://tobiasimhof.github.io/ErstesSpiel/?ansicht=3d)

## Dokumentation

| Datei | Inhalt |
|---|---|
| [`docs/STAND.md`](docs/STAND.md) | Wo wir stehen: aktuelle Version, nächster Schritt, offene Fragen, die letzten 3 Arbeitsschritte |
| [`docs/SPIEL.md`](docs/SPIEL.md) | Das Spiel kurz, wie es heute ist: Idee, 3D-Test und echte Fabrik, Kernschleife, Fabrik, Wirtschaft und Fortschritt |
| [`docs/inhalte/`](docs/inhalte/) | Einzelheiten: [Level](docs/inhalte/LEVEL.md), [Gebäude](docs/inhalte/GEBAEUDE.md), [Waren und Rezepte](docs/inhalte/WAREN.md), [Bedienung](docs/inhalte/BEDIENUNG.md), [Ausblick](docs/inhalte/AUSBLICK.md) |
| [`docs/TECHNIK.md`](docs/TECHNIK.md) | Wie das Spiel gebaut ist: Technik, Projektstruktur, Tests |
| [`docs/archiv/`](docs/archiv/) | Der vollständige Verlauf: [Entscheidungen](docs/archiv/ENTSCHEIDUNGEN.md), [Versionen](docs/archiv/VERSIONEN.md), [Gespräche](docs/archiv/GESPRAECHE.md), [Pläne je Version](docs/archiv/PLAENE.md), [Konzept mit Verlauf](docs/archiv/KONZEPT-VERLAUF.md), Langfassungen bis v0.36.2 ([Stand](docs/archiv/STAND-LANGFASSUNG.md), [Spiel](docs/archiv/SPIEL-LANGFASSUNG.md), [Technik](docs/archiv/TECHNIK-LANGFASSUNG.md)) |
| [`CLAUDE.md`](CLAUDE.md) | Arbeitsregeln für Claude: Zusammenarbeit, Arbeitsablauf je Version, Doku-Pflege |

## Zusammenarbeit

Tobias plant und testet, Claude programmiert. Jeder Arbeitsschritt ist eine eigene Version (`vA.B.C`), wird vorher besprochen, nach dem Prüfen direkt nach `main` gemergt und ist dann live. Die Regeln stehen in `CLAUDE.md`.
