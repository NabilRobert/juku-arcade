import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import CardBack from '../src/components/CardBack.vue';
import MissedTray from '../src/components/MissedTray.vue';
import type { DeckWord, KanjiNote } from '../src/deck/types.ts';
import { deckWord } from './helpers/fixtures.ts';

const SCHOOL: DeckWord = {
  ...deckWord('1', '学校', 'がっこう'),
  meanings: ['school'],
  example: { text: 'この{学校|がっこう}は', english: 'This school', tatoebaId: 222600 },
  kanjiReadingsUsed: { 学: ['ガク'], 校: ['コウ'] },
};

const KANJI: Record<string, KanjiNote> = {
  学: {
    onyomi: ['ガク'],
    kunyomi: ['まな.ぶ'],
    meanings: ['study'],
    words: [
      { word: '学校', reading: 'がっこう' },
      { word: '学生', reading: 'がくせい' },
    ],
  },
  校: { onyomi: ['コウ', 'キョウ'], kunyomi: [], meanings: ['school'], words: [] },
};

describe('CardBack', () => {
  it('shows the reading, meaning and example with furigana', () => {
    const back = mount(CardBack, { props: { word: SCHOOL, kanji: KANJI } });
    expect(back.text()).toContain('がっこう');
    expect(back.text()).toContain('school');
    expect(back.find('ruby').text()).toContain('学校');
  });

  it('credits the example sentence to Tatoeba', () => {
    const back = mount(CardBack, { props: { word: SCHOOL, kanji: KANJI } });
    expect(back.find('a').attributes('href')).toBe('https://tatoeba.org/sentences/show/222600');
  });

  it('lists every reading of each kanji and highlights the ones this word uses', () => {
    const back = mount(CardBack, { props: { word: SCHOOL, kanji: KANJI } });
    const readings = back.findAll('[data-testid="kanji-reading"]');
    expect(readings.map((reading) => reading.text())).toEqual([
      'ガク',
      'まな.ぶ',
      'コウ',
      'キョウ',
    ]);
    expect(
      readings.filter((reading) => reading.classes('bg-crimson')).map((reading) => reading.text()),
    ).toEqual(['ガク', 'コウ']);
  });

  it('shows other words that use the kanji, but not this word', () => {
    const back = mount(CardBack, { props: { word: SCHOOL, kanji: KANJI } });
    expect(back.text()).toContain('学生 がくせい');
    expect(back.text().match(/学校 がっこう/g)).toBeNull();
  });
});

describe('MissedTray', () => {
  it('lets missed words be flipped only while paused', async () => {
    const playing = mount(MissedTray, { props: { words: [SCHOOL], isPaused: false } });
    expect(playing.find('button').attributes('disabled')).toBeDefined();
    const paused = mount(MissedTray, { props: { words: [SCHOOL], isPaused: true } });
    await paused.find('button').trigger('click');
    expect(paused.emitted('flip')?.[0]).toEqual([SCHOOL]);
  });
});
