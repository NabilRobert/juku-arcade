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
 */
import { readingCardStatus, wordCardStatus } from '../game/card-status.ts';
import type { CardRef, RunState } from '../game/run.ts';
import type { DeckWord } from '../deck/types.ts';
import type { TagTable } from '../game/tags.ts';
import { useThrows } from '../composables/useThrows.ts';
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

function onWordTap(word: DeckWord): void {
  if (props.state.pausedAtMs !== null) emit('flip', word);
  else emit('tap', { kind: 'word', wordId: word.id });
}

function onRelease(readingIndex: number, point: Point, velocity: Point): void {
  const wordId = release(point, velocity);
  if (wordId !== null) emit('throw', readingIndex, wordId);
}
</script>

<template>
  <section class="flex flex-col gap-[7dvh]" aria-label="Board">
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
          @tap="$emit('tap', { kind: 'reading', index })"
          @drag="trackDrag"
          @release="(point, velocity) => onRelease(index, point, velocity)"
        />
      </div>
    </div>
  </section>
</template>
