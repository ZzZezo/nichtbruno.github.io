export function createJabi() {
    const gameContainer = document.createElement('div');
    gameContainer.style.width = '100%';
    gameContainer.style.height = '100%';
    gameContainer.style.display = 'flex';
    gameContainer.style.justifyContent = 'center';
    gameContainer.style.alignItems = 'center';
    gameContainer.style.overflow = 'hidden';

    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 500;
    gameContainer.appendChild(canvas);

    const ctx = canvas.getContext('2d');

    // Game settings
    const baseSpeed = 10;
    const PLATFORM_SPAWN_RATE = 15;

    // Game states
    const states = {
        MENU: 0,
        READY: 1,
        PLAYING: 2,
        GAME_OVER: 3
    };
    let gameState = states.MENU;

    // Player properties
    const player = {
        x: 100,
        y: 300,
        width: 30,
        height: 50,
        speedY: 0,
        gravity: 1.2,
        jumpPower: 18,
        isJumping: false,
        jumpsRemaining: 2,
        color: '#FF5733',
        lastJumpTime: 0,
        coyoteTime: 0,
        coyoteThreshold: 8
    };

    // Game world
    let platforms = [];
    let score = 0;
    let gameSpeed = baseSpeed;
    let worldScrollX = 0;
    let lastFrameTime = 0;
    let platformSpawnCounter = 0;

    // Controls
    const keys = {
        space: false,
        spacePressed: false
    };

    // Event listeners
    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space') {
            keys.space = true;
            if (!keys.spacePressed) {
                keys.spacePressed = true;
                if (gameState === states.MENU) startGame();
                if (gameState === states.READY) gameState = states.PLAYING;
                if (gameState === states.GAME_OVER) resetGame();
            }
        }
    });

    document.addEventListener('keyup', (e) => {
        if (e.code === 'Space') {
            keys.space = false;
            keys.spacePressed = false;
        }
    });

    function startGame() {
        gameState = states.READY;
        score = 0;
        platforms = [];
        player.y = 300;
        player.speedY = 0;
        player.isJumping = false;
        player.jumpsRemaining = 2;
        player.coyoteTime = 0;
        gameSpeed = baseSpeed;
        worldScrollX = 0;
        generateInitialPlatforms();
    }

    function resetGame() {
        gameState = states.MENU;
    }

    function generateInitialPlatforms() {
        platforms.push({
            x: 100,
            y: 350,
            width: 300,
            height: 40,
            color: '#4CAF50',
            moveX: 0,
            moveY: 0,
            moveSpeed: 0
        });

        for (let i = 1; i < 6; i++) {
            generateNewPlatform();
        }
    }

    function generateNewPlatform() {
        const lastPlatform = platforms[platforms.length - 1];
        const gap = 120 + Math.random() * 80;
        const width = 140 + Math.random() * 100;
        
        platforms.push({
            x: lastPlatform.x + lastPlatform.width + gap,
            y: Math.max(200, Math.min(400, lastPlatform.y + (Math.random() * 120 - 60))),
            width: width,
            height: 40,
            color: '#4CAF50',
            moveX: Math.random() > 0.8 ? 1 : 0,
            moveY: Math.random() > 0.8 ? 1 : 0,
            moveSpeed: 3 + Math.random() * 4
        });
    }

    function update(timestamp) {
        const deltaTime = Math.min(timestamp - lastFrameTime, 100);
        lastFrameTime = timestamp;

        if (gameState !== states.PLAYING) return;

        // World scrolling
        worldScrollX += gameSpeed * (deltaTime / 16) * (1 + score / 3000);

        // Player physics
        player.speedY += player.gravity * (deltaTime / 16);
        player.y += player.speedY;

        // Death check - FIXED VERSION
        if (player.y > canvas.height) {
            gameState = states.GAME_OVER;
            return;
        }

        // Platform collision and coyote time
        let onPlatform = false;
        for (let i = platforms.length - 1; i >= 0; i--) {
            const platform = platforms[i];
            const platformScreenX = platform.x - worldScrollX;

            // Remove old platforms
            if (platform.x + platform.width < worldScrollX - 300) {
                platforms.splice(i, 1);
                continue;
            }

            // Collision detection
            if (player.x + player.width > platformScreenX &&
                player.x < platformScreenX + platform.width &&
                player.y + player.height >= platform.y &&
                player.y + player.height <= platform.y + 25) {
                
                if (player.speedY >= 0) {
                    player.y = platform.y - player.height;
                    player.speedY = 0;
                    player.isJumping = false;
                    player.jumpsRemaining = 2;
                    player.coyoteTime = player.coyoteThreshold;
                    onPlatform = true;
                }
            }

            // Update moving platforms
            if (platform.moveX) platform.x += platform.moveSpeed * (deltaTime / 16);
            if (platform.moveY) {
                platform.y += platform.moveSpeed * (deltaTime / 16);
                if (platform.y < 200 || platform.y > 400) platform.moveSpeed *= -1;
            }
        }

        // Coyote time
        if (!onPlatform && player.coyoteTime > 0) player.coyoteTime--;

        // Jumping
        if (keys.spacePressed && (player.jumpsRemaining > 0 || player.coyoteTime > 0)) {
            if (timestamp - player.lastJumpTime > 120) {
                player.speedY = -player.jumpPower;
                player.isJumping = true;
                if (player.coyoteTime <= 0) player.jumpsRemaining--;
                else player.jumpsRemaining = 1;
                player.lastJumpTime = timestamp;
                player.coyoteTime = 0;
            }
        }

        // Platform generation
        platformSpawnCounter++;
        if (platformSpawnCounter > PLATFORM_SPAWN_RATE) {
            generateNewPlatform();
            platformSpawnCounter = 0;
        }

        // Difficulty scaling
        gameSpeed = baseSpeed * (1 + score / 1500);
        score = Math.floor(worldScrollX / 4);
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Background
        ctx.fillStyle = '#87CEEB';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Platforms
        platforms.forEach(platform => {
            const screenX = platform.x - worldScrollX;
            if (screenX > -platform.width && screenX < canvas.width) {
                ctx.fillStyle = platform.color;
                ctx.fillRect(screenX, platform.y, platform.width, platform.height);
                
                ctx.fillStyle = 'rgba(255,255,255,0.3)';
                ctx.fillRect(screenX, platform.y, 5, platform.height);
            }
        });

        // Player
        ctx.fillStyle = player.color;
        ctx.fillRect(player.x, player.y, player.width, player.height);

        // Falling warning
        if (player.y > canvas.height - 50 && gameState === states.PLAYING) {
            ctx.fillStyle = 'rgba(255,0,0,0.5)';
            ctx.fillRect(0, canvas.height - 50, canvas.width, 50);
            ctx.fillStyle = '#FFF';
            ctx.font = '24px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('YOU ARE FALLING!', canvas.width/2, canvas.height - 20);
        }

        // UI
        ctx.fillStyle = '#000';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(`${score}m`, 20, 30);
        ctx.font = '16px Arial';
        ctx.fillText(`Speed: ${gameSpeed.toFixed(1)}x`, 20, 60);

        // Game states
        if (gameState === states.MENU) drawMenu();
        else if (gameState === states.READY) drawReadyScreen();
        else if (gameState === states.GAME_OVER) drawGameOver();
    }

    function drawMenu() {
        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = '#FFF';
        ctx.font = 'bold 48px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('DONT PLAY THIS', canvas.width/2, 150);
        
        ctx.font = '24px Arial';
        ctx.fillText('Press SPACE to start', canvas.width/2, 200);
        ctx.fillText('Double jump + Coyote time', canvas.width/2, 240);
    }

    function drawReadyScreen() {
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = '#FFF';
        ctx.font = '24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Press SPACE to begin!', canvas.width/2, 200);
    }

    function drawGameOver() {
        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = '#FFF';
        ctx.font = '48px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('GAME OVER', canvas.width/2, 150);
        
        ctx.font = '24px Arial';
        ctx.fillText(`Score: ${score}m`, canvas.width/2, 200);
        ctx.fillText('Press SPACE to restart', canvas.width/2, 250);
    }

    function gameLoop(timestamp) {
        update(timestamp);
        draw();
        requestAnimationFrame(gameLoop);
    }

    requestAnimationFrame(gameLoop);

    return gameContainer;
}