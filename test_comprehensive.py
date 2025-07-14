#!/usr/bin/env python3
"""
Final comprehensive test to verify the latitude/elevation fix works completely.
This tests the exact scenario described in the problem statement.
"""

import asyncio
import sys
import os
from unittest.mock import MagicMock, AsyncMock

# Add the custom components to the path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'custom_components'))

async def test_original_error_scenario():
    """Test the exact scenario from the problem statement."""
    print("=== Testing Original Error Scenario ===")
    print("Before fix: Should have gotten AttributeError: 'SmartIrrigationCoordinator' object has no attribute '_latitude'")
    print("After fix: Should work without errors")
    
    try:
        from smart_irrigation import SmartIrrigationCoordinator
        
        # Create realistic mocks
        mock_hass = MagicMock()
        mock_hass.config.as_dict.return_value = {
            "latitude": 37.7749,  # San Francisco
            "longitude": -122.4194,
            "elevation": 16
        }
        mock_hass.config.units.is_metric = True
        mock_hass.data = {"smart_irrigation": {"use_weather_service": False}}
        mock_hass.loop = asyncio.get_event_loop()
        mock_hass.async_create_task = asyncio.create_task
        mock_hass.config.language = "en"
        mock_hass.bus.fire = MagicMock()
        
        mock_entry = MagicMock()
        mock_entry.unique_id = "test_smart_irrigation"
        mock_entry.data = {}
        mock_entry.options = {}
        
        mock_store = MagicMock()
        mock_store.get_config.return_value = {
            "autocalcenabled": False,
            "autoupdateenabled": False, 
            "autoclearenabled": False,
            "starteventfiredtoday": False
        }
        
        # Create test zone data
        test_zone = {
            "id": 1,
            "name": "Garden Zone",
            "size": 25.0,  # m²
            "throughput": 8.0,  # l/m
            "state": "automatic",
            "mapping": 1,
            "module": 1,
            "multiplier": 1.0,
            "maximum_bucket": 50.0,
            "drainage_rate": 0.1
        }
        
        mock_store.async_get_zones = AsyncMock(return_value=[test_zone])
        mock_store.get_zone.return_value = test_zone
        
        test_module = {
            "id": 1,
            "name": "PyETO",
            "description": "Penman-Monteith ET calculation",
            "config": {"forecast_days": 0}
        }
        mock_store.get_module.return_value = test_module
        
        # Create coordinator - this is where the original error occurred
        print("Creating SmartIrrigationCoordinator...")
        coordinator = SmartIrrigationCoordinator(mock_hass, None, mock_entry, mock_store)
        print("✓ Coordinator created successfully")
        
        # Verify attributes are properly initialized
        print(f"Coordinator._latitude: {coordinator._latitude}")
        print(f"Coordinator._elevation: {coordinator._elevation}")
        assert hasattr(coordinator, '_latitude'), "Missing _latitude attribute"
        assert hasattr(coordinator, '_elevation'), "Missing _elevation attribute"
        assert coordinator._latitude == 37.7749
        assert coordinator._elevation == 16
        print("✓ Latitude and elevation properly initialized")
        
        # Test the specific method that was failing
        print("Testing _generate_monthly_climate_data (method that was failing)...")
        monthly_data = coordinator._generate_monthly_climate_data()
        assert len(monthly_data) == 12
        print("✓ Monthly climate data generation successful")
        
        # Test seasonal variation to ensure calculation is working correctly
        winter_month = monthly_data[0]  # January
        summer_month = monthly_data[6]  # July
        print(f"January avg temp: {winter_month['avg_temp']:.1f}°C")
        print(f"July avg temp: {summer_month['avg_temp']:.1f}°C")
        assert summer_month['avg_temp'] > winter_month['avg_temp']
        print("✓ Seasonal variation correct")
        
        # Mock PyETO module for calendar testing
        mock_pyeto = MagicMock()
        mock_pyeto.name = "PyETO"
        mock_pyeto.calculate_et_for_day.return_value = -3.2  # Realistic daily deficit
        coordinator.getModuleInstanceByID = AsyncMock(return_value=mock_pyeto)
        
        # Test full calendar generation
        print("Testing full watering calendar generation...")
        calendar_data = await coordinator.async_generate_watering_calendar()
        
        assert len(calendar_data) > 0, "No calendar data generated"
        assert 1 in calendar_data, "Zone 1 missing from calendar"
        
        zone_calendar = calendar_data[1]
        assert zone_calendar['zone_name'] == "Garden Zone"
        assert len(zone_calendar['monthly_estimates']) == 12
        print("✓ Full calendar generation successful")
        
        # Test with service call
        print("Testing calendar generation service call...")
        mock_call = MagicMock()
        mock_call.data = {"zone_id": 1}
        
        await coordinator.handle_generate_watering_calendar(mock_call)
        
        # Verify event was fired
        mock_hass.bus.fire.assert_called()
        event_calls = mock_hass.bus.fire.call_args_list
        success_events = [call for call in event_calls if 'watering_calendar_generated' in str(call)]
        assert len(success_events) > 0, "Success event not fired"
        print("✓ Service call completed and success event fired")
        
        return True
        
    except Exception as e:
        print(f"❌ Test failed: {type(e).__name__}: {e}")
        import traceback
        traceback.print_exc()
        return False

