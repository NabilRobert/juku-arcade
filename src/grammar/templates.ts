/**
 * The sentence templates' format and the grammar points (D55, D56, D60):
 * the first slice's 20 points, 3–4 templates each. The templates themselves sit in templates/, one
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
import { stateAndSequence } from './templates/state-and-sequence.ts';
import { timeAndPlace } from './templates/time-and-place.ts';
import { topicAndObject } from './templates/topic-and-object.ts';
import { turnsAndSpeech } from './templates/turns-and-speech.ts';

export type Shelf = 'S' | 'D' | 'T' | 'P';

/** Each shelf as the part of the tale it is: 起承転結. */
export const SHELF_NAMES: Readonly<Record<Shelf, string>> = { S: '起', D: '承', T: '転', P: '結' };

// The curriculum lives in its own small module, so the start screen can count the
// level's grammar without loading every template.
export { CURRICULUM, type PointId } from './curriculum.ts';
import type { PointId } from './curriculum.ts';

/**
 * Points whose tested grammar is a pattern rather than a particle after
 * its noun (D60): ている, て, から and so on. Their templates split only
 * the pattern's pieces into loose tiles (待って｜います, 食べて｜から、)
 * and give everything else as ready-made phrases, so their tile rules
 * differ (template-check.ts).
 */
export const PATTERN_POINTS: ReadonlySet<PointId> = new Set<PointId>([
  'te-iru',
  'te',
  'te-kara',
  'ga-but',
  'kara-reason',
  'nani-mo-nai-dare-mo-nai',
  'te-kudasai',
  'masen-ka',
  'yo',
]);

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
  ...stateAndSequence,
  ...turnsAndSpeech,
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
  'ni-destination': '{場所|ばしょ}＋に＋{行|い}く・{来|く}る・{帰|かえ}る',
  'te-iru': '{動詞|どうし}て＋いる',
  te: '{動詞|どうし}て、～',
  'te-kara': '{動詞|どうし}て＋から',
  'ga-but': '～が、～',
  'kara-reason': '～から、～',
  'nani-mo-nai-dare-mo-nai': 'なにも・だれも＋ない',
  'te-kudasai': '{動詞|どうし}て＋ください',
  'masen-ka': '{動詞|どうし}ませんか',
  yo: '～よ',
};
