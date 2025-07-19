"""Fixtures for testing."""

import sys
import pytest
from pathlib import Path
from unittest.mock import AsyncMock, Mock, patch, MagicMock

# Add the repository root to Python path so custom component imports work
repo_root = Path(__file__).parent.parent
if str(repo_root) not in sys.path:
    sys.path.insert(0, str(repo_root))

# Patch problematic Home Assistant modules before any imports
def patch_homeassistant_modules():
    """Patch Home Assistant modules that cause import issues."""
    # Create mock modules for problematic HA components
    mock_modules = [
        'homeassistant.helpers',
        'homeassistant.helpers.device_registry',
        'homeassistant.helpers.entity_registry',
        'homeassistant.components.frontend',
        'homeassistant.components.websocket_api',
        'homeassistant.components.http',
        'homeassistant.components.logger',
        'homeassistant.components.system_log',
    ]
    
    for module_name in mock_modules:
        if module_name not in sys.modules:
            sys.modules[module_name] = MagicMock()

# Apply patches early
patch_homeassistant_modules()


@pytest.fixture(autouse=True)
def auto_enable_custom_integrations(enable_custom_integrations):
    """Enable custom integrations for all tests."""
    yield


@pytest.fixture
def mock_hass():
    """Return a mock Home Assistant instance."""
    hass = Mock()
    hass.config = Mock()
    hass.config.config_dir = "/tmp/test_config"
    hass.config.latitude = 52.379189
    hass.config.longitude = 4.899431
    hass.config.elevation = 0
    hass.config.units = Mock()
    hass.config.time_zone = "UTC"
    
    hass.data = {}
    hass.states = Mock()
    hass.states.async_set = AsyncMock()
    hass.states.get = Mock(return_value=None)
    
    hass.services = Mock()
    hass.services.async_call = AsyncMock()
    
    hass.bus = Mock()
    hass.bus.async_listen = Mock()
    hass.bus.async_fire = AsyncMock()
    
    hass.async_add_executor_job = AsyncMock()
    hass.async_create_task = AsyncMock()
    
    return hass


@pytest.fixture
def mock_entry():
    """Return a mock config entry."""
    from tests.common import MockConfigEntry
    from custom_components.smart_irrigation import const
    from homeassistant.const import CONF_LATITUDE, CONF_LONGITUDE, CONF_ELEVATION
    
    return MockConfigEntry(
        domain=const.DOMAIN,
        title=const.NAME,
        data={
            const.CONF_INSTANCE_NAME: "Test Smart Irrigation",
            const.CONF_USE_WEATHER_SERVICE: False,
            CONF_LATITUDE: 52.379189,
            CONF_LONGITUDE: 4.899431,
            CONF_ELEVATION: 0,
        },
        entry_id="test_entry_id",
        unique_id="test_unique_id",
    )
