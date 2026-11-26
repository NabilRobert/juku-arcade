<script setup lang="ts">
/**
 * One day of the play calendar, picked on its grid (day-summary.ts): the
 * runs and minutes played, each mode's best that day beside its best that
 * month and ever, the words and grammar answered, the most recognised and
 * most missed kanji, and the day's haiku. Clicking a kanji opens its card
 * back over the screen (KanjiCardBack.vue).
 */
import { computed, ref } from 'vue';
import type { KanjiNote } from '../../deck/types.ts';
import type { DaySummary } from '../../memory/day-summary.ts';
import { dayLabel } from '../../memory/play-calendar.ts';
import DayHaiku from './DayHaiku.vue';
import DayScores from './DayScores.vue';
import KanjiHighlight from './KanjiHighlight.vue';
import CardOverlay from '../ui/CardOverlay.vue';
import KanjiCardBack from '../words/KanjiCardBack.vue';

const props = defineProps<{
  day: string;
  today: string;
  summary: DaySummary;
  isRestDay: boolean;
  /** The deck's notes on each kanji, for the card back a clicked kanji opens. */
  kanjiNotes: Readonly<Record<string, KanjiNote>>;
}>();

/** The kanji whose card back is open, if any. */
const openKanji = ref<string | null>(null);
const openNote = computed(() =>
  openKanji.value === null ? undefined : props.kanjiNotes[openKanji.value],
);

const isToday = computed(() => props.day === props.today);

/** A day without play: today can still be played; an earlier one was missed or rested. */
const quietLine = computed(() => {
  if (isToday.value) return 'No play today yet.';
  return props.isRestDay ? 'Rest day: your streak was kept.' : 'No play that day.';
});

const percent = (right: number, answered: number): number =>
  answered === 0 ? 0 : Math.round((right / answered) * 100);

/** "3 new", "2 points": left out when there are none. */
const extra = (count: number, label: string): string => (count > 0 ? `, ${count} ${label}` : '');

const answerLines = computed(() => {
  const { words, grammar, newWords, grammarPoints } = props.summary;
  const lines: string[] = [];
  if (words.answered > 0) {
    const share = percent(words.right, words.answered);
    lines.push(`Words: ${words.answered} answered, ${share}% right${extra(newWords, 'new')}`);
  }
  if (grammar.answered > 0) {
    const share = percent(grammar.right, grammar.answered);
    lines.push(
      `Grammar: ${grammar.answered} sentences, ${share}% right${extra(grammarPoints, 'points')}`,
    );
  }
  return lines;
});
</script>

<template>
  <!-- A day with several haiku runs long, so the detail scrolls inside a fixed height
       rather than stretching the start screen (playtest decision, 2026-11-26). Focusable,
       so a keyboard can scroll it too. -->
  <section
    class="flex max-h-72 min-w-64 flex-1 flex-col gap-3 overflow-y-auto pr-2 text-sm [scrollbar-color:var(--color-steel)_transparent] [scrollbar-width:thin]"
    tabindex="0"
    aria-live="polite"
    :aria-label="`${dayLabel(day, today)}: what you played`"
    data-testid="day-detail"
  >
    <h3 class="text-lg font-bold text-aqua">{{ dayLabel(day, today) }}</h3>
    <p v-if="summary.runs === 0" class="text-washi/70">
      {{ quietLine }}
    </p>
    <template v-else>
      <p data-testid="day-runs">
        {{ summary.runs }} {{ summary.runs === 1 ? 'session' : 'sessions' }} played ·
        {{ summary.minutes }} min
      </p>
      <DayScores :scores="summary.scores" :is-today="isToday" />
      <p v-for="line in answerLines" :key="line" class="text-washi/80">{{ line }}</p>
      <div class="flex gap-6">
        <KanjiHighlight
          v-if="summary.kanji.mostRecognised"
          label="Most recognised kanji"
          :count="summary.kanji.mostRecognised"
          data-testid="most-recognised"
          @open="openKanji = summary.kanji.mostRecognised.kanji"
        />
        <KanjiHighlight
          v-if="summary.kanji.mostMissed"
          label="Most missed kanji"
          :count="summary.kanji.mostMissed"
          is-missed
          data-testid="most-missed"
          @open="openKanji = summary.kanji.mostMissed.kanji"
        />
      </div>
      <DayHaiku :haiku-ids="summary.haikuIds" :is-today="isToday" />
    </template>
    <CardOverlay
      v-if="openKanji !== null && openNote"
      :label="`The card for ${openKanji}`"
      @close="openKanji = null"
    >
      <KanjiCardBack :char="openKanji" :note="openNote" @close="openKanji = null" />
    </CardOverlay>
  </section>
</template>
