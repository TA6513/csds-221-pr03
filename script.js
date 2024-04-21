const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const defaultFrameRate = 60; // Default frame rate
let frameRate = defaultFrameRate; // Current frame rate

let dinoX = 50;
let dinoY = canvas.height - 40;
let dinoWidth = 40;
let dinoHeight = 40;

let obstacleX = canvas.width;
let obstacleWidth = 20;
let obstacleHeight = 40;
let obstacleSpeed = 5;

let isJumping = false;
let jumpHeight = 65;
let jumpSpeed = 10;
const jumpAcceleration = -9; // Adjust as needed
const gravity = 0.6; // Adjust as needed

let score = 0;
const scoreIncrementPerSecond = 10;
const speedDisplay = document.getElementById('speed');
let isGameOver = false;

let isPaused = false;
let pausedText = "Paused";
let gameLoopInterval; // Variable to hold the interval for the game loop
const pauseButton = document.getElementById('pauseButton');
const resetButton = document.getElementById('resetButton');

const dinoImage = new Image();
dinoImage.src = 'dino.png'; // Replace 'trex.png' with the path to your T-Rex image


// Function to draw the T-Rex dino
function drawDino() {
    ctx.drawImage(dinoImage, dinoX, dinoY, 40, 40); // Adjust the width and height as needed
}

// Function to draw saguaro-like obstacles
function drawObstacle() {
    ctx.fillStyle = '#555';
    // Draw the main section of the saguaro
    ctx.fillRect(obstacleX, canvas.height - obstacleHeight, 8, obstacleHeight);

    // Draw the "L" shaped sections on the sides
    ctx.fillRect(obstacleX - 13, canvas.height - obstacleHeight + 10, 5, 15);
    ctx.fillRect(obstacleX - 10, canvas.height - obstacleHeight + 20, 10, 5);
    ctx.fillRect(obstacleX + 13, canvas.height - obstacleHeight + 15, 5, 10);
    ctx.fillRect(obstacleX + 8, canvas.height - obstacleHeight + 25, 10, 5);
}

function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function resetObstacle() {
    obstacleX = canvas.width + Math.random() * (canvas.width / 2); // Randomize the initial x position of the obstacle
}

function moveObstacle() {
    obstacleX -= obstacleSpeed;
    if (obstacleX + obstacleWidth < 0) {
        resetObstacle();
    }
} 

function playTone() {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain(); // Create a GainNode
    oscillator.type = 'square'; // Set oscillator type to square wave
    oscillator.frequency.setValueAtTime(520, audioContext.currentTime); // Set frequency (adjust as needed)
    oscillator.connect(gainNode); // Connect oscillator to the gain node
    gainNode.connect(audioContext.destination); // Connect gain node to the audio output
    gainNode.gain.value = 0.15; // Set the volume level (0 to 1)
    oscillator.start(); // Start the oscillator
    setTimeout(() => {
        oscillator.stop(); // Stop the oscillator after a short duration (adjust as needed)
    }, 50); // Stop after 50 milliseconds (adjust as needed)
}

function jump() {
    if (!isGameOver && !isJumping) {
        isJumping = true;
        playTone();
        let jumpSpeed = jumpAcceleration; // Initial jump speed
        let jumpInterval = setInterval(() => {
            // Update dino position based on jump speed
            dinoY += jumpSpeed;
            jumpSpeed += gravity; // Apply gravity

            // Check if dino has reached the ground
            if (dinoY >= canvas.height - dinoHeight) {
                dinoY = canvas.height - dinoHeight; // Ensure dino doesn't go below the ground
                clearInterval(jumpInterval); // Stop the jump interval
                isJumping = false; // Reset jump flag
            }
        }, 20); // Adjust interval for smoother animation
    }
}

function checkCollision() {
    return !!(dinoX + dinoWidth > obstacleX && dinoX < obstacleX + obstacleWidth &&
        dinoY + dinoHeight > canvas.height - obstacleHeight);
}

function updateScore() {
    score += scoreIncrementPerSecond / frameRate; // Increment the score based on the frame rate
    document.getElementById('score').innerText = 'Score: ' + Math.floor(score);

    // Check if score reaches a multiple of 250
    if (score % 250 === 0) {
        // Increase the speed by a factor (adjust as needed)
        frameRate *= 1.3; // Increase speed by 10%
    }
}

function gameOver() {
    isGameOver = true;
    alert('Game Over! Your score: ' + Math.floor(score));
    frameRate = defaultFrameRate; // Reset frame rate
}

function drawPausedText() {
    ctx.font = "30px Arial";
    ctx.fillStyle = "red";
    ctx.textAlign = "center";
    ctx.fillText(pausedText, canvas.width / 2, canvas.height / 2);
}

function gameLoop() {
    if (!isGameOver) {
        clearCanvas();
        if (isPaused) {
            drawPausedText(); // Draw "Paused" text if the game is paused
        } else {
            drawDino();
            moveObstacle();
            drawObstacle();
            if (checkCollision()) {
                gameOver();
            } else {
                updateScore();
            }
            speedDisplay.innerText = 'Speed: ' + frameRate;
        }
    }
    if (!isPaused) {
        gameLoopInterval = setTimeout(gameLoop, 1000 / frameRate); // Request next frame after a delay
    }
}

function resetGame() {
    isGameOver = false;
    score = 0;
    dinoX = 50;
    dinoY = canvas.height - 40;
    obstacleX = canvas.width;
    frameRate = defaultFrameRate; // Reset frame rate to default
    clearTimeout(gameLoopInterval); // Stop the existing game loop
    gameLoop(); // Start a new game loop
}

document.addEventListener('keydown', (event) => {
    if (event.code === 'Space') {
        jump();
    }
});

function pauseGame() {
    isPaused = true;
    clearTimeout(gameLoopInterval); // Stop the game loop
    pauseButton.innerText = 'Resume';
}

function resumeGame() {
    isPaused = false;
    gameLoopInterval = setTimeout(gameLoop, 1000 / frameRate); // Resume the game loop
    pauseButton.innerText = 'Pause';
}

pauseButton.addEventListener('click', () => {
    if (isPaused) {
        resumeGame();
    } else {
        pauseGame();
    }
    pauseButton.blur(); // Remove focus from the pause button
});

resetButton.addEventListener('click', () => {
    resetGame();
    resetButton.blur(); // Remove focus from the reset button
});

gameLoop();
