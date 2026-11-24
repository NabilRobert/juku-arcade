// Bunpou on screen: placing and taking back tiles, keys, a miss's fix, pausing, and the tale's reveal.
import { mount } from '@vue/test-utils';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { defineComponent, h, nextTick } from 'vue';
import BunpouBoard from '../src/components/bunpou/BunpouBoard.vue';
import SentenceFix from '../src/components/bunpou/SentenceFix.vue';
import HintToggle from '../src/components/bunpou/HintToggle.vue';
import TaleReveal from '../src/components/bunpou/TaleReveal.vue';
import ModePicker from '../src/components/ModePicker.vue';
import { parseFurigana } from '../src/deck/furigana.ts';
import { seededRandom } from '../src/game/random.ts';
import * as rules from '../src/grammar/bunpou-run.ts';
import { areHintsShown, setHintsShown } from '../src/grammar/hints.ts';
import { makeTale } from '../src/grammar/tale.ts';
import { POINT_PATTERNS, TEMPLATES } from '../src/grammar/templates.ts';
import { useBunpouRun } from '../src/grammar/useBunpouRun.ts';

const POINTS = Object.keys(POINT_PATTERNS);

function freshRun(): rules.BunpouRun {
  const random = seededRandom(9);
  return rules.startBunpouRun(makeTale(POINTS, TEMPLATES, random), 0, random);
}

const rightOrder = (run: rules.BunpouRun): string[] =>
  rules.currentLine(run).tiles.map((tile) => tile.text);

/** A run whose first line was built wrong: its first two tiles swapped. */
function missedRun(): rules.BunpouRun {
  const run = freshRun();
  const [first = '', second = '', ...rest] = rightOrder(run);
  return [second, first, ...rest].reduce((built, tile) => rules.placeTile(built, tile), run);
}

/** The line's grammar pattern as it reads, without its furigana markup. */
function patternOf(run: rules.BunpouRun): string {
  const marked = POINT_PATTERNS[rules.currentLine(run).point] ?? '';
  return parseFurigana(marked)
    .map((piece) => piece.text)
    .join('');
}

/** An element's text without its furigana (the <rt> readings). */
function withoutFurigana(element: Element): string {
  const copy = element.cloneNode(true) as Element;
  for (const reading of copy.querySelectorAll('rt')) reading.remove();
  return copy.textContent ?? '';
}

const mountBoard = (run: rules.BunpouRun) =>
  mount(BunpouBoard, {
    props: { run, unplaced: run.offered.filter((tile) => !run.placed.includes(tile)), timeLeft: 1 },
  });

afterEach(() => {
  vi.useRealTimers();
});

describe('Bunpou on screen', () => {
  it('is the third mode on the start screen', async () => {
    const picker = mount(ModePicker, { props: { level: 'N5' } });
    const buttons = picker.find('[aria-label="Choose a mode"]').findAll('button');
    await buttons[2]?.trigger('click');
    expect(picker.emitted('choose')?.[0]).toEqual(['bunpou']);
  });

  it('places an offered tile when tapped, and takes a placed one back', async () => {
    const run = freshRun();
    const [first = ''] = run.offered;
    await mountBoard(run).find('[data-testid="offered"] button').trigger('click');
    const board = mountBoard(rules.placeTile(run, first));
    await board.find('[data-testid="strip"] button').trigger('click');
    expect(board.emitted('takeBack')?.[0]).toEqual([first]);
  });

  it('shows a missed line’s tiles with the wrong ones marked, the fix and its pattern', () => {
    const run = missedRun();
    const fix = mountBoard(run).find('[data-testid="sentence-fix"]');
    expect(fix.findAll('[data-wrong]')).toHaveLength(2);
    expect(withoutFurigana(fix.find('[data-testid="fix"]').element)).toContain(
      rightOrder(run).join(''),
    );
    expect(withoutFurigana(fix.element)).toContain(patternOf(run));
  });

  it('shows えーと… for a line that timed out with nothing placed', () => {
    const run = freshRun();
    const result = rules.checkTime(run, run.deadlineMs).results[0];
    if (result === undefined) throw new Error('the line did not time out');
    expect(mount(SentenceFix, { props: { result } }).text()).toContain('えーと…');
  });

  it('turns the tiles face down in place while paused and lists the run’s misses', () => {
    const judged = missedRun();
    const paused = rules.pause(rules.nextLine(judged, 0, seededRandom(1)), 0);
    const board = mountBoard(paused);
    const offered = board.find('[data-testid="offered"]').findAll('button');
    expect(offered.length).toBeGreaterThan(0);
    for (const tile of offered) {
      expect(tile.attributes('aria-label')).toBe('Face-down tile');
      expect(tile.attributes('disabled')).toBeDefined();
    }
    expect(board.find('[data-testid="strip"]').exists()).toBe(true);
    expect(board.find('[data-testid="pause-hint"]').exists()).toBe(true);
    expect(
      board.find('[data-testid="paused"]').findAll('[data-testid="sentence-fix"]'),
    ).toHaveLength(1);
  });

  it('hints at the line’s grammar point by its pattern', () => {
    setHintsShown(true);
    const run = freshRun();
    const board = mountBoard(run);
    expect(withoutFurigana(board.find('[data-testid="hint"]').element)).toBe(patternOf(run));
  });

  it('hides the hint once the switch turns it off, and remembers that', async () => {
    setHintsShown(true);
    const board = mountBoard(freshRun());
    await mount(HintToggle).trigger('click');
    expect(areHintsShown.value).toBe(false);
    expect(localStorage.getItem('juku-arcade:bunpou-hints')).toBe('false');
    expect(board.find('[data-testid="hint"]').exists()).toBe(false);
    setHintsShown(true);
  });

  it('reveals every line of the tale and asks for the next one', async () => {
    const reveal = mount(TaleReveal, { props: { results: missedRun().results } });
    expect(reveal.findAll('li')).toHaveLength(1);
    await reveal.find('[data-testid="next-tale"]').trigger('click');
    expect(reveal.emitted('next')).toHaveLength(1);
  });
});

describe('Bunpou’s keys and pacing', () => {
  function mountRun() {
    let game: ReturnType<typeof useBunpouRun> | undefined;
    const host = mount(
      defineComponent({
        setup() {
          game = useBunpouRun(seededRandom(9));
          return () => h('div');
        },
      }),
      { attachTo: document.body },
    );
    if (game === undefined) throw new Error('useBunpouRun did not run');
    return { host, game };
  }

  it('places the offered tile with a number key, and takes it back with Backspace', async () => {
    const { host, game } = mountRun();
    const first = game.unplaced.value[0];
    window.dispatchEvent(new KeyboardEvent('keydown', { key: '1' }));
    expect(game.run.value.placed).toEqual([first]);
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Backspace' }));
    expect(game.run.value.placed).toEqual([]);
    host.unmount();
  });

  it('moves to the next line once a judged line has shown', async () => {
    vi.useFakeTimers();
    const { host, game } = mountRun();
    for (const tile of rightOrder(game.run.value)) game.place(tile);
    await nextTick();
    expect(game.run.value.phase).toBe('judged');
    vi.advanceTimersByTime(1000);
    expect(game.run.value).toMatchObject({ phase: 'building', lineIndex: 1 });
    host.unmount();
  });
});
