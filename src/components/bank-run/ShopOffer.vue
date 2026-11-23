<script setup lang="ts">
/**
 * The shop, once the player opens it (D46): up to three items, each with
 * its price; buy any your coins cover (up to five held), then go back to
 * the table. Buying lowers your score now, for faster coins later. The
 * game is paused while it's open.
 */
import { m } from 'motion-v';
import { computed } from 'vue';
import PixelButton from '../ui/PixelButton.vue';
import PixelIcon from '../ui/PixelIcon.vue';
import { MAX_ITEMS, type BankRun } from '../../bank-run/bank-run.ts';
import { itemById, type ItemId } from '../../bank-run/items.ts';

const props = defineProps<{ run: BankRun }>();
defineEmits<{ buy: [id: ItemId]; leave: [] }>();

const offered = computed(() => props.run.offer.flatMap((id) => itemById(id) ?? []));
const isFull = computed(() => props.run.items.length >= MAX_ITEMS);
</script>

<template>
  <div
    class="fixed inset-0 z-30 flex flex-col items-center justify-center gap-6 bg-lacquer/85"
    role="dialog"
    aria-label="Shop"
  >
    <p class="text-3xl font-bold text-aqua">The shop</p>
    <p class="text-lg">
      Your coins <PixelIcon name="coin" /> {{ run.coins
      }}<span v-if="isFull" class="text-washi/60"> · item slots full</span>
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
        <span class="text-5xl" lang="ja">{{ item.kanji }}</span>
        <span class="text-lg font-semibold">{{ item.name }}</span>
        <span class="text-center text-sm text-sumi/80">{{ item.effect }}</span>
        <PixelButton
          colour="crimson"
          class="mt-1 min-h-10 w-full px-3 disabled:opacity-40"
          :disabled="run.coins < item.price || isFull"
          @click="$emit('buy', item.id)"
        >
          Buy <PixelIcon name="coin" /> {{ item.price }}
        </PixelButton>
      </m.div>
      <p v-if="offered.length === 0" class="text-washi/70">Sold out.</p>
    </div>
    <PixelButton colour="steel" class="min-h-11 px-8 text-lg" @click="$emit('leave')">
      Back to the table ▶
    </PixelButton>
  </div>
</template>
