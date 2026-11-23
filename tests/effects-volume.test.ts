// The sound effects' own volume: remembered, set by its slider, and off at zero.
import { mount } from '@vue/test-utils';
import { afterEach, describe, expect, it, vi } from 'vitest';
import SoundSliders from '../src/components/ui/SoundSliders.vue';
import { effectsVolume, playSound, setEffectsVolume } from '../src/sound/sfx.ts';

describe('the effects volume', () => {
  afterEach(() => {
    setEffectsVolume(1);
    vi.unstubAllGlobals();
  });

  it('starts at full, stays between off and full, and is remembered', () => {
    expect(effectsVolume.value).toBe(1);
    setEffectsVolume(3);
    expect(effectsVolume.value).toBe(1);
    setEffectsVolume(0.25);
    expect(localStorage.getItem('juku-arcade:effects-volume')).toBe('0.25');
  });

  it('is set by its own slider, apart from the music', async () => {
    const sliders = mount(SoundSliders);
    await sliders.find('[data-testid="effects-volume"]').setValue('60');
    expect(effectsVolume.value).toBeCloseTo(0.6);
  });

  it('plays no effects at all when turned to zero', async () => {
    // Reaching the audio engine would need an AudioContext; at zero it must never be asked for.
    const context = vi.fn();
    vi.stubGlobal('AudioContext', context);
    setEffectsVolume(0);
    playSound('chime');
    // Playing loads the audio engine in the background; wait for it, so a sound that slipped through shows.
    await vi.dynamicImportSettled();
    expect(context).not.toHaveBeenCalled();
  });
});
