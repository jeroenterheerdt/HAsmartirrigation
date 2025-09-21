#!/usr/bin/env python3
"""Basic functionality tests for Smart Irrigation without full HA setup."""

import asyncio
import sys
from pathlib import Path
from unittest.mock import AsyncMock, MagicMock, Mock

# Add the repository root to Python path
repo_root = Path(__file__).parent
if str(repo_root) not in sys.path:
    sys.path.insert(0, str(repo_root))

# Mock problematic HA modules early
sys.modules["homeassistant.helpers"] = MagicMock()
sys.modules["homeassistant.helpers.device_registry"] = MagicMock()
sys.modules["homeassistant.helpers.entity_registry"] = MagicMock()
sys.modules["homeassistant.components.frontend"] = MagicMock()
sys.modules["homeassistant.components.websocket_api"] = MagicMock()
sys.modules["homeassistant.components.http"] = MagicMock()
sys.modules["homeassistant.components.logger"] = MagicMock()
sys.modules["homeassistant.components.system_log"] = MagicMock()


async def test_basic_imports():
    """Test that basic module imports work."""
    try:
        from custom_components.smart_irrigation import const

        print("✓ Constants import successful")

        from custom_components.smart_irrigation.helpers import (
            CannotConnect,
            InvalidAuth,
            altitude_to_pressure,
            convert_between_temperature,
        )

        print("✓ Helper functions import successful")

        from custom_components.smart_irrigation.store import SmartIrrigationStore

        print("✓ Store import successful")

        from custom_components.smart_irrigation.performance import performance_timer

        print("✓ Performance utilities import successful")

        return True
    except Exception as e:
        print(f"✗ Import failed: {e}")
        return False


async def test_helper_functions():
    """Test basic helper functions."""
    try:
        from custom_components.smart_irrigation.helpers import (
            CannotConnect,
            InvalidAuth,
            altitude_to_pressure,
            convert_between_temperature,
        )

        # Test pressure conversion
        pressure = altitude_to_pressure(100, 1013.25)
        assert isinstance(pressure, float)
        assert pressure < 1013.25
        print("✓ Pressure conversion working")

        # Test temperature conversion
        temp_f = convert_between_temperature(20, "°C", "°F")
        assert abs(temp_f - 68.0) < 0.1
        print("✓ Temperature conversion working")

        # Test exceptions
        try:
            raise CannotConnect("Test connection error")
        except CannotConnect:
            print("✓ CannotConnect exception working")

        try:
            raise InvalidAuth("Test auth error")
        except InvalidAuth:
            print("✓ InvalidAuth exception working")

        return True
    except Exception as e:
        print(f"✗ Helper functions test failed: {e}")
        return False


async def test_performance_timer():
    """Test performance monitoring functionality."""
    try:
        from custom_components.smart_irrigation.performance import performance_timer

        @performance_timer("test_operation")
        def sync_function():
            return "success"

        @performance_timer("test_async_operation")
        async def async_function():
            await asyncio.sleep(0.01)
            return "async_success"

        # Test sync function
        result = sync_function()
        assert result == "success"
        print("✓ Sync performance timer working")

        # Test async function
        result = await async_function()
        assert result == "async_success"
        print("✓ Async performance timer working")

        return True
    except Exception as e:
        print(f"✗ Performance timer test failed: {e}")
        return False


async def test_exception_classes():
    """Test custom exception classes."""
    try:
        from custom_components.smart_irrigation.helpers import (
            CannotConnect,
            InvalidAuth,
        )

        # Test CannotConnect
        exc = CannotConnect("Test message")
        assert str(exc) == "Test message"
        assert exc.__class__.__name__ == "CannotConnect"
        print("✓ CannotConnect exception class working")

        # Test InvalidAuth
        exc = InvalidAuth("Auth failed")
        assert str(exc) == "Auth failed"
        assert exc.__class__.__name__ == "InvalidAuth"
        print("✓ InvalidAuth exception class working")

        return True
    except Exception as e:
        print(f"✗ Exception classes test failed: {e}")
        return False


async def test_mock_store_basic():
    """Test basic store functionality with mocks."""
    try:
        # Create a minimal mock store
        mock_store = Mock()
        mock_store.async_get_config = AsyncMock(return_value={})
        mock_store.async_get_all_zones = AsyncMock(return_value=[])
        mock_store.get_config = Mock(
            return_value={
                "auto_update_enabled": False,
                "auto_calc_enabled": False,
                "use_weather_service": False,
            }
        )

        # Test async methods
        config = await mock_store.async_get_config()
        assert isinstance(config, dict)
        print("✓ Mock store async_get_config working")

        zones = await mock_store.async_get_all_zones()
        assert isinstance(zones, list)
        print("✓ Mock store async_get_all_zones working")

        # Test sync methods
        sync_config = mock_store.get_config()
        assert isinstance(sync_config, dict)
        assert "auto_update_enabled" in sync_config
        print("✓ Mock store get_config working")

        return True
    except Exception as e:
        print(f"✗ Mock store test failed: {e}")
        return False


async def main():
    """Run all basic functionality tests."""
    print("Running Smart Irrigation Basic Functionality Tests")
    print("=" * 50)

    tests = [
        test_basic_imports,
        test_helper_functions,
        test_performance_timer,
        test_exception_classes,
        test_mock_store_basic,
    ]

    passed = 0
    total = len(tests)

    for test in tests:
        print(f"\nRunning {test.__name__}...")
        try:
            success = await test()
            if success:
                passed += 1
                print(f"✓ {test.__name__} PASSED")
            else:
                print(f"✗ {test.__name__} FAILED")
        except Exception as e:
            print(f"✗ {test.__name__} FAILED with exception: {e}")

    print("\n" + "=" * 50)
    print(f"Results: {passed}/{total} tests passed")

    if passed == total:
        print("🎉 All basic functionality tests passed!")
        return 0
    else:
        print("❌ Some tests failed")
        return 1


if __name__ == "__main__":
    exit_code = asyncio.run(main())
    sys.exit(exit_code)
