---
layout: default
title: Configuration: General
---
# General configuration

> Main page: [Configuration](configuration.md)<br/>
> Next: [Zone configuration](configuration-zones.md)

This page provides the following global settings:

### Automatic weather data update
If enabled, specify how often sensor update should happen (minutes, hours, days). You can also set up an update delay to be used to delay the first update. THis is useful in case your sensors do not provide a value immediately after Home Assistant starts.

As calculation needs weatherdata make sure to update your weather data at least once before calculating.

### Automatic duration calculation
If enabled, set the time of calculation (HH:MM). Calculation uses weatherdata that is collected in updates to determine irrigation duration. After automatic calculation has happened used weatherdata is deleted.

### Automatic weather data pruning
If enabled configure time of pruning weather data. Use this to make sure that there is no left over weatherdata from previous days. Don't remove the weatherdata before you calculate and only use this option if you expect the automatic update to collect weatherdata after you calculated for the day. Ideally, you want to prune as late in the day as possible.

### Continuous updates (experimental)
Continuous updates is an experimental feature that tries to capture more granular weather data to avoid missing chunks of weather patterns. For a zone to be continuous updated, it needs to:
* be set to `automatic`
* use a [sensor group](configuration-sensor-groups.md) that does not rely on a weather service (none of the data has its source set to `weather service`). 
* not use forecasting, as it relies on weather services. Set `forecast days` for PyETO to `0`.

Any zone that does not meet the above requirements is not included in the continuous updates and instead will be included in the automatic update and calculation at the time configured. 
Any zone that does meet this requirement will not be included in the automatic update and calculation.

Please note that this is experimental right now and will have bugs.

For continous updates, in the future, it will likely use specific set of aggregates (last for all data points except for solar radiation which will use average of riemann integral) and also requires current precipitation to be mapped in the sensor group.


> Main page: [Configuration](configuration.md)<br/>
> Next: [Zone configuration](configuration-zones.md)