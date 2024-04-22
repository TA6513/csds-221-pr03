//variables
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
let obstacles = [];
const cactusImage1 = new Image();
cactusImage1.src = 'assets/cactus.png';
const cactusImage2 = new Image();
cactusImage2.src = 'assets/cactus2.png';
let framesSinceLastCactus = 0;
const cactusSpawnInterval = 180;

let isJumping = false;
let isDucking = false;
let jumpSpeed = 10;
const jumpAcceleration = -11;
const gravity = 0.7; 

let score = 0;
const scoreIncrementPerSecond = 10;

let isGameOver = false;
let isPaused = false;
let pausedText = "Paused";
let gameLoopInterval;
const pauseButton = document.getElementById('pauseButton');
const resetButton = document.getElementById('gameOverImage');

const jumpSound = document.getElementById("jumpSound");
const deathSound = document.getElementById("deathSound");
const speedupSound = document.getElementById("speedupSound");

//draw dino on screen
function drawDino() {
    if (isGameOver) {
        ctx.drawImage(dinoDeadImage, dinoX, dinoY, 40, 43);
    } else if (isDucking) {
        ctx.drawImage(dinoDuckImage, dinoX, dinoY + 17, 55, 26);
    } else {
        ctx.drawImage(dinoImage, dinoX, dinoY, 40, 43);
    }
}

//jump function
function jump() {
    if (!isGameOver && !isJumping && !isDucking) {
        isJumping = true;
        jumpSound.play();
        let jumpSpeed = jumpAcceleration; // initial jump speed
        let jumpInterval = setInterval(() => {
            // update dino position based on jump speed
            dinoY += jumpSpeed;
            jumpSpeed += gravity; // apply gravity

            // check if dino has reached the ground
            if (dinoY >= canvas.height - dinoHeight) {
                dinoY = canvas.height - dinoHeight; // ensure dino doesn't go below the ground
                clearInterval(jumpInterval);
                isJumping = false;
            }
        }, 20); // adjust interval for smoother animation
    }
}

//add obstacle to game
function resetObstacle() {
    const newObstacleX = canvas.width + Math.random() * (canvas.width / 2);
    const newObstacle = {
        x: newObstacleX,
        width: 0, // initialize width and height to be set based on type
        height: 0,
        type: Math.random() < 0.5 ? 'type1' : 'type2'
    };

    if (newObstacle.type === 'type1') {
        newObstacle.width = 23;
        newObstacle.height = 46;
    } else {
        newObstacle.width = 15;
        newObstacle.height = 33;
    }

    // check for collision with existing obstacles
    let overlap = false;
    obstacles.forEach(obstacle => {
        if (newObstacle.x < obstacle.x + obstacle.width &&
            newObstacle.x + newObstacle.width > obstacle.x &&
            canvas.height - newObstacle.height < canvas.height - obstacle.height + obstacle.height) {
            overlap = true;
        }
    });

    // add the new obstacle only if theres no overlap
    if (!overlap) {
        obstacles.push(newObstacle);
    }
}

//move obstacle on screen
function moveObstacle() {
    obstacles.forEach(obstacle => {
        obstacle.x -= obstacleSpeed;
        if (obstacle.x + obstacle.width < 0) {
            obstacles.shift(); // remove the obstacle from the array when it goes off-screen
        }
    });
}

//draw all the obstacles on the screen
function drawObstacles() {
    obstacles.forEach(obstacle => {
        let cactusImage;
        let cactusWidth, cactusHeight;
        if (obstacle.type === 'type1') {
            cactusImage = cactusImage1;
            cactusWidth = 23;
            cactusHeight = 46;
        } else {
            cactusImage = cactusImage2;
            cactusWidth = 15;
            cactusHeight = 33;
        }
        ctx.drawImage(cactusImage, obstacle.x, canvas.height - cactusHeight, cactusWidth, cactusHeight);
    });
}

//check if dino hits cactus
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

//update score display
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

//pull high score
function getHighScore() {
    const highScore = localStorage.getItem('highScore');
    return highScore ? parseInt(highScore) : 0;
}

//sace high score
function saveHighScore(score) {
    localStorage.setItem('highScore', score.toString());
}

//update high score on display
function checkAndUpdateHighScore() {
    const currentScore = Math.floor(score);
    const highScore = getHighScore();
    if (currentScore > highScore) {
        saveHighScore(currentScore);
    }
}

//handle player death
function gameOver() {
    isGameOver = true;
    drawDino();
    document.getElementById('gameCanvas').style.animationPlayState = 'paused';
    deathSound.play();
    document.getElementById('gameOverScreen').style.display = 'block';
    frameRate = defaultFrameRate;
    checkAndUpdateHighScore();
}

//reset game after death
function resetGame() {
    isGameOver = false;
    score = 0;
    dinoX = 0;
    dinoY = canvas.height - 43;
    obstacles = [];
    frameRate = defaultFrameRate;
    clearTimeout(gameLoopInterval);
    gameLoop();
    for (let i = 0; i < initialObstacleCount; i++) {
        resetObstacle();
    }
    document.getElementById('gameOverScreen').style.display = 'none';
}

//main game engine
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
        if (Math.random() < 0.01) {
            resetObstacle();
        }
        if (framesSinceLastCactus >= cactusSpawnInterval) { //add cactus if there hasnt been one in >3 seconds
            resetObstacle();
            framesSinceLastCactus = 0;
        }
    }
    if (!isPaused) {
        gameLoopInterval = setTimeout(gameLoop, 1000 / frameRate);
    }
}

//event handlers for user inputs
document.addEventListener('keydown', (event) => {
    if (event.code === 'Space' || event.code === 'ArrowUp') {
        if (isGameOver) {
            resetGame();
        } else {
            jump();
        }
    }

    if (event.code === 'ArrowDown' && !isJumping) {
        isDucking = true;
    }
});

document.addEventListener('keyup', (event) => {
    if (event.code === 'ArrowDown') {
        isDucking = false;
    }
});

resetButton.addEventListener('click', () => {
    resetButton.blur();
    resetGame();
});

gameLoop();
