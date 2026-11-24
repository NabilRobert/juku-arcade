<script setup lang="ts">
/**
 * The start screen's choice of mode (D37), shown each time the game opens
 * (after the daily check-up) and from "Change mode": word mode, which
 * pairs words with their readings and feeds the reviews; kanji mode,
 * which is practice at finding every reading of one kanji; or Bunpou
 * (D56), which puts grammar tiles in order. The leaderboard (D47) sits on
 * the left.
 */
import LeaderboardPanel from './LeaderboardPanel.vue';
import PixelButton from './ui/PixelButton.vue';

export type GameMode = 'words' | 'kanji' | 'bunpou';

defineProps<{ level: string }>();
defineEmits<{ choose: [mode: GameMode] }>();
</script>

<template>
  <!-- The leaderboard fills the left of the screen; the modes sit centred on the right. -->
  <div class="grid w-full flex-1 grid-cols-[minmax(20rem,30%)_1fr] gap-10">
    <LeaderboardPanel />
    <section class="grid grid-cols-3 gap-6 self-center" aria-label="Choose a mode">
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
      <PixelButton
        colour="aqua"
        class="flex flex-col gap-2 p-6 text-left"
        @click="$emit('choose', 'bunpou')"
      >
        <span class="block text-2xl font-bold">Bunpou</span>
        <span class="block text-sm text-sumi/80" lang="ja"
          >七時・に・起きます → 七時に起きます</span
        >
        <span class="block text-sm text-sumi/80">
          Put each {{ level }} sentence in order, then watch the tale. Counts toward your grammar
          reviews.
        </span>
      </PixelButton>
    </section>
  </div>
</template>
