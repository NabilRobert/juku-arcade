/**
 * True while a phone is turned sideways: a landscape screen at most 500 px
 * tall that's either touch-driven, or at most 1000 px wide (a phone's
 * landscape width). The game doesn't support that, so the app shell covers
 * it with RotateNotice.vue and pauses the run (playtest decision,
 * 2026-11-26). Tablets in landscape are 600 px tall and up, so they don't
 * match.
 *
 * The width check is there because a touch check alone missed browsers'
 * phone previews, which report a mouse (playtest: "i dont think it
 * worked"). A desktop window dragged that small matches too, which is fine:
 * the game doesn't fit there either.
 */
import { useMediaQuery } from './useMediaQuery.ts';

/** Phones in landscape are about 320–430 px tall; tablets start around 600. */
const MAX_PHONE_LANDSCAPE_HEIGHT_PX = 500;
/** The widest phones in landscape are about 930 px wide. */
const MAX_PHONE_LANDSCAPE_WIDTH_PX = 1000;

const SIDEWAYS = `(orientation: landscape) and (max-height: ${MAX_PHONE_LANDSCAPE_HEIGHT_PX}px)`;
// A comma in a media query means "or".
const PHONE_LANDSCAPE_QUERY = `${SIDEWAYS} and (pointer: coarse), ${SIDEWAYS} and (max-width: ${MAX_PHONE_LANDSCAPE_WIDTH_PX}px)`;

export function usePhoneLandscape() {
  return useMediaQuery(PHONE_LANDSCAPE_QUERY, false);
}
