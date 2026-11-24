<script setup lang="ts">
/**
 * Bunpou's table (D56): which part of the tale this line is (起承転結),
 * the line's timer, the strip the tiles are placed on, the combo meter,
 * the grammar hint (hints.ts) and the offered tiles. Tap an offered tile to place it at the end, or
 * drag it onto the strip where it should go; tap a placed tile to take it
 * back. A missed line shows its fix for a moment.
 *
 * Pausing turns the tiles face down where they lie, as word mode turns
 * its cards (D8), so a pause gives no free thinking time; the run's
 * misses float below the table and the hint over the combo meter, so
 * nothing on the table moves, as in word mode.
 */
import { computed, ref, useTemplateRef, watch } from 'vue';
import type { BunpouRun } from '../../grammar/bunpou-run.ts';
import { areHintsShown } from '../../grammar/hints.ts';
import { POINT_PATTERNS } from '../../grammar/templates.ts';
import type { Point } from '../cards/throw-geometry.ts';
import ComboMeter from '../ui/ComboMeter.vue';
import PixelButton from '../ui/PixelButton.vue';
import BunpouTile from './BunpouTile.vue';
import SentenceFix from './SentenceFix.vue';

const props = defineProps<{ run: BunpouRun; unplaced: readonly string[]; timeLeft: number }>();
const emit = defineEmits<{
  place: [tile: string, at?: number];
  takeBack: [tile: string];
  pause: [];
  resume: [];
}>();

const PART_NAMES = { S: '起', D: '承', T: '転', P: '結' } as const;

const line = computed(() => props.run.tale.lines[props.run.lineIndex]);
const isPaused = computed(() => props.run.pausedAtMs !== null);
const hint = computed(() => (line.value ? POINT_PATTERNS[line.value.point] : undefined));
const judged = computed(() =>
  props.run.phase === 'judged' ? props.run.results.at(-1) : undefined,
);
const markedOf = computed(() => {
  const marks = new Map(line.value?.tiles.map((tile) => [tile.text, tile.marked]));
  return (text: string): string => marks.get(text) ?? text;
});
const emptySlots = computed(() => props.run.offered.length - props.run.placed.length);

/** The combo just lost, shown dropping away until ComboMeter has shown it. */
const brokenCombo = ref<number | null>(null);
watch(
  () => props.run.combo,
  (combo, before) => {
    if (combo === 0 && before > 0) brokenCombo.value = before;
  },
);

const strip = useTemplateRef<HTMLElement>('strip');

/** A tile let go over the strip goes in before the first placed tile whose middle is right of it. */
function dropAt(tile: string, point: Point): void {
  const box = strip.value?.getBoundingClientRect();
  if (box === undefined || point.x < box.left || point.x > box.right) return;
  if (point.y < box.top || point.y > box.bottom) return;
  const placedTiles = [...(strip.value?.querySelectorAll('[data-placed]') ?? [])];
  const at = placedTiles.filter((element) => {
    const placedBox = element.getBoundingClientRect();
    return placedBox.left + placedBox.width / 2 < point.x;
  }).length;
  emit('place', tile, at);
}
</script>

<template>
  <section class="relative flex flex-col gap-4" aria-label="Bunpou table">
    <header class="flex items-center gap-4">
      <span class="text-3xl font-bold text-aqua" lang="ja" data-testid="part">{{
        line ? PART_NAMES[line.shelf] : ''
      }}</span>
      <span class="text-sm text-washi/70"
        >{{ run.lineIndex + 1 }} / {{ run.tale.lines.length }}</span
      >
      <span
        v-if="areHintsShown && hint"
        class="pixel-panel bg-wood/80 px-3 py-1 text-lg text-aqua"
        lang="ja"
        data-testid="hint"
        >{{ hint }}</span
      >
      <span class="pixel-panel h-3 flex-1 bg-lacquer" aria-hidden="true">
        <span class="block h-full bg-aqua" :style="{ width: `${timeLeft * 100}%` }" />
      </span>
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
      class="pixel-panel flex min-h-32 flex-wrap items-center justify-center gap-2 bg-wood/80 p-4"
      data-testid="strip"
    >
      <SentenceFix v-if="judged && !judged.isRight" :result="judged" />
      <template v-else>
        <BunpouTile
          v-for="tile in run.placed"
          :key="tile"
          :marked="markedOf(tile)"
          :is-face-down="isPaused"
          data-placed
          @tap="emit('takeBack', tile)"
        />
        <span
          v-for="slot in emptySlots"
          :key="`slot-${slot}`"
          class="h-16 w-20 border-2 border-dashed border-washi/30"
        />
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
    <div class="flex min-h-24 flex-wrap justify-center gap-4" data-testid="offered">
      <BunpouTile
        v-for="(tile, index) in unplaced"
        :key="tile"
        :marked="markedOf(tile)"
        :number="index + 1"
        :is-draggable="run.phase === 'building' && !isPaused"
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
