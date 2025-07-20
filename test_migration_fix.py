"""Test cases for storage migration fix to ensure TypeErrors are prevented."""

import pytest
import tempfile
import json
from unittest.mock import Mock, patch, AsyncMock
from homeassistant.core import HomeAssistant
from homeassistant.util.unit_system import METRIC_SYSTEM

from custom_components.smart_irrigation.store import SmartIrrigationStorage, MigratableStore, STORAGE_VERSION
from custom_components.smart_irrigation.const import (
    CONF_IRRIGATION_START_TRIGGERS,
    CONF_SKIP_IRRIGATION_ON_PRECIPITATION,
    CONF_PRECIPITATION_THRESHOLD_MM,
    CONF_DEFAULT_IRRIGATION_START_TRIGGERS,
    CONF_DEFAULT_SKIP_IRRIGATION_ON_PRECIPITATION,
    CONF_DEFAULT_PRECIPITATION_THRESHOLD_MM,
)


@pytest.mark.asyncio


class TestStorageMigrationFix:
    """Test the storage migration fix to prevent TypeErrors."""

    @pytest.fixture
    def hass(self):
        """Mock Home Assistant instance."""
        hass = Mock(spec=HomeAssistant)
        hass.config = Mock()
        hass.config.units = METRIC_SYSTEM
        hass.config.language = "en"
        hass.async_add_executor_job = Mock()
        return hass

    async def test_migration_with_unrecognized_keys(self, hass):
        """Test that migration strips unrecognized keys to prevent TypeError."""
        # Create test data with unrecognized keys that would cause TypeError
        old_data = {
            "config": {
                "calctime": "00:00:00",
                "units": "metric",
                "use_weather_service": True,
                "weather_service": "OWM",
                # These are valid keys
                "autocalcenabled": True,
                "autoupdateenabled": True,
                # These are unrecognized keys that could exist in old configs
                "old_deprecated_key": "some_value",
                "another_old_key": 123,
                "unrecognized_bool": False,
                "legacy_setting": {"nested": "value"},
            },
            "zones": [],
            "modules": [],
            "mappings": []
        }

        storage = SmartIrrigationStorage(hass)
        
        # Mock the store's async_load to return our test data
        with patch.object(storage._store, 'async_load', return_value=old_data):
            # This should not raise a TypeError
            await storage.async_load()
            
            # Verify that the required fields are present
            assert hasattr(storage.config, 'irrigation_start_triggers')
            assert hasattr(storage.config, 'skip_irrigation_on_precipitation')
            assert hasattr(storage.config, 'precipitation_threshold_mm')
            
            # Verify default values are set
            if storage.config.irrigation_start_triggers is None:
                assert storage.config.irrigation_start_triggers == CONF_DEFAULT_IRRIGATION_START_TRIGGERS

    async def test_migration_missing_required_fields(self, hass):
        """Test that migration adds missing required fields with defaults."""
        # Create test data missing required fields
        old_data = {
            "config": {
                "calctime": "00:00:00",
                "units": "metric",
                "use_weather_service": True,
                "weather_service": "OWM",
                # Missing: irrigation_start_triggers, skip_irrigation_on_precipitation, precipitation_threshold_mm
            },
            "zones": [],
            "modules": [],
            "mappings": []
        }

        storage = SmartIrrigationStorage(hass)
        
        with patch.object(storage._store, 'async_load', return_value=old_data):
            await storage.async_load()
            
            # Verify that missing required fields are added with defaults
            config_dict = storage.get_config()
            assert CONF_IRRIGATION_START_TRIGGERS in config_dict
            assert CONF_SKIP_IRRIGATION_ON_PRECIPITATION in config_dict
            assert CONF_PRECIPITATION_THRESHOLD_MM in config_dict

    async def test_migration_version_mismatch_always_runs(self, hass):
        """Test that migration runs for any version mismatch."""
        # Test with various old versions to ensure migration always runs
        test_versions = [1, 2, 3, 4, 99]  # Including a future version
        
        for old_version in test_versions:
            old_data = {
                "config": {
                    "calctime": "00:00:00",
                    "units": "metric",
                    "unrecognized_key": "should_be_stripped",
                },
                "zones": [],
                "modules": [],
                "mappings": []
            }

            migrator = MigratableStore(hass, STORAGE_VERSION, "test_key")
            
            # Test that migration doesn't fail regardless of version
            result = await migrator._async_migrate_func(old_version, old_data.copy())
            
            # Migration should succeed and return data
            assert result is not None
            assert "config" in result

    async def test_empty_config_migration(self, hass):
        """Test migration with completely empty config."""
        old_data = {
            "config": {},
            "zones": [],
            "modules": [],
            "mappings": []
        }

        storage = SmartIrrigationStorage(hass)
        
        with patch.object(storage._store, 'async_load', return_value=old_data):
            # Should not raise any errors
            await storage.async_load()
            
            # Should have defaults for all required fields
            config_dict = storage.get_config()
            assert CONF_IRRIGATION_START_TRIGGERS in config_dict
            assert CONF_SKIP_IRRIGATION_ON_PRECIPITATION in config_dict
            assert CONF_PRECIPITATION_THRESHOLD_MM in config_dict


if __name__ == "__main__":
    pytest.main([__file__])