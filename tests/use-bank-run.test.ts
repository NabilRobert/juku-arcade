// The bank run alongside a word run: matches fill the pot, a miss empties it, banking keeps it.
import { mount } from '@vue/test-utils';
import { describe, expect, it, vi } from 'vitest';
import { defineComponent, h, nextTick, ref } from 'vue';
import type { RunState } from '../src/game/run.ts';
import { FIRST_TARGET, SETS_PER_ROUND } from '../src/bank-run/bank-run.ts';
import { useBankRun } from '../src/bank-run/useBankRun.ts';
import { start } from './helpers/run.ts';

vi.mock('../src/sound/sfx.ts', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../src/sound/sfx.ts')>()),
  playSound: vi.fn(),
}));

function bankFor(initial: RunState, random: () => number = Math.random) {
  const state = ref(initial);
  const endCombo = vi.fn(() => {
    state.value = { ...state.value, combo: 0 };
  });
  const pause = vi.fn(() => {
    state.value = { ...state.value, pausedAtMs: 1 };
  });
  let bank!: ReturnType<typeof useBankRun>;
  mount(
    defineComponent({
      setup() {
        bank = useBankRun(() => state.value, { endCombo, pause }, random);
        return () => h('div');
      },
    }),
  );
  return { state, bank, endCombo, pause };
}

async function match(state: { value: RunState }): Promise<void> {
  state.value = { ...state.value, combo: state.value.combo + 1 };
  await nextTick();
}

describe('the bank run alongside a word run', () => {
  it('fills the pot with each match and loses it on a miss', async () => {
    const { state, bank } = bankFor(start().state);
    await match(state);
    await match(state);
    expect(bank.run.value.pot).toBe(3);
    state.value = { ...state.value, combo: 0 };
    await nextTick();
    expect(bank.run.value.pot).toBe(0);
    expect(bank.notice.value?.text).toBe('−3 lost!');
  });

  it('banks the pot and ends the combo without counting it as a miss', async () => {
    const { state, bank, endCombo } = bankFor(start().state);
    // Holding the crane: a miss would use up its once-a-round save.
    bank.run.value = { ...bank.run.value, items: ['tsuru'] };
    await match(state);
    await match(state);
    bank.bank();
    await nextTick();
    expect(endCombo).toHaveBeenCalled();
    expect(bank.run.value).toMatchObject({ pot: 0, wallet: 3 });
    expect(bank.notice.value).toBeNull();
    expect(bank.run.value.isCraneUsed).toBe(false);
  });

  it("banks a big enough pot at the round's bell and opens the shop", async () => {
    const { state, bank, endCombo } = bankFor(start().state);
    for (let set = 1; set <= SETS_PER_ROUND; set += 1) {
      for (let hit = 0; hit < 5; hit += 1) await match(state);
      state.value = { ...state.value, phase: 'cleared' };
      await nextTick();
      if (set < SETS_PER_ROUND) state.value = { ...state.value, phase: 'playing' };
      await nextTick();
    }
    expect(endCombo).toHaveBeenCalled();
    expect(bank.run.value.offer).not.toBeNull();
    expect(bank.run.value.bankedThisRound).toBeGreaterThanOrEqual(FIRST_TARGET);
  });

  it('scouts twice a round, pausing the game each time, and no more', async () => {
    const { state, bank, pause } = bankFor(start().state);
    bank.scout();
    expect(pause).toHaveBeenCalledOnce();
    state.value = { ...state.value, pausedAtMs: null };
    await nextTick();
    bank.scout();
    state.value = { ...state.value, pausedAtMs: null };
    await nextTick();
    bank.scout();
    expect(pause).toHaveBeenCalledTimes(2);
    expect(bank.run.value.scoutsLeft).toBe(0);
  });

  it('doubles a koban match and charges a cursed miss to the wallet', async () => {
    // Crest rolls, word by word: the first word gets a curse, the second a koban.
    const rolls = [0, 0.9, 0, 0];
    const initial = start().state;
    const { state, bank } = bankFor(initial, () => rolls.shift() ?? 0.99);
    const [cursed, koban] = initial.set.words;
    if (cursed === undefined || koban === undefined) throw new Error('the set has too few words');
    bank.run.value = { ...bank.run.value, wallet: 10 };
    state.value = { ...state.value, combo: 1, matchedWordIds: [koban.id] };
    await nextTick();
    expect(bank.run.value.pot).toBe(2);
    const flash = { wordId: cursed.id, correctIndex: 0, wrongIndex: 1, untilMs: 0 };
    state.value = { ...state.value, combo: 0, flash };
    await nextTick();
    expect(bank.run.value.wallet).toBe(5);
    expect(bank.notice.value?.text).toContain('Cursed');
  });
});
