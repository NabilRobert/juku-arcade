// Button clicks and recorded sounds: every press clicks, and every recording the game names is shipped.
import { existsSync } from 'node:fs';
import { mount } from '@vue/test-utils';
import { afterEach, describe, expect, it, vi } from 'vitest';
import PixelButton from '../src/components/ui/PixelButton.vue';
import { playSound, RECORDINGS } from '../src/sound/sfx.ts';

vi.mock('../src/sound/sfx.ts', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../src/sound/sfx.ts')>()),
  playSound: vi.fn(),
}));

describe('button sounds', () => {
  afterEach(() => vi.mocked(playSound).mockClear());

  it('clicks when a pixel button is pressed', async () => {
    await mount(PixelButton, { slots: { default: 'Bank' } }).trigger('click');
    expect(playSound).toHaveBeenCalledWith('click');
  });

  it('ships every recording the game plays, in public/sounds', () => {
    const files = Object.values(RECORDINGS).flat();
    expect(files).toContain('ui-click-1.ogg');
    for (const file of files) expect(existsSync(`public/sounds/${file}`), file).toBe(true);
  });
});
