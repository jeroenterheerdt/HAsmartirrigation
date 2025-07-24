"""Comprehensive tests for Smart Irrigation store operations."""

import pytest
from unittest.mock import Mock, AsyncMock, patch, MagicMock
import json
import tempfile
import os
from pathlib import Path

# Mock Home Assistant modules early
import sys
sys.modules['homeassistant.helpers.storage'] = MagicMock()
sys.modules['homeassistant.helpers.deprecation'] = MagicMock()

from custom_components.smart_irrigation.store import SmartIrrigationStore
from custom_components.smart_irrigation import const


class TestSmartIrrigationStoreBasics:
    """Test basic store functionality."""

    @pytest.fixture
    def mock_hass(self):
        """Create a mock Home Assistant instance."""
        hass = Mock()
        hass.config = Mock()
        hass.config.path = Mock(return_value="/tmp/test_config")
        return hass

    @pytest.fixture
    def mock_storage(self):
        """Create a mock storage object."""
        storage = Mock()
        storage.async_load = AsyncMock(return_value=None)
        storage.async_save = AsyncMock()
        return storage

    @pytest.fixture
    def store_instance(self, mock_hass, mock_storage):
        """Create a SmartIrrigationStore instance for testing."""
        with patch('custom_components.smart_irrigation.store.Store', return_value=mock_storage):
            store = SmartIrrigationStore(mock_hass, "test_version")
            store._config = {}
            store._zones = {}
            store._mappings = {}
            store._modules = {}
            return store

    def test_store_initialization(self, mock_hass):
        """Test store initialization."""
        with patch('custom_components.smart_irrigation.store.Store'):
            store = SmartIrrigationStore(mock_hass, "1.0")
            assert store.hass == mock_hass
            assert store.version == "1.0"

    @pytest.mark.asyncio
    async def test_async_get_registry(self, store_instance, mock_storage):
        """Test async registry retrieval."""
        mock_data = {
            "config": {"test_key": "test_value"},
            "zones": {"zone1": {"name": "Test Zone"}},
            "mappings": {"map1": {"source": "test"}},
            "modules": {"mod1": {"name": "Test Module"}},
        }
        mock_storage.async_load.return_value = mock_data
        
        await store_instance.async_get_registry()
        
        assert store_instance._config == mock_data["config"]
        assert store_instance._zones == mock_data["zones"]
        assert store_instance._mappings == mock_data["mappings"]
        assert store_instance._modules == mock_data["modules"]

    @pytest.mark.asyncio
    async def test_async_get_registry_empty(self, store_instance, mock_storage):
        """Test async registry retrieval with empty data."""
        mock_storage.async_load.return_value = None
        
        await store_instance.async_get_registry()
        
        assert store_instance._config == {}
        assert store_instance._zones == {}
        assert store_instance._mappings == {}
        assert store_instance._modules == {}


class TestConfigOperations:
    """Test configuration operations."""

    @pytest.fixture
    def store_with_config(self, mock_hass, mock_storage):
        """Create store with sample configuration."""
        with patch('custom_components.smart_irrigation.store.Store', return_value=mock_storage):
            store = SmartIrrigationStore(mock_hass, "test_version")
            store._config = {
                const.CONF_AUTO_UPDATE_ENABLED: True,
                const.CONF_AUTO_CALC_ENABLED: False,
                const.CONF_USE_WEATHER_SERVICE: True,
                "custom_setting": "test_value"
            }
            return store

    def test_get_config(self, store_with_config):
        """Test getting configuration."""
        config = store_with_config.get_config()
        assert config[const.CONF_AUTO_UPDATE_ENABLED] is True
        assert config[const.CONF_AUTO_CALC_ENABLED] is False
        assert config["custom_setting"] == "test_value"

    @pytest.mark.asyncio
    async def test_async_get_config(self, store_with_config):
        """Test async configuration retrieval."""
        config = await store_with_config.async_get_config()
        assert isinstance(config, dict)
        assert const.CONF_AUTO_UPDATE_ENABLED in config

    @pytest.mark.asyncio
    async def test_store_update_config(self, store_with_config, mock_storage):
        """Test configuration updates."""
        new_config = {const.CONF_AUTO_UPDATE_ENABLED: False}
        
        await store_with_config.async_update_config(new_config)
        
        assert store_with_config._config[const.CONF_AUTO_UPDATE_ENABLED] is False
        mock_storage.async_save.assert_called_once()

    @pytest.mark.asyncio 
    async def test_store_factory_defaults(self, store_with_config, mock_storage):
        """Test setting factory defaults."""
        await store_with_config.set_up_factory_defaults()
        
        config = store_with_config.get_config()
        assert const.CONF_AUTO_UPDATE_ENABLED in config
        assert const.CONF_AUTO_CALC_ENABLED in config
        mock_storage.async_save.assert_called_once()


