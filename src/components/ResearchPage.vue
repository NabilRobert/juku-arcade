<script setup lang="ts">
/**
 * "The research": the studies the game's design rests on
 * (research/sources.ts), grouped by what they support, each with the
 * claim, a paragraph on what the study did and found, where in the paper
 * that is (with a free copy to check it), and where the game uses it. Opened from the footer, like "About
 * the data".
 */
import { useI18n } from 'vue-i18n';
import { SOURCE_GROUPS } from '../research/sources.ts';
import BackButton from './ui/BackButton.vue';

defineEmits<{ close: [] }>();
const { t } = useI18n();

// Keys built from the ids are checked in tests/i18n-pages.test.ts, in both languages.
</script>

<template>
  <article class="mx-auto max-w-3xl space-y-6 text-washi/90">
    <header class="space-y-2">
      <h2 class="text-xl font-semibold">{{ t('pages.research.title') }}</h2>
      <p class="text-washi/70">{{ t('pages.research.intro') }}</p>
    </header>
    <section v-for="group in SOURCE_GROUPS" :key="group.id" class="space-y-3">
      <h3 class="text-lg font-semibold text-aqua">{{ t(`pages.research.groups.${group.id}`) }}</h3>
      <div
        v-for="source in group.sources"
        :key="source.id"
        class="pixel-panel space-y-1 bg-wood/80 p-3"
        data-testid="source"
      >
        <p class="font-semibold">
          <a class="underline" :href="source.url" target="_blank" rel="noopener">{{
            source.citation
          }}</a>
        </p>
        <p class="text-xs text-washi/60">{{ source.venue }}</p>
        <p>{{ t(`pages.research.sources.${source.id}.finding`) }}</p>
        <p class="text-sm text-washi/80" data-testid="source-summary">
          {{ t(`pages.research.sources.${source.id}.summary`) }}
        </p>
        <p class="text-xs text-washi/60" data-testid="source-where">
          {{ t('pages.research.where', { where: t(`pages.research.sources.${source.id}.where`) }) }}
          <a class="underline" :href="source.freeCopyUrl" target="_blank" rel="noopener">{{
            t('pages.research.freeCopy')
          }}</a>
        </p>
        <p class="text-sm text-lamp">
          {{ t('pages.research.inGame', { use: t(`pages.research.sources.${source.id}.inGame`) }) }}
        </p>
      </div>
    </section>
    <BackButton @click="$emit('close')" />
  </article>
</template>
