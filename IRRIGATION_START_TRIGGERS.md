# Irrigation Start Triggers - Feature Documentation

This document describes the enhanced irrigation start trigger functionality added to the Smart Irrigation component.

## Overview

The Smart Irrigation component now supports multiple user-configurable triggers for determining when irrigation should start, instead of only the previous fixed method (total duration before sunrise).

## Features

### Trigger Types

1. **Sunrise Triggers**
   - Start irrigation relative to sunrise time
   - Configure offset in minutes (negative = before sunrise, positive = after sunrise)
   - Set offset to 0 for automatic timing (starts early enough to complete all zones before sunrise - maintains backward compatibility)

2. **Sunset Triggers**
   - Start irrigation relative to sunset time
   - Configure offset in minutes (negative = before sunset, positive = after sunset)
   - Useful for evening watering schedules

3. **Solar Azimuth Triggers**
   - Start irrigation when the sun reaches a specific compass direction
   - Configure azimuth angle (0°=North, 90°=East, 180°=South, 270°=West)
   - Configure offset in minutes relative to when sun reaches that position
   - Useful for timing irrigation based on sun position for optimal plant watering

### Configuration Options

Each trigger can be configured with:
- **Name**: Descriptive name for the trigger
- **Type**: Sunrise, Sunset, or Solar Azimuth
- **Enabled/Disabled**: Individual triggers can be turned on/off
- **Offset**: Minutes before (-) or after (+) the solar event
- **Azimuth Angle**: For solar azimuth triggers, the compass direction in degrees

### Multiple Triggers

- Users can configure multiple triggers simultaneously
- Each enabled trigger will independently schedule irrigation starts
- Triggers can be mixed (e.g., one sunrise trigger + one sunset trigger)
- Triggers can be individually enabled/disabled without deletion

## User Interface

### General Settings Tab

The irrigation start triggers are configured in the **General** tab of the Smart Irrigation panel:

1. **Triggers Card**: Shows all configured triggers with their status
2. **Add Trigger Button**: Opens dialog to create a new trigger
3. **Edit/Delete Actions**: Each trigger has edit and delete buttons

### Trigger Dialog

The trigger configuration dialog provides:
- Form fields for all trigger properties
- Validation for required fields and value ranges
- Context-sensitive fields (azimuth angle only shows for solar azimuth triggers)
- Help text explaining each field

## Backward Compatibility

### Automatic Migration

When upgrading from previous versions:
- Existing installations without triggers will automatically get a "Sunrise (Legacy)" trigger
- This trigger uses sunrise with 0 offset (auto-calculated duration)
- This maintains the exact same behavior as before the enhancement

### Configuration Storage

- New configuration is stored in the `irrigation_start_triggers` field
- Old installations continue to work without modification
- Storage version is incremented to handle migration

## Technical Implementation

### Backend Changes

1. **Configuration Storage** (`store.py`):
   - Added `irrigation_start_triggers` field to `SmartIrrigationConfig`
   - Implemented migration from storage version 4 to 5
   - Added backward compatibility handling

2. **Trigger Logic** (`__init__.py`):
   - Enhanced `register_start_event()` to handle multiple triggers
   - Added support for sunrise, sunset, and solar azimuth triggers
   - Maintained legacy behavior for backward compatibility

3. **Solar Calculations** (`helpers.py`):
   - Added `calculate_solar_azimuth()` function
   - Added `find_next_solar_azimuth_time()` function
   - Added helper functions for azimuth-based trigger scheduling

### Frontend Changes

1. **UI Components**:
   - Added `trigger-dialog.ts` for trigger management
   - Enhanced `view-general.ts` with triggers card
   - Added trigger list display with status indicators

2. **Type Definitions**:
   - Added `IrrigationStartTrigger` interface
   - Added trigger-related constants
   - Enhanced `SmartIrrigationConfig` type

3. **Localization**:
   - Added comprehensive translation strings
   - Support for multiple languages (extensible)
   - Context-sensitive help text

## Example Configurations

### Simple Sunrise Watering
```json
{
  "name": "Early Morning",
  "type": "sunrise", 
  "enabled": true,
  "offset_minutes": -60
}
```
*Starts irrigation 1 hour before sunrise*

### Evening Sunset Watering
```json
{
  "name": "Evening Cool Down",
  "type": "sunset",
  "enabled": true, 
  "offset_minutes": 30
}
```
*Starts irrigation 30 minutes after sunset*

### Mid-Morning Sun Position
```json
{
  "name": "Morning East Sun",
  "type": "solar_azimuth",
  "enabled": true,
  "azimuth_angle": 120,
  "offset_minutes": 0
}
```
*Starts irrigation when sun reaches southeast position (120°)*

### Multiple Triggers Setup
```json
[
  {
    "name": "Pre-Dawn",
    "type": "sunrise",
    "enabled": true,
    "offset_minutes": 0
  },
  {
    "name": "Evening Supplement", 
    "type": "sunset",
    "enabled": true,
    "offset_minutes": 60
  },
  {
    "name": "Hot Weather Emergency",
    "type": "solar_azimuth", 
    "enabled": false,
    "azimuth_angle": 270,
    "offset_minutes": -30
  }
]
```
*Multiple triggers: automatic sunrise timing, evening watering, and a disabled emergency trigger*

## Testing

The implementation includes comprehensive tests:

1. **Basic Functionality Test** (`test_irrigation_triggers.py`):
   - Solar azimuth calculations
   - Trigger configuration validation
   - Basic data structure tests

2. **Comprehensive Test** (`test_comprehensive_triggers.py`):
   - Legacy migration testing
   - Multiple trigger scenarios
   - UI data format validation
   - Timing scenario demonstrations

## Future Enhancements

Potential future improvements:
- Additional trigger types (specific times, weather conditions)
- Seasonal adjustments for triggers
- Integration with weather forecasts
- Mobile app push notifications for trigger events
- Advanced scheduling with date ranges

## Migration Guide

### For Existing Users
No action required - the system will automatically:
1. Detect absence of trigger configuration
2. Create a legacy sunrise trigger with auto-timing
3. Maintain existing irrigation behavior
4. Allow gradual adoption of new trigger features

### For New Installations
New installations can immediately:
1. Configure multiple trigger types
2. Set up complex watering schedules
3. Use solar position-based timing
4. Take advantage of all new features

This enhancement significantly expands the flexibility of the Smart Irrigation system while maintaining full backward compatibility with existing installations.