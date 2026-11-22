<script setup lang="ts">
/**
 * The table in kanji mode (D37): one big kanji card on top, then the combo
 * and the Play button, then a hand of 8 reading cards in a fan beside the
 * deck. Clicking a reading card picks it (it lifts) or puts it back; Play
 * throws the picked cards at the kanji. A right card flies in and the
 * kanji jolts; a wrong one shakes; the right readings left in the hand
 * light up. Each round is dealt off the deck, as in word mode.
 */
import { useAnimate, useReducedMotion } from 'motion-v';
import { reactive, watch } from 'vue';
import type { JlptLevel } from '../deck/types.ts';
import type { CardStatus } from '../game/card-status.ts';
import type { KanjiRound } from '../kanji/kanji-round.ts';
import { boxOf, useTableSlots } from '../composables/useTableSlots.ts';
import { useDeal } from '../composables/useDeal.ts';
import CardDeck from './CardDeck.vue';
import ComboMeter from './ComboMeter.vue';
import PixelButton from './PixelButton.vue';
import PlayCard from './PlayCard.vue';
import { fanStyle, floatStyle, SLOT_SIZE } from './hand-layout.ts';
import { centreOffset, type Offset } from './throw-geometry.ts';

const props = defineProps<{
  round: KanjiRound;
  roundNumber: number;
  level: JlptLevel;
  statusOf: (index: number) => CardStatus;
  thrown: readonly number[];
  combo: number;
  impacts: number;
  canPlay: boolean;
}>();
defineEmits<{ toggle: [index: number]; play: [] }>();

/** Eight cards need more overlap than word mode's six to fit the same width. */
const HAND_OVERLAP = '-4dvh';
/** The kanji is the word slot at position 0; the reading slots are the hand. */
const KANJI_SLOT = 0;

const table = useTableSlots();
const dealFrom = useDeal(table.slots, table.isMounted, table.layoutVersion);
const [kanjiElement, animate] = useAnimate();
const isReducedMotion = useReducedMotion();

/** How far each thrown card flies to reach the kanji, measured as it's thrown. */
const throws = reactive(new Map<number, Offset>());
watch(
  () => props.thrown,
  (thrown) => {
    if (thrown.length === 0) throws.clear();
    for (const index of thrown) {
      const from = boxOf(table.slots.readings.get(index));
      const to = boxOf(table.slots.words.get(KANJI_SLOT));
      if (!throws.has(index) && from !== null && to !== null) {
        throws.set(index, centreOffset(from, to));
      }
    }
  },
);

watch(
  () => props.impacts,
  () => {
    if (isReducedMotion.value !== true) {
      void animate(kanjiElement.value, { scale: [1, 1.08, 1] }, { duration: 0.25 });
    }
  },
);
</script>

<template>
  <section class="flex flex-col gap-y-3" aria-label="Kanji board">
    <div class="flex flex-col items-center gap-2 [--card-height:34dvh]" data-testid="kanji-row">
      <div :ref="table.registerWord(KANJI_SLOT)" :class="SLOT_SIZE">
        <div class="animate-float" :style="floatStyle('word', 0)">
          <!-- Its own layer: the float's CSS animation would override a jolt on the same element. -->
          <div ref="kanjiElement">
            <PlayCard
              v-if="dealFrom"
              :key="`kanji-${roundNumber}`"
              :text="round.kanji"
              kind="word"
              :index="0"
              status="idle"
              :level="level"
              :deal-from="dealFrom.words[KANJI_SLOT]"
            />
          </div>
        </div>
      </div>
      <p class="max-w-md text-center text-sm text-washi/70" lang="en">
        {{ round.meanings.slice(0, 3).join('; ') }}
      </p>
    </div>
    <div class="relative">
      <ComboMeter :combo="combo" :broken-combo="null" />
      <PixelButton
        colour="crimson"
        class="absolute top-1/2 right-0 min-h-11 -translate-y-1/2 px-8 py-2 text-xl font-bold disabled:bg-washi/15 disabled:text-washi/40"
        :disabled="!canPlay"
        data-testid="play"
        @click="$emit('play')"
      >
        Play ▶
      </PixelButton>
    </div>
    <div class="flex items-start gap-4 pt-4">
      <div class="flex flex-1 justify-center [--card-height:20dvh]" data-testid="reading-row">
        <div
          v-for="(card, index) in round.cards"
          :key="index"
          :ref="table.registerReading(index)"
          class="relative aspect-[3/4] w-[calc(var(--card-height)*0.75)] shrink-0 hover:z-20"
          :class="statusOf(index) === 'selected' ? 'z-10' : ''"
          :style="fanStyle(index, round.cards.length, HAND_OVERLAP)"
        >
          <div class="animate-float" :style="floatStyle('reading', index)">
            <PlayCard
              v-if="dealFrom"
              :key="`${roundNumber}-${card.text}`"
              :text="card.text"
              kind="reading"
              :index="index + 1"
              :status="statusOf(index)"
              :level="level"
              :throw-to="throws.get(index)"
              :deal-from="dealFrom.readings[index]"
              @tap="$emit('toggle', index)"
            />
          </div>
        </div>
      </div>
      <div
        :ref="table.registerDeck"
        class="w-[calc(var(--card-height)*0.75)] [--card-height:20dvh]"
      >
        <CardDeck />
      </div>
    </div>
  </section>
</template>
