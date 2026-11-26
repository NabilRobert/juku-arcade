/**
 * Kanji mode's play clock (W1, W2): counts play time toward the nudges and
 * the school's daily cap the same way word mode does (tickPlayClock), and
 * saves today's total now and then and when the mode closes, so word mode
 * starts from the right total.
 */
import { onUnmounted, ref } from 'vue';
import { localDay } from '../game/events.ts';
import { tickPlayClock, withPlayTime, type PlayClock } from '../game/wellbeing.ts';
import { updateSavedSettings, type Settings } from '../memory/storage.ts';

/** Often enough to stop the clock promptly when the game pauses. */
const TICK_MS = 250;

export function usePlayClock(initial: Settings, isPaused: () => boolean) {
  const today = (): string => localDay(new Date());
  let settings = withPlayTime(initial, today(), 0);
  let clock: PlayClock = { lastTickMs: Date.now(), lastSaveMs: Date.now() };
  const sessionPlayMs = ref(0);
  const playMsToday = ref(settings.playMsToday);

  /** Saves only today's play time, so a level changed or data deleted meanwhile stays as it is. */
  function save(): void {
    const { playDay, playMsToday } = settings;
    updateSavedSettings((saved) => ({ ...saved, playDay, playMsToday })).catch((error: unknown) =>
      console.warn('Could not save play time:', error),
    );
  }

  const timer = setInterval(() => {
    const played = tickPlayClock(clock, settings, { ms: Date.now(), day: today() }, isPaused());
    clock = played.clock;
    settings = played.record;
    sessionPlayMs.value += played.playedMs;
    playMsToday.value = settings.playMsToday;
    if (played.isSaveDue) save();
  }, TICK_MS);

  onUnmounted(() => {
    clearInterval(timer);
    save();
  });

  return { sessionPlayMs, playMsToday };
}
