# Smart Trash Collector Dashboard

A modern dashboard for monitoring and managing smart trash bins.


## Technology Stack

- **Frontend Framework**: Vue.js 3
- **UI Framework**: Vuetify 3
- **Real-time Communication**: Socket.IO - WebSocket
- **Data Visualization**: Chart.js
- **HTTP Client**: Axios
- **Build Tool**: Vue CLI

## Prerequisites

- npm
- Vue CLI 3
- Vuetify
- Chart.js
- Socket.IO
- Axios


## Project Setup

Clone the repository:
```bash
git clone [repository-url]
cd iot-smart-trash-new
```

Install dependencies:
```bash
npm install
```

## Development

To start the development server with hot-reload:
```bash
npm run serve
```

The application will be available at `http://localhost:8080`


## Production Build

To build the project for production:
```bash
npm run build
```

## Main Project Structure

```
src/
├── assets/
├── components/
│   ├── BarChart.vue
│   ├── GraphsView.vue  
│   └── StatisticsView.vue
├── composables/ 
│   └── useWebSocket.js 
├── App.vue 
└── main.js 
```


Default backend URL (Change to real backend IP Address and Port): `http://192.168.43.190:3008` 

