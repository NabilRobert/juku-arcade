// Playing a kanji round: pick readings, throw them in turn, see the ones you missed.
import { mount } from '@vue/test-utils';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { defineComponent, h } from 'vue';
import { THROW_S } from '../src/game/tuning.ts';
import { PLAY_STEP_MS } from '../src/composables/useHand.ts';
import type { Deck, KanjiNote } from '../src/deck/types.ts';
import { CURSE_POINTS } from '../src/kanji/kanji-crests.ts';
import { POINTS_PER_HIT } from '../src/kanji/kanji-round.ts';
import { useKanjiRun } from '../src/kanji/useKanjiRun.ts';
import { playSound } from '../src/sound/sfx.ts';
import { deckWord, seededRandom } from './helpers/fixtures.ts';

vi.mock('../src/sound/sfx.ts', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../src/sound/sfx.ts')>()),
  playSound: vi.fn(),
}));

const note = (onyomi: string[], kunyomi: string[]): KanjiNote => ({
  onyomi,
  kunyomi,
  meanings: [],
  words: [],
  listLevel: 'N5',
});
const used = (id: string, readings: Record<string, string[]>) => ({
  ...deckWord(id, id, ''),
  kanjiReadingsUsed: readings,
});

const DECK: Deck = {
  level: 'N5',
  sourceCommit: 'test',
  kanji: Object.fromEntries(
    ['生', '学', '日', '人', '山', '川', '木', '火', '水'].map((kanji) => [kanji, note([], [])]),
  ),
  words: [
    used('a', { 生: ['セイ', 'う.まれる'] }),
    used('b', { 学: ['ガク'] }),
    used('c', { 日: ['ニチ'] }),
    used('d', { 人: ['ひと'] }),
    used('e', { 山: ['やま'] }),
    used('f', { 川: ['かわ'] }),
    used('g', { 木: ['き'] }),
    used('h', { 火: ['ひ'] }),
    used('i', { 水: ['みず'] }),
  ],
};

const THROW_MS = THROW_S * 1000;

function runFor(seed = 2) {
  let run!: ReturnType<typeof useKanjiRun>;
  mount(
    defineComponent({
      setup() {
        run = useKanjiRun(DECK, seededRandom(seed));
        return () => h('div');
      },
    }),
  );
  return run;
}

function rightIndexes(run: ReturnType<typeof useKanjiRun>): number[] {
  return run.round.value.cards.flatMap((card, index) => (card.isRight ? [index] : []));
}

describe('a kanji round', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('lets the player pick cards and put them back, and plays only once something is picked', () => {
    const run = runFor();
    expect(run.canPlay.value).toBe(false);
    run.toggle(0);
    expect(run.statusOf(0)).toBe('selected');
    run.toggle(0);
    expect(run.statusOf(0)).toBe('idle');
  });

  it('throws the picked cards one at a time, then shows the right readings left in the hand', () => {
    const run = runFor();
    const rights = rightIndexes(run);
    const wrong = run.round.value.cards.findIndex((card) => !card.isRight);
    const [firstRight] = rights;
    if (firstRight === undefined) throw new Error('the round has no right reading');
    run.toggle(firstRight);
    run.toggle(wrong);
    run.play();
    vi.advanceTimersByTime(0);
    expect(run.thrown.value).toHaveLength(1);
    vi.advanceTimersByTime(PLAY_STEP_MS + THROW_MS);
    expect(run.phase.value).toBe('revealed');
    expect(run.statusOf(firstRight)).toBe('matched');
    expect(run.statusOf(wrong)).toBe('wrong');
    for (const missed of rights.slice(1)) expect(run.statusOf(missed)).toBe('correct');
    expect(run.score.value).toBe(POINTS_PER_HIT);
  });

  it('builds the combo with each right card and breaks it on a wrong one', () => {
    const run = runFor();
    const rights = rightIndexes(run);
    for (const index of rights) run.toggle(index);
    run.play();
    vi.advanceTimersByTime(10_000);
    expect(run.combo.value).toBe(rights.length);
    run.toggle(run.round.value.cards.findIndex((card) => !card.isRight));
    run.play();
    vi.advanceTimersByTime(THROW_MS);
    expect(run.combo.value).toBe(0);
  });

  it('deals the next kanji after the answers have shown', () => {
    const run = runFor();
    const first = run.round.value.kanji;
    run.toggle(rightIndexes(run)[0] ?? 0);
    run.play();
    vi.advanceTimersByTime(10_000);
    expect(run.roundNumber.value).toBe(2);
    expect(run.round.value.kanji).not.toBe(first);
    expect(run.phase.value).toBe('picking');
  });
});

