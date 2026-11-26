<script setup lang="ts">
/**
 * A dojo word question: the word as written, and four readings to pick
 * from. Once answered (or timed out), the right reading lights aqua and a
 * wrong pick crimson.
 */
import { ref } from 'vue';
import type { WordQuestion } from '../../dojo/dojo-questions.ts';
import PixelButton, { type ButtonColour } from '../ui/PixelButton.vue';

const props = defineProps<{ question: WordQuestion; isLocked: boolean }>();
const emit = defineEmits<{ answer: [isRight: boolean] }>();

const picked = ref<string | null>(null);

function pick(choice: string): void {
  if (props.isLocked) return;
  picked.value = choice;
  emit('answer', choice === props.question.word.reading);
}

function colourOf(choice: string): ButtonColour {
  if (!props.isLocked) return 'steel';
  if (choice === props.question.word.reading) return 'aqua';
  return choice === picked.value ? 'crimson' : 'steel';
}
</script>

<template>
  <section
    class="flex flex-col items-center gap-6"
    aria-label="Word question"
    data-testid="word-question"
  >
    <p class="text-6xl" lang="ja">{{ question.word.word }}</p>
    <div class="grid w-full max-w-lg grid-cols-2 gap-3">
      <PixelButton
        v-for="choice in question.choices"
        :key="choice"
        :colour="colourOf(choice)"
        class="py-3 text-2xl"
        lang="ja"
        :data-right="choice === question.word.reading ? '' : undefined"
        @click="pick(choice)"
      >
        {{ choice }}
      </PixelButton>
    </div>
  </section>
</template>
