<script setup lang="ts">
/**
 * The leaderboard on the start screen (D47): the top scores, with your
 * best from this browser among them. The other players are samples until
 * there's a server to share real scores, and the panel says so.
 */
import { computed } from 'vue';
import { readBestScore } from '../bank-run/useBankRun.ts';
import { leaderboard } from '../leaderboard/leaderboard.ts';
import PixelIcon from './ui/PixelIcon.vue';

const rows = computed(() => leaderboard(readBestScore()));
</script>

<template>
  <section class="pixel-panel flex flex-col gap-4 bg-wood/80 p-6" aria-label="Leaderboard">
    <h2 class="text-center text-2xl tracking-widest text-aqua uppercase">Leaderboard</h2>
    <ol class="flex flex-1 flex-col justify-around gap-1 text-xl">
      <li
        v-for="row in rows"
        :key="row.name"
        class="flex items-center gap-3 px-3 py-2"
        :class="row.isYou ? 'bg-aqua text-sumi' : ''"
        :data-testid="row.isYou ? 'leaderboard-you' : undefined"
      >
        <span class="w-8 text-right text-washi/60" :class="row.isYou ? 'text-sumi/70' : ''">
          {{ row.rank }}
        </span>
        <span class="flex-1">{{ row.name }}</span>
        <span class="inline-flex items-center gap-1 font-bold">
          <PixelIcon name="coin" /> {{ row.score }}
        </span>
      </li>
    </ol>
    <p class="text-center text-sm text-washi/60">Sample players for now.</p>
  </section>
</template>
