"""Comprehensive tests for Smart Irrigation store operations."""

from unittest.mock import AsyncMock

import pytest

from custom_components.smart_irrigation import const
from custom_components.smart_irrigation.store import SmartIrrigationStorage


class TestSmartIrrigationStorageBasics:
    """Test basic store functionality."""

    @pytest.mark.asyncio
    async def test_store_initialization(self, hass):
        """Test store initialization."""
        store = SmartIrrigationStorage(hass)
        await store.async_load()
        assert store.hass == hass

    @pytest.mark.asyncio
    async def test_store_can_load(self, hass):
        """Test that store can be loaded."""
        store = SmartIrrigationStorage(hass)
        await store.async_load()
        # Should not raise any exceptions

    def test_get_config_returns_dict(self, hass):
        """Test that get_config returns a dictionary."""
        store = SmartIrrigationStorage(hass)
        config = store.get_config()
        assert isinstance(config, dict)

    @pytest.mark.asyncio
    async def test_async_get_config_returns_dict(self, hass):
        """Test that async_get_config returns a dictionary."""
        store = SmartIrrigationStorage(hass)
        await store.async_load()
        config = await store.async_get_config()
        assert isinstance(config, dict)

    @pytest.mark.asyncio
    async def test_factory_defaults_creation(self, hass):
        """Test factory defaults creation."""
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


class TestConfigOperations:
    """Test configuration operations."""

    @pytest.fixture
    async def store_with_config(self, hass):
        """Create store with sample configuration."""
        store = SmartIrrigationStorage(hass)
        await store.async_load()
        await store.async_update_config(
            {
                const.CONF_AUTO_UPDATE_ENABLED: True,
                const.CONF_AUTO_CALC_ENABLED: False,
                const.CONF_USE_WEATHER_SERVICE: True,
            }
        )
        return store

    def test_get_config(self, store_with_config):
        """Test getting configuration synchronously."""
        config = store_with_config.get_config()
        assert config[const.CONF_AUTO_UPDATE_ENABLED] is True
        assert config[const.CONF_AUTO_CALC_ENABLED] is False
        assert config[const.CONF_USE_WEATHER_SERVICE] is True

    @pytest.mark.asyncio
    async def test_async_get_config(self, store_with_config):
        """Test getting configuration asynchronously."""
        config = await store_with_config.async_get_config()
        assert config[const.CONF_AUTO_UPDATE_ENABLED] is True
        assert config[const.CONF_AUTO_CALC_ENABLED] is False
        assert config[const.CONF_USE_WEATHER_SERVICE] is True

    @pytest.mark.asyncio
    async def test_store_update_config(self, store_with_config):
        """Test updating configuration."""
        new_config = {const.CONF_AUTO_CALC_ENABLED: True}
        await store_with_config.async_update_config(new_config)

        updated_config = await store_with_config.async_get_config()
        assert updated_config[const.CONF_AUTO_CALC_ENABLED] is True
        # Other values should remain unchanged
        assert updated_config[const.CONF_AUTO_UPDATE_ENABLED] is True

    @pytest.mark.asyncio
    async def test_store_factory_defaults(self, hass):
        """Test factory defaults setup."""
        store = SmartIrrigationStorage(hass)
        await store.set_up_factory_defaults()

        config = await store.async_get_config()
        assert isinstance(config, dict)
        # Should have some default values
        assert const.CONF_AUTO_UPDATE_ENABLED in config


class TestZoneOperations:
    """Test zone management operations."""

    @pytest.fixture
    async def store_with_zones(self, hass):
        """Create store with sample zones."""
        store = SmartIrrigationStorage(hass)
        await store.async_load()

        # Add sample zones
        zone1_data = {
            const.ZONE_NAME: "Front Lawn",
            const.ZONE_SIZE: 100.0,
            const.ZONE_THROUGHPUT: 15.0,
            const.ZONE_STATE: const.ZONE_STATE_AUTOMATIC,
        }
        zone2_data = {
            const.ZONE_NAME: "Back Garden",
            const.ZONE_SIZE: 50.0,
            const.ZONE_THROUGHPUT: 10.0,
            const.ZONE_STATE: const.ZONE_STATE_MANUAL,
        }

        await store.async_create_zone(zone1_data)
        await store.async_create_zone(zone2_data)
        return store

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
    async def test_async_get_all_zones(self, store_with_zones):
        """Test async retrieval of all zones."""
        zones = await store_with_zones.async_get_zones()
        assert len(zones) >= 2
        # Should contain our test zones
        zone_names = [zone[const.ZONE_NAME] for zone in zones]
        assert "Front Lawn" in zone_names
        assert "Back Garden" in zone_names

    @pytest.mark.asyncio
    async def test_async_get_zone_existing(self, store_with_zones):
        """Test retrieving existing zone."""
        zones = await store_with_zones.async_get_zones()
        if zones:
            zone_id = zones[0][const.ZONE_ID]
            zone = store_with_zones.get_zone(zone_id)
            assert zone is not None
            assert zone[const.ZONE_NAME] in ["Front Lawn", "Back Garden"]

    @pytest.mark.asyncio
    async def test_async_save_zone_new(self, hass):
        """Test saving new zone."""
        store = SmartIrrigationStorage(hass)
        await store.async_load()

        new_zone = {
            const.ZONE_NAME: "Side Yard",
            const.ZONE_SIZE: 75.0,
            const.ZONE_THROUGHPUT: 12.0,
            const.ZONE_STATE: const.ZONE_STATE_AUTOMATIC,
        }

        created_zone = await store.async_create_zone(new_zone)
        assert created_zone[const.ZONE_NAME] == "Side Yard"
        assert created_zone[const.ZONE_ID] is not None

    @pytest.mark.asyncio
    async def test_async_delete_zone(self, store_with_zones):
        """Test deleting existing zone."""
        zones = await store_with_zones.async_get_zones()
        if zones:
            zone_id = zones[0][const.ZONE_ID]
            await store_with_zones.async_delete_zone(zone_id)

            # Verify zone was deleted
            remaining_zones = await store_with_zones.async_get_zones()
            zone_ids = [zone[const.ZONE_ID] for zone in remaining_zones]
            assert zone_id not in zone_ids


