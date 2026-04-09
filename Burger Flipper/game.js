const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = canvas.clientWidth;
canvas.height = canvas.clientHeight;

/* SETTINGS */
let gravity = 0.18;

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
  return {
    x: canvas.width / 2,
    y: 60,
    vx: (Math.random() - 0.5) * 1,
    vy: 0,
    angle: 0,
    angularVelocity: 0
  };
}

/* MOUSE CONTROL */
canvas.addEventListener("mousemove", (e) => {
  const rect = canvas.getBoundingClientRect();
  pan.x = e.clientX - rect.left;
  pan.y = e.clientY - rect.top;
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

  /* SPAWN BURGERS */
  spawnCounter++;

  if (spawnCounter >= spawnInterval) {
    burgers.push(spawnBurger());
    spawnCounter = 0;
    spawnInterval = Math.max(60, spawnInterval - 2);
  }

  /* UPDATE BURGERS */
  for (let i = 0; i < burgers.length; i++) {
    let burger = burgers[i];

    /* PHYSICS */
    burger.vy += gravity;

    burger.x += burger.vx;
    burger.y += burger.vy;
    burger.angle += burger.angularVelocity;

    burger.angularVelocity *= 0.995;
    burger.vx *= 0.995;

   /* BOUNDS (ALL WALLS) */
let radius = 20;

/* LEFT */
if (burger.x - radius < 0) {
  burger.x = radius;
  burger.vx *= -0.7;
}

/* RIGHT */
if (burger.x + radius > canvas.width) {
  burger.x = canvas.width - radius;
  burger.vx *= -0.7;
}

/* TOP */
if (burger.y - radius < 0) {
  burger.y = radius;
  burger.vy *= -0.7;
}


}

    /* PAN COLLISION */

    let panLeft = pan.x - pan.width / 2;
    let panRight = pan.x + pan.width / 2;

    let handleWidth = 80;

    let extendedLeft = panLeft;
    let extendedRight = panRight + handleWidth;

    let panSurfaceY =
      pan.y + Math.sin(pan.angle) * (burger.x - pan.x);

    let touching =
      burger.y + 20 > panSurfaceY &&
      burger.y < panSurfaceY + 25 &&
      burger.x > extendedLeft &&
      burger.x < extendedRight;

    if (touching && burger.vy >= 0) {

      burger.y = panSurfaceY - 20;

      let slope = Math.sin(pan.angle);

      /* RESTING SLIDE */
      if (pan.vy >= 0) {
        burger.angularVelocity = 0;
        burger.vy = 0;

        let gravityAlongSlope = gravity * slope;

        burger.vx += gravityAlongSlope;
        burger.vx *= 0.995;
      }

      /* FLIP */
      if (pan.vy < -2) {
        burger.vy = -10;
        burger.vx += slope * 7;
        burger.angularVelocity += slope * 0.35;
      }
    }
  }
}

/* DRAW PAN */
function drawPan() {
  ctx.save();
  ctx.translate(pan.x, pan.y);
  ctx.rotate(pan.angle);

  // pan base
  ctx.fillStyle = "gray";
  ctx.fillRect(-pan.width / 2, 0, pan.width, pan.height);

  // handle (extended hitbox visual)
  ctx.fillStyle = "dimgray";
  ctx.fillRect(pan.width / 2, -5, 60, 20);

  ctx.restore();
}

function drawBurger(burger) {
  ctx.save();
  ctx.translate(burger.x, burger.y);
  ctx.rotate(burger.angle);

  let w = 60;
  let h = 40;

  // Bottom bun
  ctx.fillStyle = "#d19b5e";
  ctx.beginPath();
  ctx.ellipse(0, 10, w / 2, h / 4, 0, 0, Math.PI * 2);
  ctx.fill();

  // Patty
  ctx.fillStyle = "#5c2e1f";
  ctx.fillRect(-w / 2, -5, w, 15);

  // Cheese
  ctx.fillStyle = "#f7c531";
  ctx.beginPath();
  ctx.moveTo(-20, 5);
  ctx.lineTo(0, 15);
  ctx.lineTo(20, 5);
  ctx.closePath();
  ctx.fill();

  // Lettuce
  ctx.fillStyle = "#4caf50";
  for (let i = -25; i <= 25; i += 10) {
    ctx.beginPath();
    ctx.arc(i, -5, 6, 0, Math.PI * 2);
    ctx.fill();
  }

  // Top bun
  ctx.fillStyle = "#e0ac69";
  ctx.beginPath();
  ctx.ellipse(0, -15, w / 2, h / 3, 0, Math.PI, 0);
  ctx.fill();

  // Sesame seeds
  ctx.fillStyle = "white";
  for (let i = 0; i < 6; i++) {
    let x = (Math.random() - 0.5) * 30;
    let y = -15 + Math.random() * 5;
    ctx.fillRect(x, y, 3, 2);
  }

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