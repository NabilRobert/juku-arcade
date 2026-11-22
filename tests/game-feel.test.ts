// How the game answers the player: sounds, the combo building on the table, and lost streaks.
import { mount } from '@vue/test-utils';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { defineComponent, h, nextTick, ref } from 'vue';
import ComboMeter from '../src/components/ComboMeter.vue';
import { rankFor } from '../src/components/combo-ranks.ts';
import { THROW_S } from '../src/components/card-motion.ts';
import { useGameFeel } from '../src/composables/useGameFeel.ts';
import type { RunState } from '../src/game/run.ts';
import { comboPitch, isMuted, playSound, setMuted } from '../src/sound/sfx.ts';
import { start } from './helpers/run.ts';

vi.mock('../src/sound/sfx.ts', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../src/sound/sfx.ts')>()),
  playSound: vi.fn(),
}));

const THROW_MS = THROW_S * 1000;

/** Runs useGameFeel inside a component, driven by a state the test changes. */
function feelFor(initial: RunState) {
  const state = ref(initial);
  let feel!: ReturnType<typeof useGameFeel>;
  mount(
    defineComponent({
      setup() {
        feel = useGameFeel(() => state.value);
        return () => h('div');
      },
    }),
  );
  return { state, feel };
}

function withMatch(state: RunState, combo: number, level = state.level): RunState {
  const wordId = state.set.words[state.matchedWordIds.length]?.id ?? '';
  return { ...state, combo, level, matchedWordIds: [...state.matchedWordIds, wordId] };
}

describe('the combo chime', () => {
  it('climbs a note with each match and stops climbing two octaves up', () => {
    expect(comboPitch(1)).toBe(1);
    expect(comboPitch(2)).toBeGreaterThan(comboPitch(1));
    expect(comboPitch(50)).toBe(4);
  });
});

describe('muting', () => {
  it('is remembered in this browser', () => {
    setMuted(true);
    expect(localStorage.getItem('juku-arcade:muted')).toBe('true');
    expect(isMuted.value).toBe(true);
    setMuted(false);
  });
});

describe('the game answering a match', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => {
    vi.useRealTimers();
    vi.mocked(playSound).mockClear();
  });

  it('lands the combo, the slap and the chime when the thrown card hits, not before', async () => {
    const { state, feel } = feelFor(start().state);
    state.value = withMatch(state.value, 1);
    await nextTick();
    expect(feel.shownCombo.value).toBe(0);
    vi.advanceTimersByTime(THROW_MS);
    expect(feel.shownCombo.value).toBe(1);
    expect(feel.impact.value.count).toBe(1);
    expect(playSound).toHaveBeenCalledWith('slap');
    expect(playSound).toHaveBeenCalledWith('chime', comboPitch(1));
  });

  it('shuffles when a new set is dealt', async () => {
    const { state } = feelFor(start().state);
    state.value = { ...state.value, setIndex: state.value.setIndex + 1 };
    await nextTick();
    expect(playSound).toHaveBeenCalledWith('deal');
  });

  it('plays the level-up sound when a match raises the level', async () => {
    const { state } = feelFor(start().state);
    state.value = withMatch(state.value, 10, state.value.level + 1);
    await nextTick();
    vi.advanceTimersByTime(THROW_MS);
    expect(playSound).toHaveBeenCalledWith('levelUp');
  });

  it('shows a lost streak of 3 or more, but not a lost combo of 2', async () => {
    const { state, feel } = feelFor({ ...start().state, combo: 5 });
    state.value = { ...state.value, combo: 0 };
    await nextTick();
    expect(feel.brokenCombo.value).toBe(5);
    expect(playSound).toHaveBeenCalledWith('miss');

    const short = feelFor({ ...start().state, combo: 2 });
    short.state.value = { ...short.state.value, combo: 0 };
    await nextTick();
    expect(short.feel.brokenCombo.value).toBeNull();
  });
});

describe('the combo meter', () => {
  it('stays hidden for a single match', () => {
    const meter = mount(ComboMeter, { props: { combo: 1, brokenCombo: null } });
    expect(meter.text()).toBe('');
  });

  it('shows a style rank that climbs with the combo, with a word of praise', () => {
    const rankAt = (combo: number) =>
      mount(ComboMeter, { props: { combo, brokenCombo: null } }).find('[data-testid="combo-rank"]');
    expect(rankAt(2).text()).toBe('F');
    expect(rankAt(10).text()).toBe('C');
    expect(rankAt(40).text()).toBe('SSS');
    expect(mount(ComboMeter, { props: { combo: 6, brokenCombo: null } }).text()).toContain(
      'いいね',
    );
  });

  it('fills the bar toward the next rank', () => {
    expect(rankFor(9).towardNext).toBe(0);
    expect(rankFor(10).towardNext).toBeCloseTo(1 / 3);
    expect(rankFor(50).towardNext).toBe(1);
    expect(rankFor(1).rank).toBeNull();
  });

  it('shows the streak that was just lost', () => {
    const meter = mount(ComboMeter, { props: { combo: 0, brokenCombo: 7 } });
    expect(meter.text()).toContain('7 combo');
  });
});
