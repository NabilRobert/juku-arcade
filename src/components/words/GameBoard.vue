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
 * (--card-height), so the board fits the window; below the lg breakpoint
 * it's also capped by the window's width, so a phone's cards fit across.
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

/** The reading laid for a word card, by its position, or undefined while none is. */
function queuedReadingAt(position: number): string | undefined {
  const readingIndex = hand.hand.value[position];
  if (readingIndex === null || readingIndex === undefined) return undefined;
  return props.state.set.readings[readingIndex]?.text;
}

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

/** A card dropped or flung onto a word card is thrown at it straight away. */
function onRelease(readingIndex: number, point: Point, velocity: Point): void {
  const wordId = release(point, velocity);
  if (wordId === null) return;
  hand.throwNow(
    readingIndex,
    props.state.set.words.findIndex((word) => word.id === wordId),
  );
}
</script>

<template>
  <section ref="tableElement" class="relative flex flex-col gap-y-3" aria-label="Board">
    <div
      class="pointer-events-none absolute -inset-2 -z-10 rounded-[3rem] lg:-inset-8 bg-[radial-gradient(ellipse_at_50%_50%,rgb(168_218_220/0.3),rgb(155_27_48/0.2)_45%,transparent_72%)] transition-opacity duration-500 ease-[ease-out]"
      :class="{ 'animate-glow motion-reduce:animate-none': heat >= 1 }"
      :style="{ opacity: heat }"
      aria-hidden="true"
    />
    <div
      class="grid grid-cols-5 gap-x-2 [--card-height:min(32dvh,22vw)] lg:[--card-height:32dvh] sm:gap-x-10"
      data-testid="word-row"
    >
      <div
        v-for="(word, position) in state.set.words"
        :key="position"
        class="flex flex-col items-center gap-1"
      >
        <div :ref="registerWord(position)" :class="SLOT_SIZE">
          <div
            class="animate-float motion-reduce:animate-none"
            :style="floatStyle('word', position)"
          >
            <PlayCard
              v-if="dealFrom"
              :key="`${state.setIndex}-${word.id}`"
              :text="word.word"
              kind="word"
              :level="level"
              :index="position"
              :row-place="position"
              :status="wordCardStatus(state, word.id, nowMs)"
              :hint="state.phase === 'timedOut' ? word.reading : undefined"
              :is-peeked="state.peekedWordIds.includes(word.id)"
              :is-targeted="targetWordId === word.id"
              :deal-from="dealFrom.words[position]"
              :crest-mark="crestMarks?.get(word.id)"
              :queued-as="queuedReadingAt(position) === undefined ? undefined : position + 1"
              @tap="onWordTap(word)"
            />
          </div>
        </div>
        <!-- The word card's number; once a reading is laid for it, the reading too, on a pixel tag. -->
        <span
          class="px-2 py-0.5 font-sans text-sm font-bold"
          :class="[
            isMatched(word.id) ? 'invisible' : 'text-aqua/80',
            queuedReadingAt(position) === undefined ? '' : 'pixel-panel bg-aqua text-sumi',
          ]"
          :data-testid="`word-label-${position + 1}`"
          aria-hidden="true"
          >{{ position + 1
          }}<template v-if="queuedReadingAt(position) !== undefined">
            · <span lang="ja">{{ queuedReadingAt(position) }}</span></template
          ></span
        >
      </div>
    </div>
    <div class="relative">
      <!-- While paused the hint floats here, between the rows, so nothing on the board moves. -->
      <div :class="{ invisible: state.pausedAtMs !== null }">
        <ComboMeter :combo="shownCombo" :broken-combo="brokenCombo" @broken-shown="clearBroken" />
      </div>
      <p
        v-if="state.pausedAtMs !== null"
        class="pixel-panel absolute top-1/2 left-1/2 z-10 -translate-x-1/2 -translate-y-1/2 bg-wood/90 px-4 py-2 text-center text-sm text-aqua max-lg:w-[90vw] lg:whitespace-nowrap"
        role="status"
        data-testid="pause-hint"
      >
        Paused. Tap a word card to flip it. A card you peek at won't score.
      </p>
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
    <div class="flex items-start gap-2 pt-4 sm:gap-4">
      <div
        class="grid flex-1 grid-cols-3 justify-items-center gap-2 [--card-height:min(24dvh,33vw)] [--hand-overlap:0] lg:flex lg:justify-center lg:gap-0 lg:[--card-height:24dvh] lg:[--hand-overlap:1]"
        data-testid="reading-row"
      >
        <div
          v-for="(card, index) in state.set.readings"
          :key="index"
          :ref="registerReading(index)"
          class="relative aspect-[3/4] w-[calc(var(--card-height)*0.75)] shrink-0 hover:z-20"
          :class="orderOf(index) !== undefined ? 'z-10' : ''"
          :style="handStyle(index)"
        >
          <div
            class="animate-float motion-reduce:animate-none"
            :style="floatStyle('reading', index)"
          >
            <PlayCard
              v-if="dealFrom"
              :key="`${state.setIndex}-${card.text}`"
              :text="card.text"
              kind="reading"
              :level="level"
              :index="state.set.words.length + index"
              :row-place="index"
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
      <div
        :ref="registerDeck"
        class="w-[calc(var(--card-height)*0.75)] [--card-height:min(22dvh,14vw)] lg:[--card-height:22dvh]"
      >
        <CardDeck />
      </div>
    </div>
  </section>
</template>
