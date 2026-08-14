# dj-cyberdeck
Portable DJ set up for DJs, artists, and tech people. This setup uses open source DJ software called Mixxx on a Raspberry Pi. Leave your main laptop at home and take this to any of your gigs!


## Table of Contents
1. Software List
2. Components List
3. Component Diagram
4. Raspberry Pi OS Setup
5. Mixxx Setup


## 1. Software List:
- [Raspberry Pi Imager](https://www.raspberrypi.com/software/)
- [Mixxx Version 2.6 (with Stems)](https://github.com/mixxxdj/mixxx/tree/2.6)


## 2. Component List:
List of the technical components used in this build and why they were chose. Please note that alternatives are untested but very much worth exploring.

| Tested Component | Reason | Possible Alternatives |
| --- | --- | --- |
| **Raspberry Pi 5 - 16GB** | It is the latest model, but Raspberry Pi 4B successfully booted up Mixxx | Raspberry Pi 5, 8GB; Raspberry Pi 4B, 32GB; Raspberry Pi 4B, 16GB |
| **SD Card - 32GB** | Cheap and sufficient SD card | Any larger SD card |
| **SSD - 1TB** | Room to hold all the music for the DJ Sets | 500GB SSD; 1TB HHD; 500GB HHD |
| **Power Bank - 145W, 25000mAh** | Has 20V/5A profile needed to negotiate down to 5V/5A for the Raspberry Pi; is flight legal | Power Bank, 145W minimum (for 20V/5A), 25000mAh maximum (flight legal) |
| **Buck Converter** | Negotiates power bank's 20V/5A profile down to 5V/5A | Not needed if power bank has a 5V/5A profile |
| **Portable Monitor - 13in** | Laptop size but isn't too big or heavy | Any size monitor; 10in; 15in |
| **TouchPad - Wired** | Wired for no lag; Physical buttons for haptic feedback in a loud room | Computer mouse; Wireless Touchpad |
| **Keyboard - Bluetooth, Foldable** | Bluetooth to free an extra USB-A port on the Raspberry Pi; Wireless lag on typing isn't crucial when DJing, Foldable for storage | Wired Keyboard |
| **DJ Controller - includes Sound Card** | Sound card required for Raspberry Pi setup | Any DJ controller with a sound card |
| **Portable Outdoor Speaker** | Outdoor speakers are louder and have aux or RCA inputs to connect the DJ controller for sound | Large speakers with RCA input |

## 3. Component Diagram:
How all the technical components are connected inside the cyberdeck:
<img src="./DJ-cyberdeck-diagram2.png" width="600" />


## 4. Raspberry Pi OS Setup
This is how you get the Operating system that runs Mixxx (Raspberry Pi OS) onto the Raspberry Pi:
1. Flash the operating system onto the SD card with the Raspberry Pi Imager from the Software List.
  - Open the Raspberry Pi Imager and select Raspberry Pi 5 and choose the Raspberry Pi OS (64-bit) operating system for the SD card.
  - Set up storage and customization with a username, password, and wifi. Then, enable SSH and remember all of these credentials as they will be used to set up the server

2. `ssh` into the Raspberry Pi (or just open the Raspberry Pi as its own system): 
   To SSH:
  - Ping the **hostname** using the **username** set in the imager settings: `ping hostname.local`
  - Copy IP address that appears in each `ping` and `ssh` into the Raspberry Pi: `ssh username@ip_address`
   
3. Enable Raspberry Pi Wi-fi:
  - Run sudo `raspi-config`, then choose the first option to enter the wifi information
  - `sudo reboot` the Raspberry Pi.

4. Enable Raspberry Pi Bluetooth (optional):
   Only enable if you need bluetooth peripheral like a keyboard, mouse, etc.
  - 

## 5. Mixxx Setup
1. Install Mixxx
  - From the Raspberry Pi, `git clone` the Mixxx repo. Or, download the Mixxx repo to your computer, move it to the SSD for your set up, and then move Mixxx onto the Raspberry Pi manually.
  - Create a shortcut or have Mixxx start upon start up (Not shown here but coming soon)

2. Connect your DJ Controller
   Connect to your DJ Controller or choose your mapping from Mixxx's preferences/options. Find your DJ Controller's mapping online if it is not present inside Mixxx.
   - If you found your mapping outside of Mixxx's options, move your `.midi.xml` and `.scripts.js` mapping files to the `.mixxx/controllers` directory on the Raspberry Pi. This is where your DJ controller mappings will be picked up.
  
3. To use stems in Mixxx version 2.6, music has to be imported in its .stem.mp4 form. This means you have to convert your music to a .stem.mp4 file by running the `generate_stem.py`
file.
  - On your computer, NOT your raspberry pi, navigate to your working directory to activate your `venv` and install `requirements.txt`:
    ```
    python3 -m venv venv
    source .venv/bin/activate
    pip install -r requirements.txt
    
    # Try python3 -m pip install -r requirements.txt if that doesn't work
    ```
  - navigate to your music folder/directory. To convert these files (.mp3, .WAV, etc), run any one of these:
    ```
    # Convert everything in music_folder/
      generate_stem.py music_folder --device mps

    # Convert a single file
      generate_stem.py "some_song.mp3" --device mps

    # Send output somewhere else
      generate_stem.py music_folder -o /other/music/location/Stems --device mps
    ```
    The default destination for the new .stem.mp4 songs is in the /Stems folder in the directory you ran `generate_stem.py` in unless specified otherwise. ONLY USE --device mps if you are on a Mac/Apple computer
    

  - This conversion will take a LONG time and takes a lot of storage, so consider writing these files directly to the SSD from your laptop to avoid filling your laptop storage.
