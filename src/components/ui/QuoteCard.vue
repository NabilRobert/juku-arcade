<script setup lang="ts">
/**
 * A quote on paper (quotes.ts): the words, then who said them and where.
 * Practice mode's game over shows one, and so does End run's question.
 */
import type { Quote } from '../../dojo/quotes.ts';

defineProps<{ quote: Quote }>();
</script>

<template>
  <figure class="pixel-panel washi flex flex-col gap-2 px-6 py-4 text-sumi" data-testid="quote">
    <blockquote class="text-lg">“{{ quote.text }}”</blockquote>
    <figcaption class="self-end text-sm text-sumi/70">
      ― {{ quote.by }}, <cite>{{ quote.source }}</cite>
    </figcaption>
  </figure>
</template>
