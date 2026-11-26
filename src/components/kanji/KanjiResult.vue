<script setup lang="ts">
/**
 * The last kanji round's result in the side panel: how many readings were
 * found, missed and wrong, and what its crests added or took (D42).
 */
import type { PlayedRound } from '../../kanji/useKanjiRun.ts';

defineProps<{ result: PlayedRound | null }>();
</script>

<template>
  <section class="pixel-panel bg-wood/80 p-3 text-center text-sm" aria-live="polite">
    <template v-if="result">
      <p v-if="result.isPerfect" class="font-bold text-aqua">
        {{ $t('kanji.result.perfect', { points: result.points }) }}
      </p>
      <template v-else>
        <p>
          {{ $t('kanji.result.found', { hits: result.hits, total: result.hits + result.misses }) }}
          <span class="text-washi/70">{{
            $t('kanji.result.points', { points: result.points })
          }}</span>
        </p>
        <p v-if="result.wrongPicks > 0" class="text-washi/70">
          {{ $t('kanji.result.wrongPicks', result.wrongPicks) }}
        </p>
      </template>
      <p
        v-if="result.crestPoints !== 0"
        :class="result.crestPoints > 0 ? 'text-gold' : 'text-crimson'"
        data-testid="crest-points"
      >
        {{
          $t('kanji.result.crests', {
            sign: result.crestPoints > 0 ? '+' : '−',
            points: Math.abs(result.crestPoints),
          })
        }}
      </p>
    </template>
    <p v-else class="text-washi/60">{{ $t('kanji.result.prompt') }}</p>
  </section>
</template>
