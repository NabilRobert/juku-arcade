/**
 * Bunpou sentence templates (D55): When and where: に for a time, で for a place, まで and から.
 * The format is in ../templates.ts; TEMPLATES there joins every group.
 */
import type { Template } from '../templates.ts';

export const timeAndPlace: readonly Template[] = [
  // に (time)
  {
    id: 'ni-S',
    point: 'ni-time',
    shelf: 'S',
    units: [['<who>', 'は'], ['<time>', 'に'], ['<来る:masu>']],
  },
  {
    id: 'ni-S-more',
    point: 'ni-time',
    shelf: 'S',
    followOn: true,
    units: [['<time>', 'に'], ['<place>', 'へ'], ['<行く:masu>']],
  },
  {
    id: 'ni-D',
    point: 'ni-time',
    shelf: 'D',
    units: [['<time>', 'に'], ['<place2>', 'から'], ['<帰る:mashita>']],
    // 午後から学校に帰りました ("went back to school from the afternoon") is right too.
    swaps: [['に', 'から']],
  },
  // で (place)
  {
    id: 'de-D',
    point: 'de-place',
    shelf: 'D',
    units: [['<place>', 'で'], ['<food>', 'を'], ['<買う:mashita>']],
  },
  {
    id: 'de-P',
    point: 'de-place',
    shelf: 'P',
    units: [['<who>', 'は'], ['<place2>', 'で'], ['<寝る:mashita>']],
  },
  {
    id: 'de-P-wait',
    point: 'de-place',
    shelf: 'P',
    units: [['<place>', 'で'], ['<who2>', 'を'], ['<待つ:mashita>']],
  },
  // まで
  {
    id: 'made-D',
    point: 'made',
    shelf: 'D',
    units: [['<who>', 'は'], ['<place>', 'まで'], ['<走る:mashita>']],
  },
  {
    id: 'made-D-walk',
    point: 'made',
    shelf: 'D',
    units: [['<place2>', 'から'], ['<place>', 'まで'], ['<歩く:mashita>']],
    // 駅まで学校から歩きました is right too.
    swaps: [['から', 'まで']],
  },
  {
    id: 'made-P',
    point: 'made',
    shelf: 'P',
    units: [['<who2>', 'は'], ['<time>', 'まで'], ['<寝る:mashita>']],
  },
  // から (from)
  {
    id: 'kara-D',
    point: 'kara-from',
    shelf: 'D',
    units: [['<who>', 'は'], ['<place2>', 'から'], ['<帰る:mashita>']],
  },
  {
    id: 'kara-D-work',
    point: 'kara-from',
    shelf: 'D',
    units: [['<time>', 'から'], ['<place>', 'で'], ['<働く:mashita>']],
  },
  {
    id: 'kara-P',
    point: 'kara-from',
    shelf: 'P',
    units: [['<who2>', 'が'], ['<place>', 'から'], ['<来る:mashita>']],
  },
];
