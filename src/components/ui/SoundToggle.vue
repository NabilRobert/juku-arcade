<script setup lang="ts">
/**
 * The sound switch, in both modes' side panels: blue while sound is on, red
 * while it's off. It sits in its own panel, sized like the Scout button's.
 */
import { isMuted, playSound, setMuted } from '../../sound/sfx.ts';
import PixelButton from './PixelButton.vue';
import PixelIcon from './PixelIcon.vue';

function toggleSound(): void {
  setMuted(!isMuted.value);
  playSound('pickUp');
}
</script>

<template>
  <section class="pixel-panel flex flex-col bg-wood/80 p-3">
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
  </section>
</template>
