<script setup lang="ts">
/**
 * Bunpou's table (D56): which part of the tale this line is (起承転結),
 * the line's timer, the grammar hint (preferences/hints.ts), the strip of
 * boxes, one per tile, the combo meter and the offered tiles. Tap an
 * offered tile to put it in the first empty box, or drag it onto the box
 * it belongs in; drag a placed tile to another box to move it (a tile
 * already there swaps places), or off the strip, or tap it, to take it
 * back. A missed line shows its fix for a moment.
 *
 * Pausing turns the tiles face down where they lie, as word mode turns
 * its cards (D8), so a pause gives no free thinking time; the run's
 * misses float below the table and the hint over the combo meter, so
 * nothing on the table moves, as in word mode.
 */
import { computed, ref, useTemplateRef, watch } from 'vue';
import type { BunpouRun } from '../../grammar/bunpou-run.ts';
import { areHintsShown } from '../../preferences/hints.ts';
import { markedTile } from '../../grammar/fill.ts';
import { POINT_PATTERNS, SHELF_NAMES } from '../../grammar/templates.ts';
import type { Point } from '../cards/throw-geometry.ts';
import ComboMeter from '../ui/ComboMeter.vue';
import TimerBar from '../ui/TimerBar.vue';
import PixelButton from '../ui/PixelButton.vue';
import FuriganaText from '../words/FuriganaText.vue';
import BunpouTile from './BunpouTile.vue';
import SentenceFix from './SentenceFix.vue';

const props = defineProps<{ run: BunpouRun; unplaced: readonly string[]; timeLeft: number }>();
const emit = defineEmits<{
  place: [tile: string, at?: number];
  takeBack: [tile: string];
  pause: [];
  resume: [];
}>();

const line = computed(() => props.run.tale.lines[props.run.lineIndex]);
const isPaused = computed(() => props.run.pausedAtMs !== null);
const hint = computed(() => (line.value ? POINT_PATTERNS[line.value.point] : undefined));
const judged = computed(() =>
  props.run.phase === 'judged' ? props.run.results.at(-1) : undefined,
);
const markedOf = (text: string): string =>
  line.value === undefined ? text : markedTile(line.value, text);
const canMove = computed(() => props.run.phase === 'building' && !isPaused.value);

/** Tiles placed at least once this line: taken back, they reappear without being dealt again. */
const placedThisLine = ref(new Set<string>());
watch(
  () => props.run.lineIndex,
  () => {
    placedThisLine.value = new Set();
  },
);
watch(
  () => props.run.boxes,
  (boxes) => {
    for (const tile of boxes) if (tile !== null) placedThisLine.value.add(tile);
  },
);

/** The combo just lost, shown dropping away until ComboMeter has shown it. */
const brokenCombo = ref<number | null>(null);
watch(
  () => props.run.combo,
  (combo, before) => {
    if (combo === 0 && before > 0) brokenCombo.value = before;
  },
);

const strip = useTemplateRef<HTMLElement>('strip');

function isInside(box: DOMRect, point: Point): boolean {
  return point.x >= box.left && point.x <= box.right && point.y >= box.top && point.y <= box.bottom;
}

/** The box a tile was let go over: the nearest one, if it was let go over the strip at all. */
function boxIndexAt(point: Point): number | null {
  const stripBox = strip.value?.getBoundingClientRect();
  if (stripBox === undefined || !isInside(stripBox, point)) return null;
  const boxRects = [...(strip.value?.querySelectorAll('[data-box]') ?? [])].map((box) =>
    box.getBoundingClientRect(),
  );
  let nearest: number | null = null;
  let nearestDistance = Number.POSITIVE_INFINITY;
  boxRects.forEach((boxRect, index) => {
    const distance = Math.hypot(
      boxRect.left + boxRect.width / 2 - point.x,
      boxRect.top + boxRect.height / 2 - point.y,
    );
    if (distance < nearestDistance) {
      nearest = index;
      nearestDistance = distance;
    }
  });
  return nearest;
}

