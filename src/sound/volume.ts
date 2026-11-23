/**
 * A volume setting from 0 (off) to 1 (full), remembered in this browser:
 * one for the background music (music.ts) and one for the sound effects
 * (sfx.ts), each set by its own slider (VolumeSlider.vue).
 */
import { ref } from 'vue';

function readVolume(key: string, fallback: number): number {
  try {
    const saved = Number(localStorage.getItem(key) ?? Number.NaN);
    return saved >= 0 && saved <= 1 ? saved : fallback;
  } catch {
    return fallback;
  }
}

export function storedVolume(key: string, fallback: number) {
  const volume = ref(readVolume(key, fallback));
  return {
    volume,
    set: (next: number): void => {
      volume.value = Math.min(1, Math.max(0, next));
      try {
        localStorage.setItem(key, String(volume.value));
      } catch {
        // Storage can be blocked (a private window); the volume then lasts this visit.
      }
    },
  };
}
