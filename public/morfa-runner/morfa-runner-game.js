const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const startButton = document.getElementById("startButton");
const scoreDisplay = document.getElementById("score");
const fullscreenButton = document.getElementById("fullscreenButton");
const gameContainer = document.querySelector(".game-container");


const canvasWidth = canvas.width;
const canvasHeight = canvas.height;

let gameRunning = false;
let score = 0;
let gameSpeed = 1; // multiplier for all speeds
const maxGameSpeed = 3; // cap at 3x speed
const speedIncreaseRate = 0.0002; // how fast the game speeds up
let showingWelcome = true; // Start with welcome screen

// High scores system
let highScores = [];
let showingHighScores = false;
let enteringName = false;
let currentNameInput = "";
let nameInputIndex = 0;
const maxNameLength = 3;

// Background
const background = new Image();
background.src = "images/background.png";
let bgX = 0;
const bgWidth = 2700; // width of your image

// Ground
const groundImg = new Image();
groundImg.src = "images/ground.png";
const groundHeight = 100;
let groundX = 0; // Add scrolling position for ground
const baseScrollSpeed = 4;
const baseBgScrollSpeed = 1;

// Player
const playerSprite = new Image();
playerSprite.src = "images/player-sprite.png";

const player = {
  x: 50,
  y: canvasHeight - groundHeight - 100,
  width: 70,  // slightly smaller than 93 for fairer collision
  height: 100, // slightly smaller than 117 for fairer collision
  frameWidth: 93, // new cropped frame width
  frameHeight: 117, // new cropped frame height
  frameIndex: 1, // start on standing frame
  frameCount: 5,
  frameSpeed: 8,
  tickCount: 0,
  jumping: false,
  jumpSpeed: 0,
  canDoubleJump: false,
  hasDoubleJumped: false
};

// Obstacles
const obstacleTypes = [
  {
    src: "images/books.png", // Books - cropped to exact size
    width: 24,
    height: 25,
    hitboxWidth: 24,
    hitboxHeight: 25,
    hitboxOffsetX: 0,
    hitboxOffsetY: 0
  },
  {
    src: "images/bag.png", // Bag - cropped to exact size
    width: 35,
    height: 40,
    hitboxWidth: 35,
    hitboxHeight: 40,
    hitboxOffsetX: 0,
    hitboxOffsetY: 0
  },
  {
    src: "images/teacher.png", // Teacher - cropped to exact size
    width: 42,
    height: 94,
    hitboxWidth: 42,
    hitboxHeight: 94,
    hitboxOffsetX: 0,
    hitboxOffsetY: 0
  }
];
let obstacles = [];
const baseObstacleSpeed = 4;
const obstacleGap = 400;

// Values certificates (collectibles)
const valuesImg = new Image();
valuesImg.src = "images/values.png";
let values = [];
const valuesSpeed = 4; // moves with ground speed
const valuesSpawnChance = 0.3; // 30% chance to spawn with each obstacle
const valuesPoints = 50; // bonus points for collecting

// Confetti particles
let confetti = [];
const confettiColors = ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'];
const confettiLifetime = 60; // frames

// Score popups
let scorePopups = [];

// Retro music system
let musicInitialized = false;
let backgroundMusic;
let collectSound;
let jumpSound;

// Load all images and show Start button
const imagesToLoad = [background, groundImg, playerSprite, valuesImg];
obstacleTypes.forEach(type => {
  const img = new Image();
  img.src = type.src;
  imagesToLoad.push(img);
});

let imagesLoaded = 0;
imagesToLoad.forEach(img => {
  img.onload = () => {
    imagesLoaded++;
    if (imagesLoaded === imagesToLoad.length) {
      loadHighScores();
      // Don't show start button yet - show welcome screen first
    }
  };
});

// Canvas and context initialized

// Start the game loop immediately to show welcome screen
loop();

