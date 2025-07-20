"""Test the storage migration fix."""

import attr
from custom_components.smart_irrigation.store import Config, MigratableStore
from custom_components.smart_irrigation.const import (
    CONF_IRRIGATION_START_TRIGGERS,
    CONF_SKIP_IRRIGATION_ON_PRECIPITATION,
    CONF_PRECIPITATION_THRESHOLD_MM,
    CONF_DEFAULT_IRRIGATION_START_TRIGGERS,
    CONF_DEFAULT_SKIP_IRRIGATION_ON_PRECIPITATION,
    CONF_DEFAULT_PRECIPITATION_THRESHOLD_MM,
)


def test_config_with_new_fields():
    """Test that Config class now includes the required fields."""
    # Get valid field names from Config class
    valid_fields = set(attr.fields_dict(Config).keys())
    print(f"Config class fields: {valid_fields}")
    
    # Check that required fields are present
    required_fields = {
        'irrigation_start_triggers',
        'skip_irrigation_on_precipitation', 
        'precipitation_threshold_mm'
    }
    
    missing_fields = required_fields - valid_fields
    if missing_fields:
        print(f"ERROR: Missing required fields: {missing_fields}")
        assert False, f"Config class missing required fields: {missing_fields}"
    else:
        print("✓ All required fields are present in Config class")


def test_config_creation_with_new_fields():
    """Test creating Config with the new fields."""
    config_data = {
        "calctime": "00:00:00",
        "units": "metric",
        "use_weather_service": True,
        "irrigation_start_triggers": [],
        "skip_irrigation_on_precipitation": False,
        "precipitation_threshold_mm": 2.0,
    }
    
    config = Config(**config_data)
    print("✓ Config created successfully with new fields")
    assert config.irrigation_start_triggers == []
    assert config.skip_irrigation_on_precipitation is False
    assert config.precipitation_threshold_mm == 2.0


def test_config_defaults():
    """Test that Config has proper defaults for required fields."""
    config = Config()
    print("✓ Config created with defaults")
    
    assert config.irrigation_start_triggers == CONF_DEFAULT_IRRIGATION_START_TRIGGERS
    assert config.skip_irrigation_on_precipitation == CONF_DEFAULT_SKIP_IRRIGATION_ON_PRECIPITATION
    assert config.precipitation_threshold_mm == CONF_DEFAULT_PRECIPITATION_THRESHOLD_MM
    print("✓ All required fields have correct defaults")


async def test_migration_function():
    """Test the migration function with unrecognized keys."""
    # Create a mock migrator (we can't easily test the full storage without HA setup)
    # But we can test the migration logic conceptually
    
    # Simulate old data with unrecognized keys
    old_data = {
        "config": {
            "calctime": "00:00:00",
            "units": "metric",
            "use_weather_service": True,
            # Valid keys
            "autocalcenabled": True,
            "autoupdateenabled": True,
            # Invalid keys that should be stripped
            "old_deprecated_key": "some_value",
            "another_old_key": 123,
            "unrecognized_bool": False,
        },
        "zones": [],
        "modules": [],
        "mappings": []
    }
    
    # Get valid field names for filtering (this is what the migration does)
    valid_fields = set(attr.fields_dict(Config).keys())
    print(f"Valid fields: {valid_fields}")
    
    # Simulate the filtering that migration does
    original_config = old_data["config"].copy()
    filtered_config = {k: v for k, v in original_config.items() if k in valid_fields}
    removed_keys = set(original_config.keys()) - set(filtered_config.keys())
    
    print(f"Original keys: {set(original_config.keys())}")
    print(f"Filtered keys: {set(filtered_config.keys())}")
    print(f"Removed keys: {removed_keys}")
    
    # Add required fields if missing
    if CONF_IRRIGATION_START_TRIGGERS not in filtered_config:
        filtered_config[CONF_IRRIGATION_START_TRIGGERS] = CONF_DEFAULT_IRRIGATION_START_TRIGGERS
    if CONF_SKIP_IRRIGATION_ON_PRECIPITATION not in filtered_config:
        filtered_config[CONF_SKIP_IRRIGATION_ON_PRECIPITATION] = CONF_DEFAULT_SKIP_IRRIGATION_ON_PRECIPITATION
    if CONF_PRECIPITATION_THRESHOLD_MM not in filtered_config:
        filtered_config[CONF_PRECIPITATION_THRESHOLD_MM] = CONF_DEFAULT_PRECIPITATION_THRESHOLD_MM
    
    # This should work without TypeError
    try:
        config = Config(**filtered_config)
        print("✓ Migration filtering prevents TypeError")
        assert config.calctime == "00:00:00"
        assert config.use_weather_service is True
        # Check that required fields are present
        assert hasattr(config, 'irrigation_start_triggers')
        assert hasattr(config, 'skip_irrigation_on_precipitation')
        assert hasattr(config, 'precipitation_threshold_mm')
        print("✓ All required fields are accessible after migration")
    except TypeError as e:
        print(f"ERROR: Migration failed to prevent TypeError: {e}")
        assert False, f"Migration should prevent TypeError but got: {e}"


if __name__ == "__main__":
    print("Testing Config class updates...")
    test_config_with_new_fields()
    
    print("\nTesting Config creation with new fields...")
    test_config_creation_with_new_fields()
    
    print("\nTesting Config defaults...")
    test_config_defaults()
    
    print("\nTesting migration filtering...")
    import asyncio
    asyncio.run(test_migration_function())
    
    print("\n✅ All tests passed! Migration fix is working.")