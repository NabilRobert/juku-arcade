// The start screen's Settings button on a phone or a tablet opens Settings through the app shell.
import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import SettingsButton from '../src/components/ui/SettingsButton.vue';
import { GO_TO_PAGE_KEY, type PageTarget } from '../src/composables/usePageLinks.ts';

describe("the start screen's Settings button", () => {
  it('opens the Settings page', async () => {
    const opened: PageTarget[] = [];
    const button = mount(SettingsButton, {
      global: { provide: { [GO_TO_PAGE_KEY]: (target: PageTarget) => opened.push(target) } },
    });
    await button.find('[data-testid="settings-button"]').trigger('click');
    expect(opened).toEqual(['settings']);
  });

  it('shows nothing outside the app shell, where there is no page to open', () => {
    expect(mount(SettingsButton).find('[data-testid="settings-button"]').exists()).toBe(false);
  });
});
