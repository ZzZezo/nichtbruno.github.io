export function createFirePong(title, gameUrl) {
    const window = document.createElement('div');
    window.className = 'window';

    const loadingHTML = `
        <div class="window-header">${title} - Loading...</div>
        <div class="window-content" style="display: flex; justify-content: center; align-items: center;">
            <div class="loading-container">
                <div class="loading-bar">
                    <div class="loading-progress"></div>
                </div>
                <p>Loading game assets...</p>
            </div>
        </div>
    `;

    window.innerHTML = loadingHTML;

    setTimeout(() => {
        loadGame(gameUrl, window);
    }, 100);

    return window;
}

async function loadGame(gameUrl, windowElement) {
    try {
        updateProgress(0, 'Downloading...');

        const response = await fetch(gameUrl);
        const gameHTML = await response.text();

        updateProgress(50, "Initializing...");

        const content = windowElement.querySelector('.window-content');
        content.innerHTML = gameHTML;

        updateProgress(100, "Ready!");

        // initializeEmbeddedGame(content);
    } catch (error) {
        console.error('Failed to load game:', error);
    }
}

function updateProgress(percent, text) {
    const progress = document.querySelector('.loading-progress');
    const status = document.querySelector('.loading-status');
    
    if (progress) progress.style.width = percent + '%';
    if (status) status.textContent = text;
}