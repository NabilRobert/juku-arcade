<script setup lang="ts">
/**
 * The back of a card, as a paper panel: a title (the `title` slot), a
 * "Turn over" button that closes it, and the card's notes below. Shared by
 * a word's back (CardBack.vue) and a kanji's back (KanjiCardBack.vue).
 */
import PixelButton from '../ui/PixelButton.vue';

defineEmits<{ close: [] }>();
</script>

<template>
  <article
    class="max-h-[70vh] space-y-4 overflow-y-auto pixel-panel washi p-4 text-sumi"
    :aria-label="$t('game.card.back')"
  >
    <header class="flex items-baseline justify-between gap-3">
      <p lang="ja"><slot name="title" /></p>
      <PixelButton colour="steel" class="px-3 py-1 text-sm" @click="$emit('close')">
        {{ $t('game.card.turnOver') }}
      </PixelButton>
    </header>
    <slot />
  </article>
</template>
