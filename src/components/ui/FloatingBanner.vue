<script setup lang="ts">
/**
 * A short message that floats in and out again, without stopping play,
 * fixed just below the "juku-arcade" title (3.5rem: the page's top padding
 * and the title's line, both in rem, so it lines up on every screen): word mode's "today's deck done" (useDeckFinish.ts).
 * The parent decides when it shows; screen readers hear it as it appears.
 */
defineProps<{ isShown: boolean }>();
</script>

<template>
  <Transition
    enter-from-class="-translate-y-4 opacity-0"
    leave-to-class="-translate-y-4 opacity-0"
    enter-active-class="transition duration-300 motion-reduce:transition-none"
    leave-active-class="transition duration-500 motion-reduce:transition-none"
  >
    <p
      v-if="isShown"
      class="pixel-panel pointer-events-none fixed top-14 left-1/2 z-40 -translate-x-1/2 bg-lamp px-5 py-2 text-center font-bold whitespace-nowrap text-sumi"
      role="status"
      data-testid="floating-banner"
    >
      <slot />
    </p>
  </Transition>
</template>
