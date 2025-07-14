"""Tests for the Smart Irrigation 12-month watering calendar feature."""

import pytest
from unittest.mock import AsyncMock, MagicMock, patch

from custom_components.smart_irrigation import SmartIrrigationCoordinator
from custom_components.smart_irrigation.const import (
    ZONE_ID,
    ZONE_NAME, 
    ZONE_SIZE,
    ZONE_THROUGHPUT,
    ZONE_STATE,
    ZONE_STATE_AUTOMATIC,
    ZONE_STATE_DISABLED,
    ZONE_MAPPING,
    ZONE_MODULE,
    ZONE_MULTIPLIER,
    MODULE_NAME,
    MAPPING_TEMPERATURE,
    MAPPING_MIN_TEMP,
    MAPPING_MAX_TEMP,
    MAPPING_PRECIPITATION,
    MAPPING_HUMIDITY,
    MAPPING_WINDSPEED,
    MAPPING_PRESSURE,
    MAPPING_DEWPOINT
)


@pytest.fixture
def mock_hass():
    """Create a mock Home Assistant instance."""
    hass = MagicMock()
    hass.config.as_dict.return_value = {
        "latitude": 45.0,
        "longitude": -122.0,
        "elevation": 100
    }
    hass.config.units.is_metric = True
    return hass


@pytest.fixture
def mock_store():
    """Create a mock store instance."""
    store = AsyncMock()
    
    # Mock zone data
    test_zone = {
        ZONE_ID: 1,
        ZONE_NAME: "Test Zone",
        ZONE_SIZE: 100.0,  # m²
        ZONE_THROUGHPUT: 10.0,  # l/m
        ZONE_STATE: ZONE_STATE_AUTOMATIC,
        ZONE_MAPPING: 1,
        ZONE_MODULE: 1,
        ZONE_MULTIPLIER: 1.0
    }
    
    disabled_zone = {
        ZONE_ID: 2,
        ZONE_NAME: "Disabled Zone",
        ZONE_SIZE: 50.0,
        ZONE_THROUGHPUT: 5.0,
        ZONE_STATE: ZONE_STATE_DISABLED,
        ZONE_MAPPING: 1,
        ZONE_MODULE: 1,
        ZONE_MULTIPLIER: 1.0
    }
    
    store.async_get_zones.return_value = [test_zone, disabled_zone]
    store.get_zone.return_value = test_zone
    
    # Mock module data
    test_module = {
        "id": 1,
        MODULE_NAME: "PyETO",
        "description": "Test PyETO Module",
        "config": {}
    }
    
    store.get_module.return_value = test_module
    
    return store


@pytest.fixture
def mock_pyeto_module():
    """Create a mock PyETO module instance."""
    module = MagicMock()
    module.name = "PyETO"
    module.calculate_et_for_day.return_value = -2.5  # Negative indicates water deficit
    return module


@pytest.fixture 
def coordinator(mock_hass, mock_store):
    """Create a SmartIrrigationCoordinator instance for testing."""
    entry = MagicMock()
    entry.unique_id = "test_entry"
    entry.data = {}
    entry.options = {}
    
    # Create coordinator with mocked dependencies
    coord = SmartIrrigationCoordinator(mock_hass, None, entry, mock_store)
    coord.store = mock_store
    coord.use_weather_service = False
    # Note: _latitude and _elevation should now be automatically initialized from mock_hass.config
    
    return coord


