<script setup lang="ts">
/** A question's time left as a bar that shrinks from full (1) to empty (0). Decoration: the time is also shown by play stopping. */
defineProps<{ timeLeft: number }>();
</script>

<template>
  <span class="pixel-panel block h-3 flex-1 bg-lacquer" aria-hidden="true" data-testid="timer">
    <span class="block h-full bg-aqua" :style="{ width: `${timeLeft * 100}%` }" />
  </span>
</template>
