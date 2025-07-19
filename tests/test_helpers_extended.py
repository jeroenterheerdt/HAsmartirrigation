"""Comprehensive tests for Smart Irrigation helper functions."""

import pytest
from unittest.mock import Mock, AsyncMock, patch
import aiohttp

from custom_components.smart_irrigation.helpers import (
    CannotConnect,
    InvalidAuth,
    altitudeToPressure,
    relative_to_absolute_pressure,
    check_time,
    convert_between,
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


class TestTemperatureFunctions:
    """Test temperature-related helper functions."""

    def test_convert_celsius_to_fahrenheit(self):
        """Test Celsius to Fahrenheit conversion."""
        result = convert_between_temperature(0, "°C", "°F")
        assert abs(result - 32.0) < 0.01

        result = convert_between_temperature(100, "°C", "°F")
        assert abs(result - 212.0) < 0.01

    def test_convert_fahrenheit_to_celsius(self):
        """Test Fahrenheit to Celsius conversion."""
        result = convert_between_temperature(32, "°F", "°C")
        assert abs(result - 0.0) < 0.01

        result = convert_between_temperature(212, "°F", "°C")
        assert abs(result - 100.0) < 0.01

    def test_convert_celsius_to_kelvin(self):
        """Test Celsius to Kelvin conversion."""
        result = convert_between_temperature(0, "°C", "K")
        assert abs(result - 273.15) < 0.01

    def test_convert_kelvin_to_celsius(self):
        """Test Kelvin to Celsius conversion."""
        result = convert_between_temperature(273.15, "K", "°C")
        assert abs(result - 0.0) < 0.01

    def test_convert_same_temperature_unit(self):
        """Test conversion within same unit."""
        result = convert_between_temperature(25, "°C", "°C")
        assert result == 25


class TestLengthFunctions:
    """Test length-related helper functions."""

    def test_convert_between_length_units(self):
        """Test length unit conversions."""
        # mm to inches
        result = convert_between_length_units(25.4, "mm", "in")
        assert abs(result - 1.0) < 0.01

        # inches to mm
        result = convert_between_length_units(1.0, "in", "mm")
        assert abs(result - 25.4) < 0.01

        # Same unit
        result = convert_between_length_units(100, "mm", "mm")
        assert result == 100


class TestSpeedFunctions:
    """Test speed-related helper functions."""

    def test_convert_between_speed_units(self):
        """Test speed unit conversions."""
        # m/s to km/h
        result = convert_between_speed_units(1, "m/s", "km/h")
        assert abs(result - 3.6) < 0.01

        # km/h to m/s
        result = convert_between_speed_units(3.6, "km/h", "m/s")
        assert abs(result - 1.0) < 0.01

        # km/h to mph
        result = convert_between_speed_units(100, "km/h", "mph")
        assert abs(result - 62.14) < 0.1

        # Same unit
        result = convert_between_speed_units(50, "km/h", "km/h")
        assert result == 50


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
    async def test_api_key_pirate_weather_success(self):
        """Test successful Pirate Weather API key validation."""
        with patch('aiohttp.ClientSession.get') as mock_get:
            mock_response = Mock()
            mock_response.status = 200
            mock_get.return_value.__aenter__.return_value = mock_response
            
            result = await test_api_key("test_key", "pirate_weather", 52.0, 4.0)
            assert result is True

    @pytest.mark.asyncio
    async def test_api_key_knmi_success(self):
        """Test successful KNMI API key validation."""
        # KNMI doesn't require API key validation
        result = await test_api_key("", "knmi", 52.0, 4.0)
        assert result is True

    @pytest.mark.asyncio
    async def test_api_key_invalid_service(self):
        """Test API key validation with invalid service."""
        with pytest.raises(ValueError):
            await test_api_key("test_key", "invalid_service", 52.0, 4.0)


class TestEdgeCases:
    """Test edge cases and error conditions."""

    def test_pressure_conversion_zero_values(self):
        """Test pressure calculations with zero values."""
        result = altitude_to_pressure(0, 0)
        assert result == 0

    def test_temperature_conversion_extreme_values(self):
        """Test temperature conversion with extreme values."""
        # Very cold temperature
        result = convert_between_temperature(-273.15, "°C", "K")
        assert abs(result - 0.0) < 0.01

        # Very hot temperature
        result = convert_between_temperature(1000, "°C", "°F")
        assert result > 1000

    def test_unit_conversion_invalid_units(self):
        """Test unit conversions with invalid units."""
        with pytest.raises(KeyError):
            convert_between_temperature(25, "invalid", "°C")

    def test_none_values(self):
        """Test functions with None values."""
        with pytest.raises((TypeError, ValueError)):
            altitude_to_pressure(None, 1013.25)

        with pytest.raises((TypeError, ValueError)):
            convert_between_temperature(None, "°C", "°F")


class TestPerformanceOptimizations:
    """Test performance-related aspects of helper functions."""

    def test_temperature_conversion_performance(self):
        """Test temperature conversion performance with many calls."""
        import time
        
        start_time = time.time()
        for _ in range(1000):
            convert_between_temperature(25, "°C", "°F")
        end_time = time.time()
        
        # Should complete 1000 conversions in well under a second
        assert (end_time - start_time) < 1.0

    def test_pressure_calculation_performance(self):
        """Test pressure calculation performance."""
        import time
        
        start_time = time.time()
        for _ in range(1000):
            altitude_to_pressure(100, 1013.25)
        end_time = time.time()
        
        # Should complete 1000 calculations in well under a second
        assert (end_time - start_time) < 1.0