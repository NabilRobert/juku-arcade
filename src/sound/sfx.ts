/**
 * The game's sound effects. Most are made in code by ZzFX: each is a list
 * of ZzFX's synth settings, shaped by ear. The card sounds (a shuffle when
 * a set is dealt, a short flick of it when a card is picked, a slap when
 * it lands)
 * are recordings from Kenney's Casino Audio pack (CC0, public/sounds/),
 * because paper is hard to fake; if a recording can't load or play, its
 * synth sound plays instead.
 *
 * ZzFX opens an AudioContext as soon as it loads, and browsers only allow
 * sound after the player has touched the page, so it's loaded on the first
 * sound, which always follows a tap or a drag. Muting is remembered in
 * this browser only (localStorage): a classroom may need it off.
 */
import { ref } from 'vue';
import { storedVolume } from './volume.ts';

/**
 * ZzFX settings, in its order: volume, randomness, frequency, attack,
 * sustain, release, shape (0 sine, 1 triangle, 2 saw, 4 noise), shape
 * curve, slide, delta slide, pitch jump, pitch jump time, repeat time,
 * noise, modulation, bit crush, delay, sustain volume, decay.
 */
type SoundSettings = (number | undefined)[];

/* eslint-disable no-sparse-arrays -- ZzFX's own format leaves settings it doesn't need empty. */
const SOUNDS = {
  /** A new set dealt (recorded; this is the fallback): a swish. */
  deal: [0.35, 0.05, 320, 0.03, 0.05, 0.16, 4, 1, -3],
  /** Picking a card up (recorded; this is the fallback): a short papery tick. */
  pickUp: [0.5, 0.05, 1400, , 0.005, 0.03, 4, 2],
  /** A held card over a word card: a soft click. */
  aim: [0.25, 0, 1800, , , 0.02, 1],
  /**
   * Pressing a button: a short, soft 8-bit pip, in the style of handheld
   * game menus (chosen by ear from four candidates, D49).
   */
  click: [0.3, 0, 988, 0, 0.03, 0.05, 1, 1],
  /** Letting a thrown card fly: a swish of air. */
  whoosh: [0.35, 0.05, 320, 0.03, 0.05, 0.16, 4, 1, -3],
  /** The thrown card hitting its word card (recorded; this is the fallback): a slap. */
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

/** Recorded sounds, by the sound they replace; one variant is picked at random each time. */
export const RECORDINGS: Partial<Record<SoundName, string[]>> = {
  deal: ['card-shuffle.ogg'],
  pickUp: ['card-shuffle.ogg'],
  slap: ['card-place-1.ogg', 'card-place-2.ogg'],
};
/**
 * How loud the effects play. They must sit clearly above the background
 * music (music.ts, D50), so ZzFX's master volume is doubled from its 0.3
 * default, and the recordings, which are louder than the synth sounds,
 * are evened out with them.
 */
export const SYNTH_VOLUME = 0.6;
export const RECORDING_VOLUME = 0.9;

/** The effects slider (0 is off), on top of those levels; it starts at full. */
const effects = storedVolume('juku-arcade:effects-volume', 1);
export const effectsVolume = effects.volume;
export const setEffectsVolume = effects.set;
/**
 * The shuffle recording runs 3 s. A deal plays its first riffle; picking a
 * card plays just its first flick, so it's over before the next pick.
 * Each fades out over its last FADE_OUT_S (or half its length, if shorter).
 */
const RECORDING_MAX_S: Partial<Record<SoundName, number>> = { deal: 1.2, pickUp: 0.4 };
const DEFAULT_RECORDING_MAX_S = 1.2;
const FADE_OUT_S = 0.25;

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

type Player = (name: SoundName, pitch: number) => Promise<void>;
let player: Promise<Player> | null = null;

/** Fetches and decodes each recording once; a failed one stays failed, so its synth sound plays. */
function recordingLoader(context: AudioContext): (file: string) => Promise<AudioBuffer> {
  const buffers = new Map<string, Promise<AudioBuffer>>();
  return (file) => {
    let buffer = buffers.get(file);
    if (buffer === undefined) {
      buffer = fetch(`${import.meta.env.BASE_URL}sounds/${file}`)
        .then((response) => response.arrayBuffer())
        .then((data) => context.decodeAudioData(data));
      buffers.set(file, buffer);
    }
    return buffer;
  };
}

function playBuffer(context: AudioContext, buffer: AudioBuffer, pitch: number, maxS: number): void {
  const source = context.createBufferSource();
  const gain = context.createGain();
  source.buffer = buffer;
  source.playbackRate.value = pitch;
  const length = Math.min(buffer.duration, maxS);
  const fade = Math.min(FADE_OUT_S, length / 2);
  const now = context.currentTime;
  const volume = RECORDING_VOLUME * effectsVolume.value;
  gain.gain.setValueAtTime(volume, now);
  gain.gain.setValueAtTime(volume, now + length - fade);
  gain.gain.linearRampToValueAtTime(0, now + length);
  source.connect(gain).connect(context.destination);
  source.start(now, 0, length);
}

async function loadPlayer(): Promise<Player> {
  const { ZZFX, ZZFXSound } = await import('zzfx');
  ZZFX.volume = SYNTH_VOLUME;
  const built = new Map<SoundName, InstanceType<typeof ZZFXSound>>();
  const loadRecording = recordingLoader(ZZFX.audioContext);
  const playSynth = (name: SoundName, pitch: number): void => {
    let sound = built.get(name);
    if (sound === undefined) {
      sound = new ZZFXSound([...SOUNDS[name]]);
      built.set(name, sound);
    }
    sound.play(effectsVolume.value, pitch);
  };
  return async (name, pitch) => {
    const files = RECORDINGS[name];
    const file = files?.[Math.floor(Math.random() * files.length)];
    if (file === undefined) return playSynth(name, pitch);
    try {
      const maxS = RECORDING_MAX_S[name] ?? DEFAULT_RECORDING_MAX_S;
      playBuffer(ZZFX.audioContext, await loadRecording(file), pitch, maxS);
    } catch {
      playSynth(name, pitch);
    }
  };
}

/** Plays a sound unless muted or the effects are off; `pitch` is a playback speed (2 is an octave up). */
export function playSound(name: SoundName, pitch = 1): void {
  if (isMuted.value || effectsVolume.value === 0 || typeof AudioContext === 'undefined') return;
  player ??= loadPlayer();
  player
    .then((play) => play(name, pitch))
    .catch((error: unknown) => console.warn('Sound could not play:', error));
}
