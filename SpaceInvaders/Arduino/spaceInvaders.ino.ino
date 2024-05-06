#define VRX_PIN A0

const int redPin = 11;
const int greenPin = 10;
const int bluePin = 9;

int joyX = 0;

const int numReadings = 10;

int xReadings[numReadings]; 
int readIndex = 0;          
float xTotal = 0;              
float xAverage = 0;            
float xStart;
bool start = false;
unsigned long lastTime = 0;
const int interval = 16;

void setup() {

  Serial.begin(57600);

  pinMode(redPin, OUTPUT);
  pinMode(greenPin, OUTPUT);
  pinMode(bluePin, OUTPUT);

  for(int i = 0; i < numReadings; i++) {
    xReadings[i] = 0;
  }

}

void loop() {

  while (Serial.available() > 0) {

    int red = Serial.parseInt();

    int green = Serial.parseInt();

    int blue = Serial.parseInt();

    if (Serial.read() == '\n') {
      red = constrain(red, 0, 255);
      green = constrain(green, 0, 255);
      blue = constrain(blue, 0, 255);

      analogWrite(redPin, red);
      analogWrite(greenPin, green);
      analogWrite(bluePin, blue);
    }
  }

  int x = analogRead(VRX_PIN);

  xTotal = xTotal - xReadings[readIndex];

  xReadings[readIndex] = x;

  xTotal = xTotal + x;

  readIndex = readIndex + 1;

  xAverage = xTotal / numReadings;

  if (readIndex >= numReadings) {
    readIndex = 0;
    if (!start) {
      xStart = xAverage;
      start = true;
    }
  }

   // Check if there's a message indicating that the ship has been hit
  if (Serial.available() > 0) {
    char hitMessage = Serial.read();
    if (hitMessage == 'H') {
      // Simulate ship being hit by toggling the red LED on and off
      for (int i = 0; i < 3; i++) {
        digitalWrite(redPin, HIGH);
        delay(250);  // Keep the LED on for 250 milliseconds
        digitalWrite(redPin, LOW);
        delay(250);  // Keep the LED off for 250 milliseconds
      }
    }
  }

  if (start) {
    unsigned long now = millis();
    if (now - lastTime > interval) {
      Serial.print((int) (xAverage-xStart));
      Serial.print(",");
      lastTime = now;
    }
  }
}