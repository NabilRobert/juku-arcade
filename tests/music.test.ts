// Background music: a remembered volume, a slider for it, and a loop that starts on the first press.
import { mount } from '@vue/test-utils';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { nextTick } from 'vue';
import MusicSlider from '../src/components/ui/MusicSlider.vue';
import {
  DEFAULT_MUSIC_VOLUME,
  musicVolume,
  setMusicVolume,
  startMusicOnFirstPress,
} from '../src/sound/music.ts';
import { setMuted } from '../src/sound/sfx.ts';

describe('the music volume', () => {
  afterEach(() => setMusicVolume(DEFAULT_MUSIC_VOLUME));

  it('stays between off and full, and is remembered in this browser', () => {
    setMusicVolume(1.7);
    expect(musicVolume.value).toBe(1);
    setMusicVolume(-1);
    expect(musicVolume.value).toBe(0);
    expect(localStorage.getItem('juku-arcade:music-volume')).toBe('0');
  });

  it('is set by the slider, which shows "off" at zero', async () => {
    const slider = mount(MusicSlider);
    await slider.find('input').setValue('40');
    expect(musicVolume.value).toBeCloseTo(0.4);
    await slider.find('input').setValue('0');
    expect(slider.text()).toContain('off');
  });
});

describe('the music track', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    setMuted(false);
  });

  it('starts looping on the first press, and stops when the sound is switched off', async () => {
    const played: HTMLMediaElement[] = [];
    vi.spyOn(HTMLMediaElement.prototype, 'play').mockImplementation(function (
      this: HTMLMediaElement,
    ) {
      played.push(this);
      return Promise.resolve();
    });
    const pause = vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => undefined);
    startMusicOnFirstPress();
    expect(played).toHaveLength(0);
    window.dispatchEvent(new Event('pointerdown'));
    expect(played).toHaveLength(1);
    expect(played[0]?.loop).toBe(true);
    expect(played[0]?.src).toContain('music/youre-not-there.m4a');
    expect(played[0]?.volume).toBeCloseTo(DEFAULT_MUSIC_VOLUME);
    setMuted(true);
    await nextTick();
    expect(pause).toHaveBeenCalled();
  });
});
