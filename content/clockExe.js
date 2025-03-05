export function createClock() {
    // Create the container
    const container = document.createElement('div');
    container.id = 'clock';
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
            </div>
        </div>
    `;

    // Load the external script dynamically
    const script = document.createElement('script');
    script.src = '../os/clock.js'; // Update the path to your script
    document.body.appendChild(script);

    return container;
}