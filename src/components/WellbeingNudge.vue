<script setup lang="ts">
/** W1: a friendly suggestion to stop, after 15 and 30 minutes of play. Easy to dismiss. */
defineProps<{ minutes: number }>();
defineEmits<{ stop: []; keepGoing: [] }>();
</script>

<template>
  <section class="washi rounded-xl p-4 text-center text-sumi shadow-xl" role="status">
    <p class="font-card text-lg font-semibold">
      {{ minutes }} minutes: a good place to stop. See you tomorrow!
    </p>
    <p class="mt-1 text-sm text-sumi/70">Short daily practice helps words stick.</p>
    <div class="mt-3 flex justify-center gap-3">
      <button
        type="button"
        class="min-h-11 rounded-lg bg-crimson px-4 text-washi"
        @click="$emit('stop')"
      >
        Stop for today
      </button>
      <button
        type="button"
        class="min-h-11 rounded-lg bg-steel px-4 text-washi"
        @click="$emit('keepGoing')"
      >
        Keep going
      </button>
    </div>
  </section>
</template>
