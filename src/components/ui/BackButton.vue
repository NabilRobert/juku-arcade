<script setup lang="ts">
/**
 * The button that closes a page opened from the footer or the drawer
 * (Settings, Stats, About the data, The research). It says "Back", as the
 * page goes back to wherever it was opened from: the game or the start
 * screen (App.vue: closePage). Listeners pass through to the PixelButton.
 */
import PixelButton from './PixelButton.vue';
</script>

<template>
  <PixelButton colour="steel" class="px-4 py-2" data-testid="back">{{
    $t('common.back')
  }}</PixelButton>
</template>