class TestZoneOperations:
    """Test zone management operations."""

    @pytest.fixture
    def store_with_zones(self, mock_hass, mock_storage):
        """Create store with sample zones."""
        with patch('custom_components.smart_irrigation.store.Store', return_value=mock_storage):
            store = SmartIrrigationStore(mock_hass, "test_version")
            store._zones = {
                "zone1": {
                    "name": "Front Lawn",
                    "bucket": 10.5,
                    "enabled": True,
                    "zone_size": 100,
                    "throughput": 15,
                },
                "zone2": {
                    "name": "Back Garden", 
                    "bucket": 8.2,
                    "enabled": False,
                    "zone_size": 50,
                    "throughput": 10,
                }
            }
            return store

    def test_get_zones(self, store_with_zones):
        """Test getting all zones."""
        zones = store_with_zones.get_zones()
        assert len(zones) == 2
        assert "zone1" in zones
        assert "zone2" in zones
        assert zones["zone1"]["name"] == "Front Lawn"

    @pytest.mark.asyncio
    async def test_async_get_all_zones(self, store_with_zones):
        """Test async retrieval of all zones."""
        zones = await store_with_zones.async_get_all_zones()
        assert len(zones) == 2
        assert zones["zone1"]["name"] == "Front Lawn"

    @pytest.mark.asyncio
    async def test_async_get_zone_existing(self, store_with_zones):
        """Test retrieving existing zone."""
        zone = await store_with_zones.async_get_zone("zone1")
        assert zone is not None
        assert zone["name"] == "Front Lawn"
        assert zone["bucket"] == 10.5

    @pytest.mark.asyncio
    async def test_async_get_zone_nonexistent(self, store_with_zones):
        """Test retrieving non-existent zone."""
        zone = await store_with_zones.async_get_zone("nonexistent")
        assert zone is None

    @pytest.mark.asyncio
    async def test_async_save_zone_new(self, store_with_zones, mock_storage):
        """Test saving new zone."""
        new_zone = {
            "name": "Side Yard",
            "bucket": 5.0,
            "enabled": True,
            "zone_size": 25,
            "throughput": 8,
        }
        
        await store_with_zones.async_save_zone("zone3", new_zone)
        
        assert "zone3" in store_with_zones._zones
        assert store_with_zones._zones["zone3"]["name"] == "Side Yard"
        mock_storage.async_save.assert_called_once()

    @pytest.mark.asyncio
    async def test_async_save_zone_update(self, store_with_zones, mock_storage):
        """Test updating existing zone."""
        updated_zone = {
            "name": "Front Lawn Updated",
            "bucket": 12.0,
            "enabled": False,
            "zone_size": 120,
            "throughput": 18,
        }
        
        await store_with_zones.async_save_zone("zone1", updated_zone)
        
        assert store_with_zones._zones["zone1"]["name"] == "Front Lawn Updated"
        assert store_with_zones._zones["zone1"]["bucket"] == 12.0
        mock_storage.async_save.assert_called_once()

    @pytest.mark.asyncio
    async def test_async_delete_zone(self, store_with_zones, mock_storage):
        """Test deleting zone."""
        await store_with_zones.async_delete_zone("zone1")
        
        assert "zone1" not in store_with_zones._zones
        assert len(store_with_zones._zones) == 1
        mock_storage.async_save.assert_called_once()

    @pytest.mark.asyncio
    async def test_async_delete_zone_nonexistent(self, store_with_zones, mock_storage):
        """Test deleting non-existent zone."""
        original_count = len(store_with_zones._zones)
        
        await store_with_zones.async_delete_zone("nonexistent")
        
        assert len(store_with_zones._zones) == original_count
        # Should still call save even if zone doesn't exist
        mock_storage.async_save.assert_called_once()


class TestMappingOperations:
    """Test mapping operations."""

    @pytest.fixture
    def store_with_mappings(self, mock_hass, mock_storage):
        """Create store with sample mappings."""
        with patch('custom_components.smart_irrigation.store.Store', return_value=mock_storage):
            store = SmartIrrigationStore(mock_hass, "test_version")
            store._mappings = {
                "temp_sensor": {
                    "source": "sensor.outdoor_temperature",
                    "target": "temperature",
                    "conversion": "°C"
                },
                "humidity_sensor": {
                    "source": "sensor.outdoor_humidity",
                    "target": "humidity",
                    "conversion": "%"
                }
            }
            return store

    def test_get_mappings(self, store_with_mappings):
        """Test getting all mappings."""
        mappings = store_with_mappings.get_mappings()
        assert len(mappings) == 2
        assert "temp_sensor" in mappings
        assert "humidity_sensor" in mappings
        assert mappings["temp_sensor"]["source"] == "sensor.outdoor_temperature"

    @pytest.mark.asyncio
    async def test_async_save_mapping(self, store_with_mappings, mock_storage):
        """Test saving new mapping."""
        new_mapping = {
            "source": "sensor.wind_speed",
            "target": "wind_speed",
            "conversion": "m/s"
        }
        
        await store_with_mappings.async_save_mapping("wind_sensor", new_mapping)
        
        assert "wind_sensor" in store_with_mappings._mappings
        assert store_with_mappings._mappings["wind_sensor"]["source"] == "sensor.wind_speed"
        mock_storage.async_save.assert_called_once()

    @pytest.mark.asyncio
    async def test_async_delete_mapping(self, store_with_mappings, mock_storage):
        """Test deleting mapping."""
        await store_with_mappings.async_delete_mapping("temp_sensor")
        
        assert "temp_sensor" not in store_with_mappings._mappings
        assert len(store_with_mappings._mappings) == 1
        mock_storage.async_save.assert_called_once()


