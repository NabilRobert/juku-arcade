// The templates' build check: shelves the shelf map allows, enough templates, the agreed tile shape.
import { describe, expect, it } from 'vitest';
import { fillProblems, parseShelfMap, templateProblems } from '../src/grammar/template-check.ts';
import { CURRICULUM, TEMPLATES, type Template } from '../src/grammar/templates.ts';

// The rows of the points with templates, as they are in bunpou-n5-shelf-map.csv.
const SHELF_MAP = parseShelfMap(
  [
    'grammar_id,group,kind,shelves,in_first_slice',
    'wa,Core particles,setting,S;D;P,yes',
    'ni-time,Core particles,setting,S;D,yes',
    'de-place,Core particles,setting,D;P,yes',
    'o,Core particles,setting,D;P,yes',
    'mo,Core particles,setting,D;T,yes',
    'made,Core particles,setting,D;P,yes',
    'to-with,Core particles,setting,S;D,yes',
    'kara-from,Core particles,setting,D;P,yes',
    'ga-subject,Core particles,setting,S;T,yes',
    'ga-aru-ga-iru,Description and state,setting,S;T,yes',
  ].join('\n'),
);

const good: Template = {
  id: 'x-S',
  point: 'wa',
  shelf: 'S',
  units: [['<who>', 'は'], ['<time>', 'に'], ['<来る:masu>']],
};
const threeGood = (changes: Partial<Template>): Template[] => [
  { ...good, ...changes },
  { ...good, id: 'x-D', shelf: 'D' },
  { ...good, id: 'x-P', shelf: 'P' },
];

describe('the templates’ build check', () => {
  it('passes the real templates', () => {
    expect(templateProblems(TEMPLATES, SHELF_MAP)).toEqual([]);
  });

  it('has templates for every point in the curriculum', () => {
    const taught = new Set(TEMPLATES.map((template) => template.point));
    expect(CURRICULUM.filter((point) => !taught.has(point))).toEqual([]);
  });

  it('fails a template on a shelf its point isn’t mapped to', () => {
    expect(templateProblems(threeGood({ shelf: 'T' }), SHELF_MAP)).toEqual([
      "x-S: shelf T isn't allowed for wa (S;D;P)",
    ]);
  });

  it('fails a point with fewer than 3 templates or only 1 shelf', () => {
    expect(templateProblems([good, { ...good, id: 'x-S2' }], SHELF_MAP)).toEqual([
      'wa: has 2 templates, needs 3',
      'wa: is on 1 shelf, needs 2',
    ]);
  });

  it('still counts templates and shelves per point with no shelf map', () => {
    expect(templateProblems([good, { ...good, id: 'x-S2' }], null)).toEqual([
      'wa: has 2 templates, needs 3',
      'wa: is on 1 shelf, needs 2',
    ]);
  });

  it('fails a template with only one loose noun+particle', () => {
    const oneParticle = threeGood({ units: [['<who>', 'は'], ['毎朝'], ['<来る:masu>']] });
    expect(templateProblems(oneParticle, SHELF_MAP)).toEqual([
      'x-S: has 1 noun+particle units, needs 2',
    ]);
  });

  it('fails a template with two tiles written the same, or too many tiles', () => {
    const twice = threeGood({ units: [['<who>', 'に'], ['<time>', 'に'], ['<来る:masu>']] });
    expect(templateProblems(twice, SHELF_MAP)).toEqual(['x-S: two tiles are written the same']);
    const long = threeGood({
      units: [['<who>', 'は'], ['<time>', 'に'], ['<place>', 'へ'], ['<行く:masu>']],
    });
    expect(templateProblems(long, SHELF_MAP)).toEqual(['x-S: has 7 tiles, needs 3–5']);
  });

  it('fails a point the shelf map doesn’t have', () => {
    const onlyWa = parseShelfMap(
      'grammar_id,group,kind,shelves,in_first_slice\nwa,Core particles,setting,S;D;P,yes',
    );
    expect(templateProblems(threeGood({ point: 'o' }), onlyWa)).toContain(
      "o: isn't in the shelf map",
    );
  });

  it('fills every tile of every template', () => {
    expect(fillProblems(TEMPLATES)).toEqual([]);
  });

  it('names a template whose verb form has a typo', () => {
    const typo: Template = {
      id: 'typo-S',
      point: 'wa',
      shelf: 'S',
      units: [['<who>', 'は'], ['<food>', 'を'], ['<食べる:mashta>']],
    };
    expect(fillProblems([typo])).toEqual([
      'typo-S: Unknown verb form "mashta" in <食べる:mashta>: use masu, mashita, masen, masenDeshita or te',
    ]);
  });
});
