<script setup lang="ts">
/**
 * The pixel-art body every card is drawn on (D32): a karuta card, as an
 * 8-bit sprite. A hard shadow, a thick frame (crimson, or a status
 * colour) with stepped pixel corners and a lit top edge, and a washi paper
 * face, or the patterned back when the card is face down. The parent puts
 * its text on top. One "pixel" is a share of the card's width (--pixel in
 * style.css), so the art scales with the card and stays chunky.
 */
export type FrameColour = 'crimson' | 'lit' | 'ink' | 'aqua';

defineProps<{ frame: FrameColour; isFaceDown: boolean }>();

const FRAME_CLASSES: Record<FrameColour, string> = {
  lit: 'bg-washi',
  crimson: 'bg-crimson',
  ink: 'bg-sumi',
  aqua: 'bg-aqua',
};
</script>

<template>
  <span class="pixel-shadow" aria-hidden="true" />
  <span class="pixel-frame" :class="FRAME_CLASSES[frame]" aria-hidden="true" />
  <span class="pixel-face" :class="isFaceDown ? 'card-back' : 'washi'" aria-hidden="true" />
</template>
