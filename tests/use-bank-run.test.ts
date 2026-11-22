// SPIKE: the bank run alongside a word run: matches fill the pot, a miss empties it, banking keeps it.
import { mount } from '@vue/test-utils';
import { describe, expect, it, vi } from 'vitest';
import { defineComponent, h, nextTick, ref } from 'vue';
import type { RunState } from '../src/game/run.ts';
import { FIRST_TARGET, SETS_PER_ROUND } from '../src/roguelike/bank-run.ts';
import { useBankRun } from '../src/roguelike/useBankRun.ts';
import { start } from './helpers/run.ts';

vi.mock('../src/sound/sfx.ts', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../src/sound/sfx.ts')>()),
  playSound: vi.fn(),
}));

function bankFor(initial: RunState) {
  const state = ref(initial);
  const endCombo = vi.fn(() => {
    state.value = { ...state.value, combo: 0 };
  });
  let bank!: ReturnType<typeof useBankRun>;
  mount(
    defineComponent({
      setup() {
        bank = useBankRun(() => state.value, endCombo);
        return () => h('div');
      },
    }),
  );
  return { state, bank, endCombo };
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
    expect(bank.lastLoss.value?.amount).toBe(3);
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
    expect(bank.lastLoss.value).toBeNull();
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
});
