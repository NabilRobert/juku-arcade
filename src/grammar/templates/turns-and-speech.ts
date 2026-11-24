/**
 * Bunpou sentence templates (D60): the tale's turns and its speech: が
 * (but), から (because), なにも・だれも with a negative, and the speech
 * patterns てください, ませんか and よ. They're pattern points, so only
 * the pattern's pieces are loose tiles and the rest comes as ready-made
 * phrases. A が or から clause that must open its sentence is a fixed
 * unit. The format is in ../templates.ts.
 */
import type { Template } from '../templates.ts';

export const turnsAndSpeech: readonly Template[] = [
  // が (but)
  {
    id: 'gabut-T-nobody',
    point: 'ga-but',
    shelf: 'T',
    units: [['<place>に<行く:mashita>', 'が、'], ['<who2>は'], ['<いる:masenDeshita>']],
    fixedUnits: [0],
  },
  {
    id: 'gabut-T-forgot',
    point: 'ga-but',
    shelf: 'T',
    units: [['<food>を<買う:mashita>', 'が、'], ['<thing>', 'を'], ['<忘れる:mashita>']],
    fixedUnits: [0],
  },
  {
    id: 'gabut-P-closed',
    point: 'ga-but',
    shelf: 'P',
    units: [['<place>に<行く:mashita>', 'が、'], ['<place2>', 'は'], ['{休|やす}みでした']],
    fixedUnits: [0],
  },
  // から (because)
  {
    id: 'karareason-T-forgot',
    point: 'kara-reason',
    shelf: 'T',
    units: [['<thing>を<忘れる:mashita>', 'から、'], ['<who>は'], ['{家|いえ}に<帰る:mashita>']],
  },
  {
    id: 'karareason-T-closed',
    point: 'kara-reason',
    shelf: 'T',
    units: [['<place>は{休|やす}みでした', 'から、'], ['<who>は'], ['{家|いえ}で<寝る:mashita>']],
  },
  {
    id: 'karareason-P-late',
    point: 'kara-reason',
    shelf: 'P',
    units: [['{時間|じかん}がありませんでした', 'から、'], ['<who>は'], ['<走る:mashita>']],
  },
  // なにも・だれも with a negative
  {
    id: 'nanimo-T-nobody',
    point: 'nani-mo-nai-dare-mo-nai',
    shelf: 'T',
    units: [['でも、'], ['<place>', 'には'], ['だれも'], ['<いる:masenDeshita>']],
    fixedUnits: [0],
  },
  {
    id: 'nanimo-T-ate-nothing',
    point: 'nani-mo-nai-dare-mo-nai',
    shelf: 'T',
    units: [['<who>', 'は'], ['なにも'], ['<食べる:masenDeshita>']],
  },
  {
    id: 'nanimo-P-nobody',
    point: 'nani-mo-nai-dare-mo-nai',
    shelf: 'P',
    units: [['<place>', 'には'], ['だれも'], ['<いる:masenDeshita>']],
  },
  {
    id: 'nanimo-P-bought-nothing',
    point: 'nani-mo-nai-dare-mo-nai',
    shelf: 'P',
    units: [['<who2>', 'は'], ['なにも'], ['<買う:masenDeshita>']],
  },
  // てください
  {
    id: 'kudasai-D-come',
    point: 'te-kudasai',
    shelf: 'D',
    units: [
      ['<place>', 'に'],
      ['<来る:te>', 'ください'],
    ],
  },
  {
    id: 'kudasai-D-wait',
    point: 'te-kudasai',
    shelf: 'D',
    units: [['<who2>と'], ['<place>', 'で'], ['<待つ:te>', 'ください']],
  },
  {
    id: 'kudasai-P-tomorrow',
    point: 'te-kudasai',
    shelf: 'P',
    units: [['{明日|あした}も'], ['<place>', 'に'], ['<来る:te>', 'ください']],
  },
  // ませんか
  {
    id: 'masenka-D-go',
    point: 'masen-ka',
    shelf: 'D',
    units: [['<who2>と'], ['<place>', 'に'], ['<行く:masen>', 'か']],
  },
  {
    id: 'masenka-D-eat',
    point: 'masen-ka',
    shelf: 'D',
    units: [['<place>', 'で'], ['<food>を'], ['<食べる:masen>', 'か']],
  },
  {
    id: 'masenka-P-walk',
    point: 'masen-ka',
    shelf: 'P',
    units: [['{一緒|いっしょ}に'], ['<place>', 'まで'], ['<歩く:masen>', 'か']],
  },
  // よ
  {
    id: 'yo-D-here',
    point: 'yo',
    shelf: 'D',
    units: [['<who2>は'], ['<place>', 'に'], ['<いる:masu>', 'よ']],
  },
  {
    id: 'yo-P-closed',
    point: 'yo',
    shelf: 'P',
    units: [
      ['<place>', 'は'],
      ['{休|やす}みです', 'よ'],
    ],
  },
  {
    id: 'yo-P-umbrella',
    point: 'yo',
    shelf: 'P',
    units: [['<thing>は'], ['<place>', 'に'], ['<ある:masu>', 'よ']],
  },
];
