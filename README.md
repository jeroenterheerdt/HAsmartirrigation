[![hacs_badge](https://img.shields.io/badge/HACS-Default-orange.svg)](https://github.com/hacs/integration)

[![Support the author on Patreon][patreon-shield]][patreon]

[![Buy me a coffee][buymeacoffee-shield]][buymeacoffee]

[patreon-shield]: https://frenck.dev/wp-content/uploads/2019/12/patreon.png
[patreon]: https://www.patreon.com/dutchdatadude

[buymeacoffee]: https://www.buymeacoffee.com/dutchdatadude
[buymeacoffee-shield]: https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png


# Smart Irrigation
![](logo.png?raw=true)

Smart Irrigation custom component for Home Assistant. Partly based on the excellent work at https://github.com/hhaim/hass/.
This component calculates the time to run your irrigation system to compensate for moisture lost by evaporation / evapotranspiration. Using this component you water your garden, lawn or crops precisely enough to compensate what has evaporated. It takes into account precipitation (rain,snow) and adjusts accordingly, so if it rains or snows less or no irrigation is required. Multiple zones can be supported as each zone will have its own flow configuration. 

> **Note - use this component at your own risk - we do not assume responsibility for any inconvience caused by using this component. Always use common sense before deciding to irrigate using the calculations this component provides. For example, irrigating during excessive rainfall might cause flooding. Again - we assume no responsibility for any inconvience caused.**

> **Note If you want to go back and change your settings afterwards, you can either delete the zone and re-create it.**

The component keeps track of precipitation and at 23:00 (11:00 PM) local time stores it in a daily value.
It then calculates the exact runtime in seconds to compensate for the next evaporation.

Note that this is the default behavior and this can be disabled if you want more control. Also, the time auto refresh happens (if not disabled) is configurable.

This is all the component does, and this is on purpose to provide maximum flexibility. Users are expected to use the value of `sensor.[zone_name]` to interact with their irrigation system and afterwards call the `smart_irrigation.reset_bucket` service. [See the example automations below](#step-4-creating-automation).

This component uses reference evapotranspiration values and calculates water budgets from that. This is an industry-standard approach. Information can be found at https://www.rainbird.com/professionals/irrigation-scheduling-use-et-save-water, amongst others.

The component uses the [PyETo module to calculate the evapotranspiration value (fao56)](https://pyeto.readthedocs.io/en/latest/fao56_penman_monteith.html). Also, please see the [How this works](https://github.com/jeroenterheerdt/HAsmartirrigation/wiki/How-this-component-works) Wiki page.

## Visual representation of what this component does
![](images/smart_irrigation_diagram.png?raw=true)

1. Snow and rain fall on the ground add moisture. This is tracked /predicted depending on the [operation mode](#operation-modes) by the `rain` and `snow` attributes Together, this makes up the `precipitation`.

2. Sunshine, temperature, wind speed, place on earth and other factors influence the amount of moisture lost from the ground(`evapotranspiration`). This is tracked / predicted depending on the [operation mode](#operation-modes).

3. The difference between `precipitation` and `evapotranspiration` is the `netto precipitation`: negative values mean more moisture is lost than gets added by rain/snow, while positive values mean more moisture is added by rain/snow than what evaporates.

4. Once a day (time is configurable) the `netto precipitation` is added/substracted from the `bucket,` which starts as empty. If the `bucket` is below zero, irrigation is required. 

5. Irrigation should be run for `sensor.[zone_name]`, which is 0 if `bucket`  >=0. Afterwards, the `bucket` needs to be reset (using `reset_bucket`). It's up to the user of the component to build the automation for this final step.

There are many more options available, see below. To understand how `precipitation`, `netto precipitation`, the `bucket` and irrigation interact, see [example behavior on the Wiki](https://github.com/jeroenterheerdt/HAsmartirrigation/wiki/Example-behavior-in-a-week).

## Operation modes
You can use this component in various modes:

1. **Full Open Weather Map**. In this mode all data comes from the Open Weather Map service. You will need to create and provide an API key. See [Getting Open Weater Map API Key](#getting-open-weather-map-api-key) below for instructions.

2. **Full Sensors**. Using sensors. In this mode all data comes from sensors such as a weather station. When specificying a sensor for precipitation, note that it needs to be a cumulative daily sensor. Open Weather Map is not used and you do not need an API key.

3. **Mixed**. A combination of 1) and 2). In this mode part of the data is supplied by sensors and part by Open Weather Map. In this mode you will need to create and provide an API key. See [Getting Open Weater Map API Key](#getting-open-weather-map-api-key) below for instructions. When specificying a sensor for precipitation, note that it needs to be a cumulative daily sensor.

When planning to set up mode 2) Full Sensors, or 3) Mixed see [Measurements and Units](https://github.com/jeroenterheerdt/HAsmartirrigation/wiki/Measurements-and-Units) for more information on the measurements and units expected by this component.

## Getting the best results
In order to get the most accurate results using sensors is preferable either from your own weather station or from another, from example through [Weatherflow Smart Weather](https://github.com/briis/smartweather). If you have a weather station that provides evapotranspiration (ET) values, use that. If you do not have that, use sensors including solar radiation (mode 3). If you do not have access to a sensor that provides solar radiation, let this component estimate it but use sensors for the other inputs (modified mode 3). If you do have access to limited amount of sensors (say only temperature) use that and use Open Weather Map for the rest (mode 2). If you do not have access to any sensors at all use Open Weather Map (mode 1).

Since this component provides multiple configuration options it might get confusing about in which scenario what behavior can be expected and what input is required. In the table below we summarize the configuration modes, their accuracy, the required input and how daily run time is calculated. Keep in mind that run time is based on the netto precipitation (precipitation - evapotranspiration) and the bucket value for previous days.1
|Mode|Accuracy|Input|How adjusted run time is calculated|

|Mode|Accuracy|Input|How adjusted run time is calculated|
|---|---|---|---|
|Mode 1 - Full Open Weather Map|Low|No sensor input required, just an API key for Open Weather Map|Average of precipitation and evapotranspiration.|
|Mode 2 - Full Sensor, but calculating evapotranspiration|High|Sensors are required for all inputs. All inputs are expected to be point-in-time, *except precipitation*. That sensor is normally provided by a weather station or weather service as a daily accumulative / 'total precipitation today' sensor and that is what is expected by the component|Most recent value for precipitation and average of evapotranspiration.
|Mode 3 - Mixed|Medium|API key is required for any inputs that have not been provided sensors. All inputs are expected to be point-in-time, *except precipitation*. That sensor is normally provided by a weather station or weather service as a 'total precipitation today' sensor and that is what is expected by the component|If a sensor is provided for precipitation, most recent value for precipitation is used. Otherwise the average of both precipitation and evapotranspiration.|
|Mode 4 -Not calculating|Very high|In this mode, just two sensors are required: one for precipitation and one for evapotranspiration. Both are expected to be daily accumulative sensors ('total today'), as is normally the case when provided by a weather service or weather station.|Most recent value of both precipitation and evapotranspiration.|


## Configuration

In this section:
- [Installation](#step-1-installing-of-component)
- [Configuration](#step-2-configuration-of-component)
- [Services, Events, Entities and Attributes](#step-3-checking-services,-events-and-entities)
- [Example automation](#step-4-creating-automation)

### Step 1: installing of component
Install the custom component (preferably using HACS) and then use the Configuration --> Integrations pane to search for 'Smart Irrigation'. In your sidebar you will find a new entry for panel 'Smart Irrigation'
- API Key for Open Weather Map (optional). Only required in mode 1) and 3). See [Getting Open Weater Map API Key](#getting-open-weather-map-api-key) below for instructions.


### Step 2: configuration of component
You will need to specify the following:

#### GENERAL
This page provides global settings.
- Automatic duration calculation: If enabled set the time of calculation (HH:MM).
- Automatic weather data update: If enabled specify how often sensor update should happen (minutes, hours, days). Warning: weatherdata update time on or after calculation time! 

#### ZONES
Specify one or more irrigation zones here. The component calculates irrigation duration per zone, depending on size, throughput, state, module and mapping. A zone can be _disabled_ (so it doesn't do anything), _automatic_ or _manual_. If in automatic, duration is automatically calculated. If in manual, you specify the duration yourself. If disabled, the zone is not included in any calculations.

> **When entering any values in the configuration of this component, keep in mind that the component will expect inches, sq ft, gallons, gallons per minute, or mm, m<sup>2</sup>, liters, liters per minute respectively depending on the settings in Home Assistant (imperial vs metric system).

- Name: The name of your zone, e.g. garden
- Size: The size of this zone (m<sup>2</sup> or sq ft)
- Throughput: The flow of this zone (liter/minute or ???/minute)
- Bucket: You can manipulate this calculated value.
- Lead Time: In seconds. Time needed to warm up your irrigation system, e.g. time to establish a connection or start a pump etc.

You can Update all zones and Callculate all.

**Per zone settings**
You can change any value mentioned before. Additionaly there are some more options.

- State: Wether Updating and Calculation of that zone should be enabled in mode 'Automatic' or 'Manual' or 'Disabled'
- Module: Choose the calculation module (see below) shall be used for that zone to calculate irrigation duration
- Mapping: Which sensor mapping (see below) shall be used for that zone
- Bucket: Either calculated or manualy set. Bucket >=0 no irrigation is necesarry, bucket <0 irrigation is necesarry.
- Multiplier: Multiplies the duration of irrigation
- Duration: Either calculated or manualy set

Below each zone there are some buttons to update, calculate or delete that zone.

#### MODULES
Add one or more modules that calculate irrigation duration. Each module comes with its own configuration and can be used to calculate duration for one or more zones. Modules can't be deleted if they are used by one or more zones.

- 0:PyETO: Calculate duration based on the FAO56 calculation from the PyETO library. 
  - Coastal: If the location you are tracking is situated on or adjacent to coast of a large land mass or anywhere else where air masses are influenced by a nearby water body, enable this setting.
  - Solrad behaviour: Should solar radiation estimated from temperature or sun hours or disabled 
  - Forecast days: How many forecast days taken into account
- 1:Static: 'Dummy' module with a static configurable duration.
  - Delta: ???

#### MAPPINGS
For sensor configuration take care to make sure the unit the component expects is the same as your sensor provides.**

- Names of sensors that supply required measurements (optional). Only required in mode 2) and 3). See [Measurements and Units](https://github.com/jeroenterheerdt/HAsmartirrigation/wiki/Measurements-and-Units) for more information on the measurements and units expected by this component.
 
**Multi-zone support**: For irrigation systems that have multiple zones which you want to run in series (one after the other), you need to add a zone *for each zone*. Of course, the configuration should be done for each zone, including the area the zone covers and the corresponding settings.

 > **If you want to go back and change your settings afterwards, you can either update the zon or delete the zone and re-create it.**

#### HELP
Links to wiki, forum and issues.

### Step 3: checking services, events and entities
After successful configuration, go to Settings -> Devices & Services and add the integration 'Smart Irrigation'
You should end up with one device and one entity for each zone and their attributes, listed below as well as [seven services](#available-services).

#### Services
For each instance of the component the following services will be available:

| Service | Description|
| --- | --- |
|`Smart Irrigation: calculate_all_zones`|Triggers the calculation of all zones. Use only if you disabled automatic refresh in the options.|
|`Smart Irrigation: calculate_zone`|Triggers the calculation of one specific zone.|
|`Smart Irrigation: reset_all_buckets`|Resets all buckets.|
|`Smart Irrigation: reset_bucket`|Resets one specific bucket.|
|`Smart Irrigation: set_all_buckets`|Sets all buckets to a specific `value`.|
|`Smart Irrigation: set_bucket`|Sets a specific bucket to to a specific `value`.|
|`Smart Irrigation: update_all_zones`|Updates all zones with weather data|

#### Events
The component uses a number of events internally that you do not need to pay attention to unless you need to debug things. The exception is the `_start` event.

| Event | Description|
| --- | --- |
|`[instance]_start`|Fires depending on `sensor.[zone_name]` value and sunrise. You can listen to this event to optimize the moment you irrigate so your irrigation starts just before sunrise and is completed at sunrise. See below for examples on how to use this.|
|`[instance]_bucketUpd`|Fired when the bucket is calculated. Happens at automatic refresh time or as a result of the `reset_bucket`, `set_bucket` or `calculate_daily_adjusted_run_time` service.|
|`[instance]_forceModeTog`|Fired when the force mode is disabled or enabled. Result of calling `enable_force_mode` or `disable_force_mode`|
|`[instance]_hourlyUpd`|Fired when the hourly adjusted run time is calculated. Happens approximately every hour and when `calculate_hourly_adjusted_run_time` service is called.|

#### Entities
#### `sensor.[zone_name]`
The number of seconds the irrigation system needs to run assuming maximum evapotranspiration and no rain / snow. This value and the attributes are static for your configuration.
Attributes:

| Attribute | Description |
| --- | --- |
|`id`|internal identification|
|`size`|the total area the irrigation system reaches in m<sup>2</sup> or sq ft.|
|`throughput`|total amount of water that flows through the irrigation system in liters or gallon per minute.|
|`state`|disabled, manual, automatic |
|`unit_of_measurement`|seconds|
|`device_class`|duration|
|`icon`|default: mdi:sprinkler|
|`friendly_name`|Name of your zone.|

Sample screenshot:

![](images/bsi_entity.png?raw=true)

The [How this works Wiki page](https://github.com/jeroenterheerdt/HAsmartirrigation/wiki/How-this-component-works) describes the entities, the attributes and the calculations.

#### Showing other attributes as entities (sensors)
[See the Wiki for more information on how to expose other values this components calculates as sensors](https://github.com/jeroenterheerdt/HAsmartirrigation/wiki/Showing-other-sensors).


### Step 4: creating automation
Since this component does not interface with your irrigation system directly, you will need to use the data it outputs to create an automation that will start and stop your irrigation system for you. This way you can use this custom component with any irrigation system you might have, regardless of how that interfaces with Home Assistant. In order for this to work correctly, you should base your automation on the value of `sensor.[zone_name]` as long as you run your automation after it was updated (11:00 PM / 23:00 hours local time). If that value is above 0 it is time to irrigate. Note that the value is the run time in seconds. Also, after irrigation, you need to call the `smart_irrigation.reset_bucket` service to reset the net irrigation tracking to 0.

> **The last step in any automation is very important, since you will need to let the component know you have finished irrigating and the evaporation counter can be reset by calling the `smart_irrigation.reset_bucket` service**

#### Example automation 1: one valve, potentially daily irrigation
Here is an example automation that runs when the `smart_irrigation_start` event is fired. It checks if `sensor.smart_irrigation_daily_adjusted_run_time` is above 0 and if it is it turns on `switch.irrigation_tap1`, waits the number of seconds as indicated by `sensor.smart_irrigation_daily_adjusted_run_time` and then turns off `switch.irrigation_tap1`. Finally, it resets the bucket by calling the `smart_irrigation.reset_bucket` service. If you have multiple instances you will need to adjust the event, entities and service names accordingly.

```
- alias: Smart Irrigation
  description: 'Start Smart Irrigation at 06:00 and run it only if the `sensor.[zone_name]` is >0 and run it for precisely that many seconds'
  trigger:
  - at: 06:00
    platform: time
  condition:
  - above: '0'
    condition: numeric_state
    entity_id: sensor.smart_irrigation_daily_adjusted_run_time
  action:
  - service: switch.turn_on
    data: {}
    entity_id: switch.irrigation_tap1
  - delay:
      seconds: '{{states("sensor.[zone_name]")}}'
  - service: switch.turn_off
    data: {}
    entity_id: switch.irrigation_tap1
  - service: smart_irrigation.reset_bucket
    data: {}
    entity_id: sensor.[zone_name]
```

[See more advanced examples in the Wiki](https://github.com/jeroenterheerdt/HAsmartirrigation/wiki/Automation-examples).

## Example behavior in a week
This [Wiki page](https://github.com/jeroenterheerdt/HAsmartirrigation/wiki/Example-behavior-in-a-week) provides insight into how this component should behave in certain weather conditions. With this you should be able to do a sanity check against your configuration and make sure everything is working correctly.

## Available services
The component provides the following services:

| Service | Description |
| --- | --- |
|`smart_irrigation.reset_bucket`|this service needs to be called after any irrigation so the bucket is reset to 0.|
|`smart_irrigation.set_bucket`|call this service to set the bucket to the `value` you provide. This service should only be used for debugging purposes.|
|`smart_irrigation.calculate_daily_adjusted_run_time`|calling this service results in the `smart_irrigation.daily_adjusted_run_time` entity and attributes to be updated right away.|
|`smart_irrigation.calculate_hourly_adjusted_run_time`|calling this service results in the `smart_irrigation.hourly_adjusted_run_time` entity and attributes to be updated right away.|
|`smart_irrigation.enable_force_mode`|Enables force mode. In this mode, `smart_irrigation.daily_adjusted_run_time` will also be set to the configured force mode duration.|
|`smart_irrigation.disable_force_mode`|Disables force mode. Normal operation resumes.|

## How this works
[See the Wiki](https://github.com/jeroenterheerdt/HAsmartirrigation/wiki/How-this-component-works).

## Getting Open Weather Map API key
Go to https://openweathermap.org and create an account. You can enter any company and purpose while creating an account. After creating your account, go to API Keys and get your key. If the key does not work right away, no worries. The email you should have received from OpenWeaterMap says it will be activated 'within the next couple of hours'. So if it does not work right away, be patient a bit. You will need to sign up for the paid (but free for limited API calls) OneCall API 3.0 plan if you do not have a key already. You can use a key for the 3.0 and 2.5 version of the API.
