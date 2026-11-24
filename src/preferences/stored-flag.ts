/**
 * An on/off preference remembered in this browser (localStorage), for the
 * small switches that don't belong in the saved settings: sound muted,
 * Bunpou's hint, furigana. Plain code: a ref and localStorage need no
 * library.
 */
import { ref, type Ref } from 'vue';

export interface StoredFlag {
  isOn: Readonly<Ref<boolean>>;
  set: (isOn: boolean) => void;
}

function readFlag(key: string, fallback: boolean): boolean {
  try {
    const saved = localStorage.getItem(key);
    if (saved === 'true') return true;
    if (saved === 'false') return false;
    return fallback;
  } catch {
    return fallback;
  }
}

export function storedFlag(key: string, fallback: boolean): StoredFlag {
  const isOn = ref(readFlag(key, fallback));
  return {
    isOn,
    set: (next: boolean): void => {
      isOn.value = next;
      try {
        localStorage.setItem(key, String(next));
      } catch {
        // Storage can be blocked (a private window); the choice then lasts this visit.
      }
    },
  };
}
