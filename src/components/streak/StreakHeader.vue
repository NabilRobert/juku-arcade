<script setup lang="ts">
/**
 * The streak's headline: a flickering pixel flame (FlameSprite.vue) with the streak's length, a
 * milestone banner on the day one is reached, and this visit's reminder
 * (useStreak.ts). "sample data" shows when a local copy's placeholder
 * play is on.
 */
import type { StreakMessage } from '../../memory/streak-messages.ts';
import FlameSprite from './FlameSprite.vue';

defineProps<{
  days: number;
  milestone: number | null;
  message: StreakMessage | null;
  isSample: boolean;
}>();
</script>

<template>
  <div class="flex flex-col gap-2">
    <header class="flex items-center gap-3">
      <FlameSprite class="h-10" />
      <p class="text-2xl font-bold" data-testid="streak-days">{{ days }}-day streak</p>
      <span v-if="isSample" class="ml-auto text-xs text-washi/50">sample data</span>
    </header>
    <p
      v-if="milestone"
      class="bg-lamp px-3 py-1 text-center font-bold text-sumi"
      data-testid="streak-milestone"
    >
      {{ milestone }}-day streak! Keep it up!
    </p>
    <p v-if="message" class="text-washi/80" data-testid="streak-message">{{ message.text }}</p>
  </div>
</template>
