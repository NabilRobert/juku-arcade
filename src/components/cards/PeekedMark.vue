<script setup lang="ts">
/**
 * The label on a card the player peeked at (flipped while paused, L9): a
 * cedar-brown band saying it won't score, so the card says so itself, not
 * only its brown border and back (PlayCard.vue). Sized in the card's
 * container units, so it scales with the card. The card is marked as
 * Japanese, so the band says which language it's in: the interface's.
 */
import { language } from '../../i18n/index.ts';
</script>

<template>
  <span
    class="absolute inset-x-[10cqw] bottom-[22cqw] bg-cedar py-[1.5cqw] text-center font-sans text-[8cqw] leading-none text-washi"
    :lang="language"
    data-testid="peeked-mark"
  >
    {{ $t('game.card.noScore') }}
  </span>
</template>
