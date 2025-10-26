import { createAbout } from "./content/about.js";
import { createBrowse } from "./content/browse.js";
import { createClock } from "./content/clock.js";
import { applyBackgroundSize, createGallery } from "./content/gallery.js";
import { createTimer } from "./content/timer.js";
import { createJumpAndRun } from "./games/fakeJumpnRun.js";
import { createPingPongGame } from "./games/fakePingPong.js";
import { generateShortcuts } from "./os/shortcutManager.js";
import { makeDraggable } from "./os/windowUtils.js";
import { createGameWindow, createWindow } from "./os/windowManager.js";
import { createFirePong } from "./games/firepongLoader.js";

const savedWallpaper = localStorage.getItem('selectedWallpaper');
const currentFit = localStorage.getItem('wallpaperFit') || 'cover';
document.body.style.backgroundImage = `url('${savedWallpaper}')`;
document.body.style.backgroundSize = currentFit;
applyBackgroundSize(currentFit);

generateShortcuts();

const APP_REGISTRY = {
    about: {title: "About", fn: createAbout, width: 420, height: 442},
    gallery: {title: "Gallery", fn: createGallery, width: 500, height: 432},
    license: 'https://creativecommons.org/licenses/by-sa/4.0/',
    github: 'https://github.com/nichtbruno',
    clock: {title: "Clock", fn: createClock, width: 400, height: 432},
    timer: {title: "Timer", fn: createTimer, width: 520, height: 367},
    browse: {title: "Browse", fn: createBrowse, width: 600, height: 522, resizeable: true},
    pingpong: {title: "Pingpong", fn: createPingPongGame, width: 605, height: 435},
    // firepong: {title: "Fire Pong", gameUrl: "./games/firepong/firepong.html", width: 605, height: 435},
    jumpnrun: {title: "Jumpnrun", fn: createJumpAndRun, width: 800, height: 530},
}

document.body.addEventListener('dblclick', (e) => {
    const shortcut = e.target.closest('.shortcut');
    if (!shortcut) return;

    const appId = shortcut.id;
    const config = APP_REGISTRY[appId];

    if (!config) return;

    if (typeof config === 'string') {
        window.open(config, '_blank');
    } else if (config.gameUrl) {
        createGameWindow(
            config.title,
            config.gameUrl,
            config.width,
            config.height,
        );
    } else if (config.fn) {
        createWindow(
            config.title,
            config.fn(),
            config.width,
            config.height,
            config.resizeable,
        );
    }
});

const shortcutElements = document.querySelectorAll('.shortcut');
makeDraggable(shortcutElements);