class TestMappingOperations:
    """Test mapping management operations."""

    @pytest.fixture
    async def store_with_mappings(self, hass):
        """Create store with sample mappings."""
        store = SmartIrrigationStorage(hass)
        await store.async_load()

        # Add sample mappings using correct constants
        mapping1_data = {
            const.MAPPING_NAME: "Test Mapping 1",
            const.MAPPING_DATA: {"source": "sensor"},
        }
        mapping2_data = {
            const.MAPPING_NAME: "Test Mapping 2",
            const.MAPPING_DATA: {"source": "weather_service"},
        }

        await store.async_create_mapping(mapping1_data)
        await store.async_create_mapping(mapping2_data)
        return store

    @pytest.mark.asyncio
    async def test_mappings_basic_operations(self, hass):
        """Test basic mapping operations."""
        store = SmartIrrigationStorage(hass)
        await store.async_load()

        mappings = await store.async_get_mappings()
        assert isinstance(mappings, list)

    @pytest.mark.asyncio
    async def test_async_get_all_mappings(self, store_with_mappings):
        """Test async retrieval of all mappings."""
        mappings = await store_with_mappings.async_get_mappings()
        assert len(mappings) >= 2
        # Should contain our test mappings
        mapping_names = [mapping[const.MAPPING_NAME] for mapping in mappings]
        assert "Test Mapping 1" in mapping_names
        assert "Test Mapping 2" in mapping_names

    @pytest.mark.asyncio
    async def test_async_save_mapping_new(self, hass):
        """Test saving new mapping."""
        store = SmartIrrigationStorage(hass)
        await store.async_load()

        new_mapping = {
            const.MAPPING_NAME: "New Test Mapping",
            const.MAPPING_DATA: {"source": "static"},
        }

        created_mapping = await store.async_create_mapping(new_mapping)
        assert created_mapping[const.MAPPING_NAME] == "New Test Mapping"


class TestModuleOperations:
    """Test module management operations."""

    @pytest.fixture
    async def store_with_modules(self, hass):
        """Create store with sample modules."""
        store = SmartIrrigationStorage(hass)
        await store.async_load()

        # Add sample modules using correct constants
        module1_data = {
            const.MODULE_NAME: "Test Module 1",
            const.MODULE_CONFIG: "static",
            const.MODULE_SCHEMA: "{}",
        }
        module2_data = {
            const.MODULE_NAME: "Test Module 2",
            const.MODULE_CONFIG: "pyeto",
            const.MODULE_SCHEMA: "{}",
        }

        await store.async_create_module(module1_data)
        await store.async_create_module(module2_data)
        return store

    @pytest.mark.asyncio
    async def test_modules_basic_operations(self, hass):
        """Test basic module operations."""
        store = SmartIrrigationStorage(hass)
        await store.async_load()

        modules = await store.async_get_modules()
        assert isinstance(modules, list)

    @pytest.mark.asyncio
    async def test_async_get_all_modules(self, store_with_modules):
        """Test async retrieval of all modules."""
        modules = await store_with_modules.async_get_modules()
        assert len(modules) >= 2
        # Should contain our test modules
        module_names = [module[const.MODULE_NAME] for module in modules]
        assert "Test Module 1" in module_names
        assert "Test Module 2" in module_names

    @pytest.mark.asyncio
    async def test_async_save_module_new(self, hass):
        """Test saving new module."""
        store = SmartIrrigationStorage(hass)
        await store.async_load()

        new_module = {
            const.MODULE_NAME: "New Test Module",
            const.MODULE_CONFIG: "passthrough",
            const.MODULE_SCHEMA: "{}",
        }

        created_module = await store.async_create_module(new_module)
        assert created_module[const.MODULE_NAME] == "New Test Module"


class TestBasicFunctionality:
    """Test basic functionality that doesn't require complex setup."""

    @pytest.mark.asyncio
    async def test_store_data_persistence(self, hass):
        """Test that store data persists across operations."""
        store = SmartIrrigationStorage(hass)
        await store.async_load()

        # Update config
        await store.async_update_config({const.CONF_AUTO_UPDATE_ENABLED: True})

        # Create zone
        zone_data = {
            const.ZONE_NAME: "Persistent Test Zone",
            const.ZONE_SIZE: 100.0,
            const.ZONE_THROUGHPUT: 10.0,
            const.ZONE_STATE: const.ZONE_STATE_AUTOMATIC,
        }
        created_zone = await store.async_create_zone(zone_data)

        # Verify data persistence
        config = await store.async_get_config()
        zones = await store.async_get_zones()

        assert config[const.CONF_AUTO_UPDATE_ENABLED] is True
        assert len(zones) >= 1
        zone_names = [zone[const.ZONE_NAME] for zone in zones]
        assert "Persistent Test Zone" in zone_names

    @pytest.mark.asyncio
    async def test_error_handling(self, hass):
        """Test error handling for invalid operations."""
        store = SmartIrrigationStorage(hass)
        await store.async_load()

        # Test getting non-existent zone
        non_existent_zone = store.get_zone(99999)
        assert non_existent_zone is None

        # Test getting non-existent module
        non_existent_module = store.get_module(99999)
        assert non_existent_module is None
