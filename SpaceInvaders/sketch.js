let ship;
let gameFont;
let lives = 3;
let score = 0;
let time = 0; // test time bw the game and end screen
let screen = 0;
let enemies = []; // empty array to store enemies
let lasers = []; // empty array to store lasers

let crusherAmt = new Tone.BitCrusher(8);
let synth = new Tone.MonoSynth(Tone.Synth);

let crusherAmtAlien = new Tone.BitCrusher(8);
let synthAlien = new Tone.PolySynth(Tone.Synth);

synth.connect(crusherAmt);
crusherAmt.toDestination();

synthAlien.connect(crusherAmtAlien);
crusherAmtAlien.toDestination();

// Create a synth and a filter
let shipDestroyedSynth = new Tone.Synth({
  oscillator: {
      type: 'sawtooth'
  }
}).toDestination();

let filter = new Tone.Filter({
  type: 'lowpass',
  frequency: 8000
}).toDestination();

// Initialize a Volume control node
let volumeControl = new Tone.Volume(-30).toDestination();  // Start with a default volume of -12 dB

// Adjust the existing connections to include the volume node
shipDestroyedSynth.chain(volumeControl, Tone.Destination);
filter.chain(volumeControl, Tone.Destination);

// Create an LFO to modulate the filter frequency
let lfo = new Tone.LFO({
  frequency: 5, // Speed of the LFO modulation in Hz
  min: 100, // Minimum frequency of the filter
  max: 8000 // Maximum frequency of the filter
}).start();

// Connect the LFO to the filter frequency
lfo.connect(filter.frequency);

let backgroundMusic = new Tone.Sampler({
  urls: {
    C3: "C3.mp3",
    E3: "E3.mp3",
    G3: "G3.mp3",
    A3: "A3.mp3",
    B3: "B3.mp3"
  },
  baseUrl: "https://tonejs.github.io/audio/salamander/",
  onload: () => {
      // backgroundPattern.start(0);
      Tone.Transport.start();
  }
}).toDestination();

let backgroundPattern = new Tone.Pattern((time, note) => {
  backgroundMusic.triggerAttackRelease(note, '8n', time);
}, ['C3', 'E3', 'G3', 'E3', 'A3', 'B3', 'A3', 'G3'], 'upDown');

backgroundPattern.interval = '4n';
backgroundPattern.start(0);

function preload() {
  gameFont = loadFont('assets/PressStart2P-Regular.ttf');
  
  alien1a = loadImage('assets/alien1a.png');
  alien1b = loadImage('assets/alien1b.png');
  alien2a = loadImage('assets/alien2a.png');
  alien2b = loadImage('assets/alien2b.png');


}

function setup() {
  createCanvas(600, 400);
  
  textFont(gameFont);
  frameRate(10);
  imageMode(CENTER);

  ship = new Ship();
}

function draw() {
  background(0);
  textAlign(LEFT, BASELINE);

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
  textAlign(LEFT, BASELINE);
  text("Menu Screen", 100, 100);
  startBackgroundMusic();
}

function gameScreen() { 
  background('black');
  fill('white');
  textAlign(LEFT, BASELINE);
  text("Time: " + ceil(time), 20, 30);
  text("Score: " + score, 250, 30);
  text("Lives: " + lives, 450, 30);
  stopBackgroundMusic();

  ship.show();
  ship.move();

  let edge = false;

  for (let i = 0; i < enemies.length; i++) {
    enemies[i].show();
    enemies[i].move();
    if (enemies[i].x > width - enemies[i].width / 2 || enemies[i].x < enemies[i].width / 2) {
      edge = true;
    }
    let enemyLaser = enemies[i].shoot();
    if (enemyLaser != null) {
      lasers.push(enemyLaser);
      synthAlien.triggerAttackRelease('G3', '8n');
    }
  }

  if (edge) {
    for (let i = 0; i < enemies.length; i++) {
      enemies[i].shiftDown();
    }
  }

  for (let l = 0; l < lasers.length; l++) { 
    lasers[l].show();
    lasers[l].move();
    
    if (lasers[l].direction === 'up') {
      for (let j  = 0; j < enemies.length; j++) {
        if (lasers[l].hits(enemies[j])) {
          lasers[l].remove();
          score += enemies[j].pointValue;
          enemies.splice(j, 1); // remove the enemy from the array
          console.log('enemy hit');
          playShipDestroyedSound();
          break;
        }
      }
    } else {
      if (lasers[l].hits(ship)) {
        lasers[l].remove();
        console.log('ship hit');
        // screen = 2;
        ship.hit();

        playShipDestroyedSound();
        // lives--;
        // break;
      }
    }
  }

  for (let m = lasers.length - 1; m >= 0; m--) {
    if (lasers[m].toDelete) {
      lasers.splice(m, 1); // remove laser from the array
    }
  }

  if (enemies.length === 0) {
    screen = 2;
  }

  time += deltaTime / 1000;
}

function endScreen() {
  background('black');
  fill('white');
  textAlign(CENTER, CENTER);
  textSize(32);  // Set a larger text size for visibility if needed
  text("Gameover!", width / 2, height / 2 - 60);  // Centered horizontally, adjust vertically as needed
  textSize(16);  // Smaller text size for details
  text("Time Survived: " + ceil(time), width / 2, height / 2);  // Centered text for time survived
  text("Score: " + score, width / 2, height / 2 + 60);  // Centered text for score
  startBackgroundMusic();
}

function startGame() {
  screen = 1;
  score = 0;
  time = 0;
  count = 5;
  enemies = [];
  lasers = [];

  textAlign(LEFT, BASELINE);

  let startX = 80;
  let startY = 90;

  // second row aliens
  for (let i = 0; i < 6; i++) {
    enemies[i] = new Enemy(i * startX + 80, startY, alien1a, alien1b, 200);
  }

  startY = 50;
  let offset = 0;

  // first row aliens
  for (let j = 6; j < 12; j++) {
    enemies[j] = new Enemy(offset * startX + 80, startY, alien2a, alien2b, 100);
    offset++;
  }

  startY = 130;
  offset = 0;

  // third row aliens
  for (let k = 12; k < 18; k++) {
    enemies[k] = new Enemy(offset * startX + 80, startY, alien2a, alien2b, 100);
    offset++;
  }  

  // check alien
  console.log(enemies);
}

function restartGame() {
  screen = 0;
  score = 0;
  time = 0;
  lives = 3;
}

function startBackgroundMusic() {
  Tone.Transport.start();
}

function stopBackgroundMusic() {
  Tone.Transport.stop();
}

function playShipDestroyedSound() {
  shipDestroyedSynth.triggerAttackRelease("C3", "2n");
}

function mousePressed() {
  if (screen == 0) {
    startGame();
  } else if (screen == 2) {
    restartGame();
  }
}

function keyPressed() {
  if (key === ' ') {
    let laser = new Laser(ship.x - 2, ship.y - 20);
    lasers.push(laser);
    synth.triggerAttackRelease('G4', '16n');
  }

  if (keyCode === RIGHT_ARROW) {
    ship.setDirection(1);
  } else if (keyCode === LEFT_ARROW) {
    ship.setDirection(-1);
  }
}

function keyReleased() {
  if (keyCode === RIGHT_ARROW || keyCode === LEFT_ARROW) {
    ship.setDirection(0);
    synth.triggerRelease();
  }
}

