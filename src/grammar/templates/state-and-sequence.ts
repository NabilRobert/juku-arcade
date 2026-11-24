/**
 * Bunpou sentence templates (D60): what's going on, and one thing after
 * another: ている, て and てから. They're pattern points, so only the
 * pattern's pieces are loose tiles (働いて｜います, 食べて｜から、) and the
 * rest comes as ready-made phrases. The format is in ../templates.ts.
 */
import type { Template } from '../templates.ts';

export const stateAndSequence: readonly Template[] = [
  // ている
  {
    id: 'teiru-S-work',
    point: 'te-iru',
    shelf: 'S',
    units: [['<who>は'], ['<place>', 'で'], ['<働く:te>', 'います']],
  },
  {
    id: 'teiru-S-wait',
    point: 'te-iru',
    shelf: 'S',
    units: [['<who2>は'], ['<place>', 'で'], ['<待つ:te>', 'います']],
  },
  {
    id: 'teiru-T-asleep',
    point: 'te-iru',
    shelf: 'T',
    units: [['でも、<who2>は'], ['<place>', 'で'], ['<寝る:te>', 'いました']],
    fixedUnits: [0],
  },
  // て (one action, then the next)
  {
    id: 'te-D-go-buy',
    point: 'te',
    shelf: 'D',
    units: [['<who>は'], ['<place>', 'に', '<行く:te>、'], ['<thing>を<買う:mashita>']],
  },
  {
    id: 'te-D-eat-go',
    point: 'te',
    shelf: 'D',
    units: [['<who>は'], ['<food>', 'を', '<食べる:te>、'], ['<place>に<行く:mashita>']],
  },
  {
    id: 'te-T-forgot',
    point: 'te',
    shelf: 'T',
    units: [['でも、<who2>は'], ['<thing>', 'を', '<忘れる:te>、'], ['<帰る:mashita>']],
    fixedUnits: [0],
  },
  // てから
  {
    id: 'tekara-D-eat',
    point: 'te-kara',
    shelf: 'D',
    units: [['<who>は'], ['<food>を<食べる:te>', 'から、'], ['<place>に<行く:mashita>']],
  },
  {
    id: 'tekara-D-meet',
    point: 'te-kara',
    shelf: 'D',
    units: [['<who>は'], ['<who2>に<会う:te>', 'から、'], ['<place>に<帰る:mashita>']],
  },
  {
    id: 'tekara-T-slept',
    point: 'te-kara',
    shelf: 'T',
    units: [['でも、<who2>は'], ['<food>を<食べる:te>', 'から、'], ['<寝る:mashita>']],
    fixedUnits: [0],
  },
];
