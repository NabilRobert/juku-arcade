/**
 * Bunpou's hint (D56): the line's grammar point, shown as its pattern
 * (人＋と) beside the part of the tale, so the player knows what kind of
 * sentence to build. It's free and on by default; a switch in Bunpou's
 * side panel and in Settings turns it off.
 */
import { PREFERENCE_KEYS } from './preference-keys.ts';
import { storedFlag } from './stored-flag.ts';

const hints = storedFlag(PREFERENCE_KEYS.bunpouHints, true);
export const areHintsShown = hints.isOn;
export const setHintsShown = hints.set;
