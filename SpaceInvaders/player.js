class Ship {
    constructor() {
        this.x = width / 2;
        this.y = height - 10;
        this.width = 60;
        this.height = 10;
        this.xdir = 0;
        this.isHit = false;
        this.hitTimer = 0;
    }
  
    show() {
        if (this.isHit && this.hitTimer > 0) {
            fill(255, 0, 0); 
            this.hitTimer--; 
        } else {
            fill(0, 255, 0); 
            this.isHit = false; 
        }
        noStroke();
        rect(this.x - this.width / 2, this.y, this.width, this.height);
        rect(this.x - 10, this.y - 10, 20, 10);
    }

    move() {
        this.x += this.xdir * 5;
        this.x = constrain(this.x, this.width / 2, width - this.width / 2);
    }

    setDirection(dir) {
        this.xdir = dir;
    }
    
    hit() {

        this.isHit = true;
        this.hitTimer = 15; 
        lives--;
        this.x = width / 2; 
        if (lives <= 0) {
            screen = 2; 
        }
    }
}