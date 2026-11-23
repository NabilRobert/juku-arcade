/**
 * The items a bank run's shop sells (our own, as omamori-style
 * charms; no other game's items). Each bends the risk of riding a combo:
 * more coins per match, a safety net on a miss, a bonus for banking, or
 * interest on what you save. bank-run.ts applies them. Prices are set
 * against the flat 10 coins a match pays (D46), so an item costs a few
 * sets' play.
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
  { id: 'maneki', kanji: '招', name: 'Lucky cat', price: 80, effect: '+3 coins for every match.' },
  {
    id: 'koi',
    kanji: '鯉',
    name: 'Koi',
    price: 180,
    effect: 'Matches from 10 combo up earn double.',
  },
  { id: 'omamori', kanji: '守', name: 'Omamori', price: 140, effect: 'A miss keeps half the pot.' },
  {
    id: 'tsuru',
    kanji: '鶴',
    name: 'Crane',
    price: 120,
    effect: 'Once, a miss keeps the whole pot. Then it flies off.',
  },
  { id: 'sensu', kanji: '扇', name: 'Fan', price: 120, effect: 'Banking adds 20% to the pot.' },
  {
    id: 'take',
    kanji: '竹',
    name: 'Bamboo',
    price: 100,
    effect: 'When the shop comes, +1 coin per 10 saved (up to 50).',
  },
];

export function itemById(id: ItemId): Item | undefined {
  return ITEMS.find((item) => item.id === id);
}
