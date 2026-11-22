<script setup lang="ts">
/**
 * The pixel-art body every card is drawn on (D32): a karuta card, as an
 * 8-bit sprite. A hard shadow, a thick frame (crimson, or a status
 * colour) with stepped pixel corners and a lit top edge, and a washi paper
 * face, or the patterned back when the card is face down. The parent puts
 * its text on top. One "pixel" is a share of the card's width (--pixel in
 * style.css), so the art scales with the card and stays chunky.
 *
 * A scouted crest (crest-mark.ts) tints the card: a crimson frame takes the
 * crest's colour, and so does the back's lattice. A status colour (lit,
 * ink, aqua) still wins on the front, as it says what just happened.
 */
import { computed } from 'vue';

export type FrameColour = 'crimson' | 'lit' | 'ink' | 'aqua';

const props = defineProps<{ frame: FrameColour; isFaceDown: boolean; tint?: string }>();

const FRAME_CLASSES: Record<FrameColour, string> = {
  lit: 'bg-washi',
  crimson: 'bg-crimson',
  ink: 'bg-sumi',
  aqua: 'bg-aqua',
};

const isTinted = computed(() => props.tint !== undefined && props.frame === 'crimson');
const frameStyle = computed(() => (isTinted.value ? { backgroundColor: props.tint } : undefined));
const faceClass = computed(() => {
  if (!props.isFaceDown) return 'washi';
  return props.tint === undefined ? 'card-back' : 'card-back-tinted';
});
</script>

<template>
  <span class="pixel-shadow" aria-hidden="true" />
  <span
    class="pixel-frame"
    :class="FRAME_CLASSES[frame]"
    :style="frameStyle"
    :data-tint="isTinted ? tint : undefined"
    aria-hidden="true"
  />
  <span
    class="pixel-face"
    :class="faceClass"
    :style="tint === undefined ? undefined : { '--crest-tint': tint }"
    aria-hidden="true"
  />
</template>
