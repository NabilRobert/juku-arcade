/**
 * Crests and scouting in kanji mode (kanji-crests.ts), for useKanjiRun:
 * the crests on this round's cards, scouting (flipping the hand over to
 * see them; they stay marked on the cards until the round ends), and
 * what a thrown card's crest pays. A run starts with two
 * scouts and earns one per perfect round, up to three.
 */
import { computed, ref, shallowRef } from 'vue';
import type { CrestMark } from '../components/cards/crest-mark.ts';
import { useNotice } from '../composables/useNotice.ts';
import type { RandomSource } from '../game/deal.ts';
import { CRESTS, type CrestKind } from '../bank-run/crests.ts';
import { crestBonus, dealKanjiCrests, MAX_SCOUTS, SCOUTS_AT_START } from './kanji-crests.ts';
import type { KanjiRound } from './kanji-round.ts';

export function useKanjiCrests(firstRound: KanjiRound, random: RandomSource) {
  const crests = shallowRef<Map<number, CrestKind>>(dealKanjiCrests(firstRound, random));
  const scoutsLeft = ref(SCOUTS_AT_START);
  const isScouting = ref(false);
  /** True from a scout until the next round: the scouted crests stay marked on the cards. */
  const isRevealed = ref(false);
  /** The last crest that paid out (or cost), for the side panel. */
  const { notice, notify } = useNotice();

  return {
    scoutsLeft,
    isScouting,
    notice,
    /** The scouted crests, by card index: from a scout until the round ends. */
    crestMarks: computed(() => {
      if (!isRevealed.value) return new Map<number, CrestMark>();
      return new Map([...crests.value].map(([index, kind]) => [index, CRESTS[kind]]));
    }),
    deal: (round: KanjiRound) => {
      crests.value = dealKanjiCrests(round, random);
      isScouting.value = false;
      isRevealed.value = false;
    },
    /** Flips the hand over to scout, using a scout; or turns it back, which is free. */
    toggleScout: (canScout: boolean) => {
      if (isScouting.value) isScouting.value = false;
      else if (canScout && scoutsLeft.value > 0) {
        scoutsLeft.value -= 1;
        isScouting.value = true;
        isRevealed.value = true;
      }
    },
    earnScout: () => {
      scoutsLeft.value = Math.min(scoutsLeft.value + 1, MAX_SCOUTS);
    },
    /** The points a thrown card's crest adds or takes; 0 when it has none. */
    pointsFor: (index: number, isRight: boolean): number => {
      const bonus = crestBonus(crests.value.get(index), isRight, random);
      if (bonus === null) return 0;
      notify(bonus.label, bonus.points > 0);
      return bonus.points;
    },
  };
}
