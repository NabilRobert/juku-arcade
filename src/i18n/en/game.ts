/** Word mode and the in-game pieces every mode shares: HUD, cards, pause, timer, combo, End run, results, the bank and shop. */
export const game = {
  play: 'Play ▶',
  pause: '⏸ Pause',
  resume: '▶ Resume',
  level: 'Level',
  combo: 'Combo',
  score: 'Score',
  bestCombo: 'Best combo',
  bestComboIs: 'Best combo {count}',
  comboCount: '{count} combo',
  /** The key that pauses, shown on the Pause button where there's a keyboard. */
  escKey: 'Esc',
  timeLeft: 'Time left',
  scoutsLeft: 'Scout · {count} left',
  keepPlaying: 'Keep playing',
  runEnded: 'Run ended',
  lanternsLit: '{lit} of {total} lanterns lit',
  levelCleared: 'Level cleared ✓',
  /** What each combo rank's Japanese praise means (combo-ranks.ts), by its letter. */
  rankMeanings: {
    F: 'keep going',
    E: 'good',
    D: 'nice',
    C: 'skilful',
    B: 'amazing',
    A: 'the best',
    S: 'perfect',
    SS: 'genius',
    SSS: 'legend',
  },
  card: {
    faceDown: 'Face-down card: tap to flip it',
    noScore: 'no score',
    back: 'Card back',
    turnOver: 'Turn over',
    /** The example sentence's source, linked on a word's back. */
    tatoeba: 'Tatoeba #{id}',
  },
  words: {
    sidePanel: 'Word run',
    board: 'Board',
    hud: 'Run',
    timeLeftInSet: 'Time left in this set',
    timesUp: "Time's up: here are the answers",
    pauseHint: "Paused. Tap a word card to flip it. A card you peek at won't score.",
    missedWords: 'Missed words',
    missedTapToFlip: 'Missed (tap to flip)',
    missedPauseToFlip: 'Missed (pause to flip)',
    deckDone: "Today's deck done!",
    wordsKnown: 'Words known',
    coins: 'Coins',
    finishDeckDone:
      "Your pot was banked, and today's deck is done. Come back tomorrow for the next words.",
    finishDeckLeft:
      "Your pot was banked. Today's deck isn't done yet: keep playing, or come back to finish it.",
  },
  daily: {
    label: 'Today',
    cleared: "Today's reviews cleared ✓",
    progress: 'Today {done} / {total}',
    wordsKnown: 'Words known {known} / {total} ({level})',
    grammarKnown: 'Grammar known {known} / {total} ({level})',

    daysPlayed: 'Played {days} of the last {calendarDays} days',
  },
  endRun: {
    button: 'End run',
    question: 'End this run?',
    kept: 'Your score so far is kept.',
  },
  results: {
    label: 'Run results',
    changeMode: 'Change mode',
    again: '{label} ▶',

    firstBest: 'Your first best: beat it next time!',
    newBest: 'New best! Up from {best}.',
    tie: 'That ties your best ({best}).',
    away: '{gap} away from your best ({best}).',
  },
  bank: {
    label: 'Bank run',
    pot: 'Pot, not yet banked',
    bank: 'Bank',
    shopHere: "The shop's here! Open ▶",
    /** One line of the Scout button's tooltip, and an item's tooltip. */
    guideLine: '{symbol} {name}: {effect}',
    itemTitle: '{name}: {effect}',
  },
  shop: {
    label: 'Shop',
    title: 'The shop',
    yourCoins: 'Your coins',
    slotsFull: '· item slots full',
    buy: 'Buy',
    soldOut: 'Sold out.',
    backToTable: 'Back to the table ▶',
  },
  /** The shop's items (bank-run/items.ts), by id. */
  items: {
    maneki: { name: 'Lucky cat', effect: '+3 coins for every match.' },
    koi: { name: 'Koi', effect: 'Matches from 10 combo up earn double.' },
    omamori: { name: 'Omamori', effect: 'A miss keeps half the pot.' },
    tsuru: { name: 'Crane', effect: 'Once, a miss keeps the whole pot. Then it flies off.' },
    sensu: { name: 'Fan', effect: 'Banking adds 20% to the pot.' },
    take: { name: 'Bamboo', effect: 'When the shop comes, +1 coin per 10 saved (up to 50).' },
  },
  /** The bank run's crests (bank-run/crests.ts), by kind. */
  crests: {
    koban: { name: 'Koban', effect: 'Matched right: double coins for that match.' },
    omikuji: { name: 'Omikuji', effect: 'Matched right: a random gift of coins.' },
    cursed: { name: 'Cursed', effect: 'Missed: lose the pot and {cost} of your banked coins.' },
  },
  /** What floats out of the bank panel when a crest pays out or the pot is lost. */
  notices: {
    koban: '{symbol} Koban! Double coins',
    omikujiPot: '{symbol} Omikuji: +{coins} to the pot',
    omikujiBanked: '{symbol} Omikuji: +{coins} banked',
    cursed: '{symbol} Cursed! −{cost} coins',
    potLost: '−{lost} lost!',
  },
};
