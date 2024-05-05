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
            fill(255, 0, 0); // Ship turns red when hit
            this.hitTimer--; // Decrement the timer
        } else {
            fill(0, 255, 0); // Normal green color
            this.isHit = false; // Reset hit flag once timer is over
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
        this.hitTimer = 15; // Set the hit effect to last for 30 frames
        lives--; // Decrement lives
        this.x = width / 2; // Reset the ship's position
        if (lives <= 0) {
            screen = 2; // Go to end screen if no lives left
        }
    }
}