/** Deploy settings read at build time (see .env.example). */
interface ImportMetaEnv {
  /** W2: daily play limit in minutes, for schools where minors play. Unset means no limit. */
  readonly VITE_DAILY_CAP_MINUTES?: string;
}
