// The table's picture: a local copy can show a private image instead of the swirl; public builds can't.
import { mount } from '@vue/test-utils';
import { afterEach, describe, expect, it, vi } from 'vitest';

async function mountTable() {
  vi.resetModules();
  const { default: TableBackground } = await import('../src/components/TableBackground.vue');
  return mount(TableBackground);
}

describe('the table background', () => {
  afterEach(() => vi.unstubAllEnvs());

  it('shows the private picture, and no swirl, when this copy names one', async () => {
    vi.stubEnv('VITE_TABLE_IMAGE', 'local/table.webp');
    const table = await mountTable();
    expect(table.find('img').attributes('src')).toContain('local/table.webp');
    expect(table.find('canvas').exists()).toBe(false);
  });

  it('draws the swirl when no picture is set, as in every public build', async () => {
    vi.stubEnv('VITE_TABLE_IMAGE', '');
    const table = await mountTable();
    expect(table.find('img').exists()).toBe(false);
    expect(table.find('canvas').exists()).toBe(true);
  });
});
