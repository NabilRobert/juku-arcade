// The pixel button: a colour wipe on every click, and the parent's own click and attributes still work.
import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import PixelButton from '../src/components/PixelButton.vue';

describe('the pixel button', () => {
  it('plays a fresh colour wipe on every click', async () => {
    const button = mount(PixelButton, { slots: { default: 'Play' } });
    expect(button.find('.pixel-wipe').exists()).toBe(false);
    await button.trigger('click');
    const first = button.find('.pixel-wipe').element;
    await button.trigger('click');
    expect(button.find('.pixel-wipe').element).not.toBe(first);
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

  it('can be disabled by the parent', () => {
    const button = mount(PixelButton, { attrs: { disabled: true }, slots: { default: 'Play' } });
    expect(button.attributes('disabled')).toBeDefined();
  });
});
