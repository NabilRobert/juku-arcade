<script setup lang="ts">
/**
 * The sound controls, in both modes' side panels: the sound switch, blue
 * while sound is on and red while it's off (it silences the music too), and
 * the effects and music volume sliders under it. They sit in their own panel, the button
 * sized like the Scout button.
 */
import { isMuted, setMuted } from '../../sound/sfx.ts';
import PixelButton from './PixelButton.vue';
import SoundSliders from './SoundSliders.vue';
import PixelIcon from './PixelIcon.vue';

function toggleSound(): void {
  setMuted(!isMuted.value);
}
</script>

<template>
  <section class="pixel-panel flex flex-col gap-2 bg-wood/80 p-3">
    <PixelButton
      :colour="isMuted ? 'crimson' : 'steel'"
      class="min-h-9 px-4 text-sm"
      :aria-pressed="!isMuted"
      @click="toggleSound"
    >
      <span class="inline-flex items-center gap-2">
        <PixelIcon :name="isMuted ? 'soundOff' : 'soundOn'" />
        {{ isMuted ? 'Sound off' : 'Sound on' }}
      </span>
    </PixelButton>
    <SoundSliders />
  </section>
</template>
