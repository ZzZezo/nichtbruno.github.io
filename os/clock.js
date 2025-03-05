function updateClock() {
    const now = new Date();

    const hours = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();

    const hourAngle = (hours % 12) * 30 + minutes * 0.5;
    const minuteAngle = minutes * 6;
    const secondAngle = seconds * 6;

    rotateHandle('hour-handle', hours, hourAngle);
    rotateHandle('minute-handle', minutes, minuteAngle);
    rotateHandle('seconds-handle', seconds, secondAngle);
}

function rotateHandle(handleId, time, angle) {
    const handle = document.getElementById(handleId);
    const items = handle.querySelectorAll('.handle-item');

    handle.style.transform = `rotate(${angle}deg)`;

    const spacing = 30;
    items.forEach((item, index) => {
        const distance = (index + 1) * spacing;
        item.style.transform = `translate(-50%, -${distance}px) rotate(${-angle}deg)`;
        item.textContent = time;
    });
}

setInterval(updateClock, 1000);
updateClock();