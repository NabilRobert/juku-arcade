/**
 * Polite verb forms for the grammar mode's sentences (D55): 食べる becomes
 * 食べます, 食べました, 食べません or 食べませんでした.
 *
 * N5 sentences need only these four, so this is plain code rather than a
 * conjugation library. It works from OpenJLPT's verb classes (v1, v5k …),
 * and conjugates the written word and its reading the same way, so the
 * furigana can be lined up afterwards (kanji-furigana.ts).
 */

export type PoliteForm = 'masu' | 'mashita' | 'masen' | 'masenDeshita';

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

/** True for a form conjugatePolite knows; a template's typo (mashta) isn't one. */
export function isPoliteForm(form: string): form is PoliteForm {
  return form in POLITE_ENDINGS;
}

export function conjugatePolite(verb: Verb, form: PoliteForm): Conjugated {
  const stem = politeStem(verb);
  const ending = POLITE_ENDINGS[form];
  return { word: stem.word + ending, reading: stem.reading + ending };
}
