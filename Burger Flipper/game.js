const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = canvas.clientWidth;
canvas.height = canvas.clientHeight;

let gravity = 0.6;
let score = 0;
let canScore = false;

/* Pan */
let pan = {
  x: canvas.width / 2,
  y: canvas.height - 120,
  width: 160,
  height: 10,
  angle: -0.2,        // slight tilt
  angularVelocity: 0,
  vy: 0
};

/* Burger */
let burger = spawnBurger();

function spawnBurger() {
  return {
    x: pan.x,
    y: pan.y - 30,
    vx: 0,
    vy: 0,
    angle: 0,
    angularVelocity: 0
  };
}

/* SPACE = flip motion */
document.addEventListener("keydown", (e) => {
  if (e.code === "Space") {
    pan.vy = -10;              // upward lift
    pan.angularVelocity = 0.2; // tilt upward
  }
});

/* Physics */
function update() {
  /* --- PAN PHYSICS --- */
  pan.vy += gravity;
  pan.y += pan.vy;

  pan.angle += pan.angularVelocity;
  pan.angularVelocity *= 0.9;

  // Reset pan position
  if (pan.y > canvas.height - 120) {
    pan.y = canvas.height - 120;
    pan.vy = 0;
  }

  // Return pan to resting angle smoothly
  pan.angle += (-0.2 - pan.angle) * 0.1;

  /* --- BURGER PHYSICS --- */
  burger.vy += gravity;

  burger.x += burger.vx;
  burger.y += burger.vy;
  burger.angle += burger.angularVelocity;

  burger.angularVelocity *= 0.995;

  /* Walls */
  if (burger.x < 30) {
    burger.x = 30;
    burger.vx *= -0.7;
  }
  if (burger.x > canvas.width - 30) {
    burger.x = canvas.width - 30;
    burger.vx *= -0.7;
  }

  /* Bottom reset */
  if (burger.y > canvas.height) {
    score = 0;
    document.getElementById("score").textContent = "Score: 0";
    burger = spawnBurger();
    return;
  }

  /* --- PAN COLLISION (angled) --- */

  // Pan surface line
  let panLeftX = pan.x - pan.width / 2;
  let panRightX = pan.x + pan.width / 2;

  let panSurfaceY =
    pan.y + Math.tan(pan.angle) * (burger.x - pan.x);

  let touchingPan =
    burger.y + 20 > panSurfaceY &&
    burger.y < panSurfaceY + 15 &&
    burger.x > panLeftX &&
    burger.x < panRightX;

  if (touchingPan) {
    burger.y = panSurfaceY - 20;

    // Inherit pan movement (THIS is what makes it feel real)
    burger.vy = pan.vy;

    // Launch only when pan moving upward
    if (pan.vy < -2) {
      burger.vy += -8;

      // Direction based on tilt
      burger.vx += Math.sin(pan.angle) * 6;

      // Smooth rotation
      burger.angularVelocity += Math.sin(pan.angle) * 0.2;

      canScore = true;
    } else {
      burger.vx *= 0.9;
      burger.angularVelocity *= 0.9;

      // Score on clean landing
      if (canScore && Math.abs(burger.angularVelocity) < 0.2) {
        score++;
        document.getElementById("score").textContent = "Score: " + score;
        canScore = false;
      }
    }
  }
}

/* Draw pan (rotated) */
function drawPan() {
  ctx.save();
  ctx.translate(pan.x, pan.y);
  ctx.rotate(pan.angle);

  // Pan base
  ctx.fillStyle = "gray";
  ctx.fillRect(-pan.width / 2, 0, pan.width, pan.height);

  // Handle
  ctx.fillStyle = "dimgray";
  ctx.fillRect(pan.width / 2, -5, 60, 20);

  ctx.restore();
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

/* Loop */
function loop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  update();
  drawPan();
  drawBurger();

  requestAnimationFrame(loop);
}

loop();