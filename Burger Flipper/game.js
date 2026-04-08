const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = canvas.clientWidth;
canvas.height = canvas.clientHeight;

let gravity = 0.6;
let score = 0;
let canScore = false;

/* Spatula */
let pan = {
  x: canvas.width / 2,
  y: canvas.height - 120,
  width: 160,
  height: 10,
  vy: 0
};

/* Patty */
let burger = spawnBurger();

function spawnBurger() {
  return {
    x: canvas.width / 2,
    y: pan.y - 40,
    vx: 0,
    vy: 0,
    angle: 0,
    angularVelocity: 0
  };
}

/* SPACEBAR = lift spatula */
document.addEventListener("keydown", (e) => {
  if (e.code === "Space") {
    pan.vy = -12; // upward motion
  }
});

/* Physics */
function update() {
  // Apply gravity to burger
  burger.vy += gravity;

  burger.x += burger.vx;
  burger.y += burger.vy;
  burger.angle += burger.angularVelocity;

  // Pan falls back down
  pan.vy += gravity;
  pan.y += pan.vy;

  // Keep pan near bottom
  if (pan.y > canvas.height - 120) {
    pan.y = canvas.height - 120;
    pan.vy = 0;
  }

  /* Wall bounce */
  if (burger.x < 30) {
    burger.x = 30;
    burger.vx *= -0.7;
  }
  if (burger.x > canvas.width - 30) {
    burger.x = canvas.width - 30;
    burger.vx *= -0.7;
  }

  /* Bottom = reset */
  if (burger.y > canvas.height) {
    score = 0;
    document.getElementById("score").textContent = "Score: 0";
    burger = spawnBurger();
    return;
  }

  /* Pan collision */
  let touchingPan =
    burger.y + 20 > pan.y &&
    burger.y < pan.y + pan.height &&
    Math.abs(burger.x - pan.x) < pan.width / 2;

  if (touchingPan) {
    burger.y = pan.y - 20;
    burger.vy = pan.vy; // inherit motion

    // Flip only when pan moving up
    if (pan.vy < -2) {
      burger.vy = -10;
      burger.vx += (burger.x - pan.x) * 0.2;
      burger.angularVelocity += (burger.x - pan.x) * 0.05;

      canScore = true;
    } else {
      burger.vx *= 0.9;
      burger.angularVelocity *= 0.9;

      // Score when landing after flip
      if (canScore) {
        score++;
        document.getElementById("score").textContent = "Score: " + score;
        canScore = false;
      }
    }
  }
}

/* Draw spatula */
function drawPan() {
  ctx.fillStyle = "gray";

  // Base
  ctx.fillRect(pan.x - pan.width / 2, pan.y, pan.width, pan.height);

  // Handle (side)
  ctx.fillRect(pan.x + pan.width / 2, pan.y - 5, 60, 20);
}

/* Draw burger */
function drawBurger() {
  ctx.save();
  ctx.translate(burger.x, burger.y);
  ctx.rotate(burger.angle);

  ctx.fillStyle = "saddlebrown";
  ctx.fillRect(-30, -20, 60, 40);

  ctx.restore();
}

/* Game loop */
function loop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  update();
  drawPan();
  drawBurger();

  requestAnimationFrame(loop);
}

loop();