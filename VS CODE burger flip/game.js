const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

/* FULLSCREEN (NO STRETCH, HIGH DPI FIX) */
function resizeCanvas() {
  const dpr = window.devicePixelRatio || 1;

  canvas.style.width = window.innerWidth + "px";
  canvas.style.height = window.innerHeight + "px";

  canvas.width = window.innerWidth * dpr;
  canvas.height = window.innerHeight * dpr;

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

/* SETTINGS */
let gravity = 0.35;

let shake = 0;
let particles = [];

let baseSpawnInterval = 360;
let spawnInterval = baseSpawnInterval;
let spawnCounter = 0;

let score = 0;
let misses = 0;
let gameOver = false;

/* PERFECT TIMING */
let lastFlipTime = 0;
const PERFECT_WINDOW = 120;

/* PAN */
let pan = {
  x: window.innerWidth / 2,
  y: window.innerHeight - 120,
  width: 160,
  height: 10,
  handleWidth: 60,
  handleHeight: 20,
  angle: -0.2,
  angularVelocity: 0,
  vy: 0
};

/* BURGERS */
let burgers = [spawnBurger()];

/* SPAWN */
function spawnBurger() {
  return {
    x: window.innerWidth / 2,
    y: 60,
    vx: (Math.random() - 0.5) * 2,
    vy: 0,
    radius: 20,
    angle: 0,
    angularVelocity: (Math.random() - 0.5) * 0.1,
    golden: Math.random() < 0.01,

    life: 0,
    targetLife: 300 + Math.random() * 300,
    fading: false,
    alpha: 1
  };
}

/* PARTICLES */
function spawnParticles(x, y, color = "orange", count = 10) {
  for (let i = 0; i < count; i++) {
    particles.push({
      x,
      y,
      vx: (Math.random() - 0.5) * 5,
      vy: (Math.random() - 1.5) * 5,
      life: 30,
      color
    });
  }
}

/* INPUT */
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

/* KEYS */
document.addEventListener("keydown", (e) => {
  if (e.code === "Space") {
    e.preventDefault();
    if (!gameOver) {
      pan.vy = -12;
      pan.angularVelocity = 0.35;

      lastFlipTime = performance.now(); // 🔥 track timing
    }
  }

  if (e.code === "KeyR") {
    restartGame();
  }
});

/* RESTART */
function restartGame() {
  burgers = [spawnBurger()];
  particles = [];
  score = 0;
  misses = 0;
  gameOver = false;
  spawnInterval = baseSpawnInterval;
}

/* UPDATE */
function update() {
  if (gameOver) return;

  /* Dynamic difficulty */
  spawnInterval = Math.max(90, baseSpawnInterval - score * 5);

  pan.angle += pan.angularVelocity;
  pan.angularVelocity *= 0.9;
  pan.angle = Math.max(-0.5, Math.min(0.5, pan.angle));
  pan.angle += (-0.2 - pan.angle) * 0.1;

  spawnCounter++;
  if (spawnCounter >= spawnInterval) {
    burgers.push(spawnBurger());
    spawnCounter = 0;
  }

  for (let i = 0; i < burgers.length; i++) {
    let b = burgers[i];

    /* LIFE */
    if (!b.fading) {
      b.life++;
      if (b.life >= b.targetLife) {
        b.fading = true;
        score += b.golden ? 10 : 1;
      }
    } else {
      b.alpha -= 0.02;
      if (b.alpha <= 0) {
        burgers.splice(i, 1);
        i--;
        continue;
      }
    }

    b.vy += gravity;
    b.vx *= 0.999;
    b.vy *= 0.999;

    b.x += b.vx;
    b.y += b.vy;

    b.angle += b.angularVelocity;
    b.angularVelocity *= 0.995;

    if (b.x < b.radius) {
      b.x = b.radius;
      b.vx *= -0.7;
    }
    if (b.x > window.innerWidth - b.radius) {
      b.x = window.innerWidth - b.radius;
      b.vx *= -0.7;
    }

    if (b.y > window.innerHeight) {
      burgers.splice(i, 1);
      i--;
      misses++;
      if (misses >= 3) gameOver = true;
      continue;
    }

    let panLeft = pan.x - pan.width / 2;
    let panRight = pan.x + pan.width / 2;

    let surfaceY = pan.y + Math.sin(pan.angle) * (b.x - pan.x);

    let touchingPan =
      b.y + b.radius > surfaceY &&
      b.y < surfaceY + 15 &&
      b.x > panLeft &&
      b.x < panRight;

    if (touchingPan && b.vy >= 0) {
      b.y = surfaceY - b.radius;

      let slope = Math.sin(pan.angle);

      let now = performance.now();
      let isPerfect = now - lastFlipTime < PERFECT_WINDOW;

      if (pan.vy < -2) {
        // 🔥 NORMAL FLIP (unchanged feel)
        b.vy = -10;
        b.vx += slope * 7;
        b.angularVelocity += slope * 0.35;

        // 🔥 PERFECT BONUS (subtle)
        if (isPerfect) {
          b.vy -= 2; // small extra boost ONLY
          b.angularVelocity += 0.2;

          spawnParticles(b.x, b.y, "orange", 10);
          spawnParticles(b.x, b.y, "cyan", 5);
        } else {
          spawnParticles(b.x, b.y, "orange", 10);
        }

        shake = 8;
      } else {
        // normal bounce
        b.vy *= -0.6;
        b.vx += slope * 2;
      }
    }

    /* HANDLE HITBOX */
    let handleX = pan.x + Math.cos(pan.angle) * (pan.width / 2 + pan.handleWidth / 2);
    let handleY = pan.y + Math.sin(pan.angle) * (pan.width / 2 + pan.handleWidth / 2) - 5;

    let dx = b.x - handleX;
    let dy = b.y - handleY;
    let dist = Math.hypot(dx, dy);

    if (dist < b.radius + pan.handleHeight / 2) {
      let nx = dx / dist;
      let ny = dy / dist;

      b.x = handleX + nx * (b.radius + pan.handleHeight / 2);
      b.y = handleY + ny * (b.radius + pan.handleHeight / 2);

      b.vx += nx * 2;
      b.vy += ny * 2;
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

        a.x -= nx * overlap * 0.4;
        a.y -= ny * overlap * 0.6;
        b.x += nx * overlap * 0.4;
        b.y += ny * overlap * 0.6;

        let dvx = b.vx - a.vx;
        let dvy = b.vy - a.vy;

        let impact = dvx * nx + dvy * ny;
        if (impact > 0) continue;

        let impulse = impact * 0.6;

        a.vx += impulse * nx;
        a.vy += impulse * ny;
        b.vx -= impulse * nx;
        b.vy -= impulse * ny;
      }
    }
  }

  /* PARTICLES */
  for (let i = 0; i < particles.length; i++) {
    let p = particles[i];

    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.2;
    p.life--;

    if (p.life <= 0) {
      particles.splice(i, 1);
      i--;
    }
  }

  shake *= 0.9;
}

