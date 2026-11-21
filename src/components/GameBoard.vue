<script setup lang="ts">
/**
 * The board for one set: the word cards on top, the reading cards below
 * (L1). When a set times out, each word card shows its reading (L6).
 * While paused, tapping a word card flips it instead of selecting it (L9).
 *
 * The main way to play is to throw: pick up a reading card and let go of
 * it on, or fling it at, the word card it belongs to. Tapping one card and
 * then the other still works, for the keyboard. Each card sits in a slot
 * that never moves; useThrows measures the slots. Each row sets its cards'
 * height as a share of the window's height (--card-height), so the board
 * fits the window: big word cards on top, smaller reading cards below.
 *
 * Between the rows sits the combo (ComboMeter). Behind the cards a glow
 * warms as the combo builds, and the table jolts on each hit, harder the
 * longer the combo (useGameFeel). Picking up, aiming and throwing each
 * make a sound, so the player hears every move they make.
 */
import { useAnimate, useReducedMotion } from 'motion-v';
import { computed, watch } from 'vue';
import { readingCardStatus, wordCardStatus } from '../game/card-status.ts';
import type { CardRef, RunState } from '../game/run.ts';
import type { DeckWord } from '../deck/types.ts';
import type { TagTable } from '../game/tags.ts';
import { useGameFeel } from '../composables/useGameFeel.ts';
import { useThrows } from '../composables/useThrows.ts';
import { playSound } from '../sound/sfx.ts';
import ComboMeter from './ComboMeter.vue';
import PlayCard from './PlayCard.vue';
import type { Point } from './throw-geometry.ts';

const props = defineProps<{ state: RunState; nowMs: number; tags: TagTable }>();
const emit = defineEmits<{
  tap: [card: CardRef];
  throw: [readingIndex: number, wordId: string];
  flip: [word: DeckWord];
}>();
const { throws, targetWordId, registerWord, registerReading, trackDrag, release } = useThrows(
  () => props.state,
);
const { impact, shownCombo, brokenCombo, clearBroken } = useGameFeel(() => props.state);

/** The combo at which the glow behind the cards is at its brightest. */
const FULL_HEAT_COMBO = 15;
/** How far the table jolts on a hit, in pixels: a base, plus more per combo, up to a cap. */
const SHAKE_BASE_PX = 3;
const SHAKE_PER_COMBO_PX = 0.4;
const SHAKE_MAX_PX = 10;

const heat = computed(() => Math.min(shownCombo.value / FULL_HEAT_COMBO, 1));
const [table, animate] = useAnimate();
const isReducedMotion = useReducedMotion();

watch(impact, ({ combo }) => {
  if (isReducedMotion.value === true) return;
  const jolt = Math.min(SHAKE_BASE_PX + combo * SHAKE_PER_COMBO_PX, SHAKE_MAX_PX);
  void animate(
    table.value,
    { x: [0, -jolt, jolt, -jolt / 2, 0], y: [0, jolt / 2, 0] },
    { duration: 0.25 },
  );
});

watch(targetWordId, (wordId) => {
  if (wordId !== null) playSound('aim');
});

function onWordTap(word: DeckWord): void {
  if (props.state.pausedAtMs !== null) {
    emit('flip', word);
    return;
  }
  playSound('pickUp');
  emit('tap', { kind: 'word', wordId: word.id });
}

function onReadingTap(index: number): void {
  playSound('pickUp');
  emit('tap', { kind: 'reading', index });
}

function onRelease(readingIndex: number, point: Point, velocity: Point): void {
  const wordId = release(point, velocity);
  if (wordId === null) return;
  playSound('whoosh');
  emit('throw', readingIndex, wordId);
}
</script>

<template>
  <section ref="table" class="relative flex flex-col" aria-label="Board">
    <div
      class="table-glow pointer-events-none absolute -inset-8 -z-10 rounded-[3rem]"
      :class="{ 'animate-glow': heat >= 1 }"
      :style="{ opacity: heat }"
      aria-hidden="true"
    />
    <div class="grid grid-cols-5 gap-x-10 [--card-height:33dvh]" data-testid="word-row">
      <div v-for="(word, index) in state.set.words" :key="word.id" :ref="registerWord(word.id)">
        <PlayCard
          :text="word.word"
          kind="word"
          :index="index"
          :status="wordCardStatus(state, word.id, nowMs)"
          :tag="tags.get(word.id)"
          :hint="state.phase === 'timedOut' ? word.reading : undefined"
          :is-peeked="state.peekedWordIds.includes(word.id)"
          :is-targeted="targetWordId === word.id"
          @tap="onWordTap(word)"
        />
      </div>
    </div>
    <ComboMeter :combo="shownCombo" :broken-combo="brokenCombo" @broken-shown="clearBroken" />
    <div class="grid grid-cols-6 gap-x-8 [--card-height:25dvh]" data-testid="reading-row">
      <div
        v-for="(card, index) in state.set.readings"
        :key="card.text"
        :ref="registerReading(index)"
      >
        <PlayCard
          :text="card.text"
          kind="reading"
          :index="state.set.words.length + index"
          :status="readingCardStatus(state, index, nowMs)"
          :throw-to="throws.get(index)"
          @tap="onReadingTap(index)"
          @pick-up="playSound('pickUp')"
          @drag="trackDrag"
          @release="(point, velocity) => onRelease(index, point, velocity)"
        />
      </div>
    </div>
  </section>
</template>
