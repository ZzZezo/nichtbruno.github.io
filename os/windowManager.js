import { cleanupDraggable, makeDraggable, makeResizable } from "./windowUtils.js";

let maxZi = 100;

export function createWindow(title, content, minWidth = 200, minHeight = 200, resizeable = false) {
    const fragment = document.createDocumentFragment();
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

    fragment.appendChild(window);
    document.body.appendChild(fragment);

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
        let resizeTimeout;
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            makeResizable(window, minHeight, minWidth);
        }, 100);
    }

    closeButton.addEventListener('click', () => {
        // stop games
        const content = window.querySelector('.window-content');
        const gameContainer = content.firstChild;

        if (gameContainer?.cleanup) {
            gameContainer.cleanup();
        }

        cleanupDraggable(window);
        document.body.removeChild(window);
    });

    window.addEventListener('mousedown', bringToFront);

    return window;
}

function bringToFront(e) {
    const window = e.currentTarget;
    window.style.zIndex = maxZi++;
}

export function createGameWindow(title, gameUrl, width, height) {
    const window = createWindow(title, '', width, height);
    const content = window.querySelector('.window-content');
    
    // Loading screen
    // const loadingHTML = `
    //     <div class="loading-container">
    //         <div class="loading-bar">
    //             <div class="loading-progress" style="width: 0%"></div>
    //         </div>
    //         <p class="loading-status">Initializing...</p>
    //     </div>
    // `;
    
    // content.innerHTML = loadingHTML;
    // content.appendChild(iframe);

    // loadGame(gameUrl, content);

    const iframe = document.createElement('iframe');
    iframe.src = gameUrl;
    iframe.style.width = '100%';
    iframe.style.height = '100%';
    iframe.style.border = 'none';
    
    content.innerHTML = '';
    content.appendChild(iframe);
    
    return window;
}

async function loadGame(gameUrl, contentElement) {
    const progressBar = contentElement.querySelector('.loading-progress');
    const statusText = contentElement.querySelector('.loading-status');
    
    try {
        // Phase 1: Download HTML
        updateProgress(10, 'Downloading game...', progressBar, statusText);
        const response = await fetch(gameUrl);
        const html = await response.text();
        
        // Phase 2: Parse and load dependencies
        updateProgress(30, 'Loading engine...', progressBar, statusText);
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;
        
        // Extract script sources
        const scripts = tempDiv.querySelectorAll('script[src]');
        for (let script of scripts) {
            await loadScript(script.src, (loaded, total) => {
                const percent = 30 + (loaded / total) * 50;
                updateProgress(percent, 'Loading assets...', progressBar, statusText);
            });
        }
        
        // Phase 3: Inject game
        updateProgress(90, 'Starting game...', progressBar, statusText);
        contentElement.innerHTML = html;
        
        // Phase 4: Wait for game to initialize
        setTimeout(() => {
            updateProgress(100, 'Ready!', progressBar, statusText);
            // Hide loading bar after a moment
            setTimeout(() => {
                const loadingEl = contentElement.querySelector('.loading-container');
                if (loadingEl) loadingEl.style.display = 'none';
            }, 500);
        }, 1000);
        
    } catch (error) {
        console.error('Game loading failed:', error);
        contentElement.innerHTML = `
            <div style="color: white; text-align: center; padding: 50px;">
                <h3>Failed to load game</h3>
                <p>${error.message}</p>
                <button onclick="window.location.reload()">Retry</button>
            </div>
        `;
    }
}

function loadScript(src, progressCallback) {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', src, true);
        xhr.responseType = 'blob';
        
        xhr.onprogress = (e) => {
            if (e.lengthComputable) {
                progressCallback(e.loaded, e.total);
            }
        };
        
        xhr.onload = () => {
            const blob = xhr.response;
            const script = document.createElement('script');
            const url = URL.createObjectURL(blob);
            script.src = url;
            script.onload = () => {
                URL.revokeObjectURL(url);
                resolve();
            };
            document.head.appendChild(script);
        };
        
        xhr.onerror = reject;
        xhr.send();
    });
}

function updateProgress(percent, text, progressBar, statusText) {
    if (progressBar) progressBar.style.width = percent + '%';
    if (statusText) statusText.textContent = text;
}