const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = canvas.clientWidth;
canvas.height = canvas.clientHeight;

let gravity = 0.5;
let score = 0;
let canScore = false;

/* Timer for spawn delay */
let spawnTimer = 0;
let spawnDelay = 180; // ~3 seconds (60fps)

/* Pan (NO GRAVITY anymore) */
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
  spawnTimer = spawnDelay;

  return {
    x: canvas.width / 2, // ✅ always center
    y: 60,
    vx: 0,
    vy: 0,
    angle: 0,
    angularVelocity: 0,
    active: false // waits before falling
  };
}

/* Mouse control */
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
  pan.y = pos.y;
});

/* SPACE = flip */
document.addEventListener("keydown", (e) => {
  if (e.code === "Space") {
    pan.vy = -12;
    pan.angularVelocity = 0.35;
  }
});

/* Physics */
function update() {
  /* --- PAN (no falling anymore) --- */
  pan.angle += pan.angularVelocity;
  pan.angularVelocity *= 0.9;

  // return to resting angle
  pan.angle += (-0.2 - pan.angle) * 0.1;

  /* --- BURGER TIMER --- */
  if (!burger.active) {
    spawnTimer--;
    if (spawnTimer <= 0) {
      burger.active = true;
    }
    return; // don't update physics yet
  }

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

  /* --- PAN COLLISION --- */
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
      burger.vy += -12;
      burger.vx += Math.sin(pan.angle) * 8;
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

/* Draw timer text */
function drawTimer() {
  if (!burger.active) {
    ctx.fillStyle = "black";
    ctx.font = "24px Arial";
    ctx.fillText("Get Ready...", canvas.width / 2 - 60, 100);
  }
}

/* Loop */
function loop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  update();
  drawPan();
  drawBurger();
  drawTimer();

  requestAnimationFrame(loop);
}

loop();