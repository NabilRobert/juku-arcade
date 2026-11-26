<script setup lang="ts">
/**
 * Bunpou on screen (D56): a side panel (the mode, today's grammar
 * reviews, score, level and best combo, the hint and sound switches, End
 * run) beside the stage and the table (D58: the storyteller keeps each
 * built line as a sealed slip, and forgets a line that times out), the
 * tale's performance after its last line, the chapter's scroll after the
 * third tale, then the curtain call and results: a show is one chapter
 * (D61), though the player can end it sooner. Every judged line goes to the
 * grammar log and reviews (useGrammarReviews, D57), which also pick each
 * tale's points. Like kanji mode, its play time counts toward the nudges
 * and the school's daily cap (usePlayClock), the wellbeing screens stand
 * in front of the table, and "Stop for today" goes back to the start
 * screen.
 */
import { computed, ref, shallowRef, watch } from 'vue';
import type { LineResult } from '../../grammar/bunpou-run.ts';
import { endsChapter, TALES_PER_CHAPTER } from '../../grammar/performance.ts';
import { FORGOT_LINE } from '../../grammar/usePerformance.ts';
import { playSound } from '../../sound/sfx.ts';
import type { GrammarEvent } from '../../grammar/grammar-events.ts';
import { CURRICULUM } from '../../grammar/templates.ts';
import { useBunpouRun } from '../../grammar/useBunpouRun.ts';
import { outcomeOf, useGrammarReviews } from '../../grammar/useGrammarReviews.ts';
import { useRunEnd } from '../../grammar/useRunEnd.ts';
import { usePanelPause } from '../../composables/usePanelPause.ts';
import { usePauseKey, type PauseKeyInput } from '../../composables/usePauseKey.ts';
import { useRunLog } from '../../composables/useRunLog.ts';
import { withAnswer, type Answers } from '../../memory/play-log.ts';
import { usePlayClock } from '../../composables/usePlayClock.ts';
import { useWellbeing } from '../../composables/useWellbeing.ts';
import type { Settings } from '../../memory/storage.ts';
import { areHintsShown, setHintsShown } from '../../preferences/hints.ts';
import DailyBar from '../words/DailyBar.vue';
import FloatingPause from '../ui/FloatingPause.vue';
import EndRunButton from '../ui/EndRunButton.vue';
import SidePanel from '../ui/SidePanel.vue';
import OnOffButton from '../ui/OnOffButton.vue';
import SoundToggle from '../ui/SoundToggle.vue';
import ModeHeader from '../ui/ModeHeader.vue';
import StatPanel from '../ui/StatPanel.vue';
import WellbeingGate from '../WellbeingGate.vue';
import BunpouBoard from './BunpouBoard.vue';
import BunpouResults from './BunpouResults.vue';
import ChapterScroll from './ChapterScroll.vue';
import CurtainCall from './CurtainCall.vue';
import StoryStage from './StoryStage.vue';
import TalePerformance from './TalePerformance.vue';

const props = defineProps<{
  level: string;
  settings: Settings;
  /** The grammar log so far, to rebuild grammar memory from. */
  pastGrammarEvents: readonly GrammarEvent[];
  /** True while another page covers the game: the line's clock and the play clock stop. */
  isAway: boolean;
}>();
const emit = defineEmits<{ leave: []; again: [] }>();

const reviews = useGrammarReviews(CURRICULUM, props.settings, props.pastGrammarEvents);
const runLog = useRunLog('bunpou');
let lineTally: Answers = { answered: 0, right: 0 };
const game = useBunpouRun({
  pointsByPriority: reviews.pointsByPriority,
  onJudged: (result, msTaken) => {
    reviews.logJudged(result, msTaken);
    logLine(result);
  },
});
const { run, unplaced, timeLeft } = game;
const isPaused = (): boolean => run.value.pausedAtMs !== null;
const runEnd = useRunEnd();
const isEnded = computed(() => runEnd.step.value !== 'playing');

/** Each line goes to the play log, for the streak and the calendar (a timeout isn't counted). */
function logLine(result: LineResult): void {
  lineTally = withAnswer(lineTally, outcomeOf(result));
  runLog.record({ score: game.run.value.score, ...lineTally });
}

/** Ends the run: the line's clock stops for good, the storyteller bows, then the haiku and results. */
function endRun(): void {
  game.pause();
  runEnd.end(run.value);
  if (runEnd.pick.value !== null) runLog.addHaiku(runEnd.pick.value.haiku.id);
}

// The clock first reads this a tick after setup, once the wellbeing state below exists.
const clock = usePlayClock(
  props.settings,
  () => props.isAway || isPaused() || isEnded.value || isCapped.value || nudge.value !== null,
);
const { nudge, isCapped, dismissNudge } = useWellbeing({
  sessionPlayMs: clock.sessionPlayMs,
  playMsToday: clock.playMsToday,
  isAway: () => props.isAway,
  pause: game.pause,
});
const pauseControls: PauseKeyInput = {
  isPaused,
  isAvailable: () => !props.isAway && !isEnded.value && run.value.phase === 'building',
  pause: game.pause,
  resume: game.resume,
};
usePauseKey(pauseControls);
/** Opening the drawer on a phone or a tablet pauses the run, as it covers the board. */
const onPanelToggle = usePanelPause(pauseControls);
/** Asking "End this run?" pauses the line's clock too, on its own count, like the drawer. */
const onEndRunToggle = usePanelPause(pauseControls);

