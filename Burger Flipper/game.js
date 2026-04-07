const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = canvas.clientWidth;
canvas.height = canvas.clientHeight;

let gravity = 0.6;

/* Pan */
let pan = {
  x: canvas.width / 2,
  y: canvas.height - 120,
  width: 160,
  height: 10,
  lifting: false
};

/* Burger */
let burger = spawnBurger();

function spawnBurger() {
  return {
    x: canvas.width / 2,
    y: 50,
    vx: 0,
    vy: 0,
    angle: 0,
    angularVelocity: 0
  };
}

/* Fix mouse position relative to canvas */
function getMousePos(e) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top
  };
}

/* Mouse controls */
canvas.addEventListener("mousemove", (e) => {
  const pos = getMousePos(e);
  pan.x = pos.x;
});

canvas.addEventListener("mousedown", () => {
  pan.lifting = true;
});

canvas.addEventListener("mouseup", () => {
  pan.lifting = false;
});

/* Physics */
function update() {
  // Gravity
  burger.vy += gravity;

  // Movement
  burger.x += burger.vx;
  burger.y += burger.vy;
  burger.angle += burger.angularVelocity;

  /* --- Walls --- */
  if (burger.x < 30) {
    burger.x = 30;
    burger.vx *= -0.7;
  }

  if (burger.x > canvas.width - 30) {
    burger.x = canvas.width - 30;
    burger.vx *= -0.7;
  }

  /* --- Bottom reset --- */
  if (burger.y > canvas.height) {
    burger = spawnBurger();
    return;
  }

  /* --- Pan collision --- */
  let panTop = pan.y;

  let isAbovePan =
    burger.y + 20 > panTop &&
    burger.y < panTop + 10;

  let isOverPan =
    Math.abs(burger.x - pan.x) < pan.width / 2;

  if (isAbovePan && isOverPan) {
    // Snap burger onto pan (prevents repeated falling)
    burger.y = panTop - 20;
    burger.vy = 0;

    if (pan.lifting) {
      // Flip impulse
      burger.vy = -10;
      burger.vx += (burger.x - pan.x) * 0.3;
      burger.angularVelocity += (burger.x - pan.x) * 0.05;
    } else {
      // Rest on pan
      burger.vx *= 0.9;
      burger.angularVelocity *= 0.9;
    }
  }
}

/* Draw pan (handle on side) */
function drawPan() {
  ctx.fillStyle = "dimgray";

  // Base
  ctx.fillRect(pan.x - pan.width / 2, pan.y, pan.width, pan.height);

  // Handle (right side)
  ctx.fillRect(pan.x + pan.width / 2, pan.y - 5, 60, 20);
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