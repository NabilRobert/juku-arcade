/**
 * The items a bank run's shop sells (our own, as omamori-style
 * charms; no other game's items). Each bends the risk of riding a combo:
 * more coins per match, a safety net on a miss, a bonus for banking, or
 * interest on what you save. bank-run.ts applies them. Prices are set
 * against the flat 10 coins a match pays (D46), so an item costs a few
 * sets' play.
 */
import { translate } from '../i18n/index.ts';

export type ItemId = 'maneki' | 'koi' | 'omamori' | 'tsuru' | 'sensu' | 'take';

/** An item's name and effect are messages (game.items), looked up by its id as it's shown. */
export interface Item {
  id: ItemId;
  kanji: string;
  price: number;
}

export const ITEMS: readonly Item[] = [
  { id: 'maneki', kanji: '招', price: 80 },
  { id: 'koi', kanji: '鯉', price: 180 },
  { id: 'omamori', kanji: '守', price: 140 },
  { id: 'tsuru', kanji: '鶴', price: 120 },
  { id: 'sensu', kanji: '扇', price: 120 },
  { id: 'take', kanji: '竹', price: 100 },
];

export function itemById(id: ItemId): Item | undefined {
  return ITEMS.find((item) => item.id === id);
}

/** An item's name, in the interface language; call it while rendering. */
export function itemName(id: ItemId): string {
  return translate(`game.items.${id}.name`);
}

/** What an item does, in the interface language; call it while rendering. */
export function itemEffect(id: ItemId): string {
  return translate(`game.items.${id}.effect`);
}
