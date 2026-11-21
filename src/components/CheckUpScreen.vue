<script setup lang="ts">
/**
 * The optional daily check-up (C1): offered once a day, easy to skip. Each
 * question shows a word and 4 readings, with 8 seconds to answer; running
 * out of time counts as wrong. Emits the answers as events when done.
 */
import { computed, onUnmounted, ref } from 'vue';
import type { GameEvent, SessionIdentity } from '../game/events.ts';
import { checkUpEvent, SECONDS_PER_QUESTION, type Question } from '../memory/check-up.ts';

const props = defineProps<{ questions: readonly Question[]; identity: SessionIdentity }>();
const emit = defineEmits<{ done: [events: GameEvent[]]; skip: [] }>();

const TICK_MS = 100;
const QUESTION_MS = SECONDS_PER_QUESTION * 1000;

const index = ref(-1);
const shownAtMs = ref(0);
const nowMs = ref(0);
const answers: GameEvent[] = [];
let timer: ReturnType<typeof setInterval> | undefined;

const question = computed(() => props.questions[index.value]);
const timeShare = computed(() => Math.max(0, 1 - (nowMs.value - shownAtMs.value) / QUESTION_MS));

function showNext(): void {
  index.value += 1;
  if (index.value >= props.questions.length) {
    clearInterval(timer);
    emit('done', answers);
    return;
  }
  shownAtMs.value = Date.now();
  nowMs.value = shownAtMs.value;
}

function answer(chosen: string | null): void {
  const current = question.value;
  if (current === undefined) return;
  answers.push(
    checkUpEvent(props.identity, current, chosen, Date.now() - shownAtMs.value, new Date()),
  );
  showNext();
}

function start(): void {
  showNext();
  timer = setInterval(() => {
    nowMs.value = Date.now();
    if (nowMs.value - shownAtMs.value >= QUESTION_MS) answer(null);
  }, TICK_MS);
}

onUnmounted(() => clearInterval(timer));
</script>

<template>
  <section class="mx-auto w-full max-w-md space-y-5 text-center" aria-label="Daily check-up">
    <template v-if="index < 0">
      <h2 class="font-card text-2xl font-semibold text-gold">Daily check-up</h2>
      <p class="text-washi/80">
        {{ questions.length }} quick questions, about a minute. It shows what's sticking. It doesn't
        change your score or your reviews.
      </p>
      <div class="flex justify-center gap-3">
        <button
          type="button"
          class="min-h-11 rounded-lg bg-vermilion px-5 text-washi"
          @click="start"
        >
          Start
        </button>
        <button
          type="button"
          class="min-h-11 rounded-lg bg-pine px-5 text-washi"
          @click="emit('skip')"
        >
          Skip today
        </button>
      </div>
    </template>
    <template v-else-if="question">
      <p class="text-sm text-washi/60">{{ index + 1 }} / {{ questions.length }}</p>
      <p
        class="washi mx-auto w-48 rounded-lg border-2 border-vermilion/70 py-6 font-card text-4xl font-semibold text-sumi"
        lang="ja"
      >
        {{ question.word.word }}
      </p>
      <div
        class="h-2 overflow-hidden rounded-full bg-lacquer"
        role="progressbar"
        aria-label="Time left"
      >
        <div class="h-full bg-gold" :style="{ width: `${timeShare * 100}%` }" />
      </div>
      <div class="grid grid-cols-2 gap-3">
        <button
          v-for="option in question.options"
          :key="option"
          type="button"
          class="washi min-h-14 rounded-lg border-2 border-pine/70 font-card text-xl text-sumi"
          lang="ja"
          @click="answer(option)"
        >
          {{ option }}
        </button>
      </div>
    </template>
  </section>
</template>
