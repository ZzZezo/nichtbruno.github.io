export function createCountdown() {
    const container = document.createElement('div');
    container.id = 'countdown';
    container.innerHTML = `
        <div id="countdown" class="countdown-container">
            <div class="countdown-box">
                <h3 id="countdown-text" class="countdown-text">Loading .../h3>
            </div>
        </div>
    `;

    startCountdown(container);

    return container;
}

function startCountdown(container) {
    const countdownDisplay = container.querySelector('.countdown-text');
    if (!countdownDisplay) {
        console.error('Countdown display element not found!');
        return;
    }

    function getTime() {
        const now = new Date();
        const end = new Date(now.getFullYear()+1, 0, 1, 0, 0);
        const difference = end - now;
        const differenceInSeconds = Math.floor(difference / 1000);
        // const countdown = document.getElementById("countdown-text");
        countdownDisplay.textContent = differenceInSeconds;
    }

    // Update the countdown every second
    setInterval(getTime, 1000);
    getTime(); // Initial call to avoid delay
}