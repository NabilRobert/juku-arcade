<script setup lang="ts">
/**
 * Every button outside the cards (D36): a pixel-art button with the
 * cards' stepped corners and a lit top edge (.pixel-button in style.css).
 * Each click plays a colour wipe that sweeps in from both edges, meets in
 * the middle and fades. Classes, attributes and listeners the parent puts
 * on it pass through to the <button>.
 */
import { ref } from 'vue';

export type ButtonColour = 'crimson' | 'steel' | 'aqua' | 'paper' | 'ghost';

withDefaults(defineProps<{ colour?: ButtonColour }>(), { colour: 'steel' });

/** Each colour of button, and the colour its click wipes in (--wipe). */
const COLOURS: Record<ButtonColour, string> = {
  crimson: 'bg-crimson text-washi [--wipe:var(--color-steel)]',
  steel: 'bg-steel text-washi [--wipe:var(--color-crimson)]',
  aqua: 'bg-aqua text-sumi [--wipe:var(--color-washi)]',
  paper: 'washi text-sumi [--wipe:var(--color-aqua)]',
  ghost: 'bg-washi/10 text-washi/80 [--wipe:rgb(168_218_220/0.4)]',
};

/** Counts clicks; a new count re-creates the wipe, which restarts its animation. */
const clicks = ref(0);
</script>

<template>
  <button type="button" class="pixel-button" :class="COLOURS[colour]" @click="clicks += 1">
    <span v-if="clicks > 0" :key="clicks" class="pixel-wipe" aria-hidden="true" />
    <span class="relative"><slot /></span>
  </button>
</template>
