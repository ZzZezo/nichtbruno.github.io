export function createGallery() {
    const container = document.createElement('div');
    container.id = 'wallpaper-picker';
    container.className = 'retro-gallery';
    container.innerHTML = `
        <div class="retro-controls">
            <div class="toggle-container">
                <label class="retro-toggle">
                    <input type="checkbox" id="toggle-brunos-text">
                    <span class="toggle-slider"></span>
                    <span class="toggle-label">Desktop Text:</span>
                    <span class="toggle-status">Visible</span>
                </label>
            </div>
        </div>
        <div class="retro-wallpaper-grid">
            <!-- Wallpaper thumbnails will be added here -->
        </div>
    `;

    const wallpapers = [
        'bg.jpg',
        'field_bg.jpg',
        'texture_bg.jpg',
        'magic.jpg',
        'pipes.png',
        'shiny-colors.png',
        'sunset-xfksfuywx.png',
        'swirls.png',
        'wallhaven-rrpvd7.png',
        'waves_dracula_flipped.png',
    ];

    const wallpaperGrid = container.querySelector('.retro-wallpaper-grid');
    
    wallpapers.forEach(wallpaper => {
        const wallpaperItem = document.createElement('div');
        wallpaperItem.className = 'retro-wallpaper-item';
        wallpaperItem.innerHTML = `
            <div class="retro-thumbnail">
                <img src="images/bgs/${wallpaper}" alt="${wallpaper}">
            </div>
            <div class="retro-filename">${wallpaper}</div>
        `;

        wallpaperItem.addEventListener('click', () => {
            changeWallpaper(`images/bgs/${wallpaper}`);
            // Remove previous selection
            container.querySelectorAll('.retro-wallpaper-item').forEach(item => {
                item.classList.remove('selected');
            });
            wallpaperItem.classList.add('selected');
        });

        wallpaperGrid.appendChild(wallpaperItem);
    });

    const toggleBrunosText = container.querySelector('#toggle-brunos-text');
    toggleBrunosText.addEventListener('change', () => {
        toggleBrunosTextVisibility(toggleBrunosText.checked);
        localStorage.setItem('hideBrunosText', toggleBrunosText.checked);
        const status = container.querySelector('.toggle-status');
        status.textContent = toggleBrunosText.checked ? 'Hidden' : 'Visible';
    });

    return container;
}

function changeWallpaper(imageUrl) {
    document.body.style.backgroundImage = `url('${imageUrl}')`;
    localStorage.setItem('selectedWallpaper', imageUrl);
}

function toggleBrunosTextVisibility(hide) {
    const brunosText = document.getElementById('background-text');
    if (brunosText) {
        brunosText.style.display = hide ? 'none' : 'block';
    }
}
