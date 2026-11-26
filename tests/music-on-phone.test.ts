// Starting the music on a phone (its own file, so no other test's listeners or track are around).
import { afterEach, describe, expect, it, vi } from 'vitest';
import { startMusicOnFirstPress } from '../src/sound/music.ts';

describe('starting the music on a phone', () => {
  afterEach(() => vi.restoreAllMocks());

  it('tries again on the next tap when the browser refuses, then stops listening once it plays', async () => {
    let calls = 0;
    vi.spyOn(HTMLMediaElement.prototype, 'play').mockImplementation(() => {
      calls += 1;
      // The first try is refused, as Safari on an iPhone refuses sound it doesn't count as the player's.
      return calls === 1 ? Promise.reject(new Error('NotAllowedError')) : Promise.resolve();
    });
    vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => undefined);
    startMusicOnFirstPress();
    window.dispatchEvent(new Event('touchend'));
    await Promise.resolve();
    window.dispatchEvent(new Event('touchend'));
    await Promise.resolve();
    expect(calls).toBe(2);
    window.dispatchEvent(new Event('touchend'));
    expect(calls).toBe(2);
  });
});
