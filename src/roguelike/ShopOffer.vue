<script setup lang="ts">
/**
 * SPIKE: the shop after a round is won: up to three items, each with its
 * price; buy any your wallet covers (up to five held), then go on to the
 * next round. The next set waits until the player leaves.
 */
import { m } from 'motion-v';
import { computed } from 'vue';
import PixelButton from '../components/PixelButton.vue';
import { MAX_ITEMS, type BankRun } from './bank-run.ts';
import { itemById, type ItemId } from './items.ts';

const props = defineProps<{ run: BankRun }>();
defineEmits<{ buy: [id: ItemId]; leave: [] }>();

const offered = computed(() => (props.run.offer ?? []).flatMap((id) => itemById(id) ?? []));
const isFull = computed(() => props.run.items.length >= MAX_ITEMS);
</script>

<template>
  <div
    class="fixed inset-0 z-30 flex flex-col items-center justify-center gap-6 bg-lacquer/85"
    role="dialog"
    aria-label="Shop"
  >
    <p class="font-card text-3xl font-bold text-aqua">Round {{ run.round }} cleared!</p>
    <p class="text-lg">
      Wallet 🪙 {{ run.wallet }}<span v-if="isFull" class="text-washi/60"> · item slots full</span>
    </p>
    <div class="flex gap-6">
      <m.div
        v-for="(item, index) in offered"
        :key="item.id"
        class="pixel-panel washi flex w-[min(13rem,22vw)] flex-col items-center gap-2 p-4 text-sumi"
        :initial="{ opacity: 0, y: 40 }"
        :animate="{ opacity: 1, y: 0 }"
        :transition="{ type: 'spring', stiffness: 300, damping: 22, delay: index * 0.08 }"
      >
        <span class="font-card text-5xl" lang="ja">{{ item.kanji }}</span>
        <span class="text-lg font-semibold">{{ item.name }}</span>
        <span class="text-center text-sm text-sumi/80">{{ item.effect }}</span>
        <PixelButton
          colour="crimson"
          class="mt-1 min-h-10 w-full px-3 disabled:opacity-40"
          :disabled="run.wallet < item.price || isFull"
          @click="$emit('buy', item.id)"
        >
          Buy 🪙 {{ item.price }}
        </PixelButton>
      </m.div>
      <p v-if="offered.length === 0" class="text-washi/70">Sold out.</p>
    </div>
    <PixelButton colour="steel" class="min-h-11 px-8 text-lg" @click="$emit('leave')">
      Next round ▶
    </PixelButton>
  </div>
</template>
