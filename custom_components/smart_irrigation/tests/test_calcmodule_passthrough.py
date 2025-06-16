"""Tests for the Smart Irrigation Passthrough calculation module."""

from custom_components.smart_irrigation.calcmodules.passthrough import \
    Passthrough


def test_passthrough_returns_float(hass) -> None:
    """Test Passthrough returns the input as float."""
    module = Passthrough(hass, "desc")
    assert module.calculate(5) == 5.0
    assert module.calculate("3.14") == 3.14


def test_passthrough_invalid_returns_zero(hass) -> None:
    """Test Passthrough returns 0 for invalid input."""
    module = Passthrough(hass, "desc")
    assert module.calculate(None) == 0
    assert module.calculate("not_a_number") == 0
