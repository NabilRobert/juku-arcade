/**
 * The links out of a game (change mode, stats, settings, about, research).
 * On a wide screen they sit in the footer under the board. On a phone or a
 * tablet the footer is hidden during a game, so the board fits the screen
 * with nothing to scroll, and the same links move into the mode's side
 * drawer. The app shell provides what each link opens; SidePanel.vue
 * injects it, so the four mode screens don't each pass it down.
 */
import { inject, provide, type InjectionKey } from 'vue';

export type PageTarget = 'mode' | 'stats' | 'settings' | 'about' | 'research';
export type GoToPage = (target: PageTarget) => void;

export const PAGE_LINKS: readonly { target: PageTarget; label: string }[] = [
  { target: 'mode', label: 'Change mode' },
  { target: 'stats', label: 'Stats' },
  { target: 'settings', label: 'Settings' },
  { target: 'about', label: 'About the data' },
  { target: 'research', label: 'The research' },
];

export const GO_TO_PAGE_KEY: InjectionKey<GoToPage> = Symbol('go-to-page');

export function provideGoToPage(goToPage: GoToPage): void {
  provide(GO_TO_PAGE_KEY, goToPage);
}

/** What the links open, or null outside the app shell (a component mounted on its own). */
export function injectGoToPage(): GoToPage | null {
  return inject(GO_TO_PAGE_KEY, null);
}
