<script setup lang="ts">
/**
 * A mode's side panel. On a wide screen it sits beside the board, always
 * open. On a phone-width screen it goes under the board, folded away
 * behind a Show panel button, so the board fills the screen.
 */
import { ref } from 'vue';
import PixelButton from './PixelButton.vue';

defineProps<{ label: string }>();

const isOpen = ref(false);
</script>

<template>
  <aside
    class="order-last flex flex-col gap-3 lg:sticky lg:top-6 lg:order-none"
    :aria-label="label"
  >
    <PixelButton
      colour="steel"
      class="min-h-9 px-4 text-sm lg:hidden"
      :aria-expanded="isOpen"
      data-testid="side-panel-toggle"
      @click="isOpen = !isOpen"
    >
      {{ isOpen ? 'Hide panel ▴' : 'Show panel ▾' }}
    </PixelButton>
    <div class="flex-col gap-3 lg:flex" :class="isOpen ? 'flex' : 'hidden'">
      <slot />
    </div>
  </aside>
</template>