// Input
document.addEventListener("keydown", e => {
  if (showingWelcome) {
    if (e.code === "Space" || e.key === "Enter") {
      showingWelcome = false;
      startButton.style.display = "block";
    }
  } else if (enteringName) {
    if (e.key.length === 1 && e.key.match(/[a-zA-Z]/)) {
      if (currentNameInput.length < maxNameLength) {
        currentNameInput += e.key.toUpperCase();
      }
    } else if (e.key === "Backspace") {
      currentNameInput = currentNameInput.slice(0, -1);
    } else if (e.key === "Enter") {
      // Allow Enter even with short names - pad with spaces if needed
      if (currentNameInput.length === 0) {
        currentNameInput = "???";
      } else if (currentNameInput.length < maxNameLength) {
        currentNameInput = currentNameInput.padEnd(maxNameLength, " ");
      }
      saveHighScore(currentNameInput, score);
      enteringName = false;
      showingHighScores = true;
      currentNameInput = "";
    }
  } else if (showingHighScores) {
    if (e.key === "Enter") {
      showingHighScores = false;
      startButton.style.display = "none";
    }
  } else if (e.code === "Space" && gameRunning) {
    if (!player.jumping) {
      // First jump
      player.jumping = true;
      player.jumpSpeed = -12;
      player.canDoubleJump = true;
      player.hasDoubleJumped = false;
      playJumpSound();
    } else if (player.canDoubleJump && !player.hasDoubleJumped) {
      // Double jump
      player.jumpSpeed = -10;
      player.hasDoubleJumped = true;
      player.canDoubleJump = false;
      playJumpSound();
    }
  }
});

// Enhanced fullscreen support for mobile
fullscreenButton.addEventListener("click", async () => {
  console.log('Fullscreen button clicked');
  
  try {
    if (!document.fullscreenElement && !document.webkitFullscreenElement && !document.mozFullScreenElement && !document.msFullscreenElement) {
      console.log('Entering fullscreen mode');
      
      // Try different fullscreen methods for better browser support
      if (gameContainer.requestFullscreen) {
        await gameContainer.requestFullscreen();
        console.log('Fullscreen activated via requestFullscreen');
      } else if (gameContainer.webkitRequestFullscreen) {
        gameContainer.webkitRequestFullscreen();
        console.log('Fullscreen activated via webkitRequestFullscreen');
      } else if (gameContainer.mozRequestFullScreen) {
        gameContainer.mozRequestFullScreen();
        console.log('Fullscreen activated via mozRequestFullScreen');
      } else if (gameContainer.msRequestFullscreen) {
        gameContainer.msRequestFullscreen();
        console.log('Fullscreen activated via msRequestFullscreen');
      } else {
        console.log('Fullscreen API not supported');
        alert('Fullscreen is not supported in this browser');
      }
    } else {
      console.log('Exiting fullscreen mode');
      
      if (document.exitFullscreen) {
        await document.exitFullscreen();
        console.log('Fullscreen exited via exitFullscreen');
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
        console.log('Fullscreen exited via webkitExitFullscreen');
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
        console.log('Fullscreen exited via mozCancelFullScreen');
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
        console.log('Fullscreen exited via msExitFullscreen');
      }
    }
  } catch (error) {
    console.error('Fullscreen error:', error);
    alert(`Fullscreen failed: ${error.message}`);
  }
});

// Listen for fullscreen changes to update button state
document.addEventListener('fullscreenchange', updateFullscreenButton);
document.addEventListener('webkitfullscreenchange', updateFullscreenButton);
document.addEventListener('mozfullscreenchange', updateFullscreenButton);
document.addEventListener('MSFullscreenChange', updateFullscreenButton);

function updateFullscreenButton() {
  const isFullscreen = document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement;
  
  if (isFullscreen) {
    fullscreenButton.setAttribute('aria-label', 'Exit Fullscreen');
    fullscreenButton.title = 'Exit Fullscreen';
    console.log('Entered fullscreen mode');
  } else {
    fullscreenButton.setAttribute('aria-label', 'Enter Fullscreen');
    fullscreenButton.title = 'Enter Fullscreen';
    console.log('Exited fullscreen mode');
  }
}

// Initialize button state on page load
updateFullscreenButton();

// Enhanced mobile touch support
function handleJump() {
  if (showingWelcome) {
    showingWelcome = false;
    startButton.style.display = "block";
    return;
  }
  
  if (!gameRunning) return;
  
  if (!player.jumping) {
    // First jump
    player.jumping = true;
    player.jumpSpeed = -12;
    player.canDoubleJump = true;
    player.hasDoubleJumped = false;
    playJumpSound();
  } else if (player.canDoubleJump && !player.hasDoubleJumped) {
    // Double jump
    player.jumpSpeed = -10;
    player.hasDoubleJumped = true;
    player.canDoubleJump = false;
    playJumpSound();
  }
}

