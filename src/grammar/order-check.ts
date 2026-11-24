/**
 * The order checker (D55): is the player's tile order a right
 * sentence?
 *
 * It checks against the template's units, not general grammar. A unit is
 * a noun with its particle, a fixed phrase, or the predicate. Inside a
 * unit the order is fixed. Units may swap places, except that the
 * predicate (the last unit) stays last and a unit flagged fixed keeps its
 * place (でも、… first). A template can also list particle swaps that make
 * another right sentence (七時に学校から ↔ 七時から学校に).
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

type Units = readonly (readonly string[])[];

/** The units with two tiles traded wherever they appear. */
function swapTiles(units: Units, [first, second]: readonly [string, string]): Units {
  function traded(tile: string): string {
    if (tile === first) return second;
    if (tile === second) return first;
    return tile;
  }
  return units.map((unit) => unit.map(traded));
}

/** Reads the answer as whole units, returning the order the units were used in, or null. */
function unitOrder(answer: readonly string[], units: Units): number[] | null {
  const order: number[] = [];
  let position = 0;
  while (position < answer.length) {
    const unitIndex = units.findIndex((unit) => unit[0] === answer[position]);
    const unit = units[unitIndex];
    if (unit === undefined || order.includes(unitIndex)) return null;
    const isWhole = unit.every((tile, offset) => answer[position + offset] === tile);
    if (!isWhole) return null;
    order.push(unitIndex);
    position += unit.length;
  }
  return order;
}

function fitsUnits(
  answer: readonly string[],
  units: Units,
  fixedUnits: readonly number[],
): boolean {
  const order = unitOrder(answer, units);
  if (order === null || order.length !== units.length) return false;
  const predicate = units.length - 1;
  if (order[order.length - 1] !== predicate) return false;
  return fixedUnits.every((unitIndex) => order[unitIndex] === unitIndex);
}

export function isRightOrder(answer: readonly string[], rules: OrderRules): boolean {
  const bindings = [rules.units, ...rules.swaps.map((pair) => swapTiles(rules.units, pair))];
  return bindings.some((units) => fitsUnits(answer, units, rules.fixedUnits));
}
