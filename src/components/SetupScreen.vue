<script setup lang="ts">
/** First launch (L15, R9): pick a JLPT level, and type a class code if the teacher gave one. */
import { ref } from 'vue';
import { JLPT_LEVELS, type JlptLevel } from '../deck/types.ts';

defineEmits<{ start: [level: JlptLevel, classCode: string | null] }>();

const classCode = ref('');
</script>

<template>
  <section class="mx-auto max-w-sm space-y-6 text-center">
    <h2 class="text-xl font-semibold">Which JLPT level are you studying?</h2>
    <div class="grid grid-cols-5 gap-2">
      <button
        v-for="level in JLPT_LEVELS"
        :key="level"
        type="button"
        class="min-h-12 washi rounded-lg font-card text-lg font-semibold text-sumi"
        @click="$emit('start', level, classCode.trim() || null)"
      >
        {{ level }}
      </button>
    </div>
    <label class="block space-y-1 text-left text-sm text-washi/80">
      <span>Class code (optional, from your teacher)</span>
      <input
        v-model="classCode"
        class="w-full rounded-lg bg-lacquer-light px-3 py-2 text-washi"
        maxlength="32"
        autocomplete="off"
      />
    </label>
    <p class="text-xs text-washi/60">Your progress stays in this browser. No account, no name.</p>
  </section>
</template>
