<script setup lang="ts">
/** The sound switch, in both modes' side panels: blue while sound is on, red while it's off. */
import { isMuted, playSound, setMuted } from '../sound/sfx.ts';
import PixelButton from './PixelButton.vue';
import PixelIcon from './PixelIcon.vue';

function toggleSound(): void {
  setMuted(!isMuted.value);
  playSound('pickUp');
}
</script>

<template>
  <PixelButton
    :colour="isMuted ? 'crimson' : 'steel'"
    class="min-h-9 px-4 text-xs"
    :aria-pressed="!isMuted"
    @click="toggleSound"
  >
    <span class="inline-flex items-center gap-2">
      <PixelIcon :name="isMuted ? 'soundOff' : 'soundOn'" />
      {{ isMuted ? 'Sound off' : 'Sound on' }}
    </span>
  </PixelButton>
</template>
