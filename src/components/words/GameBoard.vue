<script setup lang="ts">
/**
 * The board for one set (L1): the word cards on top, numbered 1 to 5, and
 * the player's hand of reading cards below, laid out in an overlapping row, next to the
 * deck the set was dealt from. When a set times out, each word card shows its
 * reading (L6). While paused, tapping a word card flips it (L9).
 *
 * The player lays out a hand (useHand.ts): clicking a reading card lays it
 * for the first word card still open, from the left; dragging it onto a
 * word card lays it for that one. A laid card shifts up, tagged with its
 * word's number. Clicking it takes it back. Once every word has a reading,
 * Play throws them at their words one after another.
 *
 * Each card sits in a slot that never moves (useTableSlots.ts), sized like
 * the card, so the slots can be measured before any card is drawn: cards
 * are dealt off the deck (useDeal.ts) and thrown (useThrows.ts) by moving
 * them away from their own slot. Each reading card's slot has a small fixed
 * turn and raise (hand-layout.ts), so the slots still never move. Inside its slot each
 * card floats, bobbing and swaying out of step with its neighbours, so the
 * table never looks frozen. Each row
 * sets its cards' height as a share of the window's height
 * (--card-height), so the board fits the window.
 *
 * Between the words and the hand sit the combo (ComboMeter) and the Play
 * button. Behind the cards a glow warms as the combo builds, and the table
 * jolts on each hit, harder the longer the combo (useGameFeel).
 */
import { useAnimate, useReducedMotion } from 'motion-v';
import { computed, watch } from 'vue';
import { readingCardStatus, wordCardStatus } from '../../game/card-status.ts';
import type { PlayedPair } from '../../game/hand.ts';
import type { RunState } from '../../game/run.ts';
import type { DeckWord, JlptLevel } from '../../deck/types.ts';
import type { TagTable } from '../../game/tags.ts';
import { useDeal } from '../../composables/useDeal.ts';
import { useGameFeel } from '../../composables/useGameFeel.ts';
import { useHand } from '../../composables/useHand.ts';
import { useTableSlots } from '../../composables/useTableSlots.ts';
import { useThrows } from '../../composables/useThrows.ts';
import { playSound } from '../../sound/sfx.ts';
import CardDeck from '../cards/CardDeck.vue';
import ComboMeter from '../ui/ComboMeter.vue';
import PlayCard from '../cards/PlayCard.vue';
import { floatStyle, handStyle, SLOT_SIZE } from '../cards/hand-layout.ts';
import PixelButton from '../ui/PixelButton.vue';
import type { Point } from '../cards/throw-geometry.ts';
import type { CrestMark } from '../cards/crest-mark.ts';

const props = defineProps<{
  state: RunState;
  nowMs: number;
  tags: TagTable;
  /** The deck's JLPT level, marked on every card. */
  level: JlptLevel;
  /** Scouted crests on the word cards, by word id (the bank run's crests, D42). */
  crestMarks?: ReadonlyMap<string, CrestMark>;
}>();
const emit = defineEmits<{
  throw: [readingIndex: number, wordId: string];
  flip: [word: DeckWord];
}>();

const table = useTableSlots();
const { registerWord, registerReading, registerDeck } = table;
const { throws, targetWordId, trackDrag, release } = useThrows(() => props.state, table.slots);
const dealFrom = useDeal(table.slots, table.isMounted, table.layoutVersion);
const hand = useHand(() => props.state, throwCard);
const { isReady, isPlaying, orderOf } = hand;
const { impact, shownCombo, brokenCombo, clearBroken } = useGameFeel(() => props.state);

/** The combo at which the glow behind the cards is at its brightest. */
const FULL_HEAT_COMBO = 15;
/** How far the table jolts on a hit, in pixels: a base, plus more per combo, up to a cap. */
const SHAKE_BASE_PX = 3;
const SHAKE_PER_COMBO_PX = 0.4;
const SHAKE_MAX_PX = 10;
const heat = computed(() => Math.min(shownCombo.value / FULL_HEAT_COMBO, 1));
const [tableElement, animate] = useAnimate();
const isReducedMotion = useReducedMotion();

watch(impact, ({ combo }) => {
  if (isReducedMotion.value === true) return;
  const jolt = Math.min(SHAKE_BASE_PX + combo * SHAKE_PER_COMBO_PX, SHAKE_MAX_PX);
  void animate(
    tableElement.value,
    { x: [0, -jolt, jolt, -jolt / 2, 0], y: [0, jolt / 2, 0] },
    { duration: 0.25 },
  );
});

