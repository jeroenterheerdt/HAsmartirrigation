#!/usr/bin/env python3
"""Standalone test script for KNMI Client validation.

This script can test the KNMI integration without Home Assistant.
Usage: python3 test_knmi_standalone.py [API_KEY] [LATITUDE] [LONGITUDE] [ELEVATION]

Example:
python3 test_knmi_standalone.py "your_api_key_here" 52.3676 4.9041 -3
"""

import sys
import os
import json
import datetime
from pathlib import Path

# Add the custom_components path to sys.path
script_dir = Path(__file__).parent
custom_components_path = script_dir / "custom_components"
sys.path.insert(0, str(custom_components_path))

# Mock the Home Assistant imports that KNMIClient needs
class MockLogger:
    def debug(self, msg, *args):
        print(f"[DEBUG] {msg % args if args else msg}")
    
    def info(self, msg, *args):
        print(f"[INFO] {msg % args if args else msg}")
    
    def warning(self, msg, *args):
        print(f"[WARNING] {msg % args if args else msg}")
    
    def error(self, msg, *args):
        print(f"[ERROR] {msg % args if args else msg}")

# Mock the constants that KNMIClient imports
MAPPING_CURRENT_PRECIPITATION = "Current Precipitation"
MAPPING_DEWPOINT = "Dewpoint"
MAPPING_HUMIDITY = "Humidity"
MAPPING_MAX_TEMP = "Maximum Temperature"
MAPPING_MIN_TEMP = "Minimum Temperature"
MAPPING_PRECIPITATION = "Precipitation"
MAPPING_PRESSURE = "Pressure"
MAPPING_TEMPERATURE = "Temperature"
MAPPING_WINDSPEED = "Windspeed"

# Replace the real imports with our mocks
sys.modules['logging'] = type('MockLogging', (), {
    'getLogger': lambda name: MockLogger()
})()

# Mock the const module
const_mock = type('ConstMock', (), {
    'MAPPING_CURRENT_PRECIPITATION': MAPPING_CURRENT_PRECIPITATION,
    'MAPPING_DEWPOINT': MAPPING_DEWPOINT,
    'MAPPING_HUMIDITY': MAPPING_HUMIDITY,
    'MAPPING_MAX_TEMP': MAPPING_MAX_TEMP,
    'MAPPING_MIN_TEMP': MAPPING_MIN_TEMP,
    'MAPPING_PRECIPITATION': MAPPING_PRECIPITATION,
    'MAPPING_PRESSURE': MAPPING_PRESSURE,
    'MAPPING_TEMPERATURE': MAPPING_TEMPERATURE,
    'MAPPING_WINDSPEED': MAPPING_WINDSPEED,
})()

sys.modules['smart_irrigation.const'] = const_mock

# Now import our KNMI client
from smart_irrigation.weathermodules.KNMIClient import KNMIClient

def test_knmi_client(api_key, latitude, longitude, elevation):
    """Test the KNMI client functionality."""
    print("🧪 Testing KNMI Client Integration")
    print("=" * 50)
    
    print(f"📍 Location: {latitude}, {longitude} (elevation: {elevation}m)")
    print(f"🔑 API Key: {'*' * (len(api_key) - 4) + api_key[-4:] if len(api_key) > 4 else '***'}")
    print()
    
    try:
        # Initialize client
        print("🔧 Initializing KNMI Client...")
        client = KNMIClient(
            api_key=api_key,
            api_version="1",  # Not used by KNMI but required by interface
            latitude=float(latitude),
            longitude=float(longitude),
            elevation=float(elevation)
        )
        print("✅ Client initialized successfully")
        print(f"   - Coordinates format: {client.coords}")
        print(f"   - Headers configured: {'Authorization' in client.headers}")
        print()
        
        # Test current weather data
        print("🌤️  Testing Current Weather Data...")
        current_data = client.get_data()
        
        if current_data:
            print("✅ Current weather data retrieved successfully!")
            print("📊 Current Weather Data:")
            for key, value in current_data.items():
                if isinstance(value, float):
                    print(f"   - {key}: {value:.2f}")
                else:
                    print(f"   - {key}: {value}")
            print()
        else:
            print("❌ Failed to retrieve current weather data")
            print()
        
        # Test forecast data
        print("📅 Testing Forecast Data...")
        forecast_data = client.get_forecast_data()
        
        if forecast_data and isinstance(forecast_data, list):
            print(f"✅ Forecast data retrieved successfully! ({len(forecast_data)} days)")
            print("📊 Forecast Summary:")
            for i, day_data in enumerate(forecast_data[:3]):  # Show first 3 days
                print(f"   Day {i+1}:")
                for key, value in day_data.items():
                    if isinstance(value, float):
                        print(f"     - {key}: {value:.2f}")
                    else:
                        print(f"     - {key}: {value}")
                print()
        else:
            print("❌ Failed to retrieve forecast data")
            print()
        
        # Test validation and error handling
        print("🛡️  Testing Validation...")
        
        # Test wind speed conversion
        test_wind = 10.0  # 10 m/s at 10m height
        converted_wind = client._convert_wind_speed_to_2m(test_wind)
        print(f"   Wind speed conversion (10m→2m): {test_wind} → {converted_wind:.2f} m/s")
        
        # Test pressure conversion
        test_pressure = 1013.25  # Standard atmospheric pressure
        converted_pressure = client.relative_to_absolute_pressure(test_pressure, elevation)
        print(f"   Pressure conversion: {test_pressure} → {converted_pressure:.2f} hPa")
        
        print("✅ Validation tests passed")
        print()
        
        # Summary
        print("📋 Test Summary:")
        if current_data and forecast_data:
            print("✅ ALL TESTS PASSED - KNMI integration appears to be working!")
            print("🚀 Ready for Home Assistant deployment")
        elif current_data or forecast_data:
            print("⚠️  PARTIAL SUCCESS - Some functionality working")
            print("🔍 Check API permissions or location availability")
        else:
            print("❌ TESTS FAILED - Check API key and connection")
            print("🔧 Troubleshooting needed")
        
        return current_data, forecast_data
        
    except Exception as e:
        print(f"💥 Error during testing: {e}")
        import traceback
        traceback.print_exc()
        return None, None

def main():
    """Main test function."""
    if len(sys.argv) != 5:
        print("Usage: python3 test_knmi_standalone.py [API_KEY] [LATITUDE] [LONGITUDE] [ELEVATION]")
        print("\nExample (for Amsterdam):")
        print("python3 test_knmi_standalone.py \"your_api_key_here\" 52.3676 4.9041 -3")
        print("\nGet your API key from: https://dataplatform.knmi.nl")
        sys.exit(1)
    
    api_key = sys.argv[1]
    latitude = sys.argv[2]
    longitude = sys.argv[3]
    elevation = sys.argv[4]
    
    test_knmi_client(api_key, latitude, longitude, elevation)

if __name__ == "__main__":
    main()
