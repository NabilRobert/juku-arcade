/**
 * Bunpou sentence templates (D55): Who with, and what is where: と, and がある・がいる.
 * The format is in ../templates.ts; TEMPLATES there joins every group.
 */
import type { Template } from '../templates.ts';

export const companyAndBeing: readonly Template[] = [
  // と (with)
  {
    id: 'to-S',
    point: 'to-with',
    shelf: 'S',
    units: [['<time>', 'に'], ['<who2>', 'と'], ['<会う:masu>']],
  },
  {
    id: 'to-D',
    point: 'to-with',
    shelf: 'D',
    units: [['<who>', 'は'], ['<who2>', 'と'], ['<遊ぶ:mashita>']],
  },
  {
    id: 'to-D-talk',
    point: 'to-with',
    shelf: 'D',
    units: [['<who2>', 'と'], ['<place>', 'で'], ['<話す:mashita>']],
  },
  // がある・がいる
  {
    id: 'aru-S',
    point: 'ga-aru-ga-iru',
    shelf: 'S',
    units: [['<place>', 'に'], ['<who2>', 'が'], ['<いる:masu>']],
  },
  {
    id: 'aru-S-thing',
    point: 'ga-aru-ga-iru',
    shelf: 'S',
    units: [['<place2>', 'に'], ['<thing>', 'が'], ['<ある:masu>']],
  },
  {
    id: 'aru-T',
    point: 'ga-aru-ga-iru',
    shelf: 'T',
    units: [['でも、<place>', 'に'], ['<food>', 'が'], ['<ある:masenDeshita>']],
    fixedUnits: [0],
  },
];
