const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const defaultFrameRate = 60;
let frameRate = defaultFrameRate;

let dinoX = 0;
let dinoY = canvas.height - 43;
let dinoWidth = 40;
let dinoHeight = 43;
const dinoImage = new Image();
dinoImage.src = 'assets/dino.png';
const dinoDuckImage = new Image();
dinoDuckImage.src = 'assets/dinoducking.png'
const dinoDeadImage = new Image();
dinoDeadImage.src = 'assets/dinodead.png'

let initialObstacleCount = 1;
let obstacleX = canvas.width;
let obstacleWidth;
let obstacleHeight;
let obstacleSpeed = 5;
let obstacles = []; // Array to store obstacles
const cactusImage1 = new Image();
cactusImage1.src = 'assets/cactus.png'; // Path to the first type of cactus image
const cactusImage2 = new Image();
cactusImage2.src = 'assets/cactus2.png'; // Path to the second type of cactus image


let isJumping = false;
let isDucking = false;
let jumpHeight = 65;
let jumpSpeed = 10;
const jumpAcceleration = -11; // Adjust as needed
const gravity = 0.7; // Adjust as needed

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
    if (isDucking) {
        ctx.drawImage(dinoDuckImage, dinoX, dinoY + 17, 55, 26);
    } else if (isGameOver) {
        ctx.drawImage(dinoDeadImage, dinoX, dinoY, 40, 43);
    } else {
        ctx.drawImage(dinoImage, dinoX, dinoY, 40, 43);
    }
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
        width: 0, // Initialize width and height to be set based on type
        height: 0,
        type: Math.random() < 0.5 ? 'type1' : 'type2' // Randomly choose between type1 and type2
    };

    // Set width and height based on type
    if (newObstacle.type === 'type1') {
        newObstacle.width = 23; // Adjust width for type1
        newObstacle.height = 46; // Adjust height for type1
    } else {
        newObstacle.width = 15; // Adjust width for type2
        newObstacle.height = 33; // Adjust height for type2
    }

    // Check for collision with existing obstacles
    let overlap = false;
    obstacles.forEach(obstacle => {
        if (newObstacle.x < obstacle.x + obstacle.width &&
            newObstacle.x + newObstacle.width > obstacle.x &&
            canvas.height - newObstacle.height < canvas.height - obstacle.height + obstacle.height) {
            overlap = true;
        }
    });

    // Add the new obstacle only if there's no overlap
    if (!overlap) {
        obstacles.push(newObstacle);
    }
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
        // Determine which type of cactus to draw based on obstacle properties
        let cactusImage;
        let cactusWidth, cactusHeight;
        if (obstacle.type === 'type1') {
            cactusImage = cactusImage1;
            cactusWidth = 23; // Adjust the width as needed
            cactusHeight = 46; // Adjust the height as needed
        } else {
            cactusImage = cactusImage2;
            cactusWidth = 15; // Adjust the width as needed
            cactusHeight = 33; // Adjust the height as needed
        }
        // Draw the cactus image at the obstacle's position
        ctx.drawImage(cactusImage, obstacle.x, canvas.height - cactusHeight, cactusWidth, cactusHeight);
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

    if (Math.floor(score) % 100 == 0 && Math.floor(score) != 0) {
        speedupSound.play();
    }

    if (Math.floor(score) % 250 === 0 && Math.floor(score) != 0) {
        frameRate *= 1.3;
        score++;
    }
}

function gameOver() {
    isGameOver = true; 
    drawDino();
    document.getElementById('gameCanvas').style.animationPlayState = 'paused';
    deathSound.play();
    alert('Game Over! Your score: ' + Math.floor(score));
    frameRate = defaultFrameRate; // Reset frame rate
}

function gameLoop() {
    if (!isGameOver && !isPaused) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
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
        if (Math.random() < 0.01) { // Adjust the probability as needed
            resetObstacle();
        }
    }
    if (!isPaused) {
        gameLoopInterval = setTimeout(gameLoop, 1000 / frameRate); // Request next frame after a delay
    }
}

function resetGame() {
    isGameOver = false;
    score = 0;
    dinoX = 0;
    dinoY = canvas.height - 43;
    obstacles = []; // Reset the obstacles array

    frameRate = defaultFrameRate; // Reset frame rate to default

    // Clear any existing game loop interval and start a new game loop
    clearTimeout(gameLoopInterval);
    gameLoop();

    // Call resetObstacle() multiple times to spawn initial obstacles
    for (let i = 0; i < initialObstacleCount; i++) {
        resetObstacle();
    }
}

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

document.addEventListener('keydown', (event) => {
    if (event.code === 'Space') {
        if (isGameOver) {
            resetGame();
        } else {
            jump();
        }
    }
});

document.addEventListener('keydown', (event) => {
    if (event.code === 'ArrowUp') {
        if (isGameOver) {
            resetGame();
        } else {
            jump();
        }
    }
});


document.addEventListener('keydown', (event) => {
    if (event.code === 'ArrowDown') {
        isDucking = true;
    }
});

document.addEventListener('keyup', (event) => {
    if (event.code === 'ArrowDown') {
        isDucking = false;
    }
});

pauseButton.addEventListener('click', () => {
    if (isPaused) {
        resumeGame();
    } else {
        pauseGame();
    }
    pauseButton.blur(); // Remove focus from the pause button
});

resetButton.addEventListener('click', () => {
    resetButton.blur(); // Remove focus from the reset button
    resetGame();
});

gameLoop();
