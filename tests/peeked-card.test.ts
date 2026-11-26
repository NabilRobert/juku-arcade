// A card the player peeked at (L9) says it won't score: a "no score" label, and a cedar-brown border and back.
import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import PlayCard from '../src/components/cards/PlayCard.vue';

const WORD = { text: '本', kind: 'word', index: 0, level: 'N5', status: 'idle' } as const;
const crest = { symbol: '金', tint: '#d4a73a', ink: '#13283d' };

describe('a peeked card', () => {
  it('shows a "no score" label on its face', () => {
    const card = mount(PlayCard, { props: { ...WORD, isPeeked: true } });
    expect(card.find('[data-testid="peeked-mark"]').text()).toBe('no score');
  });

  it('turns its border and its back cedar brown, over a crest’s tint', () => {
    const card = mount(PlayCard, { props: { ...WORD, isPeeked: true, crestMark: crest } });
    const tints = card.findAll('[data-tint]').map((frame) => frame.attributes('data-tint'));
    expect(tints).toEqual(['var(--color-cedar)', 'var(--color-cedar)']);
  });

  it('looks like any other card when it wasn’t peeked at', () => {
    const card = mount(PlayCard, { props: { ...WORD } });
    expect(card.find('[data-testid="peeked-mark"]').exists()).toBe(false);
    expect(card.findAll('[data-tint]')).toHaveLength(0);
  });
});
