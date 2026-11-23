/**
 * How the game answers what the player does, beyond the cards moving:
 * sounds, the combo building on the table, and the table shaking on a hit.
 * It watches the run's state for what changed (a match, a miss, a level,
 * a cleared or timed-out set) and plays the reaction. Each dealt card
 * makes its own sound (PlayCard.vue).
 *
 * A match lands when the thrown card hits its word card, not when it's let
 * go, so the slap, the chime and the shake wait for the throw (THROW_S).
 */
import { ref, watch } from 'vue';
import { THROW_S } from '../components/cards/card-motion.ts';
import type { RunState } from '../game/run.ts';
import { comboPitch, playSound } from '../sound/sfx.ts';
import { useLater } from './useLater.ts';

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
  const later = useLater();

  function landHit(combo: number, isLevelUp: boolean): void {
    playSound('slap');
    playSound('chime', comboPitch(combo));
    if (isLevelUp) playSound('levelUp');
    impact.value = { count: impact.value.count + 1, combo };
    shownCombo.value = combo;
  }

  /** A combo that ends without a miss or a timeout was banked (the bank run), not broken. */
  function endCombo(now: RunState, before: RunState): void {
    shownCombo.value = 0;
    if (now.flash === before.flash && now.phase !== 'timedOut') return;
    playSound('miss');
    if (before.combo >= STREAK_COMBO) brokenCombo.value = before.combo;
  }

  watch(state, (now, before) => {
    if (now.matchedWordIds.length > before.matchedWordIds.length) {
      const isLevelUp = now.level > before.level;
      later(() => landHit(now.combo, isLevelUp), THROW_MS);
    }
    if (now.combo === 0 && before.combo > 0) endCombo(now, before);
    if (now.phase === 'cleared' && before.phase !== 'cleared') {
      later(() => playSound('cleared'), THROW_MS * 2);
    }
  });

  return { impact, shownCombo, brokenCombo, clearBroken: () => (brokenCombo.value = null) };
}
