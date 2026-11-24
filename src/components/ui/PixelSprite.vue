<script setup lang="ts">
/**
 * A pixel-art sprite from a letter grid and its palette (like PixelIcon,
 * which draws the fixed icons): the Bunpou stage's storyteller, audience
 * and slips (bunpou/stage-sprites.ts). Its size comes from the classes
 * the caller gives it; it's decoration, so screen readers skip it.
 */
import { computed } from 'vue';
import { gridPaths, gridSize } from './pixel-icons.ts';

const props = defineProps<{
  grid: readonly string[];
  palette: Readonly<Record<string, string>>;
  /** Names the sprite in an error if its grid uses a letter the palette lacks. */
  name: string;
  /** Fills its box, cropping the edges rather than squashing the pixels (a strip across the stage). */
  isCover?: boolean;
}>();

const size = computed(() => gridSize(props.grid));
const paths = computed(() => gridPaths(props.grid, props.palette, props.name));
</script>

<template>
  <svg
    class="block"
    :class="isCover ? 'h-full w-full' : 'w-auto'"
    :viewBox="`0 0 ${size.width} ${size.height}`"
    :preserveAspectRatio="isCover ? 'xMidYMax slice' : undefined"
    shape-rendering="crispEdges"
    aria-hidden="true"
    :data-sprite="name"
  >
    <path v-for="path in paths" :key="path.colour" :d="path.d" :fill="path.colour" />
  </svg>
</template>
