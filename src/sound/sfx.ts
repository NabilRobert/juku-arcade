/**
 * The game's sound effects, made in code by ZzFX (no audio files to host
 * or license). Each sound is a list of ZzFX's synth settings; they were
 * shaped by ear and are the place to change how the game sounds.
 *
 * ZzFX opens an AudioContext as soon as it loads, and browsers only allow
 * sound after the player has touched the page, so it's loaded on the first
 * sound, which always follows a tap or a drag. Muting is remembered in
 * this browser only (localStorage): a classroom may need it off.
 */
import { ref } from 'vue';

/**
 * ZzFX settings, in its order: volume, randomness, frequency, attack,
 * sustain, release, shape (0 sine, 1 triangle, 2 saw, 4 noise), shape
 * curve, slide, delta slide, pitch jump, pitch jump time, repeat time,
 * noise, modulation, bit crush, delay, sustain volume, decay.
 */
type SoundSettings = (number | undefined)[];

/* eslint-disable no-sparse-arrays -- ZzFX's own format leaves settings it doesn't need empty. */
const SOUNDS = {
  /** Picking a card up: a short papery tick. */
  pickUp: [0.5, 0.05, 1400, , 0.005, 0.03, 4, 2],
  /** A held card over a word card: a soft click. */
  aim: [0.25, 0, 1800, , , 0.02, 1],
  /** Letting a thrown card fly: a swish of air. */
  whoosh: [0.35, 0.05, 320, 0.03, 0.05, 0.16, 4, 1, -3],
  /** The thrown card hitting its word card: a slap. */
  slap: [1, 0.05, 160, , 0.01, 0.09, 4, 2, , , , , , 2],
  /** The chime on each match; its pitch climbs with the combo. */
  chime: [0.55, 0, 660, , 0.02, 0.3, 1, 2, , , , , , , , , , 0.5, 0.06],
  /** A wrong pair or a timeout: a low buzz sliding down. */
  miss: [0.6, 0.05, 140, , 0.06, 0.28, 2, 1.5, -2],
  /** The level going up: a quick rising arpeggio. */
  levelUp: [0.6, 0, 523, , 0.04, 0.35, 1, 2, , , 262, 0.06, 0.06],
  /** A set cleared: a bright, longer chime. */
  cleared: [0.6, 0, 784, 0.01, 0.12, 0.5, 1, 2, , , 196, 0.1, , , , , 0.1, 0.6],
} satisfies Record<string, SoundSettings>;
/* eslint-enable no-sparse-arrays */

export type SoundName = keyof typeof SOUNDS;

/**
 * Steps of the major pentatonic scale, in semitones: each match in a combo
 * chimes the next note, so a long combo climbs a tune instead of
 * repeating one note. Past the top it stays there.
 */
const COMBO_STEPS = [0, 2, 4, 7, 9, 12, 14, 16, 19, 21, 24];
const SEMITONES_PER_OCTAVE = 12;
const MUTED_KEY = 'juku-arcade:muted';

/** The playback speed that raises a sound by the note for this combo. */
export function comboPitch(combo: number): number {
  const step = COMBO_STEPS[Math.min(Math.max(combo - 1, 0), COMBO_STEPS.length - 1)] ?? 0;
  return 2 ** (step / SEMITONES_PER_OCTAVE);
}

function readMuted(): boolean {
  try {
    return localStorage.getItem(MUTED_KEY) === 'true';
  } catch {
    return false;
  }
}

export const isMuted = ref(readMuted());

export function setMuted(muted: boolean): void {
  isMuted.value = muted;
  try {
    localStorage.setItem(MUTED_KEY, String(muted));
  } catch {
    // Storage can be blocked (a private window); muting still works until reload.
  }
}

type Player = (name: SoundName, pitch: number) => void;
let player: Promise<Player> | null = null;

async function loadPlayer(): Promise<Player> {
  const { ZZFXSound } = await import('zzfx');
  const built = new Map<SoundName, InstanceType<typeof ZZFXSound>>();
  return (name, pitch) => {
    let sound = built.get(name);
    if (sound === undefined) {
      sound = new ZZFXSound([...SOUNDS[name]]);
      built.set(name, sound);
    }
    sound.play(1, pitch);
  };
}

/** Plays a sound unless muted; `pitch` is a playback speed (2 is an octave up). */
export function playSound(name: SoundName, pitch = 1): void {
  if (isMuted.value || typeof AudioContext === 'undefined') return;
  player ??= loadPlayer();
  player
    .then((play) => play(name, pitch))
    .catch((error: unknown) => console.warn('Sound could not play:', error));
}
