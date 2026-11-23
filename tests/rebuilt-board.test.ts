// A board drawn again (after reading a card's back) mustn't bring back the cards already matched.
import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import { nextTick } from 'vue';
import PlayCard from '../src/components/cards/PlayCard.vue';

const CARD = { text: '学校', kind: 'word', index: 0, level: 'N5' } as const;

describe('a card drawn again', () => {
  it('starts hidden when it is already matched', async () => {
    const card = mount(PlayCard, { props: { ...CARD, status: 'matched' } });
    await nextTick();
    expect(card.find('span').attributes('style')).toContain('visibility: hidden');
  });

  it('shows as usual when it is still in play', async () => {
    const card = mount(PlayCard, { props: { ...CARD, status: 'idle' } });
    await nextTick();
    expect(card.find('span').attributes('style') ?? '').not.toContain('visibility: hidden');
  });
});
