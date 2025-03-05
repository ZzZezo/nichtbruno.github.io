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
            </div>
        </div>
    `;

    // Load the custom script after jQuery is loaded
    const script = document.createElement('script');
    script.src = '../os/clock.js'; // Update the path to your script

    // Append the script to the document body
    document.body.appendChild(script);

    return container;
}