const configCanvas = {
  canvasWidth: 640,
  canvasHeight: 480,
  avatarSize: 20,
};

class Player {
  constructor({ x, y, score, id }) {
    this.x = +x;
    this.y = +y;
    this.score = score;
    this.id = id;
  }

  movePlayer(dir, speed = 1) {
    const x = this.x;
    const y = this.y;

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
        this.x = x - speed;
        break;
      case "right":
        this.x = x + speed;
        break;
      case "up":
        this.y = y - speed;
        break;
      case "down":
        this.y = y + speed;
        break;
    }
  }

  collision(item) {
    // item=> Collectible
    const distance = Math.sqrt((this.x - item.x) ** 2 + (this.y - item.y) ** 2);
    return distance < 20;
  }

  calculateRank(arr) {
    // arr: array con players
    const n = arr.length;
    let rank = 1;
    for (let i = 0; i < n; i++) {
      if (this.score < arr[i].score) rank++;
    }
    return `Rank: ${rank} / ${n}`;
  }
}

export default Player;