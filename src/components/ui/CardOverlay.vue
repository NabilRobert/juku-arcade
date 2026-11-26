<script setup lang="ts">
/**
 * Shows a card or a small question (its slot) over the whole screen, on a
 * dimmed table: the start screen's kanji backs, and End run's "End this
 * run?" (EndRunButton.vue). Tapping outside it or pressing Esc closes it,
 * as its own close button does. Teleported to the page's body, so a scrolling panel it opens from
 * can't clip it.
 */
import { onMounted, onUnmounted } from 'vue';

const props = defineProps<{ label: string }>();
const emit = defineEmits<{ close: [] }>();

function onKey(event: KeyboardEvent): void {
  if (event.key === 'Escape') emit('close');
}
onMounted(() => window.addEventListener('keydown', onKey));
onUnmounted(() => window.removeEventListener('keydown', onKey));
</script>

<template>
  <Teleport to="body">
    <div
      class="fixed inset-0 z-50 flex items-center justify-center bg-lacquer/85 p-4"
      role="dialog"
      aria-modal="true"
      :aria-label="props.label"
      data-testid="card-overlay"
      @click.self="emit('close')"
    >
      <div class="w-full max-w-md">
        <slot />
      </div>
    </div>
  </Teleport>
</template>
