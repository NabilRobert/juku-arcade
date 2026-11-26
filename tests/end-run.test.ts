// End run, in every mode: it asks first, so a misclick can't end a run (playtest, 2026-11-26).
import 'fake-indexeddb/auto';
import { mount } from '@vue/test-utils';
import { describe, expect, it, vi } from 'vitest';
import { defineComponent, h, nextTick, ref } from 'vue';
import EndRunButton from '../src/components/ui/EndRunButton.vue';
import SidePanel from '../src/components/ui/SidePanel.vue';
import { useDeckFinish } from '../src/composables/useDeckFinish.ts';
import { endedEarly, FRESH_DOJO } from '../src/dojo/dojo-run.ts';
import { REST_QUOTES } from '../src/dojo/quotes.ts';
import type { PlayedRound } from '../src/kanji/useKanjiRun.ts';
import { useKanjiSheet } from '../src/kanji/useKanjiSheet.ts';

const buttonIn = (testid: string): HTMLElement | null =>
  document.querySelector<HTMLElement>(`[data-testid="${testid}"]`);

describe('the End run button', () => {
  it('asks "End this run?" first, pausing while it asks', async () => {
    const button = mount(EndRunButton, { attachTo: document.body });
    await button.find('[data-testid="end-run"]').trigger('click');
    expect(buttonIn('end-run-confirm')?.textContent).toContain('End this run?');
    // A quote on resting, with who said it and where.
    const shown = buttonIn('quote')?.textContent ?? '';
    expect(REST_QUOTES.some((quote) => shown.includes(quote.text))).toBe(true);
    expect(shown).toMatch(/― .+, .+/);
    expect(button.emitted('toggle')).toEqual([[true]]);
    expect(button.emitted('end')).toBeUndefined();
    button.unmount();
  });

  it('goes back to the run on Keep playing, without ending it', async () => {
    const button = mount(EndRunButton, { attachTo: document.body });
    await button.find('[data-testid="end-run"]').trigger('click');
    buttonIn('end-run-cancel')?.click();
    await nextTick();
    expect(buttonIn('end-run-confirm')).toBeNull();
    expect(button.emitted('toggle')).toEqual([[true], [false]]);
    expect(button.emitted('end')).toBeUndefined();
    button.unmount();
  });

  it('ends the run only once End run is confirmed', async () => {
    const button = mount(EndRunButton, { attachTo: document.body });
    await button.find('[data-testid="end-run"]').trigger('click');
    buttonIn('end-run-yes')?.click();
    await nextTick();
    expect(button.emitted('end')).toHaveLength(1);
    expect(buttonIn('end-run-confirm')).toBeNull();
    button.unmount();
  });
});

describe('ending a run from the side drawer', () => {
  it('closes the drawer as the run ends, so the results show at once', async () => {
    vi.stubGlobal('matchMedia', () => ({
      matches: false,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
    }));
    const ended: string[] = [];
    const screen = mount(
      defineComponent({
        setup: () => () =>
          h(SidePanel, { label: 'Run' }, () => h(EndRunButton, { onEnd: () => ended.push('end') })),
      }),
      { attachTo: document.body },
    );
    await nextTick();
    await screen.find('[data-testid="side-panel-toggle"]').trigger('click');
    expect(screen.find('[data-testid="side-panel"]').classes()).toContain('translate-x-0');
    await screen.find('[data-testid="end-run"]').trigger('click');
    buttonIn('end-run-yes')?.click();
    await nextTick();
    expect(ended).toEqual(['end']);
    expect(screen.find('[data-testid="side-panel"]').classes()).toContain('-translate-x-full');
    screen.unmount();
    vi.unstubAllGlobals();
  });
});

describe('ending a run early, in each mode', () => {
  it('word mode banks the pot and shows its results, then plays on', () => {
    let ends = 0;
    const finish = useDeckFinish(
      () => false,
      () => (ends += 1),
    );
    finish.endNow();
    expect([finish.isShown.value, ends]).toEqual([true, 1]);
    finish.keepPlaying();
    expect(finish.isShown.value).toBe(false);
  });

  it('kanji mode ends the sheet at once', () => {
    const sheet = useKanjiSheet({
      round: ref({ kanji: '生', meanings: [], cards: [] }),
      roundNumber: ref(3),
      score: ref(20),
      lastResult: ref<PlayedRound | null>(null),
    });
    expect(sheet.isDone.value).toBe(false);
    sheet.endNow();
    expect([sheet.isDone.value, sheet.isEndedEarly.value]).toEqual([true, true]);
  });

  it('practice mode ends at once with its score kept', () => {
    const ended = endedEarly({ ...FRESH_DOJO, right: 7 });
    expect([ended.isOver, ended.right, ended.lanterns]).toEqual([true, 7, FRESH_DOJO.lanterns]);
  });
});
