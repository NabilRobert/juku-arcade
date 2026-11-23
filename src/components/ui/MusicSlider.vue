<script setup lang="ts">
/**
 * The music volume slider (D50), in the side panels of both modes and in
 * Settings: 0 to 100%, where 0 turns the music off. It changes the volume
 * as it's dragged, and the setting is remembered in this browser.
 */
import { computed } from 'vue';
import { musicVolume, setMusicVolume } from '../../sound/music.ts';

const percent = computed(() => Math.round(musicVolume.value * 100));

function onInput(event: Event): void {
  const slider = event.target as HTMLInputElement;
  setMusicVolume(Number(slider.value) / 100);
}
</script>

<template>
  <label class="flex items-center gap-3 text-sm">
    <span class="w-12 shrink-0">Music</span>
    <input
      type="range"
      min="0"
      max="100"
      step="5"
      :value="percent"
      class="h-2 flex-1 cursor-pointer accent-aqua"
      aria-label="Music volume"
      data-testid="music-volume"
      @input="onInput"
    />
    <span class="w-10 shrink-0 text-right text-washi/70">{{
      percent === 0 ? 'off' : `${percent}%`
    }}</span>
  </label>
</template>