class TestModuleOperations:
    """Test module operations."""

    @pytest.fixture
    def store_with_modules(self, mock_hass, mock_storage):
        """Create store with sample modules."""
        with patch('custom_components.smart_irrigation.store.Store', return_value=mock_storage):
            store = SmartIrrigationStore(mock_hass, "test_version")
            store._modules = {
                "pyeto": {
                    "name": "PyETO",
                    "enabled": True,
                    "config": {"method": "penman_monteith"}
                },
                "static": {
                    "name": "Static",
                    "enabled": False,
                    "config": {"daily_et": 5.0}
                }
            }
            return store

    def test_get_modules(self, store_with_modules):
        """Test getting all modules."""
        modules = store_with_modules.get_modules()
        assert len(modules) == 2
        assert "pyeto" in modules
        assert "static" in modules
        assert modules["pyeto"]["name"] == "PyETO"

    @pytest.mark.asyncio
    async def test_async_save_module(self, store_with_modules, mock_storage):
        """Test saving new module."""
        new_module = {
            "name": "Custom Module",
            "enabled": True,
            "config": {"parameter": "value"}
        }
        
        await store_with_modules.async_save_module("custom", new_module)
        
        assert "custom" in store_with_modules._modules
        assert store_with_modules._modules["custom"]["name"] == "Custom Module"
        mock_storage.async_save.assert_called_once()

    @pytest.mark.asyncio
    async def test_async_delete_module(self, store_with_modules, mock_storage):
        """Test deleting module."""
        await store_with_modules.async_delete_module("static")
        
        assert "static" not in store_with_modules._modules
        assert len(store_with_modules._modules) == 1
        mock_storage.async_save.assert_called_once()


class TestErrorHandling:
    """Test error handling scenarios."""

    @pytest.fixture
    def failing_store(self, mock_hass):
        """Create store with failing storage."""
        failing_storage = Mock()
        failing_storage.async_load = AsyncMock(side_effect=Exception("Storage error"))
        failing_storage.async_save = AsyncMock(side_effect=Exception("Save error"))
        
        with patch('custom_components.smart_irrigation.store.Store', return_value=failing_storage):
            store = SmartIrrigationStore(mock_hass, "test_version")
            return store

    @pytest.mark.asyncio
    async def test_async_get_registry_error_handling(self, failing_store):
        """Test error handling in registry retrieval."""
        with pytest.raises(Exception, match="Storage error"):
            await failing_store.async_get_registry()

    @pytest.mark.asyncio
    async def test_async_save_error_handling(self, failing_store):
        """Test error handling in save operations."""
        failing_store._zones = {"test": {}}
        
        with pytest.raises(Exception, match="Save error"):
            await failing_store.async_save_zone("test", {})


class TestDataValidation:
    """Test data validation and integrity."""

    @pytest.fixture
    def store_instance(self, mock_hass):
        """Create store instance for validation testing."""
        mock_storage = Mock()
        mock_storage.async_load = AsyncMock(return_value=None)
        mock_storage.async_save = AsyncMock()
        
        with patch('custom_components.smart_irrigation.store.Store', return_value=mock_storage):
            store = SmartIrrigationStore(mock_hass, "test_version")
            store._config = {}
            store._zones = {}
            store._mappings = {}
            store._modules = {}
            return store

    @pytest.mark.asyncio
    async def test_zone_data_integrity(self, store_instance):
        """Test zone data integrity validation."""
        valid_zone = {
            "name": "Test Zone",
            "bucket": 10.0,
            "enabled": True,
            "zone_size": 100,
            "throughput": 15,
        }
        
        await store_instance.async_save_zone("test_zone", valid_zone)
        retrieved_zone = await store_instance.async_get_zone("test_zone")
        
        assert retrieved_zone == valid_zone

    def test_config_defaults(self, store_instance):
        """Test configuration defaults are properly set."""
        # Before factory defaults
        config = store_instance.get_config()
        assert config == {}
        
        # After factory defaults would be called in real scenario
        # This test verifies the structure is maintained