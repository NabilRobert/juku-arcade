<script setup lang="ts">
/**
 * The two volume sliders, in both modes' side panels and in Settings:
 * the sound effects (sfx.ts) and the background music (music.ts), each
 * remembered in this browser.
 */
import { musicVolume, setMusicVolume } from '../../sound/music.ts';
import { effectsVolume, setEffectsVolume } from '../../sound/sfx.ts';
import VolumeSlider from './VolumeSlider.vue';
</script>

<template>
  <div class="flex flex-col gap-2.5 py-1">
    <VolumeSlider
      label="Effects"
      :volume="effectsVolume"
      test-id="effects-volume"
      @change="setEffectsVolume"
    />
    <VolumeSlider
      label="Music"
      :volume="musicVolume"
      test-id="music-volume"
      @change="setMusicVolume"
    />
  </div>
</template>
