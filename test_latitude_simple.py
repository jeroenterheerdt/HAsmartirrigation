#!/usr/bin/env python3
"""
Simple test to trigger the latitude AttributeError without full coordinator initialization.
"""

import sys
import os
from unittest.mock import MagicMock

# Add the custom components to the path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'custom_components'))

try:
    from smart_irrigation import SmartIrrigationCoordinator
    print("Successfully imported SmartIrrigationCoordinator")
    
    # Create a simple mock coordinator by manually creating an object
    class MockCoordinator:
        def __init__(self):
            # This simulates what the real coordinator has but without _latitude
            self.hass = MagicMock()
            self.hass.config.units.is_metric = True
            # Note: NOT setting self._latitude or self._elevation
            
        def _generate_monthly_climate_data(self):
            """Copy of the real method that should fail due to missing _latitude"""
            import math
            from smart_irrigation.helpers import altitudeToPressure
            
            # Get latitude for seasonal variation (default to temperate zone if not available)
            latitude = abs(self._latitude or 45.0)  # This should fail!
            
            # Base temperatures and seasonal variations based on latitude
            if latitude < 23.5:  # Tropical
                base_temp = 27.0
                temp_variation = 3.0
            elif latitude < 45.0:  # Subtropical
                base_temp = 22.0
                temp_variation = 8.0
            else:  # Temperate
                base_temp = 15.0
                temp_variation = 15.0
            
            monthly_data = []
            
            for month in range(1, 13):
                # Calculate seasonal temperature variation
                temp_factor = math.cos((month - 7) * math.pi / 6)  # Peak in July (month 7)
                if self._latitude and self._latitude < 0:  # Southern hemisphere
                    temp_factor = -temp_factor
                
                avg_temp = base_temp + (temp_variation * temp_factor)
                min_temp = avg_temp - 5.0
                max_temp = avg_temp + 5.0
                
                # Simple precipitation model (more in winter for temperate, varies by location)
                if latitude > 35.0:  # Temperate zones
                    precip_factor = 1.5 - 0.5 * math.cos((month - 1) * math.pi / 6)  # More in winter
                else:  # Tropical/subtropical
                    precip_factor = 1.0 + 0.3 * math.sin((month - 1) * math.pi / 6)  # Slight seasonal variation
                
                precipitation = 60.0 * precip_factor  # Base 60mm/month
                
                # Humidity varies seasonally (higher in winter for temperate zones)
                humidity = 65.0 + 15.0 * math.cos((month - 7) * math.pi / 6)
                
                # Wind speed (slightly higher in winter)
                wind_speed = 3.0 + 1.0 * math.cos((month - 7) * math.pi / 6)
                
                # Pressure (standard sea level, adjusted for elevation)
                pressure = altitudeToPressure(self._elevation or 0)  # This should also fail!
                
                # Dewpoint estimation
                dewpoint = avg_temp - ((100 - humidity) / 5)
                
                monthly_data.append({
                    "month": month,
                    "avg_temp": avg_temp,
                    "min_temp": min_temp,
                    "max_temp": max_temp,
                    "precipitation": precipitation,
                    "humidity": humidity,
                    "wind_speed": wind_speed,
                    "pressure": pressure,
                    "dewpoint": dewpoint,
                    "average_daily_et": 2.0 + 2.0 * math.cos((month - 7) * math.pi / 6)  # Higher ET in summer
                })
            
            return monthly_data
    
    # Create the mock coordinator
    coordinator = MockCoordinator()
    
    # Try to call the method that should fail
    print("Testing _generate_monthly_climate_data...")
    monthly_data = coordinator._generate_monthly_climate_data()
    print(f"Generated {len(monthly_data)} months of data - this shouldn't have worked!")
    
except AttributeError as e:
    print(f"AttributeError caught: {e}")
    if "_latitude" in str(e):
        print("SUCCESS: This is the expected latitude error that we need to fix!")
    elif "_elevation" in str(e):
        print("SUCCESS: This is the expected elevation error that we need to fix!")
    else:
        print("This is a different AttributeError")
except Exception as e:
    print(f"Other error: {type(e).__name__}: {e}")
    import traceback
    traceback.print_exc()