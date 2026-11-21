# EnviroSense – IoT Environmental Monitoring System

EnviroSense is an IoT-based environmental monitoring prototype designed to collect, transmit, store, and visualize environmental sensor data through a web-based dashboard.

The system uses an ESP32 microcontroller simulated in Wokwi and integrates a Flask REST API, SQLite database, and responsive web dashboard.

## Project Overview

EnviroSense monitors environmental conditions using multiple sensors. Sensor readings are transmitted over Wi-Fi using HTTP POST requests to a Python Flask backend, where the data is stored in an SQLite database and displayed on a web dashboard.

**Project Type:** IoT Environmental Monitoring Prototype  
**Microcontroller:** ESP32 DevKit V1  
**Simulation Platform:** Wokwi

## Features

- Temperature and humidity monitoring.
- Light intensity measurement.
- Simulated soil moisture monitoring.
- Wi-Fi connectivity.
- HTTP-based sensor data transmission.
- REST API integration using Flask.
- Sensor data storage using SQLite.
- Live monitoring dashboard.
- Historical sensor data visualization.
- Configurable temperature and humidity alerts.
- CSV data export.

## Hardware and Components

| Component | Function |
|---|---|
| ESP32 DevKit V1 | Main microcontroller |
| DHT22 | Temperature and humidity measurement |
| LDR | Light intensity measurement |
| Potentiometer | Simulated soil moisture input |
| Red LED | Warning indicator |
| Green LED | Normal condition indicator |

All hardware components are implemented and tested in the Wokwi simulation environment.

## System Architecture

1. Sensors collect environmental readings.
2. ESP32 processes the sensor data.
3. ESP32 connects to Wi-Fi.
4. Sensor readings are transmitted to the backend through HTTP POST.
5. Flask API receives and stores the readings in SQLite.
6. The web dashboard retrieves and displays the sensor data.

## Technology Stack

- **Embedded System:** ESP32, Arduino C++
- **Simulation:** Wokwi
- **Communication:** Wi-Fi, HTTP, JSON
- **Backend:** Python, Flask
- **Database:** SQLite
- **Frontend:** HTML, CSS, JavaScript

## Project Structure

```text
EnviroSense/
├── firmware/
│   └── EnviroSense.ino
├── static/
│   ├── app.js
│   └── style.css
├── templates/
│   └── index.html
├── docs/
├── screenshots/
├── app.py
├── requirements.txt
├── .gitignore
└── README.md
```

## Installation and Setup

### 1. Clone the Repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
cd EnviroSense
```

### 2. Install Dependencies

```bash
python -m venv venv
```

Activate the virtual environment:

**Windows:**
```bash
venv\Scripts\activate
```

Install the required package:

```bash
pip install -r requirements.txt
```

### 3. Run the Backend

```bash
python app.py
```

The Flask backend will run locally. Open the dashboard using the local address configured in the application.

### 4. Configure ESP32 Firmware

Open `firmware/EnviroSense.ino` in Wokwi or Arduino IDE.

Configure the Wi-Fi connection and backend endpoint according to your environment before running the simulation.

## Testing

The prototype has been tested in the Wokwi simulation environment.

The testing process includes:

- Sensor reading collection.
- ESP32 Wi-Fi connection.
- HTTP communication with the Flask backend.
- Successful sensor data storage in SQLite.
- Live dashboard data updates.
- Historical data visualization.
- Alert threshold configuration.
- CSV export functionality.


## Project Screenshots

### Wokwi Circuit
![Wokwi Circuit](docs/Screenshots/wokwi.png)

### ESP32 Serial Monitor
![ESP32 Serial Monitor](docs/Screenshots/serial%20monitor.png)

### EnviroSense Dashboard
![Dashboard Overview](docs/Screenshots/dashboard1.png)

### Dashboard Monitoring
![Dashboard Monitoring](docs/Screenshots/dashboard2.png)


## Project Scope and Limitations

EnviroSense is currently a simulation-based prototype. The ESP32 and sensor components are simulated using Wokwi rather than deployed with physical hardware.

The project demonstrates the integration of embedded programming, IoT communication, backend development, database management, and web-based monitoring.

## Author

**Adinda Okta Rubiyanti**

Informatics Student | IoT Development Enthusiast

Email: stopi89@gmail.com

---

*EnviroSense – Connecting sensor data with real-time environmental monitoring.*