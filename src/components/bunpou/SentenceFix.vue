<script setup lang="ts">
/**
 * A missed line and its fix (D56): the tiles in the player's
 * boxes with the wrong ones marked (an empty box after a timeout stays
 * empty), the right sentence, and the grammar
 * point's pattern, in Japanese only. A line that timed out empty shows
 * the storyteller's えーと… instead. Used straight after a miss, in the
 * pause list and in the tale's reveal.
 */
import { computed } from 'vue';
import type { LineResult } from '../../grammar/bunpou-run.ts';
import { POINT_PATTERNS } from '../../grammar/templates.ts';
import FuriganaText from '../words/FuriganaText.vue';

const props = defineProps<{ result: LineResult }>();

const markedOf = computed(() => {
  const marks = new Map(props.result.sentence.tiles.map((tile) => [tile.text, tile.marked]));
  return (text: string): string => marks.get(text) ?? text;
});
const fixMarked = computed(() => `${props.result.fix.order.map(markedOf.value).join('')}。`);
const isEmpty = computed(() => props.result.answer.every((tile) => tile === null));
const pattern = computed(() => POINT_PATTERNS[props.result.sentence.point]);
</script>

<template>
  <div class="flex flex-col gap-1" lang="ja" data-testid="sentence-fix">
    <p class="flex flex-wrap items-center gap-2 text-2xl leading-loose">
      <span v-if="isEmpty" class="text-washi/70">えーと…</span>
      <template v-for="(tile, index) in result.answer" v-else :key="index">
        <span
          v-if="tile === null"
          class="inline-block h-8 w-10 border-2 border-dashed border-washi/30"
          data-empty
        />
        <span
          v-else
          class="px-1"
          :class="result.fix.wrongAt.includes(index) ? 'bg-crimson text-washi' : 'text-washi/80'"
          :data-wrong="result.fix.wrongAt.includes(index) ? '' : undefined"
          ><FuriganaText :marked="markedOf(tile)" is-reading-below
        /></span>
      </template>
    </p>
    <p class="text-2xl leading-loose text-aqua" data-testid="fix">
      → <FuriganaText :marked="fixMarked" is-reading-below />
    </p>
    <p class="text-base leading-loose text-washi/70">
      <FuriganaText :marked="pattern" is-reading-below />
    </p>
  </div>
</template>
