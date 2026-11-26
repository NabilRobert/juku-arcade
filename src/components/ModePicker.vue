<script setup lang="ts">
/**
 * The start screen's choice of mode (D37), shown each time the game opens
 * (after the daily check-up) and from "Change mode": word mode, which
 * pairs words with their readings and feeds the reviews; kanji mode,
 * which is practice at finding every reading of one kanji; or Bunpou
 * (D56), which puts grammar tiles in order; or the dojo (D62), the
 * game-over mode. The leaderboard (D47) sits on
 * the left; the streak and the play calendar (StreakPanel.vue) sit above
 * the modes, and each mode's card shows its level goal (level-goals.ts).
 * The play history is read once here for both.
 */
import { computed } from 'vue';
import type { Deck } from '../deck/types.ts';
import { readBestScore } from '../bank-run/useBankRun.ts';
import { usePlayHistory } from '../composables/usePlayHistory.ts';
import { boardBests, readBunpouBest } from '../leaderboard/leaderboard.ts';
import { CURRICULUM } from '../grammar/curriculum.ts';
import { kanjiPool } from '../kanji/kanji-round.ts';
import { grammarGoal, kanjiGoal, wordGoal, type LevelGoal } from '../memory/level-goals.ts';
import LeaderboardPanel from './LeaderboardPanel.vue';
import StreakPanel from './streak/StreakPanel.vue';
import ModeCard from './ModeCard.vue';
import type { ButtonColour } from './ui/PixelButton.vue';

export type GameMode = 'words' | 'kanji' | 'bunpou' | 'dojo';

const props = defineProps<{ deck: Deck }>();

interface Card {
  mode: GameMode;
  colour: ButtonColour;
  name: string;
  example: string;
  description: string;
  note?: string;
}

const level = props.deck.level;
const { history, today } = usePlayHistory(props.deck);
const levelKanji = [...kanjiPool(props.deck).readings.keys()];
const goals = computed<Partial<Record<GameMode, LevelGoal>>>(() => ({
  words: wordGoal(props.deck.words, history.value.wordEvents),
  kanji: kanjiGoal(levelKanji, history.value.kanjiRounds),
  bunpou: grammarGoal(CURRICULUM, history.value.grammarEvents, today),
}));

// Bests kept before the play log existed still count (word mode's coins, Bunpou's run).
const bests = computed(() =>
  boardBests(history.value.runs, { words: readBestScore(), bunpou: readBunpouBest() }),
);

const cards: readonly Card[] = [
  {
    mode: 'words',
    colour: 'crimson',
    name: 'Words',
    example: '学校 → がっこう',
    description: `Match each ${level} word to its reading. Counts toward your reviews.`,
  },
  {
    mode: 'kanji',
    colour: 'steel',
    name: 'Kanji',
    example: '生 → セイ・う(まれる)…',
    description: 'Find every reading of a kanji among 8 cards. Practice only.',
  },
  {
    mode: 'bunpou',
    colour: 'aqua',
    name: 'Bunpou',
    example: '行く・駅・に → 駅に行く',
    description: 'Put each sentence in order, then watch the tale. Counts toward grammar reviews.',
    // The grammar content is N5's only (D60); other levels are still to write.
    note: 'N5 only for now · still in development',
  },
  {
    mode: 'dojo',
    colour: 'paper',
    name: 'Dojo',
    example: '提灯 ×3',
    description: "Words, kanji and grammar you've met, until three misses. Ranked.",
  },
];
defineEmits<{ choose: [mode: GameMode] }>();
</script>

<template>
  <!-- The leaderboard fills the left of the screen, the streak then the modes on the right; on a phone or a tablet they stack in that order, leaderboard on top. -->
  <div
    class="flex w-full flex-1 flex-col gap-6 lg:grid lg:grid-cols-[minmax(20rem,30%)_1fr] lg:gap-10"
  >
    <LeaderboardPanel :bests="bests" />
    <div class="flex flex-col justify-center gap-6">
      <StreakPanel :history="history" :today="today" />
      <section class="grid grid-cols-1 gap-4 sm:grid-cols-2" aria-label="Choose a mode">
        <ModeCard
          v-for="card in cards"
          :key="card.mode"
          v-bind="card"
          :goal="goals[card.mode]"
          :stat="card.mode === 'dojo' ? { label: 'Best run', value: bests.dojo } : undefined"
          @click="$emit('choose', card.mode)"
        />
      </section>
    </div>
  </div>
</template>
