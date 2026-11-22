<script setup lang="ts">
/**
 * This run's latest missed words (L9). While paused, tap one to flip it:
 * these are past misses, so flipping them is free.
 */
import type { DeckWord } from '../../deck/types.ts';
import PixelButton from '../ui/PixelButton.vue';

defineProps<{ words: readonly DeckWord[]; isPaused: boolean }>();
defineEmits<{ flip: [word: DeckWord] }>();
</script>

<template>
  <section v-if="words.length" class="space-y-2" aria-label="Missed words">
    <p class="text-xs text-washi/60">Missed {{ isPaused ? '(tap to flip)' : '(pause to flip)' }}</p>
    <div class="flex flex-wrap gap-2" data-testid="missed-tray">
      <PixelButton
        v-for="word in words"
        :key="word.id"
        colour="paper"
        class="min-h-11 px-3 font-card text-lg disabled:opacity-60"
        :disabled="!isPaused"
        lang="ja"
        @click="$emit('flip', word)"
      >
        {{ word.word }}
      </PixelButton>
    </div>
  </section>
</template>
