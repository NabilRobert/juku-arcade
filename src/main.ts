// Entry point: mounts the game.
import { createApp } from 'vue';
import App from './App.vue';
import { i18n } from './i18n/index.ts';
import { startMusicOnFirstPress } from './sound/music.ts';
import './style.css';

createApp(App).use(i18n).mount('#app');
startMusicOnFirstPress();

// The Japanese font's rules (Kuronuri, D41) load after the page draws, so their 29 KB never holds
// it up; text shows in a system font until each character's slice arrives.
void import('./fonts/kuronuri.css');
