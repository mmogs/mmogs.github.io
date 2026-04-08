const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = canvas.clientWidth;
canvas.height = canvas.clientHeight;

let gravity = 0.5;
let score = 0;
let canScore = false;

let spawnTimer = 0;
let spawnDelay = 180;

/* PAN */
let pan = {
  x: canvas.width / 2,
  y: canvas.height - 120,
  width: 160,
  height: 10,
  angle: -0.2,
  angularVelocity: 0,
  vy: 0
};

/* BURGER */
let burger = spawnBurger();

function spawnBurger() {
  spawnTimer = spawnDelay;

  return {
    x: canvas.width / 2,
    y: 60,
    vx: 0,
    vy: 0,
    angle: 0,
    angularVelocity: 0,
    active: false
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

/* UPDATE */
function update() {

  /* --- PAN --- */
  pan.angle += pan.angularVelocity;
  pan.angularVelocity *= 0.9;

  // Clamp angle (prevents math bugs)
  pan.angle = Math.max(-0.5, Math.min(0.5, pan.angle));

  // Return to resting angle
  pan.angle += (-0.2 - pan.angle) * 0.1;

  /* --- BURGER TIMER --- */
  if (!burger.active) {
    spawnTimer--;
    if (spawnTimer <= 0) burger.active = true;
    return;
  }

  /* --- BURGER PHYSICS --- */
  burger.vy += gravity;

  burger.x += burger.vx;
  burger.y += burger.vy;
  burger.angle += burger.angularVelocity;

  burger.angularVelocity *= 0.995;

  /* Safety check */
  if (isNaN(burger.x) || isNaN(burger.y)) {
    burger = spawnBurger();
    return;
  }

  /* WALLS */
  if (burger.x < 30) {
    burger.x = 30;
    burger.vx *= -0.7;
  }
  if (burger.x > canvas.width - 30) {
    burger.x = canvas.width - 30;
    burger.vx *= -0.7;
  }

  /* RESET */
  if (burger.y > canvas.height) {
    score = 0;
    document.getElementById("score").textContent = "Score: 0";
    burger = spawnBurger();
    return;
  }

  /* --- PAN COLLISION --- */
  if (touching && burger.vy >= 0) {
  burger.y = panSurfaceY - 20;

  let slope = Math.sin(pan.angle);

  /* --- RESTING ON PAN (NO FLIP) --- */
  if (pan.vy >= 0) {
    // Stop spinning completely
    burger.angularVelocity = 0;

    // Stop vertical movement
    burger.vy = 0;

    // Sliding due to gravity along slope
    let gravityAlongSlope = gravity * slope;

    burger.vx += gravityAlongSlope;
    burger.vx *= 0.99;

    canScore = false;
  }

  /* --- FLIPPING STATE --- */
  if (pan.vy < -2) {
    burger.vy = -12;
    burger.vx += slope * 8;
    burger.angularVelocity += slope * 0.4;

    canScore = true;
  }

  /* --- LANDING / SCORING --- */
  if (
    canScore &&
    Math.abs(burger.angularVelocity) < 0.25 &&
    pan.vy >= 0
  ) {
    score++;
    document.getElementById("score").textContent = "Score: " + score;
    canScore = false;
  }
}
    

/* gravity component along the slope */
let gravityAlongSlope = gravity * slope;

/* apply sliding force */
burger.vx += gravityAlongSlope;

/* friction */
burger.vx *= 0.99;

    /* STOP BOUNCE */
    burger.vy = 0;

    /* FLIP */
    if (pan.vy < -2) {
      burger.vy = -12;
      burger.vx += slope * 8;
      burger.angularVelocity += slope * 0.4;

      canScore = true;
    } else {
      burger.angularVelocity *= 0.9;

      if (canScore && Math.abs(burger.angularVelocity) < 0.25) {
        score++;
        document.getElementById("score").textContent = "Score: " + score;
        canScore = false;
      }
    }
  }
}

/* DRAW PAN */
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

/* DRAW BURGER */
function drawBurger() {
  ctx.save();
  ctx.translate(burger.x, burger.y);
  ctx.rotate(burger.angle);

  ctx.fillStyle = "saddlebrown";
  ctx.fillRect(-30, -20, 60, 40);

  ctx.restore();
}

/* TIMER TEXT */
function drawTimer() {
  if (!burger.active) {
    ctx.fillStyle = "black";
    ctx.font = "24px Arial";
    ctx.fillText("Get Ready...", canvas.width / 2 - 60, 100);
  }
}

/* LOOP */
function loop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  update();
  drawPan();
  drawBurger();
  drawTimer();

  requestAnimationFrame(loop);
}

loop();