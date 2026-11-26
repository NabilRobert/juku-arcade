/**
 * A palette colour's value (the --color-* tokens in style.css), for code
 * that needs a real colour rather than a CSS variable: Motion can't blend
 * between var() values when it animates a colour (GameHud's level number).
 * Reading the token keeps style.css the one place each colour is set.
 */
export type ThemeColour = 'aqua' | 'washi' | 'crimson' | 'steel' | 'lamp' | 'gold' | 'sumi';

export function themeColour(name: ThemeColour): string {
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(`--color-${name}`)
    .trim();
  // Before the stylesheet loads (or in a test page without it) there's no value; inherit instead.
  return value === '' ? 'currentColor' : value;
}
