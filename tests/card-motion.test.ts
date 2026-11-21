// The throw: a matched reading card flies to its word card and knocks it down.
import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import GameBoard from '../src/components/GameBoard.vue';
import PlayCard from '../src/components/PlayCard.vue';
import { cardPose } from '../src/components/card-motion.ts';
import { centreOffset } from '../src/components/throw-geometry.ts';
import type { CardStatus } from '../src/game/card-status.ts';
import { tapCard } from '../src/game/taps.ts';
import { readingIndexOf, start, START_MS, wordIdAt } from './helpers/run.ts';

const HIT = 1;
const LAST = 3;

describe('the throw', () => {
  it('aims from the centre of the reading card to the centre of the word card', () => {
    const reading = { left: 0, top: 200, width: 100, height: 140 };
    const word = { left: 40, top: 0, width: 120, height: 160 };
    expect(centreOffset(reading, word)).toEqual({ x: 50, y: -190 });
  });

  it('flies the reading card onto its word card, spinning whole turns', () => {
    const pose = cardPose({
      status: 'matched',
      kind: 'reading',
      index: 0,
      throwTo: { x: 60, y: -190 },
    });
    expect((pose.x as number[])[HIT]).toBe(60);
    expect((pose.y as number[])[HIT]).toBe(-190);
    expect(((pose.rotate as number[])[HIT] ?? 1) % 360).toBe(0);
    expect((pose.opacity as number[])[LAST]).toBe(0);
  });

  it('keeps the word card standing until the hit, then knocks it over', () => {
    const pose = cardPose({ status: 'matched', kind: 'word', index: 0 });
    expect((pose.rotateX as number[])[HIT]).toBe(0);
    expect((pose.opacity as number[])[HIT]).toBe(1);
    expect((pose.rotateX as number[])[LAST]).toBeGreaterThan(45);
  });

  it('names x in every pose, so no card slides back to where it was dealt from', () => {
    const statuses: CardStatus[] = ['idle', 'selected', 'matched', 'wrong', 'hidden'];
    for (const status of statuses) {
      expect(cardPose({ status, kind: 'word', index: 0 })).toHaveProperty('x');
      expect(
        cardPose({ status, kind: 'reading', index: 0, throwTo: { x: 1, y: 1 } }),
      ).toHaveProperty('x');
    }
  });

  it('gives the matched reading card a target to fly to, and no other card', async () => {
    const { state, context } = start();
    const board = mount(GameBoard, { props: { state, nowMs: START_MS, tags: context.tags } });
    const wordId = wordIdAt(state, 0);
    const selected = tapCard(state, context, { kind: 'word', wordId }, START_MS);
    const readingIndex = readingIndexOf(state, wordId);
    const matched = tapCard(selected, context, { kind: 'reading', index: readingIndex }, START_MS);
    await board.setProps({ state: matched });
    const readings = board
      .findAllComponents(PlayCard)
      .filter((card) => card.props('kind') === 'reading');
    const targets = readings.map((card) => card.props('throwTo'));
    expect(targets[readingIndex]).toBeDefined();
    expect(targets.filter((target) => target !== undefined)).toHaveLength(1);
  });
});
