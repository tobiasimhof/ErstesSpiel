// Gebäude-Tabelle: Neue Gebäude sind neue Einträge.
//
// size:  [Breite, Höhe] in Feldern (ungedreht).
// ports: Ein- und Ausgänge. x/y = Feld innerhalb des Gebäudes (ungedreht),
//        side = Seite, an der das Förderband andockt (N, E, S, W).
//        kind 'in' = Eingang (blauer Pfeil), 'out' = Ausgang (oranger Pfeil).
// soon:  was das Gebäude in einer der nächsten Versionen können wird.

export const BUILDINGS = {
  holzfaeller: {
    name: 'Holzfällerlager',
    icon: '🪓',
    size: [2, 2],
    color: '#4f7f35',
    description: 'Fällt Bäume und liefert Holz, deinen ersten Grundstoff.',
    soon: 'Produziert Holz und gibt es am orangen Pfeil auf ein Förderband.',
    ports: [{ kind: 'out', x: 1, y: 0, side: 'E' }],
  },
  steinbruch: {
    name: 'Steinbruch',
    icon: '⛏️',
    size: [2, 2],
    color: '#7d8590',
    description: 'Bricht Stein aus dem Fels und liefert Stein, deinen zweiten Grundstoff.',
    soon: 'Produziert Stein und gibt es am orangen Pfeil auf ein Förderband.',
    ports: [{ kind: 'out', x: 1, y: 0, side: 'E' }],
  },
  saegewerk: {
    name: 'Sägewerk',
    icon: '🪚',
    size: [2, 1],
    color: '#a0703c',
    description:
      'Zersägt Holz zu Brettern oder Holzblöcken. Holz kommt am blauen Pfeil hinein, die Ware am orangen Pfeil heraus.',
    soon: 'Verarbeitet Holz vom Förderband zu Brettern.',
    ports: [
      { kind: 'in', x: 0, y: 0, side: 'W' },
      { kind: 'out', x: 1, y: 0, side: 'E' },
    ],
  },
};

// Reihenfolge im Baumenü.
export const BUILD_MENU = ['holzfaeller', 'steinbruch', 'saegewerk'];
