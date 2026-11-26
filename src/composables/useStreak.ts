/**
 * The streak as the start screen shows it: the streak itself (streak.ts),
 * the reminder for this visit (streak-messages.ts), and a milestone to
 * celebrate if one was reached today. The reminder is picked once the
 * play history has loaded, and remembered, so the next visit picks
 * another; a milestone is celebrated on the first visit after it's reached.
 * Only the reminder's id is kept: its text is written from it each render,
 * so it follows a language change.
 */
import { readStored, writeStored } from '../memory/safe-storage.ts';
import { computed, ref, watch, type Ref } from 'vue';
import type { PlayHistory } from '../memory/day-summary.ts';
import { playedDays } from '../memory/play-calendar.ts';
import { LAST_STREAK_MESSAGE_KEY, STREAK_CELEBRATED_KEY } from '../memory/progress-keys.ts';
import {
  milestoneToday,
  streakMessage,
  streakMessageText,
  type StreakMessage,
} from '../memory/streak-messages.ts';
import { streakOn } from '../memory/streak.ts';

export function useStreak(history: Readonly<Ref<PlayHistory>>, today: string) {
  const days = computed(() => playedDays(history.value.runs));
  const streak = computed(() => streakOn(days.value, today));
  const context = computed(() => ({ streak: streak.value, today, hasPlayed: days.value.size > 0 }));
  const messageId = ref<string | null>(null);
  const message = computed<StreakMessage | null>(() =>
    messageId.value === null
      ? null
      : { id: messageId.value, text: streakMessageText(messageId.value, context.value) },
  );
  const milestone = ref<number | null>(null);

  const stop = watch(history, () => {
    const picked = streakMessage(context.value, readStored(LAST_STREAK_MESSAGE_KEY), Math.random);
    messageId.value = picked.id;
    writeStored(LAST_STREAK_MESSAGE_KEY, picked.id);
    const reached = milestoneToday(streak.value);
    if (reached !== null && readStored(STREAK_CELEBRATED_KEY) !== today) {
      milestone.value = reached;
      writeStored(STREAK_CELEBRATED_KEY, today);
    }
    stop();
  });

  return { streak, message, milestone };
}
