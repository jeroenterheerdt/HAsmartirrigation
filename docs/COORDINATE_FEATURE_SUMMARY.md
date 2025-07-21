# Smart Irrigation Manual Coordinate Configuration

## Summary of Changes

This implementation adds the ability for users to manually configure coordinates (latitude, longitude, elevation) for weather data retrieval, rather than being limited to Home Assistant's global location settings.

## Features Added

### Backend Implementation
- **New Configuration Constants**: Added manual coordinate settings to `const.py`
- **Extended Options Flow**: Added coordinate configuration step to setup wizard
- **Smart Coordinate Selection**: Coordinator now chooses between manual and HA coordinates
- **Validation**: Input validation for coordinate ranges and completeness
- **Weather Service Integration**: All weather clients use effective coordinates automatically

### Frontend Implementation  
- **Coordinate Configuration Card**: New UI section in general settings
- **Real-time Toggle**: Switch between manual and HA coordinates
- **Input Validation**: Client-side validation with proper ranges
- **Current Location Display**: Shows HA coordinates when manual mode disabled
- **TypeScript Support**: Proper typing for all coordinate configuration

### Internationalization
- **Complete Translation Coverage**: 8 languages supported (de, en, es, fr, it, nl, no, sk)
- **Backend Translations**: Options flow step translations
- **Frontend Translations**: UI element translations

## Files Modified

### Backend Files
- `custom_components/smart_irrigation/const.py` - Added coordinate constants
- `custom_components/smart_irrigation/options_flow.py` - Extended with coordinate step
- `custom_components/smart_irrigation/__init__.py` - Updated coordinator logic
- `custom_components/smart_irrigation/translations/*.json` - Added coordinate translations

### Frontend Files
- `custom_components/smart_irrigation/frontend/src/const.ts` - Added coordinate constants
- `custom_components/smart_irrigation/frontend/src/types.ts` - Extended config types
- `custom_components/smart_irrigation/frontend/src/views/general/view-general.ts` - Added coordinate card
- `custom_components/smart_irrigation/frontend/localize/languages/*.json` - Added UI translations

## Configuration Flow

1. **Initial Setup**: Weather service configuration → Coordinate configuration
2. **Options**: Can modify coordinates through HA integrations page
3. **General Settings**: Real-time coordinate management in Smart Irrigation panel

## Usage

### Enable Manual Coordinates
1. Go to Home Assistant Settings → Integrations
2. Find Smart Irrigation, click "Configure"
3. In coordinate step, enable "Use manual coordinates"
4. Enter latitude (-90 to 90), longitude (-180 to 180), and optional elevation

### Manage in UI
1. Open Smart Irrigation panel
2. Go to General settings
3. Use "Location Coordinates" card to toggle and edit coordinates

## Technical Details

### Coordinate Priority
1. Manual coordinates (if enabled and complete)
2. Home Assistant coordinates (fallback)
3. Default values with warning logs

### Weather Service Impact
- OpenWeatherMap: Uses coordinates for API calls and pressure calculations
- Pirate Weather: Uses coordinates for location-specific forecasts  
- KNMI: Uses coordinates for Dutch weather data

### Validation Rules
- Latitude: -90° to 90° (6 decimal places)
- Longitude: -180° to 180° (6 decimal places)
- Elevation: -1000m to 9000m (whole meters)

## Benefits

- **Flexibility**: Weather data from any location
- **Accuracy**: Precise coordinates for better weather calculations
- **Remote Properties**: Support for irrigation systems at different locations
- **Weather Station Alignment**: Use specific weather station coordinates
- **Elevation Correction**: Accurate elevation for pressure calculations

## Backward Compatibility

- **Default Behavior**: Uses Home Assistant coordinates by default
- **No Breaking Changes**: Existing configurations continue to work
- **Graceful Fallback**: Falls back to HA coordinates if manual coordinates incomplete
- **Migration**: Seamless upgrade with no configuration required