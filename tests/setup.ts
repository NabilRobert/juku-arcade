// Every mounted component gets the translator, in English, as the app does in main.ts.
import { config } from '@vue/test-utils';
import { beforeEach } from 'vitest';
import { i18n } from '../src/i18n/index.ts';

config.global.plugins = [i18n];

beforeEach(() => {
  i18n.global.locale.value = 'en';
});
