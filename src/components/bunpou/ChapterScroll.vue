<script setup lang="ts">
/**
 * After the third tale, the chapter shown together as a scroll (D58): its
 * number (第1章), then each tale (其の一, 其の二, 其の三) with its lines as
 * told and how many were right. Wooden rods top and bottom make the
 * scroll; the body scrolls if the chapter is long. A show is one chapter
 * (D61), so its button leads to the curtain call.
 */
import type { LineResult } from '../../grammar/bunpou-run.ts';
import PixelButton from '../ui/PixelButton.vue';
import TaleLines from './TaleLines.vue';

defineProps<{ chapter: number; tales: readonly (readonly LineResult[])[] }>();
defineEmits<{ next: [] }>();

const TALE_NUMBERS = ['其の一', '其の二', '其の三'] as const;
const rightCount = (results: readonly LineResult[]): number =>
  results.filter((result) => result.isRight).length;
</script>

<template>
  <section
    class="flex flex-col items-stretch"
    :aria-label="$t('bunpou.chapter')"
    data-testid="chapter"
  >
    <div class="pixel-corners mx-[-0.75rem] h-4 bg-cedar" aria-hidden="true" />
    <div class="flex max-h-[70svh] flex-col gap-6 overflow-y-auto bg-wood/95 px-8 py-6">
      <h2 class="text-center text-3xl font-bold text-aqua" lang="ja">第{{ chapter }}章</h2>
      <article v-for="(results, index) in tales" :key="index" class="flex flex-col gap-2">
        <h3 class="flex items-baseline gap-3 text-xl text-washi" lang="ja">
          {{ TALE_NUMBERS[index] ?? `其の${index + 1}` }}
          <span class="text-sm text-washi/60"
            >◯ {{ rightCount(results) }} / {{ results.length }}</span
          >
        </h3>
        <TaleLines :results="results" />
      </article>
      <PixelButton
        colour="aqua"
        class="self-end px-6 py-2 font-bold"
        data-testid="chapter-next"
        @click="$emit('next')"
      >
        {{ $t('bunpou.curtainCall') }}
      </PixelButton>
    </div>
    <div class="pixel-corners mx-[-0.75rem] h-4 bg-cedar" aria-hidden="true" />
  </section>
</template>
