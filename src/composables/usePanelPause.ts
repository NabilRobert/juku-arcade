/**
 * Opening a mode's side drawer on a phone or a tablet pauses the game, as
 * the drawer covers the board (playtest decision, 2026-11-26). Closing it
 * resumes the game, but only if the drawer was what paused it: a game the
 * player paused themself stays paused. Takes the same controls as the Esc
 * key (usePauseKey.ts); returns the handler for SidePanel's `toggle` event.
 */
import type { PauseKeyInput } from './usePauseKey.ts';

export function usePanelPause({
  isPaused,
  isAvailable,
  pause,
  resume,
}: PauseKeyInput): (isOpen: boolean) => void {
  let isPausedByPanel = false;
  return (isOpen) => {
    if (isOpen) {
      isPausedByPanel = isAvailable() && !isPaused();
      if (isPausedByPanel) pause();
      return;
    }
    if (isPausedByPanel && isAvailable() && isPaused()) resume();
    isPausedByPanel = false;
  };
}
