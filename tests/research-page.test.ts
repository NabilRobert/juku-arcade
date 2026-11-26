import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import ResearchPage from '../src/components/ResearchPage.vue';
import { SOURCE_GROUPS } from '../src/research/sources.ts';

const sources = SOURCE_GROUPS.flatMap((group) => group.sources);

describe('the research page', () => {
  it('lists every source, each with where the game uses it', () => {
    const page = mount(ResearchPage);
    const shown = page.findAll('[data-testid="source"]');
    expect(shown).toHaveLength(sources.length);
    for (const card of shown) expect(card.text()).toContain('In juku-arcade:');
  });

  it('links each source that is online, over https', () => {
    const page = mount(ResearchPage);
    const links = page.findAll('[data-testid="source"] a');
    expect(links).toHaveLength(sources.filter((source) => source.url !== null).length);
    for (const link of links) expect(link.attributes('href')).toMatch(/^https:\/\//);
  });

  it('says the sources back the ideas, not this game', () => {
    expect(mount(ResearchPage).text()).toContain('none of them studied this game');
  });
});
