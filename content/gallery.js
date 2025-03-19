export function createGallery() {
    const container = document.createElement('div');
    container.id = 'wallpaper-picker';
    container.innerHTML = `
        <div class="wallpaper-options">
            <label>
                <input type="checkbox" id="toggle-brunos-text"> Hide "BrunOS" Text
            </label>
        </div>
        <div class="wallpaper-grid">
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

    const wallpaperGrid = container.querySelector('.wallpaper-grid');
    wallpapers.forEach(wallpaper => {
        const wallpaperItem = document.createElement('div');
        wallpaperItem.className = 'wallpaper-item';
        wallpaperItem.innerHTML = `
            <img src="images/bgs/${wallpaper}" alt="${wallpaper}">
        `;
        wallpaperGrid.appendChild(wallpaperItem);

        wallpaperItem.addEventListener('click', () => {
            changeWallpaper(`images/bgs/${wallpaper}`);
        });
    });

    const toggleBrunosText = container.querySelector('#toggle-brunos-text');
    toggleBrunosText.addEventListener('change', () => {
        toggleBrunosTextVisibility(toggleBrunosText.checked);
    });

    return container;
}

function changeWallpaper(imageUrl) {
    document.body.style.backgroundImage = `url('${imageUrl}')`;
}

function toggleBrunosTextVisibility(hide) {
    const brunosText = document.getElementById('background-text');
    if (brunosText) {
        brunosText.style.display = hide ? 'none' : 'block';
    }
}