// Touch event handlers
canvas.addEventListener("touchstart", (e) => {
  e.preventDefault(); // Prevent scrolling and other default behaviors
  handleJump();
}, { passive: false });

canvas.addEventListener("touchend", (e) => {
  e.preventDefault();
}, { passive: false });

canvas.addEventListener("touchmove", (e) => {
  e.preventDefault(); // Prevent scrolling
}, { passive: false });

// Enhanced click handler (keep existing functionality)
canvas.addEventListener("click", (e) => {
  e.preventDefault();
  handleJump();
});

// Prevent context menu on long press
canvas.addEventListener("contextmenu", (e) => {
  e.preventDefault();
});

// Prevent double-tap zoom
canvas.addEventListener("gesturestart", (e) => {
  e.preventDefault();
});

startButton.addEventListener("click", () => {
  if (showingHighScores) {
    showingHighScores = false;
    startButton.style.display = "none";
  }
  
  // Initialize music on first user interaction if not already done
  if (!musicInitialized) {
    initMusic().then(() => {
      console.log("Music ready after initialization");
      startGame();
    }).catch(error => {
      console.log("Music init failed:", error);
      startGame(); // Start game anyway
    });
  } else {
    startGame();
  }
});

// Welcome screen click handler
canvas.addEventListener("click", () => {
  if (showingWelcome) {
    showingWelcome = false;
    startButton.style.display = "block";
  }
});

function startGame() {
  startButton.style.display = "none";
  showingWelcome = false;
  showingHighScores = false;
  enteringName = false;
  gameRunning = true;
  score = 0;
  gameSpeed = 1; // reset speed
  bgX = 0;
  groundX = 0; // Reset ground position
  obstacles = [];
  values = []; // reset values
  confetti = []; // reset confetti
  scorePopups = []; // reset score popups
  player.frameIndex = 1;
  player.y = canvasHeight - groundHeight - player.height;
  player.jumping = false;
  player.canDoubleJump = false;
  player.hasDoubleJumped = false;
  
  // Start music
  console.log("Checking music state:", { 
    musicInitialized, 
    backgroundMusic: !!backgroundMusic,
    transportState: Tone.Transport.state 
  });
  
  if (musicInitialized && backgroundMusic) {
    console.log("Attempting to start background music");
    try {
      if (Tone.Transport.state !== "started") {
        Tone.Transport.start();
        console.log("Transport started");
      }
      if (backgroundMusic.state !== "started") {
        backgroundMusic.start();
        console.log("Background music loop started");
      }
      console.log("Background music should now be playing");
    } catch (error) {
      console.log("Error starting music:", error);
    }
  } else {
    console.log("Music not ready - will play without background music");
  }
  
  loop();
}

function loop() {
  if (!gameRunning && !showingHighScores && !enteringName && !showingWelcome) {
    // Game is completely stopped - show start button and clear canvas
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    
    // Draw static background for start screen
    const backgroundHeight = canvasHeight - groundHeight;
    ctx.drawImage(background, 0, 0, bgWidth, backgroundHeight);
    ctx.drawImage(groundImg, 0, canvasHeight - groundHeight, canvasWidth, groundHeight);
    
    startButton.style.display = "block";
    return;
  }
  
  if (gameRunning) {
    update();
  }
  draw();
  requestAnimationFrame(loop);
}

