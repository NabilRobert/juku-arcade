<script setup lang="ts">
/**
 * "About the data" (requirement D2): the attribution OpenJLPT's NOTICE asks
 * for, worded as in Juku's about_the_data.md.
 */
defineEmits<{ close: [] }>();
</script>

<template>
  <article class="mx-auto max-w-prose space-y-4 text-washi/90">
    <h2 class="text-xl font-semibold">About the data</h2>
    <p>
      Contains data from
      <a class="underline" href="https://github.com/evanclan/OpenJLPT">OpenJLPT</a>
      (<a class="underline" href="https://creativecommons.org/licenses/by-sa/4.0/">CC BY-SA 4.0</a
      >), which uses JMdict and KANJIDIC2 (EDRDG), Jonathan Waller's JLPT lists, and Tatoeba.
    </p>
    <ul class="list-disc space-y-1 pl-5">
      <li>
        <a class="underline" href="https://www.edrdg.org/edrdg/licence.html">JMdict and KANJIDIC2</a
        >, Electronic Dictionary Research and Development Group: meanings, readings, kanji data.
      </li>
      <li>
        <a class="underline" href="https://www.tanos.co.uk/jlpt/">Jonathan Waller's JLPT lists</a>
        (CC BY): the N5–N1 levels.
      </li>
      <li>
        <a class="underline" href="https://tatoeba.org">Tatoeba</a> (CC BY 2.0 FR): example
        sentences.
      </li>
    </ul>
    <p>
      JLPT levels are approximate: the Japan Foundation hasn't published official word lists since
      2010. The game's word decks are derived from OpenJLPT, so they are also CC BY-SA 4.0.
    </p>
    <button type="button" class="rounded-lg bg-pine px-4 py-2" @click="$emit('close')">
      Back to the game
    </button>
  </article>
</template>
