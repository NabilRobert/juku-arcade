<script setup lang="ts">
/**
 * The end of the show (D59): the storyteller bows to applause and says
 * the rakugo closing line, おあとがよろしいようで; the curtains close on
 * the stage from both sides; then the haiku card that closes the show is
 * dealt in, and the results come after.
 */
import { onMounted, ref } from 'vue';
import { useLater } from '../../composables/useLater.ts';
import type { Haiku } from '../../grammar/haiku-bank.ts';
import { playSound } from '../../sound/sfx.ts';
import PixelButton from '../ui/PixelButton.vue';
import HaikuCard from './HaikuCard.vue';
import StoryStage from './StoryStage.vue';

defineProps<{ haiku: Haiku; isNew: boolean; collected: number; total: number }>();
defineEmits<{ results: [] }>();

/** The rakugo storyteller's traditional last words: "the next act is ready". */
const CLOSING_LINE = 'おあとがよろしいようで';
/** How long the bow and the applause run before the curtains close. */
const BOW_MS = 1800;
/** How long the curtains take to meet (StoryStage's transition), before the haiku card comes. */
const CURTAIN_MS = 800;

const later = useLater();
const isCurtainClosed = ref(false);
const isHaikuShown = ref(false);
onMounted(() => {
  playSound('applause');
  later(() => {
    isCurtainClosed.value = true;
    playSound('whoosh');
  }, BOW_MS);
  later(() => {
    isHaikuShown.value = true;
    playSound('shamisen');
  }, BOW_MS + CURTAIN_MS);
});
</script>

<template>
  <section
    class="flex flex-col gap-4"
    :aria-label="$t('bunpou.endOfShow')"
    data-testid="curtain-call"
  >
    <StoryStage
      pose="bow"
      :slips="0"
      :bubble="CLOSING_LINE"
      is-crowd-laughing
      :is-curtain-closed="isCurtainClosed"
    />
    <div class="flex min-h-72 flex-col items-center gap-4">
      <template v-if="isHaikuShown">
        <HaikuCard
          class="motion-safe:animate-drop-in"
          :haiku="haiku"
          :is-new="isNew"
          :collected="collected"
          :total="total"
        />
        <PixelButton
          colour="aqua"
          class="px-6 py-2 font-bold"
          data-testid="see-results"
          @click="$emit('results')"
        >
          {{ $t('bunpou.seeResults') }}
        </PixelButton>
      </template>
    </div>
  </section>
</template>
