/**
 * Writes the play report: the game measures S1–S6 (phase 3), each with the
 * reading phase 3 gives it, for whoever tunes the game. Thresholds below
 * are phase 3's; under the minimum sample a measure says "too few" rather
 * than suggesting a change.
 */
import type { PredictionScore } from './deck-measures.ts';
import type { ComingBack, LoopBalance, PeekMeasure, Share } from './play-measures.ts';
import { QUIT_WITHIN_SETS } from './play-measures.ts';

/** S3: the learned miss chance must beat the guess by this share of log loss. */
export const LEARNED_MUST_BEAT_BY = 0.05;
/** S4: level-5 sets timing out this often means the level-5 timer is too short. */
export const TOP_LEVEL_TIMEOUT_LIMIT = 0.4;
/** S4: quitting right after a 5→1 drop more often than this means the rule is too harsh. */
export const QUIT_AFTER_DROP_LIMIT = 0.3;
/** S6: check-ups on fewer play days than this leave the headline thin. */
export const CHECK_UP_UPTAKE_FLOOR = 0.3;
/** Smallest samples worth a suggestion: answers for S3, sets and drops for S4. */
export const MIN_PREDICTION_ATTEMPTS = 200;
export const MIN_TOP_LEVEL_SETS = 20;
export const MIN_DROPS = 10;

export interface PlayMeasures {
  comingBack: ComingBack;
  /** Null when the decks weren't found, so S2 and S3 can't be worked out. */
  deckCompletion: Share | null;
  predictions: PredictionScore | null;
  loop: LoopBalance;
  peeks: PeekMeasure;
  checkUpUptake: Share;
}

const NO_DECKS = 'Decks not found: run `npm run decks` first, then the report again.';

function shareOf(share: Share): number | null {
  return share.total === 0 ? null : share.count / share.total;
}

function shareText(share: Share): string {
  const value = shareOf(share);
  if (value === null) return 'none yet';
  return `${share.count} of ${share.total} (${Math.round(value * 100)}%)`;
}

function renderComingBack(result: ComingBack): string {
  const average =
    result.averageDaysOfFirst14 === null
      ? "No player's first 14 days have passed yet."
      : `${result.averageDaysOfFirst14.toFixed(1)} days, from ${result.playersPastFirst14} players whose first 14 days have passed.`;
  return [
    '## S1. Coming back',
    `- ${result.players} players played at least one set.`,
    `- Back the next day: ${shareText(result.backOnDay2)}. Back on day 7: ${shareText(result.backOnDay7)}.`,
    `- Average days played out of the first 14: ${average}`,
    "Phase 3 sets no target here until we know the school's usage.",
  ].join('\n');
}

function renderDeckCompletion(completion: Share | null): string {
  if (completion === null) return `## S2. Daily deck completion\n${NO_DECKS}`;
  return [
    '## S2. Daily deck completion',
    `- Play days that ended with the daily deck cleared: ${shareText(completion)}.`,
    'Mostly cleared means the deck could grow (`NEW_WORDS_PER_DAY` in `src/game/tuning.ts`); rarely cleared means it could shrink.',
  ].join('\n');
}

function predictionVerdict(score: PredictionScore): string {
  const { guessLogLoss, learnedLogLoss } = score;
  if (
    score.attempts < MIN_PREDICTION_ATTEMPTS ||
    guessLogLoss === null ||
    learnedLogLoss === null
  ) {
    return `Too few later answers to judge (${score.attempts}; at least ${MIN_PREDICTION_ATTEMPTS} needed).`;
  }
  const gain = 1 - learnedLogLoss / guessLogLoss;
  const numbers = `Log loss: starting guess ${guessLogLoss.toFixed(3)}, learned ${learnedLogLoss.toFixed(3)}, on ${score.attempts} later answers: the learned chance is ${(gain * 100).toFixed(1)}% better.`;
  const verdict =
    gain >= LEARNED_MUST_BEAT_BY
      ? 'The learned difficulty earns its place.'
      : 'The learned difficulty does not beat the guess by 5%: keep the guess or simplify.';
  return `${numbers}\n- **${verdict}**`;
}

