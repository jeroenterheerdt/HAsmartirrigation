[![hacs_badge](https://img.shields.io/badge/HACS-Default-orange.svg)](https://github.com/hacs/integration)

[![Support the author on Patreon][patreon-shield]][patreon]

[![Buy me a coffee][buymeacoffee-shield]][buymeacoffee]

[patreon-shield]: https://frenck.dev/wp-content/uploads/2019/12/patreon.png
[patreon]: https://www.patreon.com/dutchdatadude

[buymeacoffee]: https://www.buymeacoffee.com/dutchdatadude
[buymeacoffee-shield]: https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png

# Smart Irrigation

![](logo.png?raw=true)

```diff
- WARNING: upgrading from V1 (V0.0.X) to V2 (V2023.X.X)? Read the instructions below!
```

| :warning: WARNING Are you upgrading from v0.0.X (aka V1) to V2023.X.X (aka V2)? |
|:---------------------------|
| Stop what you're doing and [capture your V1 configuration](https://github.com/jeroenterheerdt/HAsmartirrigation/wiki/Migrating-from-version-1-(v0.0.X)-to-version-2-(202X.X.X)) _before_ installing V2. V2 is a complete overhaul of this integration and there is no upgrade path. This means that effectively you will have to start over. See the [Wiki](https://github.com/jeroenterheerdt/HAsmartirrigation/wiki/Migrating-from-version-1-(v0.0.X)-to-version-2-(202X.X.X)) for instructions. We will not be able to recover your V1 configuration if you don't capture it before installing V2. |

This integration calculates the time to run your irrigation system to compensate for moisture loss by [evapotranspiration](https://en.wikipedia.org/wiki/Evapotranspiration). Using this integration you water your garden, lawn or crops precisely enough to compensate what has evaporated. It takes into account precipitation (rain, snow) and moisture loss caused by evapotranspiration and adjusts accordingly.
If it rains or snows less than the amount of moisture lost, then irrigation is required. Otherwise, no irrigation is required.
The integration can take into account weather forecasts for the coming days and also keeps track of the total moisture lost or added ('bucket')
Multiple zones are supported with each zone having it own configuration and set up.

By default, the integration keeps track of weather data during the day by collecting it hourly. Then, at 23:00 (11:00 PM) the required zone irrigation runtime is calculated based on the collected weather data. All of this is configurable for maximum flexibility.

Each zone may have it's own mapping to calculation modules and sensor groups. You can define as many modules or sensor groups as you need or want.

The integration uses the [PyETo module to calculate the evapotranspiration value (fao56)](https://pyeto.readthedocs.io/en/latest/fao56_penman_monteith.html). Also, please see the [How this works](https://github.com/jeroenterheerdt/HAsmartirrigation/wiki/How-this-component-works) Wiki page. Other modules are available and can be extended by the community.

Calculating durations is all the integration does, and this is on purpose to provide maximum flexibility. It does not control any valves. Users are expected to use the value of `sensor.smart_irrigation_[zone_name]` to interact with their irrigation system and afterwards call the `smart_irrigation.reset_bucket` service. [See the example automation](https://github.com/jeroenterheerdt/HAsmartirrigation#operation-modes).

> **Note - use this integration at your own risk - we do not assume responsibility for any inconvience caused by using this integration. Always use common sense before deciding to irrigate using the calculations this integration provides. For example, irrigating during excessive rainfall might cause flooding. Again - we assume no responsibility for any inconvience caused.**

## Visual Representation of what this integration does

![](images/smart_irrigation_diagram.png?raw=true)

1. Snow and rain fall on the ground add moisture. This is tracked/predicted depending on the [operation mode](https://github.com/jeroenterheerdt/HAsmartirrigation#operation-modes) by the `rain` and `snow` attributes Together, this makes up the `precipitation`.

2. Sunshine, temperature, wind speed, place on earth and other factors influence the amount of moisture lost from the ground(`evapotranspiration`). This is tracked/predicted depending on the [operation mode](https://github.com/jeroenterheerdt/HAsmartirrigation#operation-modes).

3. The difference between `precipitation` and `evapotranspiration` is the `netto precipitation`: negative values mean more moisture is lost than gets added by rain/snow, while positive values mean more moisture is added by rain/snow than what evaporates.

4. Once a day (time is configurable) the `netto precipitation` is added/substracted from the `bucket,` which starts as empty. If the `bucket` is below zero, irrigation is required.

5. Irrigation should be run for `sensor.smart_irrigation_[zone_name]`, which is 0 if `bucket`  >=0. Afterwards, the `bucket` needs to be reset (using `reset_bucket`). It's up to the user of the integration to build the automation for this final step. See [Example automation](https://github.com/jeroenterheerdt/HAsmartirrigation#step-4-creating-automations)

There are many more options available, see below. To understand how `precipitation`, `netto precipitation`, the `bucket` and irrigation interact, see [example behavior on the Wiki](https://github.com/jeroenterheerdt/HAsmartirrigation/wiki/Example-behavior-in-a-week).

Also available: [tutorial videos on Youtube](https://youtube.com/playlist?list=PLUHIAUPJHMiakbda92--fgb6A0hFReAo7&si=82Xc6mHoLDwFBfCP).
Also some in [german](https://youtu.be/1AYLuIs7_Pw) by Tristan 

## Operation Modes

You can use this integration in various modes:

1. **Full Open Weather Map**. In this mode all data comes from the Open Weather Map service. You will need to create and provide an API key. See [Getting Open Weater Map API Key](https://github.com/jeroenterheerdt/HAsmartirrigation#getting-open-weather-map-api-key) below for instructions.

2. **Full Sensors**. Using sensors. In this mode all data comes from sensors such as a weather station. Open Weather Map is not used and you do not need an API key. You can't do forecasting either.

3. **Mixed**. A combination of mode 1 and mode 2. In this mode part of the data is supplied by sensors and part by Open Weather Map. In this mode you will need to create and provide an API key. See [Getting Open Weater Map API Key](https://github.com/jeroenterheerdt/HAsmartirrigation#getting-open-weather-map-api-key) below for instructions.

4. **Not Calculating**. Precipitation and evapotranspiration are not calculated but taken from a dedicated weather service or weather station.

## Getting the best Results

In order to get the most accurate results using sensors is preferable either from your own weather station or from another, from example through [Weatherflow Smart Weather](https://github.com/briis/hass-weatherflow). If you have a weather station that provides evapotranspiration (ET) values, use that.  If you do not have access to a sensor that provides solar radiation, let this integration estimate it but use sensors for the other inputs. If you do have access to limited amount of sensors (say only temperature) use that and use Open Weather Map for the rest (mode 2). If you do not have access to any sensors at all use Open Weather Map (mode 1).

Since this integration provides multiple configuration options it might get confusing about in which scenario what behavior can be expected and what input is required. In the table below we summarize the configuration modes, their accuracy, the required input and how daily run time is calculated. Keep in mind that run time is based on the netto precipitation (precipitation - evapotranspiration) and the bucket value for previous days.

|Mode|Accuracy|Input|
|---|---|---|
|Mode 1 - Full Open Weather Map|Low|No sensor input required, just an API key for Open Weather Map|
|Mode 2 - Full Sensor, but calculating evapotranspiration|High|Sensors are required for all inputs. All inputs are expected to be point-in-time, *except precipitation*. That sensor is normally provided by a weather station or weather service as a daily accumulative/'total precipitation today' sensor and that is what is expected by the integration|
|Mode 3 - Mixed|Medium|API key is required for any inputs that have not been provided sensors. All inputs are expected to be point-in-time, *except precipitation*. That sensor is normally provided by a weather station or weather service as a 'total precipitation today' sensor and that is what is expected by the integration|
|Mode 4 -Not calculating|Very high|In this mode, just two sensors are required: one for precipitation and one for evapotranspiration. Both are expected to be daily accumulative sensors ('total today'), as is normally the case when provided by a dedicated weather service or weather station.

## Configuration

In this section:

- [Installation](https://github.com/jeroenterheerdt/HAsmartirrigation#step-1-installation)
- [Configuration](https://github.com/jeroenterheerdt/HAsmartirrigation#step-2-configuration)
- [Services, Events, Entities and Attributes](https://github.com/jeroenterheerdt/HAsmartirrigation#step-3-checking-services-events-and-entities)
- [Creating automations](https://github.com/jeroenterheerdt/HAsmartirrigation#step-4-creating-automations)

### Step 1: Installation

Install the custom integration (preferably using HACS). After downloading it from HACS, add the integration by searcing 'Smart Irrigaiton' in your configuration. Follow the steps:

- API Key for Open Weather Map (optional). Only required in mode 1 and 3. See [Getting Open Weather Map API Key](https://github.com/jeroenterheerdt/HAsmartirrigation#getting-open-weather-map-api-key) below for instructions.

Although we recommend using Open Weather by providing an free API key, you _can_ skip it. Skipping it, however, disables any ability to forecast. If it is disabled you need to use another source, such as your own weather station, exclusively. If you turn it off, you will not be able to use forecasts. Provide an OWM API if you intent to use Open Weather Map for at least part of the weather data, including forecasting. If you enable it the API Key for Open Weather MAP can be changed also like the version you want to use (API 2.5 or 3.0).

### Step 2: Configuration

After the integration has been installed, you will find a new panel named 'Smart Irrigaiton' in your side bar. Use it to configure your set up. Multiple pages are provided:

#### GENERAL

This page provides global settings.

- Automatic duration calculation: If enabled, set the time of calculation (HH:MM). After automatic calculation has happened used weatherdata is deleted.
- Automatic weather data update: If enabled, specify how often sensor update should happen (minutes, hours, days). Warning: weatherdata update time must be on or after calculation time!
- Automatic  weather data pruning: If enabled configure time of pruning weather data. Use this to make sure that there is no left over weatherdata from previous days. Don't remove the weatherdata before you calculate and only use this option if you expect the automatic update to collect weatherdata after you calculated for the day. Ideally, you want to prune as late in the day as possible.

#### ZONES

Specify one or more irrigation zones here. The integration calculates irrigation duration per zone, depending on size, throughput, state, module and sensor group. A zone can be _disabled_ (so it doesn't do anything), _automatic_ or _manual_. If in automatic, duration is automatically calculated. If in manual, you specify the duration yourself. Duration isn't reset by the reset_bucket services. If disabled, the zone is not included in any calculation.

> When entering any values in the configuration of this integration, take notice of the labels provided so you enter values in the correct units.

**Multi-zone support**: For irrigation systems that have multiple zones which you want to run in series or independently, one zone must be created in each case. Of course, the configuration should be done for each zone, including the area the zone covers and the corresponding settings.

**Add Zone**
- Name: The name of your zone, e.g. garden
- Size: The size of this zone (m<sup>2</sup> or sq ft)
- Throughput: The flow of this zone (liter/minute or gallon/minute)

You can update and calculate all automatic zones.

**Actions on all Zones**
- Update all zones with weather data from sensors.
- Calculate irrigation duration for all zones. This will also delete weather data after calculation.

**Per Zone Settings**
You can change any value mentioned before. Additionally there are some more options.

- Name: change the name of a zone
- Size: change the size of a zone
- Throughput: change the throughput of a zone
- State:
  - 'Automatic': Automatic updating and calculation of that zone. Module and sensor group is mandatory.
  - 'Manual': Only manual updating and calculation of that zone. No module and sensor group is required.
  - 'Disabled': The zone is disabled. No updating and calculation of that zone. Module and sensor group is optional.
- Module: Choose the calculation module (see below) shall be used for that zone to calculate irrigation duration.
- Sensor group: Which sensor group (see below) shall be used for that zone.
- Bucket: Either calculated or manually set. Bucket >=0 no irrigation is necesarry, bucket <0 irrigation is necesarry.
- Lead Time: In seconds. Time needed to warm up your irrigation system, e.g. time to establish a connection or start a pump etc.
- Maximum duration: The maximum duration of the irrigation, to avoid flooding.
- Multiplier: Multiplies the duration of the irrigation or divides if you do 0.5 for example.
- Duration: Either calculated or manually set.

Below each zone there are some buttons to update with weather data, calculate irrigation duration or to delete that zone. Note that if you calculate irrigation duration using the buttons per zone, the weather data for that zone is deleted. After a calculation there is also a button to get some information how duration was calculated.

#### MODULES

Add one or more modules that calculate irrigation duration. Each module comes with its own configuration and can be used to calculate duration for one or more zones. The maximum days of the weather forecast can also be set. Modules can't be deleted if they are used by one or more zones.

- PyETO: Calculate duration based on the FAO56 calculation from the PyETO library.
  - If you set PyETO to not estimate, it will look for a solar radiation sensor in the sensor group and will use that value. If there is none, it will use OWMs value (assuming you have OWM configured).
If you let PyETO to estimate from temperature or sun hours, it will not ask OWM for a solar radiation value nor will it ask a sensor for a solar radiation value, even if you configured it in the sensor group.
  - Coastal: If the location you are tracking is situated on or adjacent to coast of a large land mass or anywhere else where air masses are influenced by a nearby water body, enable this setting.
  - Solrad behaviour: Should solar radiation estimated from temperature, sun hours, an average value of both or not be estimated.
  - Forecast days: How many forecast days taken into account
- Static: static configurable netto precipitation.
  - Delta: netto precipitation
- Passthrough: Passthrough module returns the value of an evapotranspiration sensor as delta. Passthrough takes your evapotranspiration sensor and returns its value. It bypasses all calculations, except aggregates.

#### Sensor groups

For sensor configuration take care to make sure the unit the integration expects is the same as your sensor provides. You can choose which aggregation to use like average, maximum, minimum etc.  If you use Open Weather Map, make sure your home zone coordinates are set correctly so the data is correct. This is especially true if you set the coordinates manually in the configuration.yaml.

If you are using your own barometric pressure sensor, enter either the absolute or relative barometric pressure. Absolute barometric pressure is the actual pressure measured at your location and relative barometric pressure is the pressure calculated at sea level. Make this clear in the selection box.

#### HELP

Read the [Wiki](https://github.com/jeroenterheerdt/HAsmartirrigation/wiki), the [Discussions](https://github.com/jeroenterheerdt/HAsmartirrigation/discussions) and the [Home Assistant community](https://community.home-assistant.io/t/smart-irrigation-save-water-by-precisely-watering-your-lawn-garden/).

If that does not help, open an [issue](https://github.com/jeroenterheerdt/HAsmartirrigation/issues).

### Step 3: Checking Services, Events and Entities

After successful configuration, go to Settings -> Devices & Services and add the integration 'Smart Irrigation'. You should end up with one device and one entity for each zone and their attributes, listed below as well as [eight services](https://github.com/jeroenterheerdt/HAsmartirrigation#services).

Once the integration is installed, the following entities, services and events will be available:

#### Entities

##### sensor.smart_irrigation_[zone_name]

Attributes:

| Attribute | Description |
| --- | --- |
|`id`|internal identification|
|`size`|the total area the irrigation system reaches in m<sup>2</sup> or sq ft.|
|`throughput`|total amount of water that flows through the irrigation system in liters or gallon per minute.|
|`state`|disabled, manual, automatic |
|`bucket`|the bucket size in mm or inch|
|`unit_of_measurement`|seconds|
|`device_class`|duration|
|`icon`|default: mdi:sprinkler|
|`friendly_name`|Name of your zone.|

Sample screenshot:

![](images/sensor.[zone_name].png?raw=true)

If you want to expose these attributes as separate sensors, you can add [template sensors](https://www.home-assistant.io/integrations/template/#state-based-template-binary-sensors-buttons-images-numbers-selects-and-sensors) using a template like the following example for `bucket`:
```{{state_attr('sensor.smart_irrigation_your_zone_sensor_name', 'bucket')}}```

#### Services

| Service | Description|
| --- | --- |
|`Smart Irrigation: calculate_zone`|Triggers the calculation of one specific zone. Note that used weather data is deleted afterwards.|
|`Smart Irrigation: calculate_all_zones`|Triggers the calculation of all automatic zones. Use only if you disabled automatic refresh in the options. Note that after calculation weather data is deleted.|
|`Smart Irrigation: update_zone`|Updates one specific zone with weather data|
|`Smart Irrigation: update_all_zones`|Updates all automatic zones with weather data|
|`Smart Irrigation: reset_bucket`|Resets one specific bucket.|
|`Smart Irrigation: reset_all_buckets`|Resets all buckets.|
|`Smart Irrigation: set_bucket`|Sets a specific bucket to to a specific `value`.|
|`Smart Irrigation: set_all_buckets`|Sets all buckets to a specific `value`.|

#### Start Event

| Event | Description|
| --- | --- |
|`smart_irrigation_start_irrigation_all_zones`|Fires on the total of the durations of all non-disabled zones and sunrise (event is scheduled at: sunrise - sum(duration for all non-disabled zones)). You can listen to this event to optimize the moment you irrigate so your irrigation starts just before sunrise and is completed at sunrise. See below for examples on how to use this.|

The [How this works Wiki page](https://github.com/jeroenterheerdt/HAsmartirrigation/wiki/How-this-component-works) describes the entities, the attributes and the calculations.

### Step 4: Creating Automations

Since this integration does not interface with your irrigation system directly, you will need to use the data it outputs to create an automation that will start and stop your irrigation system for you. This way you can use this custom integration with any irrigation system you might have, regardless of how that interfaces with Home Assistant. In order for this to work correctly, you should base your automation on the value of `sensor.smart_irrigation_[zone_name]` as long as you run your automation after it was updated (e.g. 11:00 PM/23:00 hours local time). If that value is above 0 it is time to irrigate. Note that the value is the run time in seconds. Also, after irrigation, you need to call the `smart_irrigation.reset_bucket` service to reset the net irrigation tracking to 0.

> **The last step in any automation is very important, since you will need to let the integration know you have finished irrigating and the evaporation counter can be reset by calling the `smart_irrigation.reset_bucket` service**

#### Example Automation 1: one valve, potentially daily irrigation

Here is an example automation that runs when the `smart_irrigation_start_irrigation_all_zones` event is fired. It checks if `sensor.smart_irrigation_[zone_name]` is above 0 and if it is it turns on `switch.irrigation_tap1`, waits the number of seconds as indicated by `sensor.smart_irrigation_[zone_name]` and then turns off `switch.irrigation_tap1`. Finally, it resets the bucket by calling the `smart_irrigation.reset_bucket` service. If you have multiple instances you will need to adjust the event, entities and service names accordingly.

```yaml
- alias: Smart Irrigation
  description: 'Start Smart Irrigation based on event and run it only if the `sensor.smart_irrigation_[zone_name]` is >0 and run it for precisely that many seconds'
trigger:
  - platform: event
    event_type: smart_irrigation_start_irrigation_all_zones
condition:
  - condition: numeric_state
    entity_id: sensor.smart_irrigation_[zone_name]
    above: 0
  action:
  - service: switch.turn_on
    data: {}
    entity_id: switch.irrigation_tap1
  - delay:
      seconds: '{{states("sensor.[zone_name"])}}'
  - service: switch.turn_off
    data: {}
    entity_id: switch.irrigation_tap1
  - service: smart_irrigation.reset_bucket
    data: {}
    entity_id: sensor.smart_irrigation_[zone_name]
```

[See more advanced examples in the Wiki](https://github.com/jeroenterheerdt/HAsmartirrigation/wiki/Automation-examples).

## Showing attributes as separate sensors

Not specific to this integration, but you can easily add template sensors for any attribute you'd like to see as separate sensor, such as the following example that creates a template sensor the `bucket` attribute of Zone 1:
```{{state_attr('sensor.smart_irrigation_zone_1','bucket')}}```

## Example Behavior in a Week

This [Wiki page](https://github.com/jeroenterheerdt/HAsmartirrigation/wiki/Example-behavior-in-a-week) provides insight into how this integration should behave in certain weather conditions. With this you should be able to do a sanity check against your configuration and make sure everything is working correctly.

## How this works

[See the Wiki](https://github.com/jeroenterheerdt/HAsmartirrigation/wiki/How-this-component-works).

## Getting Open Weather Map API Key

Go to [OpenWeatherMap](https://openweathermap.org) and create an account. You can enter any company and purpose while creating an account. After creating your account, You will need to sign up for the paid (but free for limited API calls) OneCall API 3.0 plan if you do not have a key already. Make sure to enter credit card information to get the API truly activated. Then, go to API Keys and get your key. If the key does not work right away, no worries. The email you should have received from OpenWeaterMap says it will be activated 'within the next couple of hours'. So if it does not work right away, be patient a bit. If you are worried about the cost of the API, You can put a rate limit below the paid threshold in the "Billing plans" page of your profile. If you are currently using API 2.5, move to 3.0 ASAP as API 2.5 is going to be closed in June 2024.
