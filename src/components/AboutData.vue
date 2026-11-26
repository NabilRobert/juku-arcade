<script setup lang="ts">
/**
 * "About the data" (requirement D2): the attribution OpenJLPT's NOTICE asks
 * for, worded as in Juku's about_the_data.md. The links sit inside
 * translated sentences, so each sentence is one message with the link as
 * a slot (i18n-t), and word order can differ between languages.
 */
import BackButton from './ui/BackButton.vue';

defineEmits<{ close: [] }>();
</script>

<template>
  <article class="mx-auto max-w-prose space-y-4 text-washi/90">
    <h2 class="text-xl font-semibold">{{ $t('pages.about.title') }}</h2>
    <i18n-t keypath="pages.about.containsData" tag="p">
      <template #openJlpt>
        <a class="underline" href="https://github.com/evanclan/OpenJLPT">OpenJLPT</a>
      </template>
      <template #licence>
        <a class="underline" href="https://creativecommons.org/licenses/by-sa/4.0/">CC BY-SA 4.0</a>
      </template>
    </i18n-t>
    <ul class="list-disc space-y-1 pl-5">
      <i18n-t keypath="pages.about.jmdict" tag="li">
        <template #link>
          <a class="underline" href="https://www.edrdg.org/edrdg/licence.html">{{
            $t('pages.about.jmdictLink')
          }}</a>
        </template>
      </i18n-t>
      <i18n-t keypath="pages.about.waller" tag="li">
        <template #link>
          <a class="underline" href="https://www.tanos.co.uk/jlpt/">{{
            $t('pages.about.wallerLink')
          }}</a>
        </template>
      </i18n-t>
      <i18n-t keypath="pages.about.tatoeba" tag="li">
        <template #link>
          <a class="underline" href="https://tatoeba.org">Tatoeba</a>
        </template>
      </i18n-t>
    </ul>
    <p>{{ $t('pages.about.levelsNote') }}</p>
    <BackButton @click="$emit('close')" />
  </article>
</template>
