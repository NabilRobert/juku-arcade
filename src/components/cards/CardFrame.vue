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

/**
 * The three layers, each with stepped corners (pixel-corners in style.css).
 * A "pixel" here is a share of the card's width, so the art grows with the
 * card; the shadow is hard and offset, as in 8-bit card sprites, and the
 * frame has a lit top edge and a dark bottom edge, so it reads as raised.
 */
const LAYER = 'pointer-events-none absolute pixel-corners [--pixel:max(3px,2.2cqw)]';
const SHADOW_CLASS = `${LAYER} inset-0 translate-y-[calc(var(--pixel)*2)] bg-black/50`;
const FRAME_CLASS = `${LAYER} inset-0 shadow-[inset_0_var(--pixel)_0_rgb(255_255_255/0.3),inset_0_calc(var(--pixel)*-1)_0_rgb(0_0_0/0.3)]`;
const FACE_CLASS = `${LAYER} inset-[calc(var(--pixel)*3)] shadow-[inset_0_0_0_var(--pixel)_rgb(0_0_0/0.08)]`;

const isTinted = computed(() => props.tint !== undefined && props.frame === 'crimson');
const frameStyle = computed(() => (isTinted.value ? { backgroundColor: props.tint } : undefined));
const faceClass = computed(() => {
  if (!props.isFaceDown) return 'washi';
  return props.tint === undefined ? 'card-back' : 'card-back-tinted';
});
</script>

<template>
  <span :class="SHADOW_CLASS" aria-hidden="true" />
  <span
    :class="[FRAME_CLASS, FRAME_CLASSES[frame]]"
    :style="frameStyle"
    :data-tint="isTinted ? tint : undefined"
    aria-hidden="true"
  />
  <span
    :class="[FACE_CLASS, faceClass]"
    :style="tint === undefined ? undefined : { '--crest-tint': tint }"
    aria-hidden="true"
  />
</template>
