<script setup lang="ts">
/** The last kanji round's result in the side panel: how many readings were found, missed and wrong. */
import type { RoundResult } from '../kanji/kanji-round.ts';

defineProps<{ result: RoundResult | null }>();
</script>

<template>
  <section class="pixel-panel bg-wood/80 p-3 text-center text-sm" aria-live="polite">
    <template v-if="result">
      <p v-if="result.isPerfect" class="font-bold text-aqua">Perfect! +{{ result.points }}</p>
      <template v-else>
        <p>
          Found {{ result.hits }} of {{ result.hits + result.misses }}
          <span class="text-washi/70">· +{{ result.points }}</span>
        </p>
        <p v-if="result.wrongPicks > 0" class="text-washi/70">
          {{ result.wrongPicks }} wrong {{ result.wrongPicks === 1 ? 'pick' : 'picks' }}
        </p>
      </template>
    </template>
    <p v-else class="text-washi/60">Pick the readings, then Play.</p>
  </section>
</template>
