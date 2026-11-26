import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import FloatingPause from '../src/components/ui/FloatingPause.vue';

describe('the pause button on a phone or a tablet', () => {
  it('pauses, and resumes once paused', async () => {
    const running = mount(FloatingPause, { props: { isPaused: false } });
    await running.trigger('click');
    expect(running.emitted('pause')).toHaveLength(1);
    const paused = mount(FloatingPause, { props: { isPaused: true } });
    expect(paused.text()).toContain('Resume');
    await paused.trigger('click');
    expect(paused.emitted('resume')).toHaveLength(1);
  });

  it('sits at the top right of the screen, and hides on a wide screen', () => {
    const classes = mount(FloatingPause, { props: { isPaused: false } }).classes();
    expect(classes).toEqual(expect.arrayContaining(['fixed', 'top-3', 'right-3', 'lg:hidden']));
  });
});
