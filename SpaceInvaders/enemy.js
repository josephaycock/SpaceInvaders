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
    this.radius = 20; // for collision detection
    this.xdir = 1;
  }

  show() {
    if (this.alive) {
      if (this.currentImg === 'A') {
        push(); // Use push and pop to isolate styling
        imageMode(CENTER);
        rectMode(CENTER);
        stroke(255, 0, 0); // Red for bounding box
        noFill();
        image(this.imgA, this.x, this.y, this.width, this.height);
        rect(this.x, this.y, this.width, this.height); // Draw bounding box
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
    this.y += this.height;
  }
}