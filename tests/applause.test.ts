// Bunpou's applause: after a tale the crowd enjoyed, never after one that fell flat.
import { mount } from '@vue/test-utils';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { defineComponent, h } from 'vue';
import { seededRandom } from '../src/game/random.ts';
import * as rules from '../src/grammar/bunpou-run.ts';
import { makeTale } from '../src/grammar/tale.ts';
import { CURRICULUM, TEMPLATES } from '../src/grammar/templates.ts';
import { usePerformance } from '../src/grammar/usePerformance.ts';
import { playSound } from '../src/sound/sfx.ts';

vi.mock('../src/sound/sfx.ts', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../src/sound/sfx.ts')>()),
  playSound: vi.fn(),
}));

/** A tale's results: each line built right or wrong (its first two tiles swapped). */
function taleResults(plan: readonly ('right' | 'wrong')[]): rules.LineResult[] {
  const random = seededRandom(2);
  let run = rules.startBunpouRun(makeTale(CURRICULUM, TEMPLATES, random), 0, random);
  for (const outcome of plan) {
    const right = rules.currentLine(run).tiles.map((tile) => tile.text);
    const [first = '', second = '', ...rest] = right;
    const order = outcome === 'right' ? right : [second, first, ...rest];
    run = order.reduce((built, tile) => rules.placeTile(built, tile), run);
    run = rules.nextLine(run, 0, random);
  }
  return run.results;
}

/** Tells the tale to its end (Skip), as TalePerformance does. */
function tellTale(results: readonly rules.LineResult[]): void {
  mount(
    defineComponent({
      setup() {
        usePerformance(results, 0).skip();
        return () => h('div');
      },
    }),
  );
  vi.advanceTimersByTime(5000);
}

describe('applause after a tale', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.mocked(playSound).mockClear();
  });
  afterEach(() => vi.useRealTimers());

  it('follows the laugh at a tale the crowd enjoyed', () => {
    tellTale(taleResults(['right', 'right', 'right', 'right']));
    expect(playSound).toHaveBeenCalledWith('laughBig', 1);
    expect(playSound).toHaveBeenCalledWith('applause');
  });

  it('never follows a tale that fell flat, only coughs', () => {
    tellTale(taleResults(['wrong', 'wrong', 'wrong', 'right']));
    expect(playSound).toHaveBeenCalledWith('cough');
    expect(playSound).not.toHaveBeenCalledWith('applause');
  });
});
