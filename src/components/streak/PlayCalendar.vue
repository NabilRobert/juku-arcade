<script setup lang="ts">
/**
 * The play calendar's grid (play-calendar.ts), like a contribution graph:
 * a column per week, Monday at the top, each day a square that glows
 * brighter the more was played. A rest day the streak forgave has a
 * dashed outline. Clicking a day selects it for the day's summary beside
 * the grid. Month and weekday names follow the interface language.
 */
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { addDays } from '../../memory/days.ts';
import {
  dayLabel,
  formatDay,
  SHADE_THRESHOLDS,
  type CalendarDay,
} from '../../memory/play-calendar.ts';

const props = defineProps<{
  weeks: readonly (readonly CalendarDay[])[];
  restDays: readonly string[];
  selected: string;
  today: string;
}>();
defineEmits<{ select: [day: string] }>();
const { t } = useI18n();

/** Each shade's fill, from no play to the busiest days. */
// Lamp yellow, the flame's colour, reads better than aqua on the panel's blue.
const SHADES = ['bg-lacquer', 'bg-lamp/30', 'bg-lamp/55', 'bg-lamp/80', 'bg-lamp'] as const;
/** A Monday, to name the weekdays down the side from; only Monday, Wednesday and Friday are named. */
const A_MONDAY = '2026-11-23';
const NAMED_WEEKDAYS = new Set([0, 2, 4]);
const weekdays = computed(() =>
  Array.from({ length: 7 }, (_, index) =>
    NAMED_WEEKDAYS.has(index) ? formatDay(addDays(A_MONDAY, index), { weekday: 'short' }) : '',
  ),
);
/** Weeks a phone-width screen shows (the latest); wider screens show them all. */
const PHONE_WEEKS = 12;

/** The oldest weeks hide on a phone-width screen, so the grid fits beside nothing. */
function weekClass(index: number): string {
  return index < props.weeks.length - PHONE_WEEKS ? 'hidden sm:flex' : 'flex';
}
/** A month's name above the week its first day falls in. */
const monthLabels = computed(() =>
  props.weeks.map((week) => {
    const first = week.find((day) => day.day.endsWith('-01'));
    return first ? formatDay(first.day, { month: 'short' }) : '';
  }),
);

function cellClass(day: CalendarDay): string[] {
  const classes: string[] = [SHADES[day.shade] ?? SHADES[0]];
  if (props.restDays.includes(day.day)) classes.push('outline-1 outline-dashed outline-washi/60');
  if (day.day === props.today) classes.push('ring-1 ring-aqua');
  if (day.day === props.selected) classes.push('ring-2 ring-washi');
  return classes;
}

function cellLabel(day: CalendarDay): string {
  const played =
    day.answers === 0
      ? t('streak.calendar.noPlay')
      : t('streak.calendar.answers', { count: day.answers });
  return t('streak.calendar.cell', { day: dayLabel(day.day, props.today), played });
}
</script>

<template>
  <div class="flex flex-col gap-2 text-xs text-washi/60" data-testid="play-calendar">
    <div class="flex gap-1">
      <div class="flex w-7 flex-col gap-1 pt-5">
        <span v-for="(weekday, index) in weekdays" :key="index" class="h-5 leading-5">{{
          weekday
        }}</span>
      </div>
      <div
        v-for="(week, index) in weeks"
        :key="week[0]?.day"
        class="flex-col gap-1"
        :class="weekClass(index)"
      >
        <span class="h-4 w-5 overflow-visible whitespace-nowrap">{{ monthLabels[index] }}</span>
        <template v-for="day in week" :key="day.day">
          <span v-if="day.isFuture" class="size-5" />
          <button
            v-else
            type="button"
            class="size-5 cursor-pointer"
            :class="cellClass(day)"
            :aria-label="cellLabel(day)"
            :aria-pressed="day.day === selected"
            :data-shade="day.shade"
            @click="$emit('select', day.day)"
          />
        </template>
      </div>
    </div>
    <p class="flex items-center gap-1 self-end" aria-hidden="true">
      {{ t('streak.calendar.less') }}
      <span
        v-for="shade in SHADE_THRESHOLDS.length + 1"
        :key="shade"
        class="size-4"
        :class="SHADES[shade - 1]"
      />
      {{ t('streak.calendar.more') }}
    </p>
  </div>
</template>
