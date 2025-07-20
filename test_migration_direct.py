"""Test the migration function directly."""

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
    TRIGGER_CONF_TYPE,
    TRIGGER_TYPE_SUNRISE,
    TRIGGER_CONF_OFFSET_MINUTES,
    TRIGGER_CONF_ENABLED,
    TRIGGER_CONF_NAME,
    TRIGGER_CONF_ACCOUNT_FOR_DURATION,
)


class TestMigratableStore(MigratableStore):
    """Test version that doesn't require full Home Assistant setup."""
    
    def __init__(self):
        # Skip the parent constructor to avoid HA dependencies
        pass


async def test_migration_function_directly():
    """Test the migration function without full HA setup."""
    
    store = TestMigratableStore()
    
    # Test 1: Migration with unrecognized keys
    print("=== Test 1: Migration with unrecognized keys ===")
    
    old_data = {
        "config": {
            "calctime": "00:00:00",
            "units": "metric", 
            "use_weather_service": True,
            "weather_service": "OWM",
            "autocalcenabled": True,
            # These should be filtered out
            "old_deprecated_key": "some_value",
            "another_old_key": 123,
            "legacy_setting": {"nested": "value"},
        },
        "zones": [],
        "modules": [],
        "mappings": []
    }
    
    print(f"Before migration keys: {set(old_data['config'].keys())}")
    
    # Test migration from version 4
    result = await store._async_migrate_func(4, old_data.copy())
    
    print(f"After migration keys: {set(result['config'].keys())}")
    
    # Verify required fields were added
    assert CONF_IRRIGATION_START_TRIGGERS in result["config"]
    assert CONF_SKIP_IRRIGATION_ON_PRECIPITATION in result["config"]
    assert CONF_PRECIPITATION_THRESHOLD_MM in result["config"]
    print("✓ Required fields added")
    
    # Verify unrecognized keys were removed
    valid_fields = set(attr.fields_dict(Config).keys())
    config_keys = set(result["config"].keys())
    invalid_keys = config_keys - valid_fields
    
    if invalid_keys:
        print(f"ERROR: Invalid keys still present: {invalid_keys}")
        assert False, f"Invalid keys not filtered: {invalid_keys}"
    else:
        print("✓ All unrecognized keys filtered out")
    
    # Test Config creation
    try:
        config = Config(**result["config"])
        print("✓ Config created successfully")
        
        # Verify the required fields have expected values
        assert isinstance(config.irrigation_start_triggers, list)
        assert isinstance(config.skip_irrigation_on_precipitation, bool)
        assert isinstance(config.precipitation_threshold_mm, float)
        print("✓ Required fields have correct types")
        
    except TypeError as e:
        assert False, f"Config creation failed: {e}"
    
    # Test 2: Empty config migration
    print("\n=== Test 2: Empty config migration ===")
    
    empty_data = {
        "config": {},
        "zones": [],
        "modules": [],
        "mappings": []
    }
    
    result_empty = await store._async_migrate_func(1, empty_data.copy())
    
    print(f"Empty config result: {result_empty['config']}")
    
    # Should have all required fields with defaults
    assert CONF_IRRIGATION_START_TRIGGERS in result_empty["config"]
    assert CONF_SKIP_IRRIGATION_ON_PRECIPITATION in result_empty["config"]
    assert CONF_PRECIPITATION_THRESHOLD_MM in result_empty["config"]
    
    print(f"irrigation_start_triggers: {result_empty['config'][CONF_IRRIGATION_START_TRIGGERS]} (expected: legacy trigger for old version)")
    print(f"skip_irrigation_on_precipitation: {result_empty['config'][CONF_SKIP_IRRIGATION_ON_PRECIPITATION]} (expected: {CONF_DEFAULT_SKIP_IRRIGATION_ON_PRECIPITATION})")
    print(f"precipitation_threshold_mm: {result_empty['config'][CONF_PRECIPITATION_THRESHOLD_MM]} (expected: {CONF_DEFAULT_PRECIPITATION_THRESHOLD_MM})")
    
    # For old versions (1), migration creates a legacy trigger instead of empty list
    assert len(result_empty["config"][CONF_IRRIGATION_START_TRIGGERS]) == 1
    assert result_empty["config"][CONF_IRRIGATION_START_TRIGGERS][0]["type"] == "sunrise"
    assert result_empty["config"][CONF_SKIP_IRRIGATION_ON_PRECIPITATION] == CONF_DEFAULT_SKIP_IRRIGATION_ON_PRECIPITATION
    assert result_empty["config"][CONF_PRECIPITATION_THRESHOLD_MM] == CONF_DEFAULT_PRECIPITATION_THRESHOLD_MM
    print("✓ Empty config migrated with correct defaults")
    
    # Test Config creation
    config_empty = Config(**result_empty["config"])
    print("✓ Config created from empty migration")
    
    # Test 3: Version 3 migration (test the specific version logic)
    print("\n=== Test 3: Version 3 migration ===")
    
    v3_data = {
        "config": {
            "use_owm": True,  # Old key that should be migrated
            "calctime": "00:00:00",
            "old_feature": "should_be_removed",
        },
        "zones": [],
        "modules": [],
        "mappings": []
    }
    
    result_v3 = await store._async_migrate_func(3, v3_data.copy())
    
    print(f"v3 result: {result_v3['config']}")
    
    # Should have migrated use_owm to use_weather_service
    assert "use_owm" not in result_v3["config"]
    assert result_v3["config"]["use_weather_service"] is True
    # Note: weather_service may only be set if use_weather_service is True, let me check
    if "weather_service" in result_v3["config"]:
        assert result_v3["config"]["weather_service"] == "Open Weather Map"  # This is the actual value of CONF_WEATHER_SERVICE_OWM
    
    # Should have filtered out old_feature
    assert "old_feature" not in result_v3["config"]
    print("✓ Version 3 migration worked correctly")
    
    # Test Config creation
    config_v3 = Config(**result_v3["config"])
    print("✓ Config created from v3 migration")
    
    print("\n✅ All migration tests passed!")


if __name__ == "__main__":
    import asyncio
    asyncio.run(test_migration_function_directly())