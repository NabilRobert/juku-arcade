/**
 * The dojo's lanterns (D62): a round paper lantern with ribs, a gold cap,
 * small gold diamonds and a tassel, drawn for this game after a reference
 * from playtesting. One grid, two palettes: lit for a lantern still
 * burning, dim for one a miss has put out, both in the game's palette.
 */

export const LANTERN_GRID: readonly string[] = [
  '.......hh.......',
  '.......hh.......',
  '......oyyo......',
  '...mmrRrrRrpp...',
  '..mmrrRyrRrrpp..',
  '.mmrrrRrrRyrrpp.',
  '.mmryrRrrRrrrpp.',
  '.mmrrrRyrRrrypp.',
  '.mmrrrRrrRrrrpp.',
  '.mmryrRrrRyrrpp.',
  '..mmrrRrrRrrpp..',
  '...mmrRyrRrpp...',
  '......oyyo......',
  '.....toyyot.....',
  '.....tyoyot.....',
  '....t.oy.yt.....',
  '....t.o..y.t....',
  '...t..o..y......',
];

/** Lit: the game's crimson paper (style.css), shaded, with lamp-yellow gold and cedar wood. */
export const LIT_PALETTE: Readonly<Record<string, string>> = {
  h: '#7a5230', // hanger, cedar
  o: '#e0a040', // cap and tassel, amber
  y: '#f4c86a', // gold, the lamp colour
  m: '#6e1222', // shaded side
  r: '#9b1b30', // paper, crimson
  R: '#7a1526', // ribs
  p: '#c8344a', // lit side
  t: '#9b1b30', // tassel, crimson
};

/** Dim: the same lantern, out, in the panels' navy and steel, so it sinks into the table. */
export const DIM_PALETTE: Readonly<Record<string, string>> = {
  h: '#16304a', // wood
  o: '#2a5478', // lacquer, lit
  y: '#457b9d', // steel
  m: '#13283d', // sumi
  r: '#1b3a57', // lacquer
  R: '#16304a', // wood
  p: '#2a5478', // lacquer, lit
  t: '#1b3a57', // lacquer
};
