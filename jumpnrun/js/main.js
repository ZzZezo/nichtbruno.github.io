(function() {
  // This function creates and returns the game container + starts the loop
  function createJumpAndRun() {
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
    if (!ctx) {
      console.error('Could not get 2D context');
      return gameContainer;
    }

    ///////////////////
    //  BACKGROUNDS  //
    ///////////////////

    // Use absolute paths from project root (adjust if your images are elsewhere)
    const menuBackgroundImage = new Image();
    menuBackgroundImage.src = '../../assets/images/jumpnrun/menu-bg.png';
    let isMenuBackgroundLoaded = false;
    menuBackgroundImage.onload = () => { isMenuBackgroundLoaded = true; };
    menuBackgroundImage.onerror = () => { console.warn('Menu bg failed to load'); };

    const backgroundImage = new Image();
    backgroundImage.src = '../../assets/images/jumpnrun/bg.png';
    let isBackgroundLoaded = false;
    backgroundImage.onload = () => { isBackgroundLoaded = true; };
    backgroundImage.onerror = () => { console.warn('Game bg failed to load'); };

    const gameoverBackgroundImage = new Image();
    gameoverBackgroundImage.src = '../../assets/images/jumpnrun/gameover.png';
    let isGOBackgroundLoaded = false;
    gameoverBackgroundImage.onload = () => { isGOBackgroundLoaded = true; };
    gameoverBackgroundImage.onerror = () => { console.warn('Gameover bg failed to load'); };

    function drawMenuBackground() {
      if (isMenuBackgroundLoaded) {
        ctx.drawImage(menuBackgroundImage, 0, 0, canvas.width, canvas.height);
      } else {
        ctx.fillStyle = '#f0f0f0';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    }

    function drawBackground() {
      if (isBackgroundLoaded) {
        ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
      } else {
        ctx.fillStyle = '#f0f0f0';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    }

    function drawGameoverBackground() {
      if (isGOBackgroundLoaded) {
        ctx.drawImage(gameoverBackgroundImage, 0, 0, canvas.width, canvas.height);
      } else {
        ctx.fillStyle = '#f0f0f0';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    }

    ///////////////////
    //  GAME LOGIC   //
    ///////////////////

    const GAME_STATE = { MENU: 0, PLAYING: 1, GAME_OVER: 2 };
    let chaosMode = false;
    let gameState = GAME_STATE.MENU;
    let distance = 0;
    let speedIncrease = 0;
    let lastSpeedIncrement = 0;
    let highScore = 0;
    let floHighScore = 0;

    // Player
    const player = {
      x: 100, y: 400, width: 30, height: 40,
      velocityY: 0, gravity: 0.5, jumpPower: 12,
      speed: 5, isJumping: false,
      canDoubleJump: false, hasDoubleJumped: false,
      color: '#3498db'
    };

    // Platforms
    const platforms = [];
    const platformWidth = 100;
    const platformHeight = 20;
    const platformColor = '#222222';
    const SPEED_SPAWN_CHANCE = 0.1;
    const SLOW_SPAWN_CHANCE = 0.1;

    // Menu buttons
    const playButton = {
      x: canvas.width / 2 - 100, y: canvas.height / 2,
      width: 200, height: 50, text: 'PLAY',
      color: '#fd8c46', hoverColor: '#e67e3e'
    };
    const chaosButton = {
      x: canvas.width / 2 + 20, y: canvas.height - 185,
      width: 50, height: 20,
    };

    // Keys
    const keys = { space: false, r: false, q: false, e: false };

    function initGame() {
      platforms.length = 0;
      player.x = 100;
      player.y = 400;
      player.speed = 5;
      player.velocityY = 0;
      player.isJumping = false;
      player.canDoubleJump = false;
      player.hasDoubleJumped = false;
      distance = 0;
      speedIncrease = 0;
      lastSpeedIncrement = 0;
      platforms.push({ x: 50, y: 440, width: 150, height: platformHeight, type: 'static', color: platformColor, powerUp: { active: false } });
      generateInitialPlatforms();
    }

    function generateInitialPlatforms() {
      let x = 250;
      for (let i = 0; i < 5; i++) {
        x += Math.random() * 200 + 100;
        let platformType = 'static';
        let platformColorChoice = platformColor;
        if (Math.random() < 0.2) {
          platformType = Math.random() < 0.5 ? 'vertical' : 'horizontal';
          platformColorChoice = '#e93532';
        }
        if (Math.random() < 0.15) {
          platformType = 'wall';
          platformColorChoice = '#f3ae35';
        }
        const newPlatform = {
          x: x, y: 300 + Math.random() * 150,
          width: platformType == 'wall' ? platformHeight : platformWidth + Math.random() * 50,
          height: platformType == 'wall' ? platformWidth + Math.random() * 50 : platformHeight,
          type: platformType, color: platformColorChoice,
          direction: 1, startX: x, startY: 300 + Math.random() * 150,
          moveRange: 80 + Math.random() * 40, moveSpeed: 1 + Math.random() * 1.5,
          powerUp: { active: false }
        };
        if (platformType === 'static' && Math.random() < SPEED_SPAWN_CHANCE) {
          newPlatform.powerUp = { active: true, type: 'speed', offsetX: newPlatform.width/2-10, offsetY: 30, width:20, height:20 };
        }
        platforms.push(newPlatform);
      }
    }

    function generatePlatform() {
      const lastPlatform = platforms[platforms.length-1];
      let platformType = 'static';
      let platformColorChoice = platformColor;
      if (Math.random() < 0.2) {
        platformType = Math.random() < 0.5 ? 'vertical' : 'horizontal';
        platformColorChoice = '#e93532';
      }
      if (Math.random() < 0.15) {
        platformType = 'wall';
        platformColorChoice = '#f3ae35';
      }
      const y = 300 + Math.random() * 150;
      const x = lastPlatform.x + Math.random() * 200 + 150 + speedIncrease * 10;
      const newPlatform = {
        x: x, y: y,
        width: platformType == 'wall' ? platformHeight : platformWidth + Math.random() * 50,
        height: platformType == 'wall' ? platformWidth + Math.random() * 50 : platformHeight,
        type: platformType, color: platformColorChoice,
        direction: 1, startX: x, startY: y,
        moveRange: 80 + Math.random() * 40, moveSpeed: 1 + Math.random() * 1.5,
        powerUp: { active: false }
      };
      if (platformType === 'static' && Math.random() < SPEED_SPAWN_CHANCE) {
        newPlatform.powerUp = { active: true, type: 'speed', offsetX: newPlatform.width/2-10, offsetY: 30, width:20, height:20 };
      }
      if (chaosMode && platformType === 'static' && Math.random() < SLOW_SPAWN_CHANCE) {
        newPlatform.powerUp = { active: true, type: 'slow', offsetX: newPlatform.width/2-10, offsetY: 30, width:20, height:20 };
      }
      platforms.push(newPlatform);
    }

    // Event listeners
    document.addEventListener('keydown', (e) => {
      if (e.code === 'Space') keys.space = true;
      if (e.code === 'KeyR') keys.r = true;
      if (e.code === 'KeyQ') keys.q = true;
      if (e.code === 'KeyE') keys.e = true;
    });
    document.addEventListener('keyup', (e) => {
      if (e.code === 'Space') keys.space = false;
      if (e.code === 'KeyR') keys.r = false;
      if (e.code === 'KeyQ') keys.q = false;
      if (e.code === 'KeyE') keys.e = false;
    });

    let mouseX = 0, mouseY = 0, mousePressed = false;
    canvas.addEventListener('mousemove', (e) => {
      const rect = canvas.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
    });
    canvas.addEventListener('mousedown', () => mousePressed = true);
    canvas.addEventListener('mouseup', () => mousePressed = false);

    function processInput() {
      if (gameState === GAME_STATE.MENU) {
        if (mousePressed &&
            mouseX >= playButton.x && mouseX <= playButton.x + playButton.width &&
            mouseY >= playButton.y && mouseY <= playButton.y + playButton.height) {
          gameState = GAME_STATE.PLAYING;
          mousePressed = false;
          initGame();
        }
        if (mousePressed &&
            mouseX >= chaosButton.x && mouseX <= chaosButton.x + chaosButton.width &&
            mouseY >= chaosButton.y && mouseY <= chaosButton.y + chaosButton.height) {
          chaosMode = !chaosMode;
          mousePressed = false;
        }
        if (keys.space) {
          gameState = GAME_STATE.PLAYING;
          keys.space = false;
          initGame();
        }
        if (keys.e) {
          chaosMode = !chaosMode;
          keys.e = false;
        }
      } else if (gameState === GAME_STATE.GAME_OVER) {
        if (keys.r) {
          gameState = GAME_STATE.PLAYING;
          keys.r = false;
          initGame();
        }
        if (keys.q) {
          gameState = GAME_STATE.MENU;
          keys.q = false;
        }
      } else if (gameState === GAME_STATE.PLAYING) {
        if (keys.space) {
          if (!player.isJumping) {
            player.velocityY = -player.jumpPower;
            player.isJumping = true;
            player.canDoubleJump = true;
            player.hasDoubleJumped = false;
          } else if (player.canDoubleJump && !player.hasDoubleJumped) {
            player.velocityY = -player.jumpPower * 0.8;
            player.hasDoubleJumped = true;
            player.canDoubleJump = false;
          }
          keys.space = false;
        }
      }
    }

    function updateGame() {
      player.velocityY += player.gravity;
      player.y += player.velocityY;

      if (player.y > canvas.height) {
        if (chaosMode) { if (distance > floHighScore) floHighScore = distance; }
        else { if (distance > highScore) highScore = distance; }
        gameState = GAME_STATE.GAME_OVER;
        return;
      }

      const currentSpeed = player.speed + speedIncrease;
      platforms.forEach(p => {
        p.x -= currentSpeed;
        if (p.type === 'vertical') {
          p.y = p.startY + Math.sin(Date.now() * 0.003) * p.moveRange;
        } else if (p.type === 'horizontal') {
          p.x += Math.sin(Date.now() * 0.002) * p.moveSpeed;
        }

        if (p.powerUp && p.powerUp.active) {
          const puX = p.x + p.powerUp.offsetX;
          const puY = p.y - p.powerUp.offsetY;
          if (player.x < puX + p.powerUp.width &&
              player.x + player.width > puX &&
              player.y < puY + p.powerUp.height &&
              player.y + player.height > puY) {
            if (p.powerUp.type == 'speed') player.speed *= 1.1;
            else player.speed *= 0.9;
            p.powerUp.active = false;
          }
        }
      });

      let onPlatform = false;
      let collisionWithWall = false;
      platforms.forEach(p => {
        if (player.y + player.height >= p.y &&
            player.y + player.height <= p.y + p.height &&
            player.x + player.width > p.x &&
            player.x < p.x + p.width &&
            player.velocityY >= 0) {
          player.y = p.y - player.height;
          player.velocityY = 0;
          player.isJumping = false;
          player.hasDoubleJumped = false;
          onPlatform = true;
        }
        if (p.type === 'wall' && !collisionWithWall) {
          if (player.x < p.x + p.width &&
              player.x + player.width > p.x &&
              player.y < p.y + p.height &&
              player.y + player.height > p.y) {
            const isTopCollision = (player.y + player.height >= p.y &&
                                     player.y + player.height <= p.y + p.height &&
                                     player.velocityY >= 0);
            if (!isTopCollision) collisionWithWall = true;
          }
        }
      });

      if (collisionWithWall) {
        if (chaosMode) { if (distance > floHighScore) floHighScore = distance; }
        else { if (distance > highScore) highScore = distance; }
        gameState = GAME_STATE.GAME_OVER;
        return;
      }

      if (platforms[0] && platforms[0].x + platforms[0].width < 0) {
        platforms.shift();
        generatePlatform();
      }

      distance += currentSpeed / 100;
      if (Math.floor(distance / 5) > lastSpeedIncrement) {
        speedIncrease += 0.1;
        lastSpeedIncrement = Math.floor(distance / 5);
      }
    }

    function drawGame() {
      platforms.forEach(p => {
        ctx.fillStyle = p.color;
        if (p.type === 'static') ctx.fillRect(p.x, p.y, p.width, 300);
        else ctx.fillRect(p.x, p.y, p.width, p.height);
        if (p.powerUp && p.powerUp.active) {
          const puX = p.x + p.powerUp.offsetX;
          const puY = p.y - p.powerUp.offsetY;
          if (p.powerUp.type == 'speed') {
            ctx.fillStyle = '#2ecc71';
            ctx.beginPath();
            ctx.moveTo(puX, puY);
            ctx.lineTo(puX, puY + p.powerUp.height);
            ctx.lineTo(puX + p.powerUp.width, puY + p.powerUp.height/2);
            ctx.closePath();
            ctx.fill();
          } else {
            ctx.fillStyle = '#c357f2';
            ctx.beginPath();
            ctx.moveTo(puX + p.powerUp.width, puY);
            ctx.lineTo(puX + p.powerUp.width, puY + p.powerUp.height);
            ctx.lineTo(puX, puY + p.powerUp.height/2);
            ctx.closePath();
            ctx.fill();
          }
        }
      });

      ctx.fillStyle = player.color;
      ctx.fillRect(player.x, player.y, player.width, player.height);

      if (player.isJumping && !player.hasDoubleJumped && player.canDoubleJump) {
        ctx.fillStyle = 'rgba(255,255,255,0.7)';
        ctx.beginPath();
        ctx.arc(player.x + player.width/2, player.y - 15, 4, 0, 2*Math.PI);
        ctx.fill();
      }

      ctx.fillStyle = '#fff';
      ctx.font = '18px "Courier New", monospace';
      ctx.fillText(`Distance: ${Math.floor(distance)}m`, 20, 30);
      ctx.fillText(`Speed: ${(player.speed + speedIncrease).toFixed(1)}`, 20, 55);

      if (chaosMode) {
        if (floHighScore > 0) ctx.fillText(`Flo-mode High Score: ${Math.floor(floHighScore)}m`, 20, 80);
      } else {
        if (highScore > 0) ctx.fillText(`High Score: ${Math.floor(highScore)}m`, 20, 80);
      }

      ctx.font = '12px "Courier New", monospace';
      ctx.fillText('Legend:', canvas.width - 150, 20);
      ctx.fillStyle = platformColor;
      ctx.fillRect(canvas.width - 150, 30, 20, 10);
      ctx.fillStyle = '#fff';
      ctx.fillText('Normal', canvas.width - 120, 40);
      ctx.fillStyle = '#e93532';
      ctx.fillRect(canvas.width - 150, 50, 20, 10);
      ctx.fillText('Moving', canvas.width - 120, 60);
      ctx.fillStyle = '#f3ae35';
      ctx.fillRect(canvas.width - 150, 70, 20, 10);
      ctx.fillText('Wall', canvas.width - 120, 80);
      ctx.fillStyle = '#2ecc71';
      ctx.fillRect(canvas.width - 150, 90, 20, 10);
      ctx.fillText('Speed', canvas.width - 120, 100);
      if (chaosMode) {
        ctx.fillStyle = '#c357f2';
        ctx.fillRect(canvas.width - 150, 110, 20, 10);
        ctx.fillText('Slow', canvas.width - 120, 120);
      }
    }

    function drawMenu() {
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 48px "Courier New", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('Holy Jump', canvas.width/2, 150);
      ctx.font = '24px "Courier New", monospace';
      ctx.fillText('Leap into the holy! 🙏', canvas.width/2, 200);

      const hover = mouseX >= playButton.x && mouseX <= playButton.x + playButton.width &&
                    mouseY >= playButton.y && mouseY <= playButton.y + playButton.height;
      ctx.fillStyle = hover ? playButton.hoverColor : playButton.color;
      ctx.fillRect(playButton.x, playButton.y, playButton.width, playButton.height);
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 24px "Courier New", monospace';
      ctx.fillText(playButton.text, playButton.x + playButton.width/2, playButton.y + playButton.height/2 + 8);

      ctx.fillStyle = '#fff';
      ctx.font = '18px "Courier New", monospace';
      ctx.fillText('Flo-mode: ', canvas.width/2 - 20, canvas.height - 170);
      ctx.fillStyle = chaosMode ? '#35f132' : '#f14932';
      ctx.fillRect(chaosButton.x, chaosButton.y, chaosButton.width, chaosButton.height);
      ctx.fillStyle = '#fff';
      ctx.fillText(chaosMode ? "ON" : "OFF", chaosButton.x + chaosButton.width/2, chaosButton.y + chaosButton.height/2 + 8);

      ctx.font = '18px "Courier New", monospace';
      ctx.fillText('Controls:', canvas.width/2, canvas.height - 130);
      ctx.fillText('SPACE - Jump / Double Jump', canvas.width/2, canvas.height - 100);
      ctx.fillText('E - change mode (only here)', canvas.width/2, canvas.height - 80);
      ctx.fillText('*Double jump dot above player', canvas.width/2, canvas.height - 60);
      ctx.textAlign = 'left';

      if (highScore > 0) {
        ctx.font = '24px "Courier New", monospace';
        ctx.fillStyle = "#f1c40f";
        ctx.fillText(`High Score: ${Math.floor(highScore)}m`, 20, 30);
      }
      if (floHighScore > 0) {
        ctx.font = '24px "Courier New", monospace';
        ctx.fillStyle = "#edc3ff";
        ctx.fillText(`Flo-mode High Score: ${Math.floor(floHighScore)}m`, 20, 60);
      }
    }

    function drawGameOver() {
      ctx.fillStyle = 'rgba(0,0,0,0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 48px "Courier New", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('GAME OVER', canvas.width/2, canvas.height/2 - 40);
      ctx.font = '24px "Courier New", monospace';
      ctx.fillText(`Distance: ${Math.floor(distance)}m`, canvas.width/2, canvas.height/2 + 10);
      if (chaosMode) {
        if (distance >= floHighScore) {
          ctx.fillStyle = '#b051d9';
          ctx.fillText('NEW FLO-MODE HIGH SCORE!', canvas.width/2, canvas.height/2 + 50);
        } else {
          ctx.fillText(`Flo-mode High Score: ${Math.floor(floHighScore)}m`, canvas.width/2, canvas.height/2 + 50);
        }
      } else {
        if (distance >= highScore) {
          ctx.fillStyle = '#f1c40f';
          ctx.fillText('NEW HIGH SCORE!', canvas.width/2, canvas.height/2 + 50);
        } else {
          ctx.fillText(`High Score: ${Math.floor(highScore)}m`, canvas.width/2, canvas.height/2 + 50);
        }
      }
      ctx.fillStyle = '#fff';
      ctx.font = '20px "Courier New", monospace';
      ctx.fillText('Press R to restart', canvas.width/2, canvas.height/2 + 100);
      ctx.fillText('or Q for main menu', canvas.width/2, canvas.height/2 + 130);
      ctx.textAlign = 'left';
    }

    // Main update loop
    function update() {
      processInput();

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (gameState === GAME_STATE.MENU) {
        highScore = localStorage.getItem("JNR-highscore") || 0;
        floHighScore = localStorage.getItem("JNR-flohighscore") || 0;
        drawMenuBackground();
        drawMenu();
      } else if (gameState === GAME_STATE.PLAYING) {
        drawBackground();
        updateGame();
        drawGame();
      } else if (gameState === GAME_STATE.GAME_OVER) {
        if (chaosMode) {
          localStorage.setItem("JNR-flohighscore", floHighScore);
        } else {
          localStorage.setItem("JNR-highscore", highScore);
        }
        drawGameoverBackground();
        drawGameOver();
      }

      requestAnimationFrame(update);
    }

    // Start the loop (the canvas is already appended to the container)
    update();

    return gameContainer;
  }

  // When the page loads, append the game and start it
  window.addEventListener('load', () => {
    const wrapper = document.getElementById('game-wrapper');
    const game = createJumpAndRun();
    wrapper.appendChild(game);
  });
})();