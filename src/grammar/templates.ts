/**
 * The sentence templates' format and the grammar points (D55, D56): 10
 * points × 3 templates. The templates themselves sit in templates/, one
 * file per group of points, so each file stays small as points are added.
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
import { companyAndBeing } from './templates/company-and-being.ts';
import { timeAndPlace } from './templates/time-and-place.ts';
import { topicAndObject } from './templates/topic-and-object.ts';

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
  ...topicAndObject,
  ...timeAndPlace,
  ...companyAndBeing,
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