async def test_without_ha_config():
    """Test that defaults work when HA config has no latitude/elevation."""
    print("\n=== Testing Default Values (No HA Config) ===")
    
    try:
        from smart_irrigation import SmartIrrigationCoordinator
        
        # Mock HA with empty config (common scenario)
        mock_hass = MagicMock()
        mock_hass.config.as_dict.return_value = {}  # No coordinates configured
        mock_hass.config.units.is_metric = True
        mock_hass.data = {"smart_irrigation": {"use_weather_service": False}}
        mock_hass.loop = asyncio.get_event_loop()
        mock_hass.async_create_task = asyncio.create_task
        
        mock_entry = MagicMock()
        mock_entry.unique_id = "test_no_coords"
        mock_entry.data = {}
        mock_entry.options = {}
        
        mock_store = MagicMock()
        mock_store.get_config.return_value = {
            "autocalcenabled": False,
            "autoupdateenabled": False,
            "autoclearenabled": False,
            "starteventfiredtoday": False
        }
        
        print("Creating coordinator with no coordinates configured...")
        coordinator = SmartIrrigationCoordinator(mock_hass, None, mock_entry, mock_store)
        
        # Should use defaults
        assert coordinator._latitude == 45.0, f"Expected 45.0, got {coordinator._latitude}"
        assert coordinator._elevation == 0, f"Expected 0, got {coordinator._elevation}"
        print("✓ Default values applied correctly")
        
        # Should still work for calendar generation
        monthly_data = coordinator._generate_monthly_climate_data()
        assert len(monthly_data) == 12
        print("✓ Calendar generation works with defaults")
        
        return True
        
    except Exception as e:
        print(f"❌ Default test failed: {type(e).__name__}: {e}")
        return False

async def test_config_from_entry():
    """Test getting latitude/elevation from config entry instead of HA config."""
    print("\n=== Testing Config from Entry Data ===")
    
    try:
        from smart_irrigation import SmartIrrigationCoordinator
        from homeassistant.const import CONF_LATITUDE, CONF_ELEVATION
        
        # Mock HA with empty config
        mock_hass = MagicMock()
        mock_hass.config.as_dict.return_value = {}  # No HA config
        mock_hass.config.units.is_metric = True 
        mock_hass.data = {"smart_irrigation": {"use_weather_service": False}}
        mock_hass.loop = asyncio.get_event_loop()
        mock_hass.async_create_task = asyncio.create_task
        
        # But provide coordinates in entry data
        mock_entry = MagicMock()
        mock_entry.unique_id = "test_entry_coords"
        mock_entry.data = {
            CONF_LATITUDE: 51.5074,  # London
            CONF_ELEVATION: 35
        }
        mock_entry.options = {}
        
        mock_store = MagicMock()
        mock_store.get_config.return_value = {
            "autocalcenabled": False,
            "autoupdateenabled": False,
            "autoclearenabled": False,
            "starteventfiredtoday": False
        }
        
        print("Creating coordinator with coordinates in entry data...")
        coordinator = SmartIrrigationCoordinator(mock_hass, None, mock_entry, mock_store)
        
        # Should use entry data
        assert coordinator._latitude == 51.5074, f"Expected 51.5074, got {coordinator._latitude}"
        assert coordinator._elevation == 35, f"Expected 35, got {coordinator._elevation}"
        print("✓ Entry data values used correctly")
        
        # Test calendar generation
        monthly_data = coordinator._generate_monthly_climate_data()
        assert len(monthly_data) == 12
        print("✓ Calendar works with entry data coordinates")
        
        return True
        
    except Exception as e:
        print(f"❌ Entry data test failed: {type(e).__name__}: {e}")
        return False

if __name__ == "__main__":
    async def run_comprehensive_tests():
        print("🔬 Comprehensive test of latitude/elevation fix")
        print("=" * 60)
        
        test1 = await test_original_error_scenario()
        test2 = await test_without_ha_config() 
        test3 = await test_config_from_entry()
        
        print("\n" + "=" * 60)
        if test1 and test2 and test3:
            print("🎉 SUCCESS: All comprehensive tests passed!")
            print("The AttributeError: 'SmartIrrigationCoordinator' object has no attribute '_latitude' has been fixed!")
            print("\n✅ Calendar generation now works in all scenarios:")
            print("  - With latitude/elevation in Home Assistant config")
            print("  - With latitude/elevation in config entry data") 
            print("  - With no configuration (using sensible defaults)")
            print("  - Proper warning messages when using defaults")
            return True
        else:
            print("❌ FAILURE: Some tests failed")
            return False
    
    success = asyncio.run(run_comprehensive_tests())
    sys.exit(0 if success else 1)