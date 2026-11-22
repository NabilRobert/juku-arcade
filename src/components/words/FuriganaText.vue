<script setup lang="ts">
/** Japanese text with readings above the kanji, from Tatoeba's {学校|がっこう} markup. */
import { computed } from 'vue';
import { parseFurigana } from '../../deck/furigana.ts';

const props = defineProps<{ marked: string }>();
const pieces = computed(() => parseFurigana(props.marked));
</script>

<template>
  <span lang="ja">
    <template v-for="(piece, index) in pieces" :key="index">
      <ruby v-if="piece.reading"
        >{{ piece.text }}<rt class="text-[0.6em]">{{ piece.reading }}</rt></ruby
      >
      <template v-else>{{ piece.text }}</template>
    </template>
  </span>
</template>
