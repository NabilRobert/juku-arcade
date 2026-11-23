/**
 * Background music (D50): "You're Not There" by MagiaZ, from Pixabay
 * (Pixabay Content License), looping under the whole game. Browsers only
 * allow sound after the player has touched the page, so it starts on the
 * first press anywhere. Its volume is its own setting (volume.ts; 0 is
 * off), and the mute switch (sfx.ts) silences the music too. It pauses while the tab is hidden.
 */
import { watch } from 'vue';
import { isMuted } from './sfx.ts';
import { storedVolume } from './volume.ts';

const MUSIC_FILE = 'music/youre-not-there.m4a';
const VOLUME_KEY = 'juku-arcade:music-volume';
/** Quiet enough to sit under the card sounds. */
export const DEFAULT_MUSIC_VOLUME = 0.3;

const music = storedVolume(VOLUME_KEY, DEFAULT_MUSIC_VOLUME);
export const musicVolume = music.volume;
export const setMusicVolume = music.set;

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
