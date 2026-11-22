<script setup lang="ts">
/**
 * The player's stats (from the event log in this browser, memory/stats.ts):
 * words known, right answers today and overall, best combo and best set,
 * play today, the words missed most and the kinds of mistake made most.
 * A plain page, like the About page.
 */
import { computed } from 'vue';
import type { Deck } from '../deck/types.ts';
import { localDay, type GameEvent } from '../game/events.ts';
import { createLocalEngine } from '../memory/review-engine.ts';
import { accuracy, playerStats, type AnswerCounts } from '../memory/stats.ts';
import type { Settings } from '../memory/storage.ts';
import PixelButton from './PixelButton.vue';

const props = defineProps<{ deck: Deck; settings: Settings; events: readonly GameEvent[] }>();
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

function percent(counts: AnswerCounts): string {
  const share = accuracy(counts);
  return share === null ? '–' : `${Math.round(share * 100)}%`;
}

const tiles = computed(() => [
  {
    label: `Words known (${props.deck.level})`,
    value: `${progress.value.wordsKnown} / ${progress.value.deckSize}`,
  },
  {
    label: 'Right today',
    value: percent(stats.value.today),
    note: `${stats.value.today.right} right`,
  },
  {
    label: 'Right overall',
    value: percent(stats.value.allTime),
    note: `${stats.value.allTime.right} right`,
  },
  { label: 'Best combo', value: String(props.settings.bestCombo) },
  { label: 'Best set', value: String(props.settings.bestSetScore) },
  { label: 'Played today', value: `${minutesToday.value} min` },
  { label: 'Sets played', value: String(stats.value.setsPlayed) },
  { label: 'Days played', value: String(stats.value.daysPlayed) },
]);
</script>

<template>
  <article class="mx-auto w-full max-w-3xl space-y-5 text-washi/90" aria-label="Your stats">
    <h2 class="text-xl font-semibold">Your stats</h2>
    <div class="grid grid-cols-4 gap-3">
      <p v-for="tile in tiles" :key="tile.label" class="pixel-panel bg-wood/80 p-3 text-center">
        <span class="block text-xs tracking-widest text-aqua/80 uppercase">{{ tile.label }}</span>
        <span class="block text-2xl font-bold">{{ tile.value }}</span>
        <span v-if="tile.note" class="block text-xs text-washi/60">{{ tile.note }}</span>
      </p>
    </div>
    <div class="grid grid-cols-2 gap-3">
      <section class="pixel-panel bg-wood/80 p-3">
        <h3 class="mb-2 text-xs tracking-widest text-aqua/80 uppercase">Missed most</h3>
        <ol v-if="stats.mostMissed.length" class="space-y-1">
          <li v-for="word in stats.mostMissed" :key="word.word" class="flex justify-between gap-3">
            <span lang="ja"
              >{{ word.word }} <span class="text-washi/60">{{ word.reading }}</span></span
            >
            <span class="text-washi/60">{{ word.misses }}×</span>
          </li>
        </ol>
        <p v-else class="text-sm text-washi/60">No misses yet.</p>
      </section>
      <section class="pixel-panel bg-wood/80 p-3">
        <h3 class="mb-2 text-xs tracking-widest text-aqua/80 uppercase">Mistakes by kind</h3>
        <ol v-if="stats.mistakes.length" class="space-y-1">
          <li
            v-for="mistake in stats.mistakes"
            :key="mistake.name"
            class="flex justify-between gap-3"
          >
            <span>{{ mistake.name }}</span>
            <span class="text-washi/60">{{ mistake.count }}</span>
          </li>
        </ol>
        <p v-else class="text-sm text-washi/60">No mistakes yet.</p>
      </section>
    </div>
    <p class="text-xs text-washi/60">
      From what you've played in this browser. Kanji mode is practice and isn't counted.
    </p>
    <PixelButton colour="steel" class="px-4 py-2" @click="$emit('close')">
      Back to the game
    </PixelButton>
  </article>
</template>