function update() {
  score++;
  scoreDisplay.textContent = "Score: " + score;

  // Gradually increase game speed
  if (gameSpeed < maxGameSpeed) {
    gameSpeed += speedIncreaseRate;
  }

  // Calculate current speeds based on game speed
  const currentScrollSpeed = baseScrollSpeed * gameSpeed;
  const currentBgScrollSpeed = baseBgScrollSpeed * gameSpeed;
  const currentObstacleSpeed = baseObstacleSpeed * gameSpeed;

  // Background scroll (slower for parallax effect)
  bgX -= currentBgScrollSpeed;
  if (bgX <= -bgWidth) {
    bgX = 0;
  }

  // Ground scroll (normal speed)
  groundX -= currentScrollSpeed;
  if (groundX <= -canvasWidth) {
    groundX = 0;
  }

  // Player animation
  if (!player.jumping) {
    player.tickCount++;
    if (player.tickCount > player.frameSpeed) {
      player.tickCount = 0;
      player.frameIndex++;
      if (player.frameIndex > 3) player.frameIndex = 1; // running frames (2,3,4)
    }
  } else {
    player.frameIndex = 4; // jump frame (last frame)
    player.y += player.jumpSpeed;
    player.jumpSpeed += 0.6;

    if (player.y >= canvasHeight - groundHeight - player.height) {
      player.y = canvasHeight - groundHeight - player.height;
      player.jumping = false;
      player.canDoubleJump = false;
      player.hasDoubleJumped = false;
    }
  }

  // Obstacles
  if (obstacles.length === 0 || obstacles[obstacles.length - 1].x < canvasWidth - obstacleGap) {
    const obstacleType = obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)];
    const img = new Image();
    img.src = obstacleType.src;
    obstacles.push({
      img: img,
      type: obstacleType,
      x: canvasWidth,
      y: canvasHeight - groundHeight - obstacleType.height,
      width: obstacleType.width,
      height: obstacleType.height
    });

    // Randomly spawn a values certificate
    if (Math.random() < valuesSpawnChance) {
      values.push({
        x: canvasWidth + 100, // spawn a bit ahead of obstacle
        y: canvasHeight - groundHeight - 160, // higher up for visibility
        width: 40, // matches your new PNG size
        height: 32, // matches your new PNG size
        collected: false
      });
    }
  }

  obstacles.forEach(ob => {
    ob.x -= currentObstacleSpeed;
  });

  // Update values certificates
  values.forEach(val => {
    val.x -= currentObstacleSpeed;
  });

  // Update confetti particles
  confetti.forEach(particle => {
    particle.x += particle.vx;
    particle.y += particle.vy;
    particle.vy += 0.2; // gravity
    particle.life--;
  });

  // Update score popups
  scorePopups.forEach(popup => {
    popup.y -= 1; // float upward
    popup.life--;
  });

  obstacles = obstacles.filter(ob => ob.x + ob.width > 0);
  values = values.filter(val => val.x + val.width > 0 && !val.collected);
  confetti = confetti.filter(particle => particle.life > 0);
  scorePopups = scorePopups.filter(popup => popup.life > 0);

  // Check values collection
  values.forEach(val => {
    if (!val.collected &&
        player.x < val.x + val.width &&
        player.x + player.width > val.x &&
        player.y < val.y + val.height &&
        player.y + player.height > val.y) {
      val.collected = true;
      score += valuesPoints; // bonus points!
      playCollectSound();
      
      // Create confetti burst
      for (let i = 0; i < 25; i++) {
        confetti.push({
          x: val.x + val.width / 2,
          y: val.y + val.height / 2,
          vx: (Math.random() - 0.5) * 12,
          vy: (Math.random() - 0.5) * 12 - 3,
          color: confettiColors[Math.floor(Math.random() * confettiColors.length)],
          size: Math.random() * 4 + 1,
          life: confettiLifetime + Math.random() * 30
        });
      }
      
      // Create +50 score popup
      scorePopups.push({
        x: val.x + val.width / 2,
        y: val.y - 10,
        text: "+50",
        life: 90 // 1.5 seconds
      });
    }
  });

  // Collision detection with custom hitboxes
  obstacles.forEach(ob => {
    // Use smaller hitbox when jumping for fairer collision
    let playerWidth = player.width;
    let playerHeight = player.height;
    let playerX = player.x;
    let playerY = player.y;
    
    if (player.jumping) {
      // Smaller hitbox for jump frame to avoid awkward collisions
      playerWidth = 50;  // reduced from 70
      playerHeight = 85; // reduced from 100
      playerX = player.x + 10; // offset to center the smaller hitbox
      playerY = player.y + 5;  // slight offset down
    }

    // Calculate obstacle hitbox position
    const hitboxX = ob.x + ob.type.hitboxOffsetX;
    const hitboxY = ob.y + ob.type.hitboxOffsetY;
    const hitboxWidth = ob.type.hitboxWidth;
    const hitboxHeight = ob.type.hitboxHeight;

    // Check collision with custom hitbox
    if (
      playerX < hitboxX + hitboxWidth &&
      playerX + playerWidth > hitboxX &&
      playerY < hitboxY + hitboxHeight &&
      playerY + playerHeight > hitboxY
    ) {
      gameOver();
    }
  });
}

