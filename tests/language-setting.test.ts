// The interface language (D73): the first visit follows the browser, the Settings switch changes every word
// at once and is remembered, and the page's lang attribute follows it for screen readers.
import { mount } from '@vue/test-utils';
import { afterEach, describe, expect, it, vi } from 'vitest';
import SettingsPanel from '../src/components/SettingsPanel.vue';
import { language } from '../src/i18n/index.ts';
import { startingLanguage } from '../src/i18n/languages.ts';
import type { Settings } from '../src/memory/storage.ts';
import { PREFERENCE_KEYS } from '../src/preferences/preference-keys.ts';

const settings: Settings = {
  playerId: 'player-1',
  level: 'N5',
  classCode: null,
  bestCombo: 0,
  playDay: null,
  playMsToday: 0,
  checkUpOfferedDay: null,
};

function browserLanguages(languages: string[]): void {
  vi.spyOn(navigator, 'languages', 'get').mockReturnValue(languages);
}

afterEach(() => {
  vi.restoreAllMocks();
  localStorage.clear();
});

describe('the interface language', () => {
  it('starts in Indonesian on a browser set to Indonesian', () => {
    browserLanguages(['id-ID', 'en-US']);
    expect(startingLanguage()).toBe('id');
  });

  it('starts in English on a browser in a language the game has no words for', () => {
    browserLanguages(['ja-JP', 'fr-FR']);
    expect(startingLanguage()).toBe('en');
  });

  it("keeps the player's own choice over the browser's language", () => {
    browserLanguages(['id-ID']);
    localStorage.setItem(PREFERENCE_KEYS.language, 'en');
    expect(startingLanguage()).toBe('en');
  });

  it('switches Settings to Indonesian at once, remembers it, and marks the page', async () => {
    const panel = mount(SettingsPanel, { props: { settings } });
    expect(panel.find('h2').text()).toBe('Settings');
    await panel.find('[data-testid="language-id"]').trigger('click');
    expect(panel.find('h2').text()).toBe('Pengaturan');
    expect(language.value).toBe('id');
    expect(localStorage.getItem(PREFERENCE_KEYS.language)).toBe('id');
    expect(document.documentElement.lang).toBe('id');
  });
});
