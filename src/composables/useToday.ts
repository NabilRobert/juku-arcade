/**
 * Today's local date (YYYY-MM-DD), kept current: checked once a minute, so
 * a start screen left open past midnight moves on to the new day (its
 * streak, calendar and goals), instead of keeping yesterday's.
 */
import { onMounted, onUnmounted, ref, type Ref } from 'vue';
import { localDay } from '../game/events.ts';

/** How often the date is checked; a minute late at midnight is fine. */
const DATE_CHECK_MS = 60_000;

export function useToday(): Readonly<Ref<string>> {
  const today = ref(localDay(new Date()));
  let timer: ReturnType<typeof setInterval> | undefined;
  onMounted(() => {
    timer = setInterval(() => {
      today.value = localDay(new Date());
    }, DATE_CHECK_MS);
  });
  onUnmounted(() => clearInterval(timer));
  return today;
}
