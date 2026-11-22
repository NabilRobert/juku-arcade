// Entry point: mounts the game.
import { createApp } from 'vue';
import App from './App.vue';
import './style.css';

createApp(App).mount('#app');

// The Japanese font's rules (Kuronuri, D41) load after the page draws, so their 29 KB never holds
// it up; text shows in a system font until each character's slice arrives.
void import('./fonts/kuronuri.css');
