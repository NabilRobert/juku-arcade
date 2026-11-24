/**
 * Bunpou's hint (D56): the line's grammar point, shown as its pattern
 * (人＋と) beside the part of the tale, so the player knows what kind of
 * sentence to build. It's free and on by default; a switch in the side
 * panel and in Settings turns it off, remembered in this browser like the
 * sound settings. Plain code: a ref and localStorage need no library.
 */
import { ref } from 'vue';

const HINTS_KEY = 'juku-arcade:bunpou-hints';

function readHintsShown(): boolean {
  try {
    return localStorage.getItem(HINTS_KEY) !== 'false';
  } catch {
    return true;
  }
}

export const areHintsShown = ref(readHintsShown());

export function setHintsShown(isShown: boolean): void {
  areHintsShown.value = isShown;
  try {
    localStorage.setItem(HINTS_KEY, String(isShown));
  } catch {
    // Storage can be blocked (a private window); the choice then lasts this visit.
  }
}
