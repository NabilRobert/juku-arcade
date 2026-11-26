<script setup lang="ts">
/**
 * A Settings button for the start screen on a phone or a tablet, where the
 * footer's links sit at the bottom of a long page (playtest decision,
 * 2026-11-26). It opens the page through the app shell (usePageLinks.ts),
 * so the page closes back to the start screen.
 */
import { injectGoToPage } from '../../composables/usePageLinks.ts';
import PixelButton from './PixelButton.vue';

const goToPage = injectGoToPage();
</script>

<template>
  <PixelButton
    v-if="goToPage !== null"
    colour="steel"
    class="min-h-11 px-4 text-sm font-semibold"
    data-testid="settings-button"
    @click="goToPage('settings')"
  >
    Settings
  </PixelButton>
</template>
