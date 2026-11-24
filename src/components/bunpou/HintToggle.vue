<script setup lang="ts">
/** The switch for Bunpou's grammar hint (hints.ts): blue while hints show, red while they're off. */
import { areHintsShown, setHintsShown } from '../../grammar/hints.ts';
import PixelButton from '../ui/PixelButton.vue';
</script>

<template>
  <PixelButton
    :colour="areHintsShown ? 'steel' : 'crimson'"
    class="min-h-9 px-4 text-sm"
    :aria-pressed="areHintsShown"
    data-testid="hint-toggle"
    @click="setHintsShown(!areHintsShown)"
  >
    {{ areHintsShown ? 'Hints on' : 'Hints off' }}
  </PixelButton>
</template>
