import { createDraggableWindow } from './os/windowManager.js';
import { makeDraggable } from './os/windowUtils.js';
import { createListContent } from './content/listContent.js';
import { createPingPongGame } from './content/pingpongGame.js';
import { createClock } from './content/clockExe.js';

// Make icons draggable
const shortcutElements = document.querySelectorAll('.shortcut');
makeDraggable(shortcutElements);

// Add double-click event listeners to icons
document.getElementById('computer').addEventListener('dblclick', () => {
    createDraggableWindow('Home', "This is Home", true);
});

document.getElementById('trash').addEventListener('dblclick', () => {
    createDraggableWindow('List Window', createListContent());
});

document.getElementById('pingpong').addEventListener('dblclick', () => {
    createDraggableWindow('Ping Pong', createPingPongGame(), true);
});

document.getElementById('clock').addEventListener('dblclick', () => {
    createDraggableWindow('Clock', createClock(), true, false);
});