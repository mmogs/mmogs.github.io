const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let gravity = 0.6;

/* Pan (player controlled) */
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

/* Physics */
function update() {
  // Apply gravity
  burger.vy += gravity;

  // Move burger
  burger.x += burger.vx;
  burger.y += burger.vy;
  burger.angle += burger.angularVelocity;

  // --- Ground collision ---
  if (burger.y > canvas.height - 40) {
    burger.y = canvas.height - 40;
    burger.vy *= -0.6;
    burger.vx *= 0.8;
    burger.angularVelocity *= 0.8;

    // Add spin from impact
    burger.angularVelocity += burger.vx * 0.02;
  }

  // --- Pan collision ---
  let panTop = pan.y;

  if (
    burger.y + 20 > panTop &&
    burger.y < panTop + 10 &&
    Math.abs(burger.x - pan.x) < pan.width / 2
  ) {
    // Place burger on top of pan
    burger.y = panTop - 20;

    // Transfer pan movement into burger motion
    burger.vx = (pan.x - burger.x) * 0.2;
    burger.vy = -8; // upward flip impulse

    // Add rotation based on horizontal movement
    burger.angularVelocity += (pan.x - burger.x) * 0.05;
  }
}

/* Draw pan */
function drawPan() {
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