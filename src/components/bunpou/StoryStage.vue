<script setup lang="ts">
/**
 * The rakugo stage (D58): the storyteller kneeling on his cushion in a
 * warm spotlight, the sealed slips in his sleeve (one per line built, so
 * the player sees how far the tale has got but not the story), a speech
 * bubble, and a packed house across the whole width in front: two rows of
 * dark silhouettes (crowd-strip.ts) that sit still, cheer and hop, or
 * show one phone glowing when a tale falls flat. The crowd's shout floats
 * over the stage, and at the end of the show the curtains close on it
 * from both sides. A cedar frame with a dark inner edge, drawn over the
 * curtains, makes the stage's opening. The board and the performance drive it with props; it
 * has no state of its own. On a phone or a tablet the stage can grow taller to fill the
 * screen (BunpouScreen.vue); the crowd keeps the stage's usual height, so the extra shows as
 * more of the dark hall above it rather than a giant crowd.
 */
import { computed } from 'vue';
import PixelSprite from '../ui/PixelSprite.vue';
import { CROWD_PALETTES, crowdStrip, type CrowdLayer } from './crowd-strip.ts';
import { SLIP, STAGE_PALETTE, STORYTELLER, type StorytellerPose } from './stage-sprites.ts';

const props = defineProps<{
  pose: StorytellerPose;
  slips: number;
  /** What the storyteller says, or null for nothing. */
  bubble?: string | null;
  isCrowdLaughing?: boolean;
  /** One audience member checks a phone: the tale fell flat. */
  isPhoneOut?: boolean;
  /** The crowd's shout, or null. */
  shout?: string | null;
  isShoutLoud?: boolean;
  /** The curtains drawn across the stage from both sides, at the end of the show. */
  isCurtainClosed?: boolean;
}>();

/** Each nearer layer hops a beat after the one behind it, so the cheering ripples forward. */
const HOP_STEP_MS = 150;
const LAYERS: readonly CrowdLayer[] = ['far', 'middle', 'near'];

/** The two curtains: each starts off its own side of the stage and slides in to meet in the middle. */
const CURTAIN_SIDES = [
  { side: 'left', place: 'left-0 border-r-4', open: '-translate-x-full' },
  { side: 'right', place: 'right-0 border-l-4', open: 'translate-x-full' },
] as const;

const crowdLayers = computed(() =>
  LAYERS.map((layer, depth) => ({
    layer,
    grid: crowdStrip(layer, {
      isCheering: props.isCrowdLaughing === true,
      hasPhone: layer === 'near' && props.isPhoneOut === true,
    }),
    delay: `${depth * HOP_STEP_MS}ms`,
  })),
);
</script>

<template>
  <section
    class="pixel-panel relative h-44 overflow-hidden border-9 border-cedar bg-wood/90 sm:h-66"
    :aria-label="$t('bunpou.stage')"
    data-testid="stage"
    :data-pose="pose"
  >
    <div
      class="absolute inset-y-0 left-1/2 w-96 -translate-x-1/2 bg-lamp/15 [clip-path:polygon(42%_0,58%_0,100%_100%,0_100%)]"
      aria-hidden="true"
    />
    <div
      class="absolute bottom-10 left-1/2 h-8 w-56 -translate-x-1/2 rounded-[50%] bg-lamp/25 sm:bottom-22 sm:h-10 sm:w-80"
      aria-hidden="true"
    />
    <!-- On a phone the stage is shorter, so the storyteller sits lower and smaller, head in view. -->
    <div class="absolute bottom-12 left-1/2 -translate-x-1/2 sm:bottom-24">
      <PixelSprite
        :grid="STORYTELLER[pose]"
        :palette="STAGE_PALETTE"
        :name="`storyteller-${pose}`"
        class="h-24 sm:h-32"
        :class="pose === 'trip' ? 'rotate-6 motion-safe:animate-shake' : ''"
      />
      <div
        class="absolute bottom-2 left-full ml-3 flex w-16 flex-wrap-reverse gap-1"
        data-testid="slips"
        :data-count="slips"
      >
        <PixelSprite
          v-for="slip in slips"
          :key="slip"
          :grid="SLIP"
          :palette="STAGE_PALETTE"
          name="slip"
          class="h-5 motion-safe:animate-drop-in"
        />
      </div>
    </div>
    <p
      v-if="bubble"
      class="absolute top-4 left-[calc(50%+4.5rem)] z-10 bg-washi px-3 py-1 text-xl whitespace-nowrap text-sumi"
      lang="ja"
      data-testid="bubble"
    >
      {{ bubble }}
    </p>
    <div
      v-for="crowd in crowdLayers"
      :key="crowd.layer"
      class="absolute inset-x-0 -bottom-2 h-[calc(11rem+0.5rem)] sm:h-[calc(16.5rem+0.5rem)]"
      :class="isCrowdLaughing ? 'motion-safe:animate-cheer' : ''"
      :style="{ animationDelay: crowd.delay }"
      aria-hidden="true"
      :data-testid="`crowd-${crowd.layer}`"
    >
      <PixelSprite
        :grid="crowd.grid"
        :palette="CROWD_PALETTES[crowd.layer]"
        :name="`crowd-${crowd.layer}`"
        is-cover
      />
    </div>
    <p
      v-if="shout"
      class="absolute top-4 left-6 z-10 font-bold"
      :class="isShoutLoud ? 'text-5xl text-washi' : 'text-3xl text-aqua'"
      lang="ja"
      role="status"
      data-testid="shout"
    >
      {{ shout }}
    </p>
    <div
      v-for="side in CURTAIN_SIDES"
      :key="side.side"
      class="curtain absolute inset-y-0 z-20 w-1/2 border-sumi motion-safe:transition-transform motion-safe:duration-700 motion-safe:ease-in-out"
      :class="[side.place, isCurtainClosed ? 'translate-x-0' : side.open]"
      aria-hidden="true"
      :data-testid="`curtain-${side.side}`"
      :data-closed="isCurtainClosed === true ? '' : undefined"
    />
    <div
      class="pointer-events-none absolute inset-0 z-30 border-3 border-sumi/80"
      aria-hidden="true"
    />
  </section>
</template>
