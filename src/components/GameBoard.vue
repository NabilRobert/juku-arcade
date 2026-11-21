<script setup lang="ts">
/**
 * The board for one set: the word cards on top, the reading cards below
 * (L1). When a set times out, each word card shows its reading (L6).
 * While paused, tapping a word card flips it instead of selecting it (L9).
 * Reading cards are smaller than word cards, and a matched one is thrown
 * up at its word card (useThrows).
 */
import { readingCardStatus, wordCardStatus } from '../game/card-status.ts';
import type { CardRef, RunState } from '../game/run.ts';
import type { DeckWord } from '../deck/types.ts';
import type { TagTable } from '../game/tags.ts';
import { useThrows } from '../composables/useThrows.ts';
import PlayCard from './PlayCard.vue';

const props = defineProps<{ state: RunState; nowMs: number; tags: TagTable }>();
const emit = defineEmits<{ tap: [card: CardRef]; flip: [word: DeckWord] }>();
const { throws, registerWord, registerReading } = useThrows(() => props.state);

function onWordTap(word: DeckWord): void {
  if (props.state.pausedAtMs !== null) emit('flip', word);
  else emit('tap', { kind: 'word', wordId: word.id });
}
</script>

<template>
  <section class="flex flex-col gap-8" aria-label="Board">
    <div class="grid grid-cols-5 gap-4" data-testid="word-row">
      <PlayCard
        v-for="(word, index) in state.set.words"
        :key="word.id"
        :ref="registerWord(word.id)"
        :text="word.word"
        kind="word"
        :index="index"
        :status="wordCardStatus(state, word.id, nowMs)"
        :tag="tags.get(word.id)"
        :hint="state.phase === 'timedOut' ? word.reading : undefined"
        :is-peeked="state.peekedWordIds.includes(word.id)"
        @tap="onWordTap(word)"
      />
    </div>
    <div class="grid grid-cols-6 gap-3" data-testid="reading-row">
      <PlayCard
        v-for="(card, index) in state.set.readings"
        :key="card.text"
        :ref="registerReading(index)"
        :text="card.text"
        kind="reading"
        :index="state.set.words.length + index"
        :status="readingCardStatus(state, index, nowMs)"
        :throw-to="throws.get(index)"
        @tap="$emit('tap', { kind: 'reading', index })"
      />
    </div>
  </section>
</template>
