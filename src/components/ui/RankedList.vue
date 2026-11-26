<script setup lang="ts">
/**
 * A titled panel listing things with a count each, most first ("Missed
 * most", "Mistakes by kind"), or a line saying there are none yet. Each
 * item's label is the default slot, so it can be plain text, a word with
 * its reading, or a pattern with furigana.
 */
import PanelLabel from './PanelLabel.vue';

export interface RankedItem {
  key: string;
  count: number;
}

defineProps<{ title: string; items: readonly RankedItem[]; emptyText: string; unit?: string }>();
</script>

<template>
  <section class="pixel-panel bg-wood/80 p-3">
    <PanelLabel as="h3" class="mb-2">{{ title }}</PanelLabel>
    <ol v-if="items.length" class="space-y-1">
      <li v-for="item in items" :key="item.key" class="flex justify-between gap-3">
        <slot :item="item">{{ item.key }}</slot>
        <span class="text-washi/60">{{ item.count }}{{ unit ?? '' }}</span>
      </li>
    </ol>
    <p v-else class="text-sm text-washi/60">{{ emptyText }}</p>
  </section>
</template>
