import { createDraggableWindow } from './os/windowManager.js';
import { makeDraggable } from './os/windowUtils.js';
import { createShortcuts } from './os/shortcutManager.js';
import { createPingPongGame } from './content/pingpongGame.js';
import { createClock } from './content/clock.js';
import { createCountdown } from './content/countdown.js';
import { createGallery } from './content/gallery.js';
import { createAbout } from './content/about.js';
import { createTimer } from './content/timer.js';
import { createJumpNRun } from './content/jumpnrun.js';

const hideText = localStorage.getItem('hideBrunosText') === 'true';
document.getElementById('background-text').style.display = hideText ? 'none' : 'block';
const savedWallpaper = localStorage.getItem('selectedWallpaper');
document.body.style.backgroundImage = `url('${savedWallpaper}')`;

const APP_REGISTRY = {
    changelog: {title: "Changelog", fn: createAbout, width: 400, height: 350, ls: true},
    about: {title: "About", fn: createAbout, width: 400, height: 350, ls: true},
    pingpong: {title: "Ping Pong", fn: createPingPongGame, width: 605, height: 435, ls: true},
    jumpnrun: {title: "Jump N Run", fn: createJumpNRun, width: 800, height: 600, ls: true},
    clock: {title: "Clock", fn: createClock, width: 400, height: 425, ls: true},
    countdown: {title: "Countdown", fn: createCountdown, width: 200, height: 145, ls: false},
    gallery: {title: "Gallery", fn: createGallery, width: 500, height: 415, ls: true},
    timer: {title: "Timer", fn: createTimer, width: 300, height: 260, ls: true},
    cdplayer: {title: "CD Player", fn: createTimer, width: 300, height: 260, ls: true},
    chatgpt: 'https://chatgpt.com',
    deepseek: 'https://deepseek.com',
    claude: 'https://claude.ai/new',
    google: 'https://google.com',
    cc: 'https://creativecommons.org/licenses/by-sa/4.0/',
    github: 'https://github.com/nichtbruno',
    perplexity: 'https://www.perplexity.ai/',
}

createShortcuts();

document.body.addEventListener('dblclick', (e) => {
    const shortcut = e.target.closest('.shortcut');
    if (!shortcut) return;

    const appId = shortcut.id;
    const config = APP_REGISTRY[appId];

    if (!config) return;

    if (typeof config === 'string') {
        window.open(config, '_blank');
    } else if (config.fn) {
        createDraggableWindow(
            config.title,
            config.fn(),
            config.width,
            config.height,
            config.ls,
        );
    }
});

const shortcutElements = document.querySelectorAll('.shortcut');
makeDraggable(shortcutElements);