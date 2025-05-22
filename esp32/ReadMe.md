# Smart Trash Collector - IoT Hardware (ESP32-based)

`TrashCollector.ino` contains the IoT hardware component of the **Smart Trash Collector** project. It uses an ESP32 microcontroller along with multiple sensors and a servo motor to detect waste, classify it as wet or dry, measure the weight, monitor bin fill levels, and send the data to a backend server via Wi-Fi.

## Features
- Detects incoming waste using ultrasonic sensor
- Determines moisture level to classify as wet or dry
- Automatically opens bin lids via servo motor
- Measures waste weight using load cells with HX711
- Monitors bin fill level
- Sends waste data to a backend server


## Hardware Components

| Component                | Description                               |
|--------------------------|-------------------------------------------|
| ESP32                    | Main controller, connects all components  |
| Ultrasonic Sensors (x3)  | 1 for waste inlet, 2 for bin fill level   |
| Moisture Sensor          | Detects wet/dry nature of waste           |
| Servo Motor              | Directs waste into correct bin            |
| Load Cells (x2)          | Measure weight of waste in each bin       |
| HX711 Amplifier (x2)     | Amplifies signal from load cells          |


## Pin Configuration

| Function                    | ESP32 Pin |
|-----------------------------|-----------|
| Moisture Sensor (Analog)    | 35        |
| Ultrasonic Inlet Trig       | 18        |
| Ultrasonic Inlet Echo       | 19        |
| Ultrasonic Dry Bin Trig     | 16        |
| Ultrasonic Dry Bin Echo     | 17        |
| Ultrasonic Wet Bin Trig     | 12        |
| Ultrasonic Wet Bin Echo     | 4         |
| Load Cell Dry (DOUT / SCK)  | 25 / 2    |
| Load Cell Wet (DOUT / SCK)  | 26 / 14   |
| Servo Motor                 | 13        |


## Hardware Setup Guide

1. **Connect Moisture Sensor** to analog pin (35).
2. **Connect Ultrasonic Sensors**:
   - Waste inlet: `Trig` to 18, `Echo` to 19
   - Dry bin: `Trig` to 16, `Echo` to 17
   - Wet bin: `Trig` to 12, `Echo` to 4
3. **Connect Load Cells** using HX711 modules:
   - Dry: `DOUT` to 25, `SCK` to 2
   - Wet: `DOUT` to 26, `SCK` to 14
4. **Attach Servo Motor** to pin 13.
5. Power the ESP32 via USB.

## Software Installation

### Prerequisites:
- Arduino IDE or PlatformIO
- Libraries:
  - `ESP32Servo`
  - `HX711`
  - `WiFi`
  - `HTTPClient`

### Steps:
1. Clone this repository or copy the code into Arduino IDE.
2. Replace Wi-Fi credentials in the code:
   ```cpp
   const char* ssid = "YOUR_WIFI_NAME";
   const char* password = "YOUR_WIFI_PASSWORD";
3. Update the `serverURL` with your backend API endpoint.
4. Upload the code to your ESP32.

## Example Payload Sent to Backend
```json
{
  "type": "wet",
  "weight": 8.4,
  "currentWeight": 210.7,
  "binId": "bin001",
  "isFull": false
}
```

## Notes
- Ensure load cells are calibrated using known weights before use.
- Moisture sensor readings may vary by environment; adjust thresholds (`maxDryValue`) accordingly.
- Servo angles may need fine-tuning to match your physical setup.
