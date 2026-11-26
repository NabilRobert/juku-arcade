<script setup lang="ts">
/**
 * A dojo question played with cards, on kanji mode's board (KanjiBoard):
 * a word question (the word, and four readings) or a kanji question (the
 * kanji, and eight readings). Pick the right readings and Play; one wrong
 * card is a miss (judgeCards). Once answered or timed out, the right
 * readings left in the hand light up.
 */
import { shallowRef } from 'vue';
import type { JlptLevel } from '../../deck/types.ts';
import { judgeCards } from '../../dojo/dojo-questions.ts';
import type { CardStatus } from '../../game/card-status.ts';
import type { KanjiRound } from '../../kanji/kanji-round.ts';
import { useLater } from '../../composables/useLater.ts';
import { playSound } from '../../sound/sfx.ts';
import { THROW_S } from '../cards/card-motion.ts';
import KanjiBoard from '../kanji/KanjiBoard.vue';

const props = defineProps<{
  round: KanjiRound;
  level: JlptLevel;
  combo: number;
  isLocked: boolean;
}>();
const emit = defineEmits<{ answer: [isRight: boolean] }>();

const MS_PER_SECOND = 1000;
const NO_CRESTS = new Map();
const picked = shallowRef<number[]>([]);
const thrown = shallowRef<number[]>([]);
const later = useLater();

function toggle(index: number): void {
  if (props.isLocked || thrown.value.includes(index)) return;
  const isPicked = picked.value.includes(index);
  picked.value = isPicked ? picked.value.filter((i) => i !== index) : [...picked.value, index];
  playSound('pickUp');
}

function play(): void {
  if (props.isLocked || picked.value.length === 0) return;
  thrown.value = [...thrown.value, ...picked.value];
  picked.value = [];
  playSound('whoosh');
  later(() => {
    const verdict = judgeCards(props.round, thrown.value);
    if (verdict !== null) emit('answer', verdict);
  }, THROW_S * MS_PER_SECOND);
}

/**
 * As the question's time runs out (useDojoRun): the cards picked are thrown
 * too, and everything thrown is judged now, rather than lost (playtest,
 * 2026-11-26). Right only if every right reading is in, with no wrong one.
 */
function judgeNow(): boolean {
  thrown.value = [...thrown.value, ...picked.value];
  picked.value = [];
  return judgeCards(props.round, thrown.value) === true;
}
defineExpose({ judgeNow });

function statusOf(index: number): CardStatus {
  const isRight = props.round.cards[index]?.isRight === true;
  if (thrown.value.includes(index)) return isRight ? 'matched' : 'wrong';
  if (props.isLocked && isRight) return 'correct';
  return picked.value.includes(index) ? 'selected' : 'idle';
}
</script>

<template>
  <KanjiBoard
    :round="round"
    :round-number="0"
    :level="level"
    :status-of="statusOf"
    :thrown="thrown"
    :combo="combo"
    :impacts="0"
    :can-play="!isLocked && picked.length > 0"
    :wrong-picks-left="1"
    :max-wrong-picks="1"
    :crest-marks="NO_CRESTS"
    @toggle="toggle"
    @play="play"
  />
</template>
