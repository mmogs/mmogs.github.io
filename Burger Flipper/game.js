const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = canvas.clientWidth;
canvas.height = canvas.clientHeight;

let gravity = 0.5; // slightly lower for more airtime
let score = 0;
let canScore = false;

/* Pan */
let pan = {
  x: canvas.width / 2,
  y: canvas.height - 120,
  width: 160,
  height: 10,
  angle: -0.2,
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

/* ✅ FIX: Proper mouse tracking */
function getMousePos(e) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top
  };
}

canvas.addEventListener("mousemove", (e) => {
  const pos = getMousePos(e);
  pan.x = pos.x;
  pan.y = pos.y; // now follows vertically too
});

/* SPACE = flip */
document.addEventListener("keydown", (e) => {
  if (e.code === "Space") {
    pan.vy = -14;              // 🔥 stronger lift
    pan.angularVelocity = 0.35; // 🔥 stronger tilt
  }
});

/* Physics */
function update() {
  /* PAN */
  pan.vy += gravity;
  pan.y += pan.vy;

  pan.angle += pan.angularVelocity;
  pan.angularVelocity *= 0.9;

  // Smooth return angle
  pan.angle += (-0.2 - pan.angle) * 0.1;

  /* BURGER */
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

  /* PAN COLLISION (angled) */
  let panLeft = pan.x - pan.width / 2;
  let panRight = pan.x + pan.width / 2;

  let panSurfaceY =
    pan.y + Math.tan(pan.angle) * (burger.x - pan.x);

  let touching =
    burger.y + 20 > panSurfaceY &&
    burger.y < panSurfaceY + 15 &&
    burger.x > panLeft &&
    burger.x < panRight;

  if (touching) {
    burger.y = panSurfaceY - 20;

    // inherit motion
    burger.vy = pan.vy;

    if (pan.vy < -2) {
      /* 🔥 BIGGER LAUNCH = REAL FLIPS */
      burger.vy += -12; // more vertical power
      burger.vx += Math.sin(pan.angle) * 8;

      /* 🔥 MUCH BETTER ROTATION */
      burger.angularVelocity += Math.sin(pan.angle) * 0.4;

      canScore = true;
    } else {
      burger.vx *= 0.9;
      burger.angularVelocity *= 0.9;

      if (canScore && Math.abs(burger.angularVelocity) < 0.25) {
        score++;
        document.getElementById("score").textContent = "Score: " + score;
        canScore = false;
      }
    }
  }
}

/* Draw pan */
function drawPan() {
  ctx.save();
  ctx.translate(pan.x, pan.y);
  ctx.rotate(pan.angle);

  ctx.fillStyle = "gray";
  ctx.fillRect(-pan.width / 2, 0, pan.width, pan.height);

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