<script setup lang="ts">
/**
 * The optional daily check-up (C1): offered once a day, easy to skip. Each
 * question shows a word and 4 readings, with 8 seconds to answer; running
 * out of time counts as wrong. Emits the answers as events when done.
 */
import { CLOCK_TICK_MS } from '../game/tuning.ts';
import TimerBar from './ui/TimerBar.vue';
import { computed, onUnmounted, ref } from 'vue';
import type { GameEvent, SessionIdentity } from '../game/events.ts';
import { checkUpEvent, SECONDS_PER_QUESTION, type Question } from '../memory/check-up.ts';
import PixelButton from './ui/PixelButton.vue';

const props = defineProps<{ questions: readonly Question[]; identity: SessionIdentity }>();
const emit = defineEmits<{ done: [events: GameEvent[]]; skip: [] }>();

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
  }, CLOCK_TICK_MS);
}

onUnmounted(() => clearInterval(timer));
</script>

<template>
  <section
    class="mx-auto w-full max-w-md space-y-5 text-center"
    :aria-label="$t('pages.checkUp.title')"
  >
    <template v-if="index < 0">
      <h2 class="text-2xl font-semibold text-aqua">{{ $t('pages.checkUp.title') }}</h2>
      <p class="text-washi/80">
        {{ $t('pages.checkUp.intro', { count: questions.length }) }}
      </p>
      <div class="flex justify-center gap-3">
        <PixelButton colour="crimson" class="min-h-11 px-5" @click="start">
          {{ $t('pages.checkUp.start') }}
        </PixelButton>
        <PixelButton colour="steel" class="min-h-11 px-5" @click="emit('skip')">
          {{ $t('pages.checkUp.skip') }}
        </PixelButton>
      </div>
    </template>
    <template v-else-if="question">
      <p class="text-sm text-washi/60">{{ index + 1 }} / {{ questions.length }}</p>
      <p class="pixel-panel washi mx-auto w-48 py-6 text-4xl font-semibold text-sumi" lang="ja">
        {{ question.word.word }}
      </p>
      <TimerBar :time-left="timeShare" :label="$t('pages.checkUp.timeLeft')" />
      <div class="grid grid-cols-2 gap-3">
        <PixelButton
          v-for="option in question.options"
          :key="option"
          colour="paper"
          class="min-h-14 text-xl"
          lang="ja"
          @click="answer(option)"
        >
          {{ option }}
        </PixelButton>
      </div>
    </template>
  </section>
</template>
