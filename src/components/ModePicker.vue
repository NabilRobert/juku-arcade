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
import { isLeaderboardFolded } from '../preferences/folded-panels.ts';
import { grammarGoal, kanjiGoal, wordGoal, type LevelGoal } from '../memory/level-goals.ts';
import { MODE_NAMES, type PlayMode } from '../memory/play-log.ts';
import LeaderboardPanel from './LeaderboardPanel.vue';
import StreakPanel from './streak/StreakPanel.vue';
import ModeCard from './ModeCard.vue';
import SettingsButton from './ui/SettingsButton.vue';
import type { ButtonColour } from './ui/PixelButton.vue';

const props = defineProps<{ deck: Deck }>();

interface Card {
  mode: PlayMode;
  colour: ButtonColour;
  name: string;
  example: string;
  description: string;
  note?: string;
}

const level = props.deck.level;
const { history, today } = usePlayHistory(props.deck);
/** The kanji goal counts the level's official kanji list only (D67), not every kanji its words use. */
const levelKanji = [...kanjiPool(props.deck).levelList];
const goals = computed<Partial<Record<PlayMode, LevelGoal>>>(() => ({
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
    name: MODE_NAMES.words,
    example: '学校 → がっこう',
    description: `Match each ${level} word to its reading. Counts toward your reviews.`,
  },
  {
    mode: 'kanji',
    colour: 'steel',
    name: MODE_NAMES.kanji,
    example: '生 → セイ・う(まれる)…',
    description: "Find every reading of a kanji among 8 cards. Doesn't count toward your reviews.",
  },
  {
    mode: 'bunpou',
    colour: 'aqua',
    name: MODE_NAMES.bunpou,
    example: '行く・駅・に → 駅に行く',
    description: 'Put each sentence in order, then watch the tale. Counts toward grammar reviews.',
    // The grammar content is N5's only (D60); other levels are still to write.
    note: 'N5 only for now · still in development',
  },
  {
    mode: 'dojo',
    colour: 'paper',
    name: MODE_NAMES.dojo,
    example: '提灯 ×3',
    description: "Words, kanji and grammar you've met, until three misses. Ranked.",
  },
];
defineEmits<{ choose: [mode: PlayMode] }>();
</script>

<template>
  <!-- The leaderboard fills the left of the screen, the streak then the modes on the right; on a phone or a tablet they stack in that order, leaderboard on top. Folded, the leaderboard is a bar across the top instead. -->
  <div
    class="flex w-full flex-1 flex-col gap-6 lg:grid lg:gap-10"
    :class="
      isLeaderboardFolded
        ? 'lg:grid-cols-1 lg:content-start'
        : 'lg:grid-cols-[minmax(20rem,30%)_1fr]'
    "
  >
    <!-- On a phone or a tablet, Settings is at the top too, not only in the footer under the long page. -->
    <div class="flex justify-end lg:hidden">
      <SettingsButton />
    </div>
    <LeaderboardPanel :bests="bests" />
    <div class="flex flex-col justify-center gap-6">
      <StreakPanel :history="history" :today="today" :kanji-notes="deck.kanji" />
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
