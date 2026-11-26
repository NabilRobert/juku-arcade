// The start screen's text that plain modules look up (D73): it follows the interface language when asked again.
import { afterEach, describe, expect, it } from 'vitest';
import { i18n } from '../src/i18n/index.ts';
import { dayLabel } from '../src/memory/play-calendar.ts';
import { modeName } from '../src/memory/play-log.ts';

const TODAY = '2026-11-26';

afterEach(() => {
  i18n.global.locale.value = 'en';
});

describe('the start screen in Indonesian', () => {
  it('names the modes in Indonesian', () => {
    i18n.global.locale.value = 'id';
    expect([modeName('words'), modeName('dojo')]).toEqual(['Kata', 'Latihan']);
  });

  it('writes calendar days in Indonesian', () => {
    i18n.global.locale.value = 'id';
    expect(dayLabel(TODAY, TODAY)).toBe('Hari ini');
    expect(dayLabel('2026-11-23', TODAY)).toBe('Sen, 23 Nov');
  });
});
