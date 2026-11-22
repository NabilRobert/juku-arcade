<script setup lang="ts">
/**
 * A pixel-art icon (pixel-icons.ts), sized to the text around it. It's
 * decoration: the button it sits in says what it does in words.
 */
import { computed } from 'vue';
import { iconPaths, iconSize, type IconName } from './pixel-icons.ts';

const props = defineProps<{ name: IconName }>();

const size = computed(() => iconSize(props.name));
const paths = computed(() => iconPaths(props.name));
</script>

<template>
  <svg
    class="inline-block h-[1.4em] w-auto shrink-0 align-[-0.35em]"
    :viewBox="`0 0 ${size.width} ${size.height}`"
    shape-rendering="crispEdges"
    aria-hidden="true"
    :data-icon="name"
  >
    <path v-for="path in paths" :key="path.colour" :d="path.d" :fill="path.colour" />
  </svg>
</template>
