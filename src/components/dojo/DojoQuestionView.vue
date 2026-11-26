<script setup lang="ts">
/** The dojo's question on the table, shown by its kind: a word, a kanji or a grammar sentence. */
import type { DojoQuestion } from '../../dojo/dojo-questions.ts';
import GrammarQuestionView from './GrammarQuestionView.vue';
import KanjiQuestionView from './KanjiQuestionView.vue';
import WordQuestionView from './WordQuestionView.vue';

defineProps<{ question: DojoQuestion; isLocked: boolean; isPaused: boolean; timeLeft: number }>();
const emit = defineEmits<{ answer: [isRight: boolean]; pause: []; resume: [] }>();
</script>

<template>
  <WordQuestionView
    v-if="question.kind === 'word'"
    :question="question"
    :is-locked="isLocked"
    @answer="emit('answer', $event)"
  />
  <KanjiQuestionView
    v-else-if="question.kind === 'kanji'"
    :question="question"
    :is-locked="isLocked"
    @answer="emit('answer', $event)"
  />
  <GrammarQuestionView
    v-else
    :question="question"
    :is-locked="isLocked"
    :is-paused="isPaused"
    :time-left="timeLeft"
    @answer="emit('answer', $event)"
    @pause="emit('pause')"
    @resume="emit('resume')"
  />
</template>
