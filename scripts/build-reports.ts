/**
 * The report script (A2): reads a folder of exports and writes the class
 * report, the ability reports, the measurement report and the play report
 * (S1–S6) as Markdown, plus every event as CSV. The play report's deck
 * measures read the built decks in public/decks.
 *
 *   npm run report -- <exports folder> [output folder, default report-output]
 */
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { seededRandom } from '../src/game/random.ts';
import { eventsByPlayer } from './report/answers.ts';
import {
  commonConfusions,
  errorTypeRates,
  learnersNeedingHelp,
  mostMissedWords,
} from './report/class-report.ts';
import { deckCompletion, difficultyPredictions, readDecks } from './report/deck-measures.ts';
import { learnerReport } from './report/learner-report.ts';
import { readExportFolder } from './report/load.ts';
import { measure } from './report/measurement.ts';
import { checkUpUptake, comingBack, loopBalance, peekMeasure } from './report/play-measures.ts';
import { renderPlayReport } from './report/render-play.ts';
import {
  eventsCsv,
  renderClassReport,
  renderLearnerReports,
  renderMeasurement,
} from './report/render.ts';

/** A fixed seed, so the bootstrap interval is the same every time the report runs. */
const BOOTSTRAP_SEED = 20261121;
/** Where npm run decks writes the decks the play report's S2 and S3 need. */
const DECKS_FOLDER = 'public/decks';

const [exportFolder, outputFolder = 'report-output'] = process.argv.slice(2);
if (exportFolder === undefined) {
  console.error('Usage: npm run report -- <folder of export files> [output folder]');
  process.exit(1);
}

const { events, quality, levelByPlayer } = readExportFolder(exportFolder);
const decks = existsSync(DECKS_FOLDER) ? readDecks(DECKS_FOLDER) : null;
const now = new Date();
const learners = [...eventsByPlayer(events)].map(([playerId, playerEvents]) =>
  learnerReport(playerId, playerEvents, now),
);

mkdirSync(outputFolder, { recursive: true });
writeFileSync(
  join(outputFolder, 'measurement-report.md'),
  renderMeasurement(measure(events, seededRandom(BOOTSTRAP_SEED)), quality),
);
writeFileSync(
  join(outputFolder, 'class-report.md'),
  renderClassReport(
    mostMissedWords(events),
    commonConfusions(events),
    errorTypeRates(events),
    learnersNeedingHelp(events, now),
  ),
);
writeFileSync(join(outputFolder, 'ability-reports.md'), renderLearnerReports(learners));
writeFileSync(
  join(outputFolder, 'play-report.md'),
  renderPlayReport({
    comingBack: comingBack(events),
    deckCompletion: decks && deckCompletion(events, levelByPlayer, decks),
    predictions: decks && difficultyPredictions(events, levelByPlayer, decks),
    loop: loopBalance(events),
    peeks: peekMeasure(events),
    checkUpUptake: checkUpUptake(events),
  }),
);
writeFileSync(join(outputFolder, 'events.csv'), eventsCsv(events));
console.log(`Wrote 4 reports and events.csv for ${quality.players} players to ${outputFolder}/`);
