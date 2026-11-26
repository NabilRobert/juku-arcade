<script setup lang="ts">
/**
 * Kanji mode on screen (D37): a side panel (the mode, score, combo and
 * round, the last round's result, the sound switch) beside the kanji
 * board. A run is a sheet of 10 kanji, then its results (useKanjiSheet.ts,
 * D61). It's practice: nothing is reviewed, and each round goes only to
 * the play log, for the streak and the calendar (play-log.ts). Its play time still
 * counts toward the nudges and the school's daily cap (usePlayClock), and
 * the same wellbeing screens stand in front of the board (WellbeingGate);
 * "Stop for today" goes back to the start screen.
 *
 * Crests (D42) hide on some cards: the scout panel flips the hand over to
 * show them (KanjiScoutPanel.vue).
 */
import { computed } from 'vue';
import type { Deck } from '../../deck/types.ts';
import { useKanjiRun } from '../../kanji/useKanjiRun.ts';
import { KANJI_PER_SHEET, useKanjiSheet } from '../../kanji/useKanjiSheet.ts';
import { MAX_WRONG_PICKS } from '../../kanji/kanji-round.ts';
import { CORRECT_DAYS_TO_KNOW } from '../../memory/leitner.ts';
import { usePlayClock } from '../../composables/usePlayClock.ts';
import { usePreviousBest } from '../../composables/usePreviousBest.ts';
import { useWellbeing } from '../../composables/useWellbeing.ts';
import type { Settings } from '../../memory/storage.ts';
import KanjiBoard from './KanjiBoard.vue';
import KanjiResult from './KanjiResult.vue';
import KanjiScoutPanel from './KanjiScoutPanel.vue';
import EndRunButton from '../ui/EndRunButton.vue';
import SidePanel from '../ui/SidePanel.vue';
import RunResults from '../ui/RunResults.vue';
import SoundToggle from '../ui/SoundToggle.vue';
import ModeHeader from '../ui/ModeHeader.vue';
import WellbeingGate from '../WellbeingGate.vue';
import StatPanel from '../ui/StatPanel.vue';

const props = defineProps<{
  deck: Deck;
  settings: Settings;
  /** True while another page covers the game: its play clock stops. */
  isAway: boolean;
}>();
const emit = defineEmits<{ leave: []; again: [] }>();

const run = useKanjiRun(props.deck);
const { round, roundNumber, thrown, score, combo, bestCombo, impacts, canPlay, lastResult } = run;
const { wrongPicksLeft } = run;
const { crestMarks, notice, scoutsLeft, isScouting, phase } = run;

const sheet = useKanjiSheet(run);
const previousBest = usePreviousBest('kanji');
const { isDone: isSheetDone, kanjiNumber } = sheet;

// The clock first reads this a tick after setup, once the wellbeing state below exists.
const clock = usePlayClock(
  props.settings,
  () => props.isAway || isSheetDone.value || isCapped.value || nudge.value !== null,
);
const { nudge, isCapped, dismissNudge } = useWellbeing({
  sessionPlayMs: clock.sessionPlayMs,
  playMsToday: clock.playMsToday,
  isAway: () => props.isAway,
  // Kanji mode has no timer to stop; the clock stops while a wellbeing screen shows.
  pause: () => undefined,
});

const sheetPanels = computed(() => [
  { label: 'Perfect', value: `${sheet.tally.value.right} / ${KANJI_PER_SHEET}` },
  { label: 'Score', value: String(score.value) },
  { label: 'Best combo', value: String(bestCombo.value) },
]);

const panels = computed(() => [
  { label: 'Score', value: score.value },
  { label: 'Combo', value: combo.value },
]);

function dismiss(isStopping: boolean): void {
  dismissNudge(false);
  if (isStopping) emit('leave');
}
</script>

<template>
  <div class="flex flex-col gap-4 lg:grid lg:grid-cols-[17rem_1fr] lg:items-start lg:gap-8">
    <SidePanel label="Kanji run">
      <ModeHeader :title="`Kanji mode · ${deck.level}`">
        <p class="text-sm text-washi/70" data-testid="sheet-progress">
          Kanji {{ kanjiNumber }} / {{ KANJI_PER_SHEET }}
        </p>
      </ModeHeader>
      <div class="grid grid-cols-2 gap-3">
        <StatPanel v-for="panel in panels" :key="panel.label" :label="panel.label">
          <span class="text-3xl font-bold" :data-testid="panel.label.toLowerCase()">{{
            panel.value
          }}</span>
        </StatPanel>
      </div>
      <KanjiResult :result="lastResult" />
      <KanjiScoutPanel
        :scouts-left="scoutsLeft"
        :is-scouting="isScouting"
        :can-scout="phase === 'picking'"
        :notice="notice"
        @scout="run.toggleScout"
      />
      <SoundToggle />
      <EndRunButton v-if="!isSheetDone" @end="sheet.endNow" />
      <p class="text-center text-xs text-washi/60">Best combo {{ bestCombo }}</p>
      <p class="text-center text-xs text-washi/60">
        Pick every reading of the kanji, then press Play. You can make {{ MAX_WRONG_PICKS }} wrong
        picks per kanji. It doesn't change your reviews.
      </p>
    </SidePanel>
    <div class="flex flex-col gap-5">
      <WellbeingGate :is-capped="isCapped" :nudge="nudge" @dismiss="dismiss">
        <RunResults
          v-if="isSheetDone"
          :title="sheet.isEndedEarly.value ? 'Run ended' : 'Sheet done'"
          :panels="sheetPanels"
          :note="`A sheet is ${KANJI_PER_SHEET} kanji. A kanji counts as mastered once you find all its readings with no wrong pick on ${CORRECT_DAYS_TO_KNOW} separate days.`"
          again-label="Another sheet"
          :comparison="{ score, previousBest }"
          @again="emit('again')"
          @leave="emit('leave')"
        />
        <KanjiBoard
          v-else
          :round="round"
          :round-number="roundNumber"
          :level="deck.level"
          :status-of="run.statusOf"
          :thrown="thrown"
          :combo="combo"
          :impacts="impacts"
          :can-play="canPlay"
          :wrong-picks-left="wrongPicksLeft"
          :crest-marks="crestMarks"
          @toggle="run.toggle"
          @play="run.play"
        />
      </WellbeingGate>
    </div>
  </div>
</template>
