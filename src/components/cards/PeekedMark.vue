<script setup lang="ts">
/**
 * The label on a card the player peeked at (flipped while paused, L9): a
 * cedar-brown band saying it won't score, so the card says so itself, not
 * only its brown border and back (PlayCard.vue). Sized in the card's
 * container units, so it scales with the card.
 */
</script>

<template>
  <span
    class="absolute inset-x-[10cqw] bottom-[22cqw] bg-cedar py-[1.5cqw] text-center font-sans text-[8cqw] leading-none text-washi"
    lang="en"
    data-testid="peeked-mark"
  >
    no score
  </span>
</template>
