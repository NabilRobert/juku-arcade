<script setup lang="ts">
/**
 * One day of the play calendar, picked on its grid (day-summary.ts): the
 * runs and minutes played, each mode's best that day beside its best that
 * month and ever, the words and grammar answered, the most recognised and
 * most missed kanji, and the day's haiku.
 */
import { computed } from 'vue';
import type { DaySummary } from '../../memory/day-summary.ts';
import type { PlayMode } from '../../memory/play-log.ts';
import { dayLabel } from '../../memory/play-calendar.ts';
import DayHaiku from './DayHaiku.vue';

const props = defineProps<{
  day: string;
  today: string;
  summary: DaySummary;
  isRestDay: boolean;
}>();

const MODE_NAMES: Record<PlayMode, string> = { words: 'Words', kanji: 'Kanji', bunpou: 'Bunpou' };

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
  <section
    class="flex min-w-64 flex-1 flex-col gap-3 text-sm"
    aria-live="polite"
    data-testid="day-detail"
  >
    <h3 class="text-lg font-bold text-aqua">{{ dayLabel(day, today) }}</h3>
    <p v-if="summary.runs === 0" class="text-washi/70">
      {{ isRestDay ? 'Rest day: your streak was kept.' : 'No play this day.' }}
    </p>
    <template v-else>
      <p data-testid="day-runs">
        {{ summary.runs }} {{ summary.runs === 1 ? 'session' : 'sessions' }} played ·
        {{ summary.minutes }} min
      </p>
      <table class="w-full text-left">
        <thead class="text-xs text-washi/60">
          <tr>
            <th class="font-normal">Highest score</th>
            <th class="font-normal">That day</th>
            <th class="font-normal">This month</th>
            <th class="font-normal">Ever</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in summary.scores" :key="row.mode" :data-mode="row.mode">
            <td>{{ MODE_NAMES[row.mode] }}</td>
            <td class="font-bold text-lamp">{{ row.dayBest }}</td>
            <td>{{ row.monthBest }}</td>
            <td>{{ row.everBest }}</td>
          </tr>
        </tbody>
      </table>
      <p v-for="line in answerLines" :key="line" class="text-washi/80">{{ line }}</p>
      <div
        v-if="summary.kanji.mostRecognised || summary.kanji.mostMissed"
        class="flex gap-6"
        lang="ja"
      >
        <p v-if="summary.kanji.mostRecognised" data-testid="most-recognised">
          <span class="block text-xs text-washi/60" lang="en">Most recognised kanji</span>
          <span class="text-3xl text-aqua">{{ summary.kanji.mostRecognised.kanji }}</span>
          <span class="text-washi/60"> ×{{ summary.kanji.mostRecognised.count }}</span>
        </p>
        <p v-if="summary.kanji.mostMissed" data-testid="most-missed">
          <span class="block text-xs text-washi/60" lang="en">Most missed kanji</span>
          <span class="bg-crimson px-1 text-3xl text-washi">{{
            summary.kanji.mostMissed.kanji
          }}</span>
          <span class="text-washi/60"> ×{{ summary.kanji.mostMissed.count }}</span>
        </p>
      </div>
      <DayHaiku :haiku-ids="summary.haikuIds" :is-today="day === today" />
    </template>
  </section>
</template>
