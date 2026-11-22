<script setup lang="ts">
/** The sound switch, in both modes' side panels: blue while sound is on, red while it's off. */
import { isMuted, playSound, setMuted } from '../sound/sfx.ts';
import PixelButton from './PixelButton.vue';

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
    {{ isMuted ? '🔇 Sound off' : '🔊 Sound on' }}
  </PixelButton>
</template>
