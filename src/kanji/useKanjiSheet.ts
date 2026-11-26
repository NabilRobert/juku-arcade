/**
 * A kanji-mode run is a sheet of KANJI_PER_SHEET kanji (D61): it ends once
 * the last one's answers have shown and the next would be dealt. Each
 * round goes to the play log (play-log.ts) as it's scored, the run's
 * tally and the kanji round both, for the streak and the calendar.
 */
import { computed, ref, watch, type Ref } from 'vue';
import { useRunLog } from '../composables/useRunLog.ts';
import { localDay } from '../game/events.ts';
import { withAnswer, type Answers } from '../memory/play-log.ts';
import { appendKanjiRound } from '../memory/storage.ts';
import type { KanjiRound } from './kanji-round.ts';
import type { PlayedRound } from './useKanjiRun.ts';

/** Kanji in a sheet: a few minutes' play, short enough to finish in one sitting. */
export const KANJI_PER_SHEET = 10;

interface SheetSource {
  round: Ref<KanjiRound>;
  roundNumber: Ref<number>;
  score: Ref<number>;
  lastResult: Ref<PlayedRound | null>;
}

function saveRound(kanji: string, isPerfect: boolean): void {
  const record = { day: localDay(new Date()), kanji, isPerfect };
  appendKanjiRound(record).catch((error: unknown) =>
    console.warn('Could not save the round:', error),
  );
}

export function useKanjiSheet(source: SheetSource) {
  const runLog = useRunLog('kanji');
  const tally = ref<Answers>({ answered: 0, right: 0 });

  watch(source.lastResult, (result) => {
    if (result === null) return;
    tally.value = withAnswer(tally.value, result.isPerfect ? 'right' : 'wrong');
    runLog.record({ score: source.score.value, ...tally.value });
    saveRound(source.round.value.kanji, result.isPerfect);
  });

  /** True once the player ended the sheet early (End run): its results show at once. */
  const isEndedEarly = ref(false);

  return {
    tally,
    /** The kanji on the table, counting from 1, never past the sheet's last. */
    kanjiNumber: computed(() => Math.min(source.roundNumber.value, KANJI_PER_SHEET)),
    isDone: computed(() => isEndedEarly.value || source.roundNumber.value > KANJI_PER_SHEET),
    isEndedEarly,
    endNow: () => {
      isEndedEarly.value = true;
    },
  };
}