function draw() {
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);

  if (showingWelcome) {
    drawWelcomeScreen();
    return;
  }

  if (showingHighScores) {
    drawHighScores();
    return;
  }

  if (enteringName) {
    drawNameEntry();
    return;
  }

  // Draw background (positioned to end where ground starts)
  const backgroundHeight = canvasHeight - groundHeight; // 300px high area above ground
  ctx.drawImage(background, bgX, 0, bgWidth, backgroundHeight);
  ctx.drawImage(background, bgX + bgWidth, 0, bgWidth, backgroundHeight);

  // Draw scrolling ground
  ctx.drawImage(groundImg, groundX, canvasHeight - groundHeight, canvasWidth, groundHeight);
  ctx.drawImage(groundImg, groundX + canvasWidth, canvasHeight - groundHeight, canvasWidth, groundHeight);

  // Draw player
  const spriteX = player.frameIndex * player.frameWidth;
  ctx.drawImage(playerSprite, spriteX, 0, player.frameWidth, player.frameHeight, player.x, player.y, player.width, player.height);

  // Draw obstacles
  obstacles.forEach(ob => {
    ctx.drawImage(ob.img, ob.x, ob.y, ob.width, ob.height);
  });

  // Draw values certificates
  values.forEach(val => {
    if (!val.collected) {
      ctx.drawImage(valuesImg, val.x, val.y, val.width, val.height);
    }
  });

  // Draw confetti particles
  confetti.forEach(particle => {
    ctx.fillStyle = particle.color;
    ctx.fillRect(particle.x, particle.y, particle.size, particle.size);
  });

  // Draw score popups LAST (on top of everything)
  scorePopups.forEach(popup => {
    ctx.save();
    ctx.fillStyle = "#FFD700";
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 3;
    ctx.font = "bold 24px Arial";
    ctx.textAlign = "center";
    
    // Add thick outline for better visibility
    ctx.strokeText(popup.text, popup.x, popup.y);
    ctx.fillText(popup.text, popup.x, popup.y);
    ctx.restore();
  });
}

function gameOver() {
  gameRunning = false;
  
  // Stop music only when actually stopping, not just pausing
  if (musicInitialized && backgroundMusic && backgroundMusic.state === "started") {
    console.log("Stopping background music");
    backgroundMusic.stop();
    Tone.Transport.stop();
  }
  
  // Check if this score qualifies for high scores
  if (isHighScore(score)) {
    enteringName = true;
    currentNameInput = "";
    loop(); // Continue loop for name entry
  } else {
    showingHighScores = true;
    loop(); // Continue loop for high scores display
  }
}

function loadHighScores() {
  const saved = JSON.parse(localStorage.getItem('morfa-runner-scores') || '[]');
  highScores = saved;
  
  // Add default scores if empty - much lower scores so kids can beat them!
  if (highScores.length === 0) {
    highScores = [
      { name: "???", score: 800 },
      { name: "???", score: 700 },
      { name: "???", score: 600 },
      { name: "???", score: 500 },
      { name: "???", score: 400 }
    ];
  }
}

function saveHighScore(name, score) {
  highScores.push({ name: name, score: score });
  highScores.sort((a, b) => b.score - a.score);
  highScores = highScores.slice(0, 10); // Keep only top 10
  
  try {
    localStorage.setItem('morfa-runner-scores', JSON.stringify(highScores));
  } catch(e) {
    console.log("Could not save high scores");
  }
}

function isHighScore(score) {
  return highScores.length < 10 || score > highScores[9].score;
}

