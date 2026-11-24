<script setup lang="ts">
/**
 * A missed line and its fix (D56): the tiles in the player's
 * order with the wrong ones marked, the right sentence, and the grammar
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
const pattern = computed(() => POINT_PATTERNS[props.result.sentence.point] ?? '');
</script>

<template>
  <div
    class="flex flex-col gap-1 [&_ruby]:[ruby-position:under]"
    lang="ja"
    data-testid="sentence-fix"
  >
    <p class="flex flex-wrap items-center gap-2 text-2xl leading-loose">
      <span v-if="result.answer.length === 0" class="text-washi/70">えーと…</span>
      <span
        v-for="(tile, index) in result.answer"
        :key="tile"
        class="px-1"
        :class="result.fix.wrongAt.includes(index) ? 'bg-crimson text-washi' : 'text-washi/80'"
        :data-wrong="result.fix.wrongAt.includes(index) ? '' : undefined"
        ><FuriganaText :marked="markedOf(tile)"
      /></span>
    </p>
    <p class="text-2xl leading-loose text-aqua" data-testid="fix">
      → <FuriganaText :marked="fixMarked" />
    </p>
    <p class="text-base text-washi/70">{{ pattern }}</p>
  </div>
</template>
