#!/usr/bin/env python3
"""Test script to validate unit system change functionality."""

import logging
import sys
from unittest.mock import AsyncMock, Mock, patch

# Add the custom component to the path
sys.path.insert(0, 'custom_components')

# Configure logging
logging.basicConfig(level=logging.DEBUG, format='%(name)s - %(levelname)s - %(message)s')
_LOGGER = logging.getLogger(__name__)

def test_unit_system_change_handler():
    """Test that the unit system change handler is properly called."""
    _LOGGER.info("Testing unit system change handler...")
    
    try:
        from smart_irrigation import handle_core_config_change
        from homeassistant.util.unit_system import METRIC_SYSTEM, US_CUSTOMARY_SYSTEM
        
        # Create mock hass
        hass = Mock()
        hass.config.units = METRIC_SYSTEM
        hass.data = {
            'smart_irrigation': {
                'coordinator': Mock()
            }
        }
        
        # Create mock coordinator with async methods
        coordinator = hass.data['smart_irrigation']['coordinator']
        coordinator.async_handle_unit_system_change = AsyncMock()
        coordinator._previous_unit_system = US_CUSTOMARY_SYSTEM  # Start with imperial
        
        # Create mock event
        event = Mock()
        
        # Test the handler
        import asyncio
        result = asyncio.run(handle_core_config_change(hass, event))
        
        # Verify the handler was called
        coordinator.async_handle_unit_system_change.assert_called_once()
        _LOGGER.info("✓ Unit system change handler called correctly")
        
        return True
        
    except Exception as e:
        _LOGGER.error("✗ Test failed: %s", e)
        return False

def test_imports():
    """Test that all required imports work."""
    _LOGGER.info("Testing imports...")
    
    try:
        # Test main module imports
        from smart_irrigation import handle_core_config_change, SmartIrrigationCoordinator
        from smart_irrigation.sensor import SmartIrrigationZoneEntity
        
        _LOGGER.info("✓ All imports successful")
        return True
        
    except Exception as e:
        _LOGGER.error("✗ Import test failed: %s", e)
        return False

def main():
    """Run all tests."""
    _LOGGER.info("Starting unit system change tests...")
    
    tests = [
        test_imports,
        test_unit_system_change_handler,
    ]
    
    passed = 0
    failed = 0
    
    for test in tests:
        try:
            if test():
                passed += 1
            else:
                failed += 1
        except Exception as e:
            _LOGGER.error("Test %s failed with exception: %s", test.__name__, e)
            failed += 1
    
    _LOGGER.info("Tests completed: %d passed, %d failed", passed, failed)
    
    if failed > 0:
        sys.exit(1)
    else:
        _LOGGER.info("✓ All tests passed!")

if __name__ == "__main__":
    main()