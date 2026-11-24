/**
 * The build check for the templates (D55),
 * as pure functions so the specs can run it without files:
 * - with a shelf map: every point is in it, and every template sits on a
 *   shelf it allows for its point (the only rules that need the map);
 * - every point with templates has at least 3, on at least 2 shelves;
 * - every template has 3–5 tiles, no two written the same; a particle
 *   point's has at least 2 noun+particle units and a one-tile predicate,
 *   a pattern point's splits its pattern into pieces (kindProblems);
 * - every tile fills (fillProblems): its verb, verb form and slots exist.
 *
 * scripts/grammar-check.ts runs it on the real templates, and the shelf
 * map when there's a local copy.
 */
import { seededRandom } from '../game/random.ts';
import { fillTile } from './fill.ts';
import { pickSetting } from './tale.ts';
import { PATTERN_POINTS, type Shelf, type Template } from './templates.ts';

export const MIN_TEMPLATES_PER_POINT = 3;
export const MIN_SHELVES_PER_POINT = 2;
export const MIN_PARTICLE_UNITS = 2;
export const MIN_TILES = 3;
export const MAX_TILES = 5;
/** A pattern point's predicate can carry one pattern piece: 待って｜います, 行きません｜か. */
export const MAX_PATTERN_PREDICATE_TILES = 2;

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

/**
 * The rule that depends on the point's kind (D60): a particle point needs
 * at least 2 loose noun+particle units and a one-tile predicate; a pattern
 * point needs at least 2 units, one of them split into pattern pieces, and
 * a predicate of at most MAX_PATTERN_PREDICATE_TILES.
 */
function kindProblems(template: Template): string[] {
  const { id, units } = template;
  const predicateTiles = units[units.length - 1]?.length ?? 0;
  if (PATTERN_POINTS.has(template.point)) {
    const problems: string[] = [];
    if (units.length < 2) problems.push(`${id}: has ${units.length} unit, needs 2`);
    if (!units.some((unit) => unit.length > 1)) {
      problems.push(`${id}: splits no unit into pattern pieces`);
    }
    if (predicateTiles > MAX_PATTERN_PREDICATE_TILES) {
      problems.push(
        `${id}: its predicate has ${predicateTiles} tiles, at most ${MAX_PATTERN_PREDICATE_TILES}`,
      );
    }
    return problems;
  }
  const particleUnits = units.filter((unit) => unit.length === 2).length;
  const problems: string[] = [];
  if (particleUnits < MIN_PARTICLE_UNITS) {
    problems.push(`${id}: has ${particleUnits} noun+particle units, needs ${MIN_PARTICLE_UNITS}`);
  }
  if (predicateTiles !== 1) problems.push(`${id}: its last unit (the predicate) must be one tile`);
  return problems;
}

/** Problems with one template's tiles and units. */
function shapeProblems(template: Template): string[] {
  const tiles = template.units.flat();
  const problems = kindProblems(template);
  if (tiles.length < MIN_TILES || tiles.length > MAX_TILES) {
    problems.push(`${template.id}: has ${tiles.length} tiles, needs ${MIN_TILES}–${MAX_TILES}`);
  }
  if (new Set(tiles).size < tiles.length) {
    problems.push(`${template.id}: two tiles are written the same`);
  }
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
  }
  return problems;
}

/** Enough templates for each point, on enough shelves: rules that need no shelf map. */
function pointCountProblems(templates: readonly Template[]): string[] {
  const problems: string[] = [];
  for (const point of new Set(templates.map((template) => template.point))) {
    const own = templates.filter((template) => template.point === point);
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

/**
 * Every problem with the templates. With no shelf map (a fresh clone, or
 * CI), all but the two shelf-map rules: whether a point is in the map,
 * and whether a template's shelf is one the map allows for its point.
 */
export function templateProblems(
  templates: readonly Template[],
  shelfMap: ShelfMap | null,
): string[] {
  const shelves = shelfMap === null ? [] : shelfProblems(templates, shelfMap);
  return [
    ...templates.flatMap(shapeProblems),
    ...shelves,
    ...pointCountProblems(templates),
    ...fillProblems(templates),
  ];
}

/**
 * Every tile of every template, filled once with a sample setting: a typo
 * in a verb form, a slot or a verb fails here, at build time, rather than
 * only when a tale happens to use that template.
 */
export function fillProblems(templates: readonly Template[]): string[] {
  const setting = pickSetting(seededRandom(1));
  return templates.flatMap((template) =>
    template.units.flat().flatMap((pattern) => {
      try {
        fillTile(pattern, setting);
        return [];
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return [`${template.id}: ${message}`];
      }
    }),
  );
}
