/**
 * Background music (D50): "You're Not There" by MagiaZ, from Pixabay
 * (Pixabay Content License), looping under the whole game. Browsers only
 * allow sound after the player has touched the page, so it starts on the
 * first press anywhere. Its volume is a setting (0 to 1; 0 is off),
 * remembered in this browser like the mute switch (sfx.ts), which silences
 * the music too. It pauses while the tab is hidden.
 */
import { ref, watch } from 'vue';
import { isMuted } from './sfx.ts';

const MUSIC_FILE = 'music/youre-not-there.m4a';
const VOLUME_KEY = 'juku-arcade:music-volume';
/** Quiet enough to sit under the card sounds. */
export const DEFAULT_MUSIC_VOLUME = 0.3;

function readVolume(): number {
  try {
    const saved = Number(localStorage.getItem(VOLUME_KEY) ?? Number.NaN);
    return saved >= 0 && saved <= 1 ? saved : DEFAULT_MUSIC_VOLUME;
  } catch {
    return DEFAULT_MUSIC_VOLUME;
  }
}

export const musicVolume = ref(readVolume());

export function setMusicVolume(volume: number): void {
  musicVolume.value = Math.min(1, Math.max(0, volume));
  try {
    localStorage.setItem(VOLUME_KEY, String(musicVolume.value));
  } catch {
    // Storage can be blocked (a private window); the volume then lasts this visit.
  }
}

let track: HTMLAudioElement | null = null;

/** Plays or pauses the track to match the volume, the mute switch and the tab. */
function syncPlayback(): void {
  if (track === null) return;
  track.volume = musicVolume.value;
  const isAudible = musicVolume.value > 0 && !isMuted.value;
  if (isAudible && document.visibilityState === 'visible') {
    // A browser may still refuse (autoplay rules); the next press tries again.
    track.play().catch(() => undefined);
  } else {
    track.pause();
  }
}

function begin(): void {
  if (track === null) {
    track = new Audio(`${import.meta.env.BASE_URL}${MUSIC_FILE}`);
    track.loop = true;
  }
  syncPlayback();
}

/** Starts the music on the player's first press, then keeps it in step. Call once, at start-up. */
export function startMusicOnFirstPress(): void {
  window.addEventListener('pointerdown', begin, { once: true });
  window.addEventListener('keydown', begin, { once: true });
  document.addEventListener('visibilitychange', syncPlayback);
  watch([musicVolume, isMuted], syncPlayback);
}
