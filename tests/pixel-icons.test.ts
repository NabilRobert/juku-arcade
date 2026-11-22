// The pixel-art icons: well-formed grids, and the sound switch showing the right speaker.
import { mount } from '@vue/test-utils';
import { afterEach, describe, expect, it } from 'vitest';
import SoundToggle from '../src/components/SoundToggle.vue';
import { iconPaths, ICONS, type IconName } from '../src/components/pixel-icons.ts';
import { setMuted } from '../src/sound/sfx.ts';

describe('the pixel icons', () => {
  it('are rectangles with every pixel painted from the palette', () => {
    for (const [name, grid] of Object.entries(ICONS)) {
      const width = grid[0]?.length;
      expect(grid.every((row) => row.length === width)).toBe(true);
      expect(() => iconPaths(name as IconName)).not.toThrow();
    }
  });

  it('draws one path per colour', () => {
    const colours = iconPaths('scout').map((path) => path.colour);
    expect(new Set(colours).size).toBe(colours.length);
  });
});

describe('the sound switch', () => {
  afterEach(() => setMuted(false));

  it('shows a speaker with sound while on, and a crossed-out one while off', async () => {
    const toggle = mount(SoundToggle);
    expect(toggle.find('[data-icon]').attributes('data-icon')).toBe('soundOn');
    await toggle.find('button').trigger('click');
    expect(toggle.find('[data-icon]').attributes('data-icon')).toBe('soundOff');
    expect(toggle.text()).toContain('Sound off');
  });
});
