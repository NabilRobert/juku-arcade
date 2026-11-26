import { describe, expect, it } from 'vitest';
import { nextTick, ref } from 'vue';
import { useDeckFinish } from '../src/composables/useDeckFinish.ts';

describe("word mode's finish line", () => {
  it('ends the run the moment today’s deck is cleared, once', async () => {
    const isCleared = ref(false);
    let finishes = 0;
    const finish = useDeckFinish(
      () => isCleared.value,
      () => (finishes += 1),
    );
    isCleared.value = true;
    await nextTick();
    expect([finish.isShown.value, finishes]).toEqual([true, 1]);
    finish.keepPractising();
    isCleared.value = false;
    await nextTick();
    isCleared.value = true;
    await nextTick();
    expect([finish.isShown.value, finishes]).toEqual([false, 1]);
  });

  it('never finishes a run that started with the deck already cleared', async () => {
    const isCleared = ref(true);
    let finishes = 0;
    const finish = useDeckFinish(
      () => isCleared.value,
      () => (finishes += 1),
    );
    isCleared.value = false;
    await nextTick();
    isCleared.value = true;
    await nextTick();
    expect([finish.isShown.value, finishes]).toEqual([false, 0]);
  });
});
