# Heartbeat Monitor Project

## Description
This project implements a real-time heartbeat monitoring system. It consists of a frontend application for visualization and a backend service for data processing and API provision. The project is designed to be easily deployable and managed.

## Features
- Real-time monitoring of system heartbeats.
- Frontend dashboard for clear visualization.
- Backend API for data handling.
- Process management using PM2 for robust background operation and auto-recovery.

## Installation

### Prerequisites
- Node.js (npm or yarn)
- PM2 (globally installed: `npm install -g pm2`)

### Project Setup
1.  **Clone the repository:**
    ```bash
    git clone https://github.com/sunmerrr/heartbeat-monitor.git
    cd heartbeat-monitor
    ```
2.  **Install Frontend Dependencies:**
    ```bash
    cd frontend
    npm install # or yarn install
    cd ..
    ```
3.  **Install Backend Dependencies:**
    ```bash
    cd backend
    npm install # or yarn install
    cd ..
    ```

## Usage

### Starting with PM2 (Recommended for Production/Continuous Operation)
This project is configured to run using PM2, ensuring both frontend and backend services run continuously in the background and automatically restart after reboots.

1.  **Navigate to the project root:**
    ```bash
    cd /path/to/your/heartbeat-monitor
    ```
2.  **Start processes with PM2:**
    ```bash
    pm2 start ecosystem.config.js
    ```
    This will start both `프/heartbeat-monitor` (frontend) and `백/heartbeat-monitor` (backend).
3.  **Verify PM2 status:**
    ```bash
    pm2 list
    ```
4.  **Enable PM2 to start on system boot (for persistence after reboot):**
    ```bash
    # Run the command suggested by 'pm2 startup' output (requires sudo)
    # Example (may vary based on your system):
    sudo env PATH=$PATH:/opt/homebrew/Cellar/node@22/22.22.0/bin /opt/homebrew/lib/node_modules/pm2/bin/pm2 startup launchd -u your_username --hp /Users/your_username
    ```

### Manual Start (for Development)
#### Frontend
```bash
cd frontend
npm run dev
```
#### Backend
```bash
cd backend
npm start
```

## Contributing
Contributions are welcome! Please follow standard GitHub flow: fork the repository, create a feature branch, commit your changes, and open a pull request.

## License
[Specify your license here, e.g., MIT License]
