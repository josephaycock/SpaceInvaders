class Laser {
    constructor(x, y, direction = 'up') {
        this.x = x;
        this.y = y;
        this.width = 5;
        this.height = 10;
        this.toDelete = false;
        this.direction = direction;
    }
    
    show() {
        fill(this.direction === 'up' ? 'red' : 'yellow');
        noStroke();
        rect(this.x, this.y, this.width, this.height);
    }

    move() {
        if (this.direction === 'up') {
            this.y = this.y - 20;
        } else {
            this.y = this.y + 20;
        }
    }

    hits(target) {
        if (this.direction === 'up' && target instanceof Enemy) {
            return (this.x + this.width >= target.x - target.width / 2 &&  // Check right edge of laser with left edge of enemy
            this.x <= target.x + target.width / 2 &&              // Check left edge of laser with right edge of enemy
            this.y + this.height >= target.y - target.height / 2 && // Check bottom edge of laser with top edge of enemy
            this.y <= target.y + target.height / 2);
        } else if (this.direction === 'down' && target instanceof Ship) {
            return (this.x + this.width >= target.x - target.width / 2 &&
                    this.x <= target.x + target.width / 2 &&
                    this.y + this.height >= target.y &&
                    this.y <= target.y + target.height);
        }
        return false;
    }
    
    remove() {
        this.toDelete = true;
    }
}