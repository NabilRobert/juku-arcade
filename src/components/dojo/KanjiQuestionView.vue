<script setup lang="ts">
/**
 * A dojo kanji question: one kanji and eight readings. The player picks
 * every reading that belongs to it, then presses Play; it's right only
 * with every right reading and no wrong one. Once answered (or timed out),
 * the right readings light aqua and wrong picks crimson.
 */
import { computed, ref } from 'vue';
import type { KanjiQuestion } from '../../dojo/dojo-questions.ts';
import PixelButton, { type ButtonColour } from '../ui/PixelButton.vue';

const props = defineProps<{ question: KanjiQuestion; isLocked: boolean }>();
const emit = defineEmits<{ answer: [isRight: boolean] }>();

const picked = ref<number[]>([]);
const cards = computed(() => props.question.round.cards);

function toggle(index: number): void {
  if (props.isLocked) return;
  const isPicked = picked.value.includes(index);
  picked.value = isPicked ? picked.value.filter((i) => i !== index) : [...picked.value, index];
}

function play(): void {
  if (props.isLocked || picked.value.length === 0) return;
  const rights = cards.value.flatMap((card, index) => (card.isRight ? [index] : []));
  const isPerfect =
    picked.value.length === rights.length && rights.every((index) => picked.value.includes(index));
  emit('answer', isPerfect);
}

function colourOf(index: number): ButtonColour {
  const isPicked = picked.value.includes(index);
  if (!props.isLocked) return isPicked ? 'paper' : 'steel';
  if (cards.value[index]?.isRight === true) return 'aqua';
  return isPicked ? 'crimson' : 'steel';
}
</script>

<template>
  <section
    class="flex flex-col items-center gap-6"
    aria-label="Kanji question"
    data-testid="kanji-question"
  >
    <p class="text-7xl" lang="ja">{{ question.round.kanji }}</p>
    <div class="grid w-full max-w-2xl grid-cols-4 gap-3">
      <PixelButton
        v-for="(card, index) in cards"
        :key="index"
        :colour="colourOf(index)"
        class="py-3 text-xl"
        lang="ja"
        :aria-pressed="picked.includes(index)"
        @click="toggle(index)"
      >
        {{ card.text }}
      </PixelButton>
    </div>
    <PixelButton
      colour="crimson"
      class="px-8 py-2 font-bold"
      :disabled="isLocked || picked.length === 0"
      data-testid="kanji-play"
      @click="play"
    >
      Play
    </PixelButton>
  </section>
</template>
