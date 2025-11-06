#!/usr/bin/env python3
"""
Setup verification and mock testing script for UV-Vis spectrometer
Run this before you have access to the physical device
"""

import subprocess
import sys
import os
from pathlib import Path

class Color:
    """Terminal colors for better output"""
    GREEN = '\033[92m'
    YELLOW = '\033[93m'
    RED = '\033[91m'
    BLUE = '\033[94m'
    END = '\033[0m'
    BOLD = '\033[1m'

def print_step(step_num, description):
    """Print formatted step header"""
    print(f"\n{Color.BOLD}{Color.BLUE}[Step {step_num}] {description}{Color.END}")

def print_success(message):
    """Print success message"""
    print(f"{Color.GREEN}✓ {message}{Color.END}")

def print_warning(message):
    """Print warning message"""
    print(f"{Color.YELLOW}⚠ {message}{Color.END}")

def print_error(message):
    """Print error message"""
    print(f"{Color.RED}✗ {message}{Color.END}")

def run_command(command, check=True):
    """Run shell command and return result"""
    try:
        result = subprocess.run(
            command, 
            shell=True, 
            capture_output=True, 
            text=True,
            check=check
        )
        return result.returncode == 0, result.stdout, result.stderr
    except subprocess.CalledProcessError as e:
        return False, e.stdout, e.stderr

def check_python_version():
    """Check if Python version is suitable"""
    print_step(1, "Checking Python version")
    version = sys.version_info
    if version.major == 3 and version.minor >= 7:
        print_success(f"Python {version.major}.{version.minor}.{version.micro} detected")
        return True
    else:
        print_error(f"Python 3.7+ required, found {version.major}.{version.minor}")
        return False

def check_libusb():
    """Check if libusb is installed"""
    print_step(2, "Checking libusb installation")
    success, stdout, stderr = run_command("dpkg -l | grep libusb-1.0-0-dev", check=False)
    
    if success and stdout:
        print_success("libusb-1.0-0-dev is installed")
        return True
    else:
        print_warning("libusb-1.0-0-dev not found")
        print("\nTo install, run:")
        print(f"{Color.BOLD}sudo apt update && sudo apt install libusb-1.0-0-dev{Color.END}")
        return False

def check_udev_rules():
    """Check if udev rules are configured"""
    print_step(3, "Checking udev rules")
    udev_file = Path("/etc/udev/rules.d/10-oceanoptics.rules")
    
    if udev_file.exists():
        print_success("Ocean Optics udev rules found")
        return True
    else:
        print_warning("Ocean Optics udev rules not found")
        print("\nTo install, run:")
        print(f"{Color.BOLD}sudo wget https://raw.githubusercontent.com/ap--/python-seabreeze/master/misc/10-oceanoptics.rules -O /etc/udev/rules.d/10-oceanoptics.rules{Color.END}")
        print(f"{Color.BOLD}sudo udevadm control --reload-rules{Color.END}")
        print(f"{Color.BOLD}sudo udevadm trigger{Color.END}")
        return False

def check_user_groups():
    """Check if user is in plugdev group"""
    print_step(4, "Checking user groups")
    success, stdout, stderr = run_command("groups", check=False)
    
    if success and "plugdev" in stdout:
        print_success("User is in 'plugdev' group")
        return True
    else:
        print_warning("User is NOT in 'plugdev' group")
        print("\nTo add yourself to the group, run:")
        print(f"{Color.BOLD}sudo usermod -a -G plugdev $USER{Color.END}")
        print(f"{Color.YELLOW}Then log out and log back in (or reboot){Color.END}")
        return False

def check_seabreeze_installed():
    """Check if seabreeze is installed"""
    print_step(5, "Checking python-seabreeze installation")
    try:
        import seabreeze
        print_success(f"seabreeze is installed (version: {seabreeze.__version__})")
        return True
    except ImportError:
        print_warning("seabreeze is NOT installed")
        print("\nTo install, run:")
        print(f"{Color.BOLD}pip install seabreeze{Color.END}")
        print("or")
        print(f"{Color.BOLD}conda install -c conda-forge seabreeze{Color.END}")
        return False

def test_seabreeze_backend():
    """Test if seabreeze backend can be loaded"""
    print_step(6, "Testing seabreeze backend")
    try:
        import seabreeze
        seabreeze.use('cseabreeze')
        print_success("cseabreeze backend loaded successfully")
        return True
    except Exception as e:
        print_error(f"Failed to load cseabreeze backend: {e}")
        print_warning("Trying pyseabreeze backend...")
        try:
            import seabreeze
            seabreeze.use('pyseabreeze')
            print_success("pyseabreeze backend loaded successfully")
            return True
        except Exception as e2:
            print_error(f"Failed to load pyseabreeze backend: {e2}")
            return False

