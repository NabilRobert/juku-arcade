<script setup lang="ts">
/**
 * Every button outside the cards (D36): a pixel-art button with the
 * cards' stepped corners and a lit top edge (.pixel-button in style.css).
 * Classes, attributes and listeners the parent puts on it pass through to
 * the <button>.
 *
 * Each click plays a colour wipe that sweeps in from both edges and meets
 * in the middle. A plain click wipes in a contrasting colour, then fades.
 * When the click changes the button's colour (Pause turning red, Resume
 * turning blue), the wipe is the new colour and the button stays that
 * colour once the two halves meet.
 */
import { useReducedMotion } from 'motion-v';
import { ref, watch } from 'vue';

export type ButtonColour = 'crimson' | 'steel' | 'aqua' | 'paper';

const props = withDefaults(defineProps<{ colour?: ButtonColour }>(), { colour: 'steel' });

const BACKGROUNDS: Record<ButtonColour, string> = {
  crimson: 'bg-crimson text-washi',
  steel: 'bg-steel text-washi',
  aqua: 'bg-aqua text-sumi',
  paper: 'washi text-sumi',
};

/** Each colour as a CSS colour, for a wipe that turns the button that colour. */
const FILLS: Record<ButtonColour, string> = {
  crimson: 'var(--color-crimson)',
  steel: 'var(--color-steel)',
  aqua: 'var(--color-aqua)',
  paper: 'var(--color-washi)',
};

/** The contrasting colour a plain click wipes in. */
const FLASHES: Record<ButtonColour, string> = {
  crimson: 'var(--color-steel)',
  steel: 'var(--color-crimson)',
  aqua: 'var(--color-washi)',
  paper: 'var(--color-aqua)',
};

interface Wipe {
  /** A new key re-creates the wipe, which restarts its animation. */
  key: number;
  fill: string;
  /** True when the wipe turns the button a new colour rather than flashing. */
  isChange: boolean;
}

/** The colour the button shows; it lags a colour change until its wipe meets in the middle. */
const shownColour = ref<ButtonColour>(props.colour);
const wipe = ref<Wipe | null>(null);
const isReducedMotion = useReducedMotion();
let wipes = 0;

function flash(): void {
  wipes += 1;
  wipe.value = { key: wipes, fill: FLASHES[shownColour.value], isChange: false };
}

// Runs after the click that changed the colour, so the change wipe replaces the flash.
watch(
  () => props.colour,
  (next) => {
    if (isReducedMotion.value === true) {
      shownColour.value = next;
      wipe.value = null;
      return;
    }
    wipes += 1;
    wipe.value = { key: wipes, fill: FILLS[next], isChange: true };
  },
);

function finishWipe(): void {
  if (wipe.value?.isChange === true) shownColour.value = props.colour;
  wipe.value = null;
}
</script>

<template>
  <button type="button" class="pixel-button" :class="BACKGROUNDS[shownColour]" @click="flash">
    <span
      v-if="wipe"
      :key="wipe.key"
      class="pixel-wipe"
      :class="{ 'is-change': wipe.isChange }"
      :style="{ '--wipe': wipe.fill }"
      aria-hidden="true"
      @animationend="finishWipe"
    />
    <span class="relative"><slot /></span>
  </button>
</template>
