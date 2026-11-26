<script setup lang="ts">
/**
 * Scouting in kanji mode (D42), in the side panel: the Scout button, how
 * many scouts are left, and the last crest that paid out or cost points,
 * floating away. Scouting flips the hand over to show the crests; the
 * button turns red while it's flipped and turns the hand back.
 */
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { kanjiCrestEffect } from '../../kanji/kanji-crests.ts';
import { CRESTS, crestName } from '../../bank-run/crests.ts';
import type { Notice } from '../../composables/useNotice.ts';
import FloatingNotice from '../ui/FloatingNotice.vue';
import PixelButton from '../ui/PixelButton.vue';
import PixelIcon from '../ui/PixelIcon.vue';

defineProps<{
  scoutsLeft: number;
  isScouting: boolean;
  canScout: boolean;
  notice: Notice | null;
}>();
defineEmits<{ scout: [] }>();

const { t } = useI18n();

/** What each crest does, for the Scout button's tooltip. */
const crestGuide = computed(() =>
  Object.values(CRESTS)
    .map(({ kind, symbol }) =>
      t('game.bank.guideLine', { symbol, name: crestName(kind), effect: kanjiCrestEffect(kind) }),
    )
    .join('\n'),
);
</script>

<template>
  <section class="pixel-panel relative flex flex-col gap-2 bg-wood/80 p-3 text-center">
    <PixelButton
      :colour="isScouting ? 'crimson' : 'steel'"
      class="min-h-9 px-4 text-sm disabled:opacity-40"
      :disabled="!isScouting && (!canScout || scoutsLeft === 0)"
      :title="crestGuide"
      data-testid="scout"
      @click="$emit('scout')"
    >
      <template v-if="isScouting">{{ t('kanji.scout.turnBack') }}</template>
      <span v-else class="inline-flex items-center gap-2">
        <PixelIcon name="scout" /> {{ t('game.scoutsLeft', { count: scoutsLeft }) }}
      </span>
    </PixelButton>
    <p class="text-xs text-washi/60">{{ t('kanji.scout.earn') }}</p>

    <FloatingNotice :notice="notice" />
  </section>
</template>
