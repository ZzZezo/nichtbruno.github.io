export function createGallery() {
    const container = document.createElement('div');
    container.id = 'wallpaper-picker';
    container.className = 'retro-gallery';
    container.innerHTML = `
        <div class="retro-controls">
            <label class="size-label">
                Wallpaper Fit:
                <select id="wallpaper-fit" class="retro-select">
                    <option value="cover">Fill Screen</option>
                    <option value="contain">Fit Screen</option>
                    <option value="stretch">Stretch</option>
                </select>
            </label>
        </div>
        <div class="retro-wallpaper-grid">
            <!-- Wallpaper thumbnails will be added here -->
        </div>
    `;

    const wallpapers = [
        'bg.jpg',
        'field_bg.jpg',
        'a.jpg',
        'abstract2.jpg',
        'blue-waves.png',
        'bmw.jpg',
        'dalek.jpg',
        'dark_skulls.png',
        'DESKTOP WALLPAPER.jpg',
        'endless-summer.jpg',
        'jupiter.png',
        'magic.jpg',
        'Minimal Wallpaper - Dark Wave Gradient 2.jpg',
        'monkey.jpg',
        'my-neighbor-totoro-sunflowers.png',
        'pipes.png',
        'rainforest.png',
        'shougan_castle.png',
        'swirls.png',
        'texture_bg.jpg',
        'yellow_kyoto.jpg',
    ];

    const wallpaperGrid = container.querySelector('.retro-wallpaper-grid');
    
    wallpapers.forEach(wallpaper => {
        const wallpaperItem = document.createElement('div');
        wallpaperItem.className = 'retro-wallpaper-item';
        wallpaperItem.innerHTML = `
            <div class="retro-thumbnail">
                <img src="/assets/images/bgs/${wallpaper}" alt="${wallpaper}">
            </div>
            <div class="retro-filename">${wallpaper}</div>
        `;

        wallpaperItem.addEventListener('click', () => {
            changeWallpaper(`/assets/images/bgs/${wallpaper}`);
            // Remove previous selection
            container.querySelectorAll('.retro-wallpaper-item').forEach(item => {
                item.classList.remove('selected');
            });
            wallpaperItem.classList.add('selected');
        });

        wallpaperGrid.appendChild(wallpaperItem);
    });

    const existingCustom = localStorage.getItem('customWallpaper');
    if (existingCustom) {
        const customItem = createCustomWallpaperItem(existingCustom);
        wallpaperGrid.appendChild(customItem);
    }

    const uploadItem = createUploadItem();
    wallpaperGrid.appendChild(uploadItem);

    const fitSelect = container.querySelector('#wallpaper-fit');
    const savedFit = localStorage.getItem('wallpaperFit') || 'cover';
    fitSelect.value = savedFit;
    applyBackgroundSize(savedFit);

    fitSelect.addEventListener('change', () => {
        const fitValue = fitSelect.value;
        applyBackgroundSize(fitValue);
        localStorage.setItem('wallpaperFit', fitValue);
    });

    return container;
}

function createUploadItem() {
    const uploadItem = document.createElement('div');
    uploadItem.className = 'retro-wallpaper-item upload-item';
    uploadItem.innerHTML = `
        <div class="retro-thumbnail">
            <input type="file" accept="image/*" style="display: none;">
        </div>
        <div class="retro-filename">Upload Custom</div>
    `;

    const fileInput = uploadItem.querySelector('input');
    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (event) => {
                // Remove previous custom wallpaper
                const existing = document.querySelector('.custom-wallpaper-item');
                if (existing) existing.remove();
                
                // Create and add new custom item
                const customItem = createCustomWallpaperItem(event.target.result);
                uploadItem.parentNode.insertBefore(customItem, uploadItem);
                
                // Set wallpaper and save
                changeWallpaper(event.target.result);
                localStorage.setItem('customWallpaper', event.target.result);
            };
            reader.readAsDataURL(file);
        }
    });

    uploadItem.querySelector('.retro-thumbnail').addEventListener('click', () => {
        fileInput.click();
    });

    return uploadItem;
}

function createCustomWallpaperItem(imageUrl) {
    const item = document.createElement('div');
    item.className = 'retro-wallpaper-item custom-wallpaper-item';
    item.innerHTML = `
        <div class="retro-thumbnail">
            <img src="${imageUrl}" alt="Custom Wallpaper">
        </div>
        <div class="retro-filename">Custom Wallpaper</div>
    `;

    item.addEventListener('click', function() {
        changeWallpaper(imageUrl);
        document.querySelectorAll('.retro-wallpaper-item').forEach(i => i.classList.remove('selected'));
        this.classList.add('selected');
    });

    return item;
}

function changeWallpaper(imageUrl) {
    const currentFit = localStorage.getItem('wallpaperFit') || 'cover';
    document.body.style.backgroundImage = `url('${imageUrl}')`;
    applyBackgroundSize(currentFit);
    localStorage.setItem('selectedWallpaper', imageUrl);
}

export function applyBackgroundSize(fitValue) {
    const sizeMap = {
        'cover': 'cover',
        'contain': 'contain',
        'stretch': '100% 100%'
    };
    document.body.style.backgroundSize = sizeMap[fitValue] || 'cover';
    document.body.style.backgroundPosition = 'center center';
    document.body.style.backgroundAttachment = 'fixed';
    document.body.style.backgroundRepeat = 'no-repeat';
}