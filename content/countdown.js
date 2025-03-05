export function createCountdown() {
    const container = document.createElement('div');
    container.id = 'countdown';
    container.innerHTML = `
        <div id="countdown" class="countdown-container">
            <div class="countdown-box">
                <h3 id="countdown-text" class="countdown-text"></h3>
            </div>
        </div>
    `;

    const script = document.createElement('script');
    script.src = '../os/countdown.js';
    document.body.appendChild(script);

    return container;
}