// Vite builds the game; Vitest reads the same file for the tests.
import { defineConfig } from 'vitest/config';
import vue from '@vitejs/plugin-vue';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [vue(), tailwindcss()],
  test: {
    include: ['tests/**/*.test.ts'],
    environment: 'happy-dom',
    // A local copy's .env.local may turn on placeholder play; the tests must not see it.
    env: { VITE_SAMPLE_PLAY: '' },
  },
});
