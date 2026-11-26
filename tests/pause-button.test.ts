// Every mode's Pause/Resume button: one component, so the modes can't drift apart again.
import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import PauseButton from '../src/components/ui/PauseButton.vue';

describe('the pause button', () => {
  it('pauses while playing, and resumes while paused', async () => {
    const playing = mount(PauseButton, { props: { isPaused: false } });
    expect(playing.text()).toContain('⏸ Pause');
    await playing.trigger('click');
    expect(playing.emitted('pause')).toHaveLength(1);
    const paused = mount(PauseButton, { props: { isPaused: true } });
    expect(paused.text()).toContain('▶ Resume');
    expect(paused.attributes('aria-pressed')).toBe('true');
    await paused.trigger('click');
    expect(paused.emitted('resume')).toHaveLength(1);
  });

  it('shows the Esc key only where there is a keyboard (not on a phone or a tablet)', () => {
    const button = mount(PauseButton, { props: { isPaused: false } });
    const hint = button.findAll('span').find((span) => span.text() === 'Esc');
    expect(hint?.classes()).toContain('max-lg:hidden');
  });
});
