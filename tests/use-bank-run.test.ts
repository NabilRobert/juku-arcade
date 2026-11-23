// The bank run alongside a word run: matches fill the pot, a miss empties it, banking keeps it, the shop comes and goes.
import { mount } from '@vue/test-utils';
import { describe, expect, it, vi } from 'vitest';
import { defineComponent, h, nextTick, ref } from 'vue';
import type { RunState } from '../src/game/run.ts';
import { COINS_PER_MATCH, SHOP_CHANCE } from '../src/bank-run/bank-run.ts';
import { CURSE_COST } from '../src/bank-run/crests.ts';
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
  const resume = vi.fn(() => {
    state.value = { ...state.value, pausedAtMs: null };
  });
  let bank!: ReturnType<typeof useBankRun>;
  mount(
    defineComponent({
      setup() {
        bank = useBankRun(() => state.value, { endCombo, pause, resume }, random);
        return () => h('div');
      },
    }),
  );
  return { state, bank, endCombo, pause, resume };
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
    expect(bank.run.value.pot).toBe(2 * COINS_PER_MATCH);
    state.value = { ...state.value, combo: 0 };
    await nextTick();
    expect(bank.run.value.pot).toBe(0);
    expect(bank.notice.value?.text).toBe(`−${2 * COINS_PER_MATCH} lost!`);
  });

  it('banks the pot and ends the combo without counting it as a miss', async () => {
    const { state, bank, endCombo } = bankFor(start().state);
    // Holding the crane: a miss would use up its one save.
    bank.run.value = { ...bank.run.value, items: ['tsuru'] };
    await match(state);
    await match(state);
    bank.bank();
    await nextTick();
    expect(endCombo).toHaveBeenCalled();
    expect(bank.run.value).toMatchObject({ pot: 0, coins: 2 * COINS_PER_MATCH });
    expect(bank.notice.value).toBeNull();
    expect(bank.run.value.items).toEqual(['tsuru']);
  });

  it('brings the shop now and then; opening it pauses the game and leaving it resumes', async () => {
    // Each roll brings the shop (crest rolls also see 0, so dealing crests is unaffected here).
    const { state, bank, pause, resume } = bankFor(start().state, () => 0);
    state.value = { ...state.value, phase: 'cleared' };
    await nextTick();
    expect(bank.run.value.shop).toBe('here');
    bank.openShop();
    expect(pause).toHaveBeenCalledOnce();
    expect(bank.run.value.shop).toBe('open');
    bank.closeShop();
    expect(resume).toHaveBeenCalledOnce();
    expect(bank.run.value.shop).toBe('left');
  });

  it('leaves the shop when the player resumes with Esc', async () => {
    const { state, bank } = bankFor(start().state, () => 0);
    state.value = { ...state.value, phase: 'cleared' };
    await nextTick();
    bank.openShop();
    await nextTick();
    state.value = { ...state.value, pausedAtMs: null };
    await nextTick();
    expect(bank.run.value.shop).toBe('left');
  });

  it("doesn't bring the shop on an unlucky roll", async () => {
    const { state, bank } = bankFor(start().state, () => SHOP_CHANCE);
    state.value = { ...state.value, phase: 'cleared' };
    await nextTick();
    expect(bank.run.value.shop).toBe('away');
  });

  it('scouts twice, pausing the game each time, and no more', async () => {
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

  it('doubles a koban match and charges a cursed miss to your banked coins', async () => {
    // Crest rolls, word by word: the first word gets a curse, the second a koban.
    const rolls = [0, 0.9, 0, 0];
    const initial = start().state;
    const { state, bank } = bankFor(initial, () => rolls.shift() ?? 0.99);
    const [cursed, koban] = initial.set.words;
    if (cursed === undefined || koban === undefined) throw new Error('the set has too few words');
    bank.run.value = { ...bank.run.value, coins: 100 };
    state.value = { ...state.value, combo: 1, matchedWordIds: [koban.id] };
    await nextTick();
    expect(bank.run.value.pot).toBe(2 * COINS_PER_MATCH);
    const flash = { wordId: cursed.id, correctIndex: 0, wrongIndex: 1, untilMs: 0 };
    state.value = { ...state.value, combo: 0, flash };
    await nextTick();
    expect(bank.run.value.coins).toBe(100 - CURSE_COST);
    expect(bank.notice.value?.text).toContain('Cursed');
  });
});
