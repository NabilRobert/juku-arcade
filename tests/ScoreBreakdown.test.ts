import { mount } from '@vue/test-utils';
import { afterEach, describe, expect, it, vi } from 'vitest';
import ScoreBreakdown from '../src/components/ScoreBreakdown.vue';
import { dueNudge } from '../src/game/wellbeing.ts';
import WellbeingNudge from '../src/components/WellbeingNudge.vue';

const SCORE = { chips: 58, multiplier: 6.6, total: 383 };

afterEach(() => vi.useRealTimers());

describe('ScoreBreakdown', () => {
  it('shows the best set between clears', () => {
    const panel = mount(ScoreBreakdown, {
      props: { score: null, isShowing: false, bestSetScore: 147 },
    });
    expect(panel.text()).toContain('147');
  });

  it('shows chips × multiplier and counts the total up when a set clears', async () => {
    vi.useFakeTimers({ toFake: ['requestAnimationFrame', 'cancelAnimationFrame', 'performance'] });
    const panel = mount(ScoreBreakdown, {
      props: { score: SCORE, isShowing: false, bestSetScore: 0 },
    });
    await panel.setProps({ isShowing: true });
    expect(panel.text()).toContain('58');
    expect(panel.text()).toContain('6.6');
    vi.advanceTimersByTime(700);
    await panel.vm.$nextTick();
    expect(panel.find('[role="status"]').text()).toBe('383');
  });
});

describe('WellbeingNudge', () => {
  it('offers to stop or keep going', async () => {
    const nudge = mount(WellbeingNudge, { props: { minutes: 15 } });
    expect(nudge.text()).toContain('15 minutes');
    await nudge.findAll('button')[0]?.trigger('click');
    expect(nudge.emitted('stop')).toHaveLength(1);
    expect(dueNudge(15 * 60_000, [15])).toBeNull();
  });
});
