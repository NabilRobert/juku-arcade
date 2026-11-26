<script setup lang="ts">
/** First launch (L15, R9): pick a JLPT level, and type a class code if the teacher gave one. */
import { ref } from 'vue';
import { JLPT_LEVELS, type JlptLevel } from '../deck/types.ts';
import PixelButton from './ui/PixelButton.vue';

defineEmits<{ start: [level: JlptLevel, classCode: string | null] }>();

const classCode = ref('');
</script>

<template>
  <section class="mx-auto max-w-sm space-y-6 text-center">
    <h2 class="text-xl font-semibold">{{ $t('menu.setup.question') }}</h2>
    <div class="grid grid-cols-5 gap-2">
      <PixelButton
        v-for="level in JLPT_LEVELS"
        :key="level"
        colour="paper"
        class="min-h-12 text-lg font-semibold"
        @click="$emit('start', level, classCode.trim() || null)"
      >
        {{ level }}
      </PixelButton>
    </div>
    <label class="block space-y-1 text-left text-sm text-washi/80">
      <span>{{ $t('menu.setup.classCode') }}</span>
      <input
        v-model="classCode"
        class="pixel-panel w-full bg-lacquer-light px-3 py-2 text-washi"
        maxlength="32"
        autocomplete="off"
      />
    </label>
    <p class="text-xs text-washi/60">{{ $t('menu.setup.privacy') }}</p>
  </section>
</template>
