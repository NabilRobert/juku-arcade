<script setup lang="ts">
/**
 * The leaderboard on the start screen (D47), drawn like an arcade high
 * score table: a blue pixel box with LEADERBOARD inside it, numbered
 * rows with each player's score, and Back and Next to page through the
 * ranking. Words and Bunpou (D59) have a board each, switched at the
 * top: words by banked coins, Bunpou by total run score. Your best from
 * this browser is ranked among sample players until there's a server to
 * share real scores, and the panel says so.
 */
import { computed, ref } from 'vue';
import { readBestScore } from '../bank-run/useBankRun.ts';
import {
  BUNPOU_SAMPLE_PLAYERS,
  pageCount,
  pageOf,
  rankedPlayers,
  readBunpouBest,
} from '../leaderboard/leaderboard.ts';
import PixelButton from './ui/PixelButton.vue';
import PixelIcon from './ui/PixelIcon.vue';

type Board = 'words' | 'bunpou';
const BOARDS: readonly { board: Board; label: string }[] = [
  { board: 'words', label: 'Words' },
  { board: 'bunpou', label: 'Bunpou' },
];

const board = ref<Board>('words');
const page = ref(0);
const ranked = computed(() =>
  board.value === 'words'
    ? rankedPlayers(readBestScore())
    : rankedPlayers(readBunpouBest(), BUNPOU_SAMPLE_PLAYERS),
);
const pages = computed(() => pageCount(ranked.value));
const rows = computed(() => pageOf(ranked.value, page.value));

function show(next: Board): void {
  board.value = next;
  page.value = 0;
}

/** BACK and NEXT are disabled at the first and last pages, so a turn always lands on a page. */
function turn(by: number): void {
  page.value += by;
}
</script>

<template>
  <section class="pixel-panel flex flex-col gap-4 bg-steel p-6 uppercase" aria-label="Leaderboard">
    <h2
      class="text-center text-3xl tracking-widest text-[#ffd84a] drop-shadow-[0_3px_0_var(--color-sumi)]"
    >
      Leaderboard
    </h2>
    <div class="flex justify-center gap-2" role="group" aria-label="Which board">
      <PixelButton
        v-for="choice in BOARDS"
        :key="choice.board"
        :colour="board === choice.board ? 'aqua' : 'steel'"
        class="min-h-9 px-4 text-sm font-bold uppercase"
        :aria-pressed="board === choice.board"
        :data-testid="`board-${choice.board}`"
        @click="show(choice.board)"
      >
        {{ choice.label }}
      </PixelButton>
    </div>
    <ol class="flex flex-1 flex-col justify-around gap-1 text-xl" data-testid="leaderboard-rows">
      <li
        v-for="row in rows"
        :key="row.rank"
        class="flex items-center gap-3 px-3 py-1.5"
        :class="row.isYou ? 'bg-aqua text-sumi' : 'text-washi'"
        :data-testid="row.isYou ? 'leaderboard-you' : undefined"
      >
        <span class="w-10 shrink-0 text-right">{{ row.rank }}.</span>
        <span class="flex-1 truncate">{{ row.name }}</span>
        <PixelIcon v-if="board === 'words'" name="coin" />
        <span class="w-16 text-right font-bold">{{ row.score }}</span>
      </li>
    </ol>
    <div class="flex items-center justify-center gap-4">
      <PixelButton
        colour="crimson"
        class="min-h-10 px-5 font-bold uppercase disabled:opacity-40"
        :disabled="page === 0"
        data-testid="leaderboard-back"
        @click="turn(-1)"
      >
        Back
      </PixelButton>
      <span class="text-sm text-washi/80" data-testid="leaderboard-page"
        >{{ page + 1 }} / {{ pages }}</span
      >
      <PixelButton
        colour="crimson"
        class="min-h-10 px-5 font-bold uppercase disabled:opacity-40"
        :disabled="page === pages - 1"
        data-testid="leaderboard-next"
        @click="turn(1)"
      >
        Next
      </PixelButton>
    </div>
    <p class="text-center text-xs text-washi/70 normal-case">Sample players for now.</p>
  </section>
</template>
