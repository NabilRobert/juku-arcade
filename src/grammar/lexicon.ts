/**
 * The words that fill the grammar mode's templates (D55): N5
 * nouns tagged by type, so "eat" only takes food and "go" only takes
 * places, and the verbs the templates use, with OpenJLPT's verb classes.
 *
 * Every entry is an OpenJLPT N5 word with its OpenJLPT reading and class;
 * `npm run grammar:check` (scripts/grammar-check.ts) checks that against
 * the pinned database, so a typo fails the check, not a tale.
 */
import type { Verb } from './conjugate.ts';

export type NounType = 'person' | 'place' | 'food' | 'thing' | 'time';

export interface Noun {
  word: string;
  reading: string;
  type: NounType;
}

function nouns(type: NounType, pairs: string): Noun[] {
  // "駅 えき, 学校 がっこう": compact to write, one word and reading per comma.
  return pairs.split(',').map((pair) => {
    const [word = '', reading = ''] = pair.trim().split(' ');
    return { word, reading, type };
  });
}

export const NOUNS: readonly Noun[] = [
  ...nouns(
    'person',
    '先生 せんせい, 友達 ともだち, お母さん おかあさん, お父さん おとうさん, お兄さん おにいさん, ' +
      'お姉さん おねえさん, 弟 おとうと, 妹 いもうと, 学生 がくせい, 医者 いしゃ, 子供 こども, ' +
      'おばあさん おばあさん',
  ),
  ...nouns(
    'place',
    '駅 えき, 学校 がっこう, 公園 こうえん, 銀行 ぎんこう, 病院 びょういん, 図書館 としょかん, ' +
      '店 みせ, 喫茶店 きっさてん, 会社 かいしゃ, 教室 きょうしつ, レストラン レストラン, ' +
      '郵便局 ゆうびんきょく',
  ),
  ...nouns(
    'food',
    'パン パン, 卵 たまご, 肉 にく, 魚 さかな, 果物 くだもの, お菓子 おかし, お弁当 おべんとう, ' +
      '野菜 やさい',
  ),
  ...nouns(
    'thing',
    '傘 かさ, 本 ほん, かばん かばん, 財布 さいふ, 帽子 ぼうし, 時計 とけい, 辞書 じしょ, ' +
      '眼鏡 めがね, 手紙 てがみ',
  ),
  // Only times that take に (日曜日に); 朝 and 今日 don't, so they're left out.
  ...nouns(
    'time',
    '日曜日 にちようび, 月曜日 げつようび, 金曜日 きんようび, 土曜日 どようび, 午後 ごご, 夜 よる',
  ),
];

export const VERBS: readonly Verb[] = [
  { word: '食べる', reading: 'たべる', verbClass: 'v1' },
  { word: '忘れる', reading: 'わすれる', verbClass: 'v1' },
  { word: '寝る', reading: 'ねる', verbClass: 'v1' },
  { word: '行く', reading: 'いく', verbClass: 'v5k-s' },
  { word: '買う', reading: 'かう', verbClass: 'v5u' },
  { word: '帰る', reading: 'かえる', verbClass: 'v5r' },
  { word: '待つ', reading: 'まつ', verbClass: 'v5t' },
  { word: 'ある', reading: 'ある', verbClass: 'v5r-i' },
  { word: 'いる', reading: 'いる', verbClass: 'v1' },
  { word: '走る', reading: 'はしる', verbClass: 'v5r' },
  { word: '歩く', reading: 'あるく', verbClass: 'v5k' },
  { word: '働く', reading: 'はたらく', verbClass: 'v5k' },
  { word: '会う', reading: 'あう', verbClass: 'v5u' },
  { word: '遊ぶ', reading: 'あそぶ', verbClass: 'v5b' },
  { word: '話す', reading: 'はなす', verbClass: 'v5s' },
  { word: '来る', reading: 'くる', verbClass: 'vk' },
];

export function verbByWord(word: string): Verb {
  const verb = VERBS.find((entry) => entry.word === word);
  if (verb === undefined) throw new Error(`A template uses the verb ${word}: add it to lexicon.ts`);
  return verb;
}
