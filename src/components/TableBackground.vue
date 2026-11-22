<script setup lang="ts">
/**
 * The table behind everything (D34): soft marbled navy bands that drift
 * slowly and loop, under a faint glow from the centre. The pattern is one
 * pre-blurred tile (assets/table-swirl.svg). The layer is one tile larger
 * than the window and moves by exactly one tile per loop, so the loop has
 * no jump; moving it is a transform, which the graphics card does without
 * redrawing. It stands still when the system asks for reduced motion.
 *
 * The tile is imported here rather than named in style.css: Vite resolves
 * an import the same way in development and in a build.
 */
import swirlUrl from '../assets/table-swirl.svg';

// Quoted: Vite inlines the small SVG as a data URL, which has brackets in it.
const swirlStyle = { backgroundImage: `url(${JSON.stringify(swirlUrl)})` };
</script>

<template>
  <div class="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden="true">
    <div class="table-swirl" :style="swirlStyle" />
    <div class="table-light" />
  </div>
</template>
