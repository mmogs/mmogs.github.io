const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const gameOverScreen = document.getElementById('gameOver');
const finalScoreEl = document.getElementById('finalScore');

let score = 0;
let gameRunning = true;

const GRAVITY = 0.55;
const FLIP_POWER = -17;

const spatula = {
    x: 340,
    y: 380,
    width: 130,
    height: 18
};

const patty = {
    x: 370,
    y: 300,
    width: 70,
    height: 22,
    vx: 0,
    vy: 0,
    rotation: 0,
    rotationSpeed: 0,
    onSpatula: true
};

const groundY = 450;

let mouseX = 400;

// Event listeners
canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
});

canvas.addEventListener('mousedown', () => {
    if (gameRunning && patty.onSpatula) {
        flipPatty();
    }
});

function flipPatty() {
    patty.onSpatula = false;
    patty.vy = FLIP_POWER;
    patty.rotationSpeed = 14;           // spin speed
    patty.vx = (mouseX - (spatula.x + spatula.width/2)) * 0.08; // slight direction based on mouse
}

function update() {
    if (!gameRunning) return;

    // Move spatula with mouse
    spatula.x = mouseX - spatula.width / 2;
    spatula.x = Math.max(40, Math.min(660, spatula.x));

    if (!patty.onSpatula) {
        // Physics
        patty.vy += GRAVITY;
        patty.x += patty.vx;
        patty.y += patty.vy;

        // Rotation
        patty.rotation += patty.rotationSpeed;
        patty.rotationSpeed *= 0.975;

        // Collision with spatula
        if (patty.vy > 0) {
            const pattyBottom = patty.y + patty.height;
            const spatulaTop = spatula.y;

            if (
                pattyBottom >= spatulaTop &&
                pattyBottom <= spatulaTop + 30 &&
                patty.x + patty.width > spatula.x &&
                patty.x < spatula.x + spatula.width
            ) {
                // Catch successful!
                patty.y = spatula.y - patty.height;
                patty.vy = 0;
                patty.vx *= 0.5;
                patty.rotationSpeed *= 0.25;
                patty.onSpatula = true;

                score += 10;
                scoreEl.textContent = score;
            }
        }

        // Hit the floor = Game Over
        if (patty.y > groundY) {
            gameOver();
        }

        // Wall bounce
        if (patty.x < 10 || patty.x > canvas.width - patty.width - 10) {
            patty.vx *= -0.6;
            patty.x = Math.max(10, Math.min(canvas.width - patty.width - 10, patty.x));
        }
    } 
    else {
        // Patty resting on spatula
        patty.x = spatula.x + spatula.width / 2 - patty.width / 2;
        patty.y = spatula.y - patty.height;
        patty.vy = 0;
        patty.rotation *= 0.88; // slowly straighten
    }
}

function draw() {
    // Sky background
    ctx.fillStyle = '#87CEEB';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Floor
    ctx.fillStyle = '#444';
    ctx.fillRect(0, groundY, canvas.width, canvas.height - groundY);

    // Counter / grill line
    ctx.fillStyle = '#333';
    ctx.fillRect(0, groundY - 12, canvas.width, 12);

    // Draw Spatula
    ctx.save();
    ctx.translate(spatula.x + spatula.width / 2, spatula.y);
    
    // Handle
    ctx.fillStyle = '#555';
    ctx.fillRect(-20, -6, 70, 14);
    
    // Blade
    ctx.fillStyle = '#bbbbbb';
    ctx.fillRect(-35, -22, 125, 28);
    
    // Highlight
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.fillRect(-32, -19, 110, 8);
    
    ctx.restore();

    // Draw Patty
    ctx.save();
    ctx.translate(patty.x + patty.width / 2, patty.y + patty.height / 2);
    ctx.rotate(patty.rotation * Math.PI / 180);

    // Main patty
    ctx.fillStyle = '#3C2F2F';
    ctx.fillRect(-patty.width/2, -patty.height/2, patty.width, patty.height);

    // Cooked lines / texture
    ctx.fillStyle = '#5C4033';
    ctx.fillRect(-patty.width/2 + 8, -patty.height/2 + 5, patty.width - 20, 4);
    ctx.fillRect(-patty.width/2 + 12, -patty.height/2 + 12, patty.width - 28, 3);

    // Edge highlight
    ctx.strokeStyle = '#8B5A2B';
    ctx.lineWidth = 4;
    ctx.strokeRect(-patty.width/2 + 2, -patty.height/2 + 2, patty.width - 4, patty.height - 4);

    ctx.restore();
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

function gameOver() {
    gameRunning = false;
    finalScoreEl.textContent = score;
    gameOverScreen.style.display = 'block';
}

function restartGame() {
    score = 0;
    scoreEl.textContent = '0';

    patty.x = 370;
    patty.y = 300;
    patty.vx = 0;
    patty.vy = 0;
    patty.rotation = 0;
    patty.rotationSpeed = 0;
    patty.onSpatula = true;

    gameRunning = true;
    gameOverScreen.style.display = 'none';
}

// Start the game
gameLoop();