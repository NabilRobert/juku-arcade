/**
 * Loads what the streak and the play calendar read: the play log, kanji
 * rounds and both event logs, from this browser. Read fresh each time the
 * start screen opens, so the streak is worked out from today's date and
 * the runs just played. The sample week of play (sample-play.ts) is added
 * while its switch in Settings is on (preferences/sample-play.ts), shown
 * and never saved; the history follows the switch at once. The dojo, which
 * asks only what the player has really met, leaves it out.
 */
import { computed, onMounted, ref, shallowRef } from 'vue';
import type { Deck } from '../deck/types.ts';
import { localDay } from '../game/events.ts';
import type { PlayHistory } from '../memory/day-summary.ts';
import { samplePlay } from '../memory/sample-play.ts';
import { loadEvents, loadGrammarEvents, loadKanjiRounds, loadRuns } from '../memory/storage.ts';
import { isSamplePlayShown } from '../preferences/sample-play.ts';

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
  /** The play this browser really holds, as loaded. */
  const played = shallowRef<PlayHistory>({
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
    played.value = { runs, kanjiRounds, wordEvents, grammarEvents, wordTextById };
    isLoaded.value = true;
  });

  const isSampleShown = computed(() => isSamplePlayShown.value && options.withSample);
  /** What's played, with the sample week added while its switch is on. */
  const history = computed<PlayHistory>(() => {
    if (!isSampleShown.value) return played.value;
    const sample = samplePlay(today);
    return {
      ...played.value,
      runs: [...sample.runs, ...played.value.runs],
      kanjiRounds: [...sample.kanjiRounds, ...played.value.kanjiRounds],
    };
  });

  return { history, today, isLoaded, isSampleShown };
}
