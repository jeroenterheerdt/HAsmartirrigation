"""Integration test for the watering calendar API endpoints."""

import json
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from homeassistant.core import HomeAssistant

from custom_components.smart_irrigation.websockets import (
    SmartIrrigationWateringCalendarView,
    websocket_get_watering_calendar
)
from custom_components.smart_irrigation.const import (
    ZONE_ID,
    ZONE_NAME,
    ZONE_SIZE,
    ZONE_STATE,
    ZONE_STATE_AUTOMATIC,
    ZONE_MAPPING,
    ZONE_MODULE,
    ZONE_MULTIPLIER,
    MODULE_NAME
)


@pytest.fixture
def mock_coordinator():
    """Create a mock coordinator for testing."""
    coordinator = AsyncMock()
    
    # Mock calendar data response
    calendar_data = {
        1: {
            "zone_name": "Test Zone",
            "zone_id": 1,
            "monthly_estimates": [
                {
                    "month": i,
                    "month_name": f"Month{i}",
                    "estimated_et_mm": 50.0 + i * 5,
                    "estimated_watering_volume_liters": 1000.0 + i * 100,
                    "average_temperature_c": 10.0 + i * 2,
                    "average_precipitation_mm": 80.0 - i * 2,
                    "calculation_notes": f"Based on typical Month{i} climate patterns"
                }
                for i in range(1, 13)
            ],
            "generated_at": "2024-01-15T10:30:00",
            "calculation_method": "FAO-56 Penman-Monteith method using PyETO"
        }
    }
    
    coordinator.async_generate_watering_calendar.return_value = calendar_data
    
    return coordinator


@pytest.fixture
def mock_hass(mock_coordinator):
    """Create a mock Home Assistant instance."""
    hass = MagicMock()
    hass.data = {
        "smart_irrigation": {
            "coordinator": mock_coordinator
        }
    }
    return hass


