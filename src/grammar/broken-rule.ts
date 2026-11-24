/**
 * Which rule a wrong order broke (D57), for the grammar log: the verb (the
 * predicate) wasn't last, a particle followed the wrong word, or the
 * pieces were all attached right but in the wrong order. Checked in that
 * order, so each answer gets the most basic rule it broke.
 */
import { unitBindings, type OrderRules, type Units } from './order-check.ts';

export type BrokenRule = 'verb_not_last' | 'particle_after_wrong_word' | 'pieces_out_of_order';

function predicateOf(units: Units): string | undefined {
  return units.at(-1)?.at(-1);
}

/** Each tile and the tile that must come straight before it, inside a unit. */
function partners(units: Units): Map<string, string> {
  const before = new Map<string, string>();
  for (const unit of units) {
    unit.slice(1).forEach((tile, index) => before.set(tile, unit[index] ?? ''));
  }
  return before;
}

/** True when every tile that belongs after another in its unit sits straight after it. */
function keepsUnitsTogether(answer: readonly string[], units: Units): boolean {
  return [...partners(units)].every(([tile, partner]) => {
    const at = answer.indexOf(tile);
    return at > 0 && answer[at - 1] === partner;
  });
}

/** The rule a full, wrong answer broke. */
export function brokenRule(answer: readonly string[], rules: OrderRules): BrokenRule {
  if (answer.at(-1) !== predicateOf(rules.units)) return 'verb_not_last';
  const bindings = unitBindings(rules);
  if (!bindings.some((units) => keepsUnitsTogether(answer, units))) {
    return 'particle_after_wrong_word';
  }
  return 'pieces_out_of_order';
}
