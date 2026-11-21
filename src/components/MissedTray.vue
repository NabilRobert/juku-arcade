<script setup lang="ts">
/**
 * This run's latest missed words (L9). While paused, tap one to flip it:
 * these are past misses, so flipping them is free.
 */
import type { DeckWord } from '../deck/types.ts';

defineProps<{ words: readonly DeckWord[]; isPaused: boolean }>();
defineEmits<{ flip: [word: DeckWord] }>();
</script>

<template>
  <section v-if="words.length" class="space-y-2" aria-label="Missed words">
    <p class="text-xs text-washi/60">Missed {{ isPaused ? '(tap to flip)' : '(pause to flip)' }}</p>
    <div class="flex flex-wrap gap-2" data-testid="missed-tray">
      <button
        v-for="word in words"
        :key="word.id"
        type="button"
        class="min-h-11 rounded-lg washi border border-vermilion/50 px-3 font-card text-lg text-sumi disabled:opacity-60"
        :disabled="!isPaused"
        lang="ja"
        @click="$emit('flip', word)"
      >
        {{ word.word }}
      </button>
    </div>
  </section>
</template>
