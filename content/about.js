export function createAbout() {
    const container = document.createElement('div');
    container.id = 'about';
    container.innerHTML = `
        <div id="about" class="about-container">
            <div class="about-box">
                <img class="idgaf-image" src="/assets/images/huh.png">
            </div>
        </div>
    `;

    return container;
}