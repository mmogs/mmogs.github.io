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

/* PERFECT */
let lastFlipTime = 0;
let perfectAvailable = false;
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

function spawnBurger() {
  const isBomb = Math.random() < 0.05;
  const isBalloon = !isBomb && Math.random() < 0.05;

  return {
    x: window.innerWidth / 2,

    // 🎈 spawn position fix
    y: isBalloon ? window.innerHeight - 80 : 60,

    vx: (Math.random() - 0.5) * 2,
    vy: 0,
    radius: 20,
    angle: 0,
    angularVelocity: (Math.random() - 0.5) * 0.1,

    bomb: isBomb,
    balloon: isBalloon,
    golden: !isBomb && !isBalloon && Math.random() < 0.01,

    life: 0,
    targetLife: isBomb ? 600 : 300 + Math.random() * 300,
    fading: false,
    alpha: 1
  };
}

/* MINI BURGERS */
function spawnMiniBurgers(x, y) {
  for (let i = 0; i < 5; i++) {
    burgers.push({
      x,
      y,
      vx: (Math.random() - 0.5) * 6,
      vy: (Math.random() - 1.5) * 6,
      radius: 15,
      angle: 0,
      angularVelocity: (Math.random() - 0.5) * 0.3,
      bomb: false,
      balloon: false,
      golden: false,
      life: 0,
      targetLife: 180,
      fading: false,
      alpha: 1
    });
  }
}

/* PARTICLES */
function spawnParticles(x, y, color = "orange", count = 10) {
  for (let i = 0; i < count; i++) {
    particles.push({
      x,
      y,
      vx: (Math.random() - 0.5) * 6,
      vy: (Math.random() - 1.5) * 6,
      life: 40,
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

/* KEYS */
document.addEventListener("keydown", (e) => {
  if (e.code === "Space") {
    e.preventDefault();
    if (!gameOver) {
      pan.vy = -12;
      pan.angularVelocity = 0.35;

      lastFlipTime = performance.now();
      perfectAvailable = true;
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
  spawnInterval = baseSpawnInterval;
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

      if (b.bomb && b.life >= b.targetLife) {
        spawnParticles(b.x, b.y, "red", 30);
        spawnParticles(b.x, b.y, "orange", 30);
        spawnMiniBurgers(b.x, b.y);
        shake = 15;

        burgers.splice(i, 1);
        i--;
        continue;
      }

      if (!b.bomb && b.life >= b.targetLife) {
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

    /* 🎈 BALLOON PHYSICS */
    if (b.balloon) {
      b.vy -= gravity * 0.6; // float up
    } else {
      b.vy += gravity;
    }

    b.vx *= 0.999;
    b.vy *= 0.999;

    b.x += b.vx;
    b.y += b.vy;

    b.angle += b.angularVelocity;
    b.angularVelocity *= 0.995;

    /* WALLS (not for bombs) */
    if (!b.bomb) {
      if (b.x < b.radius) {
        b.x = b.radius;
        b.vx *= -0.7;
      }
      if (b.x > window.innerWidth - b.radius) {
        b.x = window.innerWidth - b.radius;
        b.vx *= -0.7;
      }
    }

    /* REMOVE BOMB OFFSCREEN */
    if (b.bomb && (b.x < -50 || b.x > window.innerWidth + 50 || b.y > window.innerHeight)) {
      burgers.splice(i, 1);
      i--;
      continue;
    }

    /* MISS */
    if (b.y > window.innerHeight || b.y < -100) {
      burgers.splice(i, 1);
      i--;
      misses++;
      if (misses >= 3) gameOver = true;
      continue;
    }

    /* PAN COLLISION */
    let panLeft = pan.x - pan.width / 2;
    let panRight = pan.x + pan.width / 2;
    let surfaceY = pan.y + Math.sin(pan.angle) * (b.x - pan.x);

    let touching =
      b.y + b.radius > surfaceY &&
      b.y < surfaceY + 15 &&
      b.x > panLeft &&
      b.x < panRight;

    if (touching) {
      let slope = Math.sin(pan.angle);
      let now = performance.now();
      let isPerfect = perfectAvailable && (now - lastFlipTime < PERFECT_WINDOW);

      if (b.balloon) {
        // hit downward
        b.vy = 6;
        b.vx += slope * 3;
      } else if (pan.vy < -2) {
        b.vy = -10;
        b.vx += slope * 7;
        b.angularVelocity += slope * 0.35;

        if (isPerfect) {
          spawnParticles(b.x, b.y, "cyan", 6);
          perfectAvailable = false;
        } else {
          spawnParticles(b.x, b.y, "orange", 10);
        }

        shake = 8;
      } else {
        b.vy *= -0.6;
        b.vx += slope * 2;
      }
    }
  }

  /* BURGER COLLISION */
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

  if (b.bomb) {
    ctx.fillStyle = "black";
    ctx.beginPath();
    ctx.arc(0, 0, 20, 0, Math.PI * 2);
    ctx.fill();
  } else if (b.balloon) {
    ctx.fillStyle = "pink";
    ctx.beginPath();
    ctx.arc(0, 0, 20, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "white";
    ctx.beginPath();
    ctx.moveTo(0, 20);
    ctx.lineTo(0, 35);
    ctx.stroke();
  } else {
    ctx.fillStyle = b.golden ? "gold" : "saddlebrown";
    ctx.fillRect(-30, -20, 60, 40);
  }

  ctx.restore();
}

/* LOOP */
function loop() {
  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

  update();

  drawPan();
  for (let b of burgers) drawBurger(b);

  requestAnimationFrame(loop);
}

loop();