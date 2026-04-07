const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let burger = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  vy: 0,
  angle: 0,
  angularVelocity: 0,
  onSpatula: true
};

let spatula = {
  x: canvas.width / 2,
  y: canvas.height - 100,
  width: 120
};

let gravity = 0.5;
let isDragging = false;
let lastMouseY = 0;

canvas.addEventListener("mousedown", (e) => {
  isDragging = true;
  lastMouseY = e.clientY;
});

canvas.addEventListener("mouseup", () => {
  isDragging = false;
});

canvas.addEventListener("mousemove", (e) => {
  if (isDragging) {
    let deltaY = e.clientY - lastMouseY;
    burger.angularVelocity += deltaY * 0.01;
    burger.vy += deltaY * 0.2;
    lastMouseY = e.clientY;
  }
});

function update() {
  if (!burger.onSpatula) {
    burger.vy += gravity;
    burger.y += burger.vy;
  } else {
    burger.y = spatula.y - 40;
    burger.vy = 0;
  }

  burger.angle += burger.angularVelocity;
  burger.angularVelocity *= 0.98;

  if (Math.abs(burger.x - spatula.x) > spatula.width / 2) {
    burger.onSpatula = false;
  }
}

function drawBurger() {
  ctx.save();
  ctx.translate(burger.x, burger.y);
  ctx.rotate(burger.angle);

  ctx.fillStyle = "saddlebrown";
  ctx.fillRect(-30, -20, 60, 40);

  ctx.restore();
}

function drawSpatula() {
  ctx.fillStyle = "gray";
  ctx.fillRect(spatula.x - spatula.width / 2, spatula.y, spatula.width, 10);
}

function loop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  update();
  drawSpatula();
  drawBurger();

  requestAnimationFrame(loop);
}

loop();