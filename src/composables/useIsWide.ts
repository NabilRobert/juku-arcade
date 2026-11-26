/**
 * True while the window is at least Tailwind's lg breakpoint wide (64rem),
 * where a mode's side panel sits beside the board; below it, the panel is
 * a drawer (SidePanel.vue). Follows the window as it's resized.
 */
import { useMediaQuery } from './useMediaQuery.ts';

const WIDE_QUERY = '(min-width: 64rem)';

export function useIsWide() {
  return useMediaQuery(WIDE_QUERY, true);
}
