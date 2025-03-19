export function createAbout() {
    const container = document.createElement('div');
    container.id = 'aboutme';
    container.innerHTML = `
        <div id="about" class="about-container">
            <div class="about-box">
                <h3 class="about-title">
                    BrunOS
                </h3>
                <span class="about-text">
                    A simple cool website demo!
                </span>
                <span class="about-footer">
                    ✌️
                </span>
            </div>
        </div>
    `;

    // const script = document.createElement('script');
    // script.src = '../os/countdown.js';
    // document.body.appendChild(script);

    return container;
}