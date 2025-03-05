export function createGallery() {
    const container = document.createElement('div');
    container.id = 'wallpaper-picker';
    container.innerHTML = `
        <div class="wallpaper-grid">
            <!-- Wallpaper thumbnails will be added here -->
        </div>
    `;

    // Add wallpapers to the grid
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

        // Add click event to change the wallpaper
        wallpaperItem.addEventListener('click', () => {
            changeWallpaper(`images/bgs/${wallpaper}`);
        });
    });

    return container;
}

// Function to change the desktop background
function changeWallpaper(imageUrl) {
    document.body.style.backgroundImage = `url('${imageUrl}')`;
    // desktop.body.style.backgroundSize = 'cover';
    // desktop.body.style.backgroundPosition = 'center';
}