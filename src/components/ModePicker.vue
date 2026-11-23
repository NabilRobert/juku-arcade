<script setup lang="ts">
/**
 * The start screen's choice of mode (D37), shown each time the game opens
 * (after the daily check-up) and from "Change mode": word mode, which
 * pairs words with their readings and feeds the reviews, or kanji mode,
 * which is practice at finding every reading of one kanji. The
 * leaderboard (D47) sits on the left.
 */
import LeaderboardPanel from './LeaderboardPanel.vue';
import PixelButton from './ui/PixelButton.vue';

export type GameMode = 'words' | 'kanji';

defineProps<{ level: string }>();
defineEmits<{ choose: [mode: GameMode] }>();
</script>

<template>
  <div class="mx-auto my-auto grid w-full max-w-5xl grid-cols-[16rem_1fr] items-center gap-8">
    <LeaderboardPanel />
    <section class="grid grid-cols-2 gap-6" aria-label="Choose a mode">
      <PixelButton
        colour="crimson"
        class="flex flex-col gap-2 p-6 text-left"
        @click="$emit('choose', 'words')"
      >
        <span class="block text-2xl font-bold">Words</span>
        <span class="block text-sm text-washi/80" lang="ja">学校 → がっこう</span>
        <span class="block text-sm text-washi/80">
          Match each {{ level }} word to its reading. Counts toward your reviews.
        </span>
      </PixelButton>
      <PixelButton
        colour="steel"
        class="flex flex-col gap-2 p-6 text-left"
        @click="$emit('choose', 'kanji')"
      >
        <span class="block text-2xl font-bold">Kanji</span>
        <span class="block text-sm text-washi/80" lang="ja">生 → セイ・う(まれる)…</span>
        <span class="block text-sm text-washi/80">
          Find every reading of one kanji among 8 cards. Practice only.
        </span>
      </PixelButton>
    </section>
  </div>
</template>
