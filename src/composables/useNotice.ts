/**
 * A short message that floats up and fades (FloatingNotice.vue): a gain, a
 * loss, or a crest paying out. Used by the bank run's panel and kanji
 * mode's scout panel. The key changes with every message, so the same
 * text shown twice still plays again.
 */
import { ref } from 'vue';

export interface Notice {
  text: string;
  isGood: boolean;
  key: number;
}

export function useNotice() {
  const notice = ref<Notice | null>(null);
  return {
    notice,
    notify: (text: string, isGood: boolean) => {
      notice.value = { text, isGood, key: (notice.value?.key ?? 0) + 1 };
    },
  };
}
