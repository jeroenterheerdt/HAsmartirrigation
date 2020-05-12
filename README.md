# HAsmartirrigation
Smart Irrigation custom component for Home Assistant. Partly based on the excellent work at https://github.com/hhaim/hass/.


## TODO
- make it work: calculate evatranspiration based on fao56...
- make it work: metric system internally, but configurable whether to work with metric or imperial (can we read that setting from HA?)
- make it work: provide a way to configure gpm/lpm for irrigation system
- make it work: rainfall - ev < 0: irrigation, else not. figure out how long the system needs to run to re-fill the bucket.
- make it work: actually call the right things to start / stop irrigation
- include in HACS
- manifest: dependencies
- manifest: urls (2x)
- documentation: how to get API key for OpenWeatherMap
- 

## DONE
- make it work: add sensors for rain based on OpenWeatherMap. Idea is to call update the data each hour and keep a rolling total for the day.