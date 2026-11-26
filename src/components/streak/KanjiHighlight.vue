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
    <!-- A square box that centres the kanji: as plain text, the crimson stopped short of the pixel font's glyph. -->
    <span
      class="inline-flex size-[1.4em] items-center justify-center align-middle text-3xl leading-none"
      :class="isMissed ? 'bg-crimson text-washi' : 'text-aqua'"
      lang="ja"
      >{{ count.kanji }}</span
    >
    <span class="text-washi/60"> ×{{ count.count }}</span>
  </p>
</template>
