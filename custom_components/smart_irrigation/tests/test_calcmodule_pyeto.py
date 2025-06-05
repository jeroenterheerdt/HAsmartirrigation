"""Tests for the Smart Irrigation PyETO calculation module."""

import pytest

from custom_components.smart_irrigation.const import (
    CONF_PYETO_COASTAL,
    CONF_PYETO_SOLRAD_BEHAVIOR,
    CONF_PYETO_FORECAST_DAYS,
    MAPPING_TEMPERATURE,
    MAPPING_HUMIDITY,
    MAPPING_PRESSURE,
    MAPPING_MIN_TEMP,
    MAPPING_MAX_TEMP,
    MAPPING_WINDSPEED,
    MAPPING_SOLRAD,
    MAPPING_DEWPOINT,
)
from custom_components.smart_irrigation.calcmodules.pyeto import PyETO


@pytest.fixture
def pyeto_module(hass) -> PyETO:
    """Return a PyETO calculation module instance."""
    return PyETO(
        hass,
        "PyETO test",
        config={
            # CONF_PYETO_COASTAL: False,
            # CONF_PYETO_SOLRAD_BEHAVIOR: 1,
            # CONF_PYETO_FORECAST_DAYS: 0,
        },
    )


def test_pyeto_calculate_valid(pyeto_module: PyETO) -> None:
    """Test PyETO calculate returns a float for valid input."""
    # Example input dictionary with required keys for PyETO
    data = {
        MAPPING_TEMPERATURE: 25.0,
        MAPPING_HUMIDITY: 60.0,
        MAPPING_WINDSPEED: 2.0,
        MAPPING_SOLRAD: 20.0,
        MAPPING_PRESSURE: 101.3,
        MAPPING_DEWPOINT: 100.0,
        MAPPING_MIN_TEMP: 40.0,
        MAPPING_MAX_TEMP: 150,
    }
    result = pyeto_module.calculate(data, None)
    assert isinstance(result, float)
    result = pyeto_module.calculate(data, data)
    assert isinstance(result, float)


def test_pyeto_calculate_invalid(pyeto_module: PyETO) -> None:
    """Test PyETO calculate returns 0.0 for invalid input."""
    assert pyeto_module.calculate(None, None) == 0.0
    assert pyeto_module.calculate({}, {}) == 0.0