def create_mock_simulator():
    """Create a mock simulator for testing without hardware"""
    print_step(7, "Creating mock simulator for offline testing")
    
    simulator_code = '''"""
Mock UV-Vis Spectrometer Simulator
Use this for testing workflows without physical hardware
"""

import numpy as np
from dataclasses import dataclass
from datetime import datetime
from typing import Optional, Dict

@dataclass
class MockSpectrumData:
    """Mock data container for spectrum measurements"""
    wavelengths: np.ndarray
    intensities: np.ndarray
    timestamp: datetime
    integration_time_us: int
    metadata: Dict

class MockUVVisController:
    """
    Mock controller that simulates a UV-Vis spectrometer
    Use this for development and testing without hardware
    """
    
    def __init__(self, serial_number: Optional[str] = "MOCK-001"):
        self.serial_number = serial_number
        self.is_connected = False
        self._default_integration_time = 100000
        self.wavelengths = np.linspace(200, 1100, 2048)
    
    def connect(self) -> bool:
        """Simulate connection"""
        print(f"[MOCK] Connected to simulated spectrometer: {self.serial_number}")
        self.is_connected = True
        return True
    
    def disconnect(self):
        """Simulate disconnection"""
        print("[MOCK] Spectrometer disconnected")
        self.is_connected = False
    
    def get_wavelengths(self) -> np.ndarray:
        """Return simulated wavelength array"""
        if not self.is_connected:
            raise RuntimeError("Spectrometer not connected")
        return self.wavelengths
    
    def _generate_mock_spectrum(self, spectrum_type="sample"):
        """Generate realistic mock spectrum data"""
        if spectrum_type == "reference":
            # Simulate lamp spectrum with some noise
            base = 40000 + 10000 * np.exp(-(self.wavelengths - 500)**2 / 50000)
            noise = np.random.normal(0, 500, len(self.wavelengths))
            return base + noise
        else:
            # Simulate sample with absorption peaks
            base = 40000 + 10000 * np.exp(-(self.wavelengths - 500)**2 / 50000)
            # Add absorption peaks
            absorption1 = -15000 * np.exp(-(self.wavelengths - 450)**2 / 500)
            absorption2 = -8000 * np.exp(-(self.wavelengths - 650)**2 / 800)
            noise = np.random.normal(0, 500, len(self.wavelengths))
            return base + absorption1 + absorption2 + noise
    
    def measure_spectrum(self, 
                        integration_time_us: Optional[int] = None,
                        correct_dark_counts: bool = False,
                        correct_nonlinearity: bool = False,
                        metadata: Optional[Dict] = None,
                        spectrum_type: str = "sample") -> MockSpectrumData:
        """Simulate spectrum measurement"""
        if not self.is_connected:
            raise RuntimeError("Spectrometer not connected")
        
        if integration_time_us is None:
            integration_time_us = self._default_integration_time
        
        # Generate mock data
        intensities = self._generate_mock_spectrum(spectrum_type)
        
        # Scale by integration time
        intensities = intensities * (integration_time_us / 100000)
        
        if metadata is None:
            metadata = {}
        
        metadata.update({
            'serial_number': self.serial_number,
            'dark_corrected': correct_dark_counts,
            'nonlinearity_corrected': correct_nonlinearity,
            'mock': True
        })
        
        print(f"[MOCK] Measured spectrum (integration: {integration_time_us}μs, "
              f"max intensity: {np.max(intensities):.0f})")
        
        return MockSpectrumData(
            wavelengths=self.wavelengths.copy(),
            intensities=intensities,
            timestamp=datetime.now(),
            integration_time_us=integration_time_us,
            metadata=metadata
        )
    
    def measure_multiple_spectra(self, 
                                 n_measurements: int = 3,
                                 integration_time_us: Optional[int] = None,
                                 average: bool = True,
                                 spectrum_type: str = "sample") -> MockSpectrumData:
        """Simulate multiple measurements"""
        measurements = []
        
        for i in range(n_measurements):
            data = self.measure_spectrum(
                integration_time_us=integration_time_us,
                spectrum_type=spectrum_type
            )
            measurements.append(data.intensities)
        
        if average:
            avg_intensities = np.mean(measurements, axis=0)
            std_intensities = np.std(measurements, axis=0)
            
            return MockSpectrumData(
                wavelengths=self.wavelengths.copy(),
                intensities=avg_intensities,
                timestamp=datetime.now(),
                integration_time_us=data.integration_time_us,
                metadata={
                    'n_measurements': n_measurements,
                    'std_intensities': std_intensities,
                    'averaged': True,
                    'mock': True
                }
            )
        else:
            stacked_intensities = np.array(measurements)
            return MockSpectrumData(
                wavelengths=self.wavelengths.copy(),
                intensities=stacked_intensities,
                timestamp=datetime.now(),
                integration_time_us=data.integration_time_us,
                metadata={
                    'n_measurements': n_measurements,
                    'averaged': False,
                    'mock': True
                }
            )
    
    def optimize_integration_time(self, 
                                 target_counts: float = 50000,
                                 max_iterations: int = 5) -> int:
        """Simulate integration time optimization"""
        print("[MOCK] Optimizing integration time...")
        # Just return a reasonable value
        optimal = 120000
        print(f"[MOCK] Optimized integration time: {optimal}μs")
        return optimal


# Example usage
if __name__ == "__main__":
    print("Testing Mock UV-Vis Controller\\n")
    
    # Create mock controller
    controller = MockUVVisController()
    controller.connect()
    
    # Get wavelengths
    wavelengths = controller.get_wavelengths()
    print(f"Wavelength range: {wavelengths[0]:.1f} - {wavelengths[-1]:.1f} nm\\n")
    
    # Measure reference
    print("Measuring reference...")
    reference = controller.measure_multiple_spectra(
        n_measurements=3,
        spectrum_type="reference"
    )
    
    # Measure sample
    print("Measuring sample...")
    sample = controller.measure_multiple_spectra(
        n_measurements=3,
        spectrum_type="sample"
    )
    
    # Calculate absorbance
    ratio = sample.intensities / (reference.intensities + 1e-10)
    absorbance = -np.log10(ratio)
    
    max_abs_idx = np.argmax(absorbance)
    print(f"\\nPeak absorbance: {absorbance[max_abs_idx]:.3f} at "
          f"{wavelengths[max_abs_idx]:.1f} nm")
    
    controller.disconnect()
    print("\\n✓ Mock test completed successfully!")
'''
    
    try:
        with open("mock_uvvis_controller.py", "w") as f:
            f.write(simulator_code)
        print_success("Created mock_uvvis_controller.py")
        print(f"  Run with: {Color.BOLD}python mock_uvvis_controller.py{Color.END}")
        return True
    except Exception as e:
        print_error(f"Failed to create mock simulator: {e}")
        return False

