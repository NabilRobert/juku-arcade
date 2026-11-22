// Crests in kanji mode (D42): where they hide, what they pay, and scouting for them.
import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import { defineComponent, h } from 'vue';
import KanjiResult from '../src/components/kanji/KanjiResult.vue';
import PlayCard from '../src/components/cards/PlayCard.vue';
import {
  crestBonus,
  CURSE_POINTS,
  dealKanjiCrests,
  MAX_SCOUTS,
  SCOUTS_AT_START,
} from '../src/kanji/kanji-crests.ts';
import { POINTS_PER_HIT, type KanjiRound } from '../src/kanji/kanji-round.ts';
import { useKanjiCrests } from '../src/kanji/useKanjiCrests.ts';
import { CRESTS } from '../src/bank-run/crests.ts';
import { seededRandom } from './helpers/fixtures.ts';

const ROUND: KanjiRound = {
  kanji: '生',
  meanings: ['life'],
  cards: [
    { text: 'ガク', isRight: false },
    { text: 'セイ', isRight: true },
    { text: 'やま', isRight: false },
    { text: 'う(まれる)', isRight: true },
  ],
};
/** Every roll comes up 0: both crests are dealt, a koban on the first right card and a curse on the first wrong one. */
const lowest = () => 0;

function crestsFor(random = lowest) {
  let crests!: ReturnType<typeof useKanjiCrests>;
  mount(
    defineComponent({
      setup() {
        crests = useKanjiCrests(ROUND, random);
        return () => h('div');
      },
    }),
  );
  return crests;
}

describe('dealing crests in kanji mode', () => {
  it('hides good crests only on right readings and curses only on wrong ones', () => {
    for (let seed = 1; seed <= 200; seed += 1) {
      for (const [index, kind] of dealKanjiCrests(ROUND, seededRandom(seed))) {
        expect(ROUND.cards[index]?.isRight).toBe(kind !== 'cursed');
      }
    }
  });

  it('deals at most one good crest and one curse a round', () => {
    expect([...dealKanjiCrests(ROUND, lowest)]).toEqual([
      [1, 'koban'],
      [0, 'cursed'],
    ]);
  });
});

describe('what a crest pays', () => {
  it('doubles a right koban card and charges for a picked curse', () => {
    expect(crestBonus('koban', true, lowest)?.points).toBe(POINTS_PER_HIT);
    expect(crestBonus('cursed', false, lowest)?.points).toBe(-CURSE_POINTS);
  });

  it('gives an omikuji bonus between 5 and 15', () => {
    expect(crestBonus('omikuji', true, () => 0)?.points).toBe(5);
    expect(crestBonus('omikuji', true, () => 0.999)?.points).toBe(15);
  });

  it('pays nothing for a card without a crest, or a good crest on a wrong pick', () => {
    expect(crestBonus(undefined, true, lowest)).toBeNull();
    expect(crestBonus('koban', false, lowest)).toBeNull();
  });
});

describe('scouting for crests in kanji mode', () => {
  it('uses a scout to flip the hand over, and turning it back is free', () => {
    const crests = crestsFor();
    crests.toggleScout(true);
    expect(crests.isScouting.value).toBe(true);
    expect(crests.scoutsLeft.value).toBe(SCOUTS_AT_START - 1);
    crests.toggleScout(true);
    expect(crests.isScouting.value).toBe(false);
    expect(crests.scoutsLeft.value).toBe(SCOUTS_AT_START - 1);
  });

  it('keeps the scouted crests marked until the next round is dealt', () => {
    const crests = crestsFor();
    expect(crests.crestMarks.value.size).toBe(0);
    crests.toggleScout(true);
    crests.toggleScout(true);
    expect(crests.crestMarks.value.get(1)).toBe(CRESTS.koban);
    crests.deal(ROUND);
    expect(crests.crestMarks.value.size).toBe(0);
  });

  it("can't scout once the hand is played, or with no scouts left", () => {
    const crests = crestsFor();
    crests.toggleScout(false);
    expect(crests.isScouting.value).toBe(false);
    crests.scoutsLeft.value = 0;
    crests.toggleScout(true);
    expect(crests.isScouting.value).toBe(false);
  });

  it('earns a scout for a perfect round, up to three', () => {
    const crests = crestsFor();
    for (let round = 0; round < 5; round += 1) crests.earnScout();
    expect(crests.scoutsLeft.value).toBe(MAX_SCOUTS);
  });

  it('reports what a thrown crest paid', () => {
    const crests = crestsFor();
    expect(crests.pointsFor(0, false)).toBe(-CURSE_POINTS);
    expect(crests.notice.value).toMatchObject({
      isGood: false,
      text: expect.stringContaining('Cursed'),
    });
    expect(crests.pointsFor(2, false)).toBe(0);
  });
});

describe('a scouted card', () => {
  const mountCard = (status: 'idle' | 'selected') =>
    mount(PlayCard, {
      props: {
        text: 'セイ',
        kind: 'reading',
        status,
        index: 0,
        level: 'N5',
        crestMark: CRESTS.koban,
      },
    });

  it("takes the crest's colour on its front frame and its back", () => {
    const card = mountCard('idle');
    const tinted = card.findAll('[data-tint]').map((frame) => frame.attributes('data-tint'));
    expect(tinted).toEqual([CRESTS.koban.tint, CRESTS.koban.tint]);
    expect(card.find('.card-back-tinted').exists()).toBe(true);
    expect(card.find('[data-testid="crest-mark"]').text()).toBe(CRESTS.koban.symbol);
  });

  it('still shows its status colour on the front when picked', () => {
    // Only the back's frame keeps the tint.
    expect(mountCard('selected').findAll('[data-tint]')).toHaveLength(1);
  });
});

describe('the round result', () => {
  it('shows what the crests added or took', () => {
    const result = { hits: 1, wrongPicks: 1, misses: 1, isPerfect: false, points: 10 };
    const cursed = mount(KanjiResult, { props: { result: { ...result, crestPoints: -10 } } });
    expect(cursed.find('[data-testid="crest-points"]').text()).toBe('Crests −10');
    const plain = mount(KanjiResult, { props: { result: { ...result, crestPoints: 0 } } });
    expect(plain.find('[data-testid="crest-points"]').exists()).toBe(false);
  });
});
