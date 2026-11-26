<script setup lang="ts">
/**
 * The row of links out of a game, used by the footer on a wide screen and
 * by the side drawer on a phone or a tablet (usePageLinks.ts). On the start
 * screen the footer shows them too, without Change mode (`isModeLinkHidden`),
 * so Settings and Stats can be reached on any screen.
 */
import { computed } from 'vue';
import { PAGE_LINKS, type PageTarget } from '../../composables/usePageLinks.ts';

const props = defineProps<{ isModeLinkHidden?: boolean }>();
defineEmits<{ go: [target: PageTarget] }>();

const links = computed(() =>
  props.isModeLinkHidden ? PAGE_LINKS.filter((link) => link.target !== 'mode') : PAGE_LINKS,
);
</script>

<template>
  <nav class="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-washi/60">
    <button
      v-for="link in links"
      :key="link.target"
      type="button"
      class="underline"
      @click="$emit('go', link.target)"
    >
      {{ link.label() }}
    </button>
  </nav>
</template>
