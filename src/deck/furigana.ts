/**
 * Parses Tatoeba's furigana markup, この{学校|がっこう}は, into pieces the card
 * can show as ruby text: [{text: 'この'}, {text: '学校', reading: 'がっこう'}, …].
 */

export interface FuriganaPiece {
  text: string;
  reading?: string;
}

const MARKUP = /\{([^|{}]+)\|([^{}]+)\}/g;

export function parseFurigana(marked: string): FuriganaPiece[] {
  const pieces: FuriganaPiece[] = [];
  let position = 0;
  for (const match of marked.matchAll(MARKUP)) {
    if (match.index > position) pieces.push({ text: marked.slice(position, match.index) });
    pieces.push({ text: match[1] ?? '', reading: match[2] ?? '' });
    position = match.index + match[0].length;
  }
  if (position < marked.length) pieces.push({ text: marked.slice(position) });
  return pieces;
}
