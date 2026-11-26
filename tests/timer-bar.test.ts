// One timer bar for every timed screen: it shrinks with the time, turns crimson when nearly out, and reads as a
// labelled progress bar.
import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import TimerBar, { LOW_TIME_SHARE } from '../src/components/ui/TimerBar.vue';

const fill = (bar: ReturnType<typeof mount>) => bar.find('[data-testid="timer"] > span');

describe('the timer bar', () => {
  it('fills to the share of time left, in aqua while there is plenty', () => {
    const bar = mount(TimerBar, { props: { timeLeft: 0.6 } });
    expect(fill(bar).attributes('style')).toContain('width: 60%');
    expect(fill(bar).classes()).toContain('bg-aqua');
  });

  it('turns crimson when the time is nearly out', () => {
    const bar = mount(TimerBar, { props: { timeLeft: LOW_TIME_SHARE - 0.01 } });
    expect(fill(bar).classes()).toContain('bg-crimson');
  });

  it('reads as a progress bar with its label and the percentage left', () => {
    const bar = mount(TimerBar, { props: { timeLeft: 0.42, label: 'Time left in this set' } });
    const timer = bar.find('[data-testid="timer"]');
    expect(timer.attributes('role')).toBe('progressbar');
    expect(timer.attributes('aria-label')).toBe('Time left in this set');
    expect(timer.attributes('aria-valuenow')).toBe('42');
  });
});
