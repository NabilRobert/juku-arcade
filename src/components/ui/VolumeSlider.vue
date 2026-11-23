<script setup lang="ts">
/**
 * One volume slider (D50), for the music or the sound effects: 0 to 100%,
 * where 0 turns that sound off. It reports the new volume (0 to 1) as it's
 * dragged; the caller keeps and remembers it (sound/volume.ts).
 *
 * The slider is min-w-0: a range input won't shrink below the browser's
 * default width (about 129px) otherwise, which pushed "100%" out of the
 * narrow side panel.
 */
import { computed } from 'vue';

const props = defineProps<{ label: string; volume: number; testId: string }>();
const emit = defineEmits<{ change: [volume: number] }>();

const percent = computed(() => Math.round(props.volume * 100));

function onInput(event: Event): void {
  const slider = event.target as HTMLInputElement;
  emit('change', Number(slider.value) / 100);
}
</script>

<template>
  <label class="flex items-center gap-3 pr-1 text-base">
    <span class="w-16 shrink-0">{{ label }}</span>
    <input
      type="range"
      min="0"
      max="100"
      step="5"
      :value="percent"
      class="h-3 min-w-0 flex-1 cursor-pointer accent-aqua"
      :aria-label="`${label} volume`"
      :data-testid="testId"
      @input="onInput"
    />
    <span class="w-12 shrink-0 text-right text-washi/70">{{
      percent === 0 ? 'off' : `${percent}%`
    }}</span>
  </label>
</template>
