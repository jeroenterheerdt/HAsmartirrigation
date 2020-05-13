# HAsmartirrigation
Smart Irrigation custom component for Home Assistant. Partly based on the excellent work at https://github.com/hhaim/hass/.

## USAGE
``
test.py [apikey for OpenWeatherMap] [Latitude] [Longitude] [Elevation in meters] [metric|imperial] [JAN_ET,FEB_ET,MAR_ET,APR_ET,MAY_ET,JUN_ET,JUL_ET,AUG_ET,SEP_ET,OCT_ET,NOV_ET,DEC_ET] [number of sprinklers] [flow per sprinkler (gallon or liter per minute] [area (m2 or sq ft)]
``

To get the monthly ET values use http://www.rainmaster.com/historicET.aspx, http://wcatlas.iwmi.org/results.asp or another source.
Refer to documentation on your sprinklers to get flow per sprinkler.
## TODO
- create HA component
- update README)
- manifest: dependencies
- manifest: urls (2x)
- documentation: how to get API key for OpenWeatherMap

## DONE
- make it work: add sensors for rain based on OpenWeatherMap. Idea is to call update the data each hour and keep a rolling total for the day.
- make it work: calculate evotranspiration based on fao56...
- make it work: include snow in percipitation, not just rain
- make it work: metric system internally, but configurable whether to work with metric or imperial (can we read that setting from HA?)
- make it work: provide a way to configure gpm/lpm for irrigation system
- make it work: rainfall - ev < 0: irrigation, else not. figure out how long the system needs to run to re-fill the bucket. If irrigating, reset values. Otherwise, keep values as is.
- make it work: actually call the right things to start / stop irrigation
- include in HACS