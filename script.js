const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const defaultFrameRate = 60;
let frameRate = defaultFrameRate;

let dinoX = 50;
let dinoY = canvas.height - 40;
let dinoWidth = 40;
let dinoHeight = 40;
const dinoImage = new Image();
dinoImage.src = 'assets/dino.png';

let obstacleX = canvas.width;
let obstacleWidth = 20;
let obstacleHeight = 40;
let obstacleSpeed = 5;
const obstacles = []; // Array to store obstacles

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
let gameLoopInterval;
const pauseButton = document.getElementById('pauseButton');
const resetButton = document.getElementById('resetButton');

const jumpSound = document.getElementById("jumpSound");
const deathSound = document.getElementById("deathSound");
const speedupSound = document.getElementById("speedupSound");

function drawDino() {
    ctx.drawImage(dinoImage, dinoX, dinoY, 40, 40); // Adjust the width and height as needed
}

function jump() {
    if (!isGameOver && !isJumping) {
        isJumping = true;
        jumpSound.play();
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

function resetObstacle() {
    const newObstacleX = canvas.width + Math.random() * (canvas.width / 2);
    const newObstacle = {
        x: newObstacleX,
        width: 20,
        height: 40
    };
    obstacles.push(newObstacle);
}

function moveObstacle() {
    obstacles.forEach(obstacle => {
        obstacle.x -= obstacleSpeed;
        if (obstacle.x + obstacle.width < 0) {
            obstacles.shift(); // Remove the obstacle from the array when it goes off-screen
        }
    });
}

function drawObstacles() {
    obstacles.forEach(obstacle => {
        ctx.fillStyle = '#555';
        ctx.fillRect(obstacle.x, canvas.height - obstacle.height, obstacle.width, obstacle.height);
    });
}

function checkCollision() {
    for (const element of obstacles) {
        const obstacle = element;
        if (dinoX + dinoWidth > obstacle.x && dinoX < obstacle.x + obstacle.width &&
            dinoY + dinoHeight > canvas.height - obstacle.height) {
            return true;
        }
    }
    return false;
}

function updateScore() {
    score += scoreIncrementPerSecond / frameRate;
    document.getElementById('score').innerText = 'Score: ' + Math.floor(score);

    if (score % 100 == 0) {
        speedupSound.play();
    }

    if (score % 250 === 0) {
        frameRate *= 1.3;
    }
}

function gameOver() {
    isGameOver = true;
    document.getElementById('gameCanvas').style.animationPlayState = 'paused';
    deathSound.play();
    alert('Game Over! Your score: ' + Math.floor(score));
    frameRate = defaultFrameRate; // Reset frame rate
}

function gameLoop() {
    if (!isGameOver && !isPaused) {
        clearCanvas();
        document.getElementById('gameCanvas').style.animationPlayState = 'running';
        drawDino();
        moveObstacle();
        drawObstacles();
        if (checkCollision()) {
            gameOver();
        } else {
            updateScore();
        }
        speedDisplay.innerText = 'Speed: ' + frameRate;
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
    document.getElementById('gameCanvas').style.animationPlayState = 'paused';
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
