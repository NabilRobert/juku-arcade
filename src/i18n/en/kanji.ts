/** Kanji mode. */
export const kanji = {
  sidePanel: 'Kanji run',
  modeTitle: 'Kanji mode · {level}',
  progress: 'Kanji {number} / {total}',
  board: 'Kanji board',
  wrongPicksLeft: '{left} of {max} wrong picks left',
  perfect: 'Perfect',
  howToPlay:
    "Pick every reading of the kanji, then press Play. You can make {maxWrong} wrong picks per kanji; a kanji left with readings unfound puts out a lantern, and the sheet ends when all {lanterns} are out. It doesn't change your reviews.",
  sheetNote:
    'A sheet is {perSheet} kanji, or ends when all {lanterns} lanterns are out. A kanji counts as mastered once you find all its readings with no wrong pick on {days} separate days.',
  anotherSheet: 'Another sheet',
  /** Why the sheet ended; End run's title is game.runEnded. */
  lanternsOut: 'Lanterns out',
  sheetDone: 'Sheet done',
  result: {
    perfect: 'Perfect! +{points}',
    found: 'Found {hits} of {total}',
    points: '· +{points}',
    wrongPicks: '1 wrong pick | {n} wrong picks',
    crests: 'Crests {sign}{points}',
    prompt: 'Pick the readings, then Play.',
  },
  scout: {
    turnBack: '↩ Turn back',
    earn: 'A perfect round earns a scout.',
  },
  /** What each crest does in kanji mode (kanji-crests.ts), by kind. */
  crestEffects: {
    koban: 'Picked right: double points for that reading.',
    omikuji: 'Picked right: a bonus of {min} to {max} points.',
    cursed: "Picked: lose {points} points. It's always a wrong reading.",
  },
  /** What floats out of the scout panel when a crest pays out or costs points. */
  crestBonus: {
    koban: '{symbol} Koban! +{points}',
    omikuji: '{symbol} Omikuji! +{points}',
    cursed: '{symbol} Cursed! −{points}',
  },
};
