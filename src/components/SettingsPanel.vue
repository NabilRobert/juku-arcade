<script setup lang="ts">
/**
 * Settings (N5, L15): the anonymous player ID (to tell a teacher, if the
 * school asks), the level, the interface language (D73), sound, furigana,
 * Bunpou's hint, and "Delete my data".
 */
import { JLPT_LEVELS, type JlptLevel } from '../deck/types.ts';
import type { Settings } from '../memory/storage.ts';
import { isFuriganaShown, setFuriganaShown } from '../preferences/furigana.ts';
import { areHintsShown, setHintsShown } from '../preferences/hints.ts';
import { isSamplePlayShown, setSamplePlayShown } from '../preferences/sample-play.ts';
import { useI18n } from 'vue-i18n';
import { language, setLanguage } from '../i18n/index.ts';
import { LANGUAGES, LANGUAGE_NAMES } from '../i18n/languages.ts';
import OnOffButton from './ui/OnOffButton.vue';
import PixelButton from './ui/PixelButton.vue';
import SoundSliders from './ui/SoundSliders.vue';
import BackButton from './ui/BackButton.vue';

defineProps<{ settings: Settings }>();
const { t } = useI18n();
const emit = defineEmits<{
  changeLevel: [level: JlptLevel];
  exportData: [];
  deleteData: [];
  close: [];
}>();

function confirmDelete(): void {
  const isSure = window.confirm(t('settings.deleteConfirm'));
  if (isSure) emit('deleteData');
}
</script>

<template>
  <section class="mx-auto max-w-prose space-y-5 text-washi/90">
    <h2 class="text-xl font-semibold">{{ t('settings.title') }}</h2>
    <p class="text-sm">
      {{ t('settings.playerId') }}
      <code class="bg-lacquer-light px-1 break-all">{{ settings.playerId }}</code>
      <span v-if="settings.classCode">
        · {{ t('settings.classCode', { code: settings.classCode }) }}</span
      >
    </p>
    <div class="space-y-2">
      <p class="text-sm">{{ t('settings.level') }}</p>
      <div class="flex gap-2">
        <PixelButton
          v-for="level in JLPT_LEVELS"
          :key="level"
          :colour="level === settings.level ? 'aqua' : 'steel'"
          class="min-h-11 px-3 font-semibold"
          @click="emit('changeLevel', level)"
        >
          {{ level }}
        </PixelButton>
      </div>
    </div>
    <div class="space-y-2">
      <p class="text-sm">{{ t('settings.language') }}</p>
      <div class="flex flex-wrap gap-2">
        <PixelButton
          v-for="option in LANGUAGES"
          :key="option"
          :colour="option === language ? 'aqua' : 'steel'"
          :aria-pressed="option === language"
          :lang="option"
          class="min-h-11 px-3"
          :data-testid="`language-${option}`"
          @click="setLanguage(option)"
        >
          {{ LANGUAGE_NAMES[option] }}
        </PixelButton>
      </div>
    </div>
    <div class="max-w-xs space-y-2">
      <p class="text-sm">{{ t('settings.volume') }}</p>
      <SoundSliders />
    </div>
    <div class="space-y-2">
      <p class="text-sm">{{ t('settings.furiganaHelp') }}</p>
      <OnOffButton
        :label="t('settings.furigana')"
        :is-on="isFuriganaShown"
        data-testid="furigana-toggle"
        @change="setFuriganaShown"
      />
    </div>
    <div class="space-y-2">
      <p class="text-sm">{{ t('settings.hintsHelp') }}</p>
      <OnOffButton :label="t('settings.hints')" :is-on="areHintsShown" @change="setHintsShown" />
    </div>
    <div class="space-y-2">
      <p class="text-sm">{{ t('settings.samplePlayHelp') }}</p>
      <OnOffButton
        :label="t('settings.samplePlay')"
        :is-on="isSamplePlayShown"
        data-testid="sample-play-toggle"
        @change="setSamplePlayShown"
      />
    </div>
    <div class="space-y-2">
      <PixelButton colour="aqua" class="px-4 py-2" @click="emit('exportData')">
        {{ t('settings.exportData') }}
      </PixelButton>
      <p class="text-sm text-washi/70">{{ t('settings.exportHelp') }}</p>
    </div>
    <PixelButton colour="crimson" class="px-4 py-2" @click="confirmDelete">
      {{ t('settings.deleteData') }}
    </PixelButton>
    <BackButton class="block" @click="emit('close')" />
  </section>
</template>
