#!/bin/bash
# UV-Vis Spectrometer Setup Script for Pop!_OS
# Run with: bash install_uvvis_setup.sh

set -e  # Exit on error

echo "=================================="
echo "UV-Vis Spectrometer Setup"
echo "=================================="

# Check if running as root
if [ "$EUID" -eq 0 ]; then 
    echo "Please don't run as root. Run as normal user with sudo access."
    exit 1
fi

# Install libusb
echo ""
echo "[1/5] Installing libusb..."
sudo apt update
sudo apt install -y libusb-1.0-0-dev

# Install udev rules
echo ""
echo "[2/5] Installing udev rules..."
sudo wget https://raw.githubusercontent.com/ap--/python-seabreeze/master/misc/10-oceanoptics.rules -O /etc/udev/rules.d/10-oceanoptics.rules
sudo udevadm control --reload-rules
sudo udevadm trigger

# Add user to plugdev group
echo ""
echo "[3/5] Adding user to plugdev group..."
sudo usermod -a -G plugdev $USER

# Install python-seabreeze
echo ""
echo "[4/5] Installing python-seabreeze..."
pip install seabreeze

# Install additional dependencies
echo ""
echo "[5/5] Installing additional dependencies..."
pip install numpy pandas matplotlib

echo ""
echo "=================================="
echo "Setup Complete!"
echo "=================================="
echo ""
echo "IMPORTANT: You must log out and log back in (or reboot) for group changes to take effect!"
echo ""
echo "After logging back in, run 'python setup_check.py' to verify installation."
