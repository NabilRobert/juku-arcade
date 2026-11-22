<script setup lang="ts">
/**
 * The pixel-art body every card is drawn on (D32): a karuta card, as an
 * 8-bit sprite. A hard shadow, a thick frame (karuta green, or a status
 * colour) with stepped pixel corners and a lit top edge, and a white paper
 * face, or the patterned back when the card is face down. The parent puts
 * its text on top. One "pixel" is a share of the card's width (--pixel in
 * style.css), so the art scales with the card and stays chunky.
 */
export type FrameColour = 'karuta' | 'gold' | 'vermilion' | 'bright';

defineProps<{ frame: FrameColour; isFaceDown: boolean }>();

const FRAME_CLASSES: Record<FrameColour, string> = {
  karuta: 'bg-karuta',
  gold: 'bg-gold',
  vermilion: 'bg-vermilion',
  bright: 'bg-karuta-bright',
};
</script>

<template>
  <span class="pixel-shadow" aria-hidden="true" />
  <span class="pixel-frame" :class="FRAME_CLASSES[frame]" aria-hidden="true" />
  <span class="pixel-face" :class="isFaceDown ? 'card-back' : 'bg-paper'" aria-hidden="true" />
</template>
