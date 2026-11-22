/**
 * The items a bank run's shop sells (our own, as omamori-style
 * charms; no other game's items). Each bends the risk of riding a combo:
 * more coins per match, a safety net on a miss, a bonus for banking, or
 * interest on what you save. bank-run.ts applies them.
 */
export type ItemId = 'maneki' | 'koi' | 'omamori' | 'tsuru' | 'sensu' | 'take';

export interface Item {
  id: ItemId;
  kanji: string;
  name: string;
  price: number;
  effect: string;
}

export const ITEMS: readonly Item[] = [
  { id: 'maneki', kanji: '招', name: 'Lucky cat', price: 8, effect: '+1 coin for every match.' },
  {
    id: 'koi',
    kanji: '鯉',
    name: 'Koi',
    price: 18,
    effect: 'Matches from 10 combo up earn double.',
  },
  { id: 'omamori', kanji: '守', name: 'Omamori', price: 14, effect: 'A miss keeps half the pot.' },
  {
    id: 'tsuru',
    kanji: '鶴',
    name: 'Crane',
    price: 20,
    effect: 'Once a round, a miss keeps the whole pot.',
  },
  { id: 'sensu', kanji: '扇', name: 'Fan', price: 12, effect: 'Banking adds 20% to the pot.' },
  {
    id: 'take',
    kanji: '竹',
    name: 'Bamboo',
    price: 10,
    effect: 'After each round, +1 coin per 5 saved (up to 6).',
  },
];

export function itemById(id: ItemId): Item | undefined {
  return ITEMS.find((item) => item.id === id);
}
