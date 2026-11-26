<script setup lang="ts">
/**
 * The small spaced-out capitals that name a panel or a number in it
 * ("SCORE", "POT, NOT YET BANKED"). A paragraph by default; `as` makes it
 * a heading or an inline span where the markup needs one. Extra classes
 * pass through.
 */
withDefaults(defineProps<{ as?: 'p' | 'h3' | 'span' }>(), { as: 'p' });
</script>

<template>
  <component :is="as" class="text-xs tracking-widest text-aqua/80 uppercase"><slot /></component>
</template>
