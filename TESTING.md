# Smart Irrigation Frontend Testing Guide

## Overview
This document provides testing instructions for the new frontend features added to the Smart Irrigation system.

## New Features to Test

### 1. Info Page
**Location:** Navigate to the "Info" tab (new tab between "Mappings" and "Help")

**Expected Behavior:**
- Page displays two main cards:
  - "Next Irrigation" card showing next irrigation start time, duration, and zones
  - "Irrigation Reason" card showing reason, sunrise time, total duration, and explanation
- Currently shows placeholder data with "TODO: Backend API needed" messages
- All text should be properly localized

**Test Steps:**
1. Open Smart Irrigation interface
2. Click on "Info" tab
3. Verify both cards are displayed
4. Verify placeholder data is shown
5. Verify backend TODO messages are visible

### 2. Enhanced Mappings Page
**Location:** Navigate to "Sensor Groups" (Mappings) tab

**Expected Behavior:**
- Each mapping now shows a "Weather Records (Last 10)" section
- Weather records table with columns: Time, Temp, Humidity, Precip, Retrieved
- Shows stub data for 10 hourly records going back from current time
- Proper grid layout with alternating row colors

**Test Steps:**
1. Navigate to "Sensor Groups" tab
2. Create or view an existing mapping
3. Scroll down to see weather records section
4. Verify table headers and mock data display
5. Verify responsive layout

### 3. Weather Info Links in Zones
**Location:** Navigate to "Zones" tab

**Expected Behavior:**
- Zones with assigned mappings show a cloud icon button
- Clicking the cloud icon shows an alert with mapping info and TODO message
- Zones without mappings don't show the weather button

**Test Steps:**
1. Navigate to "Zones" tab
2. Create or edit a zone and assign it a mapping (sensor group)
3. Verify cloud icon appears in the action buttons row
4. Click the cloud icon
5. Verify alert shows mapping ID and navigation TODO message
6. Test with zone that has no mapping assigned

### 4. Navigation Enhancement
**Expected Behavior:**
- New "Info" tab appears between "Mappings" and "Help"
- Tab switching works correctly
- URL routing works properly

**Test Steps:**
1. Verify tab order: General > Zones > Modules > Sensor Groups > Info > Help
2. Click on Info tab and verify URL updates
3. Refresh page while on Info tab, verify it stays on Info page
4. Navigate back and forth between tabs

## Backend API Requirements

### APIs That Need Implementation:

1. **GET /api/smart_irrigation/info**
   - Returns irrigation information
   - Response format:
   ```json
   {
     "next_irrigation_start": "2025-07-14T06:00:00Z",
     "next_irrigation_duration": 1800,
     "next_irrigation_zones": ["Zone 1", "Zone 3"],
     "irrigation_reason": "Soil moisture levels below threshold",
     "sunrise_time": "2025-07-14T05:30:00Z",
     "total_irrigation_duration": 3600,
     "irrigation_explanation": "Detailed explanation..."
   }
   ```

2. **GET /api/smart_irrigation/mappings/{mapping_id}/weather?limit=10**
   - Returns weather records for a specific mapping
   - Response format:
   ```json
   [
     {
       "timestamp": "2025-07-13T14:00:00Z",
       "temperature": 25.5,
       "humidity": 65.2,
       "precipitation": 0.0,
       "pressure": 1013.2,
       "wind_speed": 5.1,
       "retrieval_time": "2025-07-13T14:05:00Z"
     }
   ]
   ```

## Error Cases to Test

1. **Network Failures:**
   - Disconnect network and verify error handling
   - Check console for error messages

2. **Invalid Data:**
   - Test with malformed JSON responses (when backend is implemented)
   - Verify graceful degradation

3. **Missing Localization:**
   - Switch language (if supported) and verify all new strings are translated
   - Check for missing translation keys in console

## Browser Compatibility

Test in:
- Chrome/Chromium
- Firefox
- Safari (if available)
- Edge

## Responsive Design

Test at different screen sizes:
- Desktop (1920x1080)
- Tablet (768x1024)
- Mobile (375x667)

## Performance

- Check for console errors
- Verify reasonable load times
- Monitor memory usage during navigation

## Accessibility

- Verify keyboard navigation works
- Check color contrast
- Test with screen reader (if available)

## Files Modified

- `frontend/src/views/info/view-info.ts` - New info page component
- `frontend/src/views/mappings/view-mappings.ts` - Added weather records
- `frontend/src/views/zones/view-zones.ts` - Added weather info button
- `frontend/src/smart-irrigation.ts` - Added info tab and routing
- `frontend/src/data/websockets.ts` - Added stub API functions
- `frontend/src/types.ts` - Added new TypeScript interfaces
- `frontend/localize/languages/en.json` - Added localization strings

## Notes

- All new functionality uses stub data until backend APIs are implemented
- Weather info button in zones currently shows alert instead of navigation
- Backend API stubs include detailed TODO comments for implementation
- Styling follows existing design patterns and theme system