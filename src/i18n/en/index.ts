/**
 * The English messages, one file per part of the game. English is the
 * source: `Messages` is its shape, and the Indonesian files must match it.
 */
import { common } from './common.ts';
import { settings } from './settings.ts';

export const en = { common, settings };

export type Messages = typeof en;
