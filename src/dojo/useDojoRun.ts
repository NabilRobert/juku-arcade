/**
 * Runs the dojo on screen (D62): holds the run's lanterns and score
 * (dojo-run.ts) and the question on the table (dojo-questions.ts), and
 * after an answer shows it for a moment before the next. Questions aren't
 * timed (D69): the player takes as long as they need. Pausing hides the
 * question and stops the play time counting toward the daily limits.
 * Each answer goes to the play log for the streak, the calendar and the
 * boards; nothing goes to the reviews: it tests what's already known, so it
 * doesn't move words through their review boxes.
 */
import { ref, shallowRef } from 'vue';
import { useLater } from '../composables/useLater.ts';
import { useRunLog } from '../composables/useRunLog.ts';
import type { RandomSource } from '../game/deal.ts';
import { comboPitch, playSound } from '../sound/sfx.ts';
import { nextQuestion, type DojoPools, type DojoQuestion } from './dojo-questions.ts';
import { afterAnswer, endedEarly, FRESH_DOJO, type DojoState } from './dojo-run.ts';

/** How long an answer shows before the next question: longer after a miss, to read the fix. */
const RIGHT_SHOWN_MS = 800;
const WRONG_SHOWN_MS = 2200;

/** A right answer chimes up the scale with a short burst of applause; a miss sounds a miss. */
function playAnswerSound(isRight: boolean, rightSoFar: number): void {
  if (!isRight) return playSound('miss');
  playSound('chime', comboPitch(rightSoFar));
  playSound('applauseShort');
}

export function useDojoRun(pools: DojoPools, random: RandomSource = Math.random) {
  const state = ref<DojoState>(FRESH_DOJO);
  const question = shallowRef<DojoQuestion>(nextQuestion(pools, random));
  /** Counts the questions asked, so the board is rebuilt for each new question (and only then). */
  const questionNumber = ref(1);
  const isLocked = ref(false);
  const later = useLater();
  const runLog = useRunLog('dojo');
  const isPaused = ref(false);

  function ask(): void {
    question.value = nextQuestion(pools, random);
    questionNumber.value += 1;
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
    questionNumber,
    isLocked,
    isPaused,
    answer,
    endNow: () => (state.value = endedEarly(state.value)),
    pause: () => (isPaused.value = true),
    resume: () => (isPaused.value = false),
  };
}