const panels = computed(() => [
  { label: 'Score', value: run.value.score },
  { label: 'Level', value: run.value.level },
]);

/** The tales told this run, for the chapter scroll; a chapter shows once its last tale is told. */
const toldTales = shallowRef<readonly (readonly LineResult[])[]>([]);
const chapterShown = ref<number | null>(null);
const chapterTales = computed(() => toldTales.value.slice(-TALES_PER_CHAPTER));

function afterTale(): void {
  toldTales.value = [...toldTales.value, run.value.results];
  if (endsChapter(toldTales.value.length)) {
    chapterShown.value = toldTales.value.length / TALES_PER_CHAPTER;
    return;
  }
  game.nextTale();
}

/** A show is one chapter (D61): after its scroll comes the curtain call. */
function afterChapter(): void {
  chapterShown.value = null;
  endRun();
}

/** The line just judged, while its result shows. */
const judged = computed(() =>
  run.value.phase === 'judged' ? run.value.results.at(-1) : undefined,
);
// Each built line folds into a slip as it's judged.
watch(
  () => run.value.phase,
  (phase) => {
    if (phase === 'judged') playSound('slipFold');
  },
);

function dismiss(isStopping: boolean): void {
  dismissNudge(false);
  if (isStopping) emit('leave');
}
</script>

<template>
  <!-- On a phone or a tablet the screen fills the height and the stage takes what's spare, so
       nothing is left empty under the tiles; the curtain call and results sit centred in it. -->
  <div
    class="flex flex-col gap-4 max-lg:grow max-lg:justify-center lg:grid lg:grid-cols-[17rem_1fr] lg:items-start lg:gap-8"
  >
    <SidePanel label="Bunpou run" @toggle="onPanelToggle">
      <ModeHeader :title="`Bunpou · ${level}`" />
      <DailyBar
        :daily="reviews.progress.value.daily"
        known-label="Grammar known"
        :known="reviews.progress.value.pointsKnown"
        :total="reviews.progress.value.pointCount"
        :level="level"
      />
      <div class="grid grid-cols-2 gap-3">
        <StatPanel v-for="panel in panels" :key="panel.label" :label="panel.label">
          <span class="text-3xl font-bold" :data-testid="panel.label.toLowerCase()">{{
            panel.value
          }}</span>
        </StatPanel>
      </div>
      <OnOffButton
        label="Hints"
        :is-on="areHintsShown"
        data-testid="hint-toggle"
        @change="setHintsShown"
      />
      <SoundToggle />
      <p class="text-center text-xs text-washi/60">Best combo {{ run.bestCombo }}</p>
      <EndRunButton v-if="!isEnded" @end="endRun" @toggle="onEndRunToggle" />
      <p class="text-center text-xs text-washi/60">
        Tap a tile to fill the next box, or drag it onto any box. Drag a placed tile to move it, or
        tap it or press Backspace to take it back. Keys 1–5 place a tile; Esc pauses.
      </p>
    </SidePanel>
    <FloatingPause
      v-if="!isEnded"
      :is-paused="isPaused()"
      :is-disabled="run.phase !== 'building'"
      @pause="game.pause"
      @resume="game.resume"
    />
    <WellbeingGate :is-capped="isCapped" :nudge="nudge" @dismiss="dismiss">
      <CurtainCall
        v-if="runEnd.step.value === 'curtain' && runEnd.pick.value"
        :haiku="runEnd.pick.value.haiku"
        :is-new="runEnd.pick.value.isNew"
        :collected="runEnd.pick.value.shelf.collected.length"
        :total="runEnd.haikuTotal"
        @results="runEnd.showResults"
      />
      <BunpouResults
        v-else-if="runEnd.step.value === 'results'"
        :score="run.score"
        :best-combo="run.bestCombo"
        :lines="reviews.lines.value"
        :progress="reviews.progress.value"
        :best="runEnd.best.value"
        :is-new-best="runEnd.isNewBest.value"
        :rank="runEnd.rank.value"
        @again="emit('again')"
        @leave="emit('leave')"
      />
      <ChapterScroll
        v-else-if="chapterShown !== null"
        :chapter="chapterShown"
        :tales="chapterTales"
        @next="afterChapter"
      />
      <TalePerformance
        v-else-if="run.phase === 'revealed'"
        :key="toldTales.length"
        :results="run.results"
        :combo="run.combo"
        :ends-chapter="endsChapter(toldTales.length + 1)"
        @next="afterTale"
      />
      <div v-else class="flex flex-col gap-4 max-lg:grow max-lg:justify-center">
        <!-- Grows into the spare height, up to 40% of the screen, so the tiles keep their room. -->
        <StoryStage
          class="max-lg:max-h-[40svh] max-lg:shrink-0 max-lg:grow"
          :pose="judged?.isTimedOut ? 'forgot' : 'idle'"
          :slips="run.results.length"
          :bubble="judged?.isTimedOut ? FORGOT_LINE : null"
        />
        <BunpouBoard
          :run="run"
          :unplaced="unplaced"
          :time-left="timeLeft"
          @place="game.place"
          @take-back="game.takeBack"
          @pause="game.pause"
          @resume="game.resume"
        />
      </div>
    </WellbeingGate>
  </div>
</template>
