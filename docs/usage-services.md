---
layout: default
title: Usage: Services
---
# Services

> Main page: [Usage](usage.md)<br/>
> Previous: [Entities](usage-entities.md)<br/>
> Next: [Events](usage-events.md)

After installation, the following services are available:
| Service | Description|
| --- | --- |
|`Smart Irrigation: calculate_zone`|Triggers the calculation of one specific zone. Note that used weather data is deleted afterwards by default.|
|`Smart Irrigation: calculate_all_zones`|Triggers the calculation of all automatic zones. Use only if you disabled automatic refresh in the options. Note that after calculation weather data is deleted by default.|
|`Smart Irrigation: clear_all_weather_data`|Deletes all weather data|
|`Smart Irrigation: reset_all_buckets`|Resets all buckets to 0.|
|`Smart Irrigation: reset_bucket`|Resets one specific bucket to 0.|
|`Smart Irrigation: set_all_buckets`|Sets all buckets to a specific `value`.|
|`Smart Irrigation: set_all_multipliers`|Sets all multipliers to a specific `value`.|
|`Smart Irrigation: set_bucket`|Sets a specific bucket to to a specific `value`.|
|`Smart Irrigation: set_multiplier`|Sets a specific multiplier to a specific `value`.|
|`Smart Irrigation: set_zone`| Allows configuration for bucket, multiplier, duration, state and throughput settings for a zone.|
|`Smart Irrigation: update_all_zones`|Updates all automatic zones with weather data|
|`Smart Irrigation: update_zone`|Updates one specific zone with weather data|

> Main page: [Usage](usage.md)<br/>
> Previous: [Entities](usage-entities.md)<br/>
> Next: [Events](usage-events.md)
