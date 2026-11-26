/**
 * The streak as the start screen shows it: the streak itself (streak.ts),
 * the reminder for this visit (streak-messages.ts), and a milestone to
 * celebrate if one was reached today. The reminder is picked once the
 * play history has loaded, and remembered, so the next visit picks
 * another; a milestone is celebrated on the first visit after it's reached.
 */
import { computed, ref, watch, type ShallowRef } from 'vue';
import type { PlayHistory } from '../memory/day-summary.ts';
import { playedDays } from '../memory/play-calendar.ts';
import { LAST_STREAK_MESSAGE_KEY, STREAK_CELEBRATED_KEY } from '../memory/progress-keys.ts';
import { milestoneToday, streakMessage, type StreakMessage } from '../memory/streak-messages.ts';
import { streakOn } from '../memory/streak.ts';

/** localStorage can be blocked (a private window); then nothing is remembered. */
function readKey(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeKey(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Not remembered this time; the next visit may repeat a message.
  }
}

export function useStreak(history: ShallowRef<PlayHistory>, today: string) {
  const days = computed(() => playedDays(history.value.runs));
  const streak = computed(() => streakOn(days.value, today));
  const message = ref<StreakMessage | null>(null);
  const milestone = ref<number | null>(null);

  const stop = watch(history, () => {
    const context = { streak: streak.value, today, hasPlayed: days.value.size > 0 };
    message.value = streakMessage(context, readKey(LAST_STREAK_MESSAGE_KEY), Math.random);
    writeKey(LAST_STREAK_MESSAGE_KEY, message.value.id);
    const reached = milestoneToday(streak.value);
    if (reached !== null && readKey(STREAK_CELEBRATED_KEY) !== today) {
      milestone.value = reached;
      writeKey(STREAK_CELEBRATED_KEY, today);
    }
    stop();
  });

  return { streak, message, milestone };
}
