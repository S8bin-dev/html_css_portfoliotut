"""
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
    print("Testing Mock UV-Vis Controller\n")
    
    # Create mock controller
    controller = MockUVVisController()
    controller.connect()
    
    # Get wavelengths
    wavelengths = controller.get_wavelengths()
    print(f"Wavelength range: {wavelengths[0]:.1f} - {wavelengths[-1]:.1f} nm\n")
    
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
    print(f"\nPeak absorbance: {absorbance[max_abs_idx]:.3f} at "
          f"{wavelengths[max_abs_idx]:.1f} nm")
    
    controller.disconnect()
    print("\n✓ Mock test completed successfully!")
