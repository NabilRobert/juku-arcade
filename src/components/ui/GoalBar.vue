<script setup lang="ts">
/**
 * A level goal's progress (level-goals.ts): what's counted and how far,
 * a bar with a tick at each quarter that lights once it's reached, and
 * the rank or title earned, if the goal has one. "Level cleared ✓" once
 * it's all done.
 */
import { computed } from 'vue';
import { GOAL_STAMPS, stampsReached, type LevelGoal } from '../../memory/level-goals.ts';

const props = defineProps<{ goal: LevelGoal }>();

const share = computed(() => (props.goal.total === 0 ? 0 : props.goal.done / props.goal.total));
const stamps = computed(() => stampsReached(props.goal));
const isCleared = computed(() => props.goal.total > 0 && props.goal.done >= props.goal.total);
</script>

<template>
  <span class="flex flex-col gap-1 text-xs" data-testid="goal">
    <span class="flex justify-between gap-2">
      <span>
        <span v-if="goal.title" class="mr-1 bg-sumi px-1 font-bold text-aqua" lang="ja">{{
          goal.title
        }}</span>
        {{ isCleared ? 'Level cleared ✓' : goal.label }}
      </span>
      <span>{{ goal.done }} / {{ goal.total }}</span>
    </span>
    <span class="relative block h-2 bg-sumi/40" aria-hidden="true">
      <span class="block h-full bg-lamp" :style="{ width: `${share * 100}%` }" />
      <span
        v-for="(stamp, index) in GOAL_STAMPS.slice(0, -1)"
        :key="stamp"
        class="absolute top-0 h-full w-0.5"
        :class="index < stamps ? 'bg-washi' : 'bg-sumi/60'"
        :style="{ left: `${stamp * 100}%` }"
      />
    </span>
  </span>
</template>
