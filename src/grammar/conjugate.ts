/**
 * Verb forms for the grammar mode's sentences (D55, D60): the polite four
 * (食べる becomes 食べます, 食べました, 食べません or 食べませんでした) and
 * the て-form (食べて), which ている, てから and てください build on.
 *
 * N5 sentences need only these five, so this is plain code rather than a
 * conjugation library. It works from OpenJLPT's verb classes (v1, v5k …),
 * and conjugates the written word and its reading the same way, so the
 * furigana can be lined up afterwards (kanji-furigana.ts).
 */

export type PoliteForm = 'masu' | 'mashita' | 'masen' | 'masenDeshita';
/** Every form a template can ask for: the polite four and the て-form. */
export type VerbForm = PoliteForm | 'te';

export interface Verb {
  /** The dictionary form as written, such as 起きる. */
  word: string;
  /** Its reading in kana, such as おきる. */
  reading: string;
  /** OpenJLPT's class code: v1 (ichidan), v5u … v5r-i (godan), vk (来る). */
  verbClass: string;
}

export interface Conjugated {
  word: string;
  reading: string;
}

const POLITE_ENDINGS: Record<PoliteForm, string> = {
  masu: 'ます',
  mashita: 'ました',
  masen: 'ません',
  masenDeshita: 'ませんでした',
};

/** A godan verb's last kana and the i-row kana its polite stem ends in (書く → 書き). */
const GODAN_I_ROW: Record<string, string> = {
  う: 'い',
  く: 'き',
  ぐ: 'ぎ',
  す: 'し',
  つ: 'ち',
  ぬ: 'に',
  ぶ: 'び',
  む: 'み',
  る: 'り',
};

function godanStem(form: string): string {
  const last = form.slice(-1);
  const iRow = GODAN_I_ROW[last];
  if (iRow === undefined) throw new Error(`${form} doesn't end like a godan verb (う-row kana)`);
  return form.slice(0, -1) + iRow;
}

/** The stem that ます joins: 起き, 書き, 来 (read き). */
function politeStem(verb: Verb): Conjugated {
  const { word, reading, verbClass } = verb;
  if (verbClass === 'v1') return { word: word.slice(0, -1), reading: reading.slice(0, -1) };
  // 来る: the kanji stays, but its reading changes from く to き.
  if (verbClass === 'vk') return { word: word.slice(0, -1).replace('く', 'き'), reading: 'き' };
  // Every godan class, including 行く (v5k-s) and ある (v5r-i), is regular in polite forms.
  if (verbClass.startsWith('v5')) return { word: godanStem(word), reading: godanStem(reading) };
  throw new Error(
    `No polite forms for verb class "${verbClass}" (${word}) yet: add it to conjugate.ts`,
  );
}

/** True for a form conjugate knows; a template's typo (mashta) isn't one. */
export function isVerbForm(form: string): form is VerbForm {
  return form === 'te' || form in POLITE_ENDINGS;
}

export function conjugatePolite(verb: Verb, form: PoliteForm): Conjugated {
  const stem = politeStem(verb);
  const ending = POLITE_ENDINGS[form];
  return { word: stem.word + ending, reading: stem.reading + ending };
}

/** A godan verb's last kana and what replaces it in the て-form (書く → 書いて, 待つ → 待って). */
const GODAN_TE: Record<string, string> = {
  う: 'って',
  つ: 'って',
  る: 'って',
  ぬ: 'んで',
  ぶ: 'んで',
  む: 'んで',
  く: 'いて',
  ぐ: 'いで',
  す: 'して',
};

function godanTe(form: string, verbClass: string): string {
  // 行く is the one godan く-verb whose て-form is って, not いて.
  if (verbClass === 'v5k-s') return `${form.slice(0, -1)}って`;
  const ending = GODAN_TE[form.slice(-1)];
  if (ending === undefined) throw new Error(`${form} doesn't end like a godan verb (う-row kana)`);
  return form.slice(0, -1) + ending;
}

/** The て-form: 食べて, 待って, 行って, 来て (read きて). */
export function conjugateTe(verb: Verb): Conjugated {
  const { word, reading, verbClass } = verb;
  if (verbClass === 'v1')
    return { word: `${word.slice(0, -1)}て`, reading: `${reading.slice(0, -1)}て` };
  if (verbClass === 'vk') return { word: `${word.slice(0, -1)}て`, reading: 'きて' };
  if (verbClass.startsWith('v5')) {
    return { word: godanTe(word, verbClass), reading: godanTe(reading, verbClass) };
  }
  throw new Error(`No て-form for verb class "${verbClass}" (${word}) yet: add it to conjugate.ts`);
}

/** Any form a template asks for. */
export function conjugate(verb: Verb, form: VerbForm): Conjugated {
  return form === 'te' ? conjugateTe(verb) : conjugatePolite(verb, form);
}