/* DRAW */
function drawPan() {
  ctx.save();
  ctx.translate(pan.x, pan.y);
  ctx.rotate(pan.angle);

  ctx.fillStyle = "gray";
  ctx.fillRect(-pan.width / 2, 0, pan.width, pan.height);

  ctx.fillStyle = "dimgray";
  ctx.fillRect(pan.width / 2, -5, pan.handleWidth, pan.handleHeight);

  ctx.restore();
}

function drawBurger(b) {
  ctx.save();
  ctx.globalAlpha = b.alpha;

  ctx.translate(b.x, b.y);
  ctx.rotate(b.angle);

  let stretch = 1 + Math.min(Math.abs(b.vy) * 0.02, 0.3);
  ctx.scale(1 / stretch, stretch);

  if (b.golden) {
    ctx.shadowColor = "gold";
    ctx.shadowBlur = 25;
  } else {
    ctx.shadowBlur = 0;
  }

  ctx.fillStyle = b.golden ? "gold" : "saddlebrown";
  ctx.fillRect(-30, -20, 60, 40);

  ctx.restore();
  ctx.shadowBlur = 0;
}

function drawParticles() {
  for (let p of particles) {
    ctx.fillStyle = p.color;
    ctx.fillRect(p.x, p.y, 4, 4);
  }
}

function drawUI() {
  ctx.fillStyle = "black";
  ctx.font = "20px Arial";
  ctx.fillText("Score: " + score, 20, 30);
  ctx.fillText("Misses: " + misses + "/3", 20, 60);

  if (gameOver) {
    ctx.font = "40px Arial";
    ctx.fillText("GAME OVER", window.innerWidth / 2 - 120, window.innerHeight / 2);
    ctx.font = "20px Arial";
    ctx.fillText("Press R to Restart", window.innerWidth / 2 - 90, window.innerHeight / 2 + 40);
  }
}

/* LOOP */
function loop() {
  let dx = (Math.random() - 0.5) * shake;
  let dy = (Math.random() - 0.5) * shake;

  ctx.setTransform(1, 0, 0, 1, dx, dy);
  ctx.clearRect(-dx, -dy, window.innerWidth, window.innerHeight);

  update();

  drawPan();
  for (let b of burgers) drawBurger(b);
  drawParticles();
  drawUI();

  requestAnimationFrame(loop);
}

loop();