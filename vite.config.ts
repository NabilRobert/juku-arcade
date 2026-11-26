// Vite builds the game; Vitest reads the same file for the tests.
import { defineConfig } from 'vitest/config';
import vue from '@vitejs/plugin-vue';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [vue(), tailwindcss()],
  // vue-i18n's build flags: Composition API only (no legacy API in the bundle), no devtools.
  define: {
    __VUE_I18N_FULL_INSTALL__: true,
    __VUE_I18N_LEGACY_API__: false,
    __INTLIFY_PROD_DEVTOOLS__: false,
  },
  test: {
    include: ['tests/**/*.test.ts'],
    environment: 'happy-dom',
    // Installs the translator on every mounted component, in English.
    setupFiles: ['tests/setup.ts'],
    // A local copy's .env.local may turn on placeholder play; the tests must not see it.
    env: { VITE_SAMPLE_PLAY: '' },
  },
});
