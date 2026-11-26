<script setup lang="ts">
/** W1: a friendly suggestion to stop, after 15 and 30 minutes of play. Easy to dismiss. */
import PixelButton from './ui/PixelButton.vue';
defineProps<{ minutes: number }>();
defineEmits<{ stop: []; keepGoing: [] }>();
</script>

<template>
  <section class="pixel-panel washi p-4 text-center text-sumi" role="status">
    <p class="text-lg font-semibold">
      {{ $t('pages.wellbeing.nudge', { minutes }) }}
    </p>
    <p class="mt-1 text-sm text-sumi/70">{{ $t('pages.wellbeing.nudgeNote') }}</p>
    <div class="mt-3 flex justify-center gap-3">
      <PixelButton colour="crimson" class="min-h-11 px-4" @click="$emit('stop')">
        {{ $t('pages.wellbeing.stop') }}
      </PixelButton>
      <PixelButton colour="steel" class="min-h-11 px-4" @click="$emit('keepGoing')">
        {{ $t('pages.wellbeing.keepGoing') }}
      </PixelButton>
    </div>
  </section>
</template>
