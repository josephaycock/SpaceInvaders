class Enemy {
    constructor(x, y, width, height, spriteSheet, animations) {
      this.sprite = new Sprite(x,y,width,height);
      this.sprite.spriteSheet = spriteSheet;
      this.sprite.collider = 'rectangle'; // look more into this
      this.sprite.anis.frameDelay = 7; // look more into this
      this.sprite.addAnis(animations);
      this.sprite.changeAni('idle');
      this.destroyed = false;
      this.speed = 1;
    }
  
    update() {
      
    }
  
    display() {
      this.sprite.draw();
    }
  
  }