watch(targetWordId, (wordId) => {
  if (wordId !== null) playSound('aim');
});

function isMatched(wordId: string): boolean {
  return props.state.matchedWordIds.includes(wordId);
}

function throwCard({ readingIndex, wordId }: PlayedPair): void {
  playSound('whoosh');
  emit('throw', readingIndex, wordId);
}

function onWordTap(word: DeckWord): void {
  if (props.state.pausedAtMs !== null) emit('flip', word);
}

function onReadingTap(index: number): void {
  playSound('pickUp');
  if (orderOf(index) !== undefined) hand.takeBack(index);
  else hand.lay(index);
}

function onRelease(readingIndex: number, point: Point, velocity: Point): void {
  const wordId = release(point, velocity);
  if (wordId === null) return;
  playSound('slap');
  hand.lay(
    readingIndex,
    props.state.set.words.findIndex((word) => word.id === wordId),
  );
}
</script>

<template>
  <section ref="tableElement" class="relative flex flex-col gap-y-3" aria-label="Board">
    <div
      class="table-glow pointer-events-none absolute -inset-8 -z-10 rounded-[3rem]"
      :class="{ 'animate-glow': heat >= 1 }"
      :style="{ opacity: heat }"
      aria-hidden="true"
    />
    <div class="grid grid-cols-5 gap-x-10 [--card-height:32dvh]" data-testid="word-row">
      <div
        v-for="(word, position) in state.set.words"
        :key="position"
        class="flex flex-col items-center gap-1"
      >
        <div :ref="registerWord(position)" :class="SLOT_SIZE">
          <div class="animate-float" :style="floatStyle('word', position)">
            <PlayCard
              v-if="dealFrom"
              :key="`${state.setIndex}-${word.id}`"
              :text="word.word"
              kind="word"
              :level="level"
              :index="position"
              :status="wordCardStatus(state, word.id, nowMs)"
              :tag="tags.get(word.id)"
              :hint="state.phase === 'timedOut' ? word.reading : undefined"
              :is-peeked="state.peekedWordIds.includes(word.id)"
              :is-targeted="targetWordId === word.id"
              :deal-from="dealFrom.words[position]"
              :crest-mark="crestMarks?.get(word.id)"
              @tap="onWordTap(word)"
            />
          </div>
        </div>
        <span
          class="font-sans text-sm font-bold"
          :class="isMatched(word.id) ? 'invisible' : 'text-aqua/80'"
          aria-hidden="true"
          >{{ position + 1 }}</span
        >
      </div>
    </div>
    <div class="relative">
      <ComboMeter :combo="shownCombo" :broken-combo="brokenCombo" @broken-shown="clearBroken" />
      <PixelButton
        colour="crimson"
        class="absolute top-1/2 right-0 min-h-11 -translate-y-1/2 px-8 py-2 text-xl font-bold disabled:bg-washi/15 disabled:text-washi/40"
        :disabled="!isReady || isPlaying"
        data-testid="play"
        @click="hand.play"
      >
        Play ▶
      </PixelButton>
    </div>
    <div class="flex items-start gap-4 pt-4">
      <div class="flex flex-1 justify-center [--card-height:24dvh]" data-testid="reading-row">
        <div
          v-for="(card, index) in state.set.readings"
          :key="index"
          :ref="registerReading(index)"
          class="relative aspect-[3/4] w-[calc(var(--card-height)*0.75)] shrink-0 hover:z-20"
          :class="orderOf(index) !== undefined ? 'z-10' : ''"
          :style="handStyle(index)"
        >
          <div class="animate-float" :style="floatStyle('reading', index)">
            <PlayCard
              v-if="dealFrom"
              :key="`${state.setIndex}-${card.text}`"
              :text="card.text"
              kind="reading"
              :level="level"
              :index="state.set.words.length + index"
              :status="readingCardStatus(state, index, nowMs)"
              :throw-to="throws.get(index)"
              :deal-from="dealFrom.readings[index]"
              :order="orderOf(index)"
              @tap="onReadingTap(index)"
              @pick-up="playSound('pickUp')"
              @drag="trackDrag"
              @release="(point, velocity) => onRelease(index, point, velocity)"
            />
          </div>
        </div>
      </div>
      <div :ref="registerDeck" class="w-[calc(var(--card-height)*0.75)] [--card-height:22dvh]">
        <CardDeck />
      </div>
    </div>
  </section>
</template>
