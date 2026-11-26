/**
 * Runs the dojo on screen (D62): holds the run's lanterns and score
 * (dojo-run.ts) and the question on the table (dojo-questions.ts), times
 * each question by its stage, and after an answer shows it for a moment
 * before the next. A question left until its time runs out is a miss.
 * Each answer goes to the play log for the streak, the calendar and the
 * boards; nothing goes to the reviews, since a timed test isn't practice.
 */
import { computed, onUnmounted, ref, shallowRef } from 'vue';
import { useLater } from '../composables/useLater.ts';
import { useRunLog } from '../composables/useRunLog.ts';
import type { RandomSource } from '../game/deal.ts';
import { comboPitch, playSound } from '../sound/sfx.ts';
import { nextQuestion, type DojoPools, type DojoQuestion } from './dojo-questions.ts';
import { afterAnswer, FRESH_DOJO, secondsFor, stageOf, type DojoState } from './dojo-run.ts';

/** How long an answer shows before the next question: longer after a miss, to read the fix. */
const RIGHT_SHOWN_MS = 800;
const WRONG_SHOWN_MS = 2200;
const TICK_MS = 100;
const MS_PER_SECOND = 1000;

/** The question's clock: when it runs out, and when it was paused, if it is. */
interface Clock {
  deadlineMs: number;
  durationMs: number;
  pausedAtMs: number | null;
}

/** Times each question; `onTimeUp` runs when one runs out while unanswered and unpaused. */
function useQuestionClock(isWaiting: () => boolean, onTimeUp: () => void) {
  const nowMs = ref(Date.now());
  const clock = ref<Clock>({ deadlineMs: Date.now(), durationMs: 0, pausedAtMs: null });
  const timer = setInterval(() => {
    nowMs.value = Date.now();
    const { deadlineMs, pausedAtMs } = clock.value;
    if (isWaiting() && pausedAtMs === null && nowMs.value >= deadlineMs) onTimeUp();
  }, TICK_MS);
  onUnmounted(() => clearInterval(timer));

  return {
    start: (seconds: number) => {
      const durationMs = seconds * MS_PER_SECOND;
      clock.value = { deadlineMs: Date.now() + durationMs, durationMs, pausedAtMs: null };
    },
    isPaused: computed(() => clock.value.pausedAtMs !== null),
    /** How much of the question's time is left, 1 to 0. */
    timeLeft: computed(() => {
      const { deadlineMs, durationMs, pausedAtMs } = clock.value;
      const left = deadlineMs - (pausedAtMs ?? nowMs.value);
      return durationMs > 0 ? Math.min(Math.max(left / durationMs, 0), 1) : 0;
    }),
    pause: () => {
      if (clock.value.pausedAtMs === null) clock.value = { ...clock.value, pausedAtMs: Date.now() };
    },
    resume: () => {
      const { pausedAtMs, deadlineMs } = clock.value;
      if (pausedAtMs === null) return;
      const shifted = deadlineMs + Date.now() - pausedAtMs;
      clock.value = { ...clock.value, pausedAtMs: null, deadlineMs: shifted };
    },
  };
}

/** A right answer chimes up the scale with a short burst of applause; a miss sounds a miss. */
function playAnswerSound(isRight: boolean, rightSoFar: number): void {
  if (!isRight) return playSound('miss');
  playSound('chime', comboPitch(rightSoFar));
  playSound('applauseShort');
}

export interface DojoRunOptions {
  random?: RandomSource;
  /**
   * Asked as a question's time runs out: the verdict on the cards the
   * player picked and threw, or null to count it as timed out (a miss).
   */
  settleOnTimeUp?: () => boolean | null;
}

export function useDojoRun(pools: DojoPools, options: DojoRunOptions = {}) {
  const { random = Math.random, settleOnTimeUp = () => null } = options;
  const state = ref<DojoState>(FRESH_DOJO);
  const question = shallowRef<DojoQuestion>(nextQuestion(pools, random));
  const isLocked = ref(false);
  const later = useLater();
  const runLog = useRunLog('dojo');
  const clock = useQuestionClock(
    () => !isLocked.value && !state.value.isOver,
    () => answer(settleOnTimeUp() ?? false),
  );
  clock.start(secondsFor(question.value.kind, 0));

  function ask(): void {
    question.value = nextQuestion(pools, random);
    clock.start(secondsFor(question.value.kind, state.value.right));
    isLocked.value = false;
  }

  function answer(isRight: boolean): void {
    if (isLocked.value || state.value.isOver) return;
    isLocked.value = true;
    state.value = afterAnswer(state.value, isRight);
    const { right, answered } = state.value;
    runLog.record({ score: right, answered, right });
    playAnswerSound(isRight, right);
    if (!state.value.isOver) later(ask, isRight ? RIGHT_SHOWN_MS : WRONG_SHOWN_MS);
  }

  return {
    state,
    question,
    isLocked,
    stage: computed(() => stageOf(state.value.right)),
    isPaused: clock.isPaused,
    timeLeft: clock.timeLeft,
    answer,
    pause: clock.pause,
    resume: clock.resume,
  };
}
