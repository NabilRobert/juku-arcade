// The pixel button: a colour wipe on every click, and the parent's own click and attributes still work.
import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import PixelButton from '../src/components/ui/PixelButton.vue';

describe('the pixel button', () => {
  it('plays a fresh colour wipe on every click', async () => {
    const button = mount(PixelButton, { slots: { default: 'Play' } });
    expect(button.find('[data-testid="wipe"]').exists()).toBe(false);
    await button.trigger('click');
    const first = button.find('[data-testid="wipe"]').element;
    await button.trigger('click');
    expect(button.find('[data-testid="wipe"]').element).not.toBe(first);
  });

  it("passes the parent's click and classes to the button", async () => {
    const clicks: string[] = [];
    const button = mount(PixelButton, {
      props: { colour: 'crimson' },
      attrs: { class: 'px-8', onClick: () => clicks.push('clicked') },
      slots: { default: 'Play' },
    });
    expect(button.classes()).toEqual(expect.arrayContaining(['px-8', 'bg-crimson']));
    await button.trigger('click');
    expect(clicks).toEqual(['clicked']);
  });

  it('turns a new colour with a wipe in that colour, once the wipe meets in the middle', async () => {
    const button = mount(PixelButton, { props: { colour: 'steel' }, slots: { default: 'Pause' } });
    await button.setProps({ colour: 'crimson' });
    const wipe = button.find('[data-testid="wipe"]');
    expect(wipe.classes()).toContain('before:animate-wipe-change');
    expect(wipe.attributes('style')).toContain('--color-crimson');
    expect(button.classes()).toContain('bg-steel');
    await wipe.trigger('animationend');
    expect(button.classes()).toContain('bg-crimson');
    expect(button.find('[data-testid="wipe"]').exists()).toBe(false);
  });

  it('can be disabled by the parent', () => {
    const button = mount(PixelButton, { attrs: { disabled: true }, slots: { default: 'Play' } });
    expect(button.attributes('disabled')).toBeDefined();
  });
});
