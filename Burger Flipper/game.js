const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let gravity = 0.6;

/* Pan */
let pan = {
  x: canvas.width / 2,
  y: canvas.height - 120,
  width: 160
};

/* Burger */
let burger = {
  x: canvas.width / 2,
  y: 100,
  vx: 0,
  vy: 0,
  angle: 0,
  angularVelocity: 0
};

/* Mouse controls pan */
canvas.addEventListener("mousemove", (e) => {
  pan.x = e.clientX;
});

/* Buttons */
const launchBtn = document.getElementById("launchBtn");
const resetBtn = document.getElementById("resetBtn");

/* Launch burger */
launchBtn.addEventListener("click", () => {
  // Give upward + rotational impulse
  burger.vy = -10;
  burger.angularVelocity += (Math.random() - 0.5) * 0.3;
});

/* Reset game */
resetBtn.addEventListener("click", () => {
  burger.x = canvas.width / 2;
  burger.y = 100;
  burger.vx = 0;
  burger.vy = 0;
  burger.angle = 0;
  burger.angularVelocity = 0;
});

/* Physics */
function update() {
  burger.vy += gravity;

  burger.x += burger.vx;
  burger.y += burger.vy;
  burger.angle += burger.angularVelocity;

  /* --- Screen boundaries --- */

  // Left wall
  if (burger.x < 30) {
    burger.x = 30;
    burger.vx *= -0.7;
  }

  // Right wall
  if (burger.x > canvas.width - 30) {
    burger.x = canvas.width - 30;
    burger.vx *= -0.7;
  }

  // Ground
  if (burger.y > canvas.height - 40) {
    burger.y = canvas.height - 40;
    burger.vy *= -0.6;
    burger.vx *= 0.8;
    burger.angularVelocity *= 0.8;

    burger.angularVelocity += burger.vx * 0.02;
  }

  /* --- Pan collision --- */
  let panTop = pan.y;

  if (
    burger.y + 20 > panTop &&
    burger.y < panTop + 10 &&
    Math.abs(burger.x - pan.x) < pan.width / 2
  ) {
    burger.y = panTop - 20;

    burger.vx = (pan.x - burger.x) * 0.2;
    burger.vy = -8;

    burger.angularVelocity += (pan.x - burger.x) * 0.05;
  }
}

/* Draw pan with handle */
function drawPan() {
  // Handle
  ctx.fillStyle = "dimgray";
  ctx.fillRect(pan.x - 10, pan.y + 10, 20, 80);

  // Pan base
  ctx.fillStyle = "gray";
  ctx.fillRect(pan.x - pan.width / 2, pan.y, pan.width, 10);
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