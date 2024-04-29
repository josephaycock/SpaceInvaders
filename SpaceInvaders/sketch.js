let enemySprite;
let sprite;
let ship;
let gameFont;
let count = 0;
let score = 0;
let time = 0; // test time bw the game and end screen
let screen = 0;
let enemies = [];

function preload() {
  gameFont = loadFont('assets/PressStart2P-Regular.ttf');


}

function setup() {
  createCanvas(600, 400);
  
  textFont(gameFont);

  frameRate(10);

  ship = new Ship();
}

function draw() {
  background(0);

  if (screen === 0) {
    menuScreen();
  } else if (screen === 1) {
    gameScreen();
  } else if (screen === 2) {
    endScreen();
  }

}

function menuScreen() {
  background('black');
  fill('white');
  text("Menu Screen", 100, 100);
}

function gameScreen() { 
  background('black');
  fill('white');
  text("Game Screen", 100, 100);
  text("Time: " + ceil(time), 20, 30);
  text("Score: " + score, 260, 30);

  ship.show();
  ship.move();

  time += deltaTime / 1000;
  if (time > 15) {
    screen = 2;
    return;
  }
}

function endScreen() {
  background('black');
  fill('white');
  text("End Screen", 100, 100);
  text("Time Survived: " + ceil(time), 20, 30);
  text("Score: " + score, 260, 30);
}

function startGame() {
  screen = 1;
  score = 0;
  time = 0;
  count = 5;
  enemies = [];

  let animations = {
    idle: { row: 0, frames: 1 }
  };

}

function restartGame() {
  screen = 0;
  score = 0;
  time = 0;
}

function mousePressed() {
  if (screen == 0) {
    startGame();
  } else if (screen == 2) {
    restartGame();
  }
}

function keyPressed() {
  if (keyCode === RIGHT_ARROW) {
    ship.setDirection(1);
  } else if (keyCode === LEFT_ARROW) {
    ship.setDirection(-1);
  }
}

function keyReleased() {
  if (keyCode === RIGHT_ARROW || keyCode === LEFT_ARROW) {
    ship.setDirection(0);
  }
}