function renderPredictions(score: PredictionScore | null): string {
  if (score === null) return `## S3. Difficulty learns\n${NO_DECKS}`;
  return `## S3. Difficulty learns\n- ${predictionVerdict(score)}`;
}

function topLevelTimeouts(loop: LoopBalance): string {
  const top = loop.levels.at(-1);
  if (top === undefined || top.sets < MIN_TOP_LEVEL_SETS) {
    return `Too few level-5 sets to judge the timer (at least ${MIN_TOP_LEVEL_SETS} needed).`;
  }
  const share = top.timedOutSets / top.sets;
  const verdict =
    share >= TOP_LEVEL_TIMEOUT_LIMIT
      ? '**The level-5 timer looks too short:** raise the last `SET_SECONDS_BY_LEVEL` in `src/game/tuning.ts`.'
      : 'Under the 40% limit: the level-5 timer is fine.';
  return `Level-5 sets that timed out: ${Math.round(share * 100)}%. ${verdict}`;
}

function dropsVerdict(loop: LoopBalance): string {
  const drops = loop.dropsFromTop.count;
  const quits = `${loop.quitsAfterDrop} of ${drops} drops from level 5 to 1 were followed by quitting within ${QUIT_WITHIN_SETS} sets`;
  if (drops < MIN_DROPS) return `${quits}: too few drops to judge (at least ${MIN_DROPS} needed).`;
  const isHarsh = loop.quitsAfterDrop / drops > QUIT_AFTER_DROP_LIMIT;
  return isHarsh
    ? `${quits}. **Over 30%: the 5→1 rule looks too harsh.**`
    : `${quits}. Within the 30% limit: the 5→1 rule is fine.`;
}

function renderLoop(loop: LoopBalance): string {
  const rows = loop.levels.map((row) => {
    const missesPerSet = row.sets === 0 ? '–' : (row.misses / row.sets).toFixed(2);
    return `| ${row.level} | ${row.sets} | ${row.timedOutSets} | ${missesPerSet} |`;
  });
  return [
    '## S4. Loop balance',
    '| Level | Sets | Timed out | Misses per set |\n|---|---|---|---|',
    ...rows,
    '',
    `- ${topLevelTimeouts(loop)}`,
    `- ${dropsVerdict(loop)}`,
  ].join('\n');
}

function renderPeeks(peeks: PeekMeasure): string {
  const perSet = peeks.sets === 0 ? '–' : (peeks.peeks / peeks.sets).toFixed(2);
  return [
    '## S5. Peeks',
    `- ${peeks.peeks} peeks in ${peeks.sets} sets (${perSet} per set).`,
    `- Next answer right, in a later set: words peeked at ${shareText(peeks.peekedThenRight)}; words only missed ${shareText(peeks.missedThenRight)}.`,
    'If peeked words come back right more often than missed ones, pause and flip is helping.',
  ].join('\n');
}

function renderUptake(uptake: Share): string {
  const share = shareOf(uptake);
  const warning =
    share !== null && share < CHECK_UP_UPTAKE_FLOOR
      ? '\n- **Below 30%: the headline will be thin. Tell the school early.**'
      : '';
  return `## S6. Check-up uptake\n- Play days with a check-up: ${shareText(uptake)}.${warning}`;
}

export function renderPlayReport(measures: PlayMeasures): string {
  return [
    '# Play report: how the game itself is working',
    'These measures describe the game, not learning; learning is in `measurement-report.md`.',
    renderComingBack(measures.comingBack),
    renderDeckCompletion(measures.deckCompletion),
    renderPredictions(measures.predictions),
    renderLoop(measures.loop),
    renderPeeks(measures.peeks),
    renderUptake(measures.checkUpUptake),
  ].join('\n\n');
}
