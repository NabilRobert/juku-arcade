// The throw: a matched reading card flies to its word card, hits it, and both snap away.
import { mount } from '@vue/test-utils';
import { describe, expect, it, onTestFinished, vi } from 'vitest';
import PlayCard from '../src/components/PlayCard.vue';
import { cardPose, dealtFrom, THROW_S } from '../src/components/card-motion.ts';
import { SNAP_FRAMES } from '../src/components/pixel-snap.ts';
import { centreOffset, placementBetween } from '../src/components/throw-geometry.ts';
import type { CardStatus } from '../src/game/card-status.ts';
import { tapCard } from '../src/game/taps.ts';
import { mountBoard } from './helpers/board.ts';
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
    // It stays on the word card after the hit, to dissolve there.
    expect((pose.y as number[])[LAST]).toBe(-190);
  });

  it('jolts the word card at the hit and leaves it standing, to dissolve where it is', () => {
    const pose = cardPose({ status: 'matched', kind: 'word', index: 0 });
    expect((pose.scale as number[])[HIT + 1]).toBeGreaterThan(1);
    expect((pose.y as number[])[LAST]).toBe(0);
    expect(pose.opacity).toBe(1);
  });

  it('snaps a matched card away once the throw has hit', async () => {
    const animate = vi.fn((frames: Keyframe[], timing: KeyframeAnimationOptions) => {
      void frames;
      void timing;
      return { finished: new Promise(() => undefined) };
    });
    const original = HTMLElement.prototype.animate;
    HTMLElement.prototype.animate = animate as unknown as typeof original;
    // The test browser lays nothing out; give the card a size to cut into blocks.
    const width = vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockReturnValue(150);
    const height = vi.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockReturnValue(200);
    onTestFinished(() => {
      HTMLElement.prototype.animate = original;
      width.mockRestore();
      height.mockRestore();
    });
    const card = mount(PlayCard, {
      props: { text: '学校', kind: 'word', index: 0, status: 'idle', level: 'N5' },
    });
    expect(animate).not.toHaveBeenCalled();
    await card.setProps({ status: 'matched' });
    const [frames, timing] = animate.mock.calls[0] ?? [[], {}];
    expect(frames).toHaveLength(SNAP_FRAMES + 1);
    expect(frames[0]).toHaveProperty('clipPath');
    expect(timing).toMatchObject({ delay: THROW_S * 1000, fill: 'forwards' });
  });

  it('starts a dealt card on top of the deck, at the size of the deck', () => {
    const slot = { left: 0, top: 0, width: 150, height: 200 };
    const deck = { left: 600, top: 400, width: 75, height: 100 };
    const pose = dealtFrom(placementBetween(slot, deck));
    expect(pose).toMatchObject({ x: 562.5, y: 350, scale: 0.5, opacity: 1 });
  });

  it('shifts a laid reading card up out of the hand, and flies it from there once matched', () => {
    const laid = cardPose({ status: 'idle', kind: 'reading', index: 0, isLaid: true });
    expect(laid.y).toBeLessThan(0);
    const thrown = cardPose({
      status: 'matched',
      kind: 'reading',
      index: 0,
      isLaid: true,
      throwTo: { x: 1, y: -100 },
    });
    expect((thrown.y as number[])[HIT]).toBe(-100);
  });

  it('turns a card face down when the game pauses, and face up again after', () => {
    expect(cardPose({ status: 'hidden', kind: 'word', index: 0 }).rotateY).toBe(180);
    expect(cardPose({ status: 'idle', kind: 'word', index: 0 }).rotateY).toBe(0);
  });

  it('deals a card face down off the deck, so it turns face up as it flies', () => {
    expect(dealtFrom({ x: 0, y: 0, scale: 1 }).rotateY).toBe(180);
  });

  it('hides a snapped card outright once the snap ends, so none is left part-way', async () => {
    const original = HTMLElement.prototype.animate;
    HTMLElement.prototype.animate = vi.fn(() => ({ finished: Promise.resolve() })) as never;
    const width = vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockReturnValue(150);
    const height = vi.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockReturnValue(200);
    onTestFinished(() => {
      HTMLElement.prototype.animate = original;
      width.mockRestore();
      height.mockRestore();
    });
    const card = mount(PlayCard, {
      props: { text: '学校', kind: 'word', index: 0, status: 'idle', level: 'N5' },
    });
    await card.setProps({ status: 'matched' });
    await vi.waitFor(() => {
      expect(card.find('button > span').attributes('style')).toContain('visibility: hidden');
    });
  });

  it('names x and the depth in every pose, so no card slides or warps back to where it was dealt from', () => {
    const statuses: CardStatus[] = ['idle', 'selected', 'matched', 'wrong', 'hidden'];
    for (const status of statuses) {
      expect(cardPose({ status, kind: 'word', index: 0 })).toHaveProperty('x');
      expect(cardPose({ status, kind: 'word', index: 0 })).toHaveProperty('transformPerspective');
      expect(cardPose({ status, kind: 'word', index: 0 })).toHaveProperty('rotateY');
      expect(
        cardPose({ status, kind: 'reading', index: 0, throwTo: { x: 1, y: 1 } }),
      ).toHaveProperty('x');
    }
  });

  it('gives the matched reading card a target to fly to, and no other card', async () => {
    const { state, context } = start();
    const board = await mountBoard(state, context.tags);
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
