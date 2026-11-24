/**
 * The build check for the templates (D55),
 * as pure functions so the specs can run it without files:
 * - every template sits on a shelf the shelf map allows for its point;
 * - every point with templates has at least 3, on at least 2 shelves;
 * - every template has at least 2 noun+particle units, 3–5 tiles, a
 *   one-tile predicate last, and no two tiles written the same.
 *
 * scripts/grammar-check.ts runs it on the real templates and shelf map.
 */
import type { Shelf, Template } from './templates.ts';

export const MIN_TEMPLATES_PER_POINT = 3;
export const MIN_SHELVES_PER_POINT = 2;
export const MIN_PARTICLE_UNITS = 2;
export const MIN_TILES = 3;
export const MAX_TILES = 5;

/** A grammar id and the shelves the shelf map allows it on. */
export type ShelfMap = ReadonlyMap<string, readonly Shelf[]>;

/** Reads the shelf map CSV (grammar_id, group, kind, shelves, in_first_slice; shelves like S;D;P). */
export function parseShelfMap(csv: string): ShelfMap {
  const [header = '', ...rows] = csv.trim().split('\n');
  const columns = header.split(',');
  const idColumn = columns.indexOf('grammar_id');
  const shelvesColumn = columns.indexOf('shelves');
  if (idColumn < 0 || shelvesColumn < 0) {
    throw new Error('The shelf map needs grammar_id and shelves columns');
  }
  const map = new Map<string, Shelf[]>();
  for (const row of rows) {
    const cells = row.split(',');
    const shelves = (cells[shelvesColumn] ?? '').split(';') as Shelf[];
    map.set(cells[idColumn] ?? '', shelves);
  }
  return map;
}

/** Problems with one template's tiles and units. */
function shapeProblems(template: Template): string[] {
  const { id, units } = template;
  const problems: string[] = [];
  const tiles = units.flat();
  const particleUnits = units.filter((unit) => unit.length === 2).length;
  if (particleUnits < MIN_PARTICLE_UNITS) {
    problems.push(`${id}: has ${particleUnits} noun+particle units, needs ${MIN_PARTICLE_UNITS}`);
  }
  if (tiles.length < MIN_TILES || tiles.length > MAX_TILES) {
    problems.push(`${id}: has ${tiles.length} tiles, needs ${MIN_TILES}–${MAX_TILES}`);
  }
  if (units[units.length - 1]?.length !== 1) {
    problems.push(`${id}: its last unit (the predicate) must be one tile`);
  }
  if (new Set(tiles).size < tiles.length) problems.push(`${id}: two tiles are written the same`);
  return [...problems, ...swapProblems(template)];
}

/** A listed particle swap must name two of the template's own tiles. */
function swapProblems(template: Template): string[] {
  const tiles = template.units.flat();
  return (template.swaps ?? [])
    .filter(([first, second]) => !tiles.includes(first) || !tiles.includes(second))
    .map(
      ([first, second]) => `${template.id}: swap ${first}↔${second} names a tile it doesn't have`,
    );
}

/** Problems with where the templates sit and how many each point has. */
function shelfProblems(templates: readonly Template[], shelfMap: ShelfMap): string[] {
  const problems: string[] = [];
  const points = new Set(templates.map((template) => template.point));
  for (const point of points) {
    const allowed = shelfMap.get(point);
    if (allowed === undefined) {
      problems.push(`${point}: isn't in the shelf map`);
      continue;
    }
    const own = templates.filter((template) => template.point === point);
    for (const template of own.filter((entry) => !allowed.includes(entry.shelf))) {
      problems.push(
        `${template.id}: shelf ${template.shelf} isn't allowed for ${point} (${allowed.join(';')})`,
      );
    }
    if (own.length < MIN_TEMPLATES_PER_POINT) {
      problems.push(`${point}: has ${own.length} templates, needs ${MIN_TEMPLATES_PER_POINT}`);
    }
    const shelves = new Set(own.map((template) => template.shelf)).size;
    if (shelves < MIN_SHELVES_PER_POINT) {
      problems.push(`${point}: is on ${shelves} shelf, needs ${MIN_SHELVES_PER_POINT}`);
    }
  }
  return problems;
}

export function templateProblems(templates: readonly Template[], shelfMap: ShelfMap): string[] {
  return [...templates.flatMap(shapeProblems), ...shelfProblems(templates, shelfMap)];
}
