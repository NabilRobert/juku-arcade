<script setup lang="ts">
/**
 * Settings (N5, L15): the anonymous player ID (to tell a teacher, if the
 * school asks), the level, sound, furigana, Bunpou's hint, and "Delete my
 * data".
 */
import { JLPT_LEVELS, type JlptLevel } from '../deck/types.ts';
import type { Settings } from '../memory/storage.ts';
import { isFuriganaShown, setFuriganaShown } from '../preferences/furigana.ts';
import { areHintsShown, setHintsShown } from '../preferences/hints.ts';
import OnOffButton from './ui/OnOffButton.vue';
import PixelButton from './ui/PixelButton.vue';
import SoundSliders from './ui/SoundSliders.vue';

defineProps<{ settings: Settings }>();
const emit = defineEmits<{
  changeLevel: [level: JlptLevel];
  exportData: [];
  deleteData: [];
  close: [];
}>();

function confirmDelete(): void {
  const isSure = window.confirm(
    'Delete all your progress in this browser? Your words, bests and history will be gone for good.',
  );
  if (isSure) emit('deleteData');
}
</script>

<template>
  <section class="mx-auto max-w-prose space-y-5 text-washi/90">
    <h2 class="text-xl font-semibold">Settings</h2>
    <p class="text-sm">
      Your anonymous player ID:
      <code class="bg-lacquer-light px-1 break-all">{{ settings.playerId }}</code>
      <span v-if="settings.classCode"> · class {{ settings.classCode }}</span>
    </p>
    <div class="space-y-2">
      <p class="text-sm">Level (your progress at each level is kept)</p>
      <div class="flex gap-2">
        <PixelButton
          v-for="level in JLPT_LEVELS"
          :key="level"
          :colour="level === settings.level ? 'aqua' : 'steel'"
          class="min-h-11 px-3 font-semibold"
          @click="emit('changeLevel', level)"
        >
          {{ level }}
        </PixelButton>
      </div>
    </div>
    <div class="max-w-xs space-y-2">
      <p class="text-sm">Volume</p>
      <SoundSliders />
    </div>
    <div class="space-y-2">
      <p class="text-sm">Furigana: readings over kanji, in every mode but Kanji</p>
      <OnOffButton
        label="Furigana"
        :is-on="isFuriganaShown"
        data-testid="furigana-toggle"
        @change="setFuriganaShown"
      />
    </div>
    <div class="space-y-2">
      <p class="text-sm">Bunpou hint: shows each sentence's grammar point, like 人＋と</p>
      <OnOffButton label="Hints" :is-on="areHintsShown" @change="setHintsShown" />
    </div>
    <div class="space-y-2">
      <PixelButton colour="aqua" class="px-4 py-2" @click="emit('exportData')">
        Export my data
      </PixelButton>
      <p class="text-sm text-washi/70">
        Downloads a file with your anonymous player ID, class code, and every answer with its
        timing. No name, and nothing is sent anywhere. Give it to your teacher only if you want to.
      </p>
    </div>
    <PixelButton colour="crimson" class="px-4 py-2" @click="confirmDelete">
      Delete my data
    </PixelButton>
    <PixelButton colour="steel" class="block px-4 py-2" @click="emit('close')">
      Back to the game
    </PixelButton>
  </section>
</template>
