<script setup lang="ts">
/**
 * The footer under every page: during a game, links to change mode and
 * to the stats, settings, about and research pages; always, who made the
 * game. The app shell decides what each link opens.
 */
export type FooterTarget = 'mode' | 'stats' | 'settings' | 'about' | 'research';

defineProps<{ isNavShown: boolean }>();
defineEmits<{ go: [target: FooterTarget] }>();

const LINKS: readonly { target: FooterTarget; label: string }[] = [
  { target: 'mode', label: 'Change mode' },
  { target: 'stats', label: 'Stats' },
  { target: 'settings', label: 'Settings' },
  { target: 'about', label: 'About the data' },
  { target: 'research', label: 'The research' },
];
</script>

<template>
  <footer class="mt-auto flex flex-col items-center gap-2 text-washi/60">
    <nav v-if="isNavShown" class="flex justify-center gap-6 text-sm">
      <button
        v-for="link in LINKS"
        :key="link.target"
        type="button"
        class="underline"
        @click="$emit('go', link.target)"
      >
        {{ link.label }}
      </button>
    </nav>
    <p class="text-xs text-washi/80">
      made by
      <a class="underline" href="https://github.com/NabilRobert" target="_blank" rel="noopener"
        >@nabilrobert</a
      >
      · 2026
    </p>
  </footer>
</template>
