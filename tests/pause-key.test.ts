// Esc pauses and resumes the game, like the Pause button.
import { mount } from '@vue/test-utils';
import { describe, expect, it, onTestFinished, vi } from 'vitest';
import { defineComponent, h } from 'vue';
import { usePauseKey } from '../src/composables/usePauseKey.ts';

function withPauseKey(isPaused: boolean, isAvailable = true) {
  const pause = vi.fn();
  const resume = vi.fn();
  const wrapper = mount(
    defineComponent({
      setup() {
        usePauseKey({ isPaused: () => isPaused, isAvailable: () => isAvailable, pause, resume });
        return () => h('div');
      },
    }),
    { attachTo: document.body },
  );
  // Each test's listener goes when it ends, so presses don't reach the next test's.
  onTestFinished(() => wrapper.unmount());
  return { pause, resume };
}

const pressEscape = (): boolean =>
  window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));

describe('the pause key', () => {
  it('pauses a game in play', () => {
    const playing = withPauseKey(false);
    pressEscape();
    expect(playing.pause).toHaveBeenCalledOnce();
  });

  it('resumes a paused game', () => {
    const paused = withPauseKey(true);
    pressEscape();
    expect(paused.resume).toHaveBeenCalledOnce();
  });

  it('does nothing while Pause is unavailable', () => {
    const away = withPauseKey(false, false);
    pressEscape();
    expect(away.pause).not.toHaveBeenCalled();
  });
});
