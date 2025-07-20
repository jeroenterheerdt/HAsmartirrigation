"""Simple test to demonstrate the TypeError issue and verify the fix."""

import attr
from custom_components.smart_irrigation.store import Config


def test_config_creation_with_unrecognized_keys():
    """Test that demonstrates the TypeError with unrecognized keys."""
    # This is what happens when the store loads config with unrecognized keys
    config_data = {
        "calctime": "00:00:00",
        "units": "metric",
        "use_weather_service": True,
        "weather_service": "OWM",
        # These are unrecognized keys that would cause TypeError
        "old_deprecated_key": "some_value",
        "another_old_key": 123,
        "unrecognized_bool": False,
    }
    
    # This should raise TypeError due to unexpected keyword arguments
    try:
        config = Config(**config_data)
        print("ERROR: Config creation should have failed with TypeError!")
        assert False, "Expected TypeError was not raised"
    except TypeError as e:
        print(f"Expected TypeError occurred: {e}")
        assert "unexpected keyword argument" in str(e)


def test_config_creation_missing_required_fields():
    """Test that config creation works with missing fields when defaults are provided."""
    # This represents old config data missing newer required fields
    config_data = {
        "calctime": "00:00:00",
        "units": "metric",
        "use_weather_service": True,
        # Missing: irrigation_start_triggers, skip_irrigation_on_precipitation, precipitation_threshold_mm
    }
    
    # This should work fine since Config class has defaults
    config = Config(**config_data)
    print("Config created successfully with missing fields")
    assert config.calctime == "00:00:00"


def test_config_field_filtering():
    """Test filtering config data to only include recognized fields."""
    # Simulate the fix: filter out unrecognized keys
    config_data = {
        "calctime": "00:00:00",
        "units": "metric",
        "use_weather_service": True,
        "weather_service": "OWM",
        # These should be filtered out
        "old_deprecated_key": "some_value",
        "another_old_key": 123,
        "unrecognized_bool": False,
    }
    
    # Get valid field names from Config class
    valid_fields = set(attr.fields_dict(Config).keys())
    print(f"Valid Config fields: {valid_fields}")
    
    # Filter to only include recognized fields
    filtered_config = {k: v for k, v in config_data.items() if k in valid_fields}
    print(f"Filtered config: {filtered_config}")
    
    # This should work without TypeError
    config = Config(**filtered_config)
    print("Config created successfully with filtered data")
    assert config.calctime == "00:00:00"
    assert config.use_weather_service is True


if __name__ == "__main__":
    print("Testing current TypeError issue...")
    test_config_creation_with_unrecognized_keys()
    
    print("\nTesting config with missing fields...")
    test_config_creation_missing_required_fields()
    
    print("\nTesting field filtering solution...")
    test_config_field_filtering()
    
    print("\nAll tests passed!")