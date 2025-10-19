export function createFirePong() {
    const gameContainer = document.createElement('div');
    gameContainer.style.width = '100%';
    gameContainer.style.height = '100%';
    gameContainer.style.display = 'flex';
    gameContainer.style.justifyContent = 'center';
    gameContainer.style.alignItems = 'center';
    gameContainer.style.borderStyle = 'double';
    gameContainer.style.borderColor = '#B8B5BE';

    const canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 400;
    canvas.style.border = '1px solid black';
    gameContainer.appendChild(canvas);

    const ctx = canvas.getContext('2d');

    let lastTime = 0;
    const FPS = 60;
    const frameInterval = 1000 / FPS;

    function gameLoop(timestamp) {
        if (timestamp - lastTime < frameInterval) {
            requestAnimationFrame(gameLoop);
            return;
        }
        lastTime = timestamp;

        ctx.clearRect(0, 0, canvas.width, canvas.height);



        requestAnimationFrame(gameLoop);
    }

    gameLoop();

    return gameContainer;
}