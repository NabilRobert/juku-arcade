// Kanji reviews (D75): each kanji is scheduled like a word, from its rounds in the play log. A perfect round
// moves it up a box, a miss sends it back to tomorrow, and a sheet asks for the due ones in its review slots.
import { describe, expect, it } from 'vitest';
import { isKanjiDue, kanjiReviewsOf, kanjiStanding } from '../src/kanji/kanji-reviews.ts';
import { LEITNER_INTERVAL_DAYS } from '../src/memory/leitner.ts';

const round = (day: string, kanji: string, isPerfect: boolean) => ({ day, kanji, isPerfect });

describe('a kanji review', () => {
  it('brings a missed kanji back the next day', () => {
    const memory = kanjiReviewsOf([round('2026-11-20', '日', false)]);
    const record = memory.get('日');
    expect(record?.dueDay).toBe('2026-11-21');
    expect(record && isKanjiDue(record, '2026-11-21')).toBe(true);
  });

  it('waits longer after each perfect day, as words do', () => {
    const memory = kanjiReviewsOf([
      round('2026-11-20', '日', true),
      round('2026-11-21', '日', true),
    ]);
    expect(memory.get('日')?.box).toBe(2);
    expect(memory.get('日')?.dueDay).toBe(`2026-11-2${1 + (LEITNER_INTERVAL_DAYS[2] ?? 0)}`);
  });

  it('sends a kanji back to the first box after a miss, however far it had got', () => {
    const rounds = [
      round('2026-11-01', '日', true),
      round('2026-11-02', '日', true),
      round('2026-11-06', '日', false),
    ];
    expect(kanjiReviewsOf(rounds).get('日')?.box).toBe(1);
  });

  it("isn't due again on a day it was already played", () => {
    const record = kanjiReviewsOf([round('2026-11-20', '日', false)]).get('日');
    expect(record && isKanjiDue(record, '2026-11-20')).toBe(false);
  });
});

describe("a sheet's standing", () => {
  // 日 was missed on the 20th (due the 21st); 山 was perfect on the 19th and 20th (box 2, due the 22nd).
  const memory = kanjiReviewsOf([
    round('2026-11-19', '山', true),
    round('2026-11-20', '日', false),
    round('2026-11-20', '山', true),
  ]);
  const levelList = new Set(['日', '山', '水']);

  it('marks due kanji for review and lets the rest of the played ones rest', () => {
    const standing = kanjiStanding(memory, '2026-11-21', levelList, new Set());
    expect([...standing.due]).toEqual(['日']);
    expect([...standing.resting]).toEqual(['山']);
  });

  it('rests a kanji already dealt in this run, even if it was due', () => {
    const standing = kanjiStanding(memory, '2026-11-21', levelList, new Set(['日']));
    expect(standing.due.size).toBe(0);
    expect(standing.resting.has('日')).toBe(true);
  });
});
