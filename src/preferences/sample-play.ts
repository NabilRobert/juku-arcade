/**
 * Whether the streak and the play calendar show the sample week of play
 * (sample-play.ts): for demos (playtest decision, 2026-11-26: "add a
 * setting ... to turn it on or off"). It's labelled "sample data", shown
 * and never saved. It starts on wherever the build sets VITE_SAMPLE_PLAY
 * (a local copy, the GitHub Pages demo) and off otherwise; a switch in
 * Settings changes it, remembered in this browser.
 */
import { PREFERENCE_KEYS } from './preference-keys.ts';
import { storedFlag } from './stored-flag.ts';

const samplePlay = storedFlag(PREFERENCE_KEYS.samplePlay, import.meta.env.VITE_SAMPLE_PLAY === '1');
export const isSamplePlayShown = samplePlay.isOn;
export const setSamplePlayShown = samplePlay.set;
