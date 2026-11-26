/**
 * This browser's localStorage, without ever throwing. Storage can be
 * blocked (a private window, a strict browser setting): reads then give
 * nothing, and writes are dropped, so what they kept lasts only this
 * visit. Every preference, best score and reminder goes through here, so
 * the try/catch lives in one place.
 */

export function readStored(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function writeStored(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Blocked storage: this visit keeps the value in memory only.
  }
}

/** A JSON value kept under `key`, or `fallback` when there's none or it can't be read. */
export function readStoredJson<T>(key: string, fallback: T): T {
  const saved = readStored(key);
  if (saved === null) return fallback;
  try {
    return JSON.parse(saved) as T;
  } catch {
    return fallback;
  }
}

/** A best score kept under `key`: 0 before any. */
export function readStoredBest(key: string): number {
  const best = Number(readStored(key) ?? 0);
  return Number.isFinite(best) ? best : 0;
}

/** Keeps a score under `key` if it beats the best there; true when it did. */
export function recordStoredBest(key: string, score: number): boolean {
  if (score <= readStoredBest(key)) return false;
  writeStored(key, String(score));
  return true;
}
