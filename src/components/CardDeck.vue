<script setup lang="ts">
/**
 * The deck each set is dealt from: a stack of face-down cards at the end
 * of the player's hand. The board measures it (useDeal.ts), so every card
 * starts on top of it and flies to its place. Each card in the stack is
 * a face-down pixel card (CardFrame.vue).
 */
import CardFrame from './CardFrame.vue';

/** Cards drawn in the stack, each a little higher than the one under it. */
const LAYERS = 3;
</script>

<template>
  <div
    class="relative mx-auto aspect-[3/4] w-[min(100%,calc(var(--card-height)*0.75))]"
    aria-hidden="true"
    data-testid="deck"
  >
    <span
      v-for="layer in LAYERS"
      :key="layer"
      class="@container absolute inset-0 flex items-center justify-center font-card text-3xl text-aqua"
      :style="{ transform: `translate(${-layer * 2}px, ${-layer * 3}px)` }"
    >
      <CardFrame frame="crimson" :is-face-down="true" />
      <span v-if="layer === LAYERS" class="relative">札</span>
    </span>
  </div>
</template>