/** A dragged tile goes in the box it was let go over; a placed tile let go off the strip goes back. */
function dropAt(tile: string, point: Point): void {
  const at = boxIndexAt(point);
  if (at !== null) emit('place', tile, at);
  else if (props.run.boxes.includes(tile)) emit('takeBack', tile);
}
</script>

<template>
  <section class="relative flex flex-col gap-4" aria-label="Bunpou table">
    <header class="flex items-center gap-4">
      <span class="text-3xl font-bold text-aqua" lang="ja" data-testid="part">{{
        line ? SHELF_NAMES[line.shelf] : ''
      }}</span>
      <span class="text-sm text-washi/70"
        >{{ run.lineIndex + 1 }} / {{ run.tale.lines.length }}</span
      >
      <span
        v-if="areHintsShown && hint"
        class="pixel-panel bg-wood/80 px-3 pt-1 pb-[0.9em] text-xl text-aqua"
        lang="ja"
        data-testid="hint"
        ><FuriganaText :marked="hint" is-reading-below
      /></span>
      <TimerBar class="flex-1" :time-left="timeLeft" />
      <PixelButton
        :colour="isPaused ? 'crimson' : 'steel'"
        class="px-4 py-1 text-sm"
        :aria-pressed="isPaused"
        :disabled="run.phase !== 'building'"
        data-testid="pause"
        @click="isPaused ? emit('resume') : emit('pause')"
      >
        {{ isPaused ? '▶ Resume' : '⏸ Pause' }}
      </PixelButton>
    </header>

    <div
      ref="strip"
      class="pixel-panel flex min-h-32 flex-wrap items-center justify-center gap-2 bg-wood/80 p-2 sm:p-4"
      data-testid="strip"
    >
      <SentenceFix v-if="judged && !judged.isRight" :result="judged" />
      <template v-else>
        <div
          v-for="(tile, index) in run.boxes"
          :key="index"
          class="flex h-16 w-38 items-center justify-center outline-2 -outline-offset-2 sm:h-24 sm:w-48"
          :class="tile === null ? 'outline-washi/30 outline-dashed' : 'outline-transparent'"
          data-box
        >
          <BunpouTile
            v-if="tile !== null"
            :key="tile"
            :marked="markedOf(tile)"
            :is-face-down="isPaused"
            :is-draggable="canMove"
            data-placed
            @tap="emit('takeBack', tile)"
            @release="(point: Point) => dropAt(tile, point)"
          />
        </div>
        <span v-if="judged?.isRight" class="text-4xl text-aqua" aria-label="right">◯</span>
      </template>
    </div>
    <div class="relative">
      <div :class="{ invisible: isPaused }">
        <ComboMeter
          :combo="run.combo"
          :broken-combo="brokenCombo"
          @broken-shown="brokenCombo = null"
        />
      </div>
      <p
        v-if="isPaused"
        class="pixel-panel absolute top-1/2 left-1/2 z-10 -translate-x-1/2 -translate-y-1/2 bg-wood/90 px-4 py-2 text-sm whitespace-nowrap text-aqua"
        role="status"
        data-testid="pause-hint"
      >
        Paused. The tiles stay face down until you resume.
      </p>
    </div>
    <div class="flex min-h-24 flex-wrap justify-center gap-2 sm:gap-4" data-testid="offered">
      <BunpouTile
        v-for="(tile, index) in unplaced"
        :key="`${run.lineIndex}-${tile}`"
        :deal-index="placedThisLine.has(tile) ? undefined : index"
        :marked="markedOf(tile)"
        :number="index + 1"
        :is-draggable="canMove"
        :is-face-down="isPaused"
        @tap="emit('place', tile)"
        @release="(point: Point) => dropAt(tile, point)"
      />
    </div>
    <div
      v-if="isPaused && run.missed.length > 0"
      class="pixel-panel absolute inset-x-0 top-full z-10 mt-4 flex max-h-[35dvh] flex-col gap-4 overflow-y-auto bg-wood/95 p-4"
      data-testid="paused"
    >
      <p class="text-sm text-aqua">Missed so far</p>
      <SentenceFix v-for="(missed, index) in run.missed" :key="index" :result="missed" />
    </div>
  </section>
</template>
