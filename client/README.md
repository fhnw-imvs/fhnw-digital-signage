# Client
The client daemon runs on the display device, usually a Raspberyr Pi.

## Install Raspbian on a Raspberry Pi 
Please follow the official installation guide to install Raspbian on the Raspberry pi:
https://www.raspberrypi.org/documentation/installation/installing-images/


## Setup WiFi
Fill in your WiFi information in the file wpa_supplicant.conf and copy the file to the root directory of the SD card of the Raspberry Pi. At the next start the Raspberry Pi should connect to the specified network. 
```
sudo nano wpa_supplicant.conf
```

Further instructions for setting up WiFi can be found here:
https://github.com/tamberg/fhnw-iot/wiki/Raspberry-Pi-Zero-W#configure-wi-fi

## Installation

### Clone the repository to the raspberry pi
```
cd ~
git clone https://github.com/fhnw-imvs/fhnw-digital-signage.git
cd fhnw-digital-signage/client
```

### Set environment variables
```
sudo nano .env
```
adjust the environment variables in .env

### Set user for running the service
```
sudo nano mgmtapp-daemon.service
```
Edit the line User=parallels to User=<your.username>

### Install the service

```
sudo -H ./install.sh
```
## Troubleshooting

### Check status of service
```
sudo systemctl status mgmtapp-daemon
```

### Restart mgmtapp daemon service
```
sudo systemctl restart mgmtapp-daemon
```
### Check status of service
```
sudo systemctl status mgmtapp-daemon
```

### Check service logs
```
journalctl -u mgmtapp-daemon.service 
journalctl --unit=mgmtapp-daemon.service -n 100 --no-pager
```
