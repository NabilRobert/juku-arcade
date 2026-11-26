/**
 * The English messages, one file per part of the game. English is the
 * source: `Messages` is its shape, and the Indonesian files must match it.
 */
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

export const en = {
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

export type Messages = typeof en;
