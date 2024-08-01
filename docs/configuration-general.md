---
layout: default
title: Configuration: General
---
# General configuration

> Main page: [Configuration](configuration.md)<br/>
> Next: [Zone configuration](configurations-zones.md)

This page provides the following global settings:

### Automatic duration calculation
If enabled, set the time of calculation (HH:MM). Calculation uses weatherdata that is collected in updates to determine irrigation duration. After automatic calculation has happened used weatherdata is deleted.

### Automatic weather data updates
If enabled, specify how often sensor update should happen (minutes, hours, days). As calculation needs weatherdata make sure to update your weather data at least once before calculating.

### Automatic weather data pruning
If enabled configure time of pruning weather data. Use this to make sure that there is no left over weatherdata from previous days. Don't remove the weatherdata before you calculate and only use this option if you expect the automatic update to collect weatherdata after you calculated for the day. Ideally, you want to prune as late in the day as possible.

### Continuous updates (experimental)
TODO

> Main page: [Configuration](configuration.md)<br/>
> Next: [Zone configuration](configurations-zones.md)