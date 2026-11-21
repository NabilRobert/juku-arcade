<script setup lang="ts">
/** One run on screen: the HUD above the board, driven by useRun. */
import type { DeckWord } from '../deck/types.ts';
import { useRun } from '../composables/useRun.ts';
import GameBoard from './GameBoard.vue';
import GameHud from './GameHud.vue';

const props = defineProps<{ words: readonly DeckWord[] }>();
const { state, nowMs, tags, tap } = useRun(props.words);
</script>

<template>
  <div class="flex flex-col gap-6">
    <GameHud :state="state" :now-ms="nowMs" />
    <GameBoard :state="state" :now-ms="nowMs" :tags="tags" @tap="tap" />
  </div>
</template>
