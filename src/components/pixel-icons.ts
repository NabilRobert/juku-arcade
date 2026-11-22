/**
 * The game's small icons as pixel art (D43): a magnifying glass for Scout,
 * a speaker with and without sound for the sound switch, and a gold coin for
 * the bank run's pot, wallet and prices. Each icon is a
 * grid of letters, one per pixel, so it reads like the sprite it draws;
 * `iconPaths` turns a grid into one SVG path per colour, and PixelIcon.vue
 * draws them. Drawn for this game in the style of classic pixel icons.
 */

export type IconName = 'scout' | 'soundOn' | 'soundOff' | 'coin';

/** What each letter in a grid is painted; '.' is see-through. */
const PALETTE: Record<string, string> = {
  k: '#0d1b2a', // outline
  l: '#d6dde3', // light metal
  g: '#9aa6b0', // metal
  d: '#5d6b77', // dark metal
  w: '#ffffff', // glint on the lens
  c: '#9feaff', // lens, lit
  b: '#3cc8f0', // lens
  y: '#ffc93c', // speaker cone, coin face
  h: '#fff1a8', // coin's lit rim
  o: '#f08c1a', // speaker box and shade, coin's ring and sign
};

/** A speaker facing right; the sound or the cross goes in columns 10 to 15. */
function speaker(right: readonly string[]): string[] {
  const body = [
    '.......kk.......',
    '......kok.......',
    '.....koyk.......',
    '....koyyk.......',
    'kkkkoyyyk.......',
    'kooooyyyk.......',
    'koyooyyyk.......',
    'koyooyyyk.......',
    'kooooyyyk.......',
    'kkkkoyyyk.......',
    '....koyyk.......',
    '.....koyk.......',
    '......kok.......',
    '.......kk.......',
  ];
  return body.map((row, index) => row.slice(0, 10) + (right[index] ?? '......'));
}

export const ICONS: Record<IconName, readonly string[]> = {
  scout: [
    '....kkkkkk......',
    '..kklllllgkk....',
    '..kllkkkkggk....',
    '.kllkwccckggk...',
    '.klkwwcccckdk...',
    '.klkcccccckdk...',
    '.klkbbbbbbkdk...',
    '.klkbbbbbbkdk...',
    '.kggkbbbbkddk...',
    '..kggkkkkddk....',
    '..kkgdddddklgk..',
    '....kkkkkk.klgk.',
    '............klgk',
    '.............klg',
    '..............kk',
  ],
  soundOn: speaker([
    '......',
    '......',
    '..k...',
    '...k..',
    '....k.',
    'k...k.',
    '.k..k.',
    '.k..k.',
    'k...k.',
    '....k.',
    '...k..',
    '..k...',
    '......',
    '......',
  ]),
  soundOff: speaker([
    '......',
    '......',
    '......',
    '......',
    '......',
    'kk..kk',
    '.kkkk.',
    '..kk..',
    '.kkkk.',
    'kk..kk',
    '......',
    '......',
    '......',
    '......',
  ]),
  coin: [
    '.....kkkkkk.....',
    '...kkhhhhhhkk...',
    '..khhyyyyyyhhk..',
    '.khyyooooooyyok.',
    '.khyoyyooyyhyok.',
    'khyoyyoooooyhyok',
    'khyoyooooyyyhyok',
    'khyoyyooooyyhyok',
    'khyoyyyooooyhyok',
    'khyoyoooooyyhyok',
    'khyoyyyooyyyhyok',
    '.khyhyyooyyhyok.',
    '.khyyhhhhhhyyok.',
    '..kooyyyyyyook..',
    '...kkooooookk...',
    '.....kkkkkk.....',
  ],
};

export interface IconPath {
  colour: string;
  d: string;
}

/** The icon's size in pixels, for the SVG's viewBox. */
export function iconSize(name: IconName): { width: number; height: number } {
  const grid = ICONS[name];
  return { width: grid[0]?.length ?? 0, height: grid.length };
}

/** One path per colour, made of runs of same-coloured pixels along each row. */
export function iconPaths(name: IconName): IconPath[] {
  const paths = new Map<string, string>();
  ICONS[name].forEach((row, y) => {
    let x = 0;
    while (x < row.length) {
      const letter = row[x] ?? '.';
      let end = x + 1;
      while (row[end] === letter) end += 1;
      if (letter !== '.') {
        const colour = PALETTE[letter];
        if (colour === undefined) {
          throw new Error(`Icon "${name}" uses "${letter}", which isn't in PALETTE: add it there`);
        }
        paths.set(colour, `${paths.get(colour) ?? ''}M${x} ${y}h${end - x}v1H${x}z`);
      }
      x = end;
    }
  });
  return [...paths].map(([colour, d]) => ({ colour, d }));
}
