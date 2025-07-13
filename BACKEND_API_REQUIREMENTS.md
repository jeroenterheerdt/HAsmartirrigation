# Backend API Requirements for Smart Irrigation Frontend

## Overview
This document outlines the backend API endpoints required to support the new frontend features added to the Smart Irrigation system.

## Required API Endpoints

### 1. Watering Calendar Endpoint

**Endpoint:** `GET /api/smart_irrigation/watering_calendar`

**Description:** Returns 12-month watering estimates for irrigation zones based on representative climate data and evapotranspiration calculations.

**Query Parameters:**
- `zone_id` (optional): Specific zone ID to get calendar for. If omitted, returns data for all zones.

**Response Format:**
```json
{
  "zone_id": {
    "zone_name": "Front Lawn",
    "zone_id": 1,
    "monthly_estimates": [
      {
        "month": 1,
        "month_name": "January",
        "estimated_et_mm": 45.2,
        "estimated_watering_volume_liters": 1250.5,
        "average_temperature_c": 8.5,
        "average_precipitation_mm": 85.0,
        "calculation_notes": "Based on typical January climate patterns"
      }
      // ... 11 more months
    ],
    "generated_at": "2024-01-15T10:30:00",
    "calculation_method": "FAO-56 Penman-Monteith method using PyETO"
  }
}
```

**WebSocket Command:**
```json
{
  "type": "smart_irrigation/watering_calendar",
  "zone_id": "1"  // optional
}
```

**Features:**
- Uses representative monthly climate data based on location latitude/longitude
- Applies configured evapotranspiration calculation methods (PyETO, Thornthwaite, etc.)
- Accounts for zone-specific parameters (size, multiplier, etc.)
- Gracefully handles zones with missing or incomplete configuration
- Provides seasonal estimates for irrigation planning

**Implementation Status:** ✅ Implemented - Addresses issue #579

### 2. Irrigation Information Endpoint

**Endpoint:** `GET /api/smart_irrigation/info`

**Description:** Returns information about the next scheduled irrigation and system status.

**Response Format:**
```json
{
  "next_irrigation_start": "2025-07-14T06:00:00Z",
  "next_irrigation_duration": 1800,
  "next_irrigation_zones": ["Zone 1", "Zone 3"],
  "irrigation_reason": "Soil moisture levels below threshold",
  "sunrise_time": "2025-07-14T05:30:00Z",
  "total_irrigation_duration": 3600,
  "irrigation_explanation": "Based on weather forecast and soil moisture sensors, irrigation is scheduled to maintain optimal growing conditions."
}
```

**Response Fields:**
- `next_irrigation_start` (string, ISO 8601): When the next irrigation will start
- `next_irrigation_duration` (number): Duration in seconds for the next irrigation cycle
- `next_irrigation_zones` (array): List of zone names that will be irrigated
- `irrigation_reason` (string): Brief explanation of why irrigation is needed
- `sunrise_time` (string, ISO 8601): Time of sunrise (used in irrigation calculations)
- `total_irrigation_duration` (number): Total duration in seconds for all zones
- `irrigation_explanation` (string): Detailed explanation of irrigation logic

**Error Responses:**
- `404`: No irrigation scheduled
- `500`: Server error calculating irrigation info

### 2. Weather Records Endpoint

**Endpoint:** `GET /api/smart_irrigation/mappings/{mapping_id}/weather`

**Query Parameters:**
- `limit` (optional, default: 10): Maximum number of records to return

**Description:** Returns recent weather data records for a specific mapping/sensor group.

**Response Format:**
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
  },
  {
    "timestamp": "2025-07-13T13:00:00Z",
    "temperature": 24.8,
    "humidity": 68.1,
    "precipitation": 0.2,
    "pressure": 1012.8,
    "wind_speed": 4.7,
    "retrieval_time": "2025-07-13T13:05:00Z"
  }
]
```

**Response Fields (per record):**
- `timestamp` (string, ISO 8601): When the weather data was recorded
- `temperature` (number, optional): Temperature in degrees Celsius
- `humidity` (number, optional): Relative humidity percentage
- `precipitation` (number, optional): Precipitation in millimeters
- `pressure` (number, optional): Atmospheric pressure in hPa
- `wind_speed` (number, optional): Wind speed in m/s
- `retrieval_time` (string, ISO 8601): When the data was retrieved/stored

**Error Responses:**
- `404`: Mapping not found
- `500`: Server error retrieving weather data

## Integration Points

### WebSocket Subscriptions
The frontend subscribes to configuration updates via WebSocket:
```json
{
  "type": "smart_irrigation_config_updated"
}
```

When this message is received, the frontend will refresh all data including the new info and weather data.

### Existing Data Dependencies
The new features depend on existing data structures:
- Zones data (for mapping relationships)
- Mappings data (for weather record association)
- Configuration data (for units and settings)

## Implementation Notes

### Data Storage Considerations
- Weather records should be stored with both timestamp and retrieval_time
- Consider data retention policies for weather records
- Index weather records by mapping_id and timestamp for efficient querying

### Caching Strategy
- Irrigation info changes relatively infrequently - can be cached for 1-5 minutes
- Weather records are historical - can be cached longer (15-30 minutes)
- Consider ETags for conditional requests

### Performance Recommendations
- Limit weather records query to reasonable limits (max 100 records)
- Use database indexes on mapping_id and timestamp
- Consider pagination for large weather datasets

### Error Handling
- Return consistent error format matching existing API patterns
- Log errors for debugging while returning user-friendly messages
- Handle cases where no data is available gracefully

## Frontend Stub Implementation

The frontend currently includes stub implementations for these APIs in `frontend/src/data/websockets.ts`:

```typescript
// TODO: Backend API needed - Implement irrigation info endpoint
export const fetchIrrigationInfo = (hass: HomeAssistant): Promise<any> => {
  // Returns mock data for development
}

// TODO: Backend API needed - Implement weather records endpoint
export const fetchMappingWeatherRecords = (
  hass: HomeAssistant,
  mapping_id: string,
  limit: number = 10
): Promise<any[]> => {
  // Returns mock weather data
}
```

These stubs should be replaced with actual WebSocket or HTTP API calls once the backend endpoints are implemented.

## Testing Endpoints

Once implemented, test endpoints with:

```bash
# Test irrigation info
curl -X GET "http://localhost:8123/api/smart_irrigation/info" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Test weather records
curl -X GET "http://localhost:8123/api/smart_irrigation/mappings/1/weather?limit=5" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Security Considerations
- Ensure proper authentication/authorization for all endpoints
- Validate mapping_id parameter to prevent unauthorized access
- Limit rate limiting to prevent abuse
- Sanitize any user input in query parameters