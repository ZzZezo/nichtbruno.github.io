export function createPingPongGame() {
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

    // Game variables
    let ballX = canvas.width / 2;
    let ballY = canvas.height / 2;
    let ballSpeedX = 5;
    let ballSpeedY = 5;
    const ballRadius = 10;

    const paddleWidth = 10;
    const paddleHeight = 100;
    let leftPaddleY = (canvas.height - paddleHeight) / 2;
    let rightPaddleY = (canvas.height - paddleHeight) / 2;
    const paddleSpeed = 8;

    // Key state tracking
    const keys = {
        w: false,
        s: false,
        ArrowUp: false,
        ArrowDown: false,
    };

    // Draw the ball
    function drawBall() {
        ctx.beginPath();
        ctx.arc(ballX, ballY, ballRadius, 0, Math.PI * 2);
        ctx.fillStyle = 'black';
        ctx.fill();
        ctx.closePath();
    }

    // Draw the paddles
    function drawPaddles() {
        ctx.fillStyle = 'black';
        ctx.fillRect(0, leftPaddleY, paddleWidth, paddleHeight);
        ctx.fillRect(canvas.width - paddleWidth, rightPaddleY, paddleWidth, paddleHeight);
    }

    // Move the ball
    function moveBall() {
        ballX += ballSpeedX;
        ballY += ballSpeedY;

        // Ball collision with top and bottom walls
        if (ballY + ballRadius > canvas.height || ballY - ballRadius < 0) {
            ballSpeedY = -ballSpeedY;
        }

        // Ball collision with paddles
        if (
            (ballX - ballRadius < paddleWidth && ballY > leftPaddleY && ballY < leftPaddleY + paddleHeight) ||
            (ballX + ballRadius > canvas.width - paddleWidth && ballY > rightPaddleY && ballY < rightPaddleY + paddleHeight)
        ) {
            ballSpeedX = -ballSpeedX;
        }

        // Ball out of bounds (left or right)
        if (ballX - ballRadius < 0 || ballX + ballRadius > canvas.width) {
            resetBall();
        }
    }

    // Reset the ball to the center
    function resetBall() {
        ballX = canvas.width / 2;
        ballY = canvas.height / 2;
        ballSpeedX = -ballSpeedX;
    }

    // Handle keydown events
    document.addEventListener('keydown', (e) => {
        if (keys.hasOwnProperty(e.key)) {
            keys[e.key] = true;
        }
    });

    // Handle keyup events
    document.addEventListener('keyup', (e) => {
        if (keys.hasOwnProperty(e.key)) {
            keys[e.key] = false;
        }
    });

    // Update paddle positions based on key states
    function updatePaddles() {
        if (keys.w) {
            leftPaddleY = Math.max(0, leftPaddleY - paddleSpeed);
        }
        if (keys.s) {
            leftPaddleY = Math.min(canvas.height - paddleHeight, leftPaddleY + paddleSpeed);
        }
        if (keys.ArrowUp) {
            rightPaddleY = Math.max(0, rightPaddleY - paddleSpeed);
        }
        if (keys.ArrowDown) {
            rightPaddleY = Math.min(canvas.height - paddleHeight, rightPaddleY + paddleSpeed);
        }
    }

    // Game loop
    function gameLoop() {
        // Clear the canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Update paddle positions
        updatePaddles();

        // Draw the ball and paddles
        drawBall();
        drawPaddles();

        // Move the ball
        moveBall();

        // Request the next frame
        requestAnimationFrame(gameLoop);
    }

    // Start the game loop
    gameLoop();

    return gameContainer;
}