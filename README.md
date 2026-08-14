# dj-cyberdeck
Portable DJ set up using Mixxx, an open source DJ software. Take this set up and leave your laptop at home!

## Table of Contents
1a. Components List
1b. Component Diagram
2. Software List
3. Raspberry Pi OS Setup
4. Mixxx Setup

## 1a. Component List:
- Raspberry Pi 5 (16GB)
- 32GB SD Card
- 500GB - 1TB SSD
- 145W Power Bank (5V/5A if possible)
- Buck Converter (needed if 5V/5A power bank not feasible)
- Portable Monitor
- Touchpad or mouse
- Keyboard
- DJ Controller (with sound card inside)
- Speaker

## 1b. Component Diagram:


## 2. Software List:
- [Raspberry Pi Imager](https://www.raspberrypi.com/software/)
- [Mixxx Version 2.6 (with Stems)](https://github.com/mixxxdj/mixxx/tree/2.6)


## 3. Raspberry Pi OS Setup
1. The SD card will hold the operating system (OS). To get the OS onto the Raspberry Pi, use the Raspberry Pi Imager to put the OS image onto the SD card.
  a. In the Raspberry Pi Imager, select Raspberry Pi 5 and choose the Raspberry Pi OS (64-bit) operating system for the SD card.
  b. Set up storage and customization with a username, password, and wifi. Then, enable SSH and remember all of these credentials as they will be used to set up the server

2. `ssh` into the Raspberry Pi or complete these steps locally. Enable wifi
   To SSH:
   a. Ping the **hostname** using the **username** set in the imager settings: `ping hostname.local`
   b. Copy IP address that appears in each `ping` and `ssh` into the Raspberry Pi: `ssh username@ip_address`
   
3. Enable wifi:
   Run sudo `raspi-config`, then choose the first option to enter the wifi information
   `sudo reboot` the Raspberry Pi.

4. Enable bluetooth (optional)
   Only enable if you need bluetooth


## 4. Mixxx Setup
1. Install Mixxx
  Either `git clone` the Mixxx repo from the Raspberry Pi, or download the Mixxx repo locally to the SSD and then move it onto the Raspberry Pi manually.

2. Connect your DJ Controller
   Go to Mixxx's preferences/options. Find your DJ Controller's mapping online if it is not present inside Mixxx. If you have to find it manually, move your mapping files (which should be a `.midi.xml` file and a `.scripts.js` file) to the Raspberry Pi to the `~./Mixxx/controllers` directory. This is where your DJ controller mappings will be picked up.

