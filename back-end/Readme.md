# Smart Trash Bin Backend Server

This is a Node.js/Express.js-based backend server for a smart trash bin system, primarily functioning as the server-side to receive and send data to IoT devices and the frontend. Communication is via HTTP and Socket.IO, with all components sharing a WiFi network.

## Features

- Communicates with smart trash bin IoT devices via HTTP protocol
- Provides RESTful API interfaces for frontend applications
- Real-time monitoring of trash bin status (fill level, battery level, etc.)
- Supports sending control commands to trash bins
- Monitors weight data of dry/wet trash bins
- Pushes status updates to the frontend in real-time via WebSocket

## Installation Steps

1. Clone the repository
```
git clone <repository-url>
cd small-Trash-collector-backend
```

2. Install dependencies
```
npm install
```

3. Configure environment variables
Create a `.env` file with the following content:
```
PORT=3000
# Add any other necessary environment variables
```

4. Start the server
```
npm start
```

Start in development mode (auto-restart with nodemon):
```
npm run dev
```

## API Documentation

### Get All Trash Bin Statuses
```
GET /api/trash-bins
```

### Get Specific Trash Bin Status
```
GET /api/trash-bins/:id
```

### Get Dry/Wet Trash Bin Weight Data
```
GET /api/trash-bins/weight          # Get all weight data
GET /api/trash-bins/weight/dry      # Get dry trash weight data
GET /api/trash-bins/weight/wet      # Get wet trash weight data
```

### Send Command to Specific Trash Bin
```
POST /api/trash-bins/:id/command
```
Request body:
```json
{
  "command": "open" // Options: open, close, reset, etc.
}
```

## WebSocket Events

### Trash Bin Status Update
Event: `binStatusUpdate`
```json
{
  "id": "bin001",
  "fillLevel": 75,
  "batteryLevel": 80,
  "lastUpdate": "2023-08-01T12:00:00Z"
}
```

### Trash Bin Weight Update
Event: `binWeightUpdate`
```json
{
  "type": "dry",      // Trash bin type: 'dry' or 'wet'
  "weight": 7.5,      // Weight (kg)
  "timestamp": "2023-08-01T12:00:00Z"
}
```

## Frontend Integration

### WebSocket Client Example
```javascript
// Using socket.io-client
const socket = io('http://localhost:3080');

// Listen for trash bin status updates
socket.on('binStatusUpdate', (data) => {
  console.log('Trash bin status update:', data);
  // Update UI display
});

// Listen for trash bin weight updates
socket.on('binWeightUpdate', (data) => {
  console.log('Trash bin weight update:', data);
  // Update UI display
});
```

## Why Choose HTTP and Socket.IO

For IoT device communication, HTTP and Socket.IO offer the following advantages:

1. Simplicity: HTTP is widely used and easy to implement
2. Real-time communication: Socket.IO provides real-time, bidirectional communication
3. Cross-platform compatibility: Works well with various devices and platforms
4. Robustness: HTTP is a well-established protocol with extensive support
5. Flexibility: Easily integrates with existing web technologies

## Tech Stack

- Node.js
- Express.js
- Socket.IO
- For other dependencies, please refer to package.json 