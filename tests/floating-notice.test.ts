// The floating notice: a gain in aqua, a loss in crimson, nothing when there's no message.
import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import FloatingNotice from '../src/components/FloatingNotice.vue';

describe('the floating notice', () => {
  it('shows a gain in aqua and a loss in crimson', () => {
    const gain = mount(FloatingNotice, { props: { notice: { text: '+5', isGood: true, key: 1 } } });
    expect(gain.text()).toBe('+5');
    expect(gain.classes()).toContain('text-aqua');
    const loss = mount(FloatingNotice, {
      props: { notice: { text: '−5', isGood: false, key: 2 } },
    });
    expect(loss.classes()).toContain('text-crimson');
  });

  it('shows nothing without a message', () => {
    expect(
      mount(FloatingNotice, { props: { notice: null } })
        .find('p')
        .exists(),
    ).toBe(false);
  });
});
