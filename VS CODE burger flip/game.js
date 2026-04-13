const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

/* FULLSCREEN */
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
    angularVelocity: (Math.random() - 0.5) * 0.2,
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
canvas.addEventListener("mousemove", (e) => {
  const rect = canvas.getBoundingClientRect();
  pan.x = e.clientX - rect.left;
  pan.y = e.clientY - rect.top;
});

document.addEventListener("keydown", (e) => {
  if (e.code === "Space") {
    e.preventDefault();
    if (!gameOver) {
      pan.vy = -12;
      pan.angularVelocity = 0.35;
      lastFlipTime = performance.now();
    }
  }
  if (e.code === "KeyR") restartGame();
});

/* RESTART */
function restartGame() {
  burgers = [spawnBurger()];
  particles = [];
  score = 0;
  misses = 0;
  gameOver = false;
}

/* UPDATE */
function update() {
  if (gameOver) return;

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
    b.x += b.vx;
    b.y += b.vy;

    b.angle += b.angularVelocity;
    b.angularVelocity *= 0.995;

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

    let touching =
      b.y + b.radius > surfaceY &&
      b.y < surfaceY + 15 &&
      b.x > panLeft &&
      b.x < panRight;

    if (touching && b.vy >= 0) {
      b.y = surfaceY - b.radius;

      let slope = Math.sin(pan.angle);
      let now = performance.now();
      let isPerfect = now - lastFlipTime < PERFECT_WINDOW;

      if (isPerfect) {
        // 🔥 subtle boost (not huge)
        b.vy = -12;
        b.vx += slope * 6;
        b.angularVelocity += slope * 0.4;

        // normal particles + small blue bonus
        spawnParticles(b.x, b.y, "orange", 10);
        spawnParticles(b.x, b.y, "cyan", 6);

        shake = 10;
      } else {
        b.vy *= -0.6;
        b.vx += slope * 2;
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

  if (b.golden) {
    ctx.shadowColor = "gold";
    ctx.shadowBlur = 25;
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
  burgers.forEach(drawBurger);
  drawParticles();
  drawUI();

  requestAnimationFrame(loop);
}

loop();