<script setup lang="ts">
/**
 * One mode on the start screen: a big pixel button with the mode's name,
 * a small example in Japanese, a line on what it is, the level goal's
 * progress (GoalBar.vue), and an optional note (a mode still in
 * development says so). Clicks pass through to the
 * button.
 */
import { computed } from 'vue';
import type { LevelGoal } from '../memory/level-goals.ts';
import GoalBar from './ui/GoalBar.vue';
import PixelButton, { type ButtonColour } from './ui/PixelButton.vue';

const props = defineProps<{
  colour: ButtonColour;
  name: string;
  example: string;
  description: string;
  goal?: LevelGoal;
  /** A mode with no level goal shows a number in its place (the dojo's best run). */
  stat?: { label: string; value: number };
  note?: string;
}>();

/** The pale buttons (aqua, paper) take dark text; the rest light. */
const textClass = computed(() =>
  props.colour === 'aqua' || props.colour === 'paper' ? 'text-sumi/80' : 'text-washi/80',
);
</script>

<template>
  <!-- Every card has the same parts in the same places: the goal bar always sits at the bottom. -->
  <PixelButton :colour="colour" is-card class="p-5 text-left">
    <span class="text-2xl font-bold">{{ name }}</span>
    <span class="mt-1 truncate text-sm" :class="textClass" lang="ja">{{ example }}</span>
    <span class="mt-2 flex-1 text-sm" :class="textClass">{{ description }}</span>
    <span v-if="note" class="mt-2 text-xs italic" :class="textClass" data-testid="mode-note">{{
      note
    }}</span>
    <GoalBar v-if="goal" :goal="goal" class="mt-3" :class="textClass" />
    <span
      v-else-if="stat"
      class="mt-3 flex justify-between text-xs"
      :class="textClass"
      data-testid="mode-stat"
    >
      <span>{{ stat.label }}</span>
      <span class="font-bold">{{ stat.value }}</span>
    </span>
  </PixelButton>
</template>