class TestWateringCalendar:
    """Test class for watering calendar functionality."""

    @pytest.mark.asyncio
    async def test_generate_monthly_climate_data(self, coordinator):
        """Test generation of monthly climate data."""
        monthly_data = coordinator._generate_monthly_climate_data()
        
        # Should have 12 months of data
        assert len(monthly_data) == 12
        
        # Each month should have required fields
        for month_data in monthly_data:
            assert "month" in month_data
            assert "avg_temp" in month_data
            assert "min_temp" in month_data
            assert "max_temp" in month_data
            assert "precipitation" in month_data
            assert "humidity" in month_data
            assert "wind_speed" in month_data
            assert "pressure" in month_data
            assert "dewpoint" in month_data
        
        # Verify seasonal variation (summer should be warmer than winter)
        summer_temp = monthly_data[6]["avg_temp"]  # July (index 6)
        winter_temp = monthly_data[0]["avg_temp"]   # January (index 0)
        assert summer_temp > winter_temp

    @pytest.mark.asyncio
    async def test_calculate_monthly_watering_volume(self, coordinator):
        """Test calculation of monthly watering volume."""
        test_zone = {
            ZONE_SIZE: 100.0,  # 100 m²
            ZONE_MULTIPLIER: 1.0
        }
        
        et_mm = 60.0  # 60mm ET for the month
        month_data = {"precipitation": 20.0}  # 20mm precipitation
        
        volume = coordinator._calculate_monthly_watering_volume(test_zone, et_mm, month_data)
        
        # Net water need = 60 - 20 = 40mm
        # 40mm over 100m² = 4000 liters
        expected_volume = 40.0 * 100.0  # mm * m² = liters
        assert volume == expected_volume

    @pytest.mark.asyncio 
    async def test_calculate_monthly_watering_volume_no_irrigation_needed(self, coordinator):
        """Test that no irrigation is calculated when precipitation exceeds ET."""
        test_zone = {
            ZONE_SIZE: 100.0,
            ZONE_MULTIPLIER: 1.0
        }
        
        et_mm = 30.0  # 30mm ET
        month_data = {"precipitation": 50.0}  # 50mm precipitation (exceeds ET)
        
        volume = coordinator._calculate_monthly_watering_volume(test_zone, et_mm, month_data)
        
        # No irrigation needed when precipitation > ET
        assert volume == 0.0

    @pytest.mark.asyncio
    async def test_get_zone_calculation_method(self, coordinator):
        """Test getting zone calculation method description."""
        test_zone = {ZONE_MODULE: 1}
        
        method = coordinator._get_zone_calculation_method(test_zone)
        assert "PyETO" in method
        assert "FAO-56" in method

    @pytest.mark.asyncio
    async def test_generate_watering_calendar_single_zone(self, coordinator, mock_pyeto_module):
        """Test generating watering calendar for a single zone."""
        with patch.object(coordinator, 'getModuleInstanceByID', return_value=mock_pyeto_module):
            calendar_data = await coordinator.async_generate_watering_calendar(zone_id=1)
        
        # Should return data for the requested zone
        assert 1 in calendar_data
        zone_data = calendar_data[1]
        
        assert zone_data["zone_name"] == "Test Zone"
        assert zone_data["zone_id"] == 1
        assert "monthly_estimates" in zone_data
        assert "generated_at" in zone_data
        assert "calculation_method" in zone_data
        
        # Should have 12 monthly estimates
        monthly_estimates = zone_data["monthly_estimates"]
        assert len(monthly_estimates) == 12
        
        # Each estimate should have required fields
        for estimate in monthly_estimates:
            assert "month" in estimate
            assert "month_name" in estimate
            assert "estimated_et_mm" in estimate
            assert "estimated_watering_volume_liters" in estimate
            assert "average_temperature_c" in estimate
            assert "average_precipitation_mm" in estimate

    @pytest.mark.asyncio
    async def test_generate_watering_calendar_all_zones(self, coordinator, mock_pyeto_module):
        """Test generating watering calendar for all zones."""
        with patch.object(coordinator, 'getModuleInstanceByID', return_value=mock_pyeto_module):
            calendar_data = await coordinator.async_generate_watering_calendar()
        
        # Should return data for the enabled zone (1) but not disabled zone (2)
        assert 1 in calendar_data
        assert 2 not in calendar_data  # Disabled zones are skipped

    @pytest.mark.asyncio
    async def test_generate_watering_calendar_zone_not_found(self, coordinator):
        """Test error handling when zone is not found."""
        with pytest.raises(Exception) as exc_info:
            await coordinator.async_generate_watering_calendar(zone_id=999)
        
        assert "Zone 999 not found" in str(exc_info.value)

    @pytest.mark.asyncio
    async def test_generate_watering_calendar_missing_module(self, coordinator):
        """Test handling of zones with missing calculation modules."""
        # Mock store to return a zone without a module
        coordinator.store.get_zone.return_value = {
            ZONE_ID: 1,
            ZONE_NAME: "Test Zone",
            ZONE_STATE: ZONE_STATE_AUTOMATIC,
            ZONE_MAPPING: None,  # Missing mapping
            ZONE_MODULE: None    # Missing module
        }
        
        calendar_data = await coordinator.async_generate_watering_calendar(zone_id=1)
        
        # Should return error data for the zone
        assert 1 in calendar_data
        zone_data = calendar_data[1]
        assert "error" in zone_data
        assert zone_data["monthly_estimates"] == []

    @pytest.mark.asyncio
    async def test_calculate_monthly_et_pyeto(self, coordinator, mock_pyeto_module):
        """Test monthly ET calculation using PyETO."""
        month_data = {
            "avg_temp": 25.0,
            "min_temp": 15.0,
            "max_temp": 35.0,
            "precipitation": 50.0,
            "humidity": 65.0,
            "wind_speed": 3.0,
            "pressure": 1013.25,
            "dewpoint": 18.0
        }
        
        # Mock PyETO to return a consistent daily ET deficit
        mock_pyeto_module.calculate_et_for_day.return_value = -2.0  # 2mm deficit per day
        
        monthly_et = coordinator._calculate_monthly_et_pyeto(month_data, mock_pyeto_module, 7)  # July
        
        # Should calculate monthly ET based on daily values
        assert monthly_et > 0
        
        # Verify the module was called with correct weather data
        mock_pyeto_module.calculate_et_for_day.assert_called_once()
        call_args = mock_pyeto_module.calculate_et_for_day.call_args[1]
        weather_data = call_args["weather_data"]
        
        assert weather_data[MAPPING_TEMPERATURE] == 25.0
        assert weather_data[MAPPING_MIN_TEMP] == 15.0
        assert weather_data[MAPPING_MAX_TEMP] == 35.0
        assert weather_data[MAPPING_PRECIPITATION] == 50.0
        assert weather_data[MAPPING_HUMIDITY] == 65.0
        assert weather_data[MAPPING_WINDSPEED] == 3.0
        assert weather_data[MAPPING_PRESSURE] == 1013.25
        assert weather_data[MAPPING_DEWPOINT] == 18.0