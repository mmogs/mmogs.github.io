const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

/* FULLSCREEN */
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

/* SETTINGS */
let gravity = 0.35;
let score = 0;
let canScore = false;

/* SPAWN SYSTEM */
let spawnInterval = 180;
let spawnCounter = 0;

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

/* BURGERS ARRAY */
let burgers = [spawnBurger()];

/* SPAWN BURGER */
function spawnBurger() {
  const isGolden = Math.random() < 0.01;

  return {
    x: canvas.width / 2,
    y: 60,
    vx: (Math.random() - 0.5) * 2,
    vy: 0,
    radius: 20,
    angle: 0,
    angularVelocity: (Math.random() - 0.5) * 0.1,
    active: true,
    golden: isGolden
  };
}

/* MOUSE CONTROL */
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

/* SPACE = FLIP */
document.addEventListener("keydown", (e) => {
  if (e.code === "Space") {
    pan.vy = -12;
    pan.angularVelocity = 0.35;
  }
});

/* UPDATE */
function update() {

  /* PAN PHYSICS */
  pan.angle += pan.angularVelocity;
  pan.angularVelocity *= 0.9;
  pan.angle = Math.max(-0.5, Math.min(0.5, pan.angle));
  pan.angle += (-0.2 - pan.angle) * 0.1;

  /* SPAWN SYSTEM */
  spawnCounter++;
  if (spawnCounter >= spawnInterval) {
    burgers.push(spawnBurger());
    spawnCounter = 0;
    spawnInterval = Math.max(60, spawnInterval - 2);
  }

  /* UPDATE BURGERS */
  for (let i = 0; i < burgers.length; i++) {
    let burger = burgers[i];

    burger.vy += gravity;

    // air drag
    burger.vx *= 0.999;
    burger.vy *= 0.999;

    burger.x += burger.vx;
    burger.y += burger.vy;

    burger.angle += burger.angularVelocity;
    burger.angularVelocity *= 0.995;

    /* WALLS */
    if (burger.x < burger.radius) {
      burger.x = burger.radius;
      burger.vx *= -0.7;
    }
    if (burger.x > canvas.width - burger.radius) {
      burger.x = canvas.width - burger.radius;
      burger.vx *= -0.7;
    }

    /* FALL RESET */
    if (burger.y > canvas.height) {
      burgers.splice(i, 1);
      i--;

      score = 0;
      document.getElementById("score").textContent = "Score: 0";
      continue;
    }

    /* PAN COLLISION */
    let panLeft = pan.x - pan.width / 2;
    let panRight = pan.x + pan.width / 2;

    let panSurfaceY =
      pan.y + Math.sin(pan.angle) * (burger.x - pan.x);

    let touching =
      burger.y + burger.radius > panSurfaceY &&
      burger.y < panSurfaceY + 15 &&
      burger.x > panLeft &&
      burger.x < panRight;

    if (touching && burger.vy >= 0) {

      burger.y = panSurfaceY - burger.radius;

      let slope = Math.sin(pan.angle);

      /* RESTING */
      if (pan.vy >= 0) {
        burger.angularVelocity = 0;
        burger.vy = 0;

        let gravityAlongSlope = gravity * slope;
        burger.vx += gravityAlongSlope;
        burger.vx *= 0.995;

        canScore = false;
      }

      /* FLIP */
      if (pan.vy < -2) {
        burger.vy = -10;
        burger.vx += slope * 7;
        burger.angularVelocity += slope * 0.35;

        canScore = true;
      }

      /* SCORE */
      if (
        canScore &&
        Math.abs(burger.angularVelocity) < 0.25 &&
        pan.vy >= 0
      ) {
        score += burger.golden ? 5 : 1;
        document.getElementById("score").textContent = "Score: " + score;
        canScore = false;
      }
    }
  }

  /* BURGER COLLISIONS */
  for (let i = 0; i < burgers.length; i++) {
    for (let j = i + 1; j < burgers.length; j++) {
      let a = burgers[i];
      let b = burgers[j];

      let dx = b.x - a.x;
      let dy = b.y - a.y;
      let dist = Math.hypot(dx, dy);
      let minDist = a.radius + b.radius;

      if (dist < minDist && dist > 0) {
        let nx = dx / dist;
        let ny = dy / dist;

        let overlap = minDist - dist;

        a.x -= nx * overlap / 2;
        a.y -= ny * overlap / 2;
        b.x += nx * overlap / 2;
        b.y += ny * overlap / 2;

        let dvx = b.vx - a.vx;
        let dvy = b.vy - a.vy;

        let impact = dvx * nx + dvy * ny;
        if (impact > 0) continue;

        let impulse = impact * 0.8;

        a.vx += impulse * nx;
        a.vy += impulse * ny;
        b.vx -= impulse * nx;
        b.vy -= impulse * ny;

        a.angularVelocity += (Math.random() - 0.5) * 0.2;
        b.angularVelocity += (Math.random() - 0.5) * 0.2;
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
function drawBurger(burger) {
  ctx.save();
  ctx.translate(burger.x, burger.y);
  ctx.rotate(burger.angle);

  ctx.fillStyle = burger.golden ? "gold" : "saddlebrown";
  ctx.fillRect(-30, -20, 60, 40);

  ctx.restore();
}

/* LOOP */
function loop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  update();

  drawPan();

  for (let burger of burgers) {
    drawBurger(burger);
  }

  requestAnimationFrame(loop);
}

loop();