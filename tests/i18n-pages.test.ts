// The keys the research page and About the data build or pass by name, which the literal-key test in
// i18n-messages.test.ts can't see: each must have a message in English and in Indonesian.
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { en } from '../src/i18n/en/index.ts';
import { id } from '../src/i18n/id/index.ts';
import { SOURCE_GROUPS } from '../src/research/sources.ts';

type MessageTree = { [key: string]: string | MessageTree };

function messageAt(tree: MessageTree, key: string): string | undefined {
  let node: string | MessageTree | undefined = tree;
  for (const part of key.split('.')) {
    if (node === undefined || typeof node === 'string') return undefined;
    node = node[part];
  }
  return typeof node === 'string' ? node : undefined;
}

function missingIn(tree: MessageTree, keys: readonly string[]): string[] {
  return keys.filter((key) => !messageAt(tree, key));
}

const sources = SOURCE_GROUPS.flatMap((group) => group.sources);

const researchKeys = [
  ...SOURCE_GROUPS.map((group) => `pages.research.groups.${group.id}`),
  ...sources.flatMap((source) => [
    `pages.research.sources.${source.id}.finding`,
    `pages.research.sources.${source.id}.summary`,
    `pages.research.sources.${source.id}.where`,
    `pages.research.sources.${source.id}.inGame`,
  ]),
];

/** `<i18n-t keypath="…">` in AboutData.vue. */
const aboutKeys = [
  ...readFileSync('src/components/AboutData.vue', 'utf8').matchAll(/keypath="([\w.]+)"/g),
].map((match) => match[1] ?? '');

describe('the research page messages', () => {
  it('has every group, finding, use and venue note in both languages', () => {
    expect(missingIn(en, researchKeys)).toEqual([]);
    expect(missingIn(id, researchKeys)).toEqual([]);
  });

  it('gives each source its own messages', () => {
    expect(new Set(sources.map((source) => source.id)).size).toBe(sources.length);
  });
});

describe('the About the data messages', () => {
  it('has every sentence with a link in both languages', () => {
    expect(aboutKeys.length).toBeGreaterThan(0);
    expect(missingIn(en, aboutKeys)).toEqual([]);
    expect(missingIn(id, aboutKeys)).toEqual([]);
  });
});