class TestWateringCalendarAPI:
    """Test class for watering calendar API endpoints."""

    @pytest.mark.asyncio
    async def test_websocket_get_watering_calendar_all_zones(self, mock_hass, mock_coordinator):
        """Test WebSocket API for getting calendar data for all zones."""
        connection = MagicMock()
        msg = {"id": "test123"}
        
        await websocket_get_watering_calendar(mock_hass, connection, msg)
        
        # Verify coordinator was called correctly
        mock_coordinator.async_generate_watering_calendar.assert_called_once_with(None)
        
        # Verify response was sent
        connection.send_result.assert_called_once()
        call_args = connection.send_result.call_args[0]
        assert call_args[0] == "test123"  # message ID
        assert 1 in call_args[1]  # calendar data contains zone 1
        assert len(call_args[1][1]["monthly_estimates"]) == 12

    @pytest.mark.asyncio 
    async def test_websocket_get_watering_calendar_specific_zone(self, mock_hass, mock_coordinator):
        """Test WebSocket API for getting calendar data for a specific zone."""
        connection = MagicMock()
        msg = {"id": "test456", "zone_id": "1"}
        
        await websocket_get_watering_calendar(mock_hass, connection, msg)
        
        # Verify coordinator was called with correct zone ID
        mock_coordinator.async_generate_watering_calendar.assert_called_once_with(1)
        
        # Verify response was sent
        connection.send_result.assert_called_once()

    @pytest.mark.asyncio
    async def test_websocket_get_watering_calendar_error_handling(self, mock_hass):
        """Test WebSocket API error handling."""
        # Mock coordinator to raise an exception
        mock_coordinator = AsyncMock()
        mock_coordinator.async_generate_watering_calendar.side_effect = Exception("Test error")
        mock_hass.data["smart_irrigation"]["coordinator"] = mock_coordinator
        
        connection = MagicMock()
        msg = {"id": "test789", "zone_id": "999"}
        
        await websocket_get_watering_calendar(mock_hass, connection, msg)
        
        # Verify error was sent
        connection.send_error.assert_called_once()
        error_args = connection.send_error.call_args[0]
        assert error_args[0] == "test789"  # message ID
        assert error_args[1] == "calendar_generation_failed"
        assert "Test error" in error_args[2]

    @pytest.mark.asyncio
    async def test_http_view_get_all_zones(self, mock_hass, mock_coordinator):
        """Test HTTP API view for getting calendar data for all zones."""
        view = SmartIrrigationWateringCalendarView()
        
        # Mock request
        request = MagicMock()
        request.app = {"hass": mock_hass}
        request.query = {}  # No zone_id parameter
        
        response = await view.get(request)
        
        # Verify coordinator was called correctly
        mock_coordinator.async_generate_watering_calendar.assert_called_once_with(None)
        
        # Verify JSON response
        assert hasattr(response, 'body')

    @pytest.mark.asyncio
    async def test_http_view_get_specific_zone(self, mock_hass, mock_coordinator):
        """Test HTTP API view for getting calendar data for a specific zone."""
        view = SmartIrrigationWateringCalendarView()
        
        # Mock request with zone_id
        request = MagicMock()
        request.app = {"hass": mock_hass}
        request.query = {"zone_id": "1"}
        
        response = await view.get(request)
        
        # Verify coordinator was called with correct zone ID
        mock_coordinator.async_generate_watering_calendar.assert_called_once_with(1)

    @pytest.mark.asyncio
    async def test_http_view_error_handling(self, mock_hass):
        """Test HTTP API view error handling."""
        # Mock coordinator to raise an exception
        mock_coordinator = AsyncMock()
        mock_coordinator.async_generate_watering_calendar.side_effect = Exception("HTTP test error")
        mock_hass.data["smart_irrigation"]["coordinator"] = mock_coordinator
        
        view = SmartIrrigationWateringCalendarView()
        
        # Mock request
        request = MagicMock()
        request.app = {"hass": mock_hass}
        request.query = {"zone_id": "999"}
        
        response = await view.get(request)
        
        # Check if error response was created (implementation depends on the view's json method)
        # This test verifies the exception was caught and handled

    @pytest.mark.asyncio
    async def test_calendar_data_structure(self, mock_hass, mock_coordinator):
        """Test that calendar data has the expected structure."""
        connection = MagicMock()
        msg = {"id": "structure_test"}
        
        await websocket_get_watering_calendar(mock_hass, connection, msg)
        
        # Get the calendar data from the mock call
        call_args = connection.send_result.call_args[0]
        calendar_data = call_args[1]
        
        # Verify structure
        assert isinstance(calendar_data, dict)
        
        zone_data = calendar_data[1]
        assert "zone_name" in zone_data
        assert "zone_id" in zone_data
        assert "monthly_estimates" in zone_data
        assert "generated_at" in zone_data
        assert "calculation_method" in zone_data
        
        # Verify monthly estimates structure
        monthly_estimates = zone_data["monthly_estimates"]
        assert len(monthly_estimates) == 12
        
        for i, estimate in enumerate(monthly_estimates, 1):
            assert estimate["month"] == i
            assert "month_name" in estimate
            assert "estimated_et_mm" in estimate
            assert "estimated_watering_volume_liters" in estimate
            assert "average_temperature_c" in estimate
            assert "average_precipitation_mm" in estimate
            assert "calculation_notes" in estimate

    @pytest.mark.asyncio
    async def test_invalid_zone_id_conversion(self, mock_hass, mock_coordinator):
        """Test handling of invalid zone ID values."""
        connection = MagicMock()
        msg = {"id": "invalid_test", "zone_id": "not_a_number"}
        
        # This should raise a ValueError during int conversion
        with pytest.raises(ValueError):
            await websocket_get_watering_calendar(mock_hass, connection, msg)

        # Verify error handling path
        # The actual implementation should catch this and send an error response