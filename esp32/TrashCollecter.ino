#include <ESP32Servo.h>
#include "HX711.h"
#include <WiFi.h>
#include <HTTPClient.h>

// WiFi credentials (replace with your own if needed)
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";

// Server endpoint (replace with your actual backend URL)
const char* serverURL = "http://YOUR_SERVER_IP:PORT/api/smart-bins/record";

Servo servo1;

// Load cell pins for dry bin
#define LOADCELL_DRY_DOUT_PIN 25
#define LOADCELL_DRY_SCK_PIN 2

// Load cell pins for wet bin
#define LOADCELL_WET_DOUT_PIN 26
#define LOADCELL_WET_SCK_PIN 14

// Ultrasonic sensor for waste inlet
const int trigPin = 18;
const int echoPin = 19;

// Ultrasonic sensor for dry bin
const int trigDry = 16;
const int echoDry = 17;

// Ultrasonic sensor for wet bin
const int trigWet = 12;
const int echoWet = 4;

// Moisture sensor (analog pin)
const int potPin = 35;

// Servo motor pin
const int servoPin = 13;

// Constants
int maxDryValue = 35;     // Moisture threshold
int Ultra_Distance = 18;  // Detection threshold for waste
int maxLevel = 20;        // Bin full threshold (distance in cm)

HX711 scaleDry;
HX711 scaleWet;

float weightDry = 0;
float weightWet = 0;

void setup() {
  Serial.begin(9600);
  delay(1000);

  // Connect to WiFi
  WiFi.begin(ssid, password);
  Serial.print("Connecting to WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println(" connected");

  // Ultrasonic pins setup
  pinMode(trigPin, OUTPUT);
  pinMode(echoPin, INPUT);
  pinMode(trigDry, OUTPUT);
  pinMode(echoDry, INPUT);
  pinMode(trigWet, OUTPUT);
  pinMode(echoWet, INPUT);

  // Servo motor initialization
  servo1.setPeriodHertz(50);
  servo1.attach(servoPin, 500, 2400);  // Servo pulse range

  // Initialize load cells
  scaleDry.begin(LOADCELL_DRY_DOUT_PIN, LOADCELL_DRY_SCK_PIN);
  scaleDry.set_scale(2230.0);  // Calibrate based on actual hardware
  scaleDry.tare();

  scaleWet.begin(LOADCELL_WET_DOUT_PIN, LOADCELL_WET_SCK_PIN);
  scaleWet.set_scale(2230.0);  // Calibrate based on actual hardware
  scaleWet.tare();

  Serial.println("Smart Bin System Initialized");
  Serial.println("Humidity  Weight(g)");
}

// Reads distance using ultrasonic sensor (timeout 30ms)
long readUltrasonic(int trig, int echo) {
  digitalWrite(trig, LOW);
  delayMicroseconds(2);
  digitalWrite(trig, HIGH);
  delayMicroseconds(10);
  digitalWrite(trig, LOW);
  return pulseIn(echo, HIGH, 30000) * 0.034 / 2;  // Convert time to distance (cm)
}

// Check if waste is present using inlet ultrasonic sensor
bool isWastePresent() {
  int validCount = 0;
  for (int i = 0; i < 10; i++) {
    float d = readUltrasonic(trigPin, echoPin);
    Serial.println(d);
    if (d < Ultra_Distance && d > 1) {
      validCount++;
    }
    delay(100);
  }
  return validCount >= 8;  // At least 8 detections out of 10
}

// Send data to backend server via HTTP POST
void sendData(const String& type, float weight, float currentWeight, const String& binId, bool isFull) {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(serverURL);
    http.addHeader("Content-Type", "application/json");

    String payload = "{";
    payload += "\"type\":\"" + type + "\",";
    payload += "\"weight\":" + String(weight, 1) + ",";
    payload += "\"currentWeight\":" + String(currentWeight, 1) + ",";
    payload += "\"binId\":\"" + binId + "\",";
    payload += "\"isFull\":" + String(isFull ? "true" : "false");
    payload += "}";

    int httpResponseCode = http.POST(payload);

    if (httpResponseCode > 0) {
      String response = http.getString();
      Serial.print("HTTP Response code: ");
      Serial.println(httpResponseCode);
      Serial.println("Response body: " + response);
    } else {
      Serial.print("Error on sending POST: ");
      Serial.println(httpResponseCode);
    }

    http.end();
  } else {
    Serial.println("WiFi Disconnected");
  }
}

void loop() {
  float soil = 0;
  float fsoil = 0;
  float itemWeight = 0;
  bool isFull = false;

  if (isWastePresent()) {
    // 1. Read weights before insertion
    float dryBefore = scaleDry.get_units(5);
    float wetBefore = scaleWet.get_units(5);
    if (dryBefore < 0) dryBefore = 0;
    if (wetBefore < 0) wetBefore = 0;

    // 2. Average 3 readings from moisture sensor
    for (int i = 0; i < 3; i++) {
      soil = analogRead(potPin);
      soil = constrain(soil, 1800, 3700);
      fsoil += map(soil, 1800, 3700, 100, 0);
      delay(75);
    }
    fsoil /= 3;

    // 3. Waste classification & servo actuation
    if (fsoil > maxDryValue) {
      // Wet waste
      servo1.write(30);
      delay(3000);
      servo1.write(80);
      delay(3000);

      float wetAfter = scaleWet.get_units(5);
      if (wetAfter < 0) wetAfter = 0;
      itemWeight = wetAfter - wetBefore;

      float wetLevel = readUltrasonic(trigWet, echoWet);
      Serial.println(wetLevel);
      if (wetLevel < maxLevel && wetLevel > 0) {
        isFull = true;
        Serial.println("Wet bin is FULL!");
      }

      sendData("wet", itemWeight, wetAfter, "bin001", isFull);

      float dryNow = scaleDry.get_units(5);
      if (dryNow < 0) dryNow = 0;

      Serial.printf("  %.1f%%     Dry: %.1fg   Wet: %.1fg\n", fsoil, dryNow, wetAfter);

    } else {
      // Dry waste
      servo1.write(130);
      delay(3000);
      servo1.write(80);
      delay(3000);

      float dryAfter = scaleDry.get_units(5);
      if (dryAfter < 0) dryAfter = 0;
      itemWeight = dryAfter - dryBefore;

      float dryLevel = readUltrasonic(trigDry, echoDry);
      Serial.println(dryLevel);
      if (dryLevel < maxLevel && dryLevel > 0) {
        isFull = true;
        Serial.println("Dry bin is FULL!");
      }

      sendData("dry", itemWeight, dryAfter, "bin002", isFull);

      float wetNow = scaleWet.get_units(5);
      if (wetNow < 0) wetNow = 0;

      Serial.printf("  %.1f%%     Dry: %.1fg   Wet: %.1fg\n", fsoil, dryAfter, wetNow);
    }
  }

  delay(1000);  // Check every second
}
