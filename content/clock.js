export function createClock() {
    const container = document.createElement('div');
    container.id = 'custom-container';
    container.innerHTML = `
        <div class="clock-container">
            <div class="clock-box">
                <div id="hour-handle" id class="handle hour-handle">
                    <div class="handle-item hour-item">2</div>
                    <div class="handle-item hour-item">2</div>
                    <div class="handle-item hour-item">2</div>
                </div>
                <div id="minute-handle" class="handle minute-handle">
                    <div class="handle-item minute-item">1</div>
                    <div class="handle-item minute-item">1</div>
                    <div class="handle-item minute-item">1</div>
                    <div class="handle-item minute-item">1</div>
                    <div class="handle-item minute-item">1</div>
                </div>
                <div id="seconds-handle" class="handle seconds-handle">
                    <div class="handle-item seconds-item">0</div>
                    <div class="handle-item seconds-item">0</div>
                    <div class="handle-item seconds-item">0</div>
                    <div class="handle-item seconds-item">0</div>
                    <div class="handle-item seconds-item">0</div>
                    <div class="handle-item seconds-item">0</div>
                </div>
                <div id="digital" class="digital-clock"></div>
            </div>
        </div>
    `;

    startClock(container);

    return container;
}

function startClock(container) {
    const clockContainer = container.querySelector('.clock-box');
    if (!clockContainer) {
        console.error('Countdown display element not found!');
        return;
    }

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

        const dclock = container.querySelector("#digital");
        dclock.textContent = `${hours}:${minutes < 10 ? "0"+minutes : minutes}:${seconds < 10 ? "0"+seconds : seconds}`;
    }
    
    function rotateHandle(handleId, time, angle) {
        const handle = container.querySelector(`#${handleId}`);
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
}