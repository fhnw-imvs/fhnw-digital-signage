#!/usr/bin/env bash

# Copyright (c) 2019 - 2020, FHNW, Switzerland. All rights reserved.
# Licensed under MIT License, see LICENSE for details.

# Read variable from file
read_var() {
    VAR=$(grep $1 $2 | xargs)
    IFS="=" read -ra VAR <<< "$VAR"
    echo ${VAR[1]}
}

if [ "$EUID" -ne 0 ]
  then echo "Please run as root with sudo -H ./install.sh"
  exit
fi

# ANSI text colors
OFF="\033[0m"
DIM="\033[2m"
RED="\033[1;31m"
GREEN="\033[1;32m"

printf "\n$GREEN disabling auto screensaver...$OFF \n"
printf "installing xset to disable screensaver..."
apt-get remove -y xscreensaver #can overwrite screensaver setting
apt-get install -y x11-xserver-utils

#For Raspberry Pi 4
NOBLANK="
@xset s noblank
@xset s off
@xset s noexpose
@xset -dpms
"

STARTLXDE="exec /etc/alternatives/x-session-manager      # start lxde"
touch ~/.xinitrc
printf "$NOBLANK" > ~/.xinitrc
printf "$STARTLXDE" >> ~/.xinitrc

cat /etc/xdg/lxsession/LXDE/autostart > /etc/xdg/lxsession/LXDE/autostart.`date +%m-%d-%Y_%I:%M:%S`
printf "\n\t Created backup copy of the autostart file...\n"
printf "$NOBLANK" >> /etc/xdg/lxsession/LXDE/autostart
printf "$NOBLANK" >> /home/pi/.config/lxsession/LXDE-pi/autostart
printf "$NOBLANK" >> /etc/xdg/lxsession/LXDE-pi/autostart #newer raspien
printf "\n$RED Screensaver is now disabled.\nThe changes apply after restarting the device $OFF\n"

#install updates
printf "\n$GREEN installing updates...\n"
apt-get -y update

#install packages
printf "\n$GREEN installing dependencies... $OFF\n"
apt-get install -y curl
apt-get install -y python3-pip
apt-get install -y unclutter

#install python packages
printf "\n$GREEN installing python packages... $OFF\n"
pip3 install -r requirements.txt

# Remove existing downloads and binaries so we can start from scratch.
printf "\n$GREEN removing existing files and stoping service $OFF\n"
rm /usr/bin/chromedriver
rm -rf /usr/local/mgmt_app_client_extension/
systemctl stop mgmtapp-daemon
rm -rf /etc/systemd/system/mgmtapp-daemon.service
rm -rf /lib/systemd/system/yalertunnel-vnc.service
sudo systemctl stop yalertunnel-vnc.service

# Install ChromiumDriver.
printf "\n$GREEN installing chromium driver... $OFF\n"
wget -N http://launchpadlibrarian.net/361669488/chromium-chromedriver_65.0.3325.181-0ubuntu0.14.04.1_armhf.deb -P ~/
dpkg -i ~/chromium-chromedriver_65.0.3325.181-0ubuntu0.14.04.1_armhf.deb
rm -rf ~/chromium-chromedriver_65.0.3325.181-0ubuntu0.14.04.1_armhf.deb
mv /usr/lib/chromium-browser/chromedriver /usr/bin/chromedriver
chown root:root /usr/bin/chromedriver
chmod 755 /usr/bin/chromedriver

# Removing Mouse Pointer
printf "\n$GREEN removing mouse pinter when not moving... $OFF\n"
if not grep -q "@unclutter -idle 0" ~/.config/lxsession/LXDE-pi/autostart; then
  POINTER="@unclutter -idle 0"
  printf "$POINTER" >> ~/.config/lxsession/LXDE-pi/autostart
fi

#installing mgmt_app_client_extension as service
printf "\n$GREEN setting client app service... $OFF\n"
mkdir /usr/local/mgmt_app_client_extension
cp -v mgmtapp-daemon.py .env /usr/local/mgmt_app_client_extension/
cp -vr fallback /usr/local/mgmt_app_client_extension/
chmod -R 777 /usr/local/mgmt_app_client_extension/
cp -v mgmtapp-daemon.service /etc/systemd/system/

printf "\n$GREEN starting service... $OFF\n"
#starting mgmt_app_client_extension service
systemctl daemon-reload
systemctl restart mgmtapp-daemon
systemctl enable mgmtapp-daemon
printf "\n$GREEN service started $OFF\n"

#Enabling VNC access
cp -v yalertunnel-vnc.service /lib/systemd/system/yalertunnel-vnc.service
sudo systemctl daemon-reload
sudo systemctl enable yalertunnel-vnc.service
sudo systemctl start yalertunnel-vnc.service

printf "\n$RED device will reboot in one minute to finish installation... $OFF\n"
sudo shutdown -r 1

