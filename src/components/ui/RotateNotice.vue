<script setup lang="ts">
/**
 * Covers the game while a phone is turned sideways (usePhoneLandscape.ts):
 * the game is laid out for a phone held upright. The run pauses behind it
 * (App.vue counts the game as away), so no time is lost.
 */
</script>

<template>
  <div
    class="fixed inset-0 z-[70] flex items-center justify-center bg-lacquer p-6"
    role="alertdialog"
    aria-modal="true"
    aria-labelledby="rotate-notice-title"
    data-testid="rotate-notice"
  >
    <section class="pixel-panel flex max-w-md flex-col items-center gap-3 bg-wood p-6 text-center">
      <p id="rotate-notice-title" class="text-2xl font-bold text-aqua">
        {{ $t('menu.rotate.title') }}
      </p>
      <p class="text-washi">{{ $t('menu.rotate.body') }}</p>
    </section>
  </div>
</template>
