<script setup lang="ts">
/**
 * The streak's flame, flickering through its frames (flame-frames.ts).
 * It holds still on the first frame when the player's system asks for
 * reduced motion. Its size comes from the classes the caller gives it.
 */
import { useReducedMotion } from 'motion-v';
import { computed, onMounted, onUnmounted, ref } from 'vue';
import PixelSprite from '../ui/PixelSprite.vue';
import { FLAME_FRAMES, FLAME_PALETTE } from './flame-frames.ts';

/** About six frames a second: quick enough to flicker, slow enough to read as pixel art. */
const FRAME_MS = 160;

const isReducedMotion = useReducedMotion();
const frame = ref(0);
const grid = computed(() => FLAME_FRAMES[frame.value] ?? FLAME_FRAMES[0] ?? []);
let timer: ReturnType<typeof setInterval> | undefined;

onMounted(() => {
  timer = setInterval(() => {
    if (isReducedMotion.value === true) frame.value = 0;
    else frame.value = (frame.value + 1) % FLAME_FRAMES.length;
  }, FRAME_MS);
});
onUnmounted(() => clearInterval(timer));
</script>

<template>
  <PixelSprite :grid="grid" :palette="FLAME_PALETTE" name="flame" :data-frame="frame" />
</template>
