// A phone turned sideways: the game asks for portrait, and only phones match (tablets and desktops don't).
import { mount } from '@vue/test-utils';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { defineComponent, h, nextTick } from 'vue';
import RotateNotice from '../src/components/ui/RotateNotice.vue';
import { usePhoneLandscape } from '../src/composables/usePhoneLandscape.ts';

/** Pretends matchMedia matches exactly the queries `matches` says yes to. */
function stubMatchMedia(matches: (query: string) => boolean): string[] {
  const asked: string[] = [];
  vi.stubGlobal('matchMedia', (query: string) => {
    asked.push(query);
    return {
      matches: matches(query),
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
    };
  });
  return asked;
}

async function isPhoneLandscapeNow(): Promise<boolean> {
  let result!: ReturnType<typeof usePhoneLandscape>;
  mount(
    defineComponent({
      setup() {
        result = usePhoneLandscape();
        return () => h('div');
      },
    }),
  );
  await nextTick();
  return result.value;
}

afterEach(() => vi.unstubAllGlobals());

describe('a phone turned sideways', () => {
  it('is a landscape screen at most 500 px tall, touch-driven or phone-wide', async () => {
    const asked = stubMatchMedia(() => true);
    expect(await isPhoneLandscapeNow()).toBe(true);
    const [touch, narrow] = (asked[0] ?? '').split(', ');
    for (const branch of [touch, narrow]) {
      expect(branch).toContain('orientation: landscape');
      expect(branch).toContain('max-height: 500px');
    }
    expect(touch).toContain('pointer: coarse');
    // A browser's phone preview reports a mouse, so a phone's width counts too.
    expect(narrow).toContain('max-width: 1000px');
  });

  it("isn't a tablet or a desktop window, which don't match the query", async () => {
    stubMatchMedia(() => false);
    expect(await isPhoneLandscapeNow()).toBe(false);
  });

  it('asks the player to turn the phone back to portrait', () => {
    const notice = mount(RotateNotice);
    expect(notice.text()).toContain('Please turn your phone back to portrait');
    expect(notice.attributes('role')).toBe('alertdialog');
  });
});
