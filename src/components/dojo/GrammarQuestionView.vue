<script setup lang="ts">
/**
 * A dojo grammar question: one Bunpou sentence to put in order, on
 * Bunpou's own board and rules (bunpou-run.ts). Filling the last box
 * judges it. It isn't timed (D69), so the board shows no timer. The
 * dojo's pause pauses the line too.
 */
import { computed, shallowRef, watch } from 'vue';
import type { GrammarQuestion } from '../../dojo/dojo-questions.ts';
import * as rules from '../../grammar/bunpou-run.ts';
import BunpouBoard from '../bunpou/BunpouBoard.vue';

const props = defineProps<{
  question: GrammarQuestion;
  isPaused: boolean;
}>();
const emit = defineEmits<{ answer: [isRight: boolean]; pause: []; resume: [] }>();

const run = shallowRef(rules.startBunpouRun(props.question.tale, Date.now(), Math.random));
const unplaced = computed(() =>
  run.value.offered.filter((tile) => !run.value.boxes.includes(tile)),
);

watch(
  () => run.value.phase,
  (phase) => {
    if (phase === 'judged') emit('answer', run.value.results.at(-1)?.isRight === true);
  },
);
watch(
  () => props.isPaused,
  (isPaused) => {
    const nowMs = Date.now();
    run.value = isPaused ? rules.pause(run.value, nowMs) : rules.resume(run.value, nowMs);
  },
);
</script>

<template>
  <BunpouBoard
    :run="run"
    :unplaced="unplaced"
    data-testid="grammar-question"
    @place="(tile, at) => (run = rules.placeTile(run, tile, at))"
    @take-back="(tile) => (run = rules.takeBack(run, tile))"
    @pause="emit('pause')"
    @resume="emit('resume')"
  />
</template>
