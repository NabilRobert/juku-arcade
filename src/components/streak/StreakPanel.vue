<script setup lang="ts">
/**
 * The streak on the start screen: the flame and the streak's length, a
 * milestone banner on the day one is reached, this visit's reminder
 * (useStreak.ts), and the play calendar with the picked day's summary
 * beside it (today, at first). The streak and the calendar are read fresh
 * each time the start screen opens.
 */
import { computed, ref } from 'vue';
import type { Deck } from '../../deck/types.ts';
import { IS_SAMPLE_PLAY, usePlayHistory } from '../../composables/usePlayHistory.ts';
import { useStreak } from '../../composables/useStreak.ts';
import { summariseDay } from '../../memory/day-summary.ts';
import { calendarWeeks } from '../../memory/play-calendar.ts';
import PixelIcon from '../ui/PixelIcon.vue';
import DayDetail from './DayDetail.vue';
import PlayCalendar from './PlayCalendar.vue';

const props = defineProps<{ deck: Deck }>();

const { history, today } = usePlayHistory(props.deck);
const { streak, message, milestone } = useStreak(history, today);
const selected = ref(today);
const weeks = computed(() => calendarWeeks(history.value.runs, today));
const summary = computed(() => summariseDay(selected.value, history.value));
</script>

<template>
  <section class="pixel-panel flex flex-col gap-3 bg-wood/80 p-4" aria-label="Streak">
    <header class="flex items-center gap-3">
      <PixelIcon name="flame" class="text-3xl" />
      <p class="text-2xl font-bold" data-testid="streak-days">{{ streak.days }}-day streak</p>
      <span v-if="IS_SAMPLE_PLAY" class="ml-auto text-xs text-washi/50">sample data</span>
    </header>
    <p
      v-if="milestone"
      class="bg-lamp px-3 py-1 text-center font-bold text-sumi"
      data-testid="streak-milestone"
    >
      {{ milestone }}-day streak! Keep it up!
    </p>
    <p v-if="message" class="text-washi/80" data-testid="streak-message">{{ message.text }}</p>
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
