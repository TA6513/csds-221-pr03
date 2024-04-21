const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const defaultFrameRate = 60;
let frameRate = defaultFrameRate;

const dino = {
    x: 0,
    y: canvas.height - 43,
    width: 40,
    height: 43,
    image: new Image(),
    duckImage: new Image(),
    deadImage: new Image(),
    isJumping: false,
    isDucking: false
};

dino.image.src = 'assets/dino.png';
dino.duckImage.src = 'assets/dinoducking.png';
dino.deadImage.src = 'assets/dinodead.png';

let obstacleSpeed = 5;
let obstacles = [];
const cactusImages = [
    { src: 'assets/cactus.png', width: 23, height: 46 },
    { src: 'assets/cactus2.png', width: 15, height: 33 }
];
let framesSinceLastCactus = 0;
const cactusSpawnInterval = 180;

let score = 0;
const scoreIncrementPerSecond = 10;

let isGameOver = false;
let isPaused = false;
let gameLoopInterval;
const pauseButton = document.getElementById('pauseButton');
const resetButton = document.getElementById('gameOverImage');

const jumpSound = document.getElementById("jumpSound");
const deathSound = document.getElementById("deathSound");
const speedupSound = document.getElementById("speedupSound");

function drawDino() {
    if (isGameOver) {
        ctx.drawImage(dino.deadImage, dino.x, dino.y, 40, 43);
    } else if (dino.isDucking) {
        ctx.drawImage(dino.duckImage, dino.x, dino.y + 17, 55, 26);
    } else {
        ctx.drawImage(dino.image, dino.x, dino.y, 40, 43);
    }
}

function jump() {
    if (!isGameOver && !dino.isJumping && !dino.isDucking) {
        dino.isJumping = true;
        jumpSound.play();
        let jumpSpeed = -11; // Initial jump speed
        let jumpInterval = setInterval(() => {
            // Update dino position based on jump speed
            dino.y += jumpSpeed;
            jumpSpeed += 0.7; // Apply gravity

            // Check if dino has reached the ground
            if (dino.y >= canvas.height - dino.height) {
                dino.y = canvas.height - dino.height; // Ensure dino doesn't go below the ground
                clearInterval(jumpInterval); // Stop the jump interval
                dino.isJumping = false; // Reset jump flag
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
        type: Math.random() < 0.5 ? 0 : 1 // Randomly choose between type 0 and 1
    };

    // Set width and height based on type
    newObstacle.width = cactusImages[newObstacle.type].width;
    newObstacle.height = cactusImages[newObstacle.type].height;

    // Check for collision with existing obstacles
    let overlap = false;
    obstacles.forEach(obstacle => {
        if (newObstacle.x < obstacle.x + obstacle.width &&
            newObstacle.x + newObstacle.width > obstacle.x) {
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
        const cactus = cactusImages[obstacle.type];
        ctx.drawImage(cactus.image, obstacle.x, canvas.height - cactus.height, cactus.width, cactus.height);
    });
}

function checkCollision() {
    for (const obstacle of obstacles) {
        if (dino.x + dino.width > obstacle.x && dino.x < obstacle.x + obstacle.width &&
            dino.y + dino.height > canvas.height - obstacle.height) {
            return true;
        }
    }
    return false;
}

function updateScore() {
    score += scoreIncrementPerSecond / frameRate;
    document.getElementById('score').innerText = 'HI  ' + getHighScore().toString().padStart(5, 0) + '  ' + Math.floor(score).toString().padStart(5, 0);

    if (Math.floor(score) % 100 == 0 && Math.floor(score) != 0) {
        speedupSound.play();
    }

    if (Math.floor(score) % 250 === 0 && Math.floor(score) != 0) {
        frameRate *= 1.3;
        score++;
    }
}

function getHighScore() {
    const highScore = localStorage.getItem('highScore');
    return highScore ? parseInt(highScore) : 0;
}

function saveHighScore(score) {
    localStorage.setItem('highScore', score.toString());
}

function checkAndUpdateHighScore() {
    const currentScore = Math.floor(score);
    const highScore = getHighScore();
    if (currentScore > highScore) {
        saveHighScore(currentScore);
    }
}

function gameOver() {
    isGameOver = true;
    drawDino();
    document.getElementById('gameCanvas').style.animationPlayState = 'paused';
    deathSound.play();
    document.getElementById('gameOverScreen').style.display = 'block';
    frameRate = defaultFrameRate;
    checkAndUpdateHighScore();
}

function resetGame() {
    isGameOver = false;
    score = 0;
    dino.x = 0;
    dino.y = canvas.height - 43;
    obstacles = [];

    frameRate = defaultFrameRate;

    clearTimeout(gameLoopInterval);
    gameLoop();

    for (let i = 0; i < 1; i++) {
        resetObstacle();
    }
    document.getElementById('gameOverScreen').style.display = 'none';
}

function gameLoop() {
    if (!isGameOver && !isPaused) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        document.getElementById('gameCanvas').style.animationPlayState = 'running';
        drawDino();
        moveObstacle();
        drawObstacles();
        framesSinceLastCactus++;
        if (checkCollision()) {
            gameOver();
        } else {
            updateScore();
        }
        if (Math.random() < 0.01) { // Adjust the probability as needed
            resetObstacle();
        }
        if (framesSinceLastCactus >= cactusSpawnInterval) {
            resetObstacle();
            framesSinceLastCactus = 0;
        }
    }
    if (!isPaused) {
        gameLoopInterval = setTimeout(gameLoop, 1000 / frameRate);
    }
}

document.addEventListener('keydown', (event) => {
    if (event.code === 'Space' || event.code === 'ArrowUp') {
        if (isGameOver) {
            resetGame();
        } else {
            jump();
        }
    }

    if (event.code === 'ArrowDown' && !dino.isJumping) {
        dino.isDucking = true;
    }
});

document.addEventListener('keyup', (event) => {
    if (event.code === 'ArrowDown') {
        dino.isDucking = false;
    }
});

resetButton.addEventListener('click', () => {
    resetButton.blur();
    resetGame();
});

gameLoop();
