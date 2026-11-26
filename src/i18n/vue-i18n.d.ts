// Gives `t()` the English message shape, so a key that doesn't exist is a type error.
import type { Messages } from './en/index.ts';

declare module 'vue-i18n' {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type -- vue-i18n's documented way to type its messages
  export interface DefineLocaleMessage extends Messages {}
}
