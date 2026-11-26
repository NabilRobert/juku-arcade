import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import AppFooter from '../src/components/AppFooter.vue';
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

describe('the footer', () => {
  it('opens the research page from its link during a game', async () => {
    const footer = mount(AppFooter, { props: { isInGame: true } });
    const link = footer.findAll('button').find((button) => button.text() === 'The research');
    await link?.trigger('click');
    expect(footer.emitted('go')?.[0]).toEqual(['research']);
  });

  it('shows only who made the game when there is no game', () => {
    const footer = mount(AppFooter, { props: { isInGame: false } });
    expect(footer.findAll('button')).toHaveLength(0);
    expect(footer.text()).toContain('@nabilrobert');
  });

  it('offers Stats, Settings, About and Research on the start screen, on any screen, but not Change mode', async () => {
    const footer = mount(AppFooter, { props: { isInGame: false, isOnStartScreen: true } });
    const labels = footer.findAll('button').map((button) => button.text());
    expect(labels).toEqual(['Stats', 'Settings', 'About the data', 'The research']);
    expect(footer.classes()).not.toContain('max-lg:hidden');
    await footer.findAll('button')[1]?.trigger('click');
    expect(footer.emitted('go')?.[0]).toEqual(['settings']);
  });

  it('hides during a game on a phone or a tablet, so the board fits with nothing to scroll', () => {
    const footer = mount(AppFooter, { props: { isInGame: true } });
    expect(footer.classes()).toContain('max-lg:hidden');
  });
});
