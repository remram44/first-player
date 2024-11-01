if(window.performance.now) {
  function getTime() {
    return window.performance.now();
  }
} else {
  function getTime() {
    return new Date();
  }
}

const colors = [
  '#ff595e',
  '#ffca3a',
  '#8ac926',
  '#1982c4',
  '#6a4c93',
];

let touches = {};
let usedColors = [];
for(let i = 0; i < colors.length; ++i) {
  usedColors.push(false);
}

function pickColor() {
  for(let i = 0; i < usedColors.length; ++i) {
    if(!usedColors[i]) {
      usedColors[i] = true;
      return i;
    }
  }
  return 0;
}

function releaseColor(i) {
  usedColors[i] = false;
}

let winnerPosition = undefined;
let winnerColor = undefined;
let winnerTime = undefined;

const canvas = document.getElementById('canvas');
const root = document.getElementById('root');

// Rendering
function draw() {
  const ctx = canvas.getContext('2d');

  const now = getTime();

  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, width, height);

  // Show winner
  if(winnerColor != undefined) {
    ctx.fillStyle = colors[winnerColor];
    ctx.beginPath();
    ctx.arc(winnerPosition[0], winnerPosition[1], (now - winnerTime) * 0.0005 * (width + height), 0, 2.0 * Math.PI);
    ctx.fill();
  }

  // Show touches
  const touchIds = Object.keys(touches);
  ctx.lineWidth = 10;
  for(let i = 0; i < touchIds.length; ++i) {
    const touch = touches[touchIds[i]];
    time = (now - touch.start) / 1000.0;
    let rot = 5.0 * time - 30.0 / (1.0 + time);
    ctx.strokeStyle = colors[touch.color];
    ctx.beginPath();
    ctx.arc(touch.x, touch.y, touchRadius, rot, rot + 1.5 * Math.PI);
    ctx.stroke();
  }

  if(Object.keys(touches).length > 0 || (winnerTime != undefined && now - winnerTime < 2000)) {
    requestAnimationFrame(draw);
  }
}

// Handle selecton
function doSelection() {
  let touchIds = Object.keys(touches);
  let winnerIndex = Math.floor(Math.random() * (1.0 * touchIds.length));
  let winnerTouch = touches[touchIds[winnerIndex]];
  winnerPosition = [winnerTouch.x, winnerTouch.y];
  winnerColor = winnerTouch.color;
  winnerTime = getTime();
  touches = {};
}

let selectTimer = undefined;
function startTimer() {
  if(winnerColor != undefined) {
    return;
  }
  if(selectTimer != undefined) {
    clearTimeout(selectTimer);
  }
  selectTimer = setTimeout(doSelection, 3000);
}

// Handle touch events
function handleTouch(e) {
  e.preventDefault();
  if(winnerColor != undefined) {
    return;
  }
  for(let i = 0; i < e.changedTouches.length; ++i) {
    const touch = e.changedTouches[i];
    if(!(touch.identifier in touches)) {
      touches[touch.identifier] = {
        x: touch.clientX,
        y: touch.clientY,
        start: getTime(),
        color: pickColor(),
      };
      startTimer();
    } else {
      touches[touch.identifier].x = touch.clientX;
      touches[touch.identifier].y = touch.clientY;
    }
  }
  draw();
}
canvas.addEventListener('touchstart', handleTouch);
canvas.addEventListener('touchmove', handleTouch);
function handleTouchEnd(e) {
  e.preventDefault();
  if(winnerColor != undefined) {
    return;
  }
  for(let i = 0; i < e.changedTouches.length; ++i) {
    const touch = e.changedTouches[i];
    releaseColor(touches[touch.identifier].color);
    delete touches[touch.identifier];
  }
  startTimer();
}
canvas.addEventListener('touchend', handleTouchEnd);
canvas.addEventListener('touchcancel', handleTouchEnd);

// Handle resizing
let width, height;
let touchRadius;
function resize() {
  width = root.clientWidth;
  height = root.clientHeight;
  canvas.width = width;
  canvas.height = height;
  touchRadius = Math.min(width, height) * 0.15;
  draw();
}
window.addEventListener('resize', resize);
resize();
