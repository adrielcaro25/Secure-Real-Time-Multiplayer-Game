const configCanvas = {
  canvasWidth: 640,
  canvasHeight: 480,
  avatarSize: 20,
};
function execIO(io) {
  let players = {};
  let item = createItem(configCanvas.canvasWidth, configCanvas.canvasHeight);

  io.on("connection", (socket) => {
    players[socket.id] = createPlayer(
      socket.id,
      configCanvas.canvasWidth,
      configCanvas.canvasHeight
    );
    calculateRanks(players);

    socket.on("playerMove", (data) => {
      const id = data.id;
      if (players[id]) {
        const player = players[id];
        movePlayer(player, data.dir);
      }

      if (existCollision(item, players[id]) && socket.id === id) {
        console.log("collected");
        players[id].score += item.value;
        item = createItem(configCanvas.canvasWidth, configCanvas.canvasHeight);
        calculateRanks(players);
      }
    });

    // socket.on("itemCollected", ({ id }) => {
    //   console.log("item collected", id);
    //   if (players[id] && id === socket.id) {
    //     players[id].score += item.value;
    //     item = createItem(configCanvas.canvasWidth, configCanvas.canvasHeight);
    //     calculateRanks(players);
    //   }
    // });

    socket.on("disconnect", () => {
      delete players[socket.id];
      calculateRanks(players);
      if (Object.keys(players).length === 0) {
        players = {};
        item = createItem(configCanvas.canvasWidth, configCanvas.canvasHeight);
      }
    });
  });

  // 👇 loop centralizado, manda estado 20 veces por segundo
  setInterval(() => {
    io.emit("updatePlayers", players, item);
  }, 50);
}

function createPlayer(socketId, canvasWidth, canvasHeight) {
  const avatarSize = 20;
  const x_random = Math.floor(
    avatarSize + Math.random() * (canvasWidth - 2 * avatarSize)
  );
  const y_random = Math.floor(
    avatarSize + Math.random() * (canvasHeight - 2 * avatarSize)
  );
  const id = socketId;
  const color = `hsl(${Math.random() * 360},70%,50%)`;
  return { x: x_random, y: y_random, id, color, score: 0 };
}

function createItem(canvasWidth, canvasHeight) {
  const itemSize = 20;
  const x_random = Math.floor(
    itemSize + Math.random() * (canvasWidth - 2 * itemSize)
  );
  const y_random = Math.floor(
    itemSize + Math.random() * (canvasHeight - 2 * itemSize)
  );
  const value = Math.floor(1 + Math.random() * 10);
  return { x: x_random, y: y_random, value };
}

function calculateRanks(players) {
  const sorted = Object.values(players).sort((a, b) => b.score - a.score);
  sorted.forEach((p, i) => (p.rank = i + 1));
}

function movePlayer(player, dir, speed = 5) {
  const x = player.x;
  const y = player.y;

  const leftLimit = configCanvas.avatarSize;
  const rightLimit = configCanvas.canvasWidth - 2 * configCanvas.avatarSize;
  const topLimit = configCanvas.avatarSize;
  const bottomLimit = configCanvas.canvasHeight - 2 * configCanvas.avatarSize;

  if (dir === "left" && x - speed < leftLimit) return;
  if (dir === "right" && x + speed > rightLimit) return;
  if (dir === "up" && y - speed < topLimit) return;
  if (dir === "down" && y + speed > bottomLimit) return;

  switch (dir) {
    case "left":
      player.x = x - speed;
      break;
    case "right":
      player.x = x + speed;
      break;
    case "up":
      player.y = y - speed;
      break;
    case "down":
      player.y = y + speed;
      break;
  }
}

function existCollision(item, player) {
  // item=> Collectible
  const distance = Math.sqrt(
    (player.x - item.x) ** 2 + (player.y - item.y) ** 2
  );
  return distance < 20;
}
module.exports = execIO;
