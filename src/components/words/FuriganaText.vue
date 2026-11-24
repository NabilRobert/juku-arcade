<script setup lang="ts">
/**
 * Japanese text with readings over its kanji, from Tatoeba's {学校|がっこう}
 * markup. Word cards put the readings above; Bunpou puts them below (D56),
 * with a little air so they don't touch the kanji, and keeps a word's
 * kanji together when its reading is wider than they are.
 */
import { computed } from 'vue';
import { parseFurigana } from '../../deck/furigana.ts';

const props = defineProps<{ marked: string; isReadingBelow?: boolean }>();
const pieces = computed(() => parseFurigana(props.marked));
</script>

<template>
  <span lang="ja">
    <template v-for="(piece, index) in pieces" :key="index">
      <ruby
        v-if="piece.reading"
        :class="isReadingBelow ? '[ruby-align:center] [ruby-position:under]' : ''"
        >{{ piece.text
        }}<rt class="text-[0.6em]" :class="isReadingBelow ? 'pt-[0.3em]' : ''">{{
          piece.reading
        }}</rt></ruby
      >
      <template v-else>{{ piece.text }}</template>
    </template>
  </span>
</template>
