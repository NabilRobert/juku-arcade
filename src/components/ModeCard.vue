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
  note?: string;
}>();

/** The pale buttons (aqua, paper) take dark text; the rest light. */
const textClass = computed(() =>
  props.colour === 'aqua' || props.colour === 'paper' ? 'text-sumi/80' : 'text-washi/80',
);
</script>

<template>
  <PixelButton :colour="colour" class="flex flex-col gap-2 p-6 text-left">
    <span class="block text-2xl font-bold">{{ name }}</span>
    <span class="block text-sm" :class="textClass" lang="ja">{{ example }}</span>
    <span class="block text-sm" :class="textClass">{{ description }}</span>
    <GoalBar v-if="goal" :goal="goal" :class="textClass" />
    <span v-if="note" class="block text-xs italic" :class="textClass" data-testid="mode-note">{{
      note
    }}</span>
  </PixelButton>
</template>
