/**
 * The order checker (D55): is the player's tile order a right sentence,
 * and if not, which tiles are out of place?
 *
 * It checks against the template's units, not general grammar. A unit is
 * a noun with its particle, a fixed phrase, or the predicate. Inside a
 * unit the order is fixed. Units may swap places, except that the
 * predicate (the last unit) stays last and a unit flagged fixed keeps its
 * place (でも、… first). A template can also list particle swaps that make
 * another right sentence (七時に学校から ↔ 七時から学校に).
 *
 * A sentence has at most 5 tiles, so every right order is simply listed
 * (rightOrders) and the answer compared with them.
 *
 * Tiles are compared by text: a sentence never has two tiles with the same
 * text, because the player couldn't tell them apart.
 */

export interface OrderRules {
  /** The tile texts of each unit, in the template's own order; the last unit is the predicate. */
  units: readonly (readonly string[])[];
  /** Units that must stay at their own position. */
  fixedUnits: readonly number[];
  /** Pairs of particle tiles that may trade places and still make a right sentence. */
  swaps: readonly (readonly [string, string])[];
}

export type Units = readonly (readonly string[])[];

/** The units with two tiles traded wherever they appear. */
function swapTiles(units: Units, [first, second]: readonly [string, string]): Units {
  function traded(tile: string): string {
    if (tile === first) return second;
    if (tile === second) return first;
    return tile;
  }
  return units.map((unit) => unit.map(traded));
}

function permutations<T>(items: readonly T[]): T[][] {
  if (items.length <= 1) return [[...items]];
  return items.flatMap((item, index) => {
    const rest = [...items.slice(0, index), ...items.slice(index + 1)];
    return permutations(rest).map((order) => [item, ...order]);
  });
}

/** Every order of the units: the movable ones in any order, fixed ones and the predicate in place. */
function unitOrders(units: Units, fixedUnits: readonly number[]): string[][] {
  const predicate = units.length - 1;
  const staysPut = (index: number): boolean => index === predicate || fixedUnits.includes(index);
  const movable = units.map((_, index) => index).filter((index) => !staysPut(index));
  return permutations(movable).map((movableOrder) => {
    const nextMovable = [...movableOrder];
    return units.flatMap((unit, index) => {
      if (staysPut(index)) return unit;
      return units[nextMovable.shift() ?? index] ?? [];
    });
  });
}

/** The template's units, and the same units with each allowed particle swap made. */
export function unitBindings(rules: OrderRules): Units[] {
  return [rules.units, ...rules.swaps.map((pair) => swapTiles(rules.units, pair))];
}

/** Every right order of the tiles. */
export function rightOrders(rules: OrderRules): string[][] {
  return unitBindings(rules).flatMap((units) => unitOrders(units, rules.fixedUnits));
}

/** An answer as boxes: a timed-out line can leave some empty (null). */
type Answer = readonly (string | null)[];

function tilesInPlace(answer: Answer, order: readonly string[]): number {
  return answer.filter((tile, index) => order[index] === tile).length;
}

export function isRightOrder(answer: Answer, rules: OrderRules): boolean {
  return rightOrders(rules).some(
    (order) => order.length === answer.length && tilesInPlace(answer, order) === order.length,
  );
}

export interface Fix {
  /** The right order closest to the answer: the one with the most tiles already in place. */
  order: string[];
  /** Positions in the answer whose tile isn't where that right order has it (empty boxes aren't wrong). */
  wrongAt: number[];
}

/** The fix to show for an answer, even a half-built one (a timeout). */
export function closestFix(answer: Answer, rules: OrderRules): Fix {
  const orders = rightOrders(rules);
  let order = orders[0] ?? [];
  for (const candidate of orders) {
    if (tilesInPlace(answer, candidate) > tilesInPlace(answer, order)) order = candidate;
  }
  const wrongAt = answer.flatMap((tile, index) =>
    tile === null || order[index] === tile ? [] : [index],
  );
  return { order, wrongAt };
}
