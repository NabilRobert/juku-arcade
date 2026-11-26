/**
 * Lets a control inside a mode's side panel close the panel: on a phone
 * or a tablet the panel is a drawer, and ending the run from it should
 * close it at once (playtest decision, 2026-11-26), so the results aren't
 * hidden behind it. SidePanel.vue provides the close; EndRunButton.vue
 * calls it. Outside a side panel there's nothing to close.
 */
import { inject, provide, type InjectionKey } from 'vue';

const SIDE_PANEL_CLOSE_KEY: InjectionKey<() => void> = Symbol('side-panel-close');

export function provideSidePanelClose(close: () => void): void {
  provide(SIDE_PANEL_CLOSE_KEY, close);
}

export function injectSidePanelClose(): (() => void) | null {
  return inject(SIDE_PANEL_CLOSE_KEY, null);
}
