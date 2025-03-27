export function createJumpNRun() {
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

    // GAME VARS
    const player = {
        x: 100,
        y: 300,
        width: 40,
        height: 80,
        speedY: 0,
        jumping: false,
        jumpPower: 1.5,
    }

    // ENGINE VARIABLES
    const keys = {
        w: false,
        Space: false,
        Escape: false,
    };

    const gravity = 9.8;

    const gameState = {
        MENU: "Menu",
        SINGLEPLAYER: "Singleplayer",
        MULTIPLAYER: "Multiplayer",
        WIN: "Win",
    };
    let currentGameState = gameState.MENU;

    const ctx = canvas.getContext('2d');

    function drawButton(posx, posy, width, height, text, hover = false) {
        ctx.fillStyle = hover ? '#555' : 'black';
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(posx, posy, width, height, 10);
        ctx.fill();
        ctx.stroke();

        ctx.font = '24px Arial';
        ctx.fillStyle = 'white';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, posx + width / 2, posy + height / 2);
    }

    function isHovering(buttonIndex) {
        const buttonY = [canvas.height / 2 - 25, canvas.height / 2 + 35, canvas.height / 2 + 95][buttonIndex];
        return (
            mouseX >= canvas.width / 2 - 100 &&
            mouseX <= canvas.width / 2 + 100 &&
            mouseY >= buttonY &&
            mouseY <= buttonY + 50
        );
    }

    function drawMenu() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        canvas.style.backgroundColor = '#f0f0f0';

        ctx.font = '48px Arial';
        ctx.fillStyle = 'black';
        ctx.textAlign = 'center';
        ctx.fillText('PingPong', canvas.width / 2, 80);

        ctx.font = '24px Arial';
        ctx.fillStyle = 'black';
        ctx.textAlign = 'center';
        ctx.fillText('A very unfair', canvas.width / 2, 40);

        ctx.font = '24px Arial';
        ctx.fillStyle = 'black';
        ctx.textAlign = 'center';
        ctx.fillText('Game', canvas.width / 2, 120);

        ctx.font = '12px Arial';
        ctx.fillStyle = 'black';
        ctx.textAlign = 'center';
        ctx.fillText('I don\'t care tho', canvas.width / 2, 140);

        ctx.font = '12px Arial';
        ctx.fillStyle = 'black';
        ctx.textAlign = 'center';
        ctx.fillText('Shhhh... New Mode coming soon 🤫', canvas.width / 2, 380);

        drawButton(canvas.width / 2 - 100, canvas.height / 2 - 25, 200, 50, "Singleplayer", isHovering(0));
        drawButton(canvas.width / 2 - 100, canvas.height / 2 + 35, 200, 50, "Multiplayer", isHovering(1));
        drawButton(canvas.width / 2 - 100, canvas.height / 2 + 95, 200, 50, "Quit", isHovering(2));
    }

    // LISTENERS
    let mouseX = 0, mouseY = 0;
    canvas.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        mouseX = e.clientX - rect.left;
        mouseY = e.clientY - rect.top;
    });
    canvas.addEventListener('click', () => {
        if (currentGameState === gameState.MENU) {
            if (isHovering(0)) {
                currentGameState = gameState.SINGLEPLAYER;
                resetBall();
            } else if (isHovering(1)) {
                currentGameState = gameState.MULTIPLAYER;
                resetBall();
            } else if (isHovering(2)) {
                const windowElement = gameContainer.closest('.window');
                if (windowElement) {
                    windowElement.remove();
                }
            }
        }
    });
    document.addEventListener('keydown', (e) => {
        if (keys.hasOwnProperty(e.key)) {
            keys[e.key] = true;
        }
    });
    document.addEventListener('keyup', (e) => {
        if (keys.hasOwnProperty(e.key)) {
            keys[e.key] = false;
        }
    });

    function gameLoop() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (currentGameState === gameState.MENU) {
            drawMenu();
        }

        requestAnimationFrame(gameLoop);
    }

    gameLoop();
    return gameContainer;
}