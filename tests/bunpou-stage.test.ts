// The stage and the performance: the crowd's reaction, the storyteller's poses, slips and the chapter scroll.
import { mount } from '@vue/test-utils';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { nextTick } from 'vue';
import ChapterScroll from '../src/components/bunpou/ChapterScroll.vue';
import StoryStage from '../src/components/bunpou/StoryStage.vue';
import { crowdStrip } from '../src/components/bunpou/crowd-strip.ts';
import TalePerformance from '../src/components/bunpou/TalePerformance.vue';
import { seededRandom } from '../src/game/random.ts';
import * as rules from '../src/grammar/bunpou-run.ts';
import {
  crowdReaction,
  endsChapter,
  isLouderRoar,
  LINE_TOLD_MS,
  poseFor,
} from '../src/grammar/performance.ts';
import { makeTale } from '../src/grammar/tale.ts';
import { CURRICULUM, TEMPLATES } from '../src/grammar/templates.ts';

const POINTS = CURRICULUM;

/** A tale's results: each line built right, wrong (first two tiles swapped) or left to time out. */
function taleResults(plan: readonly ('right' | 'wrong' | 'timeout')[]): rules.LineResult[] {
  const random = seededRandom(2);
  let run = rules.startBunpouRun(makeTale(POINTS, TEMPLATES, random), 0, random);
  for (const outcome of plan) {
    const right = rules.currentLine(run).tiles.map((tile) => tile.text);
    const [first = '', second = '', ...rest] = right;
    if (outcome === 'timeout') run = rules.checkTime(run, run.deadlineMs);
    else {
      const order = outcome === 'right' ? right : [second, first, ...rest];
      run = order.reduce((built, tile) => rules.placeTile(built, tile), run);
    }
    run = rules.nextLine(run, 0, random);
  }
  return run.results;
}

afterEach(() => {
  vi.useRealTimers();
});

describe('the crowd', () => {
  it('roars at a tale told without a slip, and laughs, chuckles or goes quiet as slips add up', () => {
    expect(crowdReaction(taleResults(['right', 'right', 'right', 'right']))).toBe('roar');
    expect(crowdReaction(taleResults(['right', 'wrong', 'right', 'right']))).toBe('laugh');
    expect(crowdReaction(taleResults(['wrong', 'right', 'timeout', 'right']))).toBe('chuckle');
    expect(crowdReaction(taleResults(['wrong', 'wrong', 'timeout', 'right']))).toBe('silence');
  });

  it('roars louder when the tale ends at an S rank or above', () => {
    const clean = taleResults(['right', 'right', 'right', 'right']);
    expect(isLouderRoar(clean, 3)).toBe(false);
    expect(isLouderRoar(clean, 30)).toBe(true);
  });
});

describe('the storyteller', () => {
  it('raises the fan on a right line, trips on a wrong one, and forgets a timed-out one', () => {
    const [right, wrong, timedOut] = taleResults(['right', 'wrong', 'timeout', 'right']);
    expect([right, wrong, timedOut].map((result) => result && poseFor(result))).toEqual([
      'perform',
      'trip',
      'forgot',
    ]);
  });

  it('keeps one sealed slip per line built, and says what he says in a bubble', () => {
    const stage = mount(StoryStage, { props: { pose: 'forgot', slips: 3, bubble: 'えーと…' } });
    expect(stage.findAll('[data-sprite="slip"]')).toHaveLength(3);
    expect(stage.find('[data-testid="bubble"]').text()).toBe('えーと…');
  });

  it('puts a phone in the crowd when a tale falls flat', () => {
    const phoneScreen = '#a8dadc';
    const flat = mount(StoryStage, { props: { pose: 'idle', slips: 0, isPhoneOut: true } });
    expect(flat.find('[data-testid="crowd-near"]').html()).toContain(phoneScreen);
    const calm = mount(StoryStage, { props: { pose: 'idle', slips: 0 } });
    expect(calm.find('[data-testid="crowd-near"]').html()).not.toContain(phoneScreen);
  });

  it('packs the crowd in, with arms thrown up only when it cheers', () => {
    const still = crowdStrip('near', { isCheering: false, hasPhone: false });
    const cheering = crowdStrip('near', { isCheering: true, hasPhone: false });
    const bottomRow = still.at(-1) ?? '';
    expect(bottomRow).not.toContain('.');
    const darkPixels = (grid: readonly string[]): number => grid.join('').split('z').length - 1;
    expect(darkPixels(cheering)).toBeGreaterThan(darkPixels(still));
  });
});

describe('the performance', () => {
  it('tells the lines one at a time, unrolling a slip for each, then the crowd reacts', async () => {
    vi.useFakeTimers();
    const results = taleResults(['right', 'wrong', 'right', 'right']);
    const show = mount(TalePerformance, { props: { results, combo: 0, endsChapter: false } });
    const linesTold = (): number => show.findAll('[data-testid="tale-lines"] > li').length;
    expect(linesTold()).toBe(0);
    vi.advanceTimersByTime(1000);
    await nextTick();
    expect(linesTold()).toBe(1);
    expect(show.findAll('[data-sprite="slip"]')).toHaveLength(results.length - 1);
    vi.advanceTimersByTime(LINE_TOLD_MS.right + LINE_TOLD_MS.wrong + 2 * LINE_TOLD_MS.right);
    await nextTick();
    expect(linesTold()).toBe(results.length);
    expect(show.find('[data-testid="shout"]').text()).toBe('あはは！');
    show.unmount();
  });

  it('skips straight to the crowd’s reaction, then offers the next tale', async () => {
    const results = taleResults(['right', 'right', 'right', 'right']);
    const show = mount(TalePerformance, { props: { results, combo: 0, endsChapter: false } });
    await show.find('[data-testid="skip"]').trigger('click');
    expect(show.findAll('[data-testid="tale-lines"] > li')).toHaveLength(results.length);
    expect(show.find('[data-testid="shout"]').text()).toBe('大爆笑！');
    await show.find('[data-testid="next-tale"]').trigger('click');
    expect(show.emitted('next')).toHaveLength(1);
  });

  it('offers the chapter’s scroll after a chapter’s last tale', async () => {
    const results = taleResults(['right', 'right', 'right', 'right']);
    const show = mount(TalePerformance, { props: { results, combo: 0, endsChapter: true } });
    await show.find('[data-testid="skip"]').trigger('click');
    expect(show.find('[data-testid="next-tale"]').text()).toContain('Read the chapter');
  });
});

describe('the chapter scroll', () => {
  it('ends a chapter every third tale', () => {
    expect([1, 2, 3, 4, 6].map(endsChapter)).toEqual([false, false, true, false, true]);
  });

  it('shows the chapter’s number and each of its tales', () => {
    const tale = taleResults(['right', 'wrong', 'right', 'right']);
    const scroll = mount(ChapterScroll, { props: { chapter: 2, tales: [tale, tale, tale] } });
    expect(scroll.find('h2').text()).toBe('第2章');
    expect(scroll.findAll('article')).toHaveLength(3);
    expect(scroll.find('article h3').text()).toContain('◯ 3 / 4');
  });

  it('leads to the curtain call, since a show is one chapter', async () => {
    const tale = taleResults(['right']);
    const scroll = mount(ChapterScroll, { props: { chapter: 1, tales: [tale, tale, tale] } });
    const button = scroll.find('[data-testid="chapter-next"]');
    expect(button.text()).toContain('Curtain call');
    await button.trigger('click');
    expect(scroll.emitted('next')).toHaveLength(1);
  });
});
