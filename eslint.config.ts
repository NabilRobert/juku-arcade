// Lint rules, including the size and complexity limits from the workspace
// CLAUDE.md ("Keep it lean while writing"), enforced in CI.
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import vue from 'eslint-plugin-vue';
import prettier from 'eslint-config-prettier';
import globals from 'globals';

export default tseslint.config(
  { ignores: ['dist/', 'coverage/', 'public/decks/', 'data/'] },
  js.configs.recommended,
  ...tseslint.configs.strict,
  ...vue.configs['flat/recommended'],
  {
    files: ['**/*.vue'],
    languageOptions: { parserOptions: { parser: tseslint.parser } },
  },
  {
    languageOptions: { globals: { ...globals.browser, ...globals.node } },
    rules: {
      complexity: ['error', 10],
      'max-depth': ['error', 3],
      'max-lines-per-function': ['error', { max: 40, skipBlankLines: true, skipComments: true }],
      'max-lines': ['error', { max: 300, skipBlankLines: true, skipComments: true }],
    },
  },
  {
    // Every visible word goes through the translator (D73): bare text in a
    // template is an error. Allowed as-is: punctuation and symbols, names that
    // don't translate (the brand, data sources, the licence), and Japanese,
    // which is what the game teaches.
    files: ['src/**/*.vue'],
    rules: {
      'vue/no-bare-strings-in-template': [
        'error',
        {
          allowlist: [
            ...['(', ')', ',', '.', '&', '+', '-', '=', '*', '/', '#', '%', '!', '?', ':'],
            ...['[', ']', '{', '}', '<', '>', '·', '•', '‐', '–', '—', '−', '|'],
            ...['×', '◯', '→', '―', '“', '”'],
            ...['juku-arcade', 'OpenJLPT', 'CC BY-SA 4.0', 'Tatoeba', '@nabilrobert'],
            '/^[\\p{Script=Han}\\p{Script=Hiragana}\\p{Script=Katakana}ー・！？…、。 ]+$/u',
          ],
        },
      ],
    },
  },
  {
    // A test file is one describe() block of small cases; the function-length
    // limit would count the whole block as one function.
    files: ['tests/**/*.ts'],
    rules: { 'max-lines-per-function': 'off' },
  },
  prettier,
);
