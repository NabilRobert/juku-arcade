// The message files (D73): every key the code asks for exists in English, and every Indonesian message keeps
// the same {placeholders} as its English one, so a translation can't drop a number or a name.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { en } from '../src/i18n/en/index.ts';
import { id } from '../src/i18n/id/index.ts';

type MessageTree = { [key: string]: string | MessageTree };

function flatten(tree: MessageTree, prefix = ''): Map<string, string> {
  const flat = new Map<string, string>();
  for (const [key, value] of Object.entries(tree)) {
    const path = prefix === '' ? key : `${prefix}.${key}`;
    if (typeof value === 'string') flat.set(path, value);
    else for (const [innerPath, text] of flatten(value, path)) flat.set(innerPath, text);
  }
  return flat;
}

function sourceFiles(folder: string): string[] {
  return readdirSync(folder).flatMap((name) => {
    const path = join(folder, name);
    if (statSync(path).isDirectory()) return sourceFiles(path);
    return /\.(vue|ts)$/.test(name) ? [path] : [];
  });
}

/** Keys written out in full: `t('a.b')`, `$t('a.b')`, `translate('a.b')`. Built keys are tested where they're built. */
const LITERAL_KEY = /(?:\$t|\bt|\btranslate)\(\s*'([\w.]+)'/g;

function placeholdersOf(text: string): string[] {
  return [...text.matchAll(/\{(\w+)\}/g)].map((match) => match[1] ?? '').sort();
}

const english = flatten(en);
const indonesian = flatten(id);

describe('the interface messages', () => {
  it('has an English message for every key the code asks for by name', () => {
    const missing: string[] = [];
    for (const file of sourceFiles('src')) {
      for (const match of readFileSync(file, 'utf8').matchAll(LITERAL_KEY)) {
        const key = match[1] ?? '';
        if (!english.has(key)) missing.push(`${file}: ${key}`);
      }
    }
    expect(missing).toEqual([]);
  });

  it('keeps the English placeholders in every Indonesian message', () => {
    const mismatched: string[] = [];
    for (const [key, text] of english) {
      const translated = indonesian.get(key) ?? '';
      if (placeholdersOf(text).join() !== placeholdersOf(translated).join()) mismatched.push(key);
    }
    expect(mismatched).toEqual([]);
  });
});
