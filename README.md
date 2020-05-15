[![hacs_badge](https://img.shields.io/badge/HACS-Custom-orange.svg)](https://github.com/custom-components/hacs)

[![Support the author on Patreon][patreon-shield]][patreon]

[![Buy me a coffee][buymeacoffee-shield]][buymeacoffee]

[patreon-shield]: https://frenck.dev/wp-content/uploads/2019/12/patreon.png
[patreon]: https://www.patreon.com/dutchdatadude

[buymeacoffee]: https://www.buymeacoffee.com/dutchdatadude
[buymeacoffee-shield]: https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png


# Smart Irrigation
Smart Irrigation custom component for Home Assistant. Partly based on the excellent work at https://github.com/hhaim/hass/.
This component calculates the time to run your irrigation system to compensate for moisture lost by evaporation. Using this component you water your garden, lawn or crops precisely enough to compensate what has evaporated. It takes into account percipitation (rain,snow) and adjusts accordingly, so if it rains or snows less or no irrigation is required.

Note that this component at the moment does not take into the account the effects of rain/snow over multiple days.



## Configuration

### Step 1: configuration of component
Install the custom component (preferably using HACS) and then use the Configuration --> Integrations pane to search for 'Smart Irrigation'.
You will need to specify the following:
- API Key for Open Weather Map. See [Getting Open Weater Map API Key](#getting-open-weather-map-api) below for instructions.
- Reference Evatranspiration for all months of the year (decimal number, use .0 if you happen to have a whole number). See [Getting Monthly ET values](#getting-monthly-et-values) below for instructions. Note that you can specify these in inches or mm, depending on your Home Assistant settings.
- Number of sprinklers in your irrigation system (whole number)
- Flow per spinkler in gallons per minute or liters per minute (decimal number, use .0 if you happen to have a whole number). Refer to your sprinkler's manual for this information.
- Area that the sprinklers cover in square feet or m2 (whole number)

### Step 2: creating automation
Since this component does not interface with your irrigation system directly, you will need to use the data it outputs to create an automation that will start and stop your irrigation system for you. This way you can use this custom component with any irrigation system you might have, regardless of how that interfaces with Home Assistant.

Here is an example automation:
```
- alias: Smart Irrigation
  description: 'Start Smart Irrigation at 06:00 and run it only if the adjusted_run_time is >0 and run it for precisely that many seconds'
  trigger:
  - at: 06:00
    platform: time
  condition:
  - above: '0'
    condition: numeric_state
    entity_id: sensor.smart_irrigation_adjusted_run_time
  action:
  - data: {}
    entity_id: switch.irrigation_tap1
    service: switch.turn_on
  - delay:
      seconds: '{{states("sensor.smart_irrigation_adjusted_run_time")}}'
  - data: {}
    entity_id: switch.irrigation_tap1
    service: switch.turn_off
  - service: smart_irrigation.reset_bucket
```

> **The last step in this automation is important, since you will need to let the component know you have finished irrigating and the evaporation counter can be reset.**

## Getting Open Weather Map API
Go to https://openweathermap.org and create an account. You can enter any company and purpose while creating an account. After creating your account, go to API Keys and get your key.

## Getting Monthly ET values
To get the monthly ET values use http://www.rainmaster.com/historicET.aspx, http://wcatlas.iwmi.org/results.asp or another source that has this information for your area.

## TODO
- figure out if we need to follow UTC or local time for getting final adjusted run time