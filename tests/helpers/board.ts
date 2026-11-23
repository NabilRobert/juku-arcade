// Mounting the board in tests: it draws its cards once its slots are on the page.
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import GameBoard from '../../src/components/words/GameBoard.vue';
import type { RunState } from '../../src/game/run.ts';
import { START_MS } from './run.ts';

export async function mountBoard(state: RunState) {
  const board = mount(GameBoard, { props: { state, nowMs: START_MS, level: 'N5' as const } });
  await nextTick();
  return board;
}
