/**
 * The haiku that close Bunpou's show (D59): 24 to collect, half written
 * for this game in easy Japanese, half classics from before 1900 by
 * Bashō, Buson and Issa (public domain). Each line is in the tiles'
 * {漢字|かんじ} furigana markup, and each haiku is tagged with lexicon
 * words (lexicon.ts), so a run can close on one that fits its last tale.
 * The bank can grow here without code changes.
 */

export interface Haiku {
  id: string;
  lines: readonly [string, string, string];
  /** The poet, for a classic; null for one written for this game. */
  poet: string | null;
  /** Lexicon words the haiku fits: a tale set among them prefers it. */
  tags: readonly string[];
}

const BASHO = '松尾芭蕉';
const BUSON = '与謝蕪村';
const ISSA = '小林一茶';

export const HAIKU_BANK: readonly Haiku[] = [
  // Written for this game.
  {
    id: 'morning-station',
    lines: ['{朝|あさ}の{駅|えき}', 'パンを{食|た}べつつ', '{走|はし}る{人|ひと}'],
    poet: null,
    tags: ['駅', 'パン'],
  },
  {
    id: 'library-rain',
    lines: ['{図書館|としょかん}で', '{本|ほん}を{開|ひら}けば', '{雨|あめ}の{音|おと}'],
    poet: null,
    tags: ['図書館', '本'],
  },
  {
    id: 'park-cat',
    lines: ['{公園|こうえん}の', 'ベンチにねこと', '{春|はる}の{風|かぜ}'],
    poet: null,
    tags: ['公園'],
  },
  {
    id: 'night-clock',
    lines: ['{夜|よる}の{部屋|へや}', '{時計|とけい}の{音|おと}が', 'よく{聞|き}こえ'],
    poet: null,
    tags: ['夜', '時計'],
  },
  {
    id: 'school-cloud',
    lines: ['{学校|がっこう}の', '{窓|まど}から{見|み}える', '{白|しろ}い{雲|くも}'],
    poet: null,
    tags: ['学校', '教室'],
  },
  {
    id: 'cafe-rain',
    lines: ['{喫茶店|きっさてん}', 'コーヒー{一|ひと}つ', '{雨|あめ}やまず'],
    poet: null,
    tags: ['喫茶店', '傘'],
  },
  {
    id: 'way-home-moon',
    lines: ['{帰|かえ}り{道|みち}', '{友達|ともだち}と{見|み}た', '{赤|あか}い{月|つき}'],
    poet: null,
    tags: ['友達', '夜'],
  },
  {
    id: 'sunday-snow',
    lines: ['{日曜日|にちようび}', '{店|みせ}はしずかに', '{雪|ゆき}がふる'],
    poet: null,
    tags: ['日曜日', '店'],
  },
  {
    id: 'teacher-orange',
    lines: ['{先生|せんせい}の', 'かばんの{中|なか}に', 'みかんあり'],
    poet: null,
    tags: ['先生', 'かばん', '果物'],
  },
  {
    id: 'hospital-flower',
    lines: ['{病院|びょういん}の', '{庭|にわ}に{小|ちい}さな', '{花|はな}が{咲|さ}く'],
    poet: null,
    tags: ['病院', '医者'],
  },
  {
    id: 'brother-sea',
    lines: ['{弟|おとうと}と', '{海|うみ}まで{歩|ある}く', '{夏|なつ}の{朝|あさ}'],
    poet: null,
    tags: ['弟'],
  },
  {
    id: 'bento-half',
    lines: ['お{弁当|べんとう}', '{半分|はんぶん}あげる', '{春|はる}の{午後|ごご}'],
    poet: null,
    tags: ['お弁当', '午後'],
  },
  // Classics, before 1900.
  {
    id: 'old-pond',
    lines: ['{古池|ふるいけ}や', '{蛙|かわず}{飛|と}び{込|こ}む', '{水|みず}の{音|おと}'],
    poet: BASHO,
    tags: ['公園'],
  },
  {
    id: 'cicada',
    lines: ['{閑|しずか}さや', '{岩|いわ}にしみ{入|い}る', '{蝉|せみ}の{声|こえ}'],
    poet: BASHO,
    tags: ['午後'],
  },
  {
    id: 'summer-grass',
    lines: ['{夏草|なつくさ}や', '{兵|つわもの}どもが', '{夢|ゆめ}の{跡|あと}'],
    poet: BASHO,
    tags: [],
  },
  {
    id: 'mogami-river',
    lines: ['{五月雨|さみだれ}を', 'あつめて{早|はや}し', '{最上川|もがみがわ}'],
    poet: BASHO,
    tags: ['傘'],
  },
  {
    id: 'withered-field',
    lines: ['{旅|たび}に{病|や}んで', '{夢|ゆめ}は{枯野|かれの}を', 'かけ{廻|めぐ}る'],
    poet: BASHO,
    tags: ['医者', '病院'],
  },
  {
    id: 'rape-flowers',
    lines: ['{菜|な}の{花|はな}や', '{月|つき}は{東|ひがし}に', '{日|ひ}は{西|にし}に'],
    poet: BUSON,
    tags: ['夜'],
  },
  {
    id: 'spring-sea',
    lines: ['{春|はる}の{海|うみ}', '{終日|ひねもす}のたり', 'のたりかな'],
    poet: BUSON,
    tags: [],
  },
  {
    id: 'spring-breeze',
    lines: ['{春風|はるかぜ}や', '{堤|つつみ}{長|なが}うして', '{家|いえ}{遠|とお}し'],
    poet: BUSON,
    tags: ['公園'],
  },
  {
    id: 'skinny-frog',
    lines: ['やせ{蛙|がえる}', '{負|ま}けるな{一茶|いっさ}', 'これにあり'],
    poet: ISSA,
    tags: ['子供'],
  },
  {
    id: 'sparrow-chick',
    lines: ['{雀|すずめ}の{子|こ}', 'そこのけそこのけ', 'お{馬|うま}が{通|とお}る'],
    poet: ISSA,
    tags: ['子供'],
  },
  {
    id: 'orphan-sparrow',
    lines: ['{我|われ}と{来|き}て', '{遊|あそ}べや{親|おや}の', 'ない{雀|すずめ}'],
    poet: ISSA,
    tags: ['子供', '友達'],
  },
  {
    id: 'harvest-moon',
    lines: ['{名月|めいげつ}を', '{取|と}ってくれろと', '{泣|な}く{子|こ}かな'],
    poet: ISSA,
    tags: ['夜', '子供'],
  },
];
