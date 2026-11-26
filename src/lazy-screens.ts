/**
 * Screens loaded only when they're opened, so the first visit downloads
 * and parses just the start screen and word mode: kanji mode, Bunpou (with
 * its grammar content and stage), the dojo, and the stats, settings,
 * research and about pages each come in their own chunk. Once the start
 * screen is up, `prefetchScreens` fetches them while the browser is idle,
 * so opening one is still instant.
 */
import { defineAsyncComponent } from 'vue';

const loaders = {
  kanji: () => import('./components/kanji/KanjiScreen.vue'),
  bunpou: () => import('./components/bunpou/BunpouScreen.vue'),
  dojo: () => import('./components/dojo/DojoScreen.vue'),
  stats: () => import('./components/StatsPage.vue'),
  settings: () => import('./components/SettingsPanel.vue'),
  research: () => import('./components/ResearchPage.vue'),
  about: () => import('./components/AboutData.vue'),
};

export const KanjiScreen = defineAsyncComponent(loaders.kanji);
export const BunpouScreen = defineAsyncComponent(loaders.bunpou);
export const DojoScreen = defineAsyncComponent(loaders.dojo);
export const StatsPage = defineAsyncComponent(loaders.stats);
export const SettingsPanel = defineAsyncComponent(loaders.settings);
export const ResearchPage = defineAsyncComponent(loaders.research);
export const AboutData = defineAsyncComponent(loaders.about);

/** How long to wait for an idle moment before fetching anyway (browsers without requestIdleCallback). */
const PREFETCH_FALLBACK_MS = 1500;

/** Fetches every lazy screen in the background, once the browser has a free moment. */
export function prefetchScreens(): void {
  const fetchAll = (): void => {
    for (const load of Object.values(loaders)) void load();
  };
  if ('requestIdleCallback' in window) window.requestIdleCallback(fetchAll);
  else setTimeout(fetchAll, PREFETCH_FALLBACK_MS);
}
