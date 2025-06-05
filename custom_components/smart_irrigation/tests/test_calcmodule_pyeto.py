"""Tests for the Smart Irrigation PyETO calculation module."""

import pytest

from custom_components.smart_irrigation.calcmodules.pyeto import PyETO


@pytest.fixture
def pyeto_module() -> PyETO:
    """Return a PyETO calculation module instance."""
    return PyETO(None, "PyETO test", config={})


def test_pyeto_calculate_valid(pyeto_module: PyETO) -> None:
    """Test PyETO calculate returns a float for valid input."""
    # Example input dictionary with required keys for PyETO
    data = {
        "temperature": 25.0,
        "humidity": 60.0,
        "wind_speed": 2.0,
        "solar_radiation": 20.0,
        "pressure": 101.3,
        "altitude": 100.0,
        "latitude": 40.0,
        "doy": 150,
    }
    result = pyeto_module.calculate(data)
    assert isinstance(result, float)


def test_pyeto_calculate_invalid(pyeto_module: PyETO) -> None:
    """Test PyETO calculate returns 0 for invalid input."""
    assert pyeto_module.calculate(None) == 0
    assert pyeto_module.calculate({}) == 0
