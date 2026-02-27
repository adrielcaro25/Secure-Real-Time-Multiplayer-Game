import Player from "./Player.mjs";
import Collectible from "./Collectible.mjs";

const socket = io();
const canvas = document.getElementById("game-window");
const ctx = canvas.getContext("2d");
const rankboard = document.getElementById("rankboard");
const scoreboard = document.getElementById("scoreboard");

socket.on("connect", () => {
  document.addEventListener("keydown", (e) => {
    let dir;
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
      e.preventDefault();
    }
    switch (e.key) {
      case "ArrowLeft":
        dir = "left";
        break;
      case "ArrowRight":
        dir = "right";
        break;
      case "ArrowUp":
        dir = "up";
        break;
      case "ArrowDown":
        dir = "down";
        break;
      default:
        return;
    }

    socket.emit("playerMove", {
      id: socket.id,
      dir,
    });
  });

  let intervalId = null;

  function startMoving(dir) {
    if (intervalId) return;
    intervalId = setInterval(() => {
      socket.emit("playerMove", {
        id: socket.id,
        dir,
      });
    }, 50);
  }

  function stopMoving() {
    clearInterval(intervalId);
    intervalId = null;
  }

  document.querySelectorAll(".btn").forEach((btn) => {
    const dir = btn.classList[1];

    btn.addEventListener("mousedown", () => startMoving(dir));
    btn.addEventListener("mouseup", () => stopMoving(dir));
    btn.addEventListener("mouseleave", () => stopMoving(dir));

    btn.addEventListener("touchstart", (e) => {
      e.preventDefault();
      startMoving(dir);
    });
    btn.addEventListener("touchend", () => stopMoving(dir));
    btn.addEventListener("touchcancel", () => stopMoving(dir));
  });

  socket.on("updatePlayers", (players, item) => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const playersLength = Object.keys(players).length;

    if (players[socket.id] && socket.id === players[socket.id].id) {
      const p = players[socket.id];
      scoreboard.innerHTML = `Score: ${p.score}`;
      rankboard.innerHTML = `Rank: ${p.rank ?? 1}/${playersLength}`;
    }
    renderCollectible(item);
    Object.values(players).forEach((p) => {
      const color = p.color;
      renderAvatar(p, color, socket.id === p.id);
    });
  });
});

async function renderAvatar(player, color, isHost = false) {
  const x = player.x;
  const y = player.y;
  const size = 20;

  ctx.beginPath();
  ctx.arc(x, y, size / 2, 0, 2 * Math.PI);
  ctx.stroke();

  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.fillStyle = color;

  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, size / 2.2, 0, Math.PI * 2);
  ctx.fill();



  if (isHost) {
    ctx.strokeStyle = "black";
    ctx.lineWidth = 3;

    ctx.beginPath();
    ctx.moveTo(x + size * 0.5, y - size * 0.4);
    ctx.lineTo(x + size * 0.8, y - size * 0.6);
    ctx.stroke();
  }
}

function renderCollectible(collectible) {
  const x = collectible.x;
  const y = collectible.y;
  const size = 20;
  ctx.beginPath();
  ctx.arc(x, y, size / 2, 0, 2 * Math.PI);
  ctx.stroke();
  ctx.fillStyle = getColorByValue(collectible.value);
  ctx.beginPath();
  ctx.arc(x, y, size / 2.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.font = "10px Arial";
  ctx.fillStyle = "black";

  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(collectible.value, x, y);
}
function getColorByValue(value) {
  const colors = [
    "#7C5A2A",
    "#8D6E36",
    "#B87333",
    "#A7A9AC",
    "#BFC1C2",
    "#C0C0C0",
    "#D4AF37",
    "#E6BE50",
    "#F2C94C",
    "#FFD700",
  ];

  return colors[value - 1] || "#006400"; // fallback
}