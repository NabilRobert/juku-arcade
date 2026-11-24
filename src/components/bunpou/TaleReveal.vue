<script setup lang="ts">
/**
 * The tale, revealed after its last line (D56): every line in order as
 * the player built it, a right line as it reads and a wrong one with its
 * marked tiles and fix. A plain list for now; the storyteller's stage
 * comes later (G3).
 */
import { computed } from 'vue';
import type { LineResult } from '../../grammar/bunpou-run.ts';
import { sentenceText } from '../../grammar/fill.ts';
import FuriganaText from '../words/FuriganaText.vue';
import PixelButton from '../ui/PixelButton.vue';
import SentenceFix from './SentenceFix.vue';

const props = defineProps<{ results: readonly LineResult[] }>();
defineEmits<{ next: [] }>();

const PART_NAMES = { S: '起', D: '承', T: '転', P: '結' } as const;
const rightCount = computed(() => props.results.filter((result) => result.isRight).length);
const marked = (result: LineResult): string =>
  `${result.sentence.tiles.map((tile) => tile.marked).join('')}。`;
</script>

<template>
  <section
    class="pixel-panel flex flex-col gap-4 bg-wood/80 p-6"
    aria-label="The tale"
    data-testid="tale"
  >
    <p class="text-sm text-washi/70">◯ {{ rightCount }} / {{ results.length }}</p>
    <ol class="flex flex-col gap-3">
      <li v-for="(result, index) in results" :key="index" class="flex gap-4">
        <span class="text-2xl text-aqua" lang="ja">{{ PART_NAMES[result.sentence.shelf] }}</span>
        <p
          v-if="result.isRight"
          class="text-2xl leading-loose [&_ruby]:[ruby-position:under]"
          :aria-label="sentenceText(result.sentence)"
        >
          <FuriganaText :marked="marked(result)" />
        </p>
        <SentenceFix v-else :result="result" />
      </li>
    </ol>
    <PixelButton
      colour="aqua"
      class="self-end px-6 py-2 font-bold"
      data-testid="next-tale"
      @click="$emit('next')"
    >
      Next tale ▶
    </PixelButton>
  </section>
</template>
