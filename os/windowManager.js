import { makeDraggable, makeResizable } from "./utils.js";

let maxZi = 100;

export function createWindow(title, content, minWidth = 200, minHeight = 200, resizeable = false) {
    const window = document.createElement('div');
    window.className = 'window';
    window.id = title;

    window.style.zIndex = maxZi++;

    window.dataset.resizeable = resizeable ? 'true' : 'false';

    window.style.width = `${minWidth}px`;
    window.style.height = `${minHeight}px`;

    // window header
    const header = document.createElement('div');
    header.className = 'window-header';

    const headerTitle = document.createElement('div');
    headerTitle.textContent = title;

    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'window-control-buttons';

    // close button
    const closeButton = document.createElement('div');
    closeButton.className = 'window-close';
    closeButton.textContent = 'X';
    buttonContainer.appendChild(closeButton);

    header.appendChild(headerTitle);
    header.appendChild(buttonContainer);

    // window content
    const contentDiv = document.createElement('div');
    contentDiv.className = 'window-content';

    if (typeof content === 'string') {
        contentDiv.textContent = content;
    } else if (content instanceof HTMLElement) {
        contentDiv.appendChild(content);
    }

    window.appendChild(header);
    window.appendChild(contentDiv);

    document.body.appendChild(window);

    function centerWindow() {
        const windowWidth = window.offsetWidth;
        const windowHeight = window.offsetHeight;
        const screenWidth = window.ownerDocument.documentElement.clientWidth;
        const screenHeight = window.ownerDocument.documentElement.clientHeight;

        const left = (screenWidth - windowWidth) / 2;
        const top = (screenHeight - windowHeight) / 2;

        window.style.left = `${left}px`;
        window.style.top = `${top}px`;
    }

    setTimeout(centerWindow, 0); // brief delay to ensure rendering

    makeDraggable([window]);

    if (resizeable) {
        makeResizable(window, minHeight, minWidth);
    }

    closeButton.addEventListener('click', () => {
        document.body.removeChild(window);
    });

    window.addEventListener('mousedown', bringToFront);

    return window;
}

function bringToFront(e) {
    const window = e.currentTarget;
    window.style.zIndex = maxZi++;
}