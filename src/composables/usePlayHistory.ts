/**
 * Loads what the streak and the play calendar read: the play log, kanji
 * rounds and both event logs, from this browser. Read fresh each time the
 * start screen opens, so the streak is worked out from today's date and
 * the runs just played. A local copy can add placeholder play
 * (VITE_SAMPLE_PLAY, sample-play.ts), which is shown and never saved; the
 * dojo, which asks only what the player has really met, leaves it out.
 */
import { onMounted, ref, shallowRef } from 'vue';
import type { Deck } from '../deck/types.ts';
import { localDay } from '../game/events.ts';
import type { PlayHistory } from '../memory/day-summary.ts';
import { samplePlay } from '../memory/sample-play.ts';
import { loadEvents, loadGrammarEvents, loadKanjiRounds, loadRuns } from '../memory/storage.ts';

export const IS_SAMPLE_PLAY = import.meta.env.VITE_SAMPLE_PLAY === '1';

/** Storage can be blocked (a private window); the calendar then starts empty. */
async function orEmpty<T>(load: () => Promise<T[]>): Promise<T[]> {
  try {
    return await load();
  } catch {
    return [];
  }
}

export function usePlayHistory(
  deck: Deck,
  options: { withSample: boolean } = { withSample: true },
) {
  const wordTextById = new Map(deck.words.map((word) => [word.id, word.word]));
  const history = shallowRef<PlayHistory>({
    runs: [],
    kanjiRounds: [],
    wordEvents: [],
    grammarEvents: [],
    wordTextById,
  });
  const today = localDay(new Date());
  const isLoaded = ref(false);

  onMounted(async () => {
    const [runs, kanjiRounds, wordEvents, grammarEvents] = await Promise.all([
      orEmpty(loadRuns),
      orEmpty(loadKanjiRounds),
      orEmpty(loadEvents),
      orEmpty(loadGrammarEvents),
    ]);
    const isSampleShown = IS_SAMPLE_PLAY && options.withSample;
    const sample = isSampleShown ? samplePlay(today) : { runs: [], kanjiRounds: [] };
    history.value = {
      runs: [...sample.runs, ...runs],
      kanjiRounds: [...sample.kanjiRounds, ...kanjiRounds],
      wordEvents,
      grammarEvents,
      wordTextById,
    };
    isLoaded.value = true;
  });

  return { history, today, isLoaded };
}
