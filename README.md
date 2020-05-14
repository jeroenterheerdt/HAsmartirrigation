[![hacs_badge](https://img.shields.io/badge/HACS-Custom-orange.svg)](https://github.com/custom-components/hacs)

# Smart Irrigation
Smart Irrigation custom component for Home Assistant. Partly based on the excellent work at https://github.com/hhaim/hass/.
This component calculates the time to run your irrigation system to compensate for moisture lost by evaporation. It takes into account percipitation (rain,snow) and adjusts accordingly.

[![Support the author on Patreon][patreon-shield]][patreon]

[![Buy me a coffee][buymeacoffee-shield]][buymeacoffee]

[patreon-shield]: https://frenck.dev/wp-content/uploads/2019/12/patreon.png
[patreon]: https://www.patreon.com/dutchdatadude

[buymeacoffee]: https://www.buymeacoffee.com/dutchdatadude
[buymeacoffee-shield]: https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png

## Configuration

### Step 1: configuration of component
Install the custom component and then use the Configuration --> Integrations pane to search for 'Smart Irrigation'.
You will need to specify the following:
- API Key for Open Weather Map. See [Getting Open Weater Map API Key](#getting-open-weather-map-api) below for instructions.
- Reference Evatranspiration for all months of the year (decimal number, use .0 if you happen to have a whole number). See [Getting Monthly ET values](#getting-monthly-et-values) below for instructions. Note that you can specify these in inches or mm, depending on your Home Assistant settings.
- Number of sprinklers in your irrigation system (whole number)
- Flow per spinkler in gallons per minute or liters per minute (decimal number, use .0 if you happen to have a whole number). Refer to your sprinkler's manual for this information.
- Area that the sprinklers cover in square feet or m2 (whole number)

### Step 2: creating automation
Since this component does not interface with your irrigation system directly, you will need to use the data it outputs to create an automation that will start and stop your irrigation system for you. Here is an example automation:

## Getting Open Weather Map API
Go to https://openweathermap.org and create an account. You can enter any company and purpose while creating an account. After creating your account, go to API Keys and get your key.

## Getting Monthly ET values
To get the monthly ET values use http://www.rainmaster.com/historicET.aspx, http://wcatlas.iwmi.org/results.asp or another source that has this information for your area.

## TODO
- update README - automation example
- include in HACS

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
