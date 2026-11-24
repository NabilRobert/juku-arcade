// Logging Bunpou's lines: each judged line becomes a grammar log event, updates reviews and is saved.
import 'fake-indexeddb/auto';
import { mount } from '@vue/test-utils';
import { describe, expect, it, vi } from 'vitest';
import { nextTick } from 'vue';
import BunpouResults from '../src/components/bunpou/BunpouResults.vue';
import BunpouScreen from '../src/components/bunpou/BunpouScreen.vue';
import { seededRandom } from '../src/game/random.ts';
import { loadHaikuShelf } from '../src/grammar/haiku.ts';
import * as rules from '../src/grammar/bunpou-run.ts';
import { makeTale } from '../src/grammar/tale.ts';
import { CURRICULUM, TEMPLATES } from '../src/grammar/templates.ts';
import { useGrammarReviews } from '../src/grammar/useGrammarReviews.ts';
import { deleteAllData, loadGrammarEvents, type Settings } from '../src/memory/storage.ts';

const SETTINGS: Settings = {
  playerId: 'player-1',
  level: 'N5',
  classCode: 'N5-SAT',
  bestCombo: 0,
  playDay: null,
  playMsToday: 0,
  checkUpOfferedDay: null,
};

function judgedLine(isRightOrder: boolean): rules.LineResult {
  const random = seededRandom(4);
  const run = rules.startBunpouRun(makeTale(CURRICULUM, TEMPLATES, random), 0, random);
  const right = rules.currentLine(run).tiles.map((tile) => tile.text);
  const [first = '', second = '', ...rest] = right;
  const order = isRightOrder ? right : [second, first, ...rest];
  const judged = order.reduce((built, tile) => rules.placeTile(built, tile), run);
  const result = judged.results[0];
  if (result === undefined) throw new Error('the line was not judged');
  return result;
}

describe('the grammar log', () => {
  it('logs a wrong line with its point, outcome, broken rule and answer, and saves it', async () => {
    await deleteAllData();
    const reviews = useGrammarReviews(CURRICULUM, SETTINGS, []);
    const result = judgedLine(false);
    reviews.logJudged(result, 5200);
    await new Promise((resolve) => setTimeout(resolve, 50));
    const [event] = await loadGrammarEvents();
    expect(event).toMatchObject({
      player_id: 'player-1',
      class_code: 'N5-SAT',
      point_id: result.sentence.point,
      template_id: result.sentence.templateId,
      outcome: 'wrong',
      broken_rule: 'particle_after_wrong_word',
      answer: result.answer.join('|'),
      ms_taken: 5200,
      box_before: null,
    });
  });

  it('updates today’s grammar and the run’s lines as soon as a line is judged', () => {
    const reviews = useGrammarReviews(CURRICULUM, SETTINGS, []);
    reviews.logJudged(judgedLine(true), 3000);
    reviews.logJudged(judgedLine(false), 3000);
    expect(reviews.progress.value.pointsSeen).toBe(1);
    expect(reviews.lines.value).toEqual({ played: 2, right: 1 });
  });
});

describe('the results screen', () => {
  it('shows the run and the grammar reviews, and offers another run', async () => {
    const results = mount(BunpouResults, {
      props: {
        score: 450,
        bestCombo: 4,
        lines: { played: 6, right: 5 },
        progress: {
          daily: { done: 2, total: 5, isCleared: false },
          pointsSeen: 6,
          pointsKnown: 1,
          pointCount: 10,
        },
        best: 450,
        isNewBest: true,
        rank: 13,
      },
    });
    const value = (label: string): string => results.find(`[data-testid="result-${label}"]`).text();
    expect(value('Lines right')).toBe('5 / 6');
    expect(value('Grammar known')).toBe('1 / 10');
    expect(value('Today')).toBe('2 / 5');
    expect(value('Best run')).toBe('450 ★');
    expect(value('Board rank')).toBe('#13');
    await results.find('[data-testid="play-again"]').trigger('click');
    expect(results.emitted('again')).toHaveLength(1);
  });
});

describe('ending a run', () => {
  it('bows, closes on a haiku added to the collection, then shows the results', async () => {
    vi.useFakeTimers();
    localStorage.clear();
    const screen = mount(BunpouScreen, {
      props: { level: 'N5', settings: SETTINGS, pastGrammarEvents: [], isAway: false },
    });
    expect(screen.find('[data-testid="strip"]').exists()).toBe(true);
    await screen.find('[data-testid="end-run"]').trigger('click');
    expect(screen.find('[data-testid="strip"]').exists()).toBe(false);
    expect(screen.find('[data-testid="stage"]').attributes('data-pose')).toBe('bow');
    expect(screen.find('[data-testid="curtain-left"]').attributes('data-closed')).toBeUndefined();
    vi.advanceTimersByTime(2000);
    await nextTick();
    expect(screen.find('[data-testid="curtain-left"]').attributes('data-closed')).toBe('');
    expect(screen.find('[data-testid="curtain-right"]').attributes('data-closed')).toBe('');
    vi.advanceTimersByTime(1000);
    await nextTick();
    expect(screen.find('[data-testid="haiku-new"]').exists()).toBe(true);
    expect(loadHaikuShelf().collected).toHaveLength(1);
    await screen.find('[data-testid="see-results"]').trigger('click');
    expect(screen.find('[data-testid="results"]').exists()).toBe(true);
    screen.unmount();
    vi.useRealTimers();
  });
});
