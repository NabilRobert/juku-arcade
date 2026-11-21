/**
 * Writes the reports as Markdown for teachers and managers, and the events
 * as CSV for a spreadsheet. Every figure says how many learners or answers
 * it rests on; anything resting on too few says so instead of a number.
 */
import type { GameEvent } from '../../src/game/events.ts';
import { shortId } from './answers.ts';
import type { ConfusionRow, ErrorTypeRow, HelpRow, WordRow } from './class-report.ts';
import { MIN_LEARNERS } from './class-report.ts';
import type { LearnerReport } from './learner-report.ts';
import type { DataQuality } from './load.ts';
import type { Measurement, Verdict } from './measurement.ts';

const percent = (share: number | null): string => (share === null ? '–' : `${Math.round(share)}%`);
const shareText = (share: number | null): string => percent(share === null ? null : share * 100);
const table = (header: string[], rows: string[][]): string =>
  [
    `| ${header.join(' | ')} |`,
    `|${header.map(() => '---').join('|')}|`,
    ...rows.map((row) => `| ${row.join(' | ')} |`),
  ].join('\n');

const VERDICTS: Record<Verdict, string> = {
  play_works: 'Play works: recall after play beats held-back words by 15 points or more.',
  play_does_not_help: "Play doesn't help recall: the whole interval is below +5 points.",
  too_early: 'Too early to tell: the interval is too wide to say.',
  not_enough_data:
    'Not enough data yet (at least 5 players, 200 after-answers and 100 held-back answers).',
};

export function renderQuality(quality: DataQuality): string {
  return [
    '## Data checked',
    `- ${quality.filesRead} export files, ${quality.players} players, ${quality.eventsRead} events read.`,
    `- ${quality.duplicatesDropped} duplicate events dropped (the same export sent twice).`,
    `- ${quality.unknownSchemaEvents} events with an unknown format version; ${quality.clockJumps} clock jumps.`,
  ].join('\n');
}

export function renderMeasurement(measurement: Measurement, quality: DataQuality): string {
  const { accuracy, answers, interval, playEffect } = measurement;
  const effect =
    playEffect === null || interval === null
      ? 'No number: see the verdict.'
      : `**${playEffect.toFixed(1)} points** (95% interval ${interval[0].toFixed(1)} to ${interval[1].toFixed(1)}).`;
  return [
    '# Measurement report: does play improve recall?',
    `**Verdict:** ${VERDICTS[measurement.verdict]}`,
    `Play effect (after minus held back): ${effect}`,
    table(
      ['Question', 'Answers', 'Correct'],
      [
        ['Before play', String(answers.before), percent(accuracy.before)],
        ['After play', String(answers.after), percent(accuracy.after)],
        ['Held back (no play)', String(answers.held_back), percent(accuracy.held_back)],
      ],
    ),
    `From ${measurement.players} players who took the check-up. Chance is 25%.`,
    renderQuality(quality),
  ].join('\n\n');
}

const TOO_FEW = `_Too few learners (fewer than ${MIN_LEARNERS}) for this yet._`;

function wordsSection(words: WordRow[]): string {
  if (words.length === 0) return TOO_FEW;
  const rows = words.map((row) => [
    row.isFlagged ? `**${row.word}** ⚑ re-teach` : row.word,
    String(row.learnersMet),
    `${row.missedAnswers} of ${row.answers}`,
    shareText(row.share),
  ]);
  return table(['Word', 'Learners', 'Answers missed', 'Share missed'], rows);
}

function confusionsSection(confusions: ConfusionRow[]): string {
  if (confusions.length === 0) return TOO_FEW;
  const rows = confusions.map((row) => [
    row.word,
    row.picked,
    row.isDecoy ? 'decoy' : 'another word',
    String(row.learners),
  ]);
  return table(['Word', 'Picked instead', 'Kind', 'Learners'], rows);
}

function errorTypesSection(errorTypes: ErrorTypeRow[]): string {
  if (errorTypes.length === 0) return '_Exposure unknown: these exports have no deal events yet._';
  const rows = errorTypes.map((row) => [
    row.isFlagged ? `**${row.errorType}** ⚑ drill` : row.errorType,
    String(row.shown),
    String(row.missed),
    shareText(row.rate),
  ]);
  return table(['Error type', 'Shown', 'Missed', 'Rate'], rows);
}

export function renderClassReport(
  words: WordRow[],
  confusions: ConfusionRow[],
  errorTypes: ErrorTypeRow[],
  help: HelpRow[],
): string {
  const helpRows = help.map((row) => [shortId(row.playerId), row.reason]);
  return [
    '# Class report',
    '## What to re-teach: most-missed words',
    wordsSection(words),
    '## Common confusions',
    confusionsSection(confusions),
    '## Error types (misses per time shown)',
    errorTypesSection(errorTypes),
    '## Who might need help',
    helpRows.length ? table(['Player', 'Why'], helpRows) : '_Nobody flagged._',
  ].join('\n\n');
}

function renderLearner(report: LearnerReport): string {
  const weak = report.weakWords
    .map(
      (word) =>
        `${word.word} (${word.misses}× missed${word.usualPick ? `, usually read as ${word.usualPick}` : ''})`,
    )
    .join('; ');
  const retention = report.retention
    .map((bucket) => `${bucket.label}: ${shareText(bucket.accuracy)} of ${bucket.answers}`)
    .join(', ');
  const speed = report.speedByWeek
    .map((ms) => (ms === null ? '–' : `${(ms / 1000).toFixed(1)} s`))
    .join(' → ');
  return [
    `## Player ${shortId(report.playerId)}`,
    `- Words known: ${report.wordsKnown} of ${report.wordsSeen} seen.`,
    `- Weak words: ${weak || 'none yet'}.`,
    `- Error types: ${
      Object.entries(report.errorTypes)
        .map(([type, count]) => `${type} ${count}`)
        .join(', ') || 'none yet'
    }.`,
    `- Recall speed by week (oldest first): ${speed}.`,
    `- Held after: ${retention}.`,
  ].join('\n');
}

export function renderLearnerReports(reports: LearnerReport[]): string {
  return ['# Ability reports, by anonymous player ID', ...reports.map(renderLearner)].join('\n\n');
}

function csvCell(value: unknown): string {
  const text = value === null || value === undefined ? '' : String(value);
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

export function eventsCsv(events: readonly GameEvent[]): string {
  const first = events[0];
  if (first === undefined) return '';
  const columns = Object.keys(first) as (keyof GameEvent)[];
  const rows = events.map((event) => columns.map((column) => csvCell(event[column])).join(','));
  return [columns.join(','), ...rows].join('\n');
}
