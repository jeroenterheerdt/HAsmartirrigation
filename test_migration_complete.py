"""Test the complete migration scenario end-to-end."""

import attr
from unittest.mock import Mock
from custom_components.smart_irrigation.store import Config, MigratableStore
from custom_components.smart_irrigation.const import (
    CONF_IRRIGATION_START_TRIGGERS,
    CONF_SKIP_IRRIGATION_ON_PRECIPITATION,
    CONF_PRECIPITATION_THRESHOLD_MM,
    CONF_DEFAULT_IRRIGATION_START_TRIGGERS,
    CONF_DEFAULT_SKIP_IRRIGATION_ON_PRECIPITATION,
    CONF_DEFAULT_PRECIPITATION_THRESHOLD_MM,
)


async def test_migration_end_to_end():
    """Test the complete migration scenario that would cause the original error."""
    
    # Create a mock Home Assistant instance
    hass = Mock()
    
    # Create a MigratableStore instance
    store = MigratableStore(hass, 5, "test_key")
    
    # Test scenario 1: Old config with unrecognized keys (would cause TypeError)
    print("=== Test 1: Config with unrecognized keys ===")
    old_data_v4 = {
        "config": {
            "calctime": "00:00:00",
            "units": "metric",
            "use_weather_service": True,
            "weather_service": "OWM",
            "autocalcenabled": True,
            "autoupdateenabled": True,
            # These are the problematic unrecognized keys
            "old_deprecated_key": "some_value",
            "another_old_key": 123,
            "legacy_setting": {"nested": "value"},
            "removed_feature": False,
        },
        "zones": [],
        "modules": [],
        "mappings": []
    }
    
    # Run migration from version 4 to current
    migrated_data = await store._async_migrate_func(4, old_data_v4.copy())
    
    print(f"Original config keys: {set(old_data_v4['config'].keys())}")
    print(f"Migrated config keys: {set(migrated_data['config'].keys())}")
    
    # Verify the migration added required fields
    assert CONF_IRRIGATION_START_TRIGGERS in migrated_data["config"]
    assert CONF_SKIP_IRRIGATION_ON_PRECIPITATION in migrated_data["config"]
    assert CONF_PRECIPITATION_THRESHOLD_MM in migrated_data["config"]
    print("✓ Required fields added by migration")
    
    # Verify unrecognized keys were removed
    valid_fields = set(attr.fields_dict(Config).keys())
    remaining_keys = set(migrated_data["config"].keys())
    invalid_remaining = remaining_keys - valid_fields
    assert len(invalid_remaining) == 0, f"Invalid keys still present: {invalid_remaining}"
    print("✓ Unrecognized keys removed by migration")
    
    # Test that Config can be created without TypeError
    try:
        config = Config(**migrated_data["config"])
        print("✓ Config created successfully after migration")
    except TypeError as e:
        assert False, f"TypeError still occurred after migration: {e}"
    
    # Test scenario 2: Completely empty config
    print("\n=== Test 2: Empty config ===")
    empty_data = {
        "config": {},
        "zones": [],
        "modules": [],
        "mappings": []
    }
    
    migrated_empty = await store._async_migrate_func(1, empty_data.copy())
    
    # Should have all required fields
    assert CONF_IRRIGATION_START_TRIGGERS in migrated_empty["config"]
    assert CONF_SKIP_IRRIGATION_ON_PRECIPITATION in migrated_empty["config"]
    assert CONF_PRECIPITATION_THRESHOLD_MM in migrated_empty["config"]
    print("✓ Required fields added to empty config")
    
    # Should be able to create Config
    config = Config(**migrated_empty["config"])
    print("✓ Config created from empty migrated data")
    
    # Test scenario 3: Version mismatch beyond current version
    print("\n=== Test 3: Future version (edge case) ===")
    future_data = {
        "config": {
            "calctime": "00:00:00",
            "future_key": "should_be_removed",
            "another_future_setting": 999,
        },
        "zones": [],
        "modules": [],
        "mappings": []
    }
    
    # Test with a future version number
    migrated_future = await store._async_migrate_func(99, future_data.copy())
    
    # Should still work and filter out unrecognized keys
    valid_fields = set(attr.fields_dict(Config).keys())
    remaining_keys = set(migrated_future["config"].keys())
    invalid_remaining = remaining_keys - valid_fields
    assert len(invalid_remaining) == 0, f"Future keys not filtered: {invalid_remaining}"
    print("✓ Future version migration handled correctly")
    
    # Should be able to create Config
    config = Config(**migrated_future["config"])
    print("✓ Config created from future version migration")
    
    print("\n✅ All migration scenarios passed!")


if __name__ == "__main__":
    import asyncio
    asyncio.run(test_migration_end_to_end())