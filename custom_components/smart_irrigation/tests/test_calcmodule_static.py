"""Tests for the Smart Irrigation Static calculation module."""

import pytest

from custom_components.smart_irrigation.calcmodules.static import Static


@pytest.fixture
def static_module() -> Static:
    """Return a Static calculation module instance."""
    return Static(None, "Static test", config={"static_value": 7.5})


def test_static_calculate_returns_configured_value(static_module: Static) -> None:
    """Test Static calculate returns the configured static value as float."""
    assert static_module.calculate({}) == 7.5
    assert static_module.calculate(None) == 7.5


def test_static_calculate_with_different_config() -> None:
    """Test Static calculate returns a different value if configured."""
    module = Static(None, "Static test", config={"static_value": 3.2})
    assert module.calculate({}) == 3.2
