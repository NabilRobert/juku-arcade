// Built message keys in the game and kanji areas (`game.items.${id}.name` and so on) aren't seen by the
// literal-key check in i18n-messages.test.ts, so this checks every item, crest and rank has its messages in
// both languages.
import { describe, expect, it } from 'vitest';
import { ITEMS } from '../src/bank-run/items.ts';
import { CRESTS } from '../src/bank-run/crests.ts';
import { COMBO_RANKS } from '../src/game/combo-ranks.ts';
import { en } from '../src/i18n/en/index.ts';
import { id } from '../src/i18n/id/index.ts';

const LANGUAGES = { en, id };

describe.each(Object.entries(LANGUAGES))('the %s game messages', (_name, messages) => {
  it('name and explain every shop item', () => {
    for (const item of ITEMS) {
      expect(messages.game.items[item.id].name).not.toBe('');
      expect(messages.game.items[item.id].effect).not.toBe('');
    }
  });

  it('name and explain every crest, in word mode and kanji mode', () => {
    for (const kind of Object.keys(CRESTS) as (keyof typeof CRESTS)[]) {
      expect(messages.game.crests[kind].name).not.toBe('');
      expect(messages.game.crests[kind].effect).not.toBe('');
      expect(messages.kanji.crestEffects[kind]).not.toBe('');
      expect(messages.kanji.crestBonus[kind]).not.toBe('');
    }
  });

  it("say what every combo rank's praise means", () => {
    for (const rank of COMBO_RANKS) expect(messages.game.rankMeanings[rank.letter]).not.toBe('');
  });
});
