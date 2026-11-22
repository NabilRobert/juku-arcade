/**
 * Esc pauses the game and Esc again resumes it, as the Pause button does,
 * so a player can stop without reaching for the mouse. It does nothing
 * while another page covers the game, or between sets, when the Pause
 * button is off too.
 */
import { onMounted, onUnmounted } from 'vue';

export interface PauseKeyInput {
  isPaused: () => boolean;
  /** False while Pause can't be used: another page is open, or the set has ended. */
  isAvailable: () => boolean;
  pause: () => void;
  resume: () => void;
}

export function usePauseKey({ isPaused, isAvailable, pause, resume }: PauseKeyInput): void {
  function onKey(event: KeyboardEvent): void {
    if (event.key !== 'Escape' || event.repeat || !isAvailable()) return;
    if (isPaused()) resume();
    else pause();
  }
  onMounted(() => window.addEventListener('keydown', onKey));
  onUnmounted(() => window.removeEventListener('keydown', onKey));
}
