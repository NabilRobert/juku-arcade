// Mounting the board in tests: it draws its cards once its slots are on the page.
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import GameBoard from '../../src/components/GameBoard.vue';
import type { RunState } from '../../src/game/run.ts';
import type { TagTable } from '../../src/game/tags.ts';
import { START_MS } from './run.ts';

export async function mountBoard(state: RunState, tags: TagTable) {
  const board = mount(GameBoard, { props: { state, nowMs: START_MS, tags, level: 'N5' as const } });
  await nextTick();
  return board;
}