/** A seed whose first round hides a curse (found by trying seeds). */
const CURSED_FIRST_ROUND_SEED = 5;

describe('scouting in a kanji round', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('turns the hand face down while scouting, and holds Play until it is turned back', () => {
    const run = runFor();
    run.toggle(0);
    run.toggleScout();
    expect(run.statusOf(1)).toBe('hidden');
    expect(run.canPlay.value).toBe(false);
    run.toggleScout();
    expect(run.statusOf(0)).toBe('selected');
    expect(run.canPlay.value).toBe(true);
  });

  it('earns a scout back for a perfect round', () => {
    const run = runFor();
    run.toggleScout();
    run.toggleScout();
    const before = run.scoutsLeft.value;
    for (const index of rightIndexes(run)) run.toggle(index);
    run.play();
    vi.advanceTimersByTime(10_000);
    expect(run.scoutsLeft.value).toBe(before + 1);
  });

  it('never lets a curse take the score below nothing', () => {
    const run = runFor(CURSED_FIRST_ROUND_SEED);
    run.toggleScout();
    const cursed = [...run.crestMarks.value].find(([, mark]) => mark.symbol === '黒')?.[0];
    run.toggleScout();
    for (let index = 0; index < run.round.value.cards.length; index += 1) {
      if (!(run.round.value.cards[index]?.isRight ?? false)) run.toggle(index);
    }
    run.play();
    vi.advanceTimersByTime(10_000);
    expect(run.score.value).toBe(0);
    expect(cursed).toBeDefined();
    expect(run.lastResult.value?.crestPoints).toBe(-CURSE_POINTS);
  });
});

describe('three wrong picks per kanji', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  const wrongIndexes = (run: ReturnType<typeof useKanjiRun>) =>
    run.round.value.cards.flatMap((card, index) => (card.isRight ? [] : [index]));

  it('lets the player pick again after a wrong pick, and keeps the wrong card out of play', () => {
    const run = runFor();
    const wrong = wrongIndexes(run)[0] ?? 0;
    run.toggle(wrong);
    run.play();
    vi.advanceTimersByTime(10_000);
    expect(run.phase.value).toBe('picking');
    expect(run.roundNumber.value).toBe(1);
    expect(run.wrongPicksLeft.value).toBe(2);
    expect(run.statusOf(wrong)).toBe('wrong');
    run.toggle(wrong);
    expect(run.picked.value).toEqual([]);
  });

  it('applauds a kanji whose readings were all found, but not one left with readings missed', () => {
    vi.mocked(playSound).mockClear();
    const missed = runFor();
    for (const index of wrongIndexes(missed).slice(0, 3)) missed.toggle(index);
    missed.play();
    vi.advanceTimersByTime(10_000);
    expect(playSound).not.toHaveBeenCalledWith('applause');

    const found = runFor();
    for (const index of rightIndexes(found)) found.toggle(index);
    found.play();
    vi.advanceTimersByTime(10_000);
    expect(playSound).toHaveBeenCalledWith('applause');
  });

  it('shows the answers after the third wrong pick', () => {
    const run = runFor();
    for (const index of wrongIndexes(run).slice(0, 3)) run.toggle(index);
    run.play();
    vi.advanceTimersByTime(PLAY_STEP_MS * 3 + THROW_MS);
    expect(run.phase.value).toBe('revealed');
    expect(run.wrongPicksLeft.value).toBe(0);
  });
});
