export function createJumpAndRun() {
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

    ///////////////////
    //  BACKGROUNDS  //
    ///////////////////

    const menuBackgroundImage = new Image();
    menuBackgroundImage.src = '../images/jumpnrun/menu-bg.png';
    let isMenuBackgroundLoaded = false;

    menuBackgroundImage.onload = () => {
        isMenuBackgroundLoaded = true;
    };

    function drawMenuBackground() {
        if (isMenuBackgroundLoaded) {
            ctx.drawImage(menuBackgroundImage, 0, 0, canvas.width, canvas.height);
        } else {
            ctx.fillStyle = '#f0f0f0';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
    }

    const backgroundImage = new Image();
    backgroundImage.src = '../images/jumpnrun/bg.png';
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

    const gameoverBackgroundImage = new Image();
    gameoverBackgroundImage.src = '../images/jumpnrun/gameover.png';
    let isGOBackgroundLoaded = false;

    gameoverBackgroundImage.onload = () => {
        isGOBackgroundLoaded = true;
    };

    function drawGameoverBackground() {
        if (isGOBackgroundLoaded) {
            ctx.drawImage(gameoverBackgroundImage, 0, 0, canvas.width, canvas.height);
        } else {
            ctx.fillStyle = '#f0f0f0';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
    }

    ///////////////////
    //  BACKGROUNDS  //
    ///////////////////
    
    // Game states
    const GAME_STATE = {
        MENU: 0,
        PLAYING: 1,
        GAME_OVER: 2
    };
    
    // Game variables
    let gameState = GAME_STATE.MENU;
    let distance = 0;
    let speedIncrease = 0;
    let lastSpeedIncrement = 0;
    let highScore = 0;

    // Player properties
    const player = {
        x: 100,
        y: 400,
        width: 30,
        height: 40,
        velocityY: 0,
        gravity: 0.5,
        jumpPower: 12,
        speed: 5,
        isJumping: false,
        canDoubleJump: false,
        hasDoubleJumped: false,
        color: '#3498db'
    };

    // Platform properties
    const platforms = [];
    const platformWidth = 100;
    const platformHeight = 20;
    const platformColor = '#222222';

    // Menu buttons
    const playButton = {
        x: canvas.width / 2 - 100,
        y: canvas.height / 2,
        width: 200,
        height: 50,
        text: 'PLAY',
        color: '#fd8c46',
        hoverColor: '#e67e3e'
    };

    // Key state tracking
    const keys = {
        space: false,
        r: false,
        q: false,
    };

    // Initialize the game
    function initGame() {
        // Clear platforms
        platforms.length = 0;
        
        // Reset player
        player.x = 100;
        player.y = 400;
        player.speed = 5;
        player.velocityY = 0;
        player.isJumping = false;
        player.canDoubleJump = false;
        player.hasDoubleJumped = false;
        
        // Reset game variables
        distance = 0;
        speedIncrease = 0;
        lastSpeedIncrement = 0;
        
        // Create initial platform
        platforms.push({
            x: 50,
            y: 440,
            width: 150,
            height: platformHeight,
            type: 'static',
            color: platformColor
        });
        
        generateInitialPlatforms();
    }

    // Generate random platforms to start with
    function generateInitialPlatforms() {
        let x = 250;
        for (let i = 0; i < 5; i++) {
            x += Math.random() * 200 + 100;
            
            // Determine platform type
            let platformType = 'static';
            let platformColorChoice = platformColor;
            
            // 20% chance for moving platforms
            if (Math.random() < 0.2) {
                if (Math.random() < 0.5) {
                    platformType = 'vertical'; // Up and down
                    platformColorChoice = '#e93532'; // Red
                } else {
                    platformType = 'horizontal'; // Left and right
                    platformColorChoice = '#e93532'; // Blue
                }
            }
            if (Math.random() < 0.15) {
                platformType = 'wall';
                platformColorChoice = '#f3ae35';
            }

            const newPlatform = {
                x: x,
                y: 300 + Math.random() * 150,
                width: platformType == 'wall' ? platformHeight : platformWidth + Math.random() * 50,
                height: platformType == 'wall' ? platformWidth + Math.random() * 50 : platformHeight,
                type: platformType,
                color: platformColorChoice,
                direction: 1, // For moving platforms
                startX: x, // Original X position for horizontal platforms
                startY: 300 + Math.random() * 150, // Original Y position for vertical platforms
                moveRange: 80 + Math.random() * 40, // Movement range
                moveSpeed: 1 + Math.random() * 1.5, // Movement speed
                powerUp: {active: false}
            };

            if (platformType === 'static' && Math.random() < 0.1) {
                newPlatform.powerUp = {
                    active: true,
                    offsetX: newPlatform.width / 2 - 10, // Center horizontally
                    offsetY: 30,
                    width: 20,
                    height: 20
                };
            }
            
            platforms.push(newPlatform);
        }
    }

    // Generate a new platform
    function generatePlatform() {
        const lastPlatform = platforms[platforms.length - 1];
        
        // Determine platform type
        let platformType = 'static';
        let platformColorChoice = platformColor;
        
        // 20% chance for moving platforms
        if (Math.random() < 0.2) {
            if (Math.random() < 0.5) {
                platformType = 'vertical'; // Up and down
                platformColorChoice = '#e93532'; // Red
            } else {
                platformType = 'horizontal'; // Left and right
                platformColorChoice = '#e93532'; // Blue
            }
        }
        if (Math.random() < 0.15) {
            platformType = 'wall';
            platformColorChoice = '#f3ae35';
        }
        
        const y = 300 + Math.random() * 150;
        const x = lastPlatform.x + Math.random() * 200 + 150 + speedIncrease * 10;
        
        const newPlatform = {
            x: x,
            y: y,
            width: platformType == 'wall' ? platformHeight : platformWidth + Math.random() * 50,
            height: platformType == 'wall' ? platformWidth + Math.random() * 50 : platformHeight,
            type: platformType,
            color: platformColorChoice,
            direction: 1, // For moving platforms
            startX: x, // Original X position for horizontal platforms
            startY: y, // Original Y position for vertical platforms
            moveRange: 80 + Math.random() * 40, // Movement range
            moveSpeed: 1 + Math.random() * 1.5, // Movement speed
            powerUp: {active: false},
        };

        if (platformType === 'static' && Math.random() < 0.1) {
            newPlatform.powerUp = {
                active: true,
                offsetX: newPlatform.width / 2 - 10, // Center horizontally
                offsetY: 30, // 20px above platform
                width: 20,
                height: 20
            };
        }

        platforms.push(newPlatform);
    }
    
    // Input handling
    document.addEventListener('keydown', function(event) {
        if (event.code === 'Space') {
            keys.space = true;
        }
        if (event.code === 'KeyR') {
            keys.r = true;
        }
        if (event.code === 'KeyQ') {
            keys.q = true;
        }
    });
    
    document.addEventListener('keyup', function(event) {
        if (event.code === 'Space') {
            keys.space = false;
        }
        if (event.code === 'KeyR') {
            keys.r = false;
        }
        if (event.code === 'KeyQ') {
            keys.q = false;
        }
    });

    // Mouse tracking for menu
    let mouseX = 0;
    let mouseY = 0;
    let mousePressed = false;
    
    canvas.addEventListener('mousemove', function(event) {
        const rect = canvas.getBoundingClientRect();
        mouseX = event.clientX - rect.left;
        mouseY = event.clientY - rect.top;
    });
    
    canvas.addEventListener('mousedown', function() {
        mousePressed = true;
    });
    
    canvas.addEventListener('mouseup', function() {
        mousePressed = false;
    });

    // Process input within game loop
    function processInput() {
        // Main menu controls
        if (gameState === GAME_STATE.MENU) {
            // Check if play button is clicked
            if (mousePressed && 
                mouseX >= playButton.x && 
                mouseX <= playButton.x + playButton.width && 
                mouseY >= playButton.y && 
                mouseY <= playButton.y + playButton.height) {
                
                gameState = GAME_STATE.PLAYING;
                mousePressed = false;
                initGame();
            }
            
            // Start with space too
            if (keys.space) {
                gameState = GAME_STATE.PLAYING;
                keys.space = false;
                initGame();
            }
        }
        // Game over controls
        else if (gameState === GAME_STATE.GAME_OVER) {
            if (keys.r) {
                gameState = GAME_STATE.PLAYING;
                keys.r = false;
                initGame();
            }
            if (keys.q) {
                gameState = GAME_STATE.MENU;
                keys.q = false;
                initGame();
            }
        }
        // Playing controls
        else if (gameState === GAME_STATE.PLAYING) {
            if (keys.space) {
                if (!player.isJumping) {
                    // First jump
                    player.velocityY = -player.jumpPower;
                    player.isJumping = true;
                    player.canDoubleJump = true;
                    player.hasDoubleJumped = false;
                } else if (player.canDoubleJump && !player.hasDoubleJumped) {
                    // Double jump
                    player.velocityY = -player.jumpPower * 0.8; // Slightly less powerful
                    player.hasDoubleJumped = true;
                    player.canDoubleJump = false;
                }
                keys.space = false;
            }
        }
    }

    // Update game logic
    function update() {
        // Process input at the beginning of each frame
        processInput();
        
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw background
        ctx.fillStyle = '#333';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Handle different game states
        if (gameState === GAME_STATE.MENU) {
            highScore = localStorage.getItem("JNR-highscore");
            drawMenuBackground();
            drawMenu();
        } else if (gameState === GAME_STATE.PLAYING) {
            drawBackground();
            updateGame();
            drawGame();
        } else if (gameState === GAME_STATE.GAME_OVER) {
            localStorage.setItem("JNR-highscore", highScore);
            drawGameoverBackground();
            drawGameOver();
        }
        
        // Continue the game loop
        requestAnimationFrame(update);
    }
    
    // Draw main menu
    function drawMenu() {
        // Draw title
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 48px WIN';
        ctx.textAlign = 'center';
        ctx.fillText('Holy Jump', canvas.width / 2, 150);
        
        // Draw subtitle
        ctx.font = '24px WIN';
        ctx.fillText('This game is really kaka! 🙏💩', canvas.width / 2, 200);
        
        // Check if mouse is over play button
        const buttonHover = 
            mouseX >= playButton.x && 
            mouseX <= playButton.x + playButton.width && 
            mouseY >= playButton.y && 
            mouseY <= playButton.y + playButton.height;
            
        // Draw play button
        ctx.fillStyle = buttonHover ? playButton.hoverColor : playButton.color;
        ctx.fillRect(playButton.x, playButton.y, playButton.width, playButton.height);
        
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 24px WIN';
        ctx.fillText(playButton.text, playButton.x + playButton.width / 2, playButton.y + playButton.height / 2 + 8);
        
        // Draw instructions
        ctx.font = '18px WIN';
        ctx.fillText('Controls:', canvas.width / 2, canvas.height - 150);
        ctx.fillText('SPACE - Jump / Double Jump', canvas.width / 2, canvas.height - 120);
        ctx.fillText('*Double jump is shown by a dot above the player', canvas.width / 2, canvas.height - 90);
        
        // Reset text alignment
        ctx.textAlign = 'left';
        
        // Draw high score if exists
        if (highScore > 0) {
            ctx.font = '24px WIN';
            ctx.fillStyle = "#f1c40f"
            ctx.fillText(`High Score: ${Math.floor(highScore)}m`, 20, 30);
        }
    }
    
    // Update game state
    function updateGame() {
        // Update player physics
        player.velocityY += player.gravity;
        player.y += player.velocityY;

        // Check if player falls off the screen
        if (player.y > canvas.height) {
            if (distance > highScore) {
                highScore = distance;
            }
            gameState = GAME_STATE.GAME_OVER;
            return;
        }

        // Move and update platforms
        const currentSpeed = player.speed + speedIncrease;
        platforms.forEach(platform => {
            // Basic movement (scrolling left)
            platform.x -= currentSpeed;
            
            // Additional movement for special platforms
            if (platform.type === 'vertical') {
                // Move up and down
                platform.y = platform.startY + Math.sin(Date.now() * 0.003) * platform.moveRange;
            } else if (platform.type === 'horizontal') {
                // Move left and right (relative to the scrolling)
                platform.x += Math.sin(Date.now() * 0.002) * platform.moveSpeed;
            }

            if (platform.powerUp && platform.powerUp.active) {
                const puX = platform.x + platform.powerUp.offsetX;
                const puY = platform.y - platform.powerUp.offsetY;
    
                // Collision check
                if (player.x < puX + platform.powerUp.width &&
                    player.x + player.width > puX &&
                    player.y < puY + platform.powerUp.height &&
                    player.y + player.height > puY) {
    
                    // Apply speed boost
                    player.speed *= 1.1; // Permanent 10% increase
                    platform.powerUp.active = false; // Remove power-up
                }
            }
        });

        // Check for collision with platforms
        let onPlatform = false;
        let collisionWithWall = false; 
        platforms.forEach(platform => {
            if (
                player.y + player.height >= platform.y &&
                player.y + player.height <= platform.y + platform.height &&
                player.x + player.width > platform.x &&
                player.x < platform.x + platform.width &&
                player.velocityY >= 0
            ) {
                player.y = platform.y - player.height;
                player.velocityY = 0;
                player.isJumping = false;
                player.hasDoubleJumped = false;
                onPlatform = true;
            }

            if (platform.type === 'wall' && !collisionWithWall) {
                // General collision check
                if (
                    player.x < platform.x + platform.width &&
                    player.x + player.width > platform.x &&
                    player.y < platform.y + platform.height &&
                    player.y + player.height > platform.y
                ) {
                    // Verify it's NOT a top collision
                    const isTopCollision = 
                        player.y + player.height >= platform.y &&
                        player.y + player.height <= platform.y + platform.height &&
                        player.velocityY >= 0;
                    
                    if (!isTopCollision) {
                        collisionWithWall = true;
                    }
                }
            }    
        });

        if (collisionWithWall) {
            if (distance > highScore) {
                highScore = distance;
            }
            gameState = GAME_STATE.GAME_OVER;
            return;
        }

        // Remove platforms that are off-screen and generate new ones
        if (platforms[0].x + platforms[0].width < 0) {
            platforms.shift();
            generatePlatform();
        }

        // Increase distance and check for speed increases
        distance += currentSpeed / 100;
        
        // Speed increase every 10 meters instead of 50
        if (Math.floor(distance / 5) > lastSpeedIncrement) {
            speedIncrease += 0.1;
            lastSpeedIncrement = Math.floor(distance / 5);
        }
    }
    
    // Draw game elements
    function drawGame() {
        // Draw platforms
        platforms.forEach(platform => {
            ctx.fillStyle = platform.color;
            if (platform.type === 'static') {
                ctx.fillRect(platform.x, platform.y, platform.width, 300);
            } else {
                ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
            }

            if (platform.powerUp && platform.powerUp.active) {
                const puX = platform.x + platform.powerUp.offsetX;
                const puY = platform.y - platform.powerUp.offsetY;
    
                // Draw green right arrow
                ctx.fillStyle = '#2ecc71';
                ctx.beginPath();
                ctx.moveTo(puX, puY);
                ctx.lineTo(puX, puY + platform.powerUp.height);
                ctx.lineTo(puX + platform.powerUp.width, puY + platform.powerUp.height/2);
                ctx.closePath();
                ctx.fill();
            }
        });

        // Draw player
        ctx.fillStyle = player.color;
        ctx.fillRect(player.x, player.y, player.width, player.height);

        // Draw jump indicator
        if (player.isJumping && !player.hasDoubleJumped && player.canDoubleJump) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
            ctx.beginPath();
            ctx.arc(player.x + player.width / 2, player.y - 15, 4, 0, Math.PI * 2);
            ctx.fill();
        }

        // Draw distance counter
        ctx.fillStyle = '#fff';
        ctx.font = '18px WIN';
        ctx.fillText(`Distance: ${Math.floor(distance)}m`, 20, 30);
        ctx.fillText(`Speed: ${(player.speed + speedIncrease).toFixed(1)}`, 20, 55);
        
        // Draw high score if exists
        if (highScore > 0) {
            ctx.fillText(`High Score: ${Math.floor(highScore)}m`, 20, 80);
        }
        
        // Draw platform type legend
        ctx.fillStyle = '#fff';
        ctx.font = '12px WIN';
        ctx.fillText('Legend:', canvas.width - 150, 20);
        
        ctx.fillStyle = platformColor;
        ctx.fillRect(canvas.width - 150, 30, 20, 10);
        ctx.fillStyle = '#fff';
        ctx.fillText('Normal', canvas.width - 120, 40);
        
        ctx.fillStyle = '#e93532';
        ctx.fillRect(canvas.width - 150, 50, 20, 10);
        ctx.fillStyle = '#fff';
        ctx.fillText('Moving', canvas.width - 120, 60);

        ctx.fillStyle = '#f3ae35';
        ctx.fillRect(canvas.width - 150, 70, 20, 10);
        ctx.fillStyle = '#fff';
        ctx.fillText('Wall', canvas.width - 120, 80);

        ctx.fillStyle = '#2ecc71';
        ctx.fillRect(canvas.width - 150, 90, 20, 10);
        ctx.fillStyle = '#fff';
        ctx.fillText('Spped Boost', canvas.width - 120, 100);
    }
    
    // Draw game over screen
    function drawGameOver() {
        // Semi-transparent overlay
        ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Game over text
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 48px WIN';
        ctx.textAlign = 'center';
        ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2 - 40);
        
        // Score display
        ctx.font = '24px WIN';
        ctx.fillText(`Distance: ${Math.floor(distance)}m`, canvas.width / 2, canvas.height / 2 + 10);
        
        // High score display
        if (distance >= highScore) {
            ctx.fillStyle = '#f1c40f';
            ctx.fillText('NEW HIGH SCORE!', canvas.width / 2, canvas.height / 2 + 50);
        } else {
            ctx.fillText(`High Score: ${Math.floor(highScore)}m`, canvas.width / 2, canvas.height / 2 + 50);
        }
        
        // Restart instructions
        ctx.fillStyle = '#fff';
        ctx.font = '20px WIN';
        ctx.fillText('Press R to restart', canvas.width / 2, canvas.height / 2 + 100);
        ctx.fillText('or Q for main menu', canvas.width / 2, canvas.height / 2 + 130);
        
        // Reset text alignment
        ctx.textAlign = 'left';
    }

    // Initialize and start the game loop
    update();

    return gameContainer;
}

function checkCollision(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}