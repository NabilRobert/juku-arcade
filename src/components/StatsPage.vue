<script setup lang="ts">
/**
 * The player's stats (from the event logs in this browser, memory/stats.ts
 * and grammar-stats.ts): words known, right answers today and overall,
 * best combo and best set, play today, the words missed most and the kinds
 * of mistake made most, then the same for grammar (GrammarStats.vue).
 * A plain page, like the About page.
 */
import { computed } from 'vue';
import type { Deck } from '../deck/types.ts';
import { localDay, type GameEvent } from '../game/events.ts';
import { createLocalEngine } from '../memory/review-engine.ts';
import { percentRight, playerStats } from '../memory/stats.ts';
import type { Settings } from '../memory/storage.ts';
import PixelButton from './ui/PixelButton.vue';
import StatPanel from './ui/StatPanel.vue';
import { readBestScore } from '../bank-run/useBankRun.ts';
import type { GrammarEvent } from '../grammar/grammar-events.ts';
import GrammarStats from './GrammarStats.vue';
import RankedList from './ui/RankedList.vue';

const props = defineProps<{
  deck: Deck;
  settings: Settings;
  events: readonly GameEvent[];
  grammarEvents: readonly GrammarEvent[];
}>();
defineEmits<{ close: [] }>();

const MS_PER_MINUTE = 60_000;

const today = localDay(new Date());
const stats = computed(() => playerStats(props.events, props.deck.words, today));
const progress = computed(() =>
  createLocalEngine(props.deck.words, props.events).getProgress(today),
);
const minutesToday = computed(() =>
  props.settings.playDay === today ? Math.round(props.settings.playMsToday / MS_PER_MINUTE) : 0,
);

const missedWords = computed(() =>
  stats.value.mostMissed.map((word) => ({ key: word.word, count: word.misses })),
);
const mistakeKinds = computed(() =>
  stats.value.mistakes.map((mistake) => ({ key: mistake.name, count: mistake.count })),
);
const readingOf = (word: string): string =>
  stats.value.mostMissed.find((missed) => missed.word === word)?.reading ?? '';

const tiles = computed(() => [
  {
    label: `Words known (${props.deck.level})`,
    value: `${progress.value.wordsKnown} / ${progress.value.deckSize}`,
  },
  {
    label: 'Right today',
    value: percentRight(stats.value.today),
    note: `${stats.value.today.right} right`,
  },
  {
    label: 'Right overall',
    value: percentRight(stats.value.allTime),
    note: `${stats.value.allTime.right} right`,
  },
  { label: 'Best combo', value: String(props.settings.bestCombo) },
  { label: 'Best score', value: String(readBestScore()) },
  { label: 'Played today', value: `${minutesToday.value} min` },
  { label: 'Sets played', value: String(stats.value.setsPlayed) },
  { label: 'Days played', value: String(stats.value.daysPlayed) },
]);
</script>

<template>
  <article class="mx-auto w-full max-w-3xl space-y-5 text-washi/90" aria-label="Your stats">
    <h2 class="text-xl font-semibold">Your stats</h2>
    <div class="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <StatPanel v-for="tile in tiles" :key="tile.label" :label="tile.label" :note="tile.note">
        <span class="block text-2xl font-bold">{{ tile.value }}</span>
      </StatPanel>
    </div>
    <div class="grid gap-3 sm:grid-cols-2">
      <RankedList title="Missed most" :items="missedWords" empty-text="No misses yet." unit="×">
        <template #default="{ item }">
          <span lang="ja"
            >{{ item.key }} <span class="text-washi/60">{{ readingOf(item.key) }}</span></span
          >
        </template>
      </RankedList>
      <RankedList title="Mistakes by kind" :items="mistakeKinds" empty-text="No mistakes yet." />
    </div>
    <GrammarStats :events="grammarEvents" :today="today" />
    <p class="text-xs text-washi/60">
      From what you've played in this browser. Kanji mode and practice mode aren't counted.
    </p>
    <PixelButton colour="steel" class="px-4 py-2" @click="$emit('close')">
      Back to the game
    </PixelButton>
  </article>
</template>
