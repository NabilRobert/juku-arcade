/**
 * The Bunpou stage's pixel art (D58): the storyteller, a chibi rakugo
 * performer in haori and hakama on his cushion, in five poses, and a
 * sealed story slip. Each is a grid of letters, one per pixel, like the
 * game's icons (ui/pixel-icons.ts), drawn by PixelSprite.vue, in the
 * game's palette (D33). The audience is built separately
 * (crowd-strip.ts). Drawn for this game.
 */

/** What each letter is painted; '.' is see-through. */
export const STAGE_PALETTE: Readonly<Record<string, string>> = {
  C: '#6e1222', // cushion in shade
  F: '#9b1b30', // red ink
  R: '#1b3a57', // hakama pleats
  S: '#d9a47c', // skin in shade, blush
  a: '#a8dadc', // kimono
  b: '#8a5a2b', // fan ribs, belt
  c: '#9b1b30', // cushion
  e: '#e8889a', // tongue
  f: '#f1faee', // paper
  h: '#1e1a24', // hair
  k: '#0d1b2a', // outline
  m: '#9b1b30', // mouth
  q: '#457b9d', // hakama
  r: '#2a5478', // haori
  s: '#f2c9a0', // skin
  w: '#f1faee', // white collar
  x: '#a8dadc', // sweat drop
};

export type StorytellerPose = 'idle' | 'perform' | 'trip' | 'forgot' | 'bow';

