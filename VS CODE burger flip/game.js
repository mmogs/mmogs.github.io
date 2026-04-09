const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreDisplay = document.getElementById('score');
const gameOverText = document.getElementById('gameOverText');
const restartBtn = document.getElementById('restartBtn');

// Game state
let gameRunning = true;
let score = 0;
let flipsCompleted = 0;

// Spatula object
const spatula = {
    x: canvas.width / 2,
    y: canvas.height - 60,
    width: 80,
    height: 15,
    rotation: 0,
    targetRotation: 0,
    rotationSpeed: 0.15,
    isFlipping: false,
    flipCooldown: 0,

    update() {
        // Smooth rotation towards target
        const diff = this.targetRotation - this.rotation;
        
        // Handle rotation wrapping
        if (diff > Math.PI) {
            this.rotation += diff - 2 * Math.PI;
        } else if (diff < -Math.PI) {
            this.rotation += diff + 2 * Math.PI;
        } else {
            this.rotation += diff * this.rotationSpeed;
        }

        // Reset to idle position
        if (!this.isFlipping) {
            this.targetRotation = 0;
        }

        // Cooldown
        if (this.flipCooldown > 0) {
            this.flipCooldown--;
        }
    },

    flip() {
        if (this.flipCooldown === 0) {
            this.isFlipping = true;
            this.targetRotation = Math.PI; // 180 degrees
            this.flipCooldown = 30;
            
            // Stop flipping after rotation completes
            setTimeout(() => {
                this.isFlipping = false;
            }, 500);
        }
    },

    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);

        // Draw spatula
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);

        // Draw handle
        ctx.fillStyle = '#A0522D';
        ctx.fillRect(-this.width / 2 - 30, -this.height / 2, 30, this.height);

        ctx.restore();
    },

    getCollisionBox() {
        const cos = Math.cos(this.rotation);
        const sin = Math.sin(this.rotation);

        const corners = [
            [-this.width / 2, -this.height / 2],
            [this.width / 2, -this.height / 2],
            [this.width / 2, this.height / 2],
            [-this.width / 2, this.height / 2]
        ];

        return corners.map(corner => ({
            x: this.x + corner[0] * cos - corner[1] * sin,
            y: this.y + corner[0] * sin + corner[1] * cos
        }));
    }
};

// Burger object
const burger = {
    x: canvas.width / 2,
    y: 100,
    width: 60,
    height: 20,
    vx: 0,
    vy: 0,
    rotation: 0,
    angularVelocity: 0,
    gravity: 0.4,
    isOnSpatula: true,
    flipCount: 0,

    update() {
        // Apply gravity
        this.vy += this.gravity;

        // Update position
        this.x += this.vx;
        this.y += this.vy;

        // Update rotation
        this.rotation += this.angularVelocity;
        this.angularVelocity *= 0.99; // Friction

        // Friction on horizontal movement
        this.vx *= 0.98;

        // Check if burger landed on spatula
        if (this.vy > 0 && this.y > spatula.y - 30) {
            const burgerBounds = this.getBounds();
            const spatulaBounds = spatula.getCollisionBox();

            if (this.checkCollision(burgerBounds, spatulaBounds)) {
                this.isOnSpatula = true;
                this.y = spatula.y - 20;
                this.vy = 0;
                this.vx = 0;
                this.angularVelocity = 0;
                this.rotation = 0;
                this.flipCount = 0;
                score += 10;
                scoreDisplay.textContent = score;
            }
        }

        // Check if burger fell through the floor
        if (this.y > canvas.height + 50) {
            endGame();
        }
    },

    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);

        // Draw top bun
        ctx.fillStyle = '#D2691E';
        ctx.beginPath();
        ctx.ellipse(0, -this.height / 2, this.width / 2, this.height / 2, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#8B4513';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Draw patty
        ctx.fillStyle = '#654321';
        ctx.fillRect(-this.width / 2, -3, this.width, 6);

        // Draw bottom bun
        ctx.fillStyle = '#D2691E';
        ctx.beginPath();
        ctx.ellipse(0, this.height / 2, this.width / 2, this.height / 2, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.restore();
    },

    getBounds() {
        return {
            x: this.x - this.width / 2,
            y: this.y - this.height / 2,
            width: this.width,
            height: this.height
        };
    },

    checkCollision(burgerBounds, spatulaCorners) {
        // Simple AABB check with spatula corners
        const minX = burgerBounds.x;
        const maxX = burgerBounds.x + burgerBounds.width;
        const minY = burgerBounds.y;
        const maxY = burgerBounds.y + burgerBounds.height;

        for (let corner of spatulaCorners) {
            if (corner.x >= minX && corner.x <= maxX &&
                corner.y >= minY && corner.y <= maxY) {
                return true;
            }
        }

        return false;
    }
};

// Input handling
const keys = {};

window.addEventListener('keydown', (e) => {
    keys[e.key] = true;

    if ((e.key === ' ' || e.key === 'ArrowUp') && gameRunning) {
        e.preventDefault();
        spatula.flip();
        
        if (burger.isOnSpatula) {
            burger.isOnSpatula = false;
            burger.vy = -12;
            burger.angularVelocity = 0.15;
            burger.flipCount++;
            flipsCompleted++;
        }
    }
});

window.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

restartBtn.addEventListener('click', () => {
    location.reload();
});

// Collision detection helper
function checkCircleCollision(x1, y1, r1, x2, y2, r2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < r1 + r2;
}

// Game over function
function endGame() {
    gameRunning = false;
    gameOverText.textContent = `Game Over! Final Score: ${score} (${flipsCompleted} flips)`;
    restartBtn.style.display = 'block';
}

// Game loop
function gameLoop() {
    // Clear canvas
    ctx.fillStyle = 'rgba(135, 206, 235, 0.3)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (gameRunning) {
        spatula.update();
        burger.update();
    }

    spatula.draw();
    burger.draw();

    // Draw floor
    ctx.fillStyle = 'rgba(100, 100, 100, 0.2)';
    ctx.fillRect(0, canvas.height - 10, canvas.width, 10);

    requestAnimationFrame(gameLoop);
}

// Start the game
gameLoop();

// Initial state: place burger on spatula
burger.x = spatula.x;
burger.y = spatula.y - 20;
burger.isOnSpatula = true;
