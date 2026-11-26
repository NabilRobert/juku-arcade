<script setup lang="ts">
/**
 * The start screen's choice of mode (D37), shown each time the game opens
 * (after the daily check-up) and from "Change mode": word mode, which
 * pairs words with their readings and feeds the reviews; kanji mode,
 * which is practice at finding every reading of one kanji; or Bunpou
 * (D56), which puts grammar tiles in order. The leaderboard (D47) sits on
 * the left; the streak and the play calendar (StreakPanel.vue) sit above
 * the modes.
 */
import type { Deck } from '../deck/types.ts';
import LeaderboardPanel from './LeaderboardPanel.vue';
import StreakPanel from './streak/StreakPanel.vue';
import ModeCard from './ModeCard.vue';
import type { ButtonColour } from './ui/PixelButton.vue';

export type GameMode = 'words' | 'kanji' | 'bunpou';

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
    description: 'Find every reading of one kanji among 8 cards. Practice only.',
  },
  {
    mode: 'bunpou',
    colour: 'aqua',
    name: 'Bunpou',
    example: '七時・に・起きます → 七時に起きます',
    description: `Put each ${level} sentence in order, then watch the tale. Counts toward your grammar reviews.`,
    // The grammar content is N5's only (D60); other levels are still to write.
    note: 'Only playable in N5 for now · still in development',
  },
];
defineEmits<{ choose: [mode: GameMode] }>();
</script>

<template>
  <!-- The leaderboard fills the left of the screen; the streak, then the modes, sit on the right. -->
  <div class="grid w-full flex-1 grid-cols-[minmax(20rem,30%)_1fr] gap-10">
    <LeaderboardPanel />
    <div class="flex flex-col justify-center gap-6">
      <StreakPanel :deck="deck" />
      <section class="grid grid-cols-3 gap-6" aria-label="Choose a mode">
        <ModeCard
          v-for="card in cards"
          :key="card.mode"
          v-bind="card"
          @click="$emit('choose', card.mode)"
        />
      </section>
    </div>
  </div>
</template>
