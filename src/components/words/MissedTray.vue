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
  <section v-if="words.length" class="space-y-2" :aria-label="$t('game.words.missedWords')">
    <p class="text-xs text-washi/60">
      {{ isPaused ? $t('game.words.missedTapToFlip') : $t('game.words.missedPauseToFlip') }}
    </p>

    <div class="flex flex-wrap gap-2" data-testid="missed-tray">
      <PixelButton
        v-for="word in words"
        :key="word.id"
        colour="paper"
        class="min-h-11 px-3 text-lg disabled:opacity-60"
        :disabled="!isPaused"
        lang="ja"
        @click="$emit('flip', word)"
      >
        {{ word.word }}
      </PixelButton>
    </div>
  </section>
</template>
