// Kanji mode on screen: choosing it, the board's cards, and picking a reading.
import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import { nextTick } from 'vue';
import KanjiBoard from '../src/components/kanji/KanjiBoard.vue';
import ModePicker from '../src/components/ModePicker.vue';
import PlayCard from '../src/components/cards/PlayCard.vue';
import type { KanjiRound } from '../src/kanji/kanji-round.ts';

const ROUND: KanjiRound = {
  kanji: '生',
  meanings: ['life', 'birth'],
  cards: [
    { text: 'セイ', isRight: true },
    { text: 'ガク', isRight: false },
    { text: 'う(まれる)', isRight: true },
    { text: 'やま', isRight: false },
    { text: 'ニチ', isRight: false },
    { text: 'ひと', isRight: false },
    { text: 'かわ', isRight: false },
    { text: 'みず', isRight: false },
  ],
};

async function mountBoard() {
  const board = mount(KanjiBoard, {
    props: {
      round: ROUND,
      roundNumber: 1,
      level: 'N5',
      statusOf: () => 'idle',
      thrown: [],
      combo: 0,
      impacts: 0,
      canPlay: false,
      crestMarks: new Map(),
      wrongPicksLeft: 3,
    },
  });
  await nextTick();
  return board;
}

describe('kanji mode on screen', () => {
  it('offers word mode and kanji mode on the start screen', async () => {
    const picker = mount(ModePicker, { props: { level: 'N5' } });
    // The leaderboard beside the modes has its own buttons; only the mode choice counts here.
    const buttons = picker.find('[aria-label="Choose a mode"]').findAll('button');
    expect(buttons.map((button) => button.text())).toEqual([
      expect.stringContaining('Words'),
      expect.stringContaining('Kanji'),
    ]);
    await buttons[1]?.trigger('click');
    expect(picker.emitted('choose')?.[0]).toEqual(['kanji']);
  });

  it('shows the kanji with its meanings over a hand of 8 readings', async () => {
    const board = await mountBoard();
    expect(board.find('[data-testid="kanji-row"]').text()).toContain('生');
    expect(board.find('[data-testid="kanji-row"]').text()).toContain('life; birth');
    expect(board.find('[data-testid="reading-row"]').findAll('button')).toHaveLength(8);
  });

  it('picks a reading when it is clicked, and plays only when allowed', async () => {
    const board = await mountBoard();
    const readings = board.findAllComponents(PlayCard).filter((c) => c.props('kind') === 'reading');
    await readings[2]?.trigger('click');
    expect(board.emitted('toggle')?.[0]).toEqual([2]);
    expect(board.find('[data-testid="play"]').attributes('disabled')).toBeDefined();
  });
});
