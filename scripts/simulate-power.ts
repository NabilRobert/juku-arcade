/**
 * How often the measurement report detects a real effect (phase 3), by the
 * number of players who take the check-up for 14 days. Simulated players
 * have a planted +20-point play effect; 40 simulated classes per size.
 *
 *   npm run power
 */
import { seededRandom } from '../src/game/random.ts';
import { mergeExports } from './report/load.ts';
import { measure } from './report/measurement.ts';
import { simulateExports } from './report/simulate.ts';

const CLASS_SIZES = [7, 8, 12, 20, 30];
const CLASSES_PER_SIZE = 40;
const DAYS = 14;
const PLANTED = { before: 0.35, after: 0.6, held_back: 0.4 };

console.log(`| Players | "Play works" (true effect +20 points) | Not enough data |`);
console.log(`|---|---|---|`);
for (const players of CLASS_SIZES) {
  let works = 0;
  let tooLittle = 0;
  for (let seed = 1; seed <= CLASSES_PER_SIZE; seed++) {
    const events = mergeExports(
      simulateExports({ players, days: DAYS, recall: PLANTED, seed }),
    ).events;
    const verdict = measure(events, seededRandom(seed)).verdict;
    if (verdict === 'play_works') works += 1;
    if (verdict === 'not_enough_data') tooLittle += 1;
  }
  console.log(
    `| ${players} | ${works} of ${CLASSES_PER_SIZE} | ${tooLittle} of ${CLASSES_PER_SIZE} |`,
  );
}