def create_installation_script():
    """Create a bash script for easy installation"""
    print_step(8, "Creating installation script")
    
    install_script = '''#!/bin/bash
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
'''
    
    try:
        with open("install_uvvis_setup.sh", "w") as f:
            f.write(install_script)
        os.chmod("install_uvvis_setup.sh", 0o755)
        print_success("Created install_uvvis_setup.sh")
        print(f"  Run with: {Color.BOLD}bash install_uvvis_setup.sh{Color.END}")
        return True
    except Exception as e:
        print_error(f"Failed to create installation script: {e}")
        return False

def main():
    """Run all setup checks"""
    print(f"\n{Color.BOLD}{'='*60}{Color.END}")
    print(f"{Color.BOLD}UV-Vis Spectrometer Setup Verification for Pop!_OS{Color.END}")
    print(f"{Color.BOLD}{'='*60}{Color.END}")
    
    results = {
        "Python Version": check_python_version(),
        "libusb": check_libusb(),
        "udev rules": check_udev_rules(),
        "User groups": check_user_groups(),
        "seabreeze": check_seabreeze_installed(),
    }
    
    # Only test backend if seabreeze is installed
    if results["seabreeze"]:
        results["Backend"] = test_seabreeze_backend()
    
    # Create helper files
    results["Mock simulator"] = create_mock_simulator()
    results["Install script"] = create_installation_script()
    
    # Summary
    print(f"\n{Color.BOLD}{'='*60}{Color.END}")
    print(f"{Color.BOLD}Summary{Color.END}")
    print(f"{Color.BOLD}{'='*60}{Color.END}")
    
    all_passed = True
    for check, passed in results.items():
        status = f"{Color.GREEN}✓ PASS{Color.END}" if passed else f"{Color.RED}✗ FAIL{Color.END}"
        print(f"{check:.<40} {status}")
        if not passed:
            all_passed = False
    
    print(f"{Color.BOLD}{'='*60}{Color.END}\n")
    
    if all_passed:
        print(f"{Color.GREEN}{Color.BOLD}✓ All checks passed! You're ready to use the spectrometer.{Color.END}")
    else:
        print(f"{Color.YELLOW}{Color.BOLD}⚠ Some checks failed. Follow the instructions above to complete setup.{Color.END}")
        print(f"\n{Color.BOLD}Quick setup: Run the following command:{Color.END}")
        print(f"{Color.BOLD}bash install_uvvis_setup.sh{Color.END}")
        print(f"\n{Color.YELLOW}After installation, log out and log back in, then run this script again.{Color.END}")
    
    print(f"\n{Color.BOLD}Next steps:{Color.END}")
    print(f"1. If setup incomplete: run {Color.BOLD}bash install_uvvis_setup.sh{Color.END}")
    print(f"2. Test without hardware: run {Color.BOLD}python mock_uvvis_controller.py{Color.END}")
    print(f"3. When you get to the lab: plug in spectrometer and test the real controller")

if __name__ == "__main__":
    main()