/**
 * The localStorage keys of the player's preferences, in one list beside the
 * progress keys (memory/progress-keys.ts). Preferences aren't progress, so
 * "Delete my data" keeps them; listing them here means no key is typed out
 * twice, and a new one can't clash with another.
 */

export const PREFERENCE_KEYS = {
  bunpouHints: 'juku-arcade:bunpou-hints',
  furigana: 'juku-arcade:furigana',
  leaderboardFolded: 'juku-arcade:leaderboard-folded',
  streakFolded: 'juku-arcade:streak-folded',
  samplePlay: 'juku-arcade:sample-play',
  musicVolume: 'juku-arcade:music-volume',
  effectsVolume: 'juku-arcade:effects-volume',
  muted: 'juku-arcade:muted',
  language: 'juku-arcade:language',
} as const;
