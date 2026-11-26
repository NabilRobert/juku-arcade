import 'fake-indexeddb/auto';
import { mount } from '@vue/test-utils';
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
    expect(notes.map((note) => note.text())).toEqual([
      'Only playable in N5 for now · still in development',
    ]);
  });

  it('puts the streak above the modes', () => {
    const html = mount(ModePicker, { props: { deck } }).html();
    expect(html.indexOf('aria-label="Streak"')).toBeLessThan(html.indexOf('Choose a mode'));
  });
});
