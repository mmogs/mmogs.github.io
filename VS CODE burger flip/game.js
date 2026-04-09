const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const statusText = document.getElementById("status");

let gravity = 0.4;
let gameOver = false;

// Burger
let burger = {
  x: 200,
  y: 350,
  radius: 15,
  velocityY: 0,
  flipping: false
};

// Spatula
let spatula = {
  x: 150,
  y: 380,
  width: 100,
  height: 10,
  angle: 0,
  flipping: false
};

// Controls
document.addEventListener("keydown", (e) => {
  if (e.code === "Space") flip();
});
document.addEventListener("click", flip);

function flip() {
  if (gameOver) return;

  spatula.flipping = true;
  burger.velocityY = -8; // launch burger upward
}

// Game loop
function update() {
  if (gameOver) return;

  // Apply gravity
  burger.velocityY += gravity;
  burger.y += burger.velocityY;

  // Spatula animation
  if (spatula.flipping) {
    spatula.angle += 0.2;
    if (spatula.angle > Math.PI) {
      spatula.angle = 0;
      spatula.flipping = false;
    }
  }

  // Collision (burger lands on spatula)
  if (
    burger.y + burger.radius >= spatula.y &&
    burger.x > spatula.x &&
    burger.x < spatula.x + spatula.width &&
    burger.velocityY > 0
  ) {
    burger.y = spatula.y - burger.radius;
    burger.velocityY = -6; // bounce slightly
  }

  // Floor = game over
  if (burger.y > canvas.height) {
    gameOver = true;
    statusText.textContent = "Game Over!";
  }
}

// Draw
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw spatula
  ctx.save();
  ctx.translate(spatula.x + spatula.width / 2, spatula.y);
  ctx.rotate(spatula.angle);
  ctx.fillStyle = "black";
  ctx.fillRect(-spatula.width / 2, 0, spatula.width, spatula.height);
  ctx.restore();

  // Draw burger
  ctx.beginPath();
  ctx.arc(burger.x, burger.y, burger.radius, 0, Math.PI * 2);
  ctx.fillStyle = "brown";
  ctx.fill();
  ctx.closePath();
}

// Loop
function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

gameLoop();