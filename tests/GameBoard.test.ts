import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import GameBoard from '../src/components/GameBoard.vue';
import { dealSet } from '../src/game/deal.ts';
import { deckWord, seededRandom } from './helpers/fixtures.ts';

const POOL = ['学校', '先生', '電車', '時間', '友達'].map((word, index) =>
  deckWord(
    String(index),
    word,
    ['がっこう', 'せんせい', 'でんしゃ', 'じかん', 'ともだち'][index] ?? '',
  ),
);

describe('GameBoard', () => {
  it('shows 5 word cards over 6 reading cards', () => {
    const board = mount(GameBoard, { props: { set: dealSet(POOL, seededRandom(3)) } });
    expect(board.find('[data-testid="word-row"]').findAll('button')).toHaveLength(5);
    expect(board.find('[data-testid="reading-row"]').findAll('button')).toHaveLength(6);
  });

  it('shows the words in kanji', () => {
    const board = mount(GameBoard, { props: { set: dealSet(POOL, seededRandom(3)) } });
    expect(board.find('[data-testid="word-row"]').text()).toContain('学校');
  });
});
