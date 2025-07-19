"""Simple comprehensive tests for Smart Irrigation helper functions."""

import pytest
from unittest.mock import Mock, AsyncMock, patch
import aiohttp

from custom_components.smart_irrigation.helpers import (
    CannotConnect,
    InvalidAuth,
    altitudeToPressure,
    relative_to_absolute_pressure,
    check_time,
    test_api_key,
)


class TestHelperExceptions:
    """Test custom exception classes."""

    def test_cannot_connect_exception(self):
        """Test CannotConnect exception."""
        exc = CannotConnect("Connection failed")
        assert str(exc) == "Connection failed"
        assert isinstance(exc, Exception)

    def test_invalid_auth_exception(self):
        """Test InvalidAuth exception."""
        exc = InvalidAuth("Authentication failed")
        assert str(exc) == "Authentication failed"
        assert isinstance(exc, Exception)


class TestPressureFunctions:
    """Test pressure-related helper functions."""

    def test_altitude_to_pressure_sea_level(self):
        """Test pressure calculation at sea level."""
        pressure = altitudeToPressure(0, 1013.25)
        assert abs(pressure - 1013.25) < 0.01

    def test_altitude_to_pressure_elevated(self):
        """Test pressure calculation at elevation."""
        pressure = altitudeToPressure(1000, 1013.25)
        assert pressure < 1013.25
        assert pressure > 900  # Reasonable range

    def test_altitude_to_pressure_negative_elevation(self):
        """Test pressure calculation below sea level."""
        pressure = altitudeToPressure(-100, 1013.25)
        assert pressure > 1013.25

    def test_relative_to_absolute_pressure(self):
        """Test relative to absolute pressure conversion."""
        absolute = relative_to_absolute_pressure(1000, 100)
        assert absolute > 1000
        assert isinstance(absolute, float)


class TestTimeFunctions:
    """Test time-related helper functions."""

    def test_check_time_valid_format(self):
        """Test time validation with valid formats."""
        assert check_time("12:30") is True
        assert check_time("00:00") is True
        assert check_time("23:59") is True

    def test_check_time_invalid_format(self):
        """Test time validation with invalid formats."""
        assert check_time("25:00") is False
        assert check_time("12:60") is False
        assert check_time("invalid") is False
        assert check_time("") is False

    def test_check_time_edge_cases(self):
        """Test time validation edge cases."""
        assert check_time("24:00") is False
        assert check_time("-1:30") is False
        assert check_time("12:30:45") is False  # Too many parts


class TestAPIKeyValidation:
    """Test API key validation functions."""

    @pytest.mark.asyncio
    async def test_api_key_owm_success(self):
        """Test successful OWM API key validation."""
        with patch('aiohttp.ClientSession.get') as mock_get:
            mock_response = Mock()
            mock_response.status = 200
            mock_get.return_value.__aenter__.return_value = mock_response
            
            result = await test_api_key("test_key", "owm", 52.0, 4.0)
            assert result is True

    @pytest.mark.asyncio
    async def test_api_key_owm_invalid(self):
        """Test invalid OWM API key."""
        with patch('aiohttp.ClientSession.get') as mock_get:
            mock_response = Mock()
            mock_response.status = 401
            mock_get.return_value.__aenter__.return_value = mock_response
            
            with pytest.raises(InvalidAuth):
                await test_api_key("invalid_key", "owm", 52.0, 4.0)

    @pytest.mark.asyncio
    async def test_api_key_connection_error(self):
        """Test API key validation with connection error."""
        with patch('aiohttp.ClientSession.get') as mock_get:
            mock_get.side_effect = aiohttp.ClientError("Connection failed")
            
            with pytest.raises(CannotConnect):
                await test_api_key("test_key", "owm", 52.0, 4.0)

    @pytest.mark.asyncio
    async def test_api_key_knmi_success(self):
        """Test successful KNMI API key validation."""
        # KNMI doesn't require API key validation
        result = await test_api_key("", "knmi", 52.0, 4.0)
        assert result is True


class TestEdgeCases:
    """Test edge cases and error conditions."""

    def test_pressure_conversion_zero_values(self):
        """Test pressure calculations with zero values."""
        result = altitudeToPressure(0, 0)
        assert result == 0

    def test_none_values(self):
        """Test functions with None values."""
        with pytest.raises((TypeError, ValueError)):
            altitudeToPressure(None, 1013.25)


class TestPerformanceOptimizations:
    """Test performance-related aspects of helper functions."""

    def test_pressure_calculation_performance(self):
        """Test pressure calculation performance."""
        import time
        
        start_time = time.time()
        for _ in range(1000):
            altitudeToPressure(100, 1013.25)
        end_time = time.time()
        
        # Should complete 1000 calculations in well under a second
        assert (end_time - start_time) < 1.0

    def test_time_validation_performance(self):
        """Test time validation performance."""
        import time
        
        start_time = time.time()
        for _ in range(1000):
            check_time("12:30")
        end_time = time.time()
        
        # Should complete 1000 validations in well under a second  
        assert (end_time - start_time) < 1.0