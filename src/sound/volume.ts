/**
 * A volume setting from 0 (off) to 1 (full), remembered in this browser:
 * one for the background music (music.ts) and one for the sound effects
 * (sfx.ts), each set by its own slider (VolumeSlider.vue).
 */
import { readStored, writeStored } from '../memory/safe-storage.ts';
import { ref } from 'vue';

function readVolume(key: string, fallback: number): number {
  const saved = Number(readStored(key) ?? Number.NaN);
  return saved >= 0 && saved <= 1 ? saved : fallback;
}

export function storedVolume(key: string, fallback: number) {
  const volume = ref(readVolume(key, fallback));
  return {
    volume,
    set: (next: number): void => {
      volume.value = Math.min(1, Math.max(0, next));
      writeStored(key, String(volume.value));
    },
  };
}
