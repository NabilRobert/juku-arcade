/**
 * The wellbeing rules on screen (W1, W2), shared by both modes: the nudge
 * to stop that's due, whether today's play has reached the school's cap,
 * and pausing the game while either shows or another page covers it.
 */
import { computed, ref, watch, type Ref } from 'vue';
import { dueNudge, isOverDailyCap, parseCapMinutes } from '../game/wellbeing.ts';

/** The school's daily cap, from the deploy's configuration; null when there's none. */
export const CAP_MINUTES = parseCapMinutes(import.meta.env.VITE_DAILY_CAP_MINUTES);

export interface WellbeingInput {
  sessionPlayMs: Ref<number>;
  playMsToday: Ref<number>;
  isAway: () => boolean;
  pause: () => void;
}

export function useWellbeing({ sessionPlayMs, playMsToday, isAway, pause }: WellbeingInput) {
  const shownNudges = ref<number[]>([]);
  const nudge = computed(() => dueNudge(sessionPlayMs.value, shownNudges.value));
  const isCapped = computed(() => isOverDailyCap(playMsToday.value, CAP_MINUTES));

  function dismissNudge(isStopping: boolean): void {
    if (nudge.value !== null) shownNudges.value = [...shownNudges.value, nudge.value];
    if (isStopping) pause();
  }

  watch([isAway, isCapped, nudge], ([away, capped, due]) => {
    if (away || capped || due !== null) pause();
  });

  return { nudge, isCapped, dismissNudge };
}
