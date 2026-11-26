<script setup lang="ts">
/**
 * The streak on the start screen: its headline (StreakHeader.vue) above
 * the play calendar, with the picked day's summary beside it (today, at
 * first). The streak and the calendar are read fresh
 * each time the start screen opens.
 */
import { computed, ref } from 'vue';
import type { Deck } from '../../deck/types.ts';
import { IS_SAMPLE_PLAY, usePlayHistory } from '../../composables/usePlayHistory.ts';
import { useStreak } from '../../composables/useStreak.ts';
import { summariseDay } from '../../memory/day-summary.ts';
import { calendarWeeks } from '../../memory/play-calendar.ts';
import DayDetail from './DayDetail.vue';
import PlayCalendar from './PlayCalendar.vue';
import StreakHeader from './StreakHeader.vue';

const props = defineProps<{ deck: Deck }>();

const { history, today } = usePlayHistory(props.deck);
const { streak, message, milestone } = useStreak(history, today);
const selected = ref(today);
const weeks = computed(() => calendarWeeks(history.value.runs, today));
const summary = computed(() => summariseDay(selected.value, history.value));
</script>

<template>
  <section class="pixel-panel flex flex-col gap-3 bg-wood/80 p-4" aria-label="Streak">
    <StreakHeader
      :days="streak.days"
      :milestone="milestone"
      :message="message"
      :is-sample="IS_SAMPLE_PLAY"
    />
    <div class="flex flex-wrap gap-6">
      <PlayCalendar
        :weeks="weeks"
        :rest-days="streak.restDays"
        :selected="selected"
        :today="today"
        @select="selected = $event"
      />
      <DayDetail
        :day="selected"
        :today="today"
        :summary="summary"
        :is-rest-day="streak.restDays.includes(selected)"
      />
    </div>
  </section>
</template>
