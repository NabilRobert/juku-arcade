<script setup lang="ts">
/**
 * An on/off switch as a pixel button, blue while on and red while off,
 * like the sound switch: Bunpou's hint and furigana (src/preferences/).
 */
import PixelButton from './PixelButton.vue';

defineProps<{ label: string; isOn: boolean }>();
defineEmits<{ change: [isOn: boolean] }>();
</script>

<template>
  <PixelButton
    :colour="isOn ? 'steel' : 'crimson'"
    class="min-h-9 px-4 text-sm"
    :aria-pressed="isOn"
    @click="$emit('change', !isOn)"
  >
    {{ $t(isOn ? 'common.switchOn' : 'common.switchOff', { label }) }}
  </PixelButton>
</template>
