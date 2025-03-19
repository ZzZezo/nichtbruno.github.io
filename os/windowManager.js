import { makeDraggable, makeResizable } from './windowUtils.js';

export function createDraggableWindow(title, content, minWidth = 300, minHeight = 200, lockedSize = false, lockedPos = false) {
    // Create window div
    const window = document.createElement('div');
    window.className = 'window';

    // Add locked attribute if needed
    if (lockedSize) {
        window.dataset.lockedSize = 'true';
    }
    if (lockedPos) {
        window.dataset.lockedPos = 'true';
    }

    window.style.width = `${minWidth}px`;
    window.style.height = `${minHeight}px`;

    // Store original size and position for restoring from fullscreen
    let originalSize = { width: '300px', height: '200px' };
    let originalPosition = { left: '0px', top: '0px' };

    // Create window header
    const header = document.createElement('div');
    header.className = 'window-header';

    const headerTitle = document.createElement('h3');
    headerTitle.textContent = title;

    // Create a container for the control buttons
    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'window-control-buttons';

    // Create the maximize button (only for unlocked windows)
    let maximizeButton;
    if (!lockedSize) {
        maximizeButton = document.createElement('div');
        maximizeButton.className = 'window-maximize';
        maximizeButton.textContent = '🗖'; // Maximize symbol
        buttonContainer.appendChild(maximizeButton);
    }

    // Create the close button
    const closeButton = document.createElement('div');
    closeButton.className = 'window-close';
    closeButton.textContent = 'X';
    buttonContainer.appendChild(closeButton);

    // Add title, locked indicator, and button container to the header
    header.appendChild(headerTitle);
    header.appendChild(buttonContainer);

    // Create window content
    const contentDiv = document.createElement('div');
    contentDiv.className = 'window-content';

    // Append the content to the window
    if (typeof content === 'string') {
        contentDiv.textContent = content;
    } else if (content instanceof HTMLElement) {
        contentDiv.appendChild(content);
    }

    // Assemble window
    window.appendChild(header);
    window.appendChild(contentDiv);

    // Add to body
    document.body.appendChild(window);

    // Center the window
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

    // Center window after a brief delay to ensure rendering
    setTimeout(centerWindow, 0);

    // Make window draggable
    makeDraggable([window]);

    // Make window resizable (if not locked)
    if (!lockedSize) {
        makeResizable(window, minHeight, minWidth);
    }

    // Close button functionality
    closeButton.addEventListener('click', () => {
        document.body.removeChild(window);
    });

    // Maximize button functionality (only for unlocked windows)
    if (maximizeButton) {
        maximizeButton.addEventListener('click', toggleFullscreen);

        // Double-click header to toggle fullscreen
        header.addEventListener('dblclick', toggleFullscreen);
    }

    // Toggle fullscreen
    function toggleFullscreen() {
        const isCurrentlyFullscreen = window.dataset.fullscreen === 'true';

        if (isCurrentlyFullscreen) {
            // Restore original size and position
            window.style.width = originalSize.width;
            window.style.height = originalSize.height;
            window.style.left = originalPosition.left;
            window.style.top = originalPosition.top;
            window.dataset.fullscreen = 'false';
            maximizeButton.textContent = '🗖';
        } else {
            // Store original size and position
            originalSize.width = window.style.width;
            originalSize.height = window.style.height;
            originalPosition.left = window.style.left;
            originalPosition.top = window.style.top;

            // Set window to fullscreen
            window.style.width = '100%';
            window.style.height = '100%';
            window.style.left = '0';
            window.style.top = '0';
            window.dataset.fullscreen = 'true';
            maximizeButton.textContent = '🗗';
        }
    }

    return window;
}