function drawHighScores() {
  // Draw background
  ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);
  
  // Title
  ctx.fillStyle = "#FFD700";
  ctx.strokeStyle = "#000";
  ctx.lineWidth = 3;
  ctx.font = "bold 36px Arial";
  ctx.textAlign = "center";
  ctx.strokeText("HIGH SCORES", canvasWidth / 2, 60);
  ctx.fillText("HIGH SCORES", canvasWidth / 2, 60);
  
  // Scores list - better formatting
  ctx.font = "bold 20px Arial";
  highScores.forEach((entry, index) => {
    const y = 110 + index * 25;
    const rank = (index + 1).toString().padStart(2, '0');
    
    // Draw rank and name on left
    ctx.textAlign = "left";
    ctx.strokeText(`${rank}. ${entry.name}`, canvasWidth / 2 - 150, y);
    ctx.fillText(`${rank}. ${entry.name}`, canvasWidth / 2 - 150, y);
    
    // Draw score on right
    ctx.textAlign = "right";
    ctx.strokeText(entry.score.toString(), canvasWidth / 2 + 150, y);
    ctx.fillText(entry.score.toString(), canvasWidth / 2 + 150, y);
  });
  
  // Instructions - positioned lower to avoid overlap
  ctx.font = "18px Arial";
  ctx.fillStyle = "#FFFFFF";
  ctx.textAlign = "center";
  ctx.fillText("Press ENTER to continue", canvasWidth / 2, 370);
}

function drawNameEntry() {
  // Draw background
  ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);
  
  // Congratulations
  ctx.fillStyle = "#FFD700";
  ctx.strokeStyle = "#000";
  ctx.lineWidth = 3;
  ctx.font = "bold 32px Arial";
  ctx.textAlign = "center";
  ctx.strokeText("NEW HIGH SCORE!", canvasWidth / 2, 120);
  ctx.fillText("NEW HIGH SCORE!", canvasWidth / 2, 120);
  
  // Score
  ctx.font = "bold 28px Arial";
  ctx.strokeText(`Score: ${score}`, canvasWidth / 2, 170);
  ctx.fillText(`Score: ${score}`, canvasWidth / 2, 170);
  
  // Name prompt
  ctx.font = "24px Arial";
  ctx.fillStyle = "#FFFFFF";
  ctx.fillText("Enter your name (3 letters):", canvasWidth / 2, 220);
  
  // Name input
  ctx.font = "bold 36px Arial";
  ctx.fillStyle = "#FFD700";
  const displayName = currentNameInput + "_".repeat(maxNameLength - currentNameInput.length);
  ctx.strokeText(displayName, canvasWidth / 2, 270);
  ctx.fillText(displayName, canvasWidth / 2, 270);
  
  // Instructions
  ctx.font = "18px Arial";
  ctx.fillStyle = "#FFFFFF";
  ctx.fillText("Type letters, BACKSPACE to delete, ENTER to save", canvasWidth / 2, 320);
}