export const STORYTELLER: Record<StorytellerPose, readonly string[]> = {
  /** Kneeling on the cushion, smiling, the closed fan held upright. */
  idle: [
    '.........khkkhkkhkhk........',
    '.......kkhhhhhhhhhhkk.......',
    '......khhhhhhhhhhhhhhk......',
    '......khhhhhhhhhhhhhhk......',
    '......khhhhhhhhhhhhhhk......',
    '......khhhhsshssshhhhk......',
    '......khhhsssssssshhhk......',
    '......khhsssssssssshhk......',
    '.....kkkssskksskksssk.......',
    '....kfffssssssssssssk.......',
    '....kfbfsSssssSsssSsk.......',
    '....kfbfssssksssksssk.......',
    '....kfbfksssskkksssk........',
    '....kfbfkkssssssssk.........',
    '....kfbfk.kkkssskkk.........',
    '....kfbfkkrrwwwwwrrk........',
    '....kfffkrrrwaaawrrrk.......',
    '...ksssskrrrawawarrrk.......',
    '...kssssrrrraaaaarrrrk......',
    '....krrrrrrraaaaarrrrk......',
    '.....krrrrrraaaaarrrrRk.....',
    '......kRrrrraaaaarrrrRk.....',
    '.....kkRrrrbbbbbbbsssRkk....',
    '....kRrrrqqqqqqqqqsssrrRk...',
    '....kRrrqqqqqqRqqqqqqrrRk...',
    '....kRrqqqqRqqRqqRqqqqrRk...',
    '....kRrqqqqRqqRqqRqqqqrRk...',
    '...kkRrqqqqqqqqqqqqqqqrRk...',
    '..kcccccccccccccccccccccck..',
    '..kcccccccccccccccccccccck..',
    '..kCCCCCCCCCCCCCCCCCCCCCCk..',
    '...kkkkkkkkkkkkkkkkkkkkkk...',
  ],
  /** Telling a line: laughing, the fan raised high. */
  perform: [
    '.........khkkhkkhkhk........',
    '.......kkhhhhhhhhhhkk.......',
    '......khhhhhhhhhhhhhhk......',
    '......khhhhhhhhhhhhhhk......',
    '......khhhhhhhhhhhhhhk......',
    '.....kkhhhhsshssshhhhk......',
    '....kfffhhsssssssshhhk......',
    '....kfbfhsssssssssshhk......',
    '....kfbfssskksskksssk.......',
    '....kfbfssssssssssssk.......',
    '....kfbfsSssssSsssSsk.......',
    '....kfbfsssskkkkksssk.......',
    '....kfbfkssskeeekssk........',
    '....kfffkkssskkkssk.........',
    '...kssssk.kkkssskkk.........',
    '...ksssskkrrwwwwwrrk........',
    '....krrrrrrrwaaawrrrk.......',
    '.....krrrrrrawawarrrk.......',
    '......kkrrrraaaaarrrrk......',
    '.......krrrraaaaarrrrk......',
    '......kRrrrraaaaarrrrRk.....',
    '......kRrrrraaaaarrrrRk.....',
    '.....kkRrrrbbbbbbbsssRkk....',
    '....kRrrrqqqqqqqqqsssrrRk...',
    '....kRrrqqqqqqRqqqqqqrrRk...',
    '....kRrqqqqRqqRqqRqqqqrRk...',
    '....kRrqqqqRqqRqqRqqqqrRk...',
    '...kkRrqqqqqqqqqqqqqqqrRk...',
    '..kcccccccccccccccccccccck..',
    '..kcccccccccccccccccccccck..',
    '..kCCCCCCCCCCCCCCCCCCCCCCk..',
    '...kkkkkkkkkkkkkkkkkkkkkk...',
  ],
  /** Tripping over a wrong line: eyes squeezed shut, mouth open, a sweat drop. */
  trip: [
    '.........khkkhkkhkhk........',
    '.......kkhhhhhhhhhhkk.......',
    '......khhhhhhhhhhhhhhk......',
    '......khhhhhhhhhhhhhhkk.....',
    '......khhhhhhhhhhhhhhkxk....',
    '......khhhhsshssshhhhxxxk...',
    '......khhhsssssssshhhxxxk...',
    '......khhsskssssksshhkkk....',
    '.....kkkssssksskssssk.......',
    '....kfffssskssssksssk.......',
    '....kfbfsSssssssssSsk.......',
    '....kfbfssssskkkssssk.......',
    '....kfbfksssskmksssk........',
    '....kfbfkkssskkkssk.........',
    '....kfbfk.kkkssskkk.........',
    '....kfbfkkrrwwwwwrrk........',
    '....kfffkrrrwaaawrrrk.......',
    '...ksssskrrrawawarrrk.......',
    '...kssssrrrraaaaarrrrk......',
    '....krrrrrrraaaaarrrrk......',
    '.....krrrrrraaaaarrrrRk.....',
    '......kRrrrraaaaarrrrRk.....',
    '.....kkRrrrbbbbbbbsssRkk....',
    '....kRrrrqqqqqqqqqsssrrRk...',
    '....kRrrqqqqqqRqqqqqqrrRk...',
    '....kRrqqqqRqqRqqRqqqqrRk...',
    '....kRrqqqqRqqRqqRqqqqrRk...',
    '...kkRrqqqqqqqqqqqqqqqrRk...',
    '..kcccccccccccccccccccccck..',
    '..kcccccccccccccccccccccck..',
    '..kCCCCCCCCCCCCCCCCCCCCCCk..',
    '...kkkkkkkkkkkkkkkkkkkkkk...',
  ],
  /** Forgetting a line that timed out (えーと…): scratching his head. */
  forgot: [
    '.........khkkhkkhkhk........',
    '.......kkhhhhhhhhhhkk.......',
    '......khhhhhhhhhhhhhhk......',
    '......khhhhhhhhhhhhhhk......',
    '......khhhhhhhhhhhhsssk.....',
    '......khhhhsshssshhsssk.....',
    '......khhhsssssssshsssk.....',
    '......khhsssssskksshrrrk....',
    '.....kkkssskksssssssrrrk....',
    '....kfffssssssssssssrrrk....',
    '....kfbfsSssssSsssSskrrrk...',
    '....kfbfsssssssssssskrrrk...',
    '....kfbfksssskkkssskkrrrk...',
    '....kfbfkksssssssskkrrrrk...',
    '....kfbfk.kkkssskkrrrrkk....',
    '....kfbfkkrrwwwwwrrrrrrk....',
    '....kfffkrrrwaaawrrrkkk.....',
    '...ksssskrrrawawarrrk.......',
    '...kssssrrrraaaaarrrrk......',
    '....krrrrrrraaaaarrrrk......',
    '.....krrrrrraaaaarrrrRk.....',
    '......kRrrrraaaaarrrrRk.....',
    '.....kkRrrrbbbbbbbrrrRkk....',
    '....kRrrrqqqqqqqqqrrrrrRk...',
    '....kRrrqqqqqqRqqqqqqrrRk...',
    '....kRrqqqqRqqRqqRqqqqrRk...',
    '....kRrqqqqRqqRqqRqqqqrRk...',
    '...kkRrqqqqqqqqqqqqqqqrRk...',
    '..kcccccccccccccccccccccck..',
    '..kcccccccccccccccccccccck..',
    '..kCCCCCCCCCCCCCCCCCCCCCCk..',
    '...kkkkkkkkkkkkkkkkkkkkkk...',
  ],
  /** Bowing low at the end of the show: the head down, both hands flat in front. */
  bow: [
    '............................',
    '............................',
    '............................',
    '............................',
    '............................',
    '............................',
    '............................',
    '............................',
    '..........k..k..k...........',
    '.........khkkhkkhk..........',
    '.........khhhhhhhhk.........',
    '........khhhhhhhhhhk........',
    '.......khhhhhhhhhhhhk.......',
    '.......khhhhhhhhhhhhk.......',
    '.......khhhhhhhhhhhhk.......',
    '........khhhhhhhhhhk........',
    '........kksssssssskk........',
    '.......krrrrrrrrrrrrk.......',
    '......krrrrrrrrrrrrrrk......',
    '.....krrrrrrrrrrrrrrrrk.....',
    '....kRrrrrrrrrrrrrrrrrRk....',
    '....kRrrrrrrrrrrrrrrrrRk....',
    '....kRrrrrrrrrrrrrrrrrRk....',
    '....kRrrqqqqqqqqqqqqrrRk....',
    '....kRrqqqqqqqRqqqqqqrRk....',
    '....kRrqqqqqqqRqqqqqqrRk....',
    '....kRrsssqqqqRqqqsssrRk....',
    '...kkRrsssqqqqqqqqsssrRkk...',
    '..kcccccccccccccccccccccck..',
    '..kcccccccccccccccccccccck..',
    '..kCCCCCCCCCCCCCCCCCCCCCCk..',
    '...kkkkkkkkkkkkkkkkkkkkkk...',
  ],
};

/** A sealed story slip: one per line built, kept in the storyteller's sleeve until the tale is told. */
export const SLIP: readonly string[] = [
  'kkkkkk',
  'kffffk',
  'kfFFfk',
  'kffffk',
  'kffffk',
  'kffffk',
  'kkkkkk',
];
