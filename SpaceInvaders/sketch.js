let ship;
let gameFont;
let port;
let joyX = 0;
let lives = 3;
let score = 0;
let time = 0;
let screen = 0;
let enemies = [];
let lasers = [];

let crusherAmt = new Tone.BitCrusher(8);
let synth = new Tone.MonoSynth(Tone.Synth);

let crusherAmtAlien = new Tone.BitCrusher(8);
let synthAlien = new Tone.PolySynth(Tone.Synth);

synth.connect(crusherAmt);
crusherAmt.toDestination();

synthAlien.connect(crusherAmtAlien);
crusherAmtAlien.toDestination();

let shipDestroyedSynth = new Tone.Synth({
  oscillator: {
    type: 'sawtooth'
  }
}).toDestination();

let filter = new Tone.Filter({
  type: 'lowpass',
  frequency: 8000
}).toDestination();

let volumeControl = new Tone.Volume(-30).toDestination();   

shipDestroyedSynth.chain(volumeControl, Tone.Destination);
filter.chain(volumeControl, Tone.Destination);

let lfo = new Tone.LFO({
  frequency: 5, 
  min: 100, 
  max: 8000 
}).start();

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
  port = createSerial();

  createCanvas(600, 400);

  let usedPorts = usedSerialPorts();

  if (usedPorts.length > 0) {
    port.open(usedPorts[0], 57600);
  }
  
  textFont(gameFont);
  frameRate(10);
  imageMode(CENTER);

  ship = new Ship();
}

function draw() {
  background(0);

  textAlign(LEFT, BASELINE);

  let characters = port.available();
  let str = port.read(characters);
  let lines = str.split("\n");

  if (lines.length > 0) {
    let lastIndex = lines.length > 1 ? lines.length - 2 : lines.length - 1;
    latest = lines[lastIndex];
  }

  let values = latest.split(",");

  if (values.length >= 2) {

    joyX = parseInt(values[0]);

    if (joyX < -100) {
      ship.setDirection(-1);
    } else if (joyX > 100) {  
      ship.setDirection(1);
    } else {
      ship.setDirection(0);
    }
  }

  if (port.available() > 0) {

    let str = port.readStringUntil('\n');

    if (str !== null) {

      let values = str.split(',');

      if (values.length >= 2) {

        joyX = parseInt(values[0]);

        if (joyX < -100) {
          ship.setDirection(-1);
        } else if (joyX > 100) {  
          ship.setDirection(1);
        } else {
          ship.setDirection(0);
        }
      }
    }
  }

  if (screen === 0) {
    menuScreen();
  } else if (screen === 1) {
    gameScreen();
  } else if (screen === 2) {
    endScreen();
  }
}

function connect() {
  if (!port.opened()) {
    port.open('Arduino', 57600);
  } else {
    port.close();
  }
}

function menuScreen() {
  background('black');

  textAlign(CENTER, CENTER);

  textSize(22);
  fill('lightgreen');
  text("Invaders In Space?", width / 2, height / 3 - 60);

  textSize(12);
  fill('skyblue');
  text("Instructions:", width / 2, height / 3 + 30);

  fill('white');
  text("To start click LMB", width / 2, height / 3 + 60);
  text("To move the ship use the joystick", width / 2, height / 3 + 90);
  text("To shoot use the spacebar", width / 2, height / 3 + 120); 

  textSize(16);
  fill('red');
  text("DESTROY THE ALIENS!", width / 2, height / 3 + 180);

  startBackgroundMusic();
}

function gameScreen() { 
  background('black');

  fill('white');
  textAlign(LEFT, BASELINE);

  fill('yellow');
  text("Time: " + ceil(time), 20, 30);
  text("Score: " + score, 230, 30);
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
          enemies.splice(j, 1);
          console.log('ALIEN HIT!');
          playShipDestroyedSound();
          break;
        }
      }
    } else {
      if (lasers[l].hits(ship)) {
        lasers[l].remove();
        console.log('SHIP HIT!');
        ship.hit();
        port.write('H');
        playShipDestroyedSound();
      }
    }
  }

  for (let m = lasers.length - 1; m >= 0; m--) {
    if (lasers[m].toDelete) {
      lasers.splice(m, 1);
    }
  }

  if (enemies.length === 0) {
    screen = 2;
  }

  time += deltaTime / 1000;
}

function endScreen() {
  background('black');

  fill('red');
  textAlign(CENTER, CENTER);

  textSize(32);
  text("Gameover!", width / 2, height / 2 - 60);

  fill('white');

  textSize(16); 
  text("Time Survived: " + ceil(time), width / 2, height / 2); 
  text("Score: " + score, width / 2, height / 2 + 60);
  text("Click LMB to restart", width / 2, height / 2 + 120); 

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
  for (let i = 0; i < 8; i++) {
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

  // fourth row aliens
  startY = 170;
  offset = 0;
  for (let l = 18; l < 24; l++) {
    enemies[l] = new Enemy(offset * startX + 80, startY, alien1a, alien1b, 200);
    offset++;
  }
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