function drawWelcomeScreen() {
  // Draw beautiful gradient background
  const gradient = ctx.createLinearGradient(0, 0, 0, canvasHeight);
  gradient.addColorStop(0, "#87CEEB"); // Sky blue
  gradient.addColorStop(0.7, "#98FB98"); // Pale green
  gradient.addColorStop(1, "#228B22"); // Forest green
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  // Draw some decorative clouds
  ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
  ctx.beginPath();
  ctx.arc(150, 80, 25, 0, Math.PI * 2);
  ctx.arc(170, 80, 35, 0, Math.PI * 2);
  ctx.arc(190, 80, 25, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.beginPath();
  ctx.arc(650, 60, 20, 0, Math.PI * 2);
  ctx.arc(665, 60, 30, 0, Math.PI * 2);
  ctx.arc(680, 60, 20, 0, Math.PI * 2);
  ctx.fill();

  // Draw school building in background if loaded
  if (imagesLoaded >= imagesToLoad.length) {
    const backgroundHeight = canvasHeight - groundHeight;
    ctx.drawImage(background, 0, 0, bgWidth, backgroundHeight);
    ctx.drawImage(groundImg, 0, canvasHeight - groundHeight, canvasWidth, groundHeight);
  }

  // Semi-transparent overlay for text readability
  ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  // Game Title
  ctx.fillStyle = "#FFD700";
  ctx.strokeStyle = "#8B0000";
  ctx.lineWidth = 4;
  ctx.font = "bold 48px Arial";
  ctx.textAlign = "center";
  ctx.strokeText("MORFA RUNNER", canvasWidth / 2, 100);
  ctx.fillText("MORFA RUNNER", canvasWidth / 2, 100);

  // School name
  ctx.fillStyle = "#FFFFFF";
  ctx.strokeStyle = "#000";
  ctx.lineWidth = 2;
  ctx.font = "24px Arial";
  ctx.strokeText("Ysgol Maes Y Morfa", canvasWidth / 2, 140);
  ctx.fillText("Ysgol Maes Y Morfa", canvasWidth / 2, 140);

  // Welcome message
  ctx.font = "20px Arial";
  ctx.fillStyle = "#FFFFFF";
  ctx.fillText("Welcome to our school running adventure!", canvasWidth / 2, 180);

  // Instructions box
  ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
  ctx.fillRect(canvasWidth / 2 - 200, 200, 400, 120);
  ctx.strokeStyle = "#e11d48";
  ctx.lineWidth = 3;
  ctx.strokeRect(canvasWidth / 2 - 200, 200, 400, 120);

  // Instructions text
  ctx.fillStyle = "#333";
  ctx.font = "16px Arial";
  ctx.fillText("🏃‍♂️ Help our student run through the school!", canvasWidth / 2, 230);
  ctx.fillText("🎯 Collect VALUES certificates for bonus points", canvasWidth / 2, 255);
  ctx.fillText("⚡ Jump over books, bags, and Mrs Jones", canvasWidth / 2, 280);
  ctx.fillText("🏆 Beat the high scores and become champion!", canvasWidth / 2, 305);

  // Start prompt
  ctx.fillStyle = "#FFD700";
  ctx.strokeStyle = "#8B0000";
  ctx.lineWidth = 2;
  ctx.font = "bold 24px Arial";
  ctx.strokeText("CLICK TO START", canvasWidth / 2, 350);
  ctx.fillText("CLICK TO START", canvasWidth / 2, 350);

  // Animated prompt indicator - moved up to fit in frame
  const time = Date.now() * 0.005;
  const alpha = (Math.sin(time) + 1) / 2;
  ctx.fillStyle = `rgba(255, 215, 0, ${alpha})`;
  ctx.font = "16px Arial";
  ctx.fillText("Press SPACE or click anywhere to begin", canvasWidth / 2, 375);
}

// Music functions
async function initMusic() {
  try {
    await Tone.start();
    console.log("Tone.js started successfully");
    
    // Create sound effects first
    collectSound = new Tone.Synth({
      oscillator: { type: "sine" },
      envelope: { attack: 0.01, decay: 0.1, sustain: 0, release: 0.1 },
      volume: -10
    }).toDestination();
    
    jumpSound = new Tone.Synth({
      oscillator: { type: "triangle" },
      envelope: { attack: 0.01, decay: 0.1, sustain: 0, release: 0.1 },
      volume: -15
    }).toDestination();
    
    // Create background music synth
    const musicSynth = new Tone.Synth({
      oscillator: { type: "square" },
      envelope: { attack: 0.1, decay: 0.3, sustain: 0.3, release: 0.8 },
      volume: -20
    }).toDestination();
    
    // More complex melody - upbeat platformer style
    const melody = [
      // Energetic opening - jumping up
      "E4", "G4", "B4", "D5", "C5", "B4", "A4", "G4",
      // Quick descending run
      "F4", "E4", "D4", "E4", "F4", "G4", "A4", null,
      // Bouncy middle section
      "C5", "B4", "A4", "B4", "C5", "D5", "E5", null,
      "D5", "C5", "B4", "A4", "G4", "F4", "E4", "D4",
      // Adventure theme
      "G4", "A4", "B4", "C5", "D5", "E5", "F5", "G5",
      "F5", "E5", "D5", "C5", "B4", "A4", "G4", null,
      // Final energetic phrase
      "E4", "E4", "G4", "G4", "B4", "B4", "D5", "C5",
      "A4", "F4", "D4", "E4", "F4", "G4", "E4", null
    ];
    
    let noteIndex = 0;
    
    // Create the loop - upbeat tempo
    backgroundMusic = new Tone.Loop((time) => {
      const note = melody[noteIndex];
      if (note) { // Only play if not a rest (null)
        console.log("Playing note:", note);
        musicSynth.triggerAttackRelease(note, "8n", time);
      }
      noteIndex = (noteIndex + 1) % melody.length;
    }, "8n");
    
    musicInitialized = true;
    console.log("Music initialized successfully");
  } catch (error) {
    console.log("Could not initialize music:", error);
  }
}

function playCollectSound() {
  if (musicInitialized && collectSound) {
    collectSound.triggerAttackRelease("C5", "8n");
  }
}

function playJumpSound() {
  if (musicInitialized && jumpSound) {
    jumpSound.triggerAttackRelease("A4", "16n");
  }
}