export function createPingPongGame() {
    const gameContainer = document.createElement('div');
    gameContainer.style.width = '100%';
    gameContainer.style.height = '100%';
    gameContainer.style.display = 'flex';
    gameContainer.style.justifyContent = 'center';
    gameContainer.style.alignItems = 'center';
    gameContainer.style.borderStyle = 'double';
    gameContainer.style.borderColor = '#B8B5BE';

    const gameStates = {
        MENU: "Menu",
        SINGLEPLAYER: "Singleplayer",
        MULTIPLAYER: "Multiplayer",
        WIN: "Win",
    };
    let currentGameState = gameStates.MENU;

    const canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 400;
    canvas.style.border = '1px solid black';
    gameContainer.appendChild(canvas);

    const ctx = canvas.getContext('2d');

    const backgroundImage = new Image();
    backgroundImage.src = '../images/pingpong/pingpongbg.png';
    let isBackgroundLoaded = false;

    backgroundImage.onload = () => {
        isBackgroundLoaded = true;
    };

    function drawBackground() {
        if (isBackgroundLoaded) {
            ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
        } else {
            ctx.fillStyle = '#f0f0f0';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
    }

    const backgroundAIImage = new Image();
    backgroundAIImage.src = '../images/pingpong/pingpongbgai.png';
    let isBackgroundAILoaded = false;

    backgroundAIImage.onload = () => {
        isBackgroundAILoaded = true;
    };

    function drawAIBackground() {
        if (isBackgroundAILoaded) {
            ctx.drawImage(backgroundAIImage, 0, 0, canvas.width, canvas.height);
        } else {
            ctx.fillStyle = '#f0f0f0';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
    }

    const blueWinImage = new Image();
    blueWinImage.src = '../images/pingpong/blue-wins.png';

    const orangeWinImage = new Image();
    orangeWinImage.src = '../images/pingpong/orange-wins.png';

    function drawWinner() {
        ctx.drawImage(points.winner < 0 ? blueWinImage: orangeWinImage, 0, 0, canvas.width, canvas.height);
    }

    // Game variables
    let ballX = canvas.width / 2;
    let ballY = canvas.height / 2;
    let ballSpeedX = 5;
    let ballSpeedY = 5;
    const ballRadius = 10;

    let leftPaddleDir = 1;
    let rightPaddleDir = 1;

    const paddleWidth = 10;
    const paddleHeight = 100;
    let leftPaddleY = (canvas.height - paddleHeight) / 2;
    let rightPaddleY = (canvas.height - paddleHeight) / 2;
    const paddleSpeed = 8;

    let points = {
        blue: 0,
        orange: 0,
        last_touch: -1,
        winner: 0,
    };

    const keys = {
        w: false,
        s: false,
        ArrowUp: false,
        ArrowDown: false,
        p: false,
        l: false,
        Escape: false,
    };

    function drawBall() {
        ctx.beginPath();
        ctx.arc(ballX, ballY, ballRadius, 0, Math.PI * 2);
        ctx.fillStyle = 'black';
        ctx.fill();
        ctx.closePath();
    }

    function drawPaddles() {
        ctx.fillStyle = 'blue';
        ctx.fillRect(0, leftPaddleY, paddleWidth, paddleHeight);
        ctx.fillStyle = 'orange';
        ctx.fillRect(canvas.width - paddleWidth, rightPaddleY, paddleWidth, paddleHeight);
    }

    function drawButton(posx, posy, width, height, text, hover = false) {
        ctx.fillStyle = hover ? '#555' : 'black';
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(posx, posy, width, height, 10);
        ctx.fill();
        ctx.stroke();

        ctx.font = '24px APR';
        ctx.fillStyle = 'white';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, posx + width / 2, posy + height / 2);
    }

    function drawMenu() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        canvas.style.backgroundColor = '#f0f0f0';

        ctx.font = '48px APR';
        ctx.fillStyle = 'black';
        ctx.textAlign = 'center';
        ctx.fillText('PingPong', canvas.width / 2, 80);

        ctx.font = '24px APR';
        ctx.fillStyle = 'black';
        ctx.textAlign = 'center';
        ctx.fillText('A very unfair', canvas.width / 2, 40);

        ctx.font = '24px APR';
        ctx.fillStyle = 'black';
        ctx.textAlign = 'center';
        ctx.fillText('Game', canvas.width / 2, 120);

        ctx.font = '12px APR';
        ctx.fillStyle = 'black';
        ctx.textAlign = 'center';
        ctx.fillText('I don\'t care tho', canvas.width / 2, 140);

        ctx.font = '12px APR';
        ctx.fillStyle = 'black';
        ctx.textAlign = 'center';
        ctx.fillText('Shhhh... New Mode coming soon 🤫', canvas.width / 2, 380);

        drawButton(canvas.width / 2 - 100, canvas.height / 2 - 25, 200, 50, "Singleplayer", isHovering(0));
        drawButton(canvas.width / 2 - 100, canvas.height / 2 + 35, 200, 50, "Multiplayer", isHovering(1));
        drawButton(canvas.width / 2 - 100, canvas.height / 2 + 95, 200, 50, "Quit", isHovering(2));
    }

    function drawPoints() {
        ctx.font = '30px APR';
        ctx.fillStyle = 'blue';
        ctx.textAlign = 'center';
        ctx.fillText(points.blue, canvas.width / 2 - 20, 20);

        ctx.fillStyle = 'orange';
        ctx.textAlign = 'center';
        ctx.fillText(points.orange, canvas.width / 2 + 20, 20);
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

    let mouseX = 0, mouseY = 0;
    canvas.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        mouseX = e.clientX - rect.left;
        mouseY = e.clientY - rect.top;
    });

    canvas.addEventListener('click', () => {
        if (currentGameState === gameStates.MENU) {
            if (isHovering(0)) {
                currentGameState = gameStates.SINGLEPLAYER;
                points.blue = 0;
                points.orange = 0;
                resetBall();
            } else if (isHovering(1)) {
                currentGameState = gameStates.MULTIPLAYER;
                points.blue = 0;
                points.orange = 0;
                resetBall();
            } else if (isHovering(2)) {
                const windowElement = gameContainer.closest('.window');
                if (windowElement) {
                    windowElement.remove();
                }
            }
        }
    });

    function moveAIPaddle() {
        const ballSpeedRatio = ballSpeedY / ballSpeedX;
        const distanceToPaddle = canvas.width - paddleWidth - ballX;
        const predictedY = ballY + ballSpeedRatio * distanceToPaddle;

        const difficulty = Math.abs(points.blue - points.orange) / 7;
    
        const randomOffset = (Math.random() - 0.5) * (50 - 20 * difficulty);
        const targetY = predictedY + randomOffset;
    
        const clampedTargetY = Math.max(0, Math.min(canvas.height - paddleHeight, targetY));
    
        const paddleCenter = rightPaddleY + paddleHeight / 2;
        const reactionSpeed = paddleSpeed * (0.6 + 0.2 * difficulty);
    
        if (paddleCenter < clampedTargetY - 10) {
            rightPaddleY += reactionSpeed;
        } else if (paddleCenter > clampedTargetY + 10) {
            rightPaddleY -= reactionSpeed;
        }
    
        rightPaddleY = Math.max(0, Math.min(canvas.height - paddleHeight, rightPaddleY));
    }

    function moveBall() {
        const prevBallX = ballX;
        const prevBallY = ballY;
    
        ballX += ballSpeedX;
        ballY += ballSpeedY;
    
        if (ballY + ballRadius > canvas.height || ballY - ballRadius < 0) {
            ballSpeedY = -ballSpeedY;
        }
    
        const nextBallX = ballX + ballSpeedX;
        const nextBallY = ballY + ballSpeedY;
    
        if (
            nextBallX - ballRadius < paddleWidth &&
            nextBallY + ballRadius > leftPaddleY &&
            nextBallY - ballRadius < leftPaddleY + paddleHeight
        ) {
            const collisionTime = (paddleWidth - (prevBallX - ballRadius)) / ballSpeedX;
            const collisionY = prevBallY + ballSpeedY * collisionTime;
    
            if (
                collisionY + ballRadius > leftPaddleY &&
                collisionY - ballRadius < leftPaddleY + paddleHeight
            ) {
                ballX = paddleWidth + ballRadius;
                ballSpeedX -= 0.6;
                ballSpeedX = -ballSpeedX;
                ballSpeedY += 0.1 * leftPaddleDir;
                ballSpeedY = ballSpeedY * leftPaddleDir;
                points.last_touch = -1;
            }
        }
    
        if (
            nextBallX + ballRadius > canvas.width - paddleWidth &&
            nextBallY + ballRadius > rightPaddleY &&
            nextBallY - ballRadius < rightPaddleY + paddleHeight
        ) {
            const collisionTime = (canvas.width - paddleWidth - (prevBallX + ballRadius)) / ballSpeedX;
            const collisionY = prevBallY + ballSpeedY * collisionTime;
    
            if (
                collisionY + ballRadius > rightPaddleY &&
                collisionY - ballRadius < rightPaddleY + paddleHeight
            ) {
                ballX = canvas.width - paddleWidth - ballRadius;
                ballSpeedX += 0.6;
                ballSpeedX = -ballSpeedX;
                ballSpeedY += 0.1 * rightPaddleDir;
                ballSpeedY = ballSpeedY * leftPaddleDir;
                points.last_touch = 1;
            }
        }
    
        if (ballX - ballRadius < 0 || ballX + ballRadius > canvas.width) {
            if (points.last_touch < 0) {
                points.blue += 1;
            } else {
                points.orange += 1;
            }
    
            if (points.blue >= 7) {
                points.winner = -1;
                currentGameState = gameStates.WIN;
            } else if (points.orange >= 7) {
                points.winner = 1;
                currentGameState = gameStates.WIN;
            }
    
            resetBall();
        }
    }

    function resetBall() {
        ballX = canvas.width / 2;
        ballY = canvas.height / 2;
        if(ballSpeedX < 0) {
            ballSpeedX = -5;
            points.last_touch = -1;
        } else {
            ballSpeedX = 5;
            points.last_touch = 1;
        }
        ballSpeedY = 5;
        ballSpeedX = -ballSpeedX;
    }

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

    function updatePaddles(blockRigth = false) {
        if (keys.w || (currentGameState == gameStates.SINGLEPLAYER && keys.ArrowUp)) {
            leftPaddleY = Math.max(0, leftPaddleY - paddleSpeed);
            leftPaddleDir = -1;
        }
        if (keys.s || (currentGameState == gameStates.SINGLEPLAYER && keys.ArrowDown)) {
            leftPaddleY = Math.min(canvas.height - paddleHeight, leftPaddleY + paddleSpeed);
            leftPaddleDir = 1;
        }
        if (!blockRigth) {
            if (keys.p) {
                rightPaddleY = Math.max(0, rightPaddleY - paddleSpeed);
                rightPaddleDir = -1;
            }
            if (keys.l) {
                rightPaddleY = Math.min(canvas.height - paddleHeight, rightPaddleY + paddleSpeed);
                rightPaddleDir = 1;
            }
        }
        if (keys.Escape) {
            currentGameState = gameStates.MENU;
        }
    }

    function gameLoop() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (currentGameState === gameStates.MENU) {
            drawMenu();
        } else if (currentGameState === gameStates.SINGLEPLAYER) {
            drawAIBackground();
            updatePaddles(true);
            moveAIPaddle();
            drawPoints();
            drawBall();
            drawPaddles();
            moveBall();
        } else if (currentGameState === gameStates.MULTIPLAYER) {
            drawBackground();
            updatePaddles();
            drawBall();
            drawPoints();
            drawPaddles();
            moveBall();
        } else if (currentGameState === gameStates.WIN) {
            drawWinner();
            if (keys.Escape) {
                currentGameState = gameStates.MENU;
            }
        }

        requestAnimationFrame(gameLoop);
    }

    gameLoop();

    return gameContainer;
}