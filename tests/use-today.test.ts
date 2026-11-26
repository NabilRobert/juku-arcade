// Today's date stays current, so a start screen left open past midnight moves on to the new day.
import { mount } from '@vue/test-utils';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { defineComponent, h } from 'vue';
import { useToday } from '../src/composables/useToday.ts';

afterEach(() => vi.useRealTimers());

describe("today's date", () => {
  it('moves on to the new day within a minute of midnight', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 10, 26, 23, 59, 30));
    let today!: ReturnType<typeof useToday>;
    mount(
      defineComponent({
        setup() {
          today = useToday();
          return () => h('div');
        },
      }),
    );
    expect(today.value).toBe('2026-11-26');
    vi.advanceTimersByTime(60_000);
    expect(today.value).toBe('2026-11-27');
  });
});
