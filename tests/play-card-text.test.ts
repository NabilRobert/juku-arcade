import { describe, expect, it } from 'vitest';
import { cardFontSize } from '../src/components/cards/card-text.ts';

describe('a card’s text', () => {
  it('keeps a short word at the largest size', () => {
    expect(cardFontSize('本', 'word')).toBe('min(3.5rem, 74cqw)');
  });

  it('shrinks a long reading to fit one column rather than breaking it in two', () => {
    expect(cardFontSize('こうとうがっこう', 'reading')).toBe('min(2.6rem, 12cqw)');
  });
});
