/** Deploy settings read at build time (see .env.example). */
interface ImportMetaEnv {
  /** W2: daily play limit in minutes, for schools where minors play. Unset means no limit. */
  readonly VITE_DAILY_CAP_MINUTES?: string;
  /**
   * A private picture for the table instead of the swirl, under public/
   * (kept out of git in public/local/). For a local copy only; unset in
   * any public build.
   */
  readonly VITE_TABLE_IMAGE?: string;
  /**
   * '1' shows placeholder play in the streak and calendar (sample-play.ts),
   * for a local copy only; unset in any public build.
   */
  readonly VITE_SAMPLE_PLAY?: string;
}
