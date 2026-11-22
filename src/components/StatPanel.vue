<script setup lang="ts">
/**
 * One labelled number in a side panel or on the stats page: a small label,
 * the value (the slot, so a caller can animate it), and an optional note.
 */
defineProps<{ label: string; note?: string }>();
</script>

<template>
  <p class="pixel-panel bg-wood/80 p-3 text-center">
    <span class="block text-xs tracking-widest text-aqua/80 uppercase">{{ label }}</span>
    <slot />
    <span v-if="note" class="block text-xs text-washi/60">{{ note }}</span>
  </p>
</template>
