export function createClock() {
    // Create the clock container
    const container = document.createElement('div');
    container.id = 'clock';
    container.innerHTML = `
        <div class="clock-container">
            <div class="clock-face">
                <div class="hand hour-hand" id="hour-hand"></div>
                <div class="hand minute-hand" id="minute-hand"></div>
                <div class="hand second-hand" id="second-hand"></div>
            </div>
            <div class="digital-clock" id="digital-clock"></div>
        </div>
    `;

    // Start the clock functionality
    startClock(container);

    return container;
}

function startClock(container) {
    const hourHand = container.querySelector('#hour-hand');
    const minuteHand = container.querySelector('#minute-hand');
    const secondHand = container.querySelector('#second-hand');
    const digitalClock = container.querySelector('#digital-clock');

    function updateClock() {
        const now = new Date();

        // Analog Clock
        const hours = now.getHours();
        const minutes = now.getMinutes();
        const seconds = now.getSeconds();

        const hourAngle = (hours % 12) * 30 + minutes * 0.5; // 30 degrees per hour + 0.5 degrees per minute
        const minuteAngle = minutes * 6; // 6 degrees per minute
        const secondAngle = seconds * 6; // 6 degrees per second

        hourHand.style.transform = `rotate(${hourAngle}deg)`;
        minuteHand.style.transform = `rotate(${minuteAngle}deg)`;
        secondHand.style.transform = `rotate(${secondAngle}deg)`;

        // Digital Clock
        const timeString = now.toLocaleTimeString();
        digitalClock.textContent = timeString;
    }

    // Update the clock every second
    setInterval(updateClock, 1000);
    updateClock(); // Initial call to avoid delay
}