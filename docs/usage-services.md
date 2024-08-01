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
|`Smart Irrigation: calculate_zone`|Triggers the calculation of one specific zone. Note that used weather data is deleted afterwards.|
|`Smart Irrigation: calculate_all_zones`|Triggers the calculation of all automatic zones. Use only if you disabled automatic refresh in the options. Note that after calculation weather data is deleted.|
|`Smart Irrigation: update_zone`|Updates one specific zone with weather data|
|`Smart Irrigation: update_all_zones`|Updates all automatic zones with weather data|
|`Smart Irrigation: reset_bucket`|Resets one specific bucket to 0.|
|`Smart Irrigation: reset_all_buckets`|Resets all buckets to 0.|
|`Smart Irrigation: set_bucket`|Sets a specific bucket to to a specific `value`.|
|`Smart Irrigation: set_all_buckets`|Sets all buckets to a specific `value`.|

> Main page: [Usage](usage.md)<br/>
> Previous: [Entities](usage-entities.md)<br/>
> Next: [Events](usage-events.md)