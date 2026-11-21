// Types for the parts of ZzFX the game uses; the package ships plain JavaScript.
declare module 'zzfx' {
  export const ZZFX: { audioContext: AudioContext; volume: number };
  export class ZZFXSound {
    constructor(settings?: (number | undefined)[]);
    play(volume?: number, pitch?: number, randomness?: number, pan?: number, loop?: boolean): void;
  }
}
