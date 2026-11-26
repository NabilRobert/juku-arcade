<script setup lang="ts">
/**
 * One kanji picked out with a label and a count: the day's most
 * recognised (aqua) or most missed (on crimson, so it reads on the blue).
 * The kanji is a button: clicking it opens its card back (`open`).
 */
import type { KanjiCount } from '../../memory/kanji-tally.ts';

defineProps<{ label: string; count: KanjiCount; isMissed?: boolean }>();
defineEmits<{ open: [] }>();
</script>

<template>
  <p>
    <span class="block text-xs text-washi/60">{{ label }}</span>
    <!-- A square box that centres the kanji: as plain text, the crimson stopped short of the pixel font's glyph. -->
    <button
      type="button"
      class="inline-flex size-[1.4em] cursor-pointer items-center justify-center align-middle text-3xl leading-none underline-offset-4 hover:underline"
      :class="isMissed ? 'bg-crimson text-washi' : 'text-aqua'"
      lang="ja"
      :aria-label="$t('streak.day.openKanji', { kanji: count.kanji })"
      data-testid="kanji-open"
      @click="$emit('open')"
    >
      {{ count.kanji }}
    </button>
    <span class="text-washi/60"> ×{{ count.count }}</span>
  </p>
</template>
