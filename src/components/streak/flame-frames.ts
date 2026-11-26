/**
 * The streak's flame, animated: four frames of a pixel fire whose tip
 * sways, flickers low and throws sparks, drawn for this game after a
 * reference sprite sheet from playtesting (deep red outside, orange, a
 * cream core). Each frame is a letter grid like the icons (pixel-icons.ts).
 */

/** What each letter is painted; '.' is see-through. */
export const FLAME_PALETTE: Readonly<Record<string, string>> = {
  d: '#b8322a', // deep red edge
  r: '#e0552d', // red-orange
  o: '#f08c3a', // orange
  y: '#f6b25e', // light orange
  c: '#f6e3bf', // cream core
  s: '#f4c86a', // spark
};

/** The body below the tip, the same in every frame. */
const BODY: readonly string[] = [
  '...drrooyoord...',
  '..drooyyyyoord..',
  '..droyyccyyord..',
  '.droyyccccyyord.',
  '.droyccccccyord.',
  '.droyccccccyord.',
  '..droyccccyord..',
  '...ddrrrrrrdd...',
];

/** Each frame's tip, then the shared body, played in this order. */
export const FLAME_FRAMES: readonly (readonly string[])[] = [
  // leanRight
  [
    '..s.............',
    '.........d......',
    '........dd......',
    '........drd..s..',
    '.......drrd.....',
    '......drord.....',
    '.....drrood.....',
    '....drroyord....',
    ...BODY,
  ],
  // tall
  [
    '.......d.....s..',
    '.......dd.......',
    '......drd.......',
    '......drrd......',
    '.s...drrrd......',
    '.....droord.....',
    '....drooord.....',
    '....drooyord....',
    ...BODY,
  ],
  // leanLeft
  [
    '.....s..........',
    '......d.........',
    '......dd......s.',
    '.....drd........',
    '.....drrd.......',
    '....drrord......',
    '....droord......',
    '....drooyord....',
    ...BODY,
  ],
  // low
  [
    '...........s....',
    '................',
    '.....d....d.....',
    '.....dd..dd.....',
    '.....drddrd..s..',
    '.....drrrrd.....',
    '....drroord.....',
    '....drooyord....',
    ...BODY,
  ],
];
