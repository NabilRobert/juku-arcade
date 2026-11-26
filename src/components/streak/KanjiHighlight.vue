<script setup lang="ts">
/**
 * One kanji picked out with a label and a count: the day's most
 * recognised (aqua) or most missed (on crimson, so it reads on the blue).
 */
import type { KanjiCount } from '../../memory/kanji-tally.ts';

defineProps<{ label: string; count: KanjiCount; isMissed?: boolean }>();
</script>

<template>
  <p>
    <span class="block text-xs text-washi/60">{{ label }}</span>
    <span
      class="text-3xl"
      :class="isMissed ? 'bg-crimson px-1 text-washi' : 'text-aqua'"
      lang="ja"
      >{{ count.kanji }}</span
    >
    <span class="text-washi/60"> ×{{ count.count }}</span>
  </p>
</template>
