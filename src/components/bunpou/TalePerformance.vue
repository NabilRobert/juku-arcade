<script setup lang="ts">
/**
 * The tale, performed after its last line (D58): the storyteller unrolls
 * the slips and tells the lines in order, exactly as built: a right line
 * with the fan raised, a wrong one with a trip and its fix, a forgotten one
 * with えーと…. Then the crowd reacts (performance.ts). Skip jumps to the
 * reaction; then the next tale, or the chapter's scroll after every third.
 */
import { nextTick, useTemplateRef, watch } from 'vue';
import type { LineResult } from '../../grammar/bunpou-run.ts';
import { CROWD_SHOUTS } from '../../grammar/performance.ts';
import { usePerformance } from '../../grammar/usePerformance.ts';
import PixelButton from '../ui/PixelButton.vue';
import StoryStage from './StoryStage.vue';
import TaleLines from './TaleLines.vue';

const props = defineProps<{
  results: readonly LineResult[];
  /** The combo as the tale ends: an S rank or above makes a roar louder. */
  combo: number;
  /** This tale ends a chapter, so the next step is the scroll. */
  endsChapter: boolean;
}>();
defineEmits<{ next: [] }>();

const { told, isFinished, reaction, isLouder, pose, bubble, skip } = usePerformance(
  props.results,
  props.combo,
);

/** The told lines scroll inside their panel, so the buttons stay on screen; the newest stays in view. */
const linesBox = useTemplateRef<HTMLElement>('linesBox');
watch(told, async () => {
  await nextTick();
  linesBox.value?.scrollTo({ top: linesBox.value.scrollHeight });
});
</script>

<template>
  <section class="flex flex-col gap-4" :aria-label="$t('bunpou.tale')" data-testid="tale">
    <StoryStage
      :pose="pose"
      :slips="results.length - told"
      :bubble="bubble"
      :is-crowd-laughing="isFinished && (reaction === 'roar' || reaction === 'laugh')"
      :is-phone-out="isFinished && reaction === 'silence'"
      :shout="isFinished ? CROWD_SHOUTS[reaction] : null"
      :is-shout-loud="isLouder"
    />
    <div class="pixel-panel flex flex-col gap-4 bg-wood/80 p-6">
      <div ref="linesBox" class="max-h-[36svh] overflow-y-auto">
        <TaleLines :results="results.slice(0, told)" />
      </div>
      <div class="flex items-center justify-between">
        <p v-if="isFinished" class="text-sm text-washi/70" data-testid="tale-score">
          ◯ {{ results.filter((result) => result.isRight).length }} / {{ results.length }}
        </p>
        <PixelButton
          v-if="!isFinished"
          colour="steel"
          class="ml-auto px-6 py-2"
          data-testid="skip"
          @click="skip"
        >
          {{ $t('bunpou.skip') }}
        </PixelButton>
        <PixelButton
          v-else
          colour="aqua"
          class="px-6 py-2 font-bold"
          data-testid="next-tale"
          @click="$emit('next')"
        >
          {{ endsChapter ? $t('bunpou.readChapter') : $t('bunpou.nextTale') }}
        </PixelButton>
      </div>
    </div>
  </section>
</template>
