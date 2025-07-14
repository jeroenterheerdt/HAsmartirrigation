#!/usr/bin/env python3
"""
Simple test to reproduce the latitude error.
"""

import asyncio
import sys
import os
from unittest.mock import MagicMock, AsyncMock

# Add the custom components to the path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'custom_components'))

try:
    from smart_irrigation import SmartIrrigationCoordinator
    print("Successfully imported SmartIrrigationCoordinator")
    
    # Create a mock hass instance
    mock_hass = MagicMock()
    mock_hass.config.as_dict.return_value = {
        "latitude": 45.0,
        "longitude": -122.0,
        "elevation": 100
    }
    mock_hass.config.units.is_metric = True
    mock_hass.data = {"smart_irrigation": {"use_weather_service": False}}
    
    # Create a mock entry
    mock_entry = MagicMock()
    mock_entry.unique_id = "test_entry"
    
    # Create a mock store
    mock_store = MagicMock()
    mock_store.get_config.return_value = {
        "autocalcenabled": False,
        "autoupdateenabled": False,
        "autoclearenabled": False,
        "starteventfiredtoday": False
    }
    
    # Create coordinator - this should trigger the AttributeError
    print("Creating coordinator...")
    coordinator = SmartIrrigationCoordinator(mock_hass, None, mock_entry, mock_store)
    print("Coordinator created successfully!")
    
    # Try to call the method that would fail
    print("Testing _generate_monthly_climate_data...")
    monthly_data = coordinator._generate_monthly_climate_data()
    print(f"Generated {len(monthly_data)} months of data")
    
except AttributeError as e:
    print(f"AttributeError caught: {e}")
    if "_latitude" in str(e):
        print("This is the expected latitude error!")
    else:
        print("This is a different AttributeError")
except Exception as e:
    print(f"Other error: {type(e).__name__}: {e}")
    import traceback
    traceback.print_exc()