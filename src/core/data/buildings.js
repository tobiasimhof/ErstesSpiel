// Gebäude-Tabelle: Neue Gebäude sind neue Einträge.
// size: [Breite, Höhe] in Feldern.
// soon: was das Gebäude in einer der nächsten Versionen können wird.

export const BUILDINGS = {
  laden: {
    name: 'Laden',
    icon: '⚖️',
    size: [3, 3],
    color: '#b5763a',
    description:
      'Dein Hauptgebäude. Hier kommen deine Waren an und werden verkauft. ' +
      'Sein Level bestimmt, was du freischalten kannst.',
    soon: 'Waren annehmen, lagern und an Händler verkaufen.',
  },
  holzfaeller: {
    name: 'Holzfällerlager',
    icon: '🪓',
    size: [2, 2],
    color: '#4f7f35',
    description: 'Fällt Bäume und liefert Holz, deinen ersten Grundstoff.',
    soon: 'Produziert Holz und gibt es auf ein Förderband.',
  },
  steinbruch: {
    name: 'Steinbruch',
    icon: '⛏️',
    size: [2, 2],
    color: '#7d8590',
    description: 'Bricht Stein aus dem Fels und liefert Stein, deinen zweiten Grundstoff.',
    soon: 'Produziert Stein und gibt es auf ein Förderband.',
  },
};
