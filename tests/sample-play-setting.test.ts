// The sample week of play is a Settings switch: the streak's history follows it at once, and practice mode,
// which asks only what the player really met, never gets it.
import 'fake-indexeddb/auto';
import { flushPromises, mount } from '@vue/test-utils';
import { afterEach, describe, expect, it } from 'vitest';
import { defineComponent, h, nextTick } from 'vue';
import { usePlayHistory } from '../src/composables/usePlayHistory.ts';
import { deleteAllData } from '../src/memory/storage.ts';
import { isSamplePlayShown, setSamplePlayShown } from '../src/preferences/sample-play.ts';

const deck = { level: 'N5' as const, sourceCommit: 'test', words: [], kanji: {} };

async function historyOf(withSample: boolean) {
  await deleteAllData();
  let result!: ReturnType<typeof usePlayHistory>;
  mount(
    defineComponent({
      setup() {
        result = usePlayHistory(deck, { withSample });
        return () => h('div');
      },
    }),
  );
  await flushPromises();
  return result;
}

afterEach(() => setSamplePlayShown(false));

describe('the sample data switch', () => {
  it('starts off where the build sets no sample play (tests, a school build)', () => {
    expect(isSamplePlayShown.value).toBe(false);
  });

  it('adds the sample week to the history when switched on, and takes it away when off', async () => {
    const { history } = await historyOf(true);
    expect(history.value.runs).toHaveLength(0);
    setSamplePlayShown(true);
    await nextTick();
    expect(history.value.runs.length).toBeGreaterThan(0);
    setSamplePlayShown(false);
    await nextTick();
    expect(history.value.runs).toHaveLength(0);
  });

  it('never adds it where the history must be real (practice mode)', async () => {
    setSamplePlayShown(true);
    const { history } = await historyOf(false);
    expect(history.value.runs).toHaveLength(0);
  });
});
