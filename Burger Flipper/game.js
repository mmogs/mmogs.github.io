const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let burger = {
  x: canvas.width / 2,
  y: canvas.height - 200,
  vx: 0,
  vy: 0,
  angle: 0,
  angularVelocity: 0,
  launched: false
};

let gravity = 0.5;
let isAiming = false;
let startX = 0;
let startY = 0;

let spatula = {
  x: canvas.width / 2,
  y: canvas.height - 100,
  width: 150
};

/* Mouse aiming */
canvas.addEventListener("mousedown", (e) => {
  if (!burger.launched) {
    isAiming = true;
    startX = e.clientX;
    startY = e.clientY;
  }
});

canvas.addEventListener("mouseup", (e) => {
  if (isAiming) {
    isAiming = false;

    let dx = e.clientX - startX;
    let dy = e.clientY - startY;

    // Launch power
    burger.vx = dx * 0.1;
    burger.vy = dy * 0.1;
    burger.angularVelocity = dx * 0.02;

    burger.launched = true;
  }
});

/* Physics */
function update() {
  if (burger.launched) {
    burger.vy += gravity;

    burger.x += burger.vx;
    burger.y += burger.vy;

    burger.angle += burger.angularVelocity;
    burger.angularVelocity *= 0.99;
  } else {
    // Sit on spatula before launch
    burger.x = spatula.x;
    burger.y = spatula.y - 40;
  }

  // Simple floor collision
  if (burger.y > canvas.height - 40) {
    burger.vy *= -0.5;
    burger.vx *= 0.8;
    burger.angularVelocity *= 0.8;
    burger.y = canvas.height - 40;
  }
}

/* Draw */
function drawSpatula() {
  ctx.fillStyle = "gray";
  ctx.fillRect(
    spatula.x - spatula.width / 2,
    spatula.y,
    spatula.width,
    10
  );
}

function drawBurger() {
  ctx.save();
  ctx.translate(burger.x, burger.y);
  ctx.rotate(burger.angle);

  ctx.fillStyle = "saddlebrown";
  ctx.fillRect(-30, -20, 60, 40);

  ctx.restore();
}

/* Aiming line */
function drawAimLine(e) {
  if (!isAiming) return;

  ctx.beginPath();
  ctx.moveTo(startX, startY);
  ctx.lineTo(e.clientX, e.clientY);
  ctx.strokeStyle = "black";
  ctx.stroke();
}

/* Loop */
function loop(e) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  update();
  drawSpatula();
  drawBurger();

  if (isAiming) drawAimLine(e);

  requestAnimationFrame(loop);
}

canvas.addEventListener("mousemove", (e) => {
  window.currentMouse = e;
});

function renderLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  update();
  drawSpatula();
  drawBurger();

  if (isAiming && window.currentMouse) {
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(window.currentMouse.clientX, window.currentMouse.clientY);
    ctx.stroke();
  }

  requestAnimationFrame(renderLoop);
}

renderLoop();