<script setup lang="ts">
/**
 * The table behind everything (D35): marbled navy bands that warp and
 * spiral in a loop, under a faint glow from the centre. The graphics card
 * draws them (background/swirl-shader.ts) on a canvas a sixth of the
 * window's size, stretched to fill it: that keeps it cheap on school
 * laptops and keeps the bands soft. It redraws about 30 times a second,
 * stops while the tab is hidden (the browser pauses animation frames),
 * and draws a single still frame when the system asks for reduced motion.
 * Without WebGL the plain navy table shows.
 *
 * A local copy can show a private picture instead (VITE_TABLE_IMAGE, D54),
 * pixel-sharp and darkened a little so the cards stand out; the swirl then
 * isn't drawn at all. Public builds leave it unset.
 */
import { useReducedMotion } from 'motion-v';
import { onMounted, onUnmounted, ref } from 'vue';
import { createSwirl, swirlPhase, type Swirl } from '../background/swirl-shader.ts';

/** The canvas is this many times smaller than the window, then stretched to fill it. */
const SHRINK = 6;
/** Redraw at most this often: the bands move slowly, so 30 a second looks smooth. */
const FRAME_MS = 1000 / 30;

/** The private picture's address, when this copy has one. */
const tableImage = import.meta.env.VITE_TABLE_IMAGE
  ? `${import.meta.env.BASE_URL}${import.meta.env.VITE_TABLE_IMAGE}`
  : null;

const canvas = ref<HTMLCanvasElement | null>(null);
const isReducedMotion = useReducedMotion();
let frame = 0;
let lastDrawMs = -Infinity;

function fitToWindow(target: HTMLCanvasElement): void {
  target.width = Math.ceil(window.innerWidth / SHRINK);
  target.height = Math.ceil(window.innerHeight / SHRINK);
}

function animate(swirl: Swirl, nowMs: number): void {
  frame = requestAnimationFrame((next) => animate(swirl, next));
  if (nowMs - lastDrawMs < FRAME_MS) return;
  lastDrawMs = nowMs;
  swirl.draw(swirlPhase(nowMs));
}

onMounted(() => {
  const target = canvas.value;
  if (target === null) return;
  fitToWindow(target);
  const swirl = createSwirl(target);
  if (swirl === null) return;
  const redraw = (): void => {
    fitToWindow(target);
    swirl.draw(swirlPhase(performance.now()));
  };
  window.addEventListener('resize', redraw);
  onUnmounted(() => window.removeEventListener('resize', redraw));
  if (isReducedMotion.value === true) swirl.draw(0);
  else animate(swirl, performance.now());
});
onUnmounted(() => cancelAnimationFrame(frame));
</script>

<template>
  <div class="pointer-events-none fixed inset-0 -z-10" aria-hidden="true">
    <template v-if="tableImage">
      <img :src="tableImage" alt="" class="size-full object-cover [image-rendering:pixelated]" />
      <div class="absolute inset-0 bg-lacquer/40" />
    </template>
    <canvas v-else ref="canvas" class="size-full" />
    <!-- A faint glow from the centre of the table, over the swirl. -->
    <div
      class="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_35%,color-mix(in_srgb,var(--color-steel)_18%,transparent),transparent_70%)]"
    />
  </div>
</template>
