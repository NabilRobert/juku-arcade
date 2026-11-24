/**
 * The sentence templates (D55, D56): 10 grammar points × 3 templates.
 *
 * How a template is written:
 * - `units` lists the sentence's units in order, each a list of tiles.
 *   A noun with its particle is one unit of two tiles, so the particle
 *   is a loose tile. The last unit is the predicate.
 * - Every template has at least 2 noun+particle units, so swapping the
 *   particles gives a wrong sentence and the player must know what each
 *   one means; and 3–5 tiles in all.
 * - In a tile, <who> is a slot the tale's setting fills (lexicon.ts
 *   types), <食べる:mashita> is a verb in a polite form (conjugate.ts),
 *   and {毎朝|まいあさ} is fixed text with its furigana.
 * - `fixedUnits` keep their place (でも、… opens its line); `swaps` are
 *   particle swaps that make another right sentence; a `followOn`
 *   template only follows a first sentence on the same shelf.
 *
 * Shelves: S 起 setup, D 承 development, T 転 twist, P 結 punchline.
 * Every point's shelves are the ones bunpou-n5-shelf-map.csv allows
 * (npm run grammar:check), and every tale needs a twist, so at least one
 * point in a pool must be allowed on T.
 */

export type Shelf = 'S' | 'D' | 'T' | 'P';

/**
 * Every grammar point with templates, in the order they're taught: a new
 * player's first points are the first ones here (grammar-reviews.ts).
 * The ids are OpenJLPT's, as in the shelf map.
 */
export const CURRICULUM = [
  'wa',
  'o',
  'ni-time',
  'de-place',
  'mo',
  'made',
  'to-with',
  'kara-from',
  'ga-subject',
  'ga-aru-ga-iru',
] as const;
export type PointId = (typeof CURRICULUM)[number];

export interface Template {
  id: string;
  /** The grammar point the template tests. */
  point: PointId;
  shelf: Shelf;
  units: readonly (readonly string[])[];
  followOn?: boolean;
  fixedUnits?: readonly number[];
  swaps?: readonly (readonly [string, string])[];
}

