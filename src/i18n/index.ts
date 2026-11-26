/**
 * The translator (vue-i18n, D73). Every word of the interface comes from
 * the message files in en/ and id/, looked up by key: `t('settings.title')`
 * in a template, or `translate(...)` in a plain module that runs inside a
 * component's render (so it still follows a language change).
 *
 * The Composition API mode (legacy: false) matches the rest of the app.
 * Messages are plain TypeScript, so the Indonesian files are type-checked
 * against the English ones: a missing or misspelt key fails `typecheck`.
 */
import { computed } from 'vue';
import { createI18n } from 'vue-i18n';
import { writeStored } from '../memory/safe-storage.ts';
import { PREFERENCE_KEYS } from '../preferences/preference-keys.ts';
import { en, type Messages } from './en/index.ts';
import { id } from './id/index.ts';
import { DEFAULT_LANGUAGE, startingLanguage, type Language } from './languages.ts';

export const i18n = createI18n<[Messages], Language, false>({
  legacy: false,
  locale: startingLanguage(),
  fallbackLocale: DEFAULT_LANGUAGE,
  messages: { en, id },
});

/** The interface language now; reactive. */
export const language = computed<Language>(() => i18n.global.locale.value);

function markPageLanguage(next: Language): void {
  if (typeof document !== 'undefined') document.documentElement.lang = next;
}

export function setLanguage(next: Language): void {
  i18n.global.locale.value = next;
  writeStored(PREFERENCE_KEYS.language, next);
  markPageLanguage(next);
}

markPageLanguage(language.value);

/** `t` for plain modules (mode names, help text): call it while rendering, not at import. */
export const translate = i18n.global.t;
