import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import SidePanel from '../src/components/ui/SidePanel.vue';

const mountPanel = () =>
  mount(SidePanel, {
    props: { label: 'Run' },
    slots: { default: '<p data-testid="inside">Score</p>' },
  });

describe('a mode’s side panel', () => {
  it('starts folded away on a phone, and opens with its button', async () => {
    const panel = mountPanel();
    const contents = () => panel.find('[data-testid="inside"]').element.parentElement;
    expect(contents()?.className).toContain('hidden');
    await panel.find('[data-testid="side-panel-toggle"]').trigger('click');
    expect(contents()?.className).not.toContain('hidden');
    expect(panel.find('[data-testid="side-panel-toggle"]').text()).toContain('Hide panel');
  });

  it('stays open beside the board on a wide screen, with no button', () => {
    const panel = mountPanel();
    expect(panel.find('[data-testid="inside"]').element.parentElement?.className).toContain(
      'lg:flex',
    );
    expect(panel.find('[data-testid="side-panel-toggle"]').classes()).toContain('lg:hidden');
  });
});
