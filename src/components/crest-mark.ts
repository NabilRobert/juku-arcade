/**
 * SPIKE: how a card shows its crest (roguelike/specials.ts) once the player
 * has scouted: a seal with the crest's symbol on the back (as the 塾 seal,
 * PixelSeal.vue), and the crest's colour on the back's frame and lattice
 * and on the front's frame.
 */
export interface CrestMark {
  symbol: string;
  /** The seal's ring and symbol colour (a CSS colour). */
  ink: string;
  /** The crest's colour (a CSS colour), for the card's frames and back. */
  tint: string;
}
