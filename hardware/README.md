# Hardware

This directory contains the firmware for the ESP32-CAM device that captures receipt images and sends them to the backend.

## Features

- Button-triggered photo capture
- WiFi connectivity for backend communication
- Image upload to Flask backend server
- Status indicators using LEDs

## Setup

The ESP32-CAM firmware is developed using the Arduino IDE or PlatformIO.

### Arduino IDE Setup

1. Install the ESP32 board package in Arduino IDE
2. Install required libraries:
   - `WiFi`
   - `HTTPClient`
   - `ESP32 Camera` (for camera functionality)
3. Upload the firmware to the ESP32-CAM device

### PlatformIO Setup

1. Install PlatformIO IDE
2. Create a new project for ESP32-CAM
3. Add the firmware code to the project
4. Build and upload the firmware

## Configuration

The firmware requires the following configuration:

- WiFi credentials
- Backend server URL
- Pin definitions for camera, button, and LEDs

## Files

- `esp32cam/`: ESP32-CAM firmware files
  - `main.cpp`: Main firmware code
  - `camera_pins.h`: Camera pin definitions
  - `config.h`: Configuration parameters