<script setup lang="ts">
/**
 * The row of links out of a game, used by the footer on a wide screen and
 * by the side drawer on a phone or a tablet (usePageLinks.ts).
 */
import { PAGE_LINKS, type PageTarget } from '../../composables/usePageLinks.ts';

defineEmits<{ go: [target: PageTarget] }>();
</script>

<template>
  <nav class="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-washi/60">
    <button
      v-for="link in PAGE_LINKS"
      :key="link.target"
      type="button"
      class="underline"
      @click="$emit('go', link.target)"
    >
      {{ link.label }}
    </button>
  </nav>
</template>
