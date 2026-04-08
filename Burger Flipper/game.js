const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = canvas.clientWidth;
canvas.height = canvas.clientHeight;

/* SETTINGS */
let gravity = 0.35; // floatier
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
  return {
    x: canvas.width / 2,
    y: 60,
    vx: (Math.random() - 0.5) * 1,
    vy: 0,
    angle: 0,
    angularVelocity: 0,
    active: true
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

  /* SPAWN BURGERS OVER TIME */
  spawnCounter++;

  if (spawnCounter >= spawnInterval) {
    burgers.push(spawnBurger());
    spawnCounter = 0;

    // increase difficulty
    spawnInterval = Math.max(60, spawnInterval - 2);
  }

  /* UPDATE EACH BURGER */
  for (let i = 0; i < burgers.length; i++) {
    let burger = burgers[i];

    burger.vy += gravity;

    burger.x += burger.vx;
    burger.y += burger.vy;
    burger.angle += burger.angularVelocity;

    burger.angularVelocity *= 0.99;

    /* WALLS */
    if (burger.x < 30) {
      burger.x = 30;
      burger.vx *= -0.7;
    }
    if (burger.x > canvas.width - 30) {
      burger.x = canvas.width - 30;
      burger.vx *= -0.7;
    }

    /* RESET IF FALLS */
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
      burger.y + 20 > panSurfaceY &&
      burger.y < panSurfaceY + 15 &&
      burger.x > panLeft &&
      burger.x < panRight;

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
function drawBurger(burger) {
  ctx.save();
  ctx.translate(burger.x, burger.y);
  ctx.rotate(burger.angle);

  ctx.fillStyle = "saddlebrown";
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