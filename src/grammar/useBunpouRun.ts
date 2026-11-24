/**
 * Runs Bunpou on screen (D56): holds the run (bunpou-run.ts), ticks its
 * clock so a line times out, shows a judged line for a moment before the
 * next, and makes each tale as the last one is passed, from the points the
 * caller picks (grammar reviews, D57). Each judged line is reported to the
 * caller, which logs it. Sounds follow the
 * other modes: a tile placed picks up like a card, a right line chimes
 * higher with the combo, a wrong one or a timeout misses.
 *
 * Keys, for a laptop: 1–5 put the offered tile with that number in the
 * first empty box, Backspace takes the rightmost tile back (Esc pauses, usePauseKey).
 */
import { computed, onMounted, onUnmounted, ref, shallowRef, watch, type ShallowRef } from 'vue';
import type { RandomSource } from '../game/deal.ts';
import { useLater } from '../composables/useLater.ts';
import { comboPitch, playSound } from '../sound/sfx.ts';
import * as rules from './bunpou-run.ts';
import { makeTaleFromRanking } from './tale.ts';
import { POINT_PATTERNS, TEMPLATES } from './templates.ts';

/** How long a right line shows before the next one. */
const RIGHT_SHOWN_MS = 700;
/** How long a wrong line shows, with the wrong tiles marked and the fix, before the next. */
const WRONG_SHOWN_MS = 3000;
/** Often enough for a smooth timer bar and a prompt timeout. */
const TICK_MS = 100;
/** Every grammar point with templates, in curriculum order (the order they're introduced). */
export const BUNPOU_POINTS: readonly string[] = Object.keys(POINT_PATTERNS);

export interface BunpouRunOptions {
  random?: RandomSource;
  /** Every point, ranked for the next tale (today's grammar first); curriculum order by default. */
  pointsByPriority?: () => readonly string[];
  /** Called once per judged line, with how long the player took. */
  onJudged?: (result: rules.LineResult, msTaken: number) => void;
}

function useBunpouKeys(actions: { placeNumber: (number: number) => void; takeBack: () => void }) {
  function onKey(event: KeyboardEvent): void {
    if (event.repeat) return;
    if (event.key === 'Backspace') actions.takeBack();
    const number = Number(event.key);
    if (Number.isInteger(number) && number >= 1) actions.placeNumber(number);
  }
  onMounted(() => window.addEventListener('keydown', onKey));
  onUnmounted(() => window.removeEventListener('keydown', onKey));
}

function playJudged(result: rules.LineResult | undefined, combo: number): void {
  if (result?.isRight === true) playSound('chime', comboPitch(combo));
  else playSound('miss');
}

type RunRef = ShallowRef<rules.BunpouRun>;

/** The line's clock: ticks so a line times out, and how much of its time is left (1 to 0). */
function useLineClock(run: RunRef) {
  const nowMs = ref(Date.now());
  const timer = setInterval(() => {
    nowMs.value = Date.now();
    run.value = rules.checkTime(run.value, nowMs.value);
  }, TICK_MS);
  onUnmounted(() => clearInterval(timer));
  return computed(() => {
    const { deadlineMs, pausedAtMs, lineDurationMs } = run.value;
    const left = deadlineMs - (pausedAtMs ?? nowMs.value);
    return lineDurationMs > 0 ? Math.min(Math.max(left / lineDurationMs, 0), 1) : 0;
  });
}

/** A judged line sounds, is reported, shows for a moment, then the next line comes. */
function useJudgedLines(run: RunRef, options: Required<BunpouRunOptions>): void {
  const later = useLater();
  const { random, onJudged } = options;
  watch(
    () => run.value.phase,
    (phase) => {
      if (phase !== 'judged') return;
      const result = run.value.results[run.value.results.length - 1];
      playJudged(result, run.value.combo);
      const msLeft = Math.max(0, run.value.deadlineMs - Date.now());
      if (result !== undefined) onJudged(result, run.value.lineDurationMs - msLeft);
      const shownMs = result?.isRight === true ? RIGHT_SHOWN_MS : WRONG_SHOWN_MS;
      later(() => {
        run.value = rules.nextLine(run.value, Date.now(), random);
      }, shownMs);
    },
  );
}

export function useBunpouRun(options: BunpouRunOptions = {}) {
  const settled: Required<BunpouRunOptions> = {
    random: options.random ?? Math.random,
    pointsByPriority: options.pointsByPriority ?? (() => BUNPOU_POINTS),
    onJudged: options.onJudged ?? (() => undefined),
  };
  const { random } = settled;
  const newTale = () => makeTaleFromRanking(settled.pointsByPriority(), TEMPLATES, random);
  const run = shallowRef(rules.startBunpouRun(newTale(), Date.now(), random));
  const timeLeft = useLineClock(run);
  useJudgedLines(run, settled);

  function place(tile: string, at?: number): void {
    const next = rules.placeTile(run.value, tile, at);
    if (next !== run.value) playSound('pickUp');
    run.value = next;
  }
  function update(change: (current: rules.BunpouRun) => rules.BunpouRun): void {
    run.value = change(run.value);
  }
  const takeBack = (tile?: string): void => update((current) => rules.takeBack(current, tile));
  const unplaced = computed(() =>
    run.value.offered.filter((tile) => !run.value.slots.includes(tile)),
  );
  useBunpouKeys({ placeNumber: (number) => place(unplaced.value[number - 1] ?? ''), takeBack });

  return {
    run,
    unplaced,
    timeLeft,
    place,
    takeBack,
    pause: () => update((current) => rules.pause(current, Date.now())),
    resume: () => update((current) => rules.resume(current, Date.now())),
    nextTale: () => update((current) => rules.nextTale(current, newTale(), Date.now(), random)),
  };
}
