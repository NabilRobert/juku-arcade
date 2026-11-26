<script setup lang="ts">
/**
 * Every mode's End run button (playtest decision, 2026-11-26). It asks
 * "End this run?" first, so a misclick can't end a run: Keep playing goes
 * back, End run ends it (`end`). It tells the mode when the question opens
 * and closes (`toggle`), so the mode can pause while it's asked
 * (usePanelPause.ts). The question shows over the screen in CardOverlay,
 * like a kanji's card back, with a quote on resting (REST_QUOTES), picked
 * at random each time: stopping for a while is fine.
 */
import { ref, shallowRef } from 'vue';
import { injectSidePanelClose } from '../../composables/useSidePanelClose.ts';
import { pickQuote, REST_QUOTES } from '../../dojo/quotes.ts';
import ArcadeButton from './ArcadeButton.vue';
import CardOverlay from './CardOverlay.vue';
import PixelButton from './PixelButton.vue';
import QuoteCard from './QuoteCard.vue';

const emit = defineEmits<{ end: []; toggle: [isOpen: boolean] }>();

const isAsking = ref(false);
const quote = shallowRef(pickQuote(Math.random, REST_QUOTES));

function setAsking(next: boolean): void {
  if (next) quote.value = pickQuote(Math.random, REST_QUOTES);
  isAsking.value = next;
  emit('toggle', next);
}

const closeSidePanel = injectSidePanelClose();

/** Ends the run, then closes the side drawer it was asked from, so the results show at once. */
function confirmEnd(): void {
  setAsking(false);
  emit('end');
  closeSidePanel?.();
}
</script>

<template>
  <ArcadeButton class="min-h-9 text-sm" data-testid="end-run" @click="setAsking(true)">
    End run
  </ArcadeButton>
  <CardOverlay v-if="isAsking" label="End this run?" @close="setAsking(false)">
    <section
      class="pixel-panel flex flex-col items-center gap-4 bg-wood p-6 text-center"
      data-testid="end-run-confirm"
    >
      <p class="text-2xl font-bold text-aqua">End this run?</p>
      <QuoteCard class="text-left" :quote="quote" />
      <p class="text-sm text-washi">Your score so far is kept.</p>
      <div class="flex gap-4">
        <PixelButton
          colour="steel"
          class="min-h-10 px-5 font-bold uppercase"
          data-testid="end-run-cancel"
          @click="setAsking(false)"
        >
          Keep playing
        </PixelButton>
        <ArcadeButton data-testid="end-run-yes" @click="confirmEnd">End run</ArcadeButton>
      </div>
    </section>
  </CardOverlay>
</template>
