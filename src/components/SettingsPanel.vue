<script setup lang="ts">
/**
 * Settings (N5, L15): the anonymous player ID (to tell a teacher, if the
 * school asks), the level, and "Delete my data".
 */
import { JLPT_LEVELS, type JlptLevel } from '../deck/types.ts';
import type { Settings } from '../memory/storage.ts';

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
      <code class="rounded bg-lacquer-light px-1 break-all">{{ settings.playerId }}</code>
      <span v-if="settings.classCode"> · class {{ settings.classCode }}</span>
    </p>
    <div class="space-y-2">
      <p class="text-sm">Level (your progress at each level is kept)</p>
      <div class="flex gap-2">
        <button
          v-for="level in JLPT_LEVELS"
          :key="level"
          type="button"
          class="min-h-11 rounded-lg px-3 font-semibold"
          :class="level === settings.level ? 'bg-gold text-sumi' : 'bg-pine'"
          @click="emit('changeLevel', level)"
        >
          {{ level }}
        </button>
      </div>
    </div>
    <div class="space-y-2">
      <button
        type="button"
        class="rounded-lg bg-gold px-4 py-2 text-sumi"
        @click="emit('exportData')"
      >
        Export my data
      </button>
      <p class="text-sm text-washi/70">
        Downloads a file with your anonymous player ID, class code, and every answer with its
        timing. No name, and nothing is sent anywhere. Give it to your teacher only if you want to.
      </p>
    </div>
    <button type="button" class="rounded-lg bg-vermilion px-4 py-2" @click="confirmDelete">
      Delete my data
    </button>
    <button type="button" class="block rounded-lg bg-pine px-4 py-2" @click="emit('close')">
      Back to the game
    </button>
  </section>
</template>
