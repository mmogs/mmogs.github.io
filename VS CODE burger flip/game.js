const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const statusText = document.getElementById("status");

let gravity = 0.5;
let gameOver = false;

// Burger physics
let burger = {
  x: 250,
  y: 300,
  vx: 0,
  vy: 0,
  angle: 0,
  angularVel: 0.05,
  size: 20
};

// Spatula (mouse controlled)
let spatula = {
  x: 200,
  y: 380,
  width: 120,
  height: 10,
  tilt: 0.3,
  flipping: false
};

// Mouse control
canvas.addEventListener("mousemove", (e) => {
  const rect = canvas.getBoundingClientRect();
  spatula.x = e.clientX - rect.left - spatula.width / 2;
});

// Controls
document.addEventListener("click", flip);
document.addEventListener("keydown", (e) => {
  if (e.code === "Space") flip();
});

function flip() {
  if (gameOver) return;

  burger.vy = -10;
  burger.angularVel = (Math.random() - 0.5) * 0.3;
}

// Physics update
function update() {
  if (gameOver) return;

  // Apply gravity
  burger.vy += gravity;
  burger.y += burger.vy;
  burger.x += burger.vx;

  // Rotation
  burger.angle += burger.angularVel;

  // Spatula surface line (slanted)
  let spatulaTopY = spatula.y;
  let leftX = spatula.x;
  let rightX = spatula.x + spatula.width;

  // Simple collision with angled spatula
  if (
    burger.x > leftX &&
    burger.x < rightX &&
    burger.vy > 0
  ) {
    // calculate surface height based on tilt
    let t = (burger.x - leftX) / spatula.width;
    let surfaceY = spatulaTopY - t * 20; // angled

    if (burger.y + burger.size > surfaceY) {
      burger.y = surfaceY - burger.size;
      burger.vy = -9;
      burger.angularVel += 0.1; // spin more on bounce
    }
  }

  // Game over
  if (burger.y > canvas.height) {
    gameOver = true;
    statusText.textContent = "Game Over!";
  }
}

// Draw burger
function drawBurger() {
  ctx.save();
  ctx.translate(burger.x, burger.y);
  ctx.rotate(burger.angle);

 

  // patty
  ctx.fillStyle = "#5c2e0c";
  ctx.fillRect(-20, -2, 40, 8);

  

  ctx.restore();
}

// Draw spatula ___/
function drawSpatula() {
  ctx.beginPath();
  ctx.moveTo(spatula.x, spatula.y);
  ctx.lineTo(spatula.x + spatula.width, spatula.y - 20);
  ctx.lineTo(spatula.x + spatula.width, spatula.y - 10);
  ctx.lineTo(spatula.x, spatula.y);
  ctx.fillStyle = "black";
  ctx.fill();
}

// Draw loop
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawSpatula();
  drawBurger();
}

// Game loop
function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

loop();