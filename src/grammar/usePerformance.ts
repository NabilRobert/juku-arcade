/**
 * Plays a tale's performance on screen (D58): a short shamisen opening,
 * then each line told in turn (performance.ts sets the pose, and how long
 * each line stays up), then the crowd's reaction with its sound. Skip
 * jumps straight to the reaction.
 */
import { computed, ref } from 'vue';
import { useLater } from '../composables/useLater.ts';
import { playSound } from '../sound/sfx.ts';
import type { StorytellerPose } from '../components/bunpou/stage-sprites.ts';
import type { LineResult } from './bunpou-run.ts';
import {
  crowdReaction,
  isLouderRoar,
  LINE_TOLD_MS,
  lineOutcome,
  poseFor,
  type CrowdReaction,
} from './performance.ts';

/** The opening's three plucks: the root, a fourth and a fifth above, this far apart. */
const SHAMISEN_PITCHES = [1, 4 / 3, 3 / 2] as const;
const PLUCK_GAP_MS = 180;
const OPENING_MS = 900;
const COUGH_GAP_MS = 600;
/** What the storyteller says on a line he forgets, and into a silent room. */
export const FORGOT_LINE = 'えーと…';
const SILENT_ROOM = '…';

function playReaction(
  reaction: CrowdReaction,
  isLouder: boolean,
  later: ReturnType<typeof useLater>,
) {
  if (reaction === 'roar') playSound('laughBig', isLouder ? 1.2 : 1);
  else if (reaction === 'laugh') playSound('laugh');
  else if (reaction === 'chuckle') playSound('chuckle');
  else {
    playSound('cough');
    later(() => playSound('cough', 0.9), COUGH_GAP_MS);
  }
}

function playLine(result: LineResult): void {
  const outcome = lineOutcome(result);
  if (outcome === 'right') playSound('fanTap');
  else if (outcome === 'wrong') playSound('miss');
}

export function usePerformance(results: readonly LineResult[], combo: number) {
  const later = useLater();
  const told = ref(0);
  const isFinished = ref(false);
  /** Bumped by Skip, so steps already waiting don't run. */
  let generation = 0;
  const reaction = crowdReaction(results);
  const isLouder = isLouderRoar(results, combo);

  function finish(): void {
    told.value = results.length;
    isFinished.value = true;
    playReaction(reaction, isLouder, later);
  }

  function tell(index: number, forGeneration: number): void {
    if (forGeneration !== generation) return;
    const result = results[index];
    if (result === undefined) return finish();
    told.value = index + 1;
    playLine(result);
    later(() => tell(index + 1, forGeneration), LINE_TOLD_MS[lineOutcome(result)]);
  }

  SHAMISEN_PITCHES.forEach((pitch, index) => {
    later(() => playSound('shamisen', pitch), index * PLUCK_GAP_MS);
  });
  later(() => tell(0, generation), OPENING_MS);

  const current = computed(() => results[told.value - 1]);
  const pose = computed<StorytellerPose>(() => {
    if (isFinished.value) return reaction === 'silence' ? 'idle' : 'perform';
    return current.value === undefined ? 'idle' : poseFor(current.value);
  });
  const bubble = computed(() => {
    if (isFinished.value) return reaction === 'silence' ? SILENT_ROOM : null;
    return current.value?.isTimedOut === true ? FORGOT_LINE : null;
  });

  function skip(): void {
    if (isFinished.value) return;
    generation += 1;
    finish();
  }

  return { told, isFinished, reaction, isLouder, pose, bubble, skip };
}
