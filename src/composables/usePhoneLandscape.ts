/**
 * True while a phone is turned sideways: a touch screen in landscape, at
 * most 500 px tall. The game doesn't support that, so the app shell covers
 * it with RotateNotice.vue and pauses the run (playtest decision,
 * 2026-11-26). Tablets in landscape (600 px tall and up) and desktop
 * windows (a mouse, not touch) don't match.
 */
import { useMediaQuery } from './useMediaQuery.ts';

const PHONE_LANDSCAPE_QUERY =
  '(orientation: landscape) and (max-height: 500px) and (pointer: coarse)';

export function usePhoneLandscape() {
  return useMediaQuery(PHONE_LANDSCAPE_QUERY, false);
}
