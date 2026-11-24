/**
 * The sentence templates (D55). G0's spike: 5 grammar points × 3
 * templates.
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
 * まで, which the design suggested, was swapped for も: none of the other
 * four points may go on the twist shelf (bunpou-n5-shelf-map.csv), and
 * every tale needs a twist.
 */

export type Shelf = 'S' | 'D' | 'T' | 'P';

export interface Template {
  id: string;
  /** The OpenJLPT grammar id the template tests, as in the shelf map. */
  point: string;
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
];
