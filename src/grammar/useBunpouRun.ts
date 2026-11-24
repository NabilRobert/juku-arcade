/**
 * Runs Bunpou on screen (D56): holds the run (bunpou-run.ts), ticks its
 * clock so a line times out, shows a judged line for a moment before the
 * next, and makes each tale as the last one is passed. Sounds follow the
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
import { makeTale } from './tale.ts';
import { POINT_PATTERNS, TEMPLATES } from './templates.ts';

/** How long a right line shows before the next one. */
const RIGHT_SHOWN_MS = 700;
/** How long a wrong line shows, with the wrong tiles marked and the fix, before the next. */
const WRONG_SHOWN_MS = 3000;
/** Often enough for a smooth timer bar and a prompt timeout. */
const TICK_MS = 100;
/** Until reviews choose today's points (G2), every point with templates is in play. */
const POINTS = Object.keys(POINT_PATTERNS);

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
    const { deadlineMs, pausedAtMs, level, offered } = run.value;
    const total = rules.sentenceDurationMs(level, offered.length);
    const left = deadlineMs - (pausedAtMs ?? nowMs.value);
    return Math.min(Math.max(left / total, 0), 1);
  });
}

/** A judged line sounds, shows for a moment, then the next line comes. */
function useJudgedLines(run: RunRef, random: RandomSource): void {
  const later = useLater();
  watch(
    () => run.value.phase,
    (phase) => {
      if (phase !== 'judged') return;
      const result = run.value.results[run.value.results.length - 1];
      playJudged(result, run.value.combo);
      const shownMs = result?.isRight === true ? RIGHT_SHOWN_MS : WRONG_SHOWN_MS;
      later(() => {
        run.value = rules.nextLine(run.value, Date.now(), random);
      }, shownMs);
    },
  );
}

export function useBunpouRun(random: RandomSource = Math.random) {
  const newTale = () => makeTale(POINTS, TEMPLATES, random);
  const run = shallowRef(rules.startBunpouRun(newTale(), Date.now(), random));
  const timeLeft = useLineClock(run);
  useJudgedLines(run, random);

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
