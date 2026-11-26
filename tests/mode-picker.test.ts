import 'fake-indexeddb/auto';
import { flushPromises, mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import ModePicker from '../src/components/ModePicker.vue';

const deck = { level: 'N4' as const, sourceCommit: 'test', words: [], kanji: {} };

describe('the start screen', () => {
  it('offers the three modes, naming the level', () => {
    const picker = mount(ModePicker, { props: { deck } });
    const cards = picker.find('[aria-label="Choose a mode"]').findAll('button');
    expect(cards).toHaveLength(3);
    ['Words', 'Kanji', 'Bunpou'].forEach((name, index) =>
      expect(cards[index]?.text()).toContain(name),
    );
    expect(cards[0]?.text()).toContain('Match each N4 word');
  });

  it('notes that Bunpou is N5 only and still in development', () => {
    const picker = mount(ModePicker, { props: { deck } });
    const notes = picker.findAll('[data-testid="mode-note"]');
    expect(notes.map((note) => note.text())).toEqual(['N5 only for now · still in development']);
  });

  it("shows each mode's level goal on its card, with Bunpou's rakugo rank", async () => {
    const picker = mount(ModePicker, { props: { deck } });
    await flushPromises();
    const goals = picker.findAll('[data-testid="goal"]').map((goal) => goal.text());
    expect(goals).toHaveLength(3);
    expect(goals[0]).toContain('Words known');
    expect(goals[1]).toContain('Kanji mastered');
    expect(goals[2]).toContain('前座');
    expect(goals[2]).toContain('0 / 20');
  });

  it('puts the streak above the modes', () => {
    const html = mount(ModePicker, { props: { deck } }).html();
    expect(html.indexOf('aria-label="Streak"')).toBeLessThan(html.indexOf('Choose a mode'));
  });
});
