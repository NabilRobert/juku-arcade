<script setup lang="ts">
/**
 * The bank run in the side panel (D46): your score (banked coins), the
 * unbanked pot with the Bank button, the shop's button when it has turned
 * up, the Scout button (a limited pause that shows which cards carry a
 * crest) and the items held. News (a pot lost, a crest paying out) drops
 * away under the pot.
 */
import { computed } from 'vue';
import PixelButton from '../ui/PixelButton.vue';
import PixelIcon from '../ui/PixelIcon.vue';
import type { BankRun } from '../../bank-run/bank-run.ts';
import { itemById } from '../../bank-run/items.ts';
import { CRESTS } from '../../bank-run/crests.ts';
import type { Notice } from '../../composables/useNotice.ts';
import FloatingNotice from '../ui/FloatingNotice.vue';

const props = defineProps<{ run: BankRun; notice: Notice | null; canScout: boolean }>();
defineEmits<{ bank: []; scout: []; openShop: [] }>();

/** What each crest does, for the Scout button's tooltip. */
const crestGuide = Object.values(CRESTS)
  .map((crest) => `${crest.symbol} ${crest.name}: ${crest.effect}`)
  .join('\n');

const items = computed(() => props.run.items.flatMap((id) => itemById(id) ?? []));
</script>

<template>
  <section class="pixel-panel flex flex-col gap-2 bg-wood/80 p-3 text-center" aria-label="Bank run">
    <div>
      <p class="text-xs tracking-widest text-aqua/80 uppercase">Score</p>
      <p class="text-3xl font-bold">
        <!-- A step smaller than the number, so the coin doesn't outweigh it. -->
        <span class="text-2xl"><PixelIcon name="coin" /></span>
        <span data-testid="coins">{{ run.coins }}</span>
      </p>
    </div>
    <div class="relative py-1">
      <p class="text-xs tracking-widest text-aqua/80 uppercase">Pot, not yet banked</p>
      <p class="text-2xl font-bold" data-testid="pot">
        <span class="text-xl"><PixelIcon name="coin" /></span> {{ run.pot }}
      </p>
      <FloatingNotice :notice="notice" />
    </div>
    <PixelButton
      colour="aqua"
      class="min-h-11 px-4 font-bold disabled:opacity-40"
      :disabled="run.pot === 0"
      data-testid="bank"
      @click="$emit('bank')"
    >
      Bank <PixelIcon name="coin" /> {{ run.pot }}
    </PixelButton>
    <PixelButton
      v-if="run.shop === 'here'"
      colour="paper"
      class="min-h-11 px-4 font-bold"
      data-testid="open-shop"
      @click="$emit('openShop')"
    >
      The shop's here! Open ▶
    </PixelButton>
    <PixelButton
      colour="steel"
      class="min-h-9 px-4 text-sm disabled:opacity-40"
      :disabled="!canScout || run.scoutsLeft === 0"
      :title="crestGuide"
      data-testid="scout"
      @click="$emit('scout')"
    >
      <span class="inline-flex items-center gap-2">
        <PixelIcon name="scout" /> Scout · {{ run.scoutsLeft }} left
      </span>
    </PixelButton>
    <p v-if="items.length" class="flex justify-center gap-1 text-xl" lang="ja">
      <span v-for="item in items" :key="item.id" :title="`${item.name}: ${item.effect}`">{{
        item.kanji
      }}</span>
    </p>
  </section>
</template>
