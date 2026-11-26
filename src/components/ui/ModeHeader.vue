<script setup lang="ts">
/**
 * The top of a mode's side panel: the mode and level ("Kanji mode · N5"),
 * with anything else the mode shows under it (kanji mode's round).
 */
import PanelLabel from './PanelLabel.vue';

defineProps<{ title: string }>();
</script>

<template>
  <section class="pixel-panel bg-wood/80 p-3 text-center">
    <PanelLabel>{{ title }}</PanelLabel>
    <slot />
  </section>
</template>
