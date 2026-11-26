/**
 * Placeholder play for a local copy (VITE_SAMPLE_PLAY, see .env.example),
 * so the streak and the play calendar have something to show before
 * there's real play: a week's streak ending yesterday, with a different
 * amount played each day so the calendar's shades show. It's built from
 * today's date, so it moves with the calendar, and it's only shown, never
 * saved: turning it off leaves the real play log as it was.
 */
import { addDays } from './leitner.ts';
import type { KanjiRoundRecord, PlayMode, PlayedRun } from './play-log.ts';

const MS_PER_MINUTE = 60_000;
/** Sample runs start at 7 pm local time, a likely time to play after school or work. */
const SAMPLE_HOUR = 19;

interface SampleRun {
  mode: PlayMode;
  score: number;
  answered: number;
  right: number;
  minutes: number;
  haikuId?: string;
  /** Kanji mode's rounds: each kanji, and whether its round was perfect. */
  kanji?: readonly (readonly [string, boolean])[];
}

/** Seven days, oldest first; the last is yesterday. The answers per day climb unevenly. */
const SAMPLE_WEEK: readonly (readonly SampleRun[])[] = [
  [{ mode: 'words', score: 80, answered: 12, right: 10, minutes: 6 }],
  [
    { mode: 'words', score: 150, answered: 20, right: 17, minutes: 8 },
    { mode: 'bunpou', score: 1200, answered: 15, right: 12, minutes: 9, haikuId: 'park-cat' },
  ],
  [
    {
      mode: 'kanji',
      score: 70,
      answered: 6,
      right: 4,
      minutes: 4,
      kanji: [
        ['生', false],
        ['学', true],
        ['日', true],
        ['本', true],
        ['生', false],
        ['人', true],
      ],
    },
  ],
  [
    { mode: 'words', score: 220, answered: 30, right: 26, minutes: 11 },
    {
      mode: 'kanji',
      score: 160,
      answered: 8,
      right: 6,
      minutes: 6,
      kanji: [
        ['学', true],
        ['校', true],
        ['先', false],
        ['生', true],
        ['日', true],
        ['年', true],
        ['先', false],
        ['大', true],
      ],
    },
    { mode: 'bunpou', score: 2400, answered: 20, right: 18, minutes: 12, haikuId: 'old-pond' },
  ],
  [{ mode: 'words', score: 170, answered: 22, right: 18, minutes: 9 }],
  [
    { mode: 'words', score: 240, answered: 28, right: 25, minutes: 10 },
    { mode: 'bunpou', score: 1900, answered: 20, right: 16, minutes: 12, haikuId: 'school-cloud' },
  ],
  [
    { mode: 'words', score: 330, answered: 40, right: 36, minutes: 14 },
    {
      mode: 'kanji',
      score: 260,
      answered: 10,
      right: 9,
      minutes: 7,
      kanji: [
        ['学', true],
        ['生', true],
        ['日', true],
        ['本', true],
        ['人', true],
        ['大', true],
        ['年', true],
        ['校', true],
        ['先', true],
        ['気', false],
      ],
    },
    { mode: 'bunpou', score: 3600, answered: 30, right: 27, minutes: 15, haikuId: 'harvest-moon' },
  ],
];

function startOf(day: string, minutesIn: number): number {
  return (
    new Date(`${day}T${String(SAMPLE_HOUR).padStart(2, '0')}:00:00`).getTime() +
    minutesIn * MS_PER_MINUTE
  );
}

export function samplePlay(today: string): { runs: PlayedRun[]; kanjiRounds: KanjiRoundRecord[] } {
  const runs: PlayedRun[] = [];
  const kanjiRounds: KanjiRoundRecord[] = [];
  SAMPLE_WEEK.forEach((dayRuns, index) => {
    const day = addDays(today, index - SAMPLE_WEEK.length);
    let minutesIn = 0;
    dayRuns.forEach((sample, runIndex) => {
      const startedAtMs = startOf(day, minutesIn);
      minutesIn += sample.minutes;
      const { kanji = [], minutes, ...numbers } = sample;
      runs.push({
        id: `sample-${day}-${runIndex}`,
        day,
        startedAtMs,
        lastPlayedAtMs: startedAtMs + minutes * MS_PER_MINUTE,
        ...numbers,
      });
      kanji.forEach(([character, isPerfect]) =>
        kanjiRounds.push({ day, kanji: character, isPerfect }),
      );
    });
  });
  return { runs, kanjiRounds };
}
