import { AssetManager, SpriteManager } from "../os/utils.js";

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
    ctx.imageSmoothingEnabled = false;
    ctx.webkitImageSmoothingEnabled = false;
    ctx.mozImageSmoothingEnabled = false;
    ctx.msImageSmoothingEnabled = false;

    let animationId = null;
    let isRunning = true;

    const assetManager = new AssetManager();
    const spriteManager = new SpriteManager();

    const eventHandlers = {
        keydown: null,
        keyup: null,
        mousemove: null,
        mousedown: null,
        mouseup: null,
    };

    const gameStates = {
        MENU: 'MENU',
        SINGLEPLAYER: 'SINGLEPLAYER',
        MULTIPLAYER: 'MULTIPLAYER',
        BLUE_WIN: 'BLUE_WIN',
        ORANGE_WIN: 'ORANGE_WIN',
    };

    const gameState = {
        current: gameStates.MENU,
        score: [0, 0], // blue - orange
        last_touch: -1,
    }

    const keys = { ArrowUp: false, ArrowDown: false, KeyW: false, KeyS: false, KeyP: false, KeyL: false, Escape: false};
    const mouse = { x: 0, y: 0, pressed: false };

    const SPRITES = {
        BACKGROUND: '../assets/images/games/firepong/menu-bg2.png',
        BALL: '../assets/images/games/firepong/blue-ball.png',
        FIRE: '../assets/images/games/firepong/fire-animation.png',
        ONEPLAYERBUTTON: '../assets/images/games/firepong/oneplayer-button.png',
        TWOPLAYERBUTTON: '../assets/images/games/firepong/twoplayer-button.png',
    };

    async function initGame() {
        try {
            await assetManager.preloadCritical(Object.values(SPRITES));

            setupInput();

            spriteManager.createSprite('bg', assetManager.get(SPRITES.BACKGROUND), {
                x: 0, y:0, width: canvas.width, height: canvas.height,
            });

            spriteManager.createSprite('oneplayerbutton', assetManager.get(SPRITES.ONEPLAYERBUTTON), {
                x: 204, y: 172, scale: 4,
            });

            spriteManager.createSprite('twoplayerbutton', assetManager.get(SPRITES.TWOPLAYERBUTTON), {
                x: 204, y: 246, scale: 4,
            });

            // spriteManager.createSprite('ball', assetManager.get(SPRITES.BALL), {
            //     x: 50, y: 50, scale: 5,
            // });

            // spriteManager.createAnimatedSprite('fire', assetManager.get(SPRITES.FIRE), {
            //     x: 100, y: 200, scale: 4,
            //     frameWidth: 16, frameHeight: 16,
            //     animations: {
            //         burn: {
            //             frameCount: 4,
            //             row: 0,
            //             speed: 100,
            //             loop: true,
            //         },
            //         burn2: {
            //             frameCount: 3,
            //             row: 1,
            //             speed: 100,
            //             loop: true,
            //         }
            //     },
            //     defaultAnimation: 'burn',
            // });

            spriteManager.createGroup('menu');
            spriteManager.addToGroup('menu', 'bg');
            // spriteManager.addToGroup('objects', 'ball');
            // spriteManager.addToGroup('objects', 'fire');
            spriteManager.addToGroup('menu', 'oneplayerbutton');
            spriteManager.addToGroup('menu', 'twoplayerbutton');
        } catch (error) {
            console.error('Failed to initialize game:', error);
        }
    }

    function setupInput() {
        eventHandlers.keydown = (e) => {
            if (keys.hasOwnProperty(e.code)) keys[e.code] = true;
        };
        eventHandlers.keyup = (e) => {
            if (keys.hasOwnProperty(e.code)) keys[e.code] = false;
        };
        eventHandlers.mousemove = (e) => {
            const rect = canvas.getBoundingClientRect();
            mouse.x = e.clientX - rect.left;
            mouse.y = e.clientY - rect.top;
        };
        eventHandlers.mousedown = (e) => {
            mouse.pressed = true;
            e.preventDefault();
        };
        eventHandlers.mouseup = (e) => {
            mouse.pressed = false;
            e.preventDefault();
        };

        document.addEventListener('keydown', eventHandlers.keydown);
        document.addEventListener('keyup', eventHandlers.keyup);
        canvas.addEventListener('mousemove', eventHandlers.mousemove);
        canvas.addEventListener('mousedown', eventHandlers.mousedown);
        canvas.addEventListener('mouseup', eventHandlers.mouseup);
    }

    // UPDATE
    function updateGame(deltaTime) {
        spriteManager.updateAll(deltaTime);

        handleInput();
        if (gameState.current === gameStates.SINGLEPLAYER) {
            updateBall();
            updatePaddles();
        }
    }

    function handleInput() {
        // const fire = spriteManager.getSprite('fire');
        if (gameState.current === gameStates.MENU) {
            const opbutton = spriteManager.getSprite('oneplayerbutton');
            const tpbutton = spriteManager.getSprite('twoplayerbutton');

            if (mouse.pressed) {
                if (pointerInSprite(mouse.x, mouse.y, opbutton)) {
                    gameState.current = gameStates.SINGLEPLAYER;
                    loadRound();
                } else if (pointerInSprite(mouse.x, mouse.y, tpbutton)) {
                    gameState.current = gameStates.MULTIPLAYER;
                    loadRound();
                }
            }
        } else {
            if (keys.Escape) {
                gameState.current = gameStates.MENU;
            }
            // maybe remove loaded round assets, but maybe not since they are cached idk
        }
    }

    function pointerInSprite(x, y, sprite) {
        if (!sprite || !sprite.visible) return false;

        return x >= sprite.x && 
            x <= sprite.x + (sprite.frameWidth * sprite.scale) &&
            y >= sprite.y && 
            y <= sprite.y + (sprite.frameHeight * sprite.scale);
    }

    async function loadRound() {
        const ROUND_ASSETS = {
            BG: gameState.current === gameStates.SINGLEPLAYER ? '../assets/images/games/firepong/ai-bg.png' : '../assets/images/games/firepong/normal-bg.png',
            BALL: '../assets/images/games/firepong/ball.png',
            LEFT_PADDLE : '../assets/images/games/firepong/left-paddle.png',
            RIGHT_PADDLE : '../assets/images/games/firepong/right-paddle.png',
        };

        try {
            await assetManager.loadImage(ROUND_ASSETS.BG);
            await assetManager.loadImage(ROUND_ASSETS.BALL);
            await assetManager.loadImage(ROUND_ASSETS.LEFT_PADDLE);
            await assetManager.loadImage(ROUND_ASSETS.RIGHT_PADDLE);

            spriteManager.createSprite('round-bg', assetManager.get(ROUND_ASSETS.BG), {
                x: 0, y: 0, width: canvas.width, height: canvas.height,
            });

            spriteManager.createAnimatedSprite('ball', assetManager.get(ROUND_ASSETS.BALL), {
                x: 0, y: 0, scale: 2,
                frameWidth: 16, frameHeight: 16,
                animations: {
                    blue: {
                        frameCount: 1,
                        row: 0,
                        loop: false,
                    },
                    orange: {
                        frameCount: 1,
                        row: 1,
                        loop: false,
                    }
                },
                defaultAnimation: 'blue',
            });

            spriteManager.createSprite('left-paddle', assetManager.get(ROUND_ASSETS.LEFT_PADDLE), {
                x: -39, y: 100, scale: 3,
            });

            spriteManager.createSprite('right-paddle', assetManager.get(ROUND_ASSETS.RIGHT_PADDLE), {
                x: canvas.width-10, y: 100, scale: 3,
            });

            spriteManager.createGroup('round');
            spriteManager.addToGroup('round', 'round-bg');
            spriteManager.addToGroup('round', 'ball');
            spriteManager.addToGroup('round', 'left-paddle');
            spriteManager.addToGroup('round', 'right-paddle');
        } catch (error) {
            console.error('Failed to load round:', error);
        }

        const ball = spriteManager.getSprite('ball');
        ball.x = 300 - (8 * ball.scale);
        ball.y = 200 - (8 * ball.scale);
    }

    // PADDLE FUNCTIONALITY 
    const paddleSpeed = 12;

    function updatePaddles() {
        const leftPaddle = spriteManager.getSprite('left-paddle');
        const rightPaddle = spriteManager.getSprite('right-paddle');
        if (!leftPaddle || !rightPaddle) return;

        movePaddles(leftPaddle);
    }

    function movePaddles(leftPaddle, rightPaddle, blockRight = false) {
        if (keys.KeyW || (gameState.current === gameStates.SINGLEPLAYER && keys.ArrowUp)) {
            leftPaddle.y = Math.max(0, leftPaddle.y - paddleSpeed);
        }
        if (keys.KeyS || (gameState.current === gameStates.SINGLEPLAYER && keys.ArrowDown)) {
            leftPaddle.y = Math.min(canvas.height - (leftPaddle.height * leftPaddle.scale), leftPaddle.y + paddleSpeed);
        }
    }

    // BALL FUNCTIONALITY
    let ballSpeedX = 10;
    let ballSpeedY = 10;

    function updateBall() {
        const ball = spriteManager.getSprite('ball');
        if (!ball) return;

        moveBall(ball);
        ballUpdateColor(ball);
    }

    function moveBall(ball) {
        const radius = (ball.width / 2) * ball.scale;

        const prevBallX = ball.x;
        const prevBallY = ball.y;

        ball.x += ballSpeedX;
        ball.y += ballSpeedY;

        if (ball.y + radius > canvas.height || ball.y - radius < 0) {
            ballSpeedY = -ballSpeedY;
        }

        const nextBallX = ball.x + ballSpeedX;
        const nextBallY = ball.y + ballSpeedY;

        // paddle

        if (ball.x - radius < 0 || ball.x + radius > canvas.width) {
            if (gameState.last_touch < 0) {
                gameState.score[0] += 1;
            } else {
                gameState.score[1] += 1;
            }

            if (gameState.score[0] >= 7) {
                gameState.current = gameStates.BLUE_WIN;
            } else if (gameState.score[1] >= 7) {
                gameState.current = gameStates.ORANGE_WIN;
            }

            resetBall(ball);
        }
    }

    function resetBall(ball) {
        ball.x = 300 - (8 * ball.scale);
        ball.y = 200 - (8 * ball.scale);
        if (ballSpeedX < 0) {
            ballSpeedX = -10;
            gameState.last_touch = -1;
        } else {
            ballSpeedX = 10;
            gameState.last_touch = 1;
        }
        ballSpeedY = 10;
        ballSpeedX = -ballSpeedX;
    }

    function ballUpdateColor(ball) {
        if (gameState.last_touch < 0) {
            ball.setAnimation('blue');
        } else if (gameState.last_touch > 0) {
            ball.setAnimation('orange');
        }
    }

    // DRAWING
    function drawGame() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (gameState.current === gameStates.MENU) {
            spriteManager.drawGroup(ctx, 'menu');
        } else if (gameState.current === gameStates.WIN) {
            // win drawing
        } else {
            spriteManager.drawGroup(ctx, 'round');
            drawPoints();
        }
    }

    function drawPoints() {
        ctx.font = '30px WIN';
        ctx.fillStyle = 'blue';
        ctx.textAlign = 'center';
        ctx.fillText(gameState.score[0], canvas.width / 2 - 25, 28);

        ctx.fillStyle = 'orange';
        ctx.textAlign = 'center';
        ctx.fillText(gameState.score[1], canvas.width / 2 + 25, 28);
    }

    let lastTime = 0;
    const FPS = 60;
    const frameInterval = 1000 / FPS;

    function gameLoop(timestamp) {
        if (!isRunning) return;

        const deltaTime = timestamp - lastTime;
        if (deltaTime < frameInterval) {
            requestAnimationFrame(gameLoop);
            return;
        }
        lastTime = timestamp;

        updateGame(deltaTime);
        drawGame();
        animationId = requestAnimationFrame(gameLoop);
    }

    gameContainer.cleanup = () => {
        isRunning = false;
        if (animationId) {
            cancelAnimationFrame(animationId);
        }
        document.removeEventListener('keydown', eventHandlers.keydown);
        document.removeEventListener('keyup', eventHandlers.keyup);
        canvas.removeEventListener('mousemove', eventHandlers.mousemove);
        canvas.removeEventListener('mousedown', eventHandlers.mousedown);
        canvas.removeEventListener('mouseup', eventHandlers.mouseup);
    };

    initGame().then(() => {
        animationId = requestAnimationFrame(gameLoop);
    });

    return gameContainer;
}