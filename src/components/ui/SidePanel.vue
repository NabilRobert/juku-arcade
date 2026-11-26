<script setup lang="ts">
/**
 * A mode's side panel. On a wide screen it sits beside the board, always
 * open. On a phone or a tablet it's a drawer folded away to the left, so
 * the board fills the screen: a tab on its edge slides it open or closed,
 * and tapping outside it closes it (asked for in playtesting). The tab is a
 * PixelButton, so it clicks and wipes like every other button. While it's
 * folded away, keyboards and screen readers skip it (inert).
 */
import { computed, ref } from 'vue';
import { useIsWide } from '../../composables/useIsWide.ts';
import { injectGoToPage, type PageTarget } from '../../composables/usePageLinks.ts';
import PageLinks from './PageLinks.vue';
import PixelButton from './PixelButton.vue';

defineProps<{ label: string }>();

const isOpen = ref(false);
const isWide = useIsWide();
const isHidden = computed(() => !isWide.value && !isOpen.value);
const goToPage = injectGoToPage();

/** The game stays mounted behind the page it opens, so the drawer closes first. */
function leaveFor(target: PageTarget): void {
  isOpen.value = false;
  goToPage?.(target);
}
</script>

<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-30 bg-sumi/60 lg:hidden"
    aria-hidden="true"
    data-testid="side-panel-backdrop"
    @click="isOpen = false"
  />
  <aside
    class="fixed inset-y-0 left-0 z-40 w-72 max-w-[85vw] bg-wood/95 p-4 transition-transform duration-300 motion-reduce:transition-none lg:sticky lg:top-6 lg:bottom-auto lg:z-auto lg:w-auto lg:max-w-none lg:translate-x-0 lg:bg-transparent lg:p-0 lg:transition-none"
    :class="isOpen ? 'translate-x-0' : '-translate-x-full'"
    :aria-label="label"
    data-testid="side-panel"
  >
    <div
      class="flex h-full flex-col gap-3 overflow-y-auto lg:h-auto lg:overflow-visible"
      :inert="isHidden"
    >
      <slot />
      <!-- The footer hides during a game on a phone or a tablet, so its links live here. -->
      <PageLinks
        v-if="goToPage !== null && !isWide"
        class="mt-auto pt-4"
        data-testid="side-panel-links"
        @go="leaveFor"
      />
    </div>
    <!-- The tab rides on the drawer's edge, so it shows whether the drawer is open or not. -->
    <PixelButton
      colour="steel"
      class="absolute top-3 left-full px-3 py-2 lg:hidden"
      :aria-expanded="isOpen"
      :aria-label="isOpen ? 'Close the panel' : 'Open the panel'"
      data-testid="side-panel-toggle"
      @click="isOpen = !isOpen"
    >
      {{ isOpen ? '◀' : '▶' }}
    </PixelButton>
  </aside>
</template>
