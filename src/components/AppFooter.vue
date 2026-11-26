<script setup lang="ts">
/**
 * The footer under every page: always, who made the game; during a game,
 * the links out of it (PageLinks.vue); on the start screen, the same links
 * but Change mode, so Settings and Stats are reachable on a phone too. On
 * a phone or a tablet the footer hides during a game, so the board fits
 * the screen with nothing to scroll, and the links sit in the side drawer
 * instead (usePageLinks.ts).
 */
import type { PageTarget } from '../composables/usePageLinks.ts';
import PageLinks from './ui/PageLinks.vue';

defineProps<{ isInGame: boolean; isOnStartScreen?: boolean }>();
defineEmits<{ go: [target: PageTarget] }>();
</script>

<template>
  <footer
    class="mt-auto flex flex-col items-center gap-2 text-washi/60"
    :class="{ 'max-lg:hidden': isInGame }"
  >
    <PageLinks
      v-if="isInGame || isOnStartScreen"
      :is-mode-link-hidden="!isInGame"
      @go="(target) => $emit('go', target)"
    />
    <p class="text-xs text-washi/80">
      made by
      <a class="underline" href="https://github.com/NabilRobert" target="_blank" rel="noopener"
        >@nabilrobert</a
      >
      · 2026
    </p>
  </footer>
</template>
