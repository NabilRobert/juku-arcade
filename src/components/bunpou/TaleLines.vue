<script setup lang="ts">
/**
 * A tale's lines as told (D56, D58): each with its part (起承転結), a right
 * line as it reads and a wrong one with its marked tiles and fix. Used by
 * the performance, line by line, and by the chapter scroll.
 */
import type { LineResult } from '../../grammar/bunpou-run.ts';
import { markedSentence, sentenceText } from '../../grammar/fill.ts';
import { SHELF_NAMES } from '../../grammar/templates.ts';
import FuriganaText from '../words/FuriganaText.vue';
import SentenceFix from './SentenceFix.vue';

defineProps<{ results: readonly LineResult[] }>();
</script>

<template>
  <ol class="flex flex-col gap-3" data-testid="tale-lines">
    <li v-for="(result, index) in results" :key="index" class="flex gap-4">
      <span class="text-2xl text-aqua" lang="ja">{{ SHELF_NAMES[result.sentence.shelf] }}</span>
      <p
        v-if="result.isRight"
        class="text-2xl leading-loose"
        :aria-label="sentenceText(result.sentence)"
      >
        <FuriganaText :marked="markedSentence(result.sentence)" is-reading-below />
      </p>
      <SentenceFix v-else :result="result" />
    </li>
  </ol>
</template>
