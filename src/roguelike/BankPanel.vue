<script setup lang="ts">
/**
 * SPIKE: the bank run in the side panel: the round and its target, the
 * unbanked pot with the Bank button, the Scout button (a limited pause that
 * shows which cards carry a crest), the wallet and the items held. News
 * (a pot lost, a crest paying out) drops away under the pot.
 */
import { m } from 'motion-v';
import { computed } from 'vue';
import PixelButton from '../components/PixelButton.vue';
import PixelIcon from '../components/PixelIcon.vue';
import { SETS_PER_ROUND, type BankRun } from './bank-run.ts';
import { itemById } from './items.ts';
import { CRESTS } from './specials.ts';
import type { Notice } from './useCrests.ts';

const props = defineProps<{ run: BankRun; notice: Notice | null; canScout: boolean }>();
defineEmits<{ bank: []; scout: [] }>();

/** What each crest does, for the Scout button's tooltip. */
const crestGuide = Object.values(CRESTS)
  .map((crest) => `${crest.symbol} ${crest.name}: ${crest.effect}`)
  .join('\n');

const targetShare = computed(() => Math.min(props.run.bankedThisRound / props.run.target, 1));
const setShown = computed(() => Math.min(props.run.setsThisRound + 1, SETS_PER_ROUND));
const items = computed(() => props.run.items.flatMap((id) => itemById(id) ?? []));
</script>

<template>
  <section class="pixel-panel flex flex-col gap-2 bg-wood/80 p-3 text-center" aria-label="Bank run">
    <p class="text-xs tracking-widest text-aqua/80 uppercase">
      Round {{ run.round }} · set {{ setShown }} of {{ SETS_PER_ROUND }}
    </p>
    <p class="text-sm">
      Banked <span data-testid="banked">{{ run.bankedThisRound }}</span> /
      {{ run.target }}
    </p>
    <div class="h-2 bg-lacquer" aria-hidden="true">
      <div class="h-full bg-aqua" :style="{ width: `${targetShare * 100}%` }" />
    </div>
    <div class="relative py-1">
      <p class="text-xs tracking-widest text-aqua/80 uppercase">Pot</p>
      <p class="text-3xl font-bold" data-testid="pot">🪙 {{ run.pot }}</p>
      <m.p
        v-if="notice"
        :key="notice.key"
        class="pointer-events-none absolute inset-x-0 top-full font-bold drop-shadow-[0_0_6px_rgb(241_250_238/0.9)]"
        :class="notice.isGood ? 'text-aqua' : 'text-crimson'"
        :initial="{ y: 0, opacity: 1 }"
        :animate="{ y: 24, opacity: 0 }"
        :transition="{ duration: 1.2, ease: 'easeIn' }"
      >
        {{ notice.text }}
      </m.p>
    </div>
    <PixelButton
      colour="aqua"
      class="min-h-11 px-4 font-bold disabled:opacity-40"
      :disabled="run.pot === 0"
      data-testid="bank"
      @click="$emit('bank')"
    >
      Bank 🪙 {{ run.pot }}
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
    <p class="text-sm">
      Wallet 🪙 <span data-testid="wallet">{{ run.wallet }}</span>
    </p>
    <p v-if="items.length" class="flex justify-center gap-1 font-card text-xl" lang="ja">
      <span v-for="item in items" :key="item.id" :title="`${item.name}: ${item.effect}`">{{
        item.kanji
      }}</span>
    </p>
  </section>
</template>
