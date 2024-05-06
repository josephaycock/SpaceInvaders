class Enemy {
  constructor(x, y, imgA, imgB, pointValue) {
    this.x = x;
    this.y = y;
    this.width = 38;
    this.height = 26;
    this.alive = true;
    this.imgA = imgA;
    this.imgB = imgB;
    this.currentImg = 'A';
    this.pointValue = pointValue;
    this.radius = 20;
    this.xdir = 1;
    this.speed = 1;
  }

  show() {
    if (this.alive) {
      if (this.currentImg === 'A') {
        push();
        imageMode(CENTER);
        image(this.imgA, this.x, this.y, this.width, this.height);
        pop();
      } else {
        image(this.imgB, this.x, this.y, this.width, this.height);
      }
    }
  }

  move() {
    this.x = this.x + this.xdir;
    if (this.currentImg === 'A') {
      this.currentImg = 'B';
    } else if (this.currentImg === 'B'){
      this.currentImg = 'A';
    }
  }

  shoot() {
    if (random(1) < 0.009) {
      return new Laser(this.x, this.y + this.height, 'down');
    } else {
      return null;
    }
  }

  shiftDown() {
    this.xdir *= -1;
    this.y += 20;

    if (this.y > height - 100) {
      screen = 2;
    }

    if (this.xdir > 0) {
      this.xdir += this.speed;
    } else {
      this.xdir -= this.speed;
    }
  }
}