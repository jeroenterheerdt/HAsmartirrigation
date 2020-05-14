# Smart Irrigation
Smart Irrigation custom component for Home Assistant. Partly based on the excellent work at https://github.com/hhaim/hass/.
This component calculates the time to run your irrigation system to compensate for moisture lost by evaporation. It takes into account percipitation (rain,snow) and adjusts accordingly.

## Configuration

Install the custom component and then use the Configuration --> Integrations pane to search for 'Smart Irrigation'. Follow the prompts to install:



To get the monthly ET values use http://www.rainmaster.com/historicET.aspx, http://wcatlas.iwmi.org/results.asp or another source.
Refer to documentation on your sprinklers to get flow per sprinkler.
## TODO
- CONFIG FLOW: error messages do not show up and no labels for reference_et values.

- update README - install instructions and buy me coffee / beer / patreon
- include in HACS
- documentation: how to get API key for OpenWeatherMap

## DONE
- make it work: add sensors for rain based on OpenWeatherMap. Idea is to call update the data each hour and keep a rolling total for the day.
- make it work: calculate evotranspiration based on fao56...
- make it work: include snow in percipitation, not just rain
- make it work: metric system internally, but configurable whether to work with metric or imperial (can we read that setting from HA?)
- make it work: provide a way to configure gpm/lpm for irrigation system
- make it work: rainfall - ev < 0: irrigation, else not. figure out how long the system needs to run to re-fill the bucket. If irrigating, reset values. Otherwise, keep values as is.
- make it work: actually call the right things to start / stop irrigation

- create HA component
- manifest: dependencies
- manifest: urls (2x)


## SET UP
Install 