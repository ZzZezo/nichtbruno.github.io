import { createDraggableWindow } from './os/windowManager.js';
import { makeDraggable } from './os/windowUtils.js';
import { createPingPongGame } from './content/pingpongGame.js';
import { createClock } from './content/clock.js';
import { createCountdown } from './content/countdown.js';
import { createGallery } from './content/gallery.js';
import { createAbout } from './content/about.js';
import { createTimer } from './content/timer.js';

// Make icons draggable
const shortcutElements = document.querySelectorAll('.shortcut');
makeDraggable(shortcutElements);

// Add double-click event listeners to icons
document.getElementById('computer').addEventListener('dblclick', () => {
    createDraggableWindow('About', createAbout(), 400, 350, true);
});

document.getElementById('pingpong').addEventListener('dblclick', () => {
    createDraggableWindow('Ping Pong', createPingPongGame(), 605, 435, true);
});

document.getElementById('clock').addEventListener('dblclick', () => {
    createDraggableWindow('Clock', createClock(), 400, 425, true);
});

document.getElementById('countdown').addEventListener('dblclick', () => {
    createDraggableWindow('Countdown', createCountdown(), 200, 145);
});

document.getElementById('gallery').addEventListener('dblclick', () => {
    createDraggableWindow('Gallery', createGallery(), 300, 300);
});

document.getElementById('timer').addEventListener('dblclick', () => {
    createDraggableWindow('Timer', createTimer(), 300, 260, true);
});

// External
document.getElementById('chatgpt').addEventListener('dblclick', () => {
    window.open("https://chatgpt.com", "_blank");
});

document.getElementById('deepseek').addEventListener('dblclick', () => {
    window.open("https://deepseek.com", "_blank");
});

document.getElementById('claude').addEventListener('dblclick', () => {
    window.open("https://claude.ai/new", "_blank");
});

document.getElementById('google').addEventListener('dblclick', () => {
    window.open("https://google.com", "_blank");
});

document.getElementById('cc').addEventListener('dblclick', () => {
    window.open("https://creativecommons.org/licenses/by-sa/4.0/", "_blank");
});

document.getElementById('github').addEventListener('dblclick', () => {
    window.open("https://github.com/nichtbruno", "_blank");
});

document.getElementById('perplexity').addEventListener('dblclick', () => {
    window.open("https://www.perplexity.ai/", "_blank");
});