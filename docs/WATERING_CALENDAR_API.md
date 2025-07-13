# 12-Month Watering Calendar API Usage Examples

This document provides examples of how to use the new 12-month watering calendar feature.

## API Endpoints

### REST API
```bash
# Get calendar for all zones
curl -X GET "http://localhost:8123/api/smart_irrigation/watering_calendar" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get calendar for specific zone
curl -X GET "http://localhost:8123/api/smart_irrigation/watering_calendar?zone_id=1" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### WebSocket API
```javascript
// Get calendar for all zones
websocket.send(JSON.stringify({
  "id": 1,
  "type": "smart_irrigation/watering_calendar"
}));

// Get calendar for specific zone
websocket.send(JSON.stringify({
  "id": 2,
  "type": "smart_irrigation/watering_calendar",
  "zone_id": "1"
}));
```

## Example Response

```json
{
  "1": {
    "zone_name": "Front Lawn",
    "zone_id": 1,
    "monthly_estimates": [
      {
        "month": 1,
        "month_name": "January",
        "estimated_et_mm": 31.0,
        "estimated_watering_volume_liters": 775.0,
        "average_temperature_c": 0.0,
        "average_precipitation_mm": 90.0,
        "calculation_notes": "Based on typical January climate patterns"
      },
      {
        "month": 2,
        "month_name": "February", 
        "estimated_et_mm": 42.3,
        "estimated_watering_volume_liters": 1057.5,
        "average_temperature_c": 5.1,
        "average_precipitation_mm": 75.2,
        "calculation_notes": "Based on typical February climate patterns"
      },
      {
        "month": 7,
        "month_name": "July",
        "estimated_et_mm": 93.0,
        "estimated_watering_volume_liters": 4650.0,
        "average_temperature_c": 30.0,
        "average_precipitation_mm": 30.0,
        "calculation_notes": "Based on typical July climate patterns"
      }
      // ... other months
    ],
    "generated_at": "2024-01-15T10:30:00",
    "calculation_method": "FAO-56 Penman-Monteith method using PyETO"
  },
  "2": {
    "zone_name": "Vegetable Garden",
    "zone_id": 2,
    "monthly_estimates": [
      // ... monthly estimates for zone 2
    ],
    "generated_at": "2024-01-15T10:30:00", 
    "calculation_method": "Static evapotranspiration rate"
  }
}
```

## JavaScript Integration Example

```javascript
class WateringCalendarService {
  constructor(hass) {
    this.hass = hass;
  }

  async getWateringCalendar(zoneId = null) {
    const message = {
      type: "smart_irrigation/watering_calendar"
    };
    
    if (zoneId) {
      message.zone_id = zoneId.toString();
    }

    try {
      const response = await this.hass.callWS(message);
      return response;
    } catch (error) {
      console.error("Failed to fetch watering calendar:", error);
      throw error;
    }
  }

  async getYearlyWateringTotal(zoneId) {
    const calendar = await this.getWateringCalendar(zoneId);
    
    if (!calendar[zoneId]) {
      throw new Error(`Zone ${zoneId} not found`);
    }
    
    const monthlyEstimates = calendar[zoneId].monthly_estimates;
    const yearlyTotal = monthlyEstimates.reduce(
      (total, month) => total + month.estimated_watering_volume_liters, 
      0
    );
    
    return {
      zoneId,
      zoneName: calendar[zoneId].zone_name,
      yearlyTotalLiters: yearlyTotal,
      monthlyAverageLiters: yearlyTotal / 12,
      calculationMethod: calendar[zoneId].calculation_method
    };
  }

  formatCalendarForChart(zoneId, calendar) {
    const zoneData = calendar[zoneId];
    if (!zoneData) return null;

    return {
      labels: zoneData.monthly_estimates.map(m => m.month_name),
      datasets: [
        {
          label: 'Watering Volume (L)',
          data: zoneData.monthly_estimates.map(m => m.estimated_watering_volume_liters),
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1
        },
        {
          label: 'Temperature (°C)',
          data: zoneData.monthly_estimates.map(m => m.average_temperature_c),
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
          borderColor: 'rgba(255, 99, 132, 1)',
          borderWidth: 1,
          yAxisID: 'temperature'
        }
      ]
    };
  }
}

// Usage example
const calendarService = new WateringCalendarService(hass);

// Get calendar for all zones
calendarService.getWateringCalendar()
  .then(calendar => {
    console.log("All zones calendar:", calendar);
    
    // Process each zone
    Object.keys(calendar).forEach(zoneId => {
      const zoneData = calendar[zoneId];
      console.log(`Zone ${zoneData.zone_name} yearly estimate:`, 
        zoneData.monthly_estimates.reduce((sum, month) => 
          sum + month.estimated_watering_volume_liters, 0
        ), "liters"
      );
    });
  })
  .catch(error => console.error("Error:", error));

