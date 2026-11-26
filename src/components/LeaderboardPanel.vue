<script setup lang="ts">
/**
 * The leaderboard on the start screen (D47, D62), drawn like an arcade
 * high-score table: a blue pixel box with LEADERBOARD inside it,
 * numbered rows with each player's score, and Back and Next to page
 * through the ranking. There's a board for each mode and a Total board
 * (each mode's best added up), switched at the top. Your bests from this
 * browser (`bests`, worked out by the start screen) are ranked among
 * sample players until there's a server to share real scores, and the
 * panel says so. It folds down to its title (folded-panels.ts).
 */
import { computed, ref } from 'vue';
import {
  BOARD_SAMPLES,
  pageCount,
  pageOf,
  rankedPlayers,
  type BoardId,
} from '../leaderboard/leaderboard.ts';
import { isLeaderboardFolded, setLeaderboardFolded } from '../preferences/folded-panels.ts';
import FoldButton from './ui/FoldButton.vue';
import PixelButton from './ui/PixelButton.vue';
import PixelIcon from './ui/PixelIcon.vue';

const props = defineProps<{ bests: Readonly<Record<BoardId, number>> }>();

const BOARDS: readonly { board: BoardId; label: string }[] = [
  { board: 'words', label: 'Words' },
  { board: 'kanji', label: 'Kanji' },
  { board: 'bunpou', label: 'Bunpou' },
  { board: 'dojo', label: 'Practice' },
  { board: 'total', label: 'Total' },
];

const board = ref<BoardId>('words');
const page = ref(0);
const ranked = computed(() => rankedPlayers(props.bests[board.value], BOARD_SAMPLES[board.value]));
const pages = computed(() => pageCount(ranked.value));
const rows = computed(() => pageOf(ranked.value, page.value));

function show(next: BoardId): void {
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
    <div class="relative">
      <h2
        class="text-center text-3xl tracking-widest text-[#ffd84a] drop-shadow-[0_3px_0_var(--color-sumi)]"
      >
        Leaderboard
      </h2>
      <FoldButton
        class="absolute top-1/2 right-0 -translate-y-1/2"
        :is-folded="isLeaderboardFolded"
        label="leaderboard"
        @toggle="setLeaderboardFolded(!isLeaderboardFolded)"
      />
    </div>
    <template v-if="!isLeaderboardFolded">
      <div class="flex flex-wrap justify-center gap-1.5" role="group" aria-label="Which board">
        <PixelButton
          v-for="choice in BOARDS"
          :key="choice.board"
          :colour="board === choice.board ? 'aqua' : 'steel'"
          class="min-h-9 px-2 text-xs font-bold uppercase"
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
    </template>
  </section>
</template>
