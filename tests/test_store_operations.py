"""Comprehensive tests for Smart Irrigation store operations."""

import pytest

from custom_components.smart_irrigation import const
from custom_components.smart_irrigation.store import SmartIrrigationStorage


class TestSmartIrrigationStorageBasics:
    """Test basic store functionality."""

    def test_store_initialization(self, hass):
        """Test store initialization."""
        store = SmartIrrigationStorage(hass)
        assert store.hass == hass

    @pytest.mark.asyncio
    async def test_store_can_load(self, hass):
        """Test that store can be loaded without errors."""
        store = SmartIrrigationStorage(hass)
        await store.async_load()
        assert store.config is not None

    def test_get_config_returns_dict(self, hass):
        """Test that get_config returns a dictionary."""
        store = SmartIrrigationStorage(hass)
        config = store.get_config()
        assert isinstance(config, dict)

    @pytest.mark.asyncio
    async def test_async_get_config_returns_dict(self, hass):
        """Test that async_get_config returns a dictionary."""
        store = SmartIrrigationStorage(hass)
        config = await store.async_get_config()
        assert isinstance(config, dict)

    @pytest.mark.asyncio
    async def test_factory_defaults_creation(self, hass):
        """Test that factory defaults can be created."""
        store = SmartIrrigationStorage(hass)
        await store.set_up_factory_defaults()
        # Should not raise any exceptions

    @pytest.mark.asyncio
    async def test_config_update_works(self, hass):
        """Test that configuration can be updated."""
        store = SmartIrrigationStorage(hass)
        await store.async_load()

        # Update a configuration value
        await store.async_update_config({const.CONF_AUTO_UPDATE_ENABLED: True})

        updated_config = await store.async_get_config()
        assert updated_config[const.CONF_AUTO_UPDATE_ENABLED] is True


class TestBasicFunctionality:
    """Test basic functionality without complex mocking."""

    @pytest.mark.asyncio
    async def test_zones_basic_operations(self, hass):
        """Test basic zone operations."""
        store = SmartIrrigationStorage(hass)
        await store.async_load()

        # Get zones (should be empty initially)
        zones = await store.async_get_zones()
        assert isinstance(zones, list)

        # Create a basic zone
        zone_data = {
            const.ZONE_NAME: "Test Zone",
            const.ZONE_SIZE: 100.0,
            const.ZONE_THROUGHPUT: 10.0,
            const.ZONE_STATE: const.ZONE_STATE_AUTOMATIC,
        }

        created_zone = await store.async_create_zone(zone_data)
        assert created_zone[const.ZONE_NAME] == "Test Zone"
        assert created_zone[const.ZONE_ID] is not None

    @pytest.mark.asyncio
    async def test_modules_basic_operations(self, hass):
        """Test basic module operations."""
        store = SmartIrrigationStorage(hass)
        await store.async_load()

        modules = await store.async_get_modules()
        assert isinstance(modules, list)

    @pytest.mark.asyncio
    async def test_mappings_basic_operations(self, hass):
        """Test basic mapping operations."""
        store = SmartIrrigationStorage(hass)
        await store.async_load()

        mappings = await store.async_get_mappings()
        assert isinstance(mappings, list)
