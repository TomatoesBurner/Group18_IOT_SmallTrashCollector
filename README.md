# Smart Trash Collector

An IoT-based smart trash collection system that automatically sorts and monitors waste using ESP32 microcontrollers, with a real-time web dashboard for monitoring and management.

## Project Overview

This project consists of three main components:

1. **IoT Hardware (ESP32)**
   - Automatic waste detection and classification (wet/dry)
   - Weight measurement and bin level monitoring
   - Components: ESP32, ultrasonic sensors, moisture sensor, servo motor, load cells

2. **Backend Server (Node.js/Express)**
   - RESTful API for data management
   - Real-time communication via WebSocket
   - Communication bridge between IoT devices and frontend

3. **Frontend Dashboard (Vue.js)**
   - Real-time monitoring interface
   - Data visualization with charts
   - Responsive design using Vuetify

## Quick Start

### Hardware Setup
1. Navigate to `esp32/` directory
2. Configure WiFi credentials in `TrashCollector.ino`
3. Upload code to ESP32 using Arduino IDE

### Backend Setup
```bash
cd back-end
npm install
# Create .env file with PORT=3008
npm start
```

### Frontend Setup
```bash
cd front-end/iot-smart-trash-new
npm install
npm run serve
```

## System Architecture

```
[ESP32 Hardware] <--HTTP--> [Backend Server] <--WebSocket/HTTP--> [Frontend Dashboard]
     |                           |                                        |
     |                           |                                        |
  Sensors &                  Node.js/Express                       Vue.js/Vuetify
  Actuators                    Socket.IO                            Real-time UI
```


## Technology Stack

- **Hardware**: ESP32, Various Sensors
- **Backend**: Node.js, Express.js, Socket.IO
- **Frontend**: Vue.js 3, Vuetify 3, Chart.js
- **Communication**: HTTP, WebSocket

## Directory Structure

```
├── esp32/              # IoT hardware code
├── back-end/           # Node.js backend server
└── front-end/          # Vue.js frontend application
    └── iot-smart-trash-new/
```

For detailed setup instructions and documentation, please refer to the README files in each component directory. 