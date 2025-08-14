"""Test Smart Irrigation helper functions."""

from datetime import time
from unittest.mock import AsyncMock

import pytest
from homeassistant.const import UnitOfTemperature

from custom_components.smart_irrigation.const import (
    CONF_WEATHER_SERVICE_OWM,
    CONF_WEATHER_SERVICE_PW,
)
from custom_components.smart_irrigation.helpers import (
    CannotConnect,
    InvalidAuth,
    altitudeToPressure,
    check_time,
    convert_between,
    relative_to_absolute_pressure,
    test_api_key,
)


class TestHelperFunctions:
    """Test helper functions."""

    def test_altitude_to_pressure(self) -> None:
        """Test altitude to pressure conversion."""
        # Test at sea level
        pressure_sea_level = altitudeToPressure(0)
        assert pressure_sea_level == pytest.approx(1013.25, rel=1e-2)

        # Test at 1000m elevation
        pressure_1000m = altitudeToPressure(1000)
        assert pressure_1000m < pressure_sea_level
        assert pressure_1000m == pytest.approx(898.7, rel=1e-1)

    def test_relative_to_absolute_pressure(self) -> None:
        """Test relative to absolute pressure conversion."""
        relative_pressure = 1013.25
        altitude = 100
        temperature = 20.0

        absolute_pressure = relative_to_absolute_pressure(
            relative_pressure, altitude, temperature
        )

        assert isinstance(absolute_pressure, float)
        assert absolute_pressure > 0

    def test_check_time_valid(self) -> None:
        """Test check_time with valid time string."""
        valid_times = ["00:00", "12:30", "23:59"]

        for time_str in valid_times:
            result = check_time(time_str)
            assert isinstance(result, time)

    def test_check_time_invalid(self) -> None:
        """Test check_time with invalid time string."""
        invalid_times = ["25:00", "12:60", "abc", "12", "12:30:45"]

        for time_str in invalid_times:
            with pytest.raises(ValueError):
                check_time(time_str)

    def test_convert_between_temperature(self) -> None:
        """Test temperature conversion."""
        # Celsius to Fahrenheit
        celsius_to_fahrenheit = convert_between(
            0, UnitOfTemperature.CELSIUS, UnitOfTemperature.FAHRENHEIT
        )
        assert celsius_to_fahrenheit == 32.0

        # Fahrenheit to Celsius
        fahrenheit_to_celsius = convert_between(
            32, UnitOfTemperature.FAHRENHEIT, UnitOfTemperature.CELSIUS
        )
        assert fahrenheit_to_celsius == 0.0

    def test_convert_between_same_unit(self) -> None:
        """Test conversion with same source and target units."""
        value = 25.5
        result = convert_between(
            value, UnitOfTemperature.CELSIUS, UnitOfTemperature.CELSIUS
        )
        assert result == value

    async def test_test_api_key_owm_success(self) -> None:
        """Test OWM API key validation success."""
        mock_session = AsyncMock()
        mock_response = AsyncMock()
        mock_response.status = 200
        mock_response.json.return_value = {"cod": 200}
        mock_session.get.return_value.__aenter__.return_value = mock_response

        result = await test_api_key(
            mock_session, CONF_WEATHER_SERVICE_OWM, "valid_api_key", "3.0", 52.0, 5.0
        )

        assert result is True

    async def test_test_api_key_owm_invalid_auth(self) -> None:
        """Test OWM API key validation with invalid auth."""
        mock_session = AsyncMock()
        mock_response = AsyncMock()
        mock_response.status = 401
        mock_session.get.return_value.__aenter__.return_value = mock_response

        with pytest.raises(InvalidAuth):
            await test_api_key(
                mock_session,
                CONF_WEATHER_SERVICE_OWM,
                "invalid_api_key",
                "3.0",
                52.0,
                5.0,
            )

    async def test_test_api_key_owm_cannot_connect(self) -> None:
        """Test OWM API key validation with connection error."""
        mock_session = AsyncMock()
        mock_session.get.side_effect = Exception("Connection error")

        with pytest.raises(CannotConnect):
            await test_api_key(
                mock_session, CONF_WEATHER_SERVICE_OWM, "test_api_key", "3.0", 52.0, 5.0
            )

    async def test_test_api_key_pirate_weather_success(self) -> None:
        """Test Pirate Weather API key validation success."""
        mock_session = AsyncMock()
        mock_response = AsyncMock()
        mock_response.status = 200
        mock_response.json.return_value = {"currently": {"temperature": 20}}
        mock_session.get.return_value.__aenter__.return_value = mock_response

        result = await test_api_key(
            mock_session, CONF_WEATHER_SERVICE_PW, "valid_api_key", None, 52.0, 5.0
        )

        assert result is True

    def test_convert_between_pressure_units(self) -> None:
        """Test pressure unit conversions."""
        from custom_components.smart_irrigation.const import (
            HPA_TO_INHG_FACTOR,
            HPA_TO_PSI_FACTOR,
            UNIT_HPA,
            UNIT_INHG,
            UNIT_PSI,
        )

        # Test hPa to inHg conversion
        hpa_value = 1013.25
        inhg_value = convert_between(hpa_value, UNIT_HPA, UNIT_INHG)
        expected_inhg = hpa_value * HPA_TO_INHG_FACTOR
        assert inhg_value == pytest.approx(expected_inhg, rel=1e-3)

        # Test hPa to PSI conversion
        psi_value = convert_between(hpa_value, UNIT_HPA, UNIT_PSI)
        expected_psi = hpa_value * HPA_TO_PSI_FACTOR
        assert psi_value == pytest.approx(expected_psi, rel=1e-3)

    def test_convert_between_length_units(self) -> None:
        """Test length unit conversions."""
        from custom_components.smart_irrigation.const import (
            INCH_TO_MM_FACTOR,
            MM_TO_INCH_FACTOR,
            UNIT_INCH,
            UNIT_MM,
        )

        # Test mm to inch conversion
        mm_value = 25.4
        inch_value = convert_between(mm_value, UNIT_MM, UNIT_INCH)
        expected_inch = mm_value * MM_TO_INCH_FACTOR
        assert inch_value == pytest.approx(expected_inch, rel=1e-3)

        # Test inch to mm conversion
        inch_value = 1.0
        mm_value = convert_between(inch_value, UNIT_INCH, UNIT_MM)
        expected_mm = inch_value * INCH_TO_MM_FACTOR
        assert mm_value == pytest.approx(expected_mm, rel=1e-3)

    def test_convert_between_speed_units(self) -> None:
        """Test speed unit conversions."""
        from custom_components.smart_irrigation.const import (
            MS_TO_KMH_FACTOR,
            MS_TO_MILESH_FACTOR,
            UNIT_KMH,
            UNIT_MILESH,
            UNIT_MS,
        )

        # Test m/s to km/h conversion
        ms_value = 10.0
        kmh_value = convert_between(ms_value, UNIT_MS, UNIT_KMH)
        expected_kmh = ms_value * MS_TO_KMH_FACTOR
        assert kmh_value == pytest.approx(expected_kmh, rel=1e-3)

        # Test m/s to mph conversion
        mph_value = convert_between(ms_value, UNIT_MS, UNIT_MILESH)
        expected_mph = ms_value * MS_TO_MILESH_FACTOR
        assert mph_value == pytest.approx(expected_mph, rel=1e-3)


class TestExceptionClasses:
    """Test custom exception classes."""

    def test_cannot_connect_exception(self) -> None:
        """Test CannotConnect exception."""
        message = "Cannot connect to service"

        with pytest.raises(CannotConnect) as exc_info:
            raise CannotConnect(message)

        assert str(exc_info.value) == message

    def test_invalid_auth_exception(self) -> None:
        """Test InvalidAuth exception."""
        message = "Invalid authentication"

        with pytest.raises(InvalidAuth) as exc_info:
            raise InvalidAuth(message)

        assert str(exc_info.value) == message
