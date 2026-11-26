<script setup lang="ts">
/**
 * The dojo's question on the table, shown by its kind: a word or a kanji
 * on kanji mode's card board (CardQuestionView), or a grammar sentence on
 * Bunpou's tile board (GrammarQuestionView).
 */
import { computed } from 'vue';
import type { JlptLevel } from '../../deck/types.ts';
import { roundOfWord, type DojoQuestion } from '../../dojo/dojo-questions.ts';
import CardQuestionView from './CardQuestionView.vue';
import GrammarQuestionView from './GrammarQuestionView.vue';

const props = defineProps<{
  question: DojoQuestion;
  level: JlptLevel;
  combo: number;
  isLocked: boolean;
  isPaused: boolean;
}>();
const emit = defineEmits<{ answer: [isRight: boolean]; pause: []; resume: [] }>();

const cardRound = computed(() => {
  if (props.question.kind === 'word') return roundOfWord(props.question);
  if (props.question.kind === 'kanji') return props.question.round;
  return null;
});
</script>

<template>
  <CardQuestionView
    v-if="cardRound"
    :round="cardRound"
    :level="level"
    :combo="combo"
    :is-locked="isLocked"
    :data-testid="`${question.kind}-question`"
    @answer="emit('answer', $event)"
  />
  <GrammarQuestionView
    v-else-if="question.kind === 'grammar'"
    :question="question"
    :is-paused="isPaused"
    @answer="emit('answer', $event)"
    @pause="emit('pause')"
    @resume="emit('resume')"
  />
</template>
