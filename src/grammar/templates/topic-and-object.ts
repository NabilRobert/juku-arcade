/**
 * Bunpou sentence templates (D55): The topic, object and subject markers: は, を, も, が.
 * The format is in ../templates.ts; TEMPLATES there joins every group.
 */
import type { Template } from '../templates.ts';

export const topicAndObject: readonly Template[] = [
  // は
  {
    id: 'wa-S',
    point: 'wa',
    shelf: 'S',
    // 毎朝 rides with the verb it describes, not with the food: 卵を｜毎朝食べます.
    units: [['<who>', 'は'], ['<food>', 'を'], ['{毎朝|まいあさ}<食べる:masu>']],
  },
  {
    id: 'wa-D',
    point: 'wa',
    shelf: 'D',
    units: [['<who>', 'は'], ['<place>', 'へ'], ['<行く:mashita>']],
  },
  {
    id: 'wa-P',
    point: 'wa',
    shelf: 'P',
    units: [['<who>', 'は'], ['<thing>', 'を'], ['<忘れる:mashita>']],
  },
  // を
  {
    id: 'o-D',
    point: 'o',
    shelf: 'D',
    units: [['<who>', 'は'], ['<thing>', 'を'], ['<買う:mashita>']],
  },
  {
    id: 'o-P',
    point: 'o',
    shelf: 'P',
    units: [['<place2>', 'に'], ['<thing>', 'を'], ['<忘れる:mashita>']],
  },
  {
    id: 'o-P-more',
    point: 'o',
    shelf: 'P',
    followOn: true,
    units: [['<who2>', 'が'], ['<food>', 'を'], ['<食べる:mashita>']],
  },
  // も
  {
    id: 'mo-T',
    point: 'mo',
    shelf: 'T',
    units: [['でも、<who2>', 'も'], ['<time>', 'に'], ['<来る:masenDeshita>']],
    fixedUnits: [0],
  },
  {
    id: 'mo-T-none',
    point: 'mo',
    shelf: 'T',
    units: [['<place>', 'に'], ['<food>', 'も'], ['<ある:masenDeshita>']],
  },
  {
    id: 'mo-D-more',
    point: 'mo',
    shelf: 'D',
    followOn: true,
    units: [['<who2>', 'も'], ['<place>', 'へ'], ['<行く:mashita>']],
  },
  // が (subject)
  {
    id: 'ga-S',
    point: 'ga-subject',
    shelf: 'S',
    units: [['<place>', 'に'], ['<who2>', 'が'], ['<来る:masu>']],
  },
  {
    id: 'ga-T',
    point: 'ga-subject',
    shelf: 'T',
    units: [['でも、<place>', 'に'], ['<who2>', 'が'], ['<来る:masenDeshita>']],
    fixedUnits: [0],
  },
  {
    id: 'ga-T-forgot',
    point: 'ga-subject',
    shelf: 'T',
    units: [['<who2>', 'が'], ['<thing>', 'を'], ['<忘れる:mashita>']],
  },
];