// Get yearly total for specific zone
calendarService.getYearlyWateringTotal(1)
  .then(yearlyData => {
    console.log(`${yearlyData.zoneName} needs ${yearlyData.yearlyTotalLiters} liters/year`);
    console.log(`Monthly average: ${yearlyData.monthlyAverageLiters} liters`);
  });
```

## Python Automation Example

```python
import asyncio
from homeassistant.core import HomeAssistant

async def create_irrigation_schedule(hass: HomeAssistant, zone_id: int):
    """Create an annual irrigation schedule based on the watering calendar."""
    
    # Get watering calendar
    coordinator = hass.data["smart_irrigation"]["coordinator"]
    calendar_data = await coordinator.async_generate_watering_calendar(zone_id)
    
    if zone_id not in calendar_data:
        raise ValueError(f"Zone {zone_id} not found")
    
    zone_calendar = calendar_data[zone_id]
    monthly_estimates = zone_calendar["monthly_estimates"]
    
    # Create schedule entries
    schedule = []
    for month_data in monthly_estimates:
        month = month_data["month"]
        volume_liters = month_data["estimated_watering_volume_liters"]
        
        # Calculate irrigation frequency (example: aim for 2-3 sessions per week)
        sessions_per_week = 2.5
        sessions_per_month = sessions_per_week * 4.3  # ~4.3 weeks per month
        liters_per_session = volume_liters / sessions_per_month
        
        # Convert to duration based on zone throughput
        zone_data = coordinator.store.get_zone(zone_id)
        throughput_lpm = zone_data.get("throughput", 10.0)  # liters per minute
        duration_minutes = liters_per_session / throughput_lpm
        
        schedule.append({
            "month": month,
            "month_name": month_data["month_name"],
            "total_volume_liters": volume_liters,
            "sessions_per_month": int(sessions_per_month),
            "liters_per_session": round(liters_per_session, 1),
            "duration_minutes": round(duration_minutes, 1),
            "frequency": f"{sessions_per_week} times per week"
        })
    
    return {
        "zone_id": zone_id,
        "zone_name": zone_calendar["zone_name"],
        "calculation_method": zone_calendar["calculation_method"],
        "yearly_schedule": schedule,
        "total_yearly_volume": sum(m["estimated_watering_volume_liters"] for m in monthly_estimates)
    }

# Example usage in Home Assistant automation
async def irrigation_planning_automation(hass: HomeAssistant):
    """Automation to create yearly irrigation plans for all zones."""
    
    coordinator = hass.data["smart_irrigation"]["coordinator"]
    
    # Get all zones
    zones = await coordinator.store.async_get_zones()
    
    plans = {}
    for zone in zones:
        zone_id = zone["id"]
        try:
            plan = await create_irrigation_schedule(hass, zone_id)
            plans[zone_id] = plan
            
            # Log the plan
            hass.async_create_task(
                hass.services.async_call(
                    "notify", "persistent_notification",
                    {
                        "title": f"Irrigation Plan: {plan['zone_name']}",
                        "message": f"Yearly water need: {plan['total_yearly_volume']:.0f}L\n"
                                 f"Peak month: {max(plan['yearly_schedule'], key=lambda x: x['total_volume_liters'])['month_name']}\n"
                                 f"Method: {plan['calculation_method']}"
                    }
                )
            )
        except Exception as e:
            hass.async_create_task(
                hass.services.async_call(
                    "notify", "persistent_notification",
                    {
                        "title": f"Irrigation Plan Error: Zone {zone_id}",
                        "message": f"Failed to create plan: {str(e)}"
                    }
                )
            )
    
    return plans
```

## Error Handling

The API gracefully handles various error conditions:

### Zone Not Found
```json
{
  "error": "Zone 999 not found"
}
```

### Zone Configuration Issues
```json
{
  "1": {
    "zone_name": "Broken Zone",
    "zone_id": 1,
    "monthly_estimates": [],
    "error": "Zone 1 missing mapping or module configuration",
    "generated_at": "2024-01-15T10:30:00"
  }
}
```

### Partial Failures
If some zones fail while others succeed, the API returns data for successful zones and error messages for failed ones.

## Integration with Existing Features

The watering calendar integrates with existing Smart Irrigation features:

- **Zone Configuration**: Uses existing zone size, multiplier, and module settings
- **Calculation Modules**: Supports PyETO, Thornthwaite, Static, and Passthrough methods
- **Geographic Data**: Uses Home Assistant's latitude/longitude for climate modeling
- **Unit System**: Respects Home Assistant's metric/imperial unit configuration

## Use Cases

1. **Annual Planning**: Plan water budgets and irrigation system capacity
2. **Seasonal Adjustments**: Adjust automation schedules based on seasonal needs  
3. **Cost Estimation**: Calculate water costs for different irrigation scenarios
4. **System Sizing**: Determine if irrigation capacity meets estimated demand
5. **Comparison**: Compare water needs across different zones or calculation methods