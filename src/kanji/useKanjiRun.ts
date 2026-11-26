/**
 * A run of kanji mode (D37), for the kanji screen: the round on the table,
 * the cards the player has picked, and playing them. Playing throws the
 * picked cards at the kanji one after another, left to right, as word mode
 * plays a hand (useHand.ts). A right card hits and builds the combo; a
 * wrong one breaks it and stays on the table, marked. The player picks
 * and plays again until every right reading is found or three picks were
 * wrong (D45). Then the right readings left in the hand light up, the
 * round is scored (kanji-round.ts), and a new kanji is dealt.
 *
 * Crests (D42, useKanjiCrests.ts) may hide on the cards: scouting flips the
 * hand over to show them, and a crested card adds or takes points when
 * it's thrown.
 *
 * Kanji mode is practice (D37): nothing here is logged or reviewed. Which
 * kanji come up balances learning with review (sheet-mix.ts, D67).
 */
import { computed, ref, shallowRef } from 'vue';
import type { CardStatus } from '../game/card-status.ts';
import type { RandomSource } from '../game/deal.ts';
import type { Deck } from '../deck/types.ts';
import { THROW_S } from '../components/cards/card-motion.ts';
import { PLAY_STEP_MS } from '../composables/useHand.ts';
import { useLater } from '../composables/useLater.ts';
import { comboPitch, playSound } from '../sound/sfx.ts';
import {
  dealKanjiRound,
  isRoundOver,
  kanjiPool,
  scoreRound,
  wrongPicksLeft,
  type KanjiRound,
  type RoundResult,
} from './kanji-round.ts';
import { useKanjiCrests } from './useKanjiCrests.ts';
import { kindForRound } from './sheet-mix.ts';
import { masteredKanji } from '../memory/level-goals.ts';
import { loadKanjiRounds } from '../memory/storage.ts';

export type KanjiPhase = 'picking' | 'playing' | 'revealed';

/** A thrown card reaches the kanji this long after it leaves the hand. */
const THROW_MS = THROW_S * 1000;
/** A scored round, with what its crests added or took. */
export interface PlayedRound extends RoundResult {
  crestPoints: number;
}

/** How long the answers show before the next kanji is dealt. */
const REVEAL_MS = 2200;
/** A kanji isn't dealt again until this many others have been. */
const RECENT_KANJI = 8;

/**
 * The kanji the player has mastered, read from the play log once the run
 * starts. Until it's read (or if storage is blocked) nothing counts as
 * mastered, so a round meant for review is dealt from the learning kinds.
 */
function useMastered() {
  const mastered = shallowRef<ReadonlySet<string>>(new Set());
  loadKanjiRounds()
    .then((rounds) => {
      mastered.value = masteredKanji(rounds);
    })
    .catch(() => undefined);
  return mastered;
}

function useRounds(deck: Deck, random: RandomSource) {
  const pool = kanjiPool(deck);
  const mastered = useMastered();
  const recent: string[] = [];
  let dealt = 0;
  function deal(): KanjiRound {
    dealt += 1;
    const wish = {
      kind: kindForRound(dealt, random),
      standing: { mastered: mastered.value, levelList: pool.levelList },
    };
    const round = dealKanjiRound(pool, random, recent, wish);
    recent.unshift(round.kanji);
    recent.splice(RECENT_KANJI);
    return round;
  }
  return { deal };
}

/** The combo, the score and the impacts the board shakes to. */
function useTally() {
  const score = ref(0);
  const combo = ref(0);
  const bestCombo = ref(0);
  /** Counts hits, so the board can jolt the kanji on each one. */
  const impacts = ref(0);
  function land(isRight: boolean): void {
    if (!isRight) {
      combo.value = 0;
      playSound('miss');
      return;
    }
    combo.value += 1;
    bestCombo.value = Math.max(bestCombo.value, combo.value);
    impacts.value += 1;
    playSound('slap');
    playSound('chime', comboPitch(combo.value));
  }
  function finish(result: PlayedRound): void {
    // A curse can take points, but never below nothing.
    score.value = Math.max(0, score.value + result.points + result.crestPoints);
    if (result.misses > 0) combo.value = 0;
    if (result.isPerfect) playSound('cleared');
  }
  return { score, combo, bestCombo, impacts, land, finish };
}

/** The cards on the table: the round, which cards are picked and which have been thrown. */
function useTable(firstRound: KanjiRound, isScouting: () => boolean) {
  const round = shallowRef(firstRound);
  const roundNumber = ref(1);
  const picked = ref<number[]>([]);
  const thrown = ref<number[]>([]);
  const phase = ref<KanjiPhase>('picking');

  function newRound(next: KanjiRound): void {
    round.value = next;
    roundNumber.value += 1;
    picked.value = [];
    thrown.value = [];
    phase.value = 'picking';
  }

  function toggle(index: number): void {
    if (phase.value !== 'picking' || thrown.value.includes(index)) return;
    const isPicked = picked.value.includes(index);
    picked.value = isPicked ? picked.value.filter((i) => i !== index) : [...picked.value, index];
    playSound('pickUp');
  }

  function statusOf(index: number): CardStatus {
    const card = round.value.cards[index];
    if (thrown.value.includes(index)) return card?.isRight === true ? 'matched' : 'wrong';
    if (isScouting()) return 'hidden';
    if (phase.value === 'revealed' && card?.isRight === true) return 'correct';
    return picked.value.includes(index) ? 'selected' : 'idle';
  }

  return { round, roundNumber, picked, thrown, phase, newRound, toggle, statusOf };
}

type Table = ReturnType<typeof useTable>;
type Tally = ReturnType<typeof useTally>;
type Crests = ReturnType<typeof useKanjiCrests>;

type Later = ReturnType<typeof useLater>;

/** Throwing one card at the kanji, and what this round's thrown crests have added or taken. */
function useThrower(table: Table, tally: Tally, crests: Crests, later: Later) {
  let crestPoints = 0;
  return {
    crestPoints: () => crestPoints,
    resetCrestPoints: () => {
      crestPoints = 0;
    },
    throwCard: (index: number) => {
      table.thrown.value = [...table.thrown.value, index];
      playSound('whoosh');
      later(() => {
        const isRight = table.round.value.cards[index]?.isRight === true;
        crestPoints += crests.pointsFor(index, isRight);
        tally.land(isRight);
      }, THROW_MS);
    },
  };
}

/** Playing the picked cards: throws them in turn, then picks again or reveals and scores the round. */
function usePlayback(table: Table, tally: Tally, crests: Crests, deal: () => KanjiRound) {
  const lastResult = shallowRef<PlayedRound | null>(null);
  const later = useLater();
  const { throwCard, crestPoints, resetCrestPoints } = useThrower(table, tally, crests, later);

  function dealNext(): void {
    const next = deal();
    table.newRound(next);
    crests.deal(next);
    resetCrestPoints();
  }

  function reveal(): void {
    const result = {
      ...scoreRound(table.round.value, table.thrown.value),
      crestPoints: crestPoints(),
    };
    lastResult.value = result;
    tally.finish(result);
    if (result.isPerfect) crests.earnScout();
    table.phase.value = 'revealed';
    later(dealNext, REVEAL_MS);
  }

  /** After a play: the answers show if the round is over, else the player picks again. */
  function afterPlay(): void {
    table.picked.value = [];
    if (isRoundOver(table.round.value, table.thrown.value)) reveal();
    else table.phase.value = 'picking';
  }

  function play(): void {
    if (table.phase.value !== 'picking' || table.picked.value.length === 0) return;
    crests.isScouting.value = false;
    table.phase.value = 'playing';
    const order = [...table.picked.value].sort((a, b) => a - b);
    order.forEach((index, step) => later(() => throwCard(index), step * PLAY_STEP_MS));
    later(afterPlay, (order.length - 1) * PLAY_STEP_MS + THROW_MS);
  }

  return { lastResult, play };
}

export function useKanjiRun(deck: Deck, random: RandomSource = Math.random) {
  const { deal } = useRounds(deck, random);
  const tally = useTally();
  const firstRound = deal();
  const crests = useKanjiCrests(firstRound, random);
  const table = useTable(firstRound, () => crests.isScouting.value);
  const { lastResult, play } = usePlayback(table, tally, crests, deal);
  return {
    ...table,
    lastResult,
    play,
    crestMarks: crests.crestMarks,
    notice: crests.notice,
    scoutsLeft: crests.scoutsLeft,
    isScouting: crests.isScouting,
    /** Scouting is for picking time: once the hand is played, the crests are spent. */
    toggleScout: () => crests.toggleScout(table.phase.value === 'picking'),
    score: tally.score,
    combo: tally.combo,
    bestCombo: tally.bestCombo,
    impacts: tally.impacts,
    wrongPicksLeft: computed(() => wrongPicksLeft(table.round.value, table.thrown.value)),
    canPlay: computed(
      () =>
        table.phase.value === 'picking' &&
        table.picked.value.length > 0 &&
        !crests.isScouting.value,
    ),
  };
}
