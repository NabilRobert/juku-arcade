/**
 * The interface languages (D73): English and Indonesian, the two the
 * school's players read. Japanese on the cards is the thing being learned,
 * so it never changes with this choice.
 *
 * The first visit follows the browser's language (an Indonesian phone gets
 * Indonesian); after that, the choice in Settings is remembered in this
 * browser like the other preferences.
 */
import { readStored } from '../memory/safe-storage.ts';
import { PREFERENCE_KEYS } from '../preferences/preference-keys.ts';

export const LANGUAGES = ['en', 'id'] as const;
export type Language = (typeof LANGUAGES)[number];

/** Each language's name in itself, so a player can find their own on the switch. */
export const LANGUAGE_NAMES: Record<Language, string> = {
  en: 'English',
  id: 'Bahasa Indonesia',
};

export const DEFAULT_LANGUAGE: Language = 'en';

function isLanguage(value: string | null): value is Language {
  return LANGUAGES.some((language) => language === value);
}

/** The first browser language we have, by its main subtag (`id-ID` → `id`). */
function browserLanguage(): Language | undefined {
  const preferred = typeof navigator === 'undefined' ? [] : navigator.languages;
  for (const tag of preferred) {
    const main = tag.split('-')[0]?.toLowerCase() ?? '';
    if (isLanguage(main)) return main;
  }
  return undefined;
}

export function startingLanguage(): Language {
  const saved = readStored(PREFERENCE_KEYS.language);
  if (isLanguage(saved)) return saved;
  return browserLanguage() ?? DEFAULT_LANGUAGE;
}
