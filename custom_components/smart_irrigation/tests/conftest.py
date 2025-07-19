"""Fixtures for testing Smart Irrigation integration."""

import sys
from pathlib import Path

# Add the config directory to Python path so imports work
config_dir = Path(__file__).parent.parent.parent.parent
if str(config_dir) not in sys.path:
    sys.path.insert(0, str(config_dir))

import pytest
from unittest.mock import AsyncMock, Mock, patch
from homeassistant.core import HomeAssistant
from homeassistant.const import CONF_LATITUDE, CONF_LONGITUDE, CONF_ELEVATION
from pytest_homeassistant_custom_component.syrupy import HomeAssistantSnapshotExtension
from syrupy.assertion import SnapshotAssertion
from tests.common import MockConfigEntry

from custom_components.smart_irrigation import const


@pytest.fixture
def snapshot(snapshot: SnapshotAssertion) -> SnapshotAssertion:
    """Return snapshot assertion fixture with the Home Assistant extension."""
    return snapshot.use_extension(HomeAssistantSnapshotExtension)


@pytest.fixture(autouse=True)
def auto_enable_custom_integrations(enable_custom_integrations):
    """Enable custom integrations for all tests."""
    yield


@pytest.fixture
def mock_setup_entry() -> AsyncMock:
    """Override async_setup_entry."""
    with patch(
        "custom_components.smart_irrigation.async_setup_entry", return_value=True
    ) as mock_setup_entry:
        yield mock_setup_entry


@pytest.fixture
def mock_config_entry():
    """Return a mock config entry."""
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


@pytest.fixture
def mock_config_entry_with_weather():
    """Return a mock config entry with weather service enabled."""
    return MockConfigEntry(
        domain=const.DOMAIN,
        title=const.NAME,
        data={
            const.CONF_INSTANCE_NAME: "Test Smart Irrigation",
            const.CONF_USE_WEATHER_SERVICE: True,
            const.CONF_WEATHER_SERVICE: const.CONF_WEATHER_SERVICE_OWM,
            const.CONF_WEATHER_SERVICE_API_KEY: "test_api_key",
            CONF_LATITUDE: 52.379189,
            CONF_LONGITUDE: 4.899431,
            CONF_ELEVATION: 0,
        },
        entry_id="test_entry_id",
        unique_id="test_unique_id",
    )


@pytest.fixture
def mock_store():
    """Return a mock store."""
    store = Mock()
    store.async_get_config = AsyncMock(return_value={})
    store.async_get_all_zones = AsyncMock(return_value=[])
    store.async_get_zone = AsyncMock(return_value=None)
    store.async_save_zone = AsyncMock()
    store.async_delete_zone = AsyncMock()
    store.set_up_factory_defaults = AsyncMock()
    store.get_mappings = Mock(return_value={})
    store.get_modules = Mock(return_value={})
    store.get_zones = Mock(return_value={})
    return store


@pytest.fixture
def mock_coordinator(mock_store):
    """Return a mock coordinator."""
    coordinator = Mock()
    coordinator.id = "test_coordinator_id"
    coordinator.store = mock_store
    coordinator.use_weather_service = False
    coordinator.update_subscriptions = AsyncMock()
    coordinator.async_unload = AsyncMock()
    coordinator.async_delete_config = AsyncMock()
    coordinator.setup_SmartIrrigation_entities = AsyncMock()

    # Mock unsubscribe methods
    coordinator.unsubscribe_calc_updates = Mock()
    coordinator.unsubscribe_hourly_updates = Mock()
    coordinator.unsubscribe_minutely_updates = Mock()
    coordinator.unsubscribe_daily_updates = Mock()
    coordinator.unsubscribe_sun_updates = Mock()

    return coordinator


@pytest.fixture
def zone_config():
    """Return a sample zone configuration."""
    return {
        "name": "Test Zone",
        "bucket": 10.5,
        "state": "normal",
        "multiplier": 1.0,
        "switched": False,
        "enabled": True,
        "zone_size": 100,
        "throughput": 15,
        "lead_time": 0,
        "maximum_duration": 3600,
        "ignore_sensors": False,
        "show_units": True,
        "run_freq": 1,
        "calculated_seconds": 0,
        "calculated_minutes": 0,
        "delta": 0,
        "description": "Test zone description",
        "old_bucket": 10.0,
        "sensors": [],
        "bucket_throughput": 0,
        "expiry": None,
        "slope": 1,
        "base": 0,
        "peak": 100,
        "rainblock": False,
        "rainblock_start": None,
        "rainblock_end": None,
        "last_modified": None,
        "zone_mapping": {},
        "reference_evapotranspiration": 0,
        "evapotranspiration": 0,
        "precipitation": 0,
    }
