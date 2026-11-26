/** The Indonesian messages; each file has the shape of its English one (en/). */
import type { Messages } from '../en/index.ts';
import { common } from './common.ts';
import { settings } from './settings.ts';
import { modes } from './modes.ts';
import { menu } from './menu.ts';
import { streak } from './streak.ts';
import { leaderboard } from './leaderboard.ts';
import { game } from './game.ts';
import { kanji } from './kanji.ts';
import { bunpou } from './bunpou.ts';
import { practice } from './practice.ts';
import { pages } from './pages.ts';

export const id: Messages = {
  common,
  settings,
  modes,
  menu,
  streak,
  leaderboard,
  game,
  kanji,
  bunpou,
  practice,
  pages,
};
