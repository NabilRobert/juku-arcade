// The small on/off preferences: remembered in this browser, switched by OnOffButton, and furigana's effect.
import { mount } from '@vue/test-utils';
import { afterEach, describe, expect, it } from 'vitest';
import { nextTick } from 'vue';
import OnOffButton from '../src/components/ui/OnOffButton.vue';
import FuriganaText from '../src/components/words/FuriganaText.vue';
import { isFuriganaShown, setFuriganaShown } from '../src/preferences/furigana.ts';
import { storedFlag } from '../src/preferences/stored-flag.ts';

afterEach(() => {
  setFuriganaShown(true);
  localStorage.clear();
});

describe('a stored flag', () => {
  it('starts from its fallback when nothing is saved', () => {
    expect(storedFlag('test:unsaved', true).isOn.value).toBe(true);
    expect(storedFlag('test:unsaved', false).isOn.value).toBe(false);
  });

  it('remembers a change for the next visit', () => {
    storedFlag('test:saved', true).set(false);
    expect(storedFlag('test:saved', true).isOn.value).toBe(false);
  });
});

describe('the on/off button', () => {
  it('says its state and asks for the opposite when pressed', async () => {
    const button = mount(OnOffButton, { props: { label: 'Furigana', isOn: true } });
    expect(button.text()).toBe('Furigana on');
    await button.trigger('click');
    expect(button.emitted('change')).toEqual([[false]]);
  });
});

describe('furigana', () => {
  it('shows readings over kanji by default', () => {
    expect(isFuriganaShown.value).toBe(true);
    expect(
      mount(FuriganaText, { props: { marked: '{学校|がっこう}へ' } })
        .find('rt')
        .text(),
    ).toBe('がっこう');
  });

  it('shows the kanji alone once furigana is turned off', async () => {
    const text = mount(FuriganaText, { props: { marked: '{学校|がっこう}へ' } });
    setFuriganaShown(false);
    await nextTick();
    expect(text.find('rt').exists()).toBe(false);
    expect(text.text()).toBe('学校へ');
  });
});
