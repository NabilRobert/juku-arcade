// The matcher: tales in the shape 起承転結, a different grammar point per line, every line solvable.
import { describe, expect, it } from 'vitest';
import { seededRandom } from '../src/game/random.ts';
import { fillTemplate, fillTile, sentenceText } from '../src/grammar/fill.ts';
import { isRightOrder } from '../src/grammar/order-check.ts';
import { makeTale, pickSetting, type Tale } from '../src/grammar/tale.ts';
import { TEMPLATES, type Template } from '../src/grammar/templates.ts';

const G0_POINTS = ['wa', 'o', 'ni-time', 'de-place', 'mo'];
const TALES_TO_CHECK = 100;

function manyTales(): Tale[] {
  const random = seededRandom(7);
  return Array.from({ length: TALES_TO_CHECK }, () => makeTale(G0_POINTS, TEMPLATES, random));
}

const followOnIds = new Set(
  TEMPLATES.filter((template) => template.followOn).map((template) => template.id),
);

describe('the matcher', () => {
  const tales = manyTales();

  it('tells every tale as setup, development, twist, punchline, in 4–6 lines', () => {
    for (const tale of tales) {
      const shelves = tale.lines.map((line) => line.shelf);
      expect([...new Set(shelves)]).toEqual(['S', 'D', 'T', 'P']);
      expect(tale.lines.length).toBeGreaterThanOrEqual(4);
      expect(tale.lines.length).toBeLessThanOrEqual(6);
    }
  });

  it('never tests the same grammar point twice in a tale', () => {
    for (const tale of tales) {
      const points = tale.lines.map((line) => line.point);
      expect(new Set(points).size).toBe(points.length);
    }
  });

  it('uses follow-on templates only as a shelf’s second line', () => {
    for (const tale of tales) {
      tale.lines.forEach((line, index) => {
        const isSecond = tale.lines[index - 1]?.shelf === line.shelf;
        expect(followOnIds.has(line.templateId)).toBe(isSecond);
      });
    }
  });

  it('gives every line 3–5 tiles with no two alike, and accepts its own order', () => {
    for (const line of tales.flatMap((tale) => tale.lines)) {
      const texts = line.tiles.map((tile) => tile.text);
      expect(texts.length).toBeGreaterThanOrEqual(3);
      expect(texts.length).toBeLessThanOrEqual(5);
      expect(new Set(texts).size).toBe(texts.length);
      expect(isRightOrder(texts, line)).toBe(true);
    }
  });

  it('makes the same tale from the same seed', () => {
    const first = makeTale(G0_POINTS, TEMPLATES, seededRandom(3));
    const again = makeTale(G0_POINTS, TEMPLATES, seededRandom(3));
    expect(again.lines.map(sentenceText)).toEqual(first.lines.map(sentenceText));
  });

  it('says which points can’t make a tale when no template fits a shelf', () => {
    // None of these four may go on the twist shelf.
    expect(() => makeTale(['wa', 'o', 'ni-time', 'de-place'], TEMPLATES, seededRandom(1))).toThrow(
      /wa, o, ni-time, de-place/,
    );
  });
});

describe('the setting and filling', () => {
  it('casts two different characters and two different places', () => {
    const setting = pickSetting(seededRandom(11));
    expect(setting.who.word).not.toBe(setting.who2.word);
    expect(setting.place.word).not.toBe(setting.place2.word);
  });

  it('conjugates a verb and puts furigana on its kanji only', () => {
    const setting = pickSetting(seededRandom(11));
    expect(fillTile('<来る:masenDeshita>', setting)).toEqual({
      text: '来ませんでした',
      marked: '{来|き}ませんでした',
    });
  });

  it('refuses a filling where two tiles would read the same', () => {
    const setting = {
      ...pickSetting(seededRandom(11)),
      food: { word: 'パン', reading: 'パン', type: 'food' as const },
    };
    const clash: Template = {
      id: 'clash',
      point: 'mo',
      shelf: 'T',
      units: [['<food>', 'も'], ['パン', 'を'], ['<買う:masu>']],
    };
    expect(fillTemplate(clash, setting)).toBeNull();
  });

  it('fills a slot and keeps fixed text with its furigana', () => {
    const setting = {
      ...pickSetting(seededRandom(11)),
      food: { word: '肉', reading: 'にく', type: 'food' as const },
    };
    expect(fillTile('{毎朝|まいあさ}<food>', setting)).toEqual({
      text: '毎朝肉',
      marked: '{毎朝|まいあさ}{肉|にく}',
    });
  });
});
