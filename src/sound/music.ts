/**
 * Background music (D50): "France Instrumental" by Sub_Clair, from
 * Pixabay (Pixabay Content License), looping under the whole game. Browsers only
 * allow sound after the player has touched the page, so it starts on the
 * first click, tap or key press anywhere, and each press after tries again
 * until it plays. Safari on iPhone and iPad won't start sound from a
 * touch's pointerdown, which this used to wait for, so the music never
 * started there. Its volume is its own setting (volume.ts; 0 is
 * off), and the mute switch (sfx.ts) silences the music too. It pauses while the tab is hidden.
 */
import { PREFERENCE_KEYS } from '../preferences/preference-keys.ts';
import { watch } from 'vue';
import { isMuted } from './sfx.ts';
import { storedVolume } from './volume.ts';

const MUSIC_FILE = 'music/france-instrumental.m4a';
const VOLUME_KEY = PREFERENCE_KEYS.musicVolume;
/** Quiet enough to sit under the card sounds. */
export const DEFAULT_MUSIC_VOLUME = 0.3;

const music = storedVolume(VOLUME_KEY, DEFAULT_MUSIC_VOLUME);
export const musicVolume = music.volume;
export const setMusicVolume = music.set;

let track: HTMLAudioElement | null = null;

/** Events a browser counts as the player's go-ahead for sound; a tap ends in touchend on a phone. */
const START_EVENTS = ['click', 'touchend', 'keydown'] as const;

function stopWaitingForPress(): void {
  for (const event of START_EVENTS) window.removeEventListener(event, begin);
}

/** Plays or pauses the track to match the volume, the mute switch and the tab. */
function syncPlayback(): void {
  if (track === null) return;
  track.volume = musicVolume.value;
  const isAudible = musicVolume.value > 0 && !isMuted.value;
  if (isAudible && document.visibilityState === 'visible') {
    // A browser may still refuse (autoplay rules); the next press tries again.
    track
      .play()
      .then(stopWaitingForPress)
      .catch(() => undefined);
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
  for (const event of START_EVENTS) window.addEventListener(event, begin);
  document.addEventListener('visibilitychange', syncPlayback);
  watch([musicVolume, isMuted], syncPlayback);
}
