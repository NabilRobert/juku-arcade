import { mount } from '@vue/test-utils';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { nextTick } from 'vue';
import SidePanel from '../src/components/ui/SidePanel.vue';

/** Pretends the window is phone-width (not lg), as matchMedia reports it. */
function asPhone(): void {
  vi.stubGlobal('matchMedia', () => ({
    matches: false,
    addEventListener: () => undefined,
    removeEventListener: () => undefined,
  }));
}

const mountPanel = () =>
  mount(SidePanel, {
    props: { label: 'Run' },
    slots: { default: '<p data-testid="inside">Score</p>' },
    attachTo: document.body,
  });

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('a mode’s side panel', () => {
  it('starts folded away to the left on a phone, out of reach of the keyboard', async () => {
    asPhone();
    const panel = mountPanel();
    // The window's width is read once the panel is on the page.
    await nextTick();
    expect(panel.find('[data-testid="side-panel"]').classes()).toContain('-translate-x-full');
    expect(panel.find('[data-testid="inside"]').element.parentElement?.hasAttribute('inert')).toBe(
      true,
    );
  });

  it('slides open with its tab, and closes from a tap outside it', async () => {
    asPhone();
    const panel = mountPanel();
    await panel.find('[data-testid="side-panel-toggle"]').trigger('click');
    expect(panel.find('[data-testid="side-panel"]').classes()).toContain('translate-x-0');
    expect(panel.find('[data-testid="side-panel-toggle"]').attributes('aria-expanded')).toBe(
      'true',
    );
    await panel.find('[data-testid="side-panel-backdrop"]').trigger('click');
    expect(panel.find('[data-testid="side-panel"]').classes()).toContain('-translate-x-full');
  });

  it('stays open beside the board on a wide screen, with no tab', () => {
    const panel = mountPanel();
    expect(panel.find('[data-testid="side-panel"]').classes()).toContain('lg:translate-x-0');
    expect(panel.find('[data-testid="side-panel-toggle"]').classes()).toContain('lg:hidden');
    expect(panel.find('[data-testid="inside"]').element.parentElement?.hasAttribute('inert')).toBe(
      false,
    );
  });
});