export const TEMPLATES: readonly Template[] = [
  // は
  {
    id: 'wa-S',
    point: 'wa',
    shelf: 'S',
    units: [['<who>', 'は'], ['{毎朝|まいあさ}<food>', 'を'], ['<食べる:masu>']],
  },
  {
    id: 'wa-D',
    point: 'wa',
    shelf: 'D',
    units: [['<who>', 'は'], ['<place>', 'へ'], ['<行く:mashita>']],
  },
  {
    id: 'wa-P',
    point: 'wa',
    shelf: 'P',
    units: [['<who>', 'は'], ['<thing>', 'を'], ['<忘れる:mashita>']],
  },
  // を
  {
    id: 'o-D',
    point: 'o',
    shelf: 'D',
    units: [['<who>', 'は'], ['<thing>', 'を'], ['<買う:mashita>']],
  },
  {
    id: 'o-P',
    point: 'o',
    shelf: 'P',
    units: [['<place2>', 'に'], ['<thing>', 'を'], ['<忘れる:mashita>']],
  },
  {
    id: 'o-P-more',
    point: 'o',
    shelf: 'P',
    followOn: true,
    units: [['<who2>', 'が'], ['<food>', 'を'], ['<食べる:mashita>']],
  },
  // に (time)
  {
    id: 'ni-S',
    point: 'ni-time',
    shelf: 'S',
    units: [['<who>', 'は'], ['<time>', 'に'], ['<来る:masu>']],
  },
  {
    id: 'ni-S-more',
    point: 'ni-time',
    shelf: 'S',
    followOn: true,
    units: [['<time>', 'に'], ['<place>', 'へ'], ['<行く:masu>']],
  },
  {
    id: 'ni-D',
    point: 'ni-time',
    shelf: 'D',
    units: [['<time>', 'に'], ['<place2>', 'から'], ['<帰る:mashita>']],
    // 午後から学校に帰りました ("went back to school from the afternoon") is right too.
    swaps: [['に', 'から']],
  },
  // で (place)
  {
    id: 'de-D',
    point: 'de-place',
    shelf: 'D',
    units: [['<place>', 'で'], ['<food>', 'を'], ['<買う:mashita>']],
  },
  {
    id: 'de-P',
    point: 'de-place',
    shelf: 'P',
    units: [['<who>', 'は'], ['<place2>', 'で'], ['<寝る:mashita>']],
  },
  {
    id: 'de-P-wait',
    point: 'de-place',
    shelf: 'P',
    units: [['<place>', 'で'], ['<who2>', 'を'], ['<待つ:mashita>']],
  },
  // も
  {
    id: 'mo-T',
    point: 'mo',
    shelf: 'T',
    units: [['でも、<who2>', 'も'], ['<time>', 'に'], ['<来る:masenDeshita>']],
    fixedUnits: [0],
  },
  {
    id: 'mo-T-none',
    point: 'mo',
    shelf: 'T',
    units: [['<place>', 'に'], ['<food>', 'も'], ['<ある:masenDeshita>']],
  },
  {
    id: 'mo-D-more',
    point: 'mo',
    shelf: 'D',
    followOn: true,
    units: [['<who2>', 'も'], ['<place>', 'へ'], ['<行く:mashita>']],
  },
  // まで
  {
    id: 'made-D',
    point: 'made',
    shelf: 'D',
    units: [['<who>', 'は'], ['<place>', 'まで'], ['<走る:mashita>']],
  },
  {
    id: 'made-D-walk',
    point: 'made',
    shelf: 'D',
    units: [['<place2>', 'から'], ['<place>', 'まで'], ['<歩く:mashita>']],
    // 駅まで学校から歩きました is right too.
    swaps: [['から', 'まで']],
  },
  {
    id: 'made-P',
    point: 'made',
    shelf: 'P',
    units: [['<who2>', 'は'], ['<time>', 'まで'], ['<寝る:mashita>']],
  },
  // と (with)
  {
    id: 'to-S',
    point: 'to-with',
    shelf: 'S',
    units: [['<time>', 'に'], ['<who2>', 'と'], ['<会う:masu>']],
  },
  {
    id: 'to-D',
    point: 'to-with',
    shelf: 'D',
    units: [['<who>', 'は'], ['<who2>', 'と'], ['<遊ぶ:mashita>']],
  },
  {
    id: 'to-D-talk',
    point: 'to-with',
    shelf: 'D',
    units: [['<who2>', 'と'], ['<place>', 'で'], ['<話す:mashita>']],
  },
  // から (from)
  {
    id: 'kara-D',
    point: 'kara-from',
    shelf: 'D',
    units: [['<who>', 'は'], ['<place2>', 'から'], ['<帰る:mashita>']],
  },
  {
    id: 'kara-D-work',
    point: 'kara-from',
    shelf: 'D',
    units: [['<time>', 'から'], ['<place>', 'で'], ['<働く:mashita>']],
  },
  {
    id: 'kara-P',
    point: 'kara-from',
    shelf: 'P',
    units: [['<who2>', 'が'], ['<place>', 'から'], ['<来る:mashita>']],
  },
  // が (subject)
  {
    id: 'ga-S',
    point: 'ga-subject',
    shelf: 'S',
    units: [['<place>', 'に'], ['<who2>', 'が'], ['<来る:masu>']],
  },
  {
    id: 'ga-T',
    point: 'ga-subject',
    shelf: 'T',
    units: [['でも、<place>', 'に'], ['<who2>', 'が'], ['<来る:masenDeshita>']],
    fixedUnits: [0],
  },
  {
    id: 'ga-T-forgot',
    point: 'ga-subject',
    shelf: 'T',
    units: [['<who2>', 'が'], ['<thing>', 'を'], ['<忘れる:mashita>']],
  },
  // がある・がいる
  {
    id: 'aru-S',
    point: 'ga-aru-ga-iru',
    shelf: 'S',
    units: [['<place>', 'に'], ['<who2>', 'が'], ['<いる:masu>']],
  },
  {
    id: 'aru-S-thing',
    point: 'ga-aru-ga-iru',
    shelf: 'S',
    units: [['<place2>', 'に'], ['<thing>', 'が'], ['<ある:masu>']],
  },
  {
    id: 'aru-T',
    point: 'ga-aru-ga-iru',
    shelf: 'T',
    units: [['でも、<place>', 'に'], ['<food>', 'が'], ['<ある:masenDeshita>']],
    fixedUnits: [0],
  },
];

/**
 * Each point's pattern, shown as the hint and with a fix. Japanese only
 * (D56): OpenJLPT's patterns carry English, so they're written here, with
 * furigana on the kanji in the same {漢字|かんじ} markup as the tiles.
 */
export const POINT_PATTERNS: Readonly<Record<PointId, string>> = {
  wa: '{名詞|めいし}＋は',
  o: '{名詞|めいし}＋を',
  'ni-time': '{時間|じかん}＋に',
  'de-place': '{場所|ばしょ}＋で',
  mo: '{名詞|めいし}＋も',
  made: '{名詞|めいし}＋まで',
  'to-with': '{人|ひと}＋と',
  'kara-from': '{名詞|めいし}＋から',
  'ga-subject': '{名詞|めいし}＋が',
  'ga-aru-ga-iru': '{場所|ばしょ}＋に＋{名詞|めいし}＋が＋ある・いる',
};
