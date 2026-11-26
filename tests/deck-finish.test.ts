// Word mode's finish line (D70): clearing today's deck shows a banner and play goes on.
import { afterEach, describe, expect, it, vi } from 'vitest';
import { nextTick, ref } from 'vue';
import { BANNER_MS, useDeckFinish } from '../src/composables/useDeckFinish.ts';

afterEach(() => vi.useRealTimers());

describe("word mode's finish line", () => {
  it('shows a banner the moment today’s deck is cleared, without ending the run', async () => {
    vi.useFakeTimers();
    const isCleared = ref(false);
    let ends = 0;
    const finish = useDeckFinish(
      () => isCleared.value,
      () => (ends += 1),
    );
    isCleared.value = true;
    await nextTick();
    expect([finish.isBannerShown.value, finish.isShown.value, ends]).toEqual([true, false, 0]);
    vi.advanceTimersByTime(BANNER_MS);
    expect(finish.isBannerShown.value).toBe(false);
  });

  it('shows the banner once a day, and not at all if the deck was already cleared', async () => {
    const isCleared = ref(true);
    const finish = useDeckFinish(
      () => isCleared.value,
      () => undefined,
    );
    isCleared.value = false;
    await nextTick();
    isCleared.value = true;
    await nextTick();
    expect(finish.isBannerShown.value).toBe(false);
  });
});
