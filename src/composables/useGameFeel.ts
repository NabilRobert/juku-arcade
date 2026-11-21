/**
 * How the game answers what the player does, beyond the cards moving:
 * sounds, the combo building on the table, and the table shaking on a hit.
 * It watches the run's state for what changed (a new deal, a match, a
 * miss, a level, a cleared or timed-out set) and plays the reaction.
 *
 * A match lands when the thrown card hits its word card, not when it's let
 * go, so the slap, the chime and the shake wait for the throw (THROW_S).
 */
import { onUnmounted, ref, watch } from 'vue';
import { THROW_S } from '../components/card-motion.ts';
import type { RunState } from '../game/run.ts';
import { comboPitch, playSound } from '../sound/sfx.ts';

/** A combo this long is a streak worth losing: breaking it shows on the table. */
export const STREAK_COMBO = 3;

const THROW_MS = THROW_S * 1000;

export interface Impact {
  /** Counts up on every hit, so the table knows to shake. */
  count: number;
  /** The combo the hit made, which sets how hard the table shakes. */
  combo: number;
}

export function useGameFeel(state: () => RunState) {
  const impact = ref<Impact>({ count: 0, combo: 0 });
  /** The combo the table shows: it rises on each hit, after the throw lands. */
  const shownCombo = ref(state().combo);
  /** The streak just lost, shown briefly as it breaks; null when none. */
  const brokenCombo = ref<number | null>(null);
  const timers = new Set<ReturnType<typeof setTimeout>>();

  function later(action: () => void, delayMs: number): void {
    const timer = setTimeout(() => {
      timers.delete(timer);
      action();
    }, delayMs);
    timers.add(timer);
  }

  function landHit(combo: number, isLevelUp: boolean): void {
    playSound('slap');
    playSound('chime', comboPitch(combo));
    if (isLevelUp) playSound('levelUp');
    impact.value = { count: impact.value.count + 1, combo };
    shownCombo.value = combo;
  }

  function breakCombo(lost: number): void {
    playSound('miss');
    shownCombo.value = 0;
    if (lost >= STREAK_COMBO) brokenCombo.value = lost;
  }

  watch(state, (now, before) => {
    if (now.setIndex > before.setIndex) playSound('deal');
    if (now.matchedWordIds.length > before.matchedWordIds.length) {
      const isLevelUp = now.level > before.level;
      later(() => landHit(now.combo, isLevelUp), THROW_MS);
    }
    if (now.combo === 0 && before.combo > 0) breakCombo(before.combo);
    if (now.phase === 'cleared' && before.phase !== 'cleared') {
      later(() => playSound('cleared'), THROW_MS * 2);
    }
  });

  onUnmounted(() => {
    for (const timer of timers) clearTimeout(timer);
  });

  return { impact, shownCombo, brokenCombo, clearBroken: () => (brokenCombo.value = null